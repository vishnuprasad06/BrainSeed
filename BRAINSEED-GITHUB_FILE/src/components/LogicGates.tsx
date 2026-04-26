import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Zap, CheckCircle2, ChevronRight, RefreshCw, Volume2, Info, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';

interface Puzzle {
  id: number;
  title: string;
  description: string;
  gates: { type: 'AND' | 'OR' | 'XOR' | 'NOT'; inputs: number[]; id: number }[];
  inputsCount: number;
  targetOutput: boolean;
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: "The Friendly AND Gate",
    description: "An AND gate only gives light if BOTH switches are ON. Can you light the bulb?",
    gates: [{ type: 'AND', inputs: [0, 1], id: 101 }],
    inputsCount: 2,
    targetOutput: true
  },
  {
    id: 2,
    title: "The Generous OR Gate",
    description: "An OR gate gives light if ANY switch is ON. But wait, the bulb is connected to a NOT gate too!",
    gates: [
      { type: 'OR', inputs: [0, 1], id: 101 },
      { type: 'NOT', inputs: [101], id: 102 }
    ],
    inputsCount: 2,
    targetOutput: false // Goal: Make the bulb NOT light up? No, usually target is TRUE.
  },
  {
      id: 3,
      title: "NOT Logic",
      description: "A NOT gate flips the signal. Can you make the final output TRUE?",
      gates: [
          { type: 'NOT', inputs: [0], id: 101 }
      ],
      inputsCount: 1,
      targetOutput: true
  },
  {
    id: 4,
    title: "Double Trouble",
    description: "Connect the switches to get the right flow. (A AND B) OR C",
    gates: [
        { type: 'AND', inputs: [0, 1], id: 101 },
        { type: 'OR', inputs: [101, 2], id: 102 }
    ],
    inputsCount: 3,
    targetOutput: true
  },
  {
    id: 5,
    title: "The XOR Mystery",
    description: "XOR only works if the inputs are DIFFERENT. 1 and 0 = True, but 1 and 1 = False!",
    gates: [
        { type: 'XOR', inputs: [0, 1], id: 101 }
    ],
    inputsCount: 2,
    targetOutput: true
  },
  {
    id: 6,
    title: "The Broken Junction",
    description: "A complex puzzle! Can you find the exact combination to turn the light ON? (A AND B) OR (NOT C)",
    gates: [
        { type: 'AND', inputs: [0, 1], id: 101 },
        { type: 'NOT', inputs: [2], id: 102 },
        { type: 'OR', inputs: [101, 102], id: 103 }
    ],
    inputsCount: 3,
    targetOutput: true
  }
];

