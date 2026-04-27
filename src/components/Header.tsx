import { Wine } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#EBE3D5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center sm:justify-start">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -15, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="p-1.5 bg-[#F4EFE6] border border-[#EBE3D5] rounded-sm shadow-sm"
          >
            <Wine className="w-5 h-5 text-[#8B2635]" />
          </motion.div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#2F2A26]">
            Bottle Diary
          </span>
        </div>
      </div>
    </header>
  );
}
