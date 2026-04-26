import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Sparkles, Send, Volume2, BookOpen, Compass, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { generateChatResponse, generateInteractiveStoryStep } from '../services/geminiService';

const PROMPTS = [
  "Write a story about a cat who discovered a secret map under its bed.",
  "What would happen if you woke up one morning and could fly like a bird?",
  "Tell a story about a lonely robot living in a garden full of flowers.",
  "Imagine you found a magical fountain in the middle of a forest. What does it do?",
  "Write a dialogue between a wise old tree and a busy little squirrel."
];

export default function CreativeWriting() {
  const { user, setUser } = useApp();
  const { speak, isReading } = useVoice();
  const [activeTab, setActiveTab] = useState<'write' | 'interactive'>('write');

  // "Write Your Own" State
  const [prompt, setPrompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [story, setStory] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // "Interactive Adventure" State
  const [adventureHistory, setAdventureHistory] = useState<any[]>([]);
  const [currentAdventureSnippet, setCurrentAdventureSnippet] = useState<string | null>(null);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [isAdventureEnding, setIsAdventureEnding] = useState(false);
  const [isGeneratingStep, setIsGeneratingStep] = useState(false);

  const handleFinishWrite = async () => {
    if (story.length < 50) return;
    setIsAnalyzing(true);
    
    try {
      const response = await generateChatResponse([
        { 
          id: '1', 
          sender: 'ai', 
          text: `You are a supportive writing teacher for a grade ${user?.grade} student. The student wrote this story: "${story}". Give a short, very encouraging feedback (max 3 sentences) and suggest one small improvement. Focus on creativity.`, 
          timestamp: new Date() 
        }
      ]);
      
      setFeedback(response);
      if (user) {
        const newLog = {
          id: Date.now().toString(),
          type: 'Writing' as const,
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
    } catch (error) {
      console.error("AI Error:", error);
      setFeedback("That's an amazing start to a story! Your imagination is wonderful.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAdventure = async () => {
    setIsGeneratingStep(true);
    setAdventureHistory([]);
    setIsAdventureEnding(false);
    
    const initialPrompt = `Start a brand new exciting adventure story for a young child named ${user?.name || 'Explorer'}. Introduce the setting and character, then offer 2 choices of what to do next.`;
    
    const response = await generateInteractiveStoryStep(initialPrompt, []);
    
    if (response) {
      setCurrentAdventureSnippet(response.storyText);
      setCurrentChoices(response.choices || []);
      setIsAdventureEnding(response.isEnding || false);
      setAdventureHistory([{ role: 'model', parts: [{ text: JSON.stringify(response) }] }]);
    } else {
       setCurrentAdventureSnippet("Oops, the magical book is closed right now. Try again!");
    }
    setIsGeneratingStep(false);
  };

  const chooseAdventureStep = async (choice: string) => {
    setIsGeneratingStep(true);
    const newHistory = [...adventureHistory, { role: 'user', parts: [{ text: `I choose: ${choice}` }] }];
    
    const response = await generateInteractiveStoryStep("Continue the story based on my choice.", newHistory);

    if (response) {
      setCurrentAdventureSnippet(response.storyText);
      setCurrentChoices(response.choices || []);
      setIsAdventureEnding(response.isEnding || false);
      setAdventureHistory([...newHistory, { role: 'model', parts: [{ text: JSON.stringify(response) }] }]);
      
      if (response.isEnding && user) {
        setUser({ ...user, points: user.points + 20 });
      }
    }
    setIsGeneratingStep(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-natural-text flex items-center gap-2">
            <PenTool className="text-natural-accent" />
            Story Maker
          </h2>
          <p className="text-natural-primary font-bold">Unleash your imagination!</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-2xl border-2 border-natural-border shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('write')}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-black transition-all ${
            activeTab === 'write' ? 'bg-natural-accent text-white shadow-md' : 'text-natural-text/60 hover:bg-natural-bg'
          }`}
        >
          <BookOpen className="w-5 h-5" /> Write Your Own
        </button>
        <button
          onClick={() => {
            setActiveTab('interactive');
            if (!currentAdventureSnippet) startAdventure();
          }}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-black transition-all ${
            activeTab === 'interactive' ? 'bg-indigo-500 text-white shadow-md' : 'text-natural-text/60 hover:bg-natural-bg'
          }`}
        >
          <Compass className="w-5 h-5" /> Interactive Adventure
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'write' ? (
          <motion.div
            key="write"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <section className="natural-card p-6 bg-natural-sidebar space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-natural-text/40">Today's Prompt</h4>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const next = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
                      setPrompt(next);
                      setStory('');
                      setFeedback(null);
                    }}
                    className="text-xs font-black text-natural-accent uppercase tracking-widest hover:underline"
                  >
                    New Prompt
                  </button>
                  <button 
                    onClick={() => speak(prompt, 'prompt')}
                    className={`p-2 rounded-full ${isReading === 'prompt' ? 'bg-natural-accent text-white' : 'bg-white text-natural-accent border border-natural-border'}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xl font-black text-natural-text leading-tight">{prompt}</p>
            </section>

            {!feedback ? (
              <div className="space-y-4">
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Once upon a time..."
                  className="w-full h-64 p-6 rounded-3xl border-4 border-natural-border focus:border-natural-primary focus:ring-0 outline-none font-bold text-natural-text leading-relaxed resize-none transition-all shadow-inner bg-white"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-natural-text/40">
                    {story.length} characters (Needs at least 50 to finish)
                  </p>
                  <button
                    onClick={handleFinishWrite}
                    disabled={story.length < 50 || isAnalyzing}
                    className="bg-natural-primary text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="animate-spin w-5 h-5" />
                        Glimmering...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Finished My Story!
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="natural-card-heavy p-8 space-y-6 text-center border-natural-accent"
              >
                <div className="w-20 h-20 bg-natural-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-10 h-10 text-natural-accent" />
                </div>
                <h3 className="text-2xl font-black text-natural-text">You're a Star Writer!</h3>
                <p className="text-lg font-bold text-natural-text/80 leading-relaxed italic pr-12 pl-12">
                  "{feedback}"
                </p>
                <div className="flex justify-center gap-4 pt-4">
                  <button 
                    onClick={() => speak(feedback, 'feedback')}
                    className={`px-6 py-3 rounded-2xl font-black border-2 transition-all flex items-center gap-2 ${isReading === 'feedback' ? 'bg-natural-accent text-white border-natural-accent' : 'bg-white border-natural-border text-natural-accent hover:bg-natural-sidebar'}`}
                  >
                    <Volume2 className="w-5 h-5" />
                    Listen
                  </button>
                  <button 
                    onClick={() => {
                      setStory('');
                      setFeedback(null);
                      setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
                    }}
                    className="bg-natural-primary text-white px-8 py-3 rounded-2xl font-black shadow-md hover:scale-105 transition-all"
                  >
                    Write Another!
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="interactive"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {isGeneratingStep && !currentAdventureSnippet ? (
              <div className="h-64 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-natural-border text-indigo-500">
                 <Sparkles className="animate-spin w-12 h-12 mb-4" />
                 <p className="font-black text-lg">Conjuring your adventure...</p>
              </div>
            ) : currentAdventureSnippet ? (
              <div className="bg-white p-8 rounded-3xl border-4 border-indigo-100 shadow-sm space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 blur-xl opacity-50"></div>
                
                <div className="flex justify-between items-start">
                   <p className="text-xl font-bold leading-relaxed text-natural-text/90">
                     {currentAdventureSnippet}
                   </p>
                   <button 
                      onClick={() => speak(currentAdventureSnippet, 'adventure')}
                      className={`ml-4 p-3 rounded-full flex-shrink-0 ${isReading === 'adventure' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors'}`}
                    >
                      <Volume2 className="w-5 h-5" />
                   </button>
                </div>

                {!isAdventureEnding && currentChoices.length > 0 && (
                  <div className="space-y-4 pt-4 border-t-2 border-indigo-50">
                    <h4 className="text-sm font-black uppercase text-indigo-400 tracking-widest">What do you do next?</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                       {currentChoices.map((choice, idx) => (
                         <button
                           key={idx}
                           onClick={() => chooseAdventureStep(choice)}
                           disabled={isGeneratingStep}
                           className="group text-left p-5 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm focus:outline-none focus:ring-4 ring-indigo-500/20 disabled:opacity-50 flex items-center justify-between"
                         >
                            <span className="font-bold text-natural-text group-hover:text-indigo-900 leading-snug pr-4">{choice}</span>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-400 group-hover:bg-indigo-400 group-hover:text-white transition-colors shrink-0">
                               <ChevronRight className="w-5 h-5" />
                            </div>
                         </button>
                       ))}
                    </div>
                  </div>
                )}
                
                {isGeneratingStep && currentAdventureSnippet && (
                   <div className="pt-4 text-center text-indigo-400 font-bold flex items-center justify-center gap-2">
                     <Sparkles className="animate-spin w-5 h-5" /> Gathering magic for the next step...
                   </div>
                )}

                {isAdventureEnding && (
                   <div className="pt-6 border-t-2 border-indigo-50 text-center space-y-6">
                     <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-500">
                       <Compass className="w-10 h-10" />
                     </div>
                     <h3 className="text-2xl font-black text-indigo-900">The End</h3>
                     <p className="text-indigo-600 font-bold">+20 XP for completing the adventure!</p>
                     <button
                       onClick={startAdventure}
                       className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black shadow-md hover:scale-105 transition-all"
                     >
                       Start A New Adventure
                     </button>
                   </div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
