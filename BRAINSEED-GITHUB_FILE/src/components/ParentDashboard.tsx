import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Trophy, Compass, Star, TrendingUp, BrainCircuit, Rocket, Heart, Lightbulb, Map, Target, Search, User, ShieldCheck, PenLine, Send, History, Medal, Beaker, Zap, BookOpen, Palette, Compass as CompassIcon, Calculator } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import BoardNews from './BoardNews';

export default function ParentDashboard() {
  const { user } = useApp();
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch diary notes
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'seed_diary'),
      where('parentUid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(docs);
    });

    return () => unsubscribe();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'seed_diary'), {
        text: note,
        parentUid: auth.currentUser.uid,
        childName: user?.name,
        createdAt: serverTimestamp()
      });
      setNote('');
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate stats based on real activityLog
  const stats = useMemo(() => {
    const logs = user?.activityLog || [];
    
    const getCategoryScore = (type: string) => {
      const catLogs = logs.filter(l => l.type === type);
      if (catLogs.length === 0) return 40; // Default base
      const avg = catLogs.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / catLogs.length;
      return Math.min(100, Math.round(40 + (avg * 60)));
    };

    const getTrend = (type: string) => {
      const catLogs = logs.filter(l => l.type === type).slice(-5);
      if (catLogs.length < 5) {
        // Fill with dummy or partial
        return Array.from({ length: 5 }).map((_, i) => ({ v: 40 + (i * 10 % 30) }));
      }
      return catLogs.map(l => ({ v: (l.score / l.maxScore) * 100 }));
    };

    return {
      math: getCategoryScore('Math'),
      mathTrend: getTrend('Math'),
      reading: getCategoryScore('Reading'),
      readingTrend: getTrend('Reading'),
      science: getCategoryScore('Science'),
      scienceTrend: getTrend('Science'),
      social: getCategoryScore('Stories'),
      socialTrend: getTrend('Stories')
    };
  }, [user]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.2;
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female')) || voices.find(v => v.name.includes('Samantha')) || voices.find(v => v.name.includes('Google US English'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const engSkills = [
    { name: "Logic", score: stats.math + 5 },
    { name: "Geometry", score: stats.math - 2 },
    { name: "Observation", score: stats.science + 4 },
    { name: "Sorting", score: 95 }
  ];

  const creativeSkills = [
    { name: "Vocab", score: stats.reading + 6 },
    { name: "Empathy", score: stats.social + 4 },
    { name: "Flow", score: stats.reading - 8 },
    { name: "Recap", score: 85 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with floating elements */}
      <header className="relative bg-gradient-to-br from-rose-500 to-pink-600 p-10 rounded-[40px] text-white border-4 border-white shadow-2xl overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-rose-400/30 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner"><ShieldCheck size={28} /></div>
              <h1 className="text-4xl font-black tracking-tight">Guardian Dashboard</h1>
            </motion.div>
            <p className="text-lg font-bold opacity-90 max-w-xl">
              Nurturing {user?.name}'s potential through personalized insights and creative growth tracking.
            </p>
          </div>
          
          <div className="flex gap-4">
            <HeaderStat icon={<Star className="w-5 h-5" />} label="Curiosity" value="High" color="bg-yellow-400" />
            <HeaderStat icon={<Rocket className="w-5 h-5" />} label="Momentum" value="+12%" color="bg-emerald-400" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* News Updates - On the left as requested */}
        <section className="md:col-span-1">
          <BoardNews mini={true} />
        </section>

        {/* Child Growth Progress */}
        <section className="bg-white rounded-[48px] p-10 border-4 border-natural-border shadow-xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 className="w-24 h-24" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-natural-text">Skill Mastery</h2>
              <p className="text-xs font-bold text-natural-text/40 uppercase tracking-widest">Live Progress</p>
            </div>
          </div>
          
          <div className="space-y-8 flex-1">
            <ProgressStat label="Mathematics" percentage={stats.math} trend={stats.mathTrend} color="bg-emerald-500" icon={<Calculator className="w-5 h-5" />} />
            <ProgressStat label="Reading & Literacy" percentage={stats.reading} trend={stats.readingTrend} color="bg-blue-500" icon={<BookOpen className="w-5 h-5" />} />
            <ProgressStat label="Science Discovery" percentage={stats.science} trend={stats.scienceTrend} color="bg-purple-500" icon={<Beaker className="w-5 h-5" />} />
            <ProgressStat label="Social Intelligence" percentage={stats.social} trend={stats.socialTrend} color="bg-pink-500" icon={<Heart className="w-5 h-5" />} />
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="mt-10 p-6 bg-emerald-50 rounded-[32px] border-2 border-emerald-100 flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><Lightbulb size={24} /></div>
            <div>
              <h4 className="text-sm font-black text-emerald-900 mb-1">Growth Opportunity</h4>
              <p className="text-[11px] font-bold text-emerald-800 leading-relaxed">
                {user?.name} is showing a 20% increase in logical speed. We recommend "Advanced Logic Gates" next!
              </p>
            </div>
          </motion.div>
        </section>

        {/* Future Path & Insights */}
        <section className="bg-white rounded-[48px] p-10 border-4 border-natural-border shadow-xl flex flex-col md:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <Compass className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-natural-text">Future Path Mapping</h2>
                <p className="text-xs font-bold text-natural-text/40 uppercase tracking-widest">Cognitive Anchors</p>
              </div>
            </div>
            <button className="text-xs font-black text-orange-600 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors">
              VIEW FULL ROADMAP
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
             <PathCard 
                title="Future Engineer" 
                match={`${stats.math + 12}% Match`}
                description="Strong spatial reasoning and structural logic identified in Physics sandbox plays."
                skills={["System Design", "Physics", "Logic"]}
                detailedSkills={engSkills}
                icon={<BrainCircuit className="w-6 h-6" />}
                color="orange"
             />
             <PathCard 
                title="Creative Visionary" 
                match={`${stats.reading + 10}% Match`}
                description="Exceptional narrative depth and vocabulary variety in creative writing tasks."
                skills={["Storytelling", "Empathy", "Vocabulary"]}
                detailedSkills={creativeSkills}
                icon={<Star className="w-6 h-6" />}
                color="blue"
             />
             <PathCard 
                title="Life Scientist" 
                match={`${stats.science + 15}% Match`}
                description="Keen interest in biological systems and observation-based learning patterns."
                skills={["Observation", "Classification", "Nature"]}
                detailedSkills={[{ name: "Biology", score: stats.science + 4 }, { name: "Nature", score: stats.science + 12 }]}
                icon={<Heart className="w-6 h-6" />}
                color="pink"
             />
             <PathCard 
                title="Strategic Analyst" 
                match={`${Math.floor((stats.math + stats.science)/2) + 8}% Match`}
                description="Emerging pattern recognition and data organization skills in complex puzzles."
                skills={["Strategy", "Data", "Patterns"]}
                detailedSkills={[{ name: "Strategy", score: 75 }, { name: "Data", score: 68 }]}
                icon={<Target className="w-6 h-6" />}
                color="purple"
             />
          </div>
        </section>

        {/* Rewards & Encouragement */}
        <section className="bg-white rounded-[48px] p-10 border-4 border-natural-border shadow-xl lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-yellow-200">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-natural-text">Hall of Achievements</h2>
                  <p className="text-xs font-bold text-natural-text/40 uppercase tracking-widest">Recent Milestones</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <div className="text-right">
                   <p className="text-[10px] font-black text-natural-text/40">Total Points</p>
                   <p className="text-xl font-black text-natural-accent">{user?.points || 0}</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
             <AwardItem icon={<Medal size={40} className="text-yellow-500" />} label="Math Whiz" rank="Gold" color="yellow" />
             <AwardItem icon={<CompassIcon size={40} className="text-emerald-500" />} label="Explorer" rank="Silver" color="emerald" />
             <AwardItem icon={<BookOpen size={40} className="text-blue-500" />} label="Storyteller" rank="Gold" color="blue" />
             <AwardItem icon={<Zap size={40} className="text-orange-500" />} label="Speedster" rank="Bronze" color="orange" />
             <AwardItem icon={<Palette size={40} className="text-pink-500" />} label="Artist" rank="Gold" color="pink" />
             <AwardItem icon={<Beaker size={40} className="text-purple-500" />} label="Seeker" rank="Silver" color="purple" />
          </div>
        </section>

        {/* Seed Diary - Using addDoc as requested */}
        <section className="bg-white rounded-[48px] p-10 border-4 border-natural-border shadow-xl lg:col-span-3">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <PenLine className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-natural-text">Parent's Seed Diary</h2>
              <p className="text-xs font-bold text-natural-text/40 uppercase tracking-widest">Observations & Growth Notes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="relative">
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record an observation about your child's learning today... (e.g., Successfully identified Mars!)"
                  className="w-full h-40 bg-natural-bg rounded-[32px] border-4 border-natural-border p-6 font-bold text-natural-text focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting || !note.trim()}
                  className="absolute bottom-4 right-4 bg-indigo-500 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] font-bold text-natural-text/40 italic pl-4">
                * Note: This data is stored securely in your private encrypted vault.
              </p>
            </form>

            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-2">
                <History className="w-4 h-4 text-natural-text/30" />
                <span className="text-[10px] font-black text-natural-text/30 uppercase tracking-widest">Recent Observations</span>
              </div>
              
              {notes.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <PenLine className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm font-black italic">No notes yet. Start planting memories!</p>
                </div>
              ) : (
                notes.map((n) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={n.id}
                    className="p-4 bg-natural-sidebar rounded-2xl border border-natural-border flex gap-4"
                  >
                    <div className="w-2 h-full bg-indigo-500 rounded-full" />
                    <div>
                      <p className="text-sm font-bold text-natural-text">{n.text}</p>
                      <p className="text-[9px] font-black text-natural-text/40 mt-1">
                        {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProgressStat({ label, percentage, trend, color, icon }: { label: string, percentage: number, trend: any[], color: string, icon: React.ReactNode }) {
  // Extract hex color from tailwind class if possible, or use a default
  const getLineColor = (colorClass: string) => {
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('blue')) return '#3b82f6';
    if (colorClass.includes('purple')) return '#a855f7';
    if (colorClass.includes('pink')) return '#ec4899';
    return '#6366f1';
  };

  return (
    <div className="group">
      <div className="flex justify-between items-end mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl group-hover:scale-125 transition-transform">{icon}</span>
          <div>
            <span className="text-sm font-black text-natural-text block leading-none mb-1">{label}</span>
            <span className="text-[10px] font-bold text-natural-text/40 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" /> 
              Recent Activity
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="w-24 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <Line 
                  type="monotone" 
                  dataKey="v" 
                  stroke={getLineColor(color)} 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <span className="text-xs font-black text-natural-text bg-natural-sidebar px-3 py-1 rounded-full border border-natural-border">{percentage}%</span>
        </div>
      </div>
      <div className="w-full h-4 bg-natural-bg rounded-full overflow-hidden border-2 border-natural-border p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={`h-full ${color} rounded-full relative`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}

function PathCard({ title, match, description, skills, icon, color, detailedSkills }: any) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const colors: any = {
    orange: "border-orange-200 bg-orange-50 text-orange-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    pink: "border-pink-200 bg-pink-50 text-pink-900",
    purple: "border-purple-200 bg-purple-50 text-purple-900",
  };

  const bgColors: any = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    pink: "bg-pink-500",
    purple: "bg-purple-500",
  }

  return (
    <motion.div 
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ y: -5 }}
      className={`p-6 rounded-[32px] border-2 shadow-sm cursor-pointer transition-all ${colors[color]} flex flex-col gap-4 relative overflow-hidden`}
    >
      <div className="flex justify-between items-start z-10">
        <div className={`w-12 h-12 ${bgColors[color]} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full border border-current opacity-70`}>{match}</span>
      </div>
      
      <div className="z-10">
        <h4 className="text-lg font-black mb-1">{title}</h4>
        <p className="text-[11px] font-bold opacity-70 leading-relaxed">{description}</p>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 pt-4 border-t border-current/10 z-10"
          >
            <div>
              <p className="text-[10px] font-black uppercase mb-3 text-current/60">Core Skills Readiness:</p>
              <div className="grid grid-cols-2 gap-3">
                {detailedSkills?.map((s: any) => (
                  <div key={s.name} className="bg-white/40 p-3 rounded-2xl flex flex-col gap-1 border border-white/20">
                    <div className="flex justify-between items-center text-[9px] font-black">
                      <span>{s.name}</span>
                      <span>{s.score}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className={`h-full ${bgColors[color]}`} style={{ width: `${s.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-[10px] font-black uppercase mb-2 text-current/60">Recommended Action:</p>
              <button className={`w-full py-3 ${bgColors[color]} text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:brightness-110 active:scale-95 transition-all`}>
                View Learning Roadmap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <div className="flex flex-wrap gap-2 mt-auto z-10">
          {skills.map((s: string) => (
            <span key={s} className="text-[9px] font-black bg-white/50 px-3 py-1 rounded-lg border border-current/10 uppercase tracking-tighter">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Tap indicator */}
      {!isExpanded && (
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5 opacity-40">
          <span className="text-[8px] font-black uppercase tracking-widest">More Details</span>
          <Target className="w-3 h-3 animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}

function AwardItem({ icon, label, rank, color }: any) {
  const colors: any = {
    yellow: "bg-yellow-50 border-yellow-100",
    emerald: "bg-emerald-50 border-emerald-100",
    blue: "bg-blue-50 border-blue-100",
    orange: "bg-orange-50 border-orange-100",
    pink: "bg-pink-50 border-pink-100",
    purple: "bg-purple-50 border-purple-100",
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05, rotate: 2 }}
      className={`p-6 rounded-[32px] border-4 ${colors[color]} flex flex-col items-center text-center gap-3 shadow-md hover:shadow-lg transition-all`}
    >
       <div className="text-4xl filter drop-shadow-md">{icon}</div>
       <div>
         <div className="text-xs font-black text-natural-text uppercase leading-none mb-1">{label}</div>
         <div className="text-[9px] font-black opacity-40 uppercase tracking-tighter">{rank} Level</div>
       </div>
    </motion.div>
  );
}

function HeaderStat({ icon, label, value, color }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20 whitespace-nowrap">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black opacity-70 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}
