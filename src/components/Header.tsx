import { Wine, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function Header() {
  const { user, signIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-[#EBE3D5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-[#2F2A26]">{user.displayName}</span>
                <span className="text-xs text-[#7D7468]">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#7D7468] hover:text-[#8B2635] hover:bg-[#F4EFE6] rounded-sm transition-all border border-transparent hover:border-[#EBE3D5]"
                id="logout-button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-2 px-4 py-2 bg-[#2F2A26] text-[#FDFBF7] rounded-sm hover:bg-[#1A1715] transition-all text-sm font-medium shadow-sm"
              id="signin-button"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
