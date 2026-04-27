/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import BottleList from './components/BottleList';
import Pairings from './components/Pairings';
import { Wine } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { AlertCircle, RefreshCw } from 'lucide-react';

function AppContent() {
  const { user, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<'cellar' | 'pairings'>('cellar');

  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <Wine className="w-16 h-16 text-[#8B2635]/20" />
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
               className="absolute inset-0 flex items-center justify-center"
            >
               <div className="w-20 h-20 border-t-2 border-b-2 border-[#8B2635] rounded-full opacity-20" />
            </motion.div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[#8B2635] font-serif italic text-lg animate-pulse">Entering the Cellar...</p>
            <div className="h-0.5 w-32 bg-[#EBE3D5] rounded-full overflow-hidden">
              <motion.div
                animate={{ x: [-128, 128] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="h-full w-16 bg-[#8B2635]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-100 shadow-xl shadow-red-900/5 text-center"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif text-[#2F2A26] mb-4">Cellar Access Error</h2>
          <div className="text-[#7D7468] space-y-4 mb-8 font-light">
            <p>We couldn't open your digital cellar. This usually happens if anonymous browsing is restricted.</p>
            <div className="p-4 bg-red-50/50 rounded-lg text-xs font-mono text-red-600 break-words">
              {error.message}
            </div>
            <p className="text-sm">Please ensure you're not in Private/Incognito mode or check your internet connection.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#8B2635] text-white rounded-xl font-medium hover:bg-[#6A1C27] transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F4EFE6] via-[#FDFBF7] to-[#FDFBF7] pointer-events-none" />
      <Header />
      
      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 w-full bg-white/60 backdrop-blur-md border-b border-[#EBE3D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('cellar')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cellar'
                  ? 'border-[#8B2635] text-[#8B2635]'
                  : 'border-transparent text-[#7D7468] hover:text-[#2F2A26] hover:border-[#EBE3D5]'
              }`}
            >
              My Cellar
            </button>
            <button
              onClick={() => setActiveTab('pairings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pairings'
                  ? 'border-[#8B2635] text-[#8B2635]'
                  : 'border-transparent text-[#7D7468] hover:text-[#2F2A26] hover:border-[#EBE3D5]'
              }`}
            >
              Fun Food Pairing
            </button>
          </nav>
        </div>
      </div>

      <main className="pb-20 relative z-10">
        {activeTab === 'cellar' ? <BottleList /> : <Pairings />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
