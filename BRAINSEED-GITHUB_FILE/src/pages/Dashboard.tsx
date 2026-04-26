import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Home as HomeIcon, 
  User as UserIcon, 
  Bell, 
  Star,
  BookOpen,
  Gamepad2,
  Trophy as TrophyIcon,
  Sparkles,
  LogOut,
  Newspaper,
  Hand,
  Flame,
  Calculator,
  Beaker,
  Lightbulb,
  Sprout,
  TrendingUp,
  ShieldCheck,
  Home,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Chat from '../components/Chat';
import LearningView from '../components/LearningView';
import AwardsView from '../components/AwardsView';
import ProgressView from '../components/ProgressView';
import NewsView from '../components/NewsView';
import ProfileView from '../components/ProfileView';
import ParentDashboard from '../components/ParentDashboard';

type Section = 'Home' | 'Learning' | 'Awards' | 'Progress' | 'News' | 'Profile';

export default function Dashboard() {
  const { user, logout, isVoiceEnabled, setIsVoiceEnabled } = useApp();
  const [currentSection, setCurrentSection] = useState<Section>('Home');
  const [mode, setMode] = useState<'learner' | 'parent'>('learner');

  const stats = useMemo(() => {
    const seed = user?.name?.length || 10;
    return {
      math: 60 + (seed % 35),
      reading: 45 + (seed * 2 % 50),
      science: 50 + (seed * 3 % 45)
    };
  }, [user]);

  const speak = (text: string) => {
    if (!isVoiceEnabled) return;
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

  const handleModeSwitch = (newMode: 'learner' | 'parent') => {
    setMode(newMode);
    speak(newMode === 'parent' ? "Switching to Guardian Mode. Safe space for parents." : "Welcome back to Learning Mode! Let's play!");
  };

  const handleSectionSwitch = (newSection: Section) => {
    setCurrentSection(newSection);
    speak(`Opening ${newSection} area.`);
  };

  const renderContent = () => {
    if (mode === 'parent') {
      return <ParentDashboard />;
    }

    switch (currentSection) {
      case 'Learning': return <LearningView />;
      case 'Awards': return <AwardsView />;
      case 'Progress': return <ProgressView />;
      case 'News': return <NewsView />;
      case 'Profile': return <ProfileView />;
      default: return (
        <>
           {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-8 rounded-[32px] border-2 border-natural-border shadow-sm gap-4">
              <div>
                <h1 className="text-3xl font-black text-natural-text">Hey genius, {user?.name}! <Hand className="inline-block text-yellow-400 mb-1" /></h1>
                <p className="text-natural-primary font-bold">Ready for today's learning seed?</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm ${
                    isVoiceEnabled ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg text-natural-text/40 border-natural-border'
                  }`}
                  title={isVoiceEnabled ? 'Disable Voiceover' : 'Enable Voiceover'}
                >
                  {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <div className="bg-natural-bg px-6 py-2 rounded-full border-2 border-natural-border flex items-center gap-2 shadow-sm">
                  <Flame className="text-orange-500 w-5 h-5" /> <span className="font-black text-sm text-natural-text">{user?.currentStreak || 1} Day Streak</span>
                </div>
                <div className="bg-natural-bg px-6 py-2 rounded-full border-2 border-natural-border flex items-center gap-2 shadow-sm">
                  <Star className="text-yellow-500 w-5 h-5 fill-current" /> <span className="font-black text-sm text-natural-text">{user?.points} XP</span>
                </div>
              </div>
            </header>

            {/* Dashboard Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 pb-24 md:pb-0">
              {/* Left Side: News & Chat */}
              <div className="md:col-span-7 flex flex-col gap-6">
                {/* Chatbot: Gemini Tutor */}
                <section className="flex-1 min-h-[500px]">
                  <Chat />
                </section>
              </div>

              {/* Right Side: Progress */}
              <div className="md:col-span-5 flex flex-col gap-6">
                {/* Home Mini Progress */}
                <section className="bg-white rounded-[40px] p-8 border-2 border-natural-border flex-1 space-y-6">
                  <h3 className="text-sm font-black text-natural-text flex justify-between items-center uppercase tracking-widest">
                    <span>Weekly Progress</span>
                    <span 
                      onClick={() => setCurrentSection('Progress')}
                      className="text-natural-primary text-xs underline cursor-pointer"
                    >
                      View All
                    </span>
                  </h3>
                  
                  <div className="space-y-6 pt-2">
                    <ProgressItem label="Math Literacy" progress={stats.math} color="bg-emerald-500" icon={<Calculator className="w-4 h-4" />} />
                    <ProgressItem label="Reading Level" progress={stats.reading} color="bg-blue-500" icon={<BookOpen className="w-4 h-4" />} />
                    <ProgressItem label="Science Fun" progress={stats.science} color="bg-purple-500" icon={<Beaker className="w-4 h-4" />} />
                    
                    <div className="bg-natural-muted rounded-2xl p-4 flex items-center gap-3 border border-natural-border/50">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-natural-accent border border-natural-border shadow-sm"><Lightbulb size={20} /></div>
                      <p className="text-[11px] leading-tight font-bold text-natural-text/80">
                        Parent Tip: Ask {user?.name} to name objects in {user?.language} today while walking!
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-natural-sidebar rounded-[32px] border-2 border-natural-border flex-col p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setCurrentSection('Home')}>
          <div className="w-10 h-10 bg-natural-primary rounded-xl flex items-center justify-center text-white shadow-sm border-2 border-white/20"><Sprout size={24} /></div>
          <span className="text-2xl font-black tracking-tighter text-natural-primary">BrainSeed</span>
        </div>

        {/* Mode Selector */}
        <div className="bg-white/50 p-1.5 rounded-2xl border-2 border-natural-border mb-8 flex gap-1">
          <button 
            onClick={() => handleModeSwitch('learner')}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              mode === 'learner' 
                ? 'bg-natural-accent text-white shadow-sm' 
                : 'text-natural-text/60 hover:bg-white/80'
            }`}
          >
            Learner
          </button>
          <button 
            onClick={() => handleModeSwitch('parent')}
            className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              mode === 'parent' 
                ? 'bg-rose-500 text-white shadow-sm' 
                : 'text-natural-text/60 hover:bg-white/80'
            }`}
          >
            Parent
          </button>
        </div>
        
        {mode === 'learner' ? (
          <nav className="flex-1 space-y-4">
            <NavItem 
              icon={<Home size={24} />} 
              label="Home" 
              active={currentSection === 'Home'} 
              onClick={() => handleSectionSwitch('Home')}
            />
            <NavItem 
              icon={<BookOpen size={24} />} 
              label="Learning" 
              active={currentSection === 'Learning'}
              onClick={() => handleSectionSwitch('Learning')}
            />
            <NavItem 
              icon={<TrophyIcon size={24} />} 
              label="Awards" 
              active={currentSection === 'Awards'}
              onClick={() => handleSectionSwitch('Awards')}
            />
            <NavItem 
              icon={<TrendingUp size={24} />} 
              label="Progress" 
              active={currentSection === 'Progress'}
              onClick={() => handleSectionSwitch('Progress')}
            />
          </nav>
        ) : (
          <nav className="flex-1 space-y-4">
            <NavItem 
              icon={<ShieldCheck size={24} />} 
              label="Safe Hub" 
              active={currentSection === 'Home'} 
              onClick={() => handleSectionSwitch('Home')}
            />
            <NavItem 
              icon={<Newspaper size={24} />} 
              label="News" 
              active={currentSection === 'News'}
              onClick={() => handleSectionSwitch('News')}
            />
          </nav>
        )}

        <div className="mt-auto space-y-4">
          <div 
            onClick={() => handleSectionSwitch('Profile')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
              currentSection === 'Profile' ? 'bg-natural-accent text-white border-white' : 'bg-white border-natural-border'
            }`}
          >
            <div className={`w-10 h-10 rounded-full border-2 shadow-sm flex items-center justify-center overflow-hidden font-black ${
              currentSection === 'Profile' ? 'bg-white text-natural-accent border-white' : 'bg-natural-accent text-white border-white'
            }`}>
               {user?.name?.[0]}
            </div>
            <div>
              <p className={`text-xs font-black ${currentSection === 'Profile' ? 'text-white' : 'text-natural-text'}`}>{user?.name}.</p>
              <p className={`text-[10px] font-bold uppercase ${currentSection === 'Profile' ? 'text-white/80' : 'text-natural-text/60'}`}>Grade {user?.grade} • {user?.language}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all text-rose-500 hover:bg-rose-50"
          >
            <LogOut className="w-6 h-6" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col gap-6 overflow-y-auto">
        {/* Mobile Mode Toggle */}
        <div className="md:hidden flex bg-white/80 p-1.5 rounded-2xl border-2 border-natural-border gap-2">
          <button 
            onClick={() => handleModeSwitch('learner')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'learner' 
                ? 'bg-natural-accent text-white shadow-md' 
                : 'text-natural-text/60'
            }`}
          >
            Learner Mode
          </button>
          <button 
            onClick={() => handleModeSwitch('parent')}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              mode === 'parent' 
                ? 'bg-rose-500 text-white shadow-md' 
                : 'text-natural-text/60'
            }`}
          >
            Parent Mode
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6 h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      {mode === 'learner' && (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-natural-sidebar border-2 border-natural-border p-4 rounded-[24px] flex justify-between items-center shadow-lg z-50">
          <MobileNavItem icon={<HomeIcon className="w-6 h-6" />} active={currentSection === 'Home'} onClick={() => handleSectionSwitch('Home')} />
          <MobileNavItem icon={<BookOpen className="w-6 h-6" />} active={currentSection === 'Learning'} onClick={() => handleSectionSwitch('Learning')} />
          <MobileNavItem icon={<TrophyIcon className="w-6 h-6" />} active={currentSection === 'Awards'} onClick={() => handleSectionSwitch('Awards')} />
          <MobileNavItem icon={<BarChart3 className="w-6 h-6" />} active={currentSection === 'Progress'} onClick={() => handleSectionSwitch('Progress')} />
          <MobileNavItem icon={<UserIcon className="w-6 h-6" />} active={currentSection === 'Profile'} onClick={() => handleSectionSwitch('Profile')} />
        </nav>
      )}
    </div>
  );
}

function ProgressItem({ label, progress, color, icon }: { label: string, progress: number, color: string, icon: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex justify-between items-center text-xs mb-2 font-black text-natural-text uppercase tracking-tight">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-natural-bg rounded-lg flex items-center justify-center border-2 border-natural-border group-hover:bg-natural-sidebar transition-colors shadow-sm">{icon}</span>
          <span>{label}</span>
        </div>
        <span className="bg-natural-bg px-2 py-0.5 rounded-full border border-natural-border">{progress}%</span>
      </div>
      <div className="w-full h-5 bg-natural-bg rounded-full overflow-hidden border-2 border-natural-border p-1 shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} rounded-full flex items-center justify-end px-1`}
        >
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
        </motion.div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${
        active 
          ? 'bg-natural-primary text-white shadow-md' 
          : 'text-natural-text/60 hover:bg-natural-border/40'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, active = false, onClick }: { icon: React.ReactNode, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl transition-all ${
        active ? 'text-white bg-natural-primary shadow-md' : 'text-natural-primary/50'
      }`}
    >
      {icon}
    </button>
  );
}

