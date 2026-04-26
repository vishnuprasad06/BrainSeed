import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Star, Sparkles, Trophy, RefreshCw, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { generateSpeech } from '../services/geminiService';

export default function MathGalaxy() {
  const { user, setUser } = useApp();
  const { speak } = useVoice();
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'levelUp'>('playing');

  const grade = parseInt(user?.grade || '1');

  const generateQuestion = () => {
    let a, b, op, answer;
    
    if (grade <= 3) {
      // Simple addition/subtraction
      a = Math.floor(Math.random() * (10 * level)) + 1;
      b = Math.floor(Math.random() * (10 * level)) + 1;
      op = '+';
      answer = a + b;
    } else if (grade <= 7) {
      // Multiplication/Division basics
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      op = '×';
      answer = a * b;
    } else {
      // More complex
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * 15) + 5;
      op = '×';
      answer = a * b;
    }

    setQuestion({ a, b, op, answer });
    
    const opts = [answer];
    while (opts.length < 4) {
      const wrong = answer + (Math.floor(Math.random() * 10) - 5);
      if (wrong !== answer && !opts.includes(wrong) && wrong >= 0) {
        opts.push(wrong);
      } else if (wrong < 0) {
        opts.push(answer + opts.length + 1);
      }
    }
    setOptions(opts.sort(() => 0.5 - Math.random()));
  };

  useEffect(() => {
    generateQuestion();
  }, [level]);

  const handleAnswer = (val: number) => {
    if (val === question.answer) {
      setScore(s => s + 10);
      const winMessage = 'Super Math Wizard! You got it right!';
      setFeedback(winMessage);
      speak(winMessage);
      if (user) setUser({ ...user, points: user.points + 10 });
      
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });

      if (score + 10 >= level * 30) {
        setGameState('levelUp');
      } else {
        setTimeout(() => {
          setFeedback(null);
          generateQuestion();
        }, 1500);
      }
    } else {
      const tryAgainMessage = 'Almost there! Try another one!';
      setFeedback(tryAgainMessage);
      speak(tryAgainMessage);
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const nextLevel = () => {
    if (user) {
      const newLog = {
        id: Date.now().toString(),
        type: 'Math' as const,
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
    setLevel(l => l + 1);
    setGameState('playing');
    setScore(0);
    setFeedback(null);
    speak("Level complete! You're a star!");
  };

  return (
    <div className="natural-card-heavy p-8 space-y-8 bg-indigo-900 border-4 border-indigo-400 text-white min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-10 left-10 text-yellow-300 w-8 h-8 animate-pulse fill-current" />
        <Sparkles className="absolute top-40 right-20 text-yellow-100 w-12 h-12 opacity-50" />
        <Star className="absolute bottom-10 left-1/4 text-white w-6 h-6 opacity-30 fill-current" />
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-white rounded-full blur-[1px] animate-ping"></div>
      </div>

      <div className="w-full flex justify-between items-center z-10">
        <div className="bg-indigo-800/50 px-4 py-2 rounded-2xl border border-indigo-400/30 flex items-center gap-2">
           <Trophy className="w-4 h-4 text-yellow-400" />
           <span className="text-xs font-black uppercase tracking-widest">Level {level}</span>
        </div>
        <div className="bg-indigo-800/50 px-4 py-2 rounded-2xl border border-indigo-400/30">
           <span className="text-xs font-black uppercase tracking-widest">Score: {score}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'playing' ? (
          <motion.div 
            key="game"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="w-full text-center space-y-12 z-10"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-[0.3em] text-indigo-300">Space Equation</h2>
              <div className="flex items-center justify-center gap-8 text-7xl font-black">
                <span className="bg-white/10 w-24 h-24 flex items-center justify-center rounded-[2rem] border-2 border-white/20">{question.a}</span>
                <span className="text-emerald-400">{question.op}</span>
                <span className="bg-white/10 w-24 h-24 flex items-center justify-center rounded-[2rem] border-2 border-white/20">{question.b}</span>
                <span className="text-indigo-400">=</span>
                <span className="bg-white/10 w-24 h-24 flex items-center justify-center rounded-[2rem] border-2 border-white/20 text-indigo-300 text-5xl">?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white text-indigo-900 py-6 rounded-3xl text-3xl font-black hover:bg-emerald-400 hover:text-white hover:scale-105 transition-all shadow-xl active:scale-95 border-b-8 border-indigo-200 hover:border-emerald-600"
                >
                  {opt}
                </button>
              ))}
            </div>

            {feedback && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xl font-black text-emerald-400 drop-shadow-lg"
              >
                {feedback}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="levelup"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8 z-10"
          >
             <div className="w-40 h-40 bg-yellow-400 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce">
                <Star className="w-20 h-20 text-white fill-current" />
             </div>
             <div className="space-y-2">
                <h2 className="text-4xl font-black">GALACTIC LEVEL UP!</h2>
                <p className="text-indigo-200 font-bold">You've mastered Level {level}! Ready for a bigger challenge?</p>
             </div>
             <button 
               onClick={nextLevel}
               className="bg-emerald-500 hover:bg-emerald-400 text-white px-12 py-5 rounded-full font-black text-2xl shadow-xl flex items-center gap-3 mx-auto group"
             >
               Next Solar System <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
