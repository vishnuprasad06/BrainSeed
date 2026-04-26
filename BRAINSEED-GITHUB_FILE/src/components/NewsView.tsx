import React from 'react';
import BoardNews from './BoardNews';
import { motion } from 'motion/react';
import { Newspaper, Sparkles } from 'lucide-react';

export default function NewsView() {
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <header className="bg-white p-10 rounded-[40px] border-2 border-natural-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Newspaper className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-natural-accent rounded-xl flex items-center justify-center text-white text-xl"><Newspaper size={20} /></div>
            <h1 className="text-3xl font-black text-natural-text">Seed Board News</h1>
          </div>
          <p className="text-natural-primary font-bold">Stay updated with the latest adventures in learning!</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
           <BoardNews expandAll={true} />
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-natural-sidebar rounded-[40px] p-10 border-2 border-natural-border border-dashed text-center space-y-4"
           >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-natural-accent shadow-sm mx-auto"><Sparkles size={32} /></div>
              <h2 className="text-2xl font-black text-natural-text">You're All Caught Up!</h2>
              <p className="text-sm font-bold text-natural-text/60 max-w-sm mx-auto">
                Check back tomorrow for more exciting news from the BrainSeed community.
              </p>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
