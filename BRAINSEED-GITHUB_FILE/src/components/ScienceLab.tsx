import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Atom, Droplets, Wind, Scale, CheckCircle2, ChevronRight, Info, Volume2, Snowflake, Leaf } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

const CONCEPTS_JUNIOR = [
  {
    id: 1,
    title: "States of Matter",
    subject: "Physics",
    image: <Snowflake className="w-8 h-8 text-blue-500" />,
    question: "What happens when you heat ice?",
    options: ["It turns to Gas", "It turns to Liquid", "It stays Solid"],
    correct: 1,
    explanation: "Heating ice causes it to melt into liquid water! This is a phase change from solid to liquid."
  },
  {
    id: 2,
    title: "Photosynthesis",
    subject: "Biology",
    image: <Leaf className="w-8 h-8 text-green-500" />,
    question: "What do plants need to make food?",
    options: ["Only Water", "Sunlight & CO2", "Sand & Salt"],
    correct: 1,
    explanation: "Plants use sunlight, water, and carbon dioxide to make their own food through photosynthesis!"
  }
];

const CONCEPTS_SENIOR = [
  {
    id: 1,
    title: "Cellular Respiration",
    subject: "Biology",
    image: <Atom className="w-8 h-8 text-purple-500" />,
    question: "Which organelle is considered the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria"],
    correct: 2,
    explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
  },
  {
    id: 2,
    title: "Kinetic Energy",
    subject: "Physics",
    image: <Wind className="w-8 h-8 text-yellow-500" />,
    question: "If velocity doubles, what happens to kinetic energy?",
    options: ["It doubles", "It quadruples", "It halves"],
    correct: 1,
    explanation: "Kinetic Energy is proportional to the square of velocity (KE = 1/2 mv^2). So, if velocity doubles, KE increases by a factor of four!"
  }
];

export default function ScienceLab() {
  const { user, setUser } = useApp();
  const { speak, isReading } = useVoice();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const grade = parseInt(user?.grade || '1');
  const concepts = grade >= 6 ? CONCEPTS_SENIOR : CONCEPTS_JUNIOR;
  const concept = concepts[currentIdx];

  const handleChoice = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === concept.correct) {
      confetti({ particleCount: 50, spread: 60 });
      if (user) {
        const newLog = {
          id: Date.now().toString(),
          type: 'Science' as const,
          score: 100,
          maxScore: 100,
          timestamp: new Date()
        };
        setUser({ 
          ...user, 
          points: user.points + 20,
          activityLog: [...(user.activityLog || []), newLog]
        });
      }
      speak(`Correct! ${concept.explanation}`, 'feedback');
    } else {
      speak(`Not quite. ${concept.explanation}`, 'feedback');
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    setCurrentIdx((prev) => (prev + 1) % concepts.length);
  };

  return (
    <div className="natural-card-heavy p-8 border-4 border-natural-primary space-y-8 bg-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Atom className="w-32 h-32" />
      </div>

      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <span className="text-[10px] font-black bg-natural-primary/10 text-natural-primary px-3 py-1 rounded-full uppercase tracking-widest border border-natural-primary/20">
            {concept.subject} Lab
          </span>
          <h2 className="text-3xl font-black text-natural-text">{concept.title}</h2>
        </div>
        <div className="w-16 h-16 bg-natural-muted rounded-3xl flex items-center justify-center text-4xl shadow-inner transform -rotate-3">
          {concept.image}
        </div>
      </header>

      <div className="bg-natural-bg rounded-3xl p-8 border-2 border-dashed border-natural-border text-center space-y-6">
        <h3 className="text-xl font-black text-natural-text leading-tight">{concept.question}</h3>
        <div className="grid grid-cols-1 gap-4">
          {concept.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleChoice(idx)}
              className={`p-5 rounded-2xl text-left font-black transition-all border-4 flex items-center justify-between ${
                selected === idx
                  ? idx === concept.correct
                    ? 'bg-natural-primary text-white border-natural-primary'
                    : 'bg-red-500 text-white border-red-600'
                  : 'bg-white text-natural-text border-natural-border hover:border-natural-accent'
              }`}
            >
              {option}
              {selected === idx && (
                idx === concept.correct ? <CheckCircle2 className="w-6 h-6" /> : null
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="natural-card-heavy p-6 bg-natural-sidebar border-natural-accent space-y-4"
          >
            <div className="flex items-center justify-between gap-2 text-natural-accent-dark">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                <p className="font-black uppercase text-xs tracking-widest">Did you know?</p>
              </div>
              <button 
                onClick={() => speak(concept.explanation, 'explanation')}
                className={`p-1.5 rounded-lg border transition-colors ${isReading === 'explanation' ? 'bg-natural-accent text-white border-natural-accent' : 'bg-white text-natural-accent border-natural-accent hover:bg-natural-bg'}`}
              >
                <Volume2 className={`w-3 h-3 ${isReading === 'explanation' || isReading === 'feedback' ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            <p className="text-sm font-bold text-natural-text leading-relaxed italic">{concept.explanation}</p>
            <button
              onClick={handleNext}
              className="natural-button w-full flex items-center justify-center gap-2 bg-natural-accent hover:bg-natural-accent-dark"
            >
              Mastered! Next Concept
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
