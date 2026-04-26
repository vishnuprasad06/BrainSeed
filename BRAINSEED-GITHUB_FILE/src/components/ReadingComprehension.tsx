import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle2, ChevronRight, Trophy, Sparkles, Volume2, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { generateSpeech } from '../services/geminiService';

const STORIES = [
  {
    id: 1,
    title: "The Kind Squirrel",
    text: "Sammy the Squirrel found a large nut. He saw his friend Benny was hungry. Sammy shared half of his nut with Benny. They both were happy and played all day in the big oak tree.",
    questions: [
      {
        q: "Who found the large nut?",
        options: ["Benny", "Sammy", "A Bird"],
        correct: 1,
        explanation: "The story says Sammy the Squirrel found the nut!"
      },
      {
        q: "Where did they play?",
        options: ["In the river", "On the grass", "In the oak tree"],
        correct: 2,
        explanation: "They played all day in the big oak tree."
      }
    ]
  },
  {
    id: 2,
    title: "Miku's Red Balloon",
    text: "Miku had a bright red balloon. A soft breeze blew it high into the sky. Miku watched it go over the rainbow and land in a garden of yellow flowers.",
    questions: [
      {
        q: "What color was the balloon?",
        options: ["Blue", "Yellow", "Red"],
        correct: 2,
        explanation: "Miku had a bright red balloon!"
      }
    ]
  }
];

export default function ReadingComprehension() {
  const { user, setUser } = useApp();
  const { speak, isReading } = useVoice();
  const [storyIdx, setStoryIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);

  const story = STORIES[storyIdx];
  const question = story.questions[questionIdx];

  const handleChoice = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowFeedback(true);
    
    if (idx === question.correct) {
      speak(`Correct! ${question.explanation}`, 'feedback');
      if (user) {
        const isLast = questionIdx === story.questions.length - 1;
        const newLog = isLast ? {
          id: Date.now().toString(),
          type: 'Reading' as const,
          score: 100,
          maxScore: 100,
          timestamp: new Date()
        } : null;

        setUser({ 
          ...user, 
          points: user.points + 10,
          activityLog: newLog ? [...(user.activityLog || []), newLog] : user.activityLog
        });

        if (isLast) {
          confetti({ particleCount: 100, spread: 70 });
        }
      }
    } else {
      speak(`Not quite. ${question.explanation}`, 'feedback');
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);
    
    if (questionIdx < story.questions.length - 1) {
      setQuestionIdx(questionIdx + 1);
    } else if (storyIdx < STORIES.length - 1) {
      setStoryIdx(storyIdx + 1);
      setQuestionIdx(0);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="natural-card-heavy p-12 text-center space-y-6 bg-white"
      >
        <div className="w-24 h-24 bg-natural-accent rounded-full flex items-center justify-center text-white mx-auto shadow-xl transform rotate-12">
          <BookOpen size={48} className="fill-current" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-natural-text uppercase italic">Story Master!</h2>
          <p className="text-natural-primary font-bold">You read all the stories today!</p>
        </div>
        <button 
          onClick={() => {
            setFinished(false);
            setStoryIdx(0);
            setQuestionIdx(0);
          }}
          className="natural-button px-12"
        >
          Read Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="natural-card-heavy p-8 bg-natural-sidebar border-4 border-natural-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BookOpen className="w-8 h-8 text-natural-primary" />
            <h2 className="text-3xl font-black text-natural-text">{story.title}</h2>
          </div>
          <button 
            onClick={() => speak(story.text, 'story')}
            className={`p-3 rounded-full border-2 transition-all ${isReading === 'story' ? 'bg-natural-accent text-white border-natural-accent animate-pulse' : 'bg-white text-natural-primary border-natural-border hover:scale-110'}`}
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
        <p className="text-xl font-bold text-natural-text leading-relaxed bg-white p-8 rounded-3xl border-2 border-natural-border shadow-inner">
          "{story.text}"
        </p>
      </div>

      <div className="natural-card-heavy p-8 border-4 border-natural-accent space-y-6 bg-white">
        <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-natural-accent-dark">Quiz Time</span>
            <span className="text-[10px] font-black text-natural-text/40">Story {storyIdx + 1} • Question {questionIdx + 1}</span>
        </div>
        
        <h3 className="text-2xl font-black text-natural-text">{question.q}</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleChoice(idx)}
              className={`p-6 rounded-2xl text-left font-black text-lg transition-all border-4 ${
                selected === idx
                  ? idx === question.correct
                    ? 'bg-natural-primary text-white border-natural-primary'
                    : 'bg-red-500 text-white border-red-600'
                  : 'bg-natural-bg text-natural-text border-natural-border hover:border-natural-accent'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className={`p-6 rounded-3xl border-2 space-y-4 ${selected === question.correct ? 'bg-natural-primary/5 border-natural-primary/20' : 'bg-red-50 border-red-100'}`}
            >
              <div className="flex items-center gap-3">
                {selected === question.correct ? <Sparkles className="text-natural-primary" /> : <Lightbulb className="text-red-500" />}
                <p className={`font-black uppercase tracking-widest text-xs ${selected === question.correct ? 'text-natural-primary' : 'text-red-600'}`}>
                  {selected === question.correct ? 'Perfect!' : 'Look Closer'}
                </p>
              </div>
              <p className="text-sm font-bold text-natural-text/80 leading-relaxed italic">
                {question.explanation}
              </p>
              <button
                onClick={handleNext}
                className="natural-button w-full bg-natural-accent hover:bg-natural-accent-dark"
              >
                Next {questionIdx < story.questions.length - 1 ? 'Question' : 'Story'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
