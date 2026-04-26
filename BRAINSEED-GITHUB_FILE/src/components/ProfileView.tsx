import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Heart, Save, CheckCircle, Smartphone, Globe, Shield, Calculator, Beaker, BookOpen, Star, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Grade, Interest } from '../types';

const INTERESTS: { id: Interest; label: string; icon: React.ReactNode }[] = [
  { id: 'Math', label: 'Math', icon: <Calculator size={32} /> },
  { id: 'Science', label: 'Science', icon: <Beaker size={32} /> },
  { id: 'Stories', label: 'Reading', icon: <BookOpen size={32} /> }
];

export default function ProfileView() {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState<Grade>(user?.grade || '1');
  const [interests, setInterests] = useState<Interest[]>(user?.interests || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleInterest = (id: Interest) => {
    if (interests.includes(id)) {
      setInterests(interests.filter(i => i !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  const handleSave = async () => {
    if (interests.length === 0 || !name.trim()) return;
    
    setIsSaving(true);
    try {
      await setUser({
        ...user!,
        name,
        grade,
        interests
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <header className="bg-white p-10 rounded-[40px] border-2 border-natural-border shadow-sm flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-natural-accent rounded-xl flex items-center justify-center text-white text-xl"><User size={20} /></div>
            <h1 className="text-3xl font-black text-natural-text">My Profile</h1>
          </div>
          <p className="text-natural-primary font-bold">Customize your personal learning experience!</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-emerald-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Profile Saved!
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Details */}
          <section className="bg-white rounded-[40px] p-8 border-2 border-natural-border space-y-8">
            <div className="space-y-6">
               <h3 className="text-lg font-black text-natural-text flex items-center gap-3">
                 <User className="w-5 h-5 text-natural-primary" />
                 Personal Details
               </h3>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-natural-text/40 uppercase tracking-widest ml-1">Learning Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-natural-bg border-2 border-natural-border p-4 rounded-2xl font-black text-natural-text focus:outline-none focus:border-natural-primary"
                  />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-natural-text/40 uppercase tracking-widest ml-1">Current Grade Level</label>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-natural-primary uppercase tracking-widest mb-3">Primary (1-3)</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['1', '2', '3'].map((g) => (
                          <button
                            key={g}
                            onClick={() => setGrade(g as Grade)}
                            className={`p-3 rounded-2xl text-lg font-black transition-all border-2 ${
                              grade === g 
                                ? 'bg-natural-primary text-white border-natural-primary shadow-md' 
                                : 'bg-white text-natural-text border-natural-border shadow-sm hover:bg-natural-bg'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-natural-accent-dark uppercase tracking-widest mb-3">Middle (4-7)</p>
                      <div className="grid grid-cols-4 gap-3">
                        {['4', '5', '6', '7'].map((g) => (
                          <button
                            key={g}
                            onClick={() => setGrade(g as Grade)}
                            className={`p-3 rounded-2xl text-lg font-black transition-all border-2 ${
                              grade === g 
                                ? 'bg-natural-accent text-white border-natural-accent shadow-md' 
                                : 'bg-white text-natural-text border-natural-border shadow-sm hover:bg-natural-bg'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">Senior (8-10)</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['8', '9', '10'].map((g) => (
                          <button
                            key={g}
                            onClick={() => setGrade(g as Grade)}
                            className={`p-3 rounded-2xl text-lg font-black transition-all border-2 ${
                              grade === g 
                                ? 'bg-orange-500 text-white border-orange-600 shadow-md' 
                                : 'bg-white text-natural-text border-natural-border shadow-sm hover:bg-natural-bg'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* Interests */}
          <section className="bg-white rounded-[40px] p-8 border-2 border-natural-border space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-black text-natural-text flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-500" />
                Interests & Topics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {INTERESTS.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => toggleInterest(i.id)}
                    className={`p-6 rounded-[32px] border-4 transition-all flex flex-col items-center gap-3 ${
                      interests.includes(i.id)
                        ? 'bg-natural-accent border-white text-white shadow-xl scale-105'
                        : 'bg-white border-natural-border text-natural-text hover:border-natural-accent/30'
                    }`}
                  >
                    <span className="text-4xl">{i.icon}</span>
                    <span className="font-black text-xs uppercase tracking-widest">{i.label}</span>
                  </button>
                ))}
              </div>

              {interests.length === 0 && (
                <p className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                  Pick at least one fun topic!
                </p>
              )}
            </div>
          </section>

          {/* Security / Account */}
          <section className="bg-white rounded-[40px] p-8 border-2 border-natural-border space-y-6 lg:col-span-2">
            <h3 className="text-lg font-black text-natural-text flex items-center gap-3">
              <Shield className="w-5 h-5 text-natural-primary" />
               Account Overview
            </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-natural-bg rounded-2xl border border-natural-border flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-500"><Globe size={20} /></div>
                <div>
                   <p className="text-[10px] font-black text-natural-text/40 uppercase tracking-tighter">Language</p>
                   <p className="text-sm font-bold text-natural-text">English (En)</p>
                </div>
              </div>
              
              <div className="p-4 bg-natural-bg rounded-2xl border border-natural-border flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-yellow-500"><Star size={20} /></div>
                <div>
                   <p className="text-[10px] font-black text-natural-text/40 uppercase tracking-tighter">Experience</p>
                   <p className="text-sm font-bold text-natural-text">{user?.points} XP Points</p>
                </div>
              </div>

              <div className="p-4 bg-natural-bg rounded-2xl border border-natural-border flex items-center gap-4 opacity-50 grayscale cursor-not-allowed">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Smartphone size={20} /></div>
                <div>
                   <p className="text-[10px] font-black text-natural-text/40 uppercase tracking-tighter">Device Sync</p>
                   <p className="text-sm font-bold text-natural-text text-rose-500">Not Linked</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving || interests.length === 0 || !name.trim()}
          className="w-full mt-8 bg-natural-primary text-white p-6 rounded-[32px] text-xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-natural-primary/90 disabled:opacity-50 transition-all"
        >
          {isSaving ? <Loader2 className="animate-spin text-2xl w-6 h-6" /> : <Save className="w-6 h-6" />}
          Update Profile Seed
        </motion.button>
      </div>
    </div>
  );
}
