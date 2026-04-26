import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Volume2, Info, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { generateSpeech, getAIResponse } from '../services/geminiService';

interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
  audioHint?: string;
  gradeRef: 'primary' | 'middle' | 'senior';
  category?: 'General' | 'Math' | 'Science' | 'Reading' | 'Stories';
}

const QUESTIONS: Question[] = [
  // Primary (1-3) - Nature & Life
  {
    id: 1,
    text: "What is 5 + 3?",
    options: ["7", "8", "9", "10"],
    answer: "8",
    explanation: "When we count 5 and then add 3 more, we get 8! Imagine 5 seeds in one hand and 3 in the other.",
    gradeRef: 'primary',
    category: 'Math'
  },
  {
    id: 101,
    text: "In Ancient Egypt, what giant stone structures were built for Kings?",
    options: ["Castles", "Pyramids", "Towers", "Igloos"],
    answer: "Pyramids",
    explanation: "The Ancient Egyptians built massive Pyramids as tombs for their Pharaohs. They are one of the world's greatest wonders!",
    gradeRef: 'primary',
    category: 'Stories'
  },
  {
    id: 102,
    text: "Which ancient people were famous for being brave warriors with red shields?",
    options: ["Spartans", "Vikings", "Ninjas", "Cowboys"],
    answer: "Spartans",
    explanation: "Spartans were legendary warriors from Ancient Greece. They were known for their incredible bravery and discipline in battle!",
    gradeRef: 'primary',
    category: 'Stories'
  },
  {
    id: 201,
    text: "What does 'The early bird catches the worm' mean?",
    options: ["Birds like worms", "Waking up early gives you a head start", "Never sleep", "Always be late"],
    answer: "Waking up early gives you a head start",
    explanation: "It means that if you start something early, you have a better chance of being successful.",
    gradeRef: 'primary',
    category: 'Reading'
  },
  // Middle (4-7) - Classical Antiquity & Wars
  {
    id: 3,
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: "Mars",
    explanation: "Mars appears red because of iron oxide (rust) on its surface! It is the fourth planet from the Sun.",
    gradeRef: 'middle',
    category: 'Science'
  },
  {
    id: 103,
    text: "Who was the young King of Macedon who conquered a massive empire in the ancient world?",
    options: ["Julius Caesar", "Alexander the Great", "Genghis Khan", "Napoléon"],
    answer: "Alexander the Great",
    explanation: "Alexander the Great created one of the largest empires in history by the age of 30, stretching from Greece to India!",
    gradeRef: 'middle',
    category: 'Stories'
  },
  {
    id: 104,
    text: "The 'Punic Wars' were fought between Rome and which other powerful city?",
    options: ["Athens", "Carthage", "Sparta", "Troy"],
    answer: "Carthage",
    explanation: "The Punic Wars were a series of three wars fought between Rome and Carthage, famous for the general Hannibal crossing the Alps with elephants!",
    gradeRef: 'middle',
    category: 'Stories'
  },
  {
    id: 105,
    text: "What was the name of the famous wooden horse used by the Greeks to win a war?",
    options: ["The Trojan Horse", "The Spartan Stallion", "The Iron Horse", "The Golden Pony"],
    answer: "The Trojan Horse",
    explanation: "The Greeks built a huge wooden horse, hid soliders inside, and left it for the Trojans as a 'gift' to get inside the city walls of Troy.",
    gradeRef: 'middle',
    category: 'Stories'
  },
  {
    id: 301,
    text: "What is the main idea of a story?",
    options: ["The characters' names", "The author's age", "What the story is mostly about", "Where the book was printed"],
    answer: "What the story is mostly about",
    explanation: "The main idea captures the central point or most important thought the author wants to communicate.",
    gradeRef: 'middle',
    category: 'Reading'
  },
  // Senior (8-10) - Complex Ancient History
  {
    id: 5,
    text: "Who proposed the Theory of Relativity?",
    options: ["Newton", "Einstein", "Bohr", "Hawking"],
    answer: "Einstein",
    explanation: "Albert Einstein published the general theory of relativity in 1915, revolutionizing our understanding of space and time.",
    gradeRef: 'senior',
    category: 'Science'
  },
  {
    id: 106,
    text: "Which famous Spartan King led 300 warriors against the Persian army at Thermopylae?",
    options: ["Leonidas", "Pericles", "Themistocles", "Agamemnon"],
    answer: "Leonidas",
    explanation: "King Leonidas I and his 300 Spartans fought to the death to hold off the massive Persian army led by Xerxes at the narrow pass of Thermopylae.",
    gradeRef: 'senior',
    category: 'Stories'
  },
  {
    id: 107,
    text: "Julius Caesar's conquest of which region made him a hero in Rome but led to a civil war?",
    options: ["Gaul", "Britain", "Egypt", "Spain"],
    answer: "Gaul",
    explanation: "Caesar spent eight years conquering Gaul (modern-day France). His success made him extremely powerful, leading to his conflict with Pompey and the Senate.",
    gradeRef: 'senior',
    category: 'Stories'
  },
  {
    id: 401,
    text: "What is an inference in literature?",
    options: ["A direct quote", "A typo", "A logical conclusion based on details", "The title of a chapter"],
    answer: "A logical conclusion based on details",
    explanation: "Inference is reading between the lines to understand something the author implies rather than states directly.",
    gradeRef: 'senior',
    category: 'Reading'
  }
];