export default function LogicGates() {
  const { user, setUser } = useApp();
  const { speak, isReading } = useVoice();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputs, setInputs] = useState<boolean[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  const puzzle = PUZZLES[currentIdx];

  useEffect(() => {
    setInputs(new Array(puzzle.inputsCount).fill(false));
    setIsSolved(false);
  }, [currentIdx, puzzle.inputsCount]);

  const calculateOutput = (currentInputs: boolean[]) => {
    const values: Record<number, boolean> = {};
    // Set initial inputs
    currentInputs.forEach((val, idx) => { values[idx] = val; });

    // Calculate gates
    puzzle.gates.forEach(gate => {
      const inputValues = gate.inputs.map(id => values[id]);
      let result = false;
      if (gate.type === 'AND') result = inputValues.every(v => v);
      else if (gate.type === 'OR') result = inputValues.some(v => v);
      else if (gate.type === 'NOT') result = !inputValues[0];
      else if (gate.type === 'XOR') result = inputValues[0] !== inputValues[1];
      values[gate.id] = result;
    });

    // The result is the last gate's output
    const finalGateId = puzzle.gates[puzzle.gates.length - 1].id;
    return values[finalGateId];
  };

  const currentOutput = calculateOutput(inputs);

  const toggleInput = (idx: number) => {
    if (isSolved) return;
    const newInputs = [...inputs];
    newInputs[idx] = !newInputs[idx];
    setInputs(newInputs);
  };

  const handleCheck = () => {
    if (currentOutput === puzzle.targetOutput) {
      setIsSolved(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
          points: user.points + 30,
          activityLog: [...(user.activityLog || []), newLog]
        });
      }
      speak("Wonderful! You fixed the circuit!");
    } else {
      speak("Hmm, the circuit isn't quite right yet. Try switching the gates!");
    }
  };

  const nextPuzzle = () => {
    if (currentIdx < PUZZLES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Loop or finish
      setCurrentIdx(0);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-natural-text flex items-center gap-2">
            <Zap className="text-blue-500" />
            {puzzle.title}
          </h2>
          <p className="text-natural-primary font-bold">Puzzle {currentIdx + 1} of {PUZZLES.length}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border-2 border-natural-border shadow-sm flex items-center gap-2">
           <Zap className="w-4 h-4 text-yellow-500 fill-current" />
           <span className="font-black text-natural-text">{user?.points} Seeds</span>
        </div>
      </header>

      <section className="natural-card p-8 bg-natural-sidebar space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
            <div className="space-y-4 max-w-md">
                <div className="flex items-center gap-2">
                    <Info className="text-blue-400 w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-natural-text/40">Instructions</h4>
                </div>
                <p className="text-lg font-bold text-natural-text leading-tight">{puzzle.description}</p>
                <button 
                  onClick={() => speak(puzzle.description, 'desc')}
                  className={`p-2 rounded-full ${isReading === 'desc' ? 'bg-blue-500 text-white animate-pulse' : 'bg-white text-blue-500 border border-blue-100'}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
            </div>
            
            <motion.div 
               animate={{ 
                 scale: currentOutput === puzzle.targetOutput ? [1, 1.1, 1] : 1,
                 opacity: currentOutput === puzzle.targetOutput ? 1 : 0.4
               }}
               className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${currentOutput ? 'bg-yellow-100 border-yellow-400 text-yellow-600 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'bg-slate-100 border-slate-300 text-slate-400'}`}
            >
                <Lightbulb size={48} className={currentOutput ? 'fill-current' : ''} />
            </motion.div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-8 bg-white/50 rounded-3xl border-2 border-dashed border-natural-border/50">
            {/* Inputs */}
            <div className="flex flex-col gap-6">
                <span className="text-[10px] font-black text-center uppercase tracking-widest text-natural-text/30">Inputs</span>
                {inputs.map((val, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleInput(idx)}
                        className={`w-16 h-16 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-1 ${val ? 'bg-blue-500 border-blue-600 text-white shadow-lg' : 'bg-white border-natural-border text-natural-text/40'}`}
                    >
                        <span className="text-xs font-black uppercase">{idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}</span>
                        <span className="text-lg font-black">{val ? 'ON' : 'OFF'}</span>
                    </motion.button>
                ))}
            </div>

            <div className="text-natural-border">
                <ChevronRight size={48} />
            </div>

            {/* Circuit Visualization */}
            <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col gap-4">
                    {puzzle.gates.map((gate, i) => (
                        <div key={gate.id} className="flex items-center gap-4">
                            <div className="bg-white border-2 border-natural-border px-4 py-2 rounded-xl shadow-sm min-w-[80px] text-center">
                                <p className="text-[10px] font-black text-natural-text/40 uppercase">Gate {i+1}</p>
                                <p className="text-sm font-black text-blue-600">{gate.type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-natural-border">
                <ChevronRight size={48} />
            </div>

            {/* Target */}
            <div className="flex flex-col items-center gap-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-natural-text/30">Goal</span>
                 <div className={`p-4 rounded-2xl border-2 italic font-bold text-sm ${puzzle.targetOutput ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    Output: {puzzle.targetOutput ? 'LIGHT ON' : 'LIGHT OFF'}
                 </div>
            </div>
        </div>
      </section>

      <footer className="flex justify-between items-center bg-white p-6 rounded-3xl border-4 border-natural-border shadow-inner">
        <div>
           {isSolved ? (
             <div className="flex items-center gap-3 text-green-600">
               <CheckCircle2 className="w-6 h-6" />
               <span className="text-xl font-black">Circuit Complete!</span>
             </div>
           ) : (
             <p className="text-natural-text/50 font-bold">Try switching the inputs to solve the logic puzzle!</p>
           )}
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={() => {
                   setInputs(new Array(puzzle.inputsCount).fill(false));
                   setIsSolved(false);
                }}
                className="p-4 rounded-2xl border-2 border-natural-border text-natural-text hover:bg-natural-sidebar transition-all"
            >
                <RefreshCw size={24} />
            </button>
            {!isSolved ? (
                <button
                    onClick={handleCheck}
                    className="bg-natural-primary text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all text-xl"
                >
                    Check Circuit
                </button>
            ) : (
                <button
                    onClick={nextPuzzle}
                    className="bg-natural-accent text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all text-xl"
                >
                    Next Level
                </button>
            )}
        </div>
      </footer>
    </div>
  );
}
