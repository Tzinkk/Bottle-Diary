import React from 'react';
import { Star, MapPin, Calendar, Trash2, Edit2, Wine, Grape } from 'lucide-react';
import { Bottle } from '../types';
import { motion } from 'motion/react';

interface BottleCardProps {
  bottle: Bottle;
  onEdit: (bottle: Bottle) => void;
  onDelete: (id: string) => void | Promise<void>;
}

const typeStyles: Record<string, string> = {
  Red: 'bg-[#8B2635]/10 text-[#8B2635] border-[#8B2635]/20',
  White: 'bg-[#E8E0D1] text-[#7D7468] border-[#EBE3D5]',
  'Natural Red': 'bg-rose-900/10 text-rose-900 border-rose-900/20',
  'Natural White': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Natural Orange': 'bg-orange-200/50 text-orange-900 border-orange-300',
  Orange: 'bg-orange-100 text-orange-800 border-orange-200',
  Rose: 'bg-rose-100 text-rose-800 border-rose-200',
  'Pet Nat': 'bg-lime-100 text-lime-800 border-lime-200',
  'Sparkling Wine': 'bg-amber-100 text-amber-800 border-amber-200',
  Sato: 'bg-stone-200 text-stone-800 border-stone-300',
  Sake: 'bg-slate-100 text-slate-800 border-slate-200',
};

const BottleCard: React.FC<BottleCardProps> = ({ bottle, onEdit, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white border border-[#EBE3D5] hover:border-[#D4CDBC] rounded-xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(47,42,38,0.1)] transition-all duration-300"
      id={`bottle-${bottle.id}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#FDFBF7]/50 pointer-events-none" />

      {bottle.imageUrl && (
        <div className="w-full h-48 bg-[#F4EFE6] overflow-hidden border-b border-[#EBE3D5]">
          <img 
            src={bottle.imageUrl} 
            alt={bottle.name} 
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply py-2 group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
      )}

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${typeStyles[bottle.type || 'Fortified'] || typeStyles.Fortified} mb-3 mr-2`}>
              {bottle.type || 'Wine'}
            </div>
            <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-[#EBE3D5] text-[#5C554D] bg-[#FDFBF7] mb-3">
              Qty: {bottle.quantity ?? 1}
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2F2A26] group-hover:text-[#8B2635] transition-colors tracking-tight">
              {bottle.name}
            </h3>
            <p className="text-[#7D7468] font-light mt-1">{bottle.winery}</p>
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(bottle)}
              className="p-2 text-[#7D7468] hover:text-[#2F2A26] hover:bg-[#F4EFE6] rounded-lg transition-colors"
              title="Edit Bottle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => bottle.id && onDelete(bottle.id)}
              className="p-2 text-[#7D7468] hover:text-[#8B2635] hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Bottle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6 pt-4 border-t border-[#F4EFE6]">
          <div className="flex items-center gap-2 text-sm text-[#5C554D]">
            <Calendar className="w-4 h-4 text-[#D4CDBC] shrink-0" />
            <span className="font-light">{bottle.vintage || 'NV'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5C554D]">
            <MapPin className="w-4 h-4 text-[#D4CDBC] shrink-0" />
            <span className="truncate font-light">{bottle.region || 'Unknown Region'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5C554D]">
            <Wine className="w-4 h-4 text-[#D4CDBC] shrink-0" />
            <span className="truncate font-light">{bottle.country || 'Unknown Country'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5C554D]">
            <Grape className="w-4 h-4 text-[#D4CDBC] shrink-0" />
            <span className="truncate font-light">{bottle.grapes || 'Unknown Grapes'}</span>
          </div>
          
          <div className="flex items-center gap-1 col-span-1">
            {bottle.rating ? (
              [...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < bottle.rating! ? 'text-[#D4CDBC] fill-[#D4CDBC]' : 'text-[#F4EFE6]'}`}
                />
              ))
            ) : (
                <span className="text-xs text-[#A79F93] font-light italic">No rating</span>
            )}
          </div>

          {bottle.price && (
            <div className="text-sm font-medium text-[#2F2A26] text-right">
              ฿{bottle.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>

        {bottle.tastingNotes && (
          <div className="mb-4 relative">
            <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-[#EBE3D5] rounded-full" />
            <p className="text-sm text-[#7D7468] italic line-clamp-2 font-serif tracking-wide leading-relaxed">
              "{bottle.tastingNotes}"
            </p>
          </div>
        )}

        {bottle.note && (
          <div className="p-3 bg-[#F4EFE6]/50 rounded-lg border border-[#EBE3D5]/50">
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#A79F93] mb-1">Cellar Note</p>
            <p className="text-xs text-[#5C554D] leading-relaxed line-clamp-2">
              {bottle.note}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BottleCard;