export default function Quiz({ title, category = 'General' }: { title?: string, category?: string }) {
  const { user, setUser } = useApp();
  const { speak, isReading } = useVoice();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const gradeNum = parseInt(user?.grade || '1');
  const gradeType = gradeNum <= 3 ? 'primary' : gradeNum <= 7 ? 'middle' : 'senior';
  const gradeQuestions = QUESTIONS.filter(q => q.gradeRef === gradeType && (category === 'General' || q.category === category));
  const question = gradeQuestions[currentIdx] || gradeQuestions[0];

  const handleSelect = async (option: string) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === question.answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setAiExplanation(null);
    
    if (correct && user) {
      setUser({ ...user, points: user.points + 10 });
    }

    if (!correct || question.id === 103) {
      setIsGenerating(true);
      try {
        const prompt = correct && question.id === 103 
             ? `Explain who Alexander the Great was to a grade 4-7 student simply and encouragingly.`
             : `A student answered "${option}" instead of "${question.answer}" to the question "${question.text}". Give a short (2-3 sentences), very encouraging explanation of the correct answer. Keep it simple and motivating.`;
             
        const response = await getAIResponse(prompt, { name: user?.name || 'Student', grade: user?.grade || '1' });
        setAiExplanation(response);
      } catch (e) {
        setAiExplanation(question.explanation);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleNext = () => {
    setSelected(null);
    setIsCorrect(null);
    setShowFeedback(false);
    
    if (currentIdx < gradeQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setFinished(true);
      if (user) {
        // Track the activity
        const newLog = {
          id: Date.now().toString(),
          type: 'Reading' as const, // Or dynamically determined if category is available
          score: 100, // Fixed score for completion for now
          maxScore: 100,
          timestamp: new Date()
        };
        setUser({
          ...user,
          points: user.points + 20,
          activityLog: [...(user.activityLog || []), newLog]
        });
      }
    }
  };

  return (
    <div className="bg-natural-sidebar rounded-[40px] p-8 border-4 border-natural-accent relative overflow-hidden shadow-sm h-fit min-h-[420px] flex flex-col">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-natural-accent opacity-10 rounded-full"></div>
      
      <AnimatePresence mode="wait">
        {!finished ? (
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10 flex-1"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-natural-accent-dark">Question {currentIdx + 1}/{gradeQuestions.length}</h3>
                {title && <h2 className="text-sm font-bold text-natural-text/60 truncate max-w-[200px]">{title}</h2>}
              </div>
              <button 
                onClick={() => speak(question.text, 'question')}
                className={`p-2 rounded-full transition-all ${isReading === 'question' ? 'bg-natural-accent text-white animate-pulse' : 'bg-white text-natural-accent border border-natural-accent/20'}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-3xl font-black text-natural-text italic leading-tight">
              {question.text}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option) => (
                <div key={option} className="relative group">
                  <button
                    onClick={() => handleSelect(option)}
                    disabled={selected !== null}
                    className={`w-full py-4 px-4 rounded-2xl text-xl font-black transition-all border-2 relative overflow-hidden flex items-center justify-center gap-2 ${
                       selected === option
                        ? isCorrect 
                          ? 'bg-natural-primary text-white border-natural-primary'
                          : 'bg-red-500 text-white border-red-600'
                        : selected !== null && option === question.answer
                          ? 'bg-natural-primary/20 border-natural-primary text-natural-primary'
                          : 'bg-white text-natural-text border-natural-border hover:bg-natural-primary hover:text-white hover:border-natural-primary'
                    }`}
                  >
                    {option}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(option, `option-${option}`);
                    }}
                    className={`absolute top-1 right-1 p-1.5 rounded-lg transition-all ${
                      isReading === `option-${option}` 
                        ? 'bg-natural-accent text-white' 
                        : 'bg-natural-bg/50 text-natural-text/40 hover:bg-natural-accent/20 hover:text-natural-accent opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-[2rem] border-4 shadow-lg flex flex-col gap-4 ${
                  isCorrect 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${isCorrect ? 'bg-emerald-200' : 'bg-rose-200'}`}>
                    <Info className={`w-6 h-6 ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Brilliant! That's Right!
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          Not quite, but good try!
                        </>
                      )}
                    </h4>
                    {!isCorrect && (
                      <p className="text-sm font-black">
                        The correct answer was: <span className="bg-rose-100 px-2 py-0.5 rounded border border-rose-200">{question.answer}</span>
                      </p>
                    )}
                    <div className="bg-white/40 p-4 rounded-xl border border-white/50 relative group">
                      <p className="text-sm font-bold leading-relaxed italic pr-8">
                        {aiExplanation || question.explanation}
                      </p>
                      <button 
                        onClick={() => speak(aiExplanation || question.explanation, 'explanation')}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
                          isReading === 'explanation'
                            ? 'bg-natural-accent text-white animate-pulse'
                            : 'bg-white/50 text-natural-accent hover:bg-natural-accent hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isCorrect 
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200' 
                      : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200'
                  } shadow-lg active:scale-95 disabled:opacity-50`}
                >
                  {isGenerating ? 'Thinking...' : currentIdx < gradeQuestions.length - 1 ? 'Next Challenge' : 'See Results'}
                  {!isGenerating && <ArrowRight className="w-5 h-5" />}
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="finish"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12 space-y-6 relative z-10 flex flex-col items-center justify-center flex-1"
          >
            <div className="w-24 h-24 bg-natural-accent rounded-full flex items-center justify-center shadow-lg transform rotate-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-natural-text uppercase italic tracking-tighter">Brain Bloom!</h3>
              <p className="text-natural-primary font-bold uppercase tracking-[0.2em] text-sm">Great workout for the mind</p>
            </div>
            <button 
              onClick={() => {
                setFinished(false);
                setCurrentIdx(0);
                setSelected(null);
                setIsCorrect(null);
                setShowFeedback(false);
              }}
              className="bg-natural-primary text-white w-full py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-natural-primary/90 transition-all shadow-xl active:scale-95"
            >
              Plant More Seeds
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

