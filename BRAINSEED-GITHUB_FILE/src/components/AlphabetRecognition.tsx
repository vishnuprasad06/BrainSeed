import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Star, Sparkles, Check, Apple, Dribbble, Cat, Dog, TreePine, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { generateSpeech } from '../services/geminiService';

const ALPHABETS = [
  { letter: 'A', word: 'Apple', image: <Apple size={48} className="text-red-500 fill-current" />, color: 'bg-red-100 border-red-200 text-red-600' },
  { letter: 'B', word: 'Ball', image: <Dribbble size={48} className="text-blue-500" />, color: 'bg-blue-100 border-blue-200 text-blue-600' },
  { letter: 'C', word: 'Cat', image: <Cat size={48} className="text-orange-500 fill-current" />, color: 'bg-orange-100 border-orange-200 text-orange-600' },
  { letter: 'D', word: 'Dog', image: <Dog size={48} className="text-amber-700 fill-current" />, color: 'bg-brown-100 border-brown-200 text-amber-600' },
  { letter: 'E', word: 'Evergreen', image: <TreePine size={48} className="text-green-500 fill-current" />, color: 'bg-green-100 border-green-200 text-green-600' },
];

export default function AlphabetRecognition() {
  const { user, setUser } = useApp();
  const { speak, isReading } = useVoice();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [gameState, setGameState] = useState<'study' | 'play' | 'won'>('study');
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const current = ALPHABETS[currentIdx];

  const startQuiz = () => {
    // Pick 3 random letters including the correct one
    const letters = ALPHABETS.map(a => a.letter);
    const others = letters.filter(l => l !== current.letter);
    const shuffled = [current.letter, ...others.sort(() => 0.5 - Math.random()).slice(0, 2)];
    setOptions(shuffled.sort(() => 0.5 - Math.random()));
    setGameState('play');
  };

  const handleChoice = (letter: string) => {
    if (letter === current.letter) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setFeedback('Correct! You found it!');
      if (user) setUser({ ...user, points: user.points + 5 });
      
      setTimeout(() => {
        if (currentIdx < ALPHABETS.length - 1) {
          setCurrentIdx(currentIdx + 1);
          setGameState('study');
          setFeedback(null);
        } else {
          setGameState('won');
          if (user) {
            const newLog = {
              id: Date.now().toString(),
              type: 'Alphabet' as const,
              score: 100,
              maxScore: 100,
              timestamp: new Date()
            };
            setUser({ 
              ...user, 
              points: user.points + 50,
              activityLog: [...(user.activityLog || []), newLog]
            });
          }
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }, 2000);
    } else {
      setFeedback('Oops! Try again!');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const reset = () => {
    setCurrentIdx(0);
    setGameState('study');
  };

  return (
    <div className="natural-card-heavy p-8 space-y-8 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-natural-border">
        <motion.div 
          className="h-full bg-natural-accent"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIdx / ALPHABETS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'study' && (
          <motion.div 
            key="study"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="text-center space-y-8 w-full"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-black text-natural-primary uppercase tracking-[0.2em]">Point & Learn</h3>
              <p className="text-4xl font-black text-natural-text">This is Letter {current.letter}</p>
            </div>

            <div className={`w-64 h-64 mx-auto rounded-[48px] border-4 flex items-center justify-center text-9xl shadow-xl transform rotate-3 ${current.color}`}>
              {current.letter}
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="bg-white border-2 border-natural-border p-4 rounded-3xl flex items-center gap-4 shadow-sm">
                <span className="text-5xl">{current.image}</span>
                <div className="text-left">
                  <p className="text-xs font-black text-natural-text/40 uppercase tracking-widest leading-none mb-1">{current.letter} is for</p>
                  <p className="text-2xl font-black text-natural-text">{current.word}</p>
                </div>
              </div>
              <button 
                onClick={() => speak(`${current.letter} is for ${current.word}`, 'study')}
                className={`p-4 rounded-full shadow-sm transition-all border-2 ${
                  isReading === 'study' 
                    ? 'bg-natural-accent text-white animate-pulse border-natural-accent' 
                    : 'bg-natural-sidebar border-natural-border text-natural-primary hover:scale-110'
                }`}
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>

            <button 
              onClick={startQuiz}
              className="natural-button px-12 py-5 text-xl flex items-center gap-3 mx-auto shadow-xl mt-8"
            >
              <Sparkles className="w-6 h-6" />
              Play Game
            </button>
          </motion.div>
        )}

        {gameState === 'play' && (
          <motion.div 
            key="play"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-center space-y-12 w-full"
          >
             <div className="space-y-4">
                <h3 className="text-2xl font-black text-natural-text">Find the letter <span className="text-natural-accent underline underline-offset-8">{current.letter}</span></h3>
                <div className="text-6xl animate-bounce">{current.image}</div>
             </div>

             <div className="flex flex-wrap justify-center gap-6">
                {options.map((opt) => (
                  <div key={opt} className="relative group">
                    <button
                      onClick={() => handleChoice(opt)}
                      className="w-24 h-24 bg-white border-4 border-natural-border rounded-3xl text-4xl font-black text-natural-text shadow-md hover:border-natural-accent hover:scale-105 transition-all"
                    >
                      {opt}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(opt, opt);
                      }}
                      className={`absolute -top-2 -right-2 p-2 rounded-full transition-all shadow-lg border-2 ${
                        isReading === opt 
                          ? 'bg-natural-accent text-white animate-pulse border-natural-accent' 
                          : 'bg-white text-natural-primary border-natural-border opacity-0 group-hover:opacity-100 hover:scale-110'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>

             <AnimatePresence>
                {feedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xl font-black text-natural-primary"
                  >
                    {feedback}
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        )}

        {gameState === 'won' && (
          <motion.div 
            key="won"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-32 h-32 bg-natural-accent rounded-full mx-auto flex items-center justify-center text-white shadow-2xl animate-spin-slow">
               <Trophy size={64} className="fill-current text-yellow-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-natural-text">Alphabet Hero!</h2>
              <p className="text-natural-primary font-bold uppercase tracking-widest">You've learned all basic letters</p>
            </div>
            <div className="flex gap-4">
              <button onClick={reset} className="natural-button bg-white text-natural-text border-2 border-natural-border">Practice Again</button>
              <button className="natural-button">Next Level</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
