import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Volume2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { useApp } from '../context/AppContext';
import { getAIResponse, generateSpeech } from '../services/geminiService';

export default function Chat() {
  const { user } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hi ${user?.name || 'Superstar'}! I'm your Gemini Tutor buddy! I've been waiting for you! How was your day today? Did you see or do anything super cool?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (text: string) => {
    const audioData = await generateSpeech(text);
    if (audioData) {
      if (audioRef.current) {
        audioRef.current.src = audioData;
        audioRef.current.play();
      } else {
        const audio = new Audio(audioData);
        audioRef.current = audio;
        audio.play();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const userPrompt = input.trim();
    setInput('');
    setIsTyping(true);

    const context = {
      name: user?.name || 'Friend',
      grade: user?.grade || '1'
    };

    const aiText = await getAIResponse(userPrompt, context);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiText || "I'm having a little trouble thinking. Can you say that again?",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);

    if (aiText) {
      playAudio(aiText);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[40px] border-4 border-natural-border overflow-hidden shadow-sm">
      <div className="p-6 bg-natural-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-natural-primary shadow-sm"><Bot size={28} /></div>
          <div>
            <h2 className="font-black text-lg leading-tight text-natural-text">Gemini Tutor</h2>
            <span className="text-xs flex items-center gap-1 text-natural-primary font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Always here to help
            </span>
          </div>
        </div>
        <button className="bg-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-natural-border/50 text-natural-text shadow-sm hover:bg-natural-bg transition-colors">
          View Help
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white min-h-0">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold shadow-sm ${
                msg.sender === 'user' ? 'bg-natural-accent text-white' : 'bg-natural-border text-natural-primary'
              }`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-natural-primary text-white rounded-tr-none' 
                  : 'bg-natural-muted text-natural-text rounded-tl-none border border-natural-border/30'
              }`}>
                {msg.text}
              </div>
              {msg.sender === 'ai' && (
                <button 
                  onClick={() => playAudio(msg.text)}
                  className="mt-auto mb-1 p-2 bg-white rounded-full shadow-sm border border-natural-border hover:bg-natural-bg transition-all active:scale-90 flex items-center justify-center"
                  title="Play Audio"
                >
                  <Volume2 size={14} className="text-natural-primary text-xs" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-natural-muted p-4 rounded-2xl rounded-tl-none border border-natural-border/30 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-natural-primary/30 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-natural-primary/30 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-natural-primary/30 rounded-full animate-bounce delay-150" />
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-natural-border flex gap-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-natural-bg border-2 border-natural-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-natural-accent font-bold placeholder:text-natural-text/30"
        />
        <button 
          onClick={handleSend}
          className="bg-natural-accent w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-md hover:bg-natural-accent-dark transition-all active:scale-90"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
