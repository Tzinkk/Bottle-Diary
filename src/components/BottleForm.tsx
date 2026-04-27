import React, { useState, useEffect, useRef } from 'react';
import { Bottle, WineType } from '../types';
import { X, Save, Star, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface BottleFormProps {
  bottle: Bottle | null;
  onClose: () => void;
  onSave: (data: Partial<Bottle>) => void;
}

const WINE_TYPES: WineType[] = ['Red', 'White', 'Natural Red', 'Natural White', 'Natural Orange', 'Orange', 'Rose', 'Pet Nat', 'Sparkling Wine', 'Sato', 'Sake'];

const COMMON_COUNTRIES = [
  'France', 'Italy', 'Spain', 'United States', 'Argentina', 
  'Australia', 'Chile', 'South Africa', 'New Zealand', 'Germany', 
  'Portugal', 'Thailand'
];

const COMMON_REGIONS = [
  'Bordeaux', 'Burgundy', 'Champagne', 'Tuscany', 'Piedmont', 
  'Rioja', 'Napa Valley', 'Sonoma', 'Mendoza', 'Barossa Valley',
  'Loire Valley', 'Rhône Valley', 'Sicily', 'Khao Yai'
];

export default function BottleForm({ bottle, onClose, onSave }: BottleFormProps) {
  const [formData, setFormData] = useState<Partial<Bottle>>({
    name: '',
    winery: '',
    type: 'Red',
    vintage: new Date().getFullYear(),
    region: '',
    country: '',
    rating: 0,
    price: 0,
    quantity: 1,
    grapes: '',
    note: '',
    tastingNotes: '',
    imageUrl: '',
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bottle) {
      setFormData(bottle);
    }
  }, [bottle]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Compress image before upload if it's large
      const compressedFile = await compressImage(file);
      
      setUploadProgress(30);

      const storageRef = ref(storage, `bottles/${Date.now()}_${file.name}`);
      
      // Use uploadBytes instead of uploadBytesResumable to avoid CORS progress event issues
      setUploadProgress(50);
      const snapshot = await uploadBytes(storageRef, compressedFile);
      setUploadProgress(90);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData((prev) => ({ ...prev, imageUrl: downloadURL }));
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const MAX_WIDTH = 1200;
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB target

      // If already small enough, skip compression
      if (file.size <= MAX_SIZE) {
        resolve(file);
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#2F2A26]/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#FDFBF7] border border-[#EBE3D5] rounded-xl shadow-2xl overflow-hidden"
        id="bottle-form-container"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#EBE3D5]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2F2A26] tracking-tight">
              {bottle ? 'Edit Bottle' : 'New Collection Entry'}
            </h2>
            <p className="text-[#7D7468] text-sm font-light mt-1">Fill in the details for your refined cellar.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F4EFE6] rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#7D7468]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Bottle Image</label>
              <div 
                className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#EBE3D5] rounded-xl bg-white hover:bg-[#F4EFE6]/50 transition-colors cursor-pointer relative overflow-hidden"
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                {formData.imageUrl ? (
                  <div className="relative w-full flex justify-center">
                    <img src={formData.imageUrl} alt="Bottle preview" className="h-48 object-contain rounded-md" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, imageUrl: '' })); }}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-[#8B2635] hover:bg-rose-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : isUploading ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="w-8 h-8 text-[#8B2635] animate-spin mb-3" />
                    <p className="text-sm font-medium text-[#2F2A26]">Uploading... {Math.round(uploadProgress)}%</p>
                    <div className="w-48 h-1.5 bg-[#EBE3D5] rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-[#8B2635] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6 text-[#7D7468]">
                    <div className="w-12 h-12 bg-[#F4EFE6] rounded-full flex items-center justify-center mb-3 text-[#8B2635]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-[#2F2A26] mb-1">Upload a photo</p>
                    <p className="text-sm font-light">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Wine Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Château Margaux"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Winery / Producer</label>
              <input
                required
                type="text"
                placeholder="e.g. Tenuta San Guido"
                value={formData.winery}
                onChange={(e) => setFormData({ ...formData, winery: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Vintage (Year or NV)</label>
              <input
                type="text"
                placeholder="e.g. 2019 or NV"
                value={formData.vintage || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || !isNaN(Number(val)) || val.toUpperCase() === 'NV') {
                    setFormData({ ...formData, vintage: val === '' ? undefined : (isNaN(Number(val)) ? val.toUpperCase() : parseInt(val)) });
                  } else {
                     setFormData({ ...formData, vintage: val });
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Grape Varieties</label>
              <input
                type="text"
                placeholder="e.g. Cabernet Sauvignon, Merlot"
                value={formData.grapes || ''}
                onChange={(e) => setFormData({ ...formData, grapes: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Wine Type</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WineType })}
                  className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all font-light appearance-none shadow-sm"
                >
                  {WINE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7D7468]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Region</label>
              <input
                type="text"
                list="regions-list"
                placeholder="e.g. Bordeaux"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
              <datalist id="regions-list">
                {COMMON_REGIONS.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Country</label>
              <input
                type="text"
                list="countries-list"
                placeholder="e.g. Italy"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
              <datalist id="countries-list">
                {COMMON_COUNTRIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Quantity</label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.quantity ?? 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, quantity: isNaN(val) ? 1 : val });
                }}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Tasting Notes</label>
              <textarea
                placeholder="Notes on appearance, nose, and palate..."
                value={formData.tastingNotes}
                onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light resize-none shadow-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2F2A26] mb-4">Rating</label>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="group transition-transform active:scale-95"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (formData.rating || 0) >= star
                          ? 'text-[#F59E0B] fill-[#F59E0B]'
                          : 'text-[#EBE3D5] group-hover:text-[#FCD34D]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Price (฿)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price ?? ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, price: isNaN(val) ? undefined : val });
                }}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light shadow-sm"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2F2A26] mb-2">Note (Optional)</label>
              <textarea
                placeholder="Where did you get it? Special occasions? etc."
                value={formData.note || ''}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-[#EBE3D5] text-[#2F2A26] rounded-lg focus:ring-2 focus:ring-[#8B2635]/20 focus:border-[#8B2635] outline-none transition-all placeholder:text-[#A79F93] font-light resize-none shadow-sm"
              />
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-[#EBE3D5] text-[#7D7468] font-medium rounded-lg hover:bg-[#F4EFE6] hover:text-[#2F2A26] transition-all bg-white shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 border font-medium rounded-lg transition-all shadow-sm ${
                isUploading 
                  ? 'bg-[#8B2635]/70 border-[#7A212E]/70 text-white cursor-not-allowed' 
                  : 'bg-[#8B2635] border-[#7A212E] text-white hover:bg-[#6A1C27] active:scale-95'
              }`}
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : (bottle ? 'Update Bottle' : 'Save to Cellar')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
