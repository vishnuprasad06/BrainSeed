import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Medal, Target, Sprout, Calculator, Bird, BookOpen } from 'lucide-react';

const AWARDS = [
  { id: 1, title: 'Seed Sower', icon: <Sprout size={32} className="text-green-600" />, date: 'Yesterday', locked: false, color: 'bg-green-100 border-green-200' },
  { id: 2, title: 'Math Whiz', icon: <Calculator size={32} className="text-blue-600" />, date: '2 days ago', locked: false, color: 'bg-blue-100 border-blue-200' },
  { id: 3, title: 'Early Bird', icon: <Bird size={32} className="text-orange-600" />, date: '--', locked: true, color: 'bg-orange-100 border-orange-200' },
  { id: 4, title: 'Story Teller', icon: <BookOpen size={32} className="text-pink-600" />, date: '--', locked: true, color: 'bg-pink-100 border-pink-200' },
];

export default function AwardsView() {
  return (
    <div className="space-y-8 h-full">
      <header>
        <h2 className="text-3xl font-black text-natural-text">Your Trophy Room</h2>
        <p className="text-natural-primary font-bold">Keep learning to unlock them all!</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {AWARDS.map((award) => (
          <motion.div
            key={award.id}
            whileHover={{ scale: 1.05 }}
            className={`natural-card p-6 flex flex-col items-center gap-4 text-center ${award.locked ? 'opacity-40 grayscale pointer-events-none' : ''}`}
          >
            <div className={`${award.color} w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-inner`}>
              {award.icon}
            </div>
            <div>
              <h4 className="font-black text-natural-text uppercase tracking-tight text-sm">{award.title}</h4>
              <p className="text-[10px] font-bold text-natural-text/50">{award.locked ? 'Unlocks at Lvl 5' : award.date}</p>
            </div>
            {!award.locked && (
              <div className="bg-natural-accent/10 p-2 rounded-full">
                <Star className="w-4 h-4 text-natural-accent fill-natural-accent" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <section className="natural-card-heavy p-8 flex items-center gap-8 bg-natural-sidebar">
        <div className="w-24 h-24 bg-natural-accent rounded-full flex items-center justify-center shadow-lg transform -rotate-12 border-4 border-white">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-black text-natural-text">Grand Mission: Grade 1 Hero</h3>
          <p className="text-sm font-bold text-natural-text/70">Complete all Math and Reading levels to win the ultimate badge!</p>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden border-2 border-natural-border">
            <div className="h-full bg-natural-primary w-[35%]" />
          </div>
          <p className="text-xs font-black text-natural-primary uppercase tracking-widest">35% Complete</p>
        </div>
      </section>
    </div>
  );
}
