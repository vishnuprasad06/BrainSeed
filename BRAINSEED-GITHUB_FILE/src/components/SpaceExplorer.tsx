import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Star, Info, Volume2, Globe, Sparkles, ChevronRight, ChevronLeft, Sun, Moon, Cloud, Zap, Disc } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import confetti from 'canvas-confetti';

interface CelestialBody {
  id: string;
  name: string;
  type: string;
  image: React.ReactNode;
  description: string;
  funFact: string;
  distanceFromSun?: string;
}

const CELESTIAL_BODIES_JUNIOR: CelestialBody[] = [
  {
    id: 'sun',
    name: 'The Sun',
    type: 'Star',
    image: <Sun size={150} className="text-yellow-400 fill-current" />,
    description: 'The Sun is the center of our Solar System. It is a massive ball of glowing gas that provides energy for all life on Earth.',
    funFact: 'Over one million Earths could fit inside the Sun!',
    distanceFromSun: '0 km'
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'Planet',
    image: <Globe size={150} className="text-blue-500 fill-current" />,
    description: 'Earth is our home planet and the only world known to support life.',
    funFact: 'About 71% of Earth\'s surface is covered by water.',
    distanceFromSun: '150 million km'
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Planet',
    image: <CircleFilled size={150} className="text-red-500" />,
    description: 'Mars is known as the Red Planet because of iron oxide on its surface.',
    funFact: 'Mars is home to the tallest mountain in the solar system, Olympus Mons.',
    distanceFromSun: '228 million km'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Planet',
    image: <CircleFilled size={160} className="text-orange-400" />,
    description: 'Jupiter is a gas giant and the largest planet in our solar system.',
    funFact: 'Jupiter has a "Great Red Spot" which is a storm that has lasted for hundreds of years!',
    distanceFromSun: '778 million km'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'Planet',
    image: <Disc size={160} className="text-yellow-200" />,
    description: 'Saturn is famous for its stunning and complex system of rings.',
    funFact: 'Saturn\'s rings are made mostly of ice and dust.',
    distanceFromSun: '1.4 billion km'
  }
];

const CELESTIAL_BODIES_SENIOR: CelestialBody[] = [
  {
    id: 'blackhole',
    name: 'Black Hole',
    type: 'Singularity',
    image: <CircleFilled size={150} className="text-gray-900 border-4 border-indigo-500 shadow-[0_0_80px_rgba(99,102,241,0.8)] rounded-full" />,
    description: 'A region of spacetime where gravity is so strong that nothing, not even light, can escape from it.',
    funFact: 'The closest known black hole is "Gaia BH1", which is about 1,560 light-years away from Earth.'
  },
  {
    id: 'supernova',
    name: 'Supernova',
    type: 'Stellar Explosion',
    image: <Sparkles size={160} className="text-yellow-300 fill-current animate-pulse shadow-[0_0_60px_rgba(253,224,71,0.6)]" />,
    description: 'A powerful and luminous stellar explosion. This transient astronomical event occurs during the last evolutionary stages of a massive star or when a white dwarf is triggered into runaway nuclear fusion.',
    funFact: 'A single supernova can briefly outshine an entire galaxy!'
  },
  {
    id: 'quasar',
    name: 'Quasar',
    type: 'Active Galactic Nucleus',
    image: <Zap size={160} className="text-cyan-400 fill-current" />,
    description: 'An extremely luminous active galactic nucleus, in which a supermassive black hole with mass ranging from millions to billions of solar masses is surrounded by a gaseous accretion disk.',
    funFact: 'Quasars are among the brightest constantly emitting objects in the universe.'
  },
  {
    id: 'darkmatter',
    name: 'Dark Matter',
    type: 'Hypothetical Matter',
    image: <Cloud size={160} className="text-indigo-900/50" />,
    description: 'A hypothetical form of matter thought to account for approximately 85% of the matter in the universe. It does not interact with the electromagnetic field.',
    funFact: 'Even though we cannot see dark matter, we know it exists because of its gravitational effect on galaxies!'
  }
];

