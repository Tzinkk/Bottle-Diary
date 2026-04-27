import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  deleteField
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Bottle } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import BottleCard from './BottleCard';
import BottleForm from './BottleForm';
import { Plus, Search, Filter, Loader2, WineOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BottleList() {
  const { user } = useAuth();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    if (!user) {
      setBottles([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bottles'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bottleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Bottle[];
      setBottles(bottleData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'bottles');
    });

    return unsubscribe;
  }, [user]);

  const handleSave = async (data: Partial<Bottle>) => {
    if (!user) return;

    try {
      if (editingBottle?.id) {
        // Use deleteField() for removed properties when updating
        const updateData = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v === undefined ? deleteField() : v])
        );
        await updateDoc(doc(db, 'bottles', editingBottle.id), {
          ...updateData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Omit undefined properties entirely when creating
        const createData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v !== undefined)
        );
        await addDoc(collection(db, 'bottles'), {
          ...createData,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setShowForm(false);
      setEditingBottle(null);
    } catch (error) {
      handleFirestoreError(error, editingBottle?.id ? OperationType.UPDATE : OperationType.CREATE, 'bottles');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this bottle from your collection?')) return;
    try {
      await deleteDoc(doc(db, 'bottles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'bottles');
    }
  };

  const filteredBottles = bottles.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.winery.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || b.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-[#8B2635]/50 animate-spin" />
        <p className="text-[#7D7468] font-light">Curating your cellar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <button
          onClick={() => {
            setEditingBottle(null);
            setShowForm(true);
          }}
          className="w-14 h-14 bg-[#8B2635] text-white rounded-full flex items-center justify-center shadow-2xl shadow-[#8B2635]/40 border border-[#7A212E] active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7D7468]" />
          <input
            type="text"
            placeholder="Search wine name or winery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7D7468]" />
            <select
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
               className="w-full pl-10 pr-10 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg appearance-none focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all font-light shadow-sm"
             >
              <option>All</option>
              <option>Red</option>
              <option>White</option>
              <option>Natural Red</option>
              <option>Natural White</option>
              <option>Natural Orange</option>
              <option>Orange</option>
              <option>Rose</option>
              <option>Pet Nat</option>
              <option>Sparkling Wine</option>
              <option>Sato</option>
              <option>Sake</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7D7468]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingBottle(null);
              setShowForm(true);
            }}
            className="hidden sm:flex items-center justify-center gap-2 px-6 py-3 bg-[#8B2635] border border-[#7A212E] text-white rounded-lg hover:bg-[#6A1C27] transition-all active:scale-95 font-medium ml-auto shadow-sm"
            id="add-bottle-button"
          >
            <Plus className="w-5 h-5" />
            <span>Add Bottle</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredBottles.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredBottles.map(bottle => (
              <BottleCard
                key={bottle.id}
                bottle={bottle}
                onEdit={(b) => {
                  setEditingBottle(b);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-[#7D7468]"
          >
            <div className="w-24 h-24 rounded-full bg-white border border-[#EBE3D5] shadow-sm flex items-center justify-center mb-6">
              <WineOff className="w-10 h-10 text-[#A79F93]" />
            </div>
            <h3 className="text-2xl font-serif text-[#2F2A26] mb-3 tracking-wide">No wines found</h3>
            <p className="max-w-xs text-center font-light leading-relaxed text-[#7D7468]">
              {searchTerm || typeFilter !== 'All' 
                ? "Try adjusting your filters or search terms."
                : "Your cellar is empty. Start adding your favorite bottles!"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <BottleForm
            bottle={editingBottle}
            onClose={() => {
              setShowForm(false);
              setEditingBottle(null);
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
