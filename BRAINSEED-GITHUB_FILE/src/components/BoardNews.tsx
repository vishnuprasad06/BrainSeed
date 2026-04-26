import React, { useState } from 'react';
import { Newspaper, ExternalLink, Calendar, ChevronDown, ChevronUp, Volume2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVoice } from '../hooks/useVoice';
import { generateSpeech } from '../services/geminiService';

const getTodayDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getYesterdayDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const NEWS = [
  {
    id: 1,
    title: 'New Digital Adventure Starts Soon!',
    summary: 'Get ready! Your textbooks are getting super-cool digital stories next year. Learning will be like playing a game!',
    fullContent: 'Starting next semester, our curriculum will include "Eco-Quest" – an interactive digital textbook series. Students will explore ecosystems, solve math puzzles to unlock new areas, and collaborate on group projects in a virtual world. Teachers will have access to real-time progress tracking to provide personalized support.',
    date: getTodayDate(),
    source: 'Learning Lab'
  },
  {
    id: 2,
    title: 'The Great Robot Challenge!',
    summary: 'Can you build a robot friend? Join the Science Fair and show your amazing inventions to the world!',
    fullContent: 'The annual Science Fair is focusing on robotics this year! We invite all students to design and build prototypes that solve everyday problems. Whether it\'s a plant-watering bot or a solar-powered desk lamp, we want to see it! Winners will receive a trip to the National Robotics Museum.',
    date: getYesterdayDate(),
    source: 'Future Kids'
  },
  {
    id: 3,
    title: 'Reading Magic Contest',
    summary: 'Read 5 books this month and win a "Master Reader" badge! Ask your teacher for the magic list.',
    fullContent: 'Dive into the world of literature with our Magic Reading Contest. Every book you finish earns you a stamp in your "Reading Passport." Collect five stamps this month to unlock the prestigious Master Reader badge and get a special invitation to the Author Meet-and-Greet in November!',
    date: getYesterdayDate(),
    source: 'Story Garden'
  }
];

export default function BoardNews({ mini = false, expandAll = false }: { mini?: boolean; expandAll?: boolean }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { speak, isReading } = useVoice();

  const toggleExpand = (id: number) => {
    if (mini || expandAll) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const isExpanded = (id: number) => expandAll || expandedId === id;

  const handleReadAloud = async (e: React.MouseEvent, text: string, id: number) => {
    e.stopPropagation();
    speak(text, id.toString());
  };

  return (
    <section className={`bg-white rounded-[40px] p-8 border-2 border-natural-border space-y-6 ${mini ? 'hover:border-natural-accent transition-colors' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-natural-text uppercase tracking-widest flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-natural-accent" />
          Board News & Updates
        </h3>
        {mini ? (
          <ArrowRight className="w-4 h-4 text-natural-primary" />
        ) : (
          <button className="text-[10px] font-black text-natural-primary underline">Check Official Portal</button>
        )}
      </div>

      <div className="space-y-4">
        {(mini ? NEWS.slice(0, 2) : NEWS).map((item) => (
          <motion.div 
            layout
            key={item.id} 
            onClick={() => toggleExpand(item.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              isExpanded(item.id) 
                ? 'bg-white border-natural-accent shadow-md' 
                : 'bg-natural-muted/30 border-natural-border hover:bg-natural-muted'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-natural-accent uppercase py-1 px-2 bg-white rounded-md border border-natural-border">
                {item.source}
              </span>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={(e) => handleReadAloud(e, `${item.title}. ${item.summary}`, item.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${isReading === item.id.toString() ? 'bg-natural-accent text-white border-natural-accent' : 'bg-white text-natural-text border-natural-border hover:bg-natural-bg'}`}
                >
                  <Volume2 className={`w-3 h-3 ${isReading === item.id.toString() ? 'animate-pulse' : ''}`} />
                </button>
                <div className="flex items-center gap-1 text-[10px] font-bold text-natural-text/50">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </div>
              </div>
            </div>
            
            <h4 className={`font-black transition-colors mb-1 ${
              isExpanded(item.id) ? 'text-natural-accent text-lg' : 'text-natural-text group-hover:text-natural-primary'
            }`}>
              {item.title}
            </h4>

            <AnimatePresence mode="wait">
              {isExpanded(item.id) ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-medium text-natural-text/80 leading-relaxed mb-4 whitespace-pre-wrap">
                    {item.fullContent}
                  </p>
                </motion.div>
              ) : (
                <p className={`text-xs font-medium text-natural-text/70 leading-relaxed ${mini ? 'line-clamp-1' : 'line-clamp-2'}`}>
                  {item.summary}
                </p>
              )}
            </AnimatePresence>

            {!mini && !expandAll && (
              <div className="mt-3 flex items-center justify-end text-[10px] font-black text-natural-primary uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                {isExpanded(item.id) ? 'Show Less' : 'Read More'}
                {isExpanded(item.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
