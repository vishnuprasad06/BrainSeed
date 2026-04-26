import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Play, Sparkles, Brain, PencilLine, Headphones, FlaskConical, Calculator, BookOpen, Star, Rocket, Music, Microscope } from 'lucide-react';
import AlphabetRecognition from './AlphabetRecognition';
import ScienceLab from './ScienceLab';
import ReadingComprehension from './ReadingComprehension';
import Quiz from './Quiz';
import MathGalaxy from './MathGalaxy';
import CreativeWriting from './CreativeWriting';
import LogicGates from './LogicGates';
import SpaceExplorer from './SpaceExplorer';
import StudyHub from './StudyHub';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

type ModuleType = 'Alphabet' | 'Math' | 'Stories' | 'Science' | 'Reading' | 'Space' | 'Upload' | 'None';

export default function LearningView() {
  const { user } = useApp();
  const { speak } = useVoice();
  const [activeModule, setActiveModule] = useState<ModuleType>('None');

  const grade = parseInt(user?.grade || '1');
  
  const getModules = () => {
    if (grade >= 1 && grade <= 5) {
      return [
        { id: 'Alphabet', title: 'Alphabet Hero', icon: <PencilLine />, color: 'bg-indigo-50 border-indigo-100 text-indigo-600', description: 'Master letters A-Z' },
        { id: 'Reading', title: 'Story Detective', icon: <BookOpen />, color: 'bg-pink-50 border-pink-100 text-pink-600', description: 'Read & solve mysteries' },
        { id: 'Math', title: 'Number Galaxy', icon: <Calculator />, color: 'bg-green-50 border-green-100 text-green-600', description: 'Counting & Addition' },
        { id: 'Stories', title: 'Ancient Legends', icon: <Headphones />, color: 'bg-orange-50 border-orange-100 text-orange-600', description: 'Brave Heroes of History' },
      ];
    } else {
      return [
        { id: 'Space', title: 'Advanced Cosmos', icon: <Rocket />, color: 'bg-slate-900 border-slate-700 text-slate-100', description: 'Astrophysics & Galaxies' },
        { id: 'Science', title: 'Senior Lab', icon: <FlaskConical />, color: 'bg-rose-50 border-rose-100 text-rose-600', description: 'Physics & Chemistry' },
        { id: 'Math', title: 'Advanced Math', icon: <Calculator />, color: 'bg-slate-50 border-slate-100 text-slate-800', description: 'Equations & Logic' },
        { id: 'Upload', title: 'Study Hub (PDF)', icon: <Book />, color: 'bg-cyan-50 border-cyan-100 text-cyan-600', description: 'Upload material & read' },
      ];
    }
  };

  const modules = getModules();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'Alphabet':
        return grade <= 3 ? <AlphabetRecognition /> : <CreativeWriting />;
      case 'Reading':
        return grade <= 3 ? <ReadingComprehension /> : <Quiz title="Critical Analysis" category="Reading" />;
      case 'Math':
        if (grade >= 6) return <LogicGates />;
        return <MathGalaxy />;
      case 'Science':
        return <ScienceLab />;
      case 'Stories':
        return <Quiz title={grade <= 3 ? "Legendary Quest" : "Ancient Warfare Quiz"} category="Stories" />;
      case 'Space':
        return <SpaceExplorer />;
      case 'Upload':
        return <StudyHub />;
      default:
        return null;
    }
  };

  const handleModuleSelect = (id: ModuleType, title: string) => {
    setActiveModule(id);
    speak(`Let's explore ${title}!`, 'nav');
  };

  if (activeModule !== 'None') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              setActiveModule('None');
              speak("Going back to the learning map.", 'nav');
            }}
            className="text-sm font-black text-natural-primary hover:underline flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-white border-2 border-natural-border rounded-full flex items-center justify-center group-hover:bg-natural-sidebar transition-colors">
              ←
            </div>
            Back to Map
          </button>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border-2 border-natural-border shadow-sm">
             <div className="w-8 h-8 bg-natural-accent rounded-lg flex items-center justify-center text-white">
                {modules.find(m => m.id === activeModule)?.icon}
             </div>
             <span className="text-sm font-black text-natural-text">{modules.find(m => m.id === activeModule)?.title}</span>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {renderActiveModule()}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black text-natural-text">Learning Map (Grade {grade})</h2>
        <p className="text-natural-primary font-bold">Pick your adventure for today!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ y: -5 }}
            className={`natural-card p-8 flex flex-col gap-6 cursor-pointer border-4 group transition-all ${activeModule === m.id ? 'border-natural-accent scale-105' : 'border-natural-border hover:border-natural-primary'}`}
            onClick={() => handleModuleSelect(m.id as ModuleType, m.title)}
          >
            <div className={`${m.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border-2`}>
              {m.icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-natural-text group-hover:text-natural-primary">{m.title}</h3>
              <p className="text-sm font-bold text-natural-text/60">{m.description}</p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-4">
               <span className="text-xs font-black uppercase tracking-widest text-natural-accent">Start Voyage</span>
               <div className="w-10 h-10 bg-natural-sidebar rounded-full flex items-center justify-center border-2 border-natural-border group-hover:bg-natural-accent group-hover:text-white group-hover:border-natural-accent transition-all">
                 <Play className="w-4 h-4 fill-current" />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="natural-card-heavy p-8 flex items-center gap-8 bg-natural-sidebar shadow-md">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-natural-primary shadow-sm transform -rotate-6 border-4 border-natural-border">
          {grade <= 3 ? <BookOpen size={40} className="fill-current/20" /> : <Microscope size={40} className="fill-current/20" />}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-natural-accent">Featured Activity</p>
          <h3 className="text-2xl font-black text-natural-text">
            {grade <= 3 ? 'Story of the Golden Seed' : 'Cosmic Navigator'}
          </h3>
          <p className="text-sm font-bold text-natural-text/70">
            {grade <= 3 ? 'A magical audio story about growth and patience.' : 'Explore the Solar System and the Milky Way galaxy!'}
          </p>
        </div>
        <button 
          onClick={() => {
            if (grade <= 3) {
              handleModuleSelect('Stories', 'Legendary Quest');
            } else {
              handleModuleSelect('Space', 'Cosmic Explorer');
            }
          }}
          className="natural-button"
        >
           {grade <= 3 ? 'Listen' : 'Launch'}
        </button>
      </section>
    </div>
  );
}
