import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Sparkles, Book, Brain, Rocket } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Grade, Language, Interest, UserProfile } from '../types';
import { auth } from '../lib/firebase';

export default function Setup() {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  
  const [grade, setGrade] = useState<Grade>(user?.grade || '1');
  const [lang, setLang] = useState<Language>(user?.language || 'English');
  const [interests, setInterests] = useState<Interest[]>([]);

  const toggleInterest = (interest: Interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const profile: UserProfile = {
        name: user?.name || auth.currentUser?.displayName || 'Adventurer',
        email: auth.currentUser?.email || undefined,
        grade,
        language: lang,
        interests,
        points: user?.points || 0,
        currentStreak: user?.currentStreak || 1,
        lastLoginDate: user?.lastLoginDate || today
      };
      await setUser(profile);
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg p-6">
      <div className="max-w-xl mx-auto space-y-12 py-8">
        <header className="space-y-2">
          <h1 className="text-4xl text-natural-text tracking-tight">Tell us about you!</h1>
          <p className="text-natural-primary font-bold flex items-center gap-2">Let's personalize your learning adventure <Rocket className="w-5 h-5 text-natural-accent" /></p>
        </header>

        <section className="space-y-6">
          <h3 className="font-black text-natural-text/60 uppercase tracking-widest text-xs">What is your grade?</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-natural-primary uppercase tracking-widest mb-3">Primary (Foundational)</p>
              <div className="grid grid-cols-3 gap-4">
                {['1', '2', '3'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g as Grade)}
                    className={`p-4 rounded-2xl text-xl font-black transition-all border-4 ${
                      grade === g 
                        ? 'bg-natural-primary text-white border-natural-primary scale-105 shadow-xl' 
                        : 'bg-white text-natural-text border-natural-border shadow-sm hover:bg-natural-sidebar'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-natural-accent-dark uppercase tracking-widest mb-3">Middle (Discovery)</p>
              <div className="grid grid-cols-4 gap-4">
                {['4', '5', '6', '7'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g as Grade)}
                    className={`p-4 rounded-2xl text-xl font-black transition-all border-4 ${
                      grade === g 
                        ? 'bg-natural-accent text-white border-natural-accent scale-105 shadow-xl' 
                        : 'bg-white text-natural-text border-natural-border shadow-sm hover:bg-natural-sidebar'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Senior (Knowledge)</p>
              <div className="grid grid-cols-3 gap-4">
                {['8', '9', '10'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g as Grade)}
                    className={`p-4 rounded-2xl text-xl font-black transition-all border-4 ${
                      grade === g 
                        ? 'bg-orange-500 text-white border-orange-600 scale-105 shadow-xl' 
                        : 'bg-white text-natural-text border-natural-border shadow-sm hover:bg-natural-sidebar'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-black text-natural-text/60 uppercase tracking-widest text-xs">Preferred Language</h3>
          <div className="grid grid-cols-2 gap-4">
            {['English', 'Kannada'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l as Language)}
                className={`p-5 rounded-2xl font-black transition-all border-4 ${
                  lang === l 
                    ? 'bg-natural-accent text-white border-natural-accent shadow-lg' 
                    : 'bg-white text-natural-text border-natural-border shadow-sm hover:bg-natural-sidebar'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-black text-natural-text/60 uppercase tracking-widest text-xs">Pick some fun topics!</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'Math', icon: <Brain />, color: 'bg-[#E9EDC9] text-natural-primary' },
              { id: 'Science', icon: <Sparkles />, color: 'bg-[#FEFAE0] text-natural-accent-dark' },
              { id: 'Stories', icon: <Book />, color: 'bg-orange-50 text-orange-600' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleInterest(item.id as Interest)}
                className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border-4 ${
                  interests.includes(item.id as Interest)
                    ? 'border-natural-accent scale-105 bg-white shadow-lg'
                    : 'border-transparent bg-white shadow-sm opacity-60 grayscale'
                }`}
              >
                <div className={`p-4 rounded-2xl ${item.color}`}>
                  {item.icon}
                </div>
                <span className="font-black text-xs uppercase tracking-tight">{item.id}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <button
            onClick={handleSave}
            disabled={interests.length === 0 || isSaving}
            className="w-full bg-natural-primary text-white p-6 rounded-[32px] text-xl font-black flex items-center justify-center gap-2 shadow-xl hover:bg-natural-primary/90 active:scale-95 transition-all mt-12 disabled:opacity-50 disabled:scale-100 disabled:grayscale"
          >
            {isSaving ? 'Saving...' : 'Save & Start Learning'}
            <ChevronRight className="w-7 h-7" />
          </button>
          
          {interests.length === 0 && (
            <p className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
              Pick at least one fun topic to start!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
