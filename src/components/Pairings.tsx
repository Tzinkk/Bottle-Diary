import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Bottle, MenuItem } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { ChefHat, Loader2, Sparkles, AlertCircle, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BottleCard from './BottleCard';

import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function Pairings() {
  const { user } = useAuth();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<Set<string>>(new Set());
  
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodDesc, setNewFoodDesc] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [pairings, setPairings] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Listen to bottles
    const qBottles = query(
      collection(db, 'bottles'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubBottles = onSnapshot(qBottles, (snapshot) => {
      setBottles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bottle[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bottles');
    });

    // Listen to menu items
    const qMenu = query(
      collection(db, 'menuItems'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubMenu = onSnapshot(qMenu, (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menuItems');
    });

    return () => {
      unsubBottles();
      unsubMenu();
    };
  }, [user]);

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim() || !user) return;
    try {
      setError(null);
      await addDoc(collection(db, 'menuItems'), {
        name: newFoodName.trim(),
        description: newFoodDesc.trim(),
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setNewFoodName('');
      setNewFoodDesc('');
      setIsAddingFood(false);
    } catch (err: any) {
      setError(err.message || "Failed to add menu item.");
      handleFirestoreError(err, OperationType.CREATE, 'menuItems');
    }
  };

  const handleDeleteFood = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'menuItems', id));
      setSelectedMenuIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: any) {
      setError(err.message || "Failed to delete item.");
      handleFirestoreError(err, OperationType.DELETE, 'menuItems');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedMenuIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generatePairings = async () => {
    if (selectedMenuIds.size === 0) {
      setError("Please select at least one dish from your menu.");
      return;
    }
    if (bottles.length === 0) {
      setError("You don't have any wines in your cellar to pair with!");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const cellarList = bottles.map(b => 
        `[ID: ${b.id}] ${b.name} (${b.vintage || 'NV'}), ${b.type || 'Unknown Type'}, ${b.region || ''} ${b.country || ''}${b.grapes ? `, Grapes: ${b.grapes}` : ''}`
      ).join('\n');

      const selectedDishes = menuItems.filter(m => selectedMenuIds.has(m.id!));
      const menuText = selectedDishes.map(m => `- ${m.name}${m.description ? `: ${m.description}` : ''}`).join('\n');

      const prompt = `You are a world-class Sommelier. 
I have the following selected dishes from my restaurant menu:
${menuText}

And I have the following wines in my private cellar:
${cellarList}

Please analyze the menu items and my cellar, and create 1 brilliant food pairing per selected dish. 
For each pairing, identify the dish Name, pick the absolute best wine from my cellar list (by ID), and provide a short, poetic, but professional explanation of why they pair so perfectly based on the ingredients & tasting notes.

Return JSON strictly adhering to the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dishName: {
                  type: Type.STRING,
                  description: "The name of the dish from the menu.",
                },
                bottleId: {
                  type: Type.STRING,
                  description: "The exact ID of the wine bottle chosen from the cellar.",
                },
                explanation: {
                  type: Type.STRING,
                  description: "Why this wine pairs perfectly with this dish (2-3 sentences).",
                },
              },
              required: ["dishName", "bottleId", "explanation"],
            },
          },
        },
      });

      const jsonStr = response.text?.trim() || "[]";
      const parsed = JSON.parse(jsonStr);
      setPairings(parsed);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate pairings.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-12 pb-24">
      <div className="mb-12">
        <h2 className="text-4xl font-serif text-[#2F2A26] mb-4">Fun Food Pairing</h2>
        <p className="text-xl text-[#7D7468] font-light">
          Manage your saved dishes and quickly generate pairings for them. Just select the items and let the AI find the perfect wine from your cellar.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#EBE3D5] p-8 mb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F4EFE6] rounded-xl text-[#8B2635]">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-[#2F2A26]">Your Menu</h3>
          </div>
          
          <button 
            onClick={() => setIsAddingFood(!isAddingFood)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F4EFE6] text-[#8B2635] text-sm font-medium rounded-lg hover:bg-[#8B2635] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Dish
          </button>
        </div>
        
        {/* Add Food Form */}
        <AnimatePresence>
          {isAddingFood && (
            <motion.form 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
              onSubmit={handleAddFood}
            >
              <div className="p-5 bg-[#FDFBF7] border border-[#EBE3D5] rounded-xl space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2F2A26] mb-1">Dish Name</label>
                  <input 
                    type="text"
                    value={newFoodName}
                    onChange={(e) => setNewFoodName(e.target.value)}
                    placeholder="e.g. Pan-seared Scallops"
                    className="w-full px-4 py-2 bg-white border border-[#EBE3D5] rounded-md focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2F2A26] mb-1">Ingredients & Tasting Notes (Optional)</label>
                  <textarea 
                    value={newFoodDesc}
                    onChange={(e) => setNewFoodDesc(e.target.value)}
                    placeholder="e.g. Served with truffle risotto, buttery, earthy and rich."
                    className="w-full px-4 py-2 bg-white border border-[#EBE3D5] rounded-md focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all resize-none h-20"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingFood(false)}
                    className="px-4 py-2 text-sm font-medium text-[#7D7468] hover:text-[#2F2A26]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!newFoodName.trim()}
                    className="px-4 py-2 bg-[#2F2A26] text-white text-sm font-medium rounded-md hover:bg-black disabled:opacity-50 transition-colors"
                  >
                    Save Dish
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Menu Items List */}
        {menuItems.length === 0 && !isAddingFood ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-[#EBE3D5] rounded-xl">
            <ChefHat className="w-12 h-12 text-[#D4CDBC] mx-auto mb-4" />
            <h4 className="text-lg font-medium text-[#2F2A26]">Your menu is empty</h4>
            <p className="text-[#7D7468] font-light mt-1 mb-4">Add your signature dishes and ingredients to start pairing.</p>
            <button 
              onClick={() => setIsAddingFood(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#F4EFE6] text-[#8B2635] font-medium rounded-lg hover:bg-[#EBE3D5] hover:text-[#5C1621] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Dish
            </button>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map(item => {
              const isSelected = selectedMenuIds.has(item.id!);
              return (
                <div 
                  key={item.id} 
                  onClick={() => toggleSelection(item.id!)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-[#F4EFE6] border-[#8B2635]/30' 
                      : 'bg-white border-[#EBE3D5] hover:border-[#D4CDBC]'
                  }`}
                >
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#8B2635]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#D4CDBC]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h5 className={`font-medium truncate ${isSelected ? 'text-[#8B2635]' : 'text-[#2F2A26]'}`}>
                      {item.name}
                    </h5>
                    {item.description && (
                      <p className="text-sm text-[#7D7468] mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteFood(item.id!, e)}
                    className="absolute top-4 right-4 p-1.5 text-[#A79F93] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={generatePairings}
          disabled={isGenerating || selectedMenuIds.size === 0 || bottles.length === 0}
          className="flex items-center justify-center gap-2 w-full py-4 bg-[#2F2A26] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Finding Perfect Pairings...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Pairings ({selectedMenuIds.size} selected)
            </>
          )}
        </button>
      </div>

      {pairings && pairings.length > 0 && (
        <div className="space-y-8">
          <h3 className="text-2xl font-serif text-[#2F2A26] mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#8B2635]" />
            Recommended Pairings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pairings.map((pairing, index) => {
              const bottle = bottles.find(b => b.id === pairing.bottleId);
              if (!bottle) return null;
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col bg-white rounded-2xl border border-[#EBE3D5] overflow-hidden shadow-sm"
                >
                  <div className="p-6 bg-[#FDFBF7] border-b border-[#EBE3D5]">
                    <h4 className="font-serif text-xl text-[#8B2635] mb-2">{pairing.dishName}</h4>
                    <p className="text-[#5C554D] text-sm leading-relaxed">{pairing.explanation}</p>
                  </div>
                  <div className="p-4 flex-1">
                    <BottleCard bottle={bottle} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