function CircleFilled(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export default function SpaceExplorer() {
  const { user, setUser } = useApp();
  const { speak, isReading } = useVoice();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showFact, setShowFact] = useState(false);

  const grade = parseInt(user?.grade || '1');
  const bodies = grade >= 6 ? CELESTIAL_BODIES_SENIOR : CELESTIAL_BODIES_JUNIOR;
  const body = bodies[currentIdx];

  const handleNext = () => {
    setShowFact(false);
    setCurrentIdx((prev) => (prev + 1) % bodies.length);
  };

  const handlePrev = () => {
    setShowFact(false);
    setCurrentIdx((prev) => (prev - 1 + bodies.length) % bodies.length);
  };

  const collectSeeds = () => {
    if (showFact) return;
    setShowFact(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 }
    });
    if (user) {
      const newLog = {
        id: Date.now().toString(),
        type: 'Science' as const,
        score: 100,
        maxScore: 100,
        timestamp: new Date()
      };
      setUser({
        ...user,
        points: user.points + 15,
        activityLog: [...(user.activityLog || []), newLog]
      });
    }
    speak(`Fun Fact! ${body.funFact}`, 'fact');
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-natural-text flex items-center gap-3">
            <Rocket className="text-natural-accent transform -rotate-45" />
            Cosmic Explorer
          </h2>
          <p className="text-natural-primary font-bold">Discover our Solar System & beyond!</p>
        </div>
      </header>

      <section className="relative h-[500px] bg-slate-900 rounded-[3rem] border-8 border-natural-border shadow-2xl overflow-hidden flex items-center justify-center">
        {/* Galaxy background effect */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={body.id}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-10 text-center space-y-8"
          >
            <div className="text-[12rem] filter drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] select-none">
              {body.image}
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border-2 border-white/20 inline-block">
              <h3 className="text-4xl font-black text-white">{body.name}</h3>
              <p className="text-natural-accent font-black uppercase tracking-widest text-xs mt-1">{body.type}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button 
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all z-20"
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all z-20"
        >
          <ChevronRight size={32} />
        </button>

        {/* Info Overlay */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-20">
          <div className="max-w-md bg-white/95 rounded-3xl p-6 shadow-xl border-4 border-natural-border space-y-3">
             <div className="flex justify-between items-start">
               <span className="text-[10px] font-black uppercase text-natural-text/40 tracking-widest">Description</span>
               <button 
                 onClick={() => speak(body.description, 'desc')}
                 className={`p-1.5 rounded-lg border transition-colors ${isReading === 'desc' ? 'bg-natural-accent text-white' : 'bg-natural-bg text-natural-accent border-natural-border'}`}
               >
                 <Volume2 size={16} />
               </button>
             </div>
             <p className="text-sm font-bold text-natural-text leading-relaxed">
               {body.description}
             </p>
             {body.distanceFromSun && (
               <p className="text-xs font-black text-blue-500">
                 Distance from Sun: {body.distanceFromSun}
               </p>
             )}
          </div>

          <button
            onClick={collectSeeds}
            disabled={showFact}
            className={`natural-card p-6 border-4 flex items-center gap-4 group transition-all ${showFact ? 'bg-natural-sidebar border-natural-border opacity-50' : 'bg-white border-natural-accent hover:scale-105 active:scale-95 shadow-lg'}`}
          >
            <div className="w-12 h-12 bg-natural-accent/10 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-natural-accent group-hover:text-white transition-colors">
              <Sparkles />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-natural-accent">Daily Discovery</p>
              <p className="font-black text-natural-text">Unlock Fun Fact</p>
            </div>
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showFact && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="natural-card-heavy p-8 border-natural-accent bg-natural-sidebar relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 opacity-5">
              <Star size={200} />
            </div>
            <div className="flex gap-6 items-start">
              <div className="p-4 bg-white rounded-3xl border-2 border-natural-border shadow-sm">
                <Lightbulb size={32} className="text-natural-accent" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <h4 className="text-xl font-black text-natural-text">Did you know?</h4>
                   <button 
                      onClick={() => speak(body.funFact, 'fact')}
                      className={`p-1 rounded-md ${isReading === 'fact' ? 'text-natural-accent animate-pulse' : 'text-natural-text/40'}`}
                    >
                      <Volume2 size={16} />
                    </button>
                </div>
                <p className="text-xl font-bold text-natural-text leading-tight italic">
                  "{body.funFact}"
                </p>
                <div className="flex items-center gap-2 pt-2">
                   <span className="w-2 h-2 bg-natural-accent rounded-full animate-ping" />
                   <span className="text-xs font-black text-natural-accent uppercase tracking-[0.2em]">15 Seeds Earned!</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Lightbulb(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.1.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
