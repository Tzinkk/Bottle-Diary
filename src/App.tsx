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
import { Wine, Info, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

function AppContent() {
  const { user, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'cellar' | 'pairings'>('cellar');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <Wine className="w-12 h-12 text-[#9A3B3B]/50" />
          <div className="h-0.5 w-24 bg-[#EBE3D5] rounded-full overflow-hidden">
            <motion.div
              animate={{ x: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="h-full w-12 bg-[#8B2635]"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col relative overflow-hidden">
        {/* Subtle Warm Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F4EFE6] via-[#FDFBF7] to-[#FDFBF7] pointer-events-none" />

        <Header />
        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl lg:text-7xl font-serif text-[#2F2A26] mb-6 leading-tight tracking-tight">
                Your Private <br />
                <span className="text-[#8B2635]/80 italic">Digital Cellar</span>
              </h1>
              <p className="text-xl text-[#5C554D] mb-10 leading-relaxed font-light">
                Securely manage your premium wine collection. Track vintages, tasting notes, and market values in a refined interface crafted for connoisseurs.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="p-2 border border-[#EBE3D5] bg-white rounded-lg shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-[#8B2635]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2F2A26]">Secure Vault</h3>
                    <p className="text-sm text-[#7D7468] font-light mt-1">Industry-standard encryption for your collection data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 border border-[#EBE3D5] bg-white rounded-lg shadow-sm">
                    <Info className="w-5 h-5 text-[#8B2635]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2F2A26]">Detailed Cataloging</h3>
                    <p className="text-sm text-[#7D7468] font-light mt-1">Record tasting notes, ratings, and region details.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={signIn}
                className="group flex items-center gap-3 px-8 py-4 bg-[#8B2635] border border-[#7A212E] text-white rounded-lg font-medium text-lg hover:bg-[#6A1C27] hover:border-[#5A1621] transition-all shadow-lg shadow-[#8B2635]/20 active:scale-95"
              >
                Enter the Cellar
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              {/* Abstract Glass Card representing the app */}
              <div className="aspect-[4/5] bg-white/60 backdrop-blur-2xl rounded-2xl border border-[#EBE3D5] rotate-2 overflow-hidden shadow-[0_20px_40px_-15px_rgba(47,42,38,0.1)] relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
                  <Wine className="w-96 h-96 text-[#8B2635]" />
                </div>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B2635]/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                
                {/* Simulated UI elements inside the "glass" card */}
                <div className="p-8 space-y-6">
                  <div className="flex gap-4 mb-12">
                    <div className="w-12 h-12 rounded-lg bg-white shadow-sm border border-[#EBE3D5]" />
                    <div className="space-y-3 flex-1 pt-1">
                      <div className="h-3 md:w-1/2 bg-[#EBE3D5] rounded-sm" />
                      <div className="h-2 w-1/3 bg-[#F4EFE6] rounded-sm" />
                    </div>
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-white/80 border border-[#EBE3D5] shadow-sm rounded-xl space-y-3">
                      <div className="h-3 w-1/3 bg-[#8B2635]/20 rounded-sm" />
                      <div className="h-2 w-1/4 bg-[#EBE3D5] rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#F4EFE6] blur-[80px] rounded-full pointer-events-none -z-10" />
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[#E8E0D1]/50 blur-[80px] rounded-full pointer-events-none -z-10" />
            </motion.div>
          </div>
        </main>
        <footer className="py-8 text-center text-[#7D7468] text-sm border-t border-[#EBE3D5] relative z-10 font-light">
           © {new Date().getFullYear()} Bottle Diary. For serious collectors.
        </footer>
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
