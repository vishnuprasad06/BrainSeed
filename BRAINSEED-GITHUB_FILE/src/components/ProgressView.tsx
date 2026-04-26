import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { PartyPopper } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateSpeech } from '../services/geminiService';

export default function ProgressView() {
  const { user } = useApp();
  const [isCelebrating, setIsCelebrating] = useState(false);

  const stats = useMemo(() => {
    const logs = user?.activityLog || [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    // Last 7 days chart data
    const chartData = days.map((day, idx) => {
      // Find logs for this day in the last 7 days
      const dayLogs = logs.filter(log => {
        const d = new Date(log.timestamp);
        return d.getDay() === idx;
      });
      const xp = dayLogs.reduce((acc, curr) => acc + curr.score, 0);
      return { day, xp };
    });

    // Reorder so today is at the end
    const todayIdx = today.getDay();
    const orderedData = [];
    for (let i = 1; i <= 7; i++) {
        orderedData.push(chartData[(todayIdx + i) % 7]);
    }

    const totalQuizzes = logs.length;
    const avgScore = logs.length > 0 
      ? Math.round(logs.reduce((acc, curr) => acc + (curr.score/curr.maxScore), 0) / logs.length * 100)
      : 0;

    const bestDay = orderedData.reduce((prev, current) => (prev.xp > current.xp) ? prev : current, orderedData[0]);

    return {
      orderedData,
      totalQuizzes,
      avgScore,
      bestDay: bestDay.xp > 0 ? bestDay.day : 'N/A'
    };
  }, [user?.activityLog]);

  const handleCelebrate = async () => {
    if (isCelebrating) return;
    setIsCelebrating(true);
    const messages = [
      `Wow! Your brain is growing so fast! You earned ${user?.points} seeds so far! You're a total superstar!`,
      `Holy guacamole! Your learning streak is incredible! You've completed ${stats.totalQuizzes} activities already!`,
      `Twinkling stars! Your concentration score is ${stats.avgScore}%! That is absolutely amazing! Keep shining!`
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const audioData = await generateSpeech(randomMsg);
    if (audioData) {
      const audio = new Audio(audioData);
      audio.onended = () => setIsCelebrating(false);
      audio.play();
    } else {
      setIsCelebrating(false);
    }
  };

  return (
    <div className="space-y-8 h-full">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-natural-text">Learning Growth</h2>
          <p className="text-natural-primary font-bold">You are growing faster than a sunflower!</p>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={handleCelebrate}
            disabled={isCelebrating || !user}
            className={`bg-natural-accent text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-md hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100`}
          >
            <PartyPopper className={`w-5 h-5 ${isCelebrating ? 'animate-bounce' : ''}`} />
            {isCelebrating ? 'Celebrating...' : 'Celebrate Me!'}
          </button>
          <div className="bg-white p-4 rounded-2xl border-2 border-natural-border shadow-sm text-center font-bold">
            <p className="text-[10px] font-black text-natural-text/40 uppercase tracking-[0.1em]">Best Day</p>
            <p className="text-xl font-black text-natural-accent">{stats.bestDay}</p>
          </div>
        </div>
      </header>

      <div className="natural-card-heavy p-8 h-[350px]">
        <h4 className="text-xs font-black text-natural-text/40 uppercase tracking-widest mb-8 text-center">Seeds Earned This Week</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.orderedData}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#606C38" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#606C38" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDC9" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#283618', fontWeight: 700, fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
            />
            <Area 
              type="monotone" 
              dataKey="xp" 
              stroke="#606C38" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorXp)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="natural-card p-6 space-y-4">
          <h4 className="text-sm font-black text-natural-text flex items-center gap-2">
            <span className="w-3 h-3 bg-natural-primary rounded-full"></span>
            Concentration Score
          </h4>
          <p className="text-3xl font-black text-natural-text">{stats.avgScore}%</p>
          <p className="text-xs font-bold text-natural-text/60 italic">Based on your activity precision!</p>
        </section>

        <section className="natural-card p-6 space-y-4">
          <h4 className="text-sm font-black text-natural-text flex items-center gap-2">
            <span className="w-3 h-3 bg-natural-accent rounded-full"></span>
            Activities Completed
          </h4>
          <p className="text-3xl font-black text-natural-text">{stats.totalQuizzes}</p>
          <p className="text-xs font-bold text-natural-text/60 italic">You are a regular Einstein!</p>
        </section>
      </div>
    </div>
  );
}
