import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Send, User, Bot, Loader2 } from 'lucide-react';
import { getAIResponse } from '../services/geminiService';
import { useApp } from '../context/AppContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function StudyHub() {
  const { user } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Upload a PDF or document and ask me anything about it!' }
  ]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setIsUploading(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFileData(base64);
        setIsUploading(false);
        setMessages(prev => [...prev, { role: 'model', text: `I've received ${selected.name}. What would you like to know about it?` }]);
      };
      reader.readAsDataURL(selected);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // In a real application, we might use ai.models.generateContent with the PDF data.
      // We pass the document data to Gemini alongside the prompt if fileData is present.
      
      let contextMsg = userMsg;
      // We'll structure a special call to Gemini integrating the PDF if needed.
      // But actually, we need to pass the base64 to geminiService. Let's update it if needed, or simply handle it here.
      
      // Let's import GoogleGenAI directly here just for the document querying feature.
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const parts: any[] = [{ text: userMsg }];
      if (fileData) {
        parts.unshift({
          inlineData: {
            mimeType: 'application/pdf',
            data: fileData
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts },
        config: {
          systemInstruction: `You are an advanced tutor for a grade ${user?.grade} student. Explain concepts clearly and concisely based on the provided document.`
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I ran into an error reading the document." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border-4 border-natural-border shadow-md">
      <header className="mb-6 flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-black text-natural-text">PDF Study Hub</h2>
            <p className="text-natural-primary font-bold">Upload an advanced textbook or notes.</p>
         </div>
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="bg-cyan-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-cyan-600 transition-colors"
         >
           <UploadCloud />
           {file ? 'Change PDF' : 'Upload PDF'}
         </button>
         <input 
           type="file" 
           accept="application/pdf" 
           ref={fileInputRef} 
           className="hidden" 
           onChange={handleFileChange} 
         />
      </header>
      
      <div className="flex gap-6 h-[500px]">
        {/* File Preview Status */}
        <div className="w-1/3 bg-cyan-50 rounded-3xl border-4 border-cyan-100 flex flex-col items-center justify-center p-6 text-center">
          {isUploading ? (
            <div className="animate-pulse flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mb-4" />
              <p className="font-bold text-cyan-700">Loading document...</p>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center">
              <FileText className="w-20 h-20 text-cyan-600 mb-4" />
              <p className="font-black text-cyan-800 break-all">{file.name}</p>
              <p className="text-sm font-bold text-cyan-600 mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-50">
              <FileText className="w-20 h-20 text-cyan-600 mb-4" />
              <p className="font-black text-cyan-800">No file uploaded</p>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-white rounded-3xl border-4 border-natural-border overflow-hidden">
           <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex max-w-[85%] ${m.role === 'user' ? 'ml-auto' : ''}`}>
                  <div className={`flex gap-3 items-end ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 ${
                      m.role === 'user' 
                        ? 'bg-natural-primary text-white border-natural-primary' 
                        : 'bg-cyan-100 text-cyan-700 border-cyan-200'
                    }`}>
                      {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className={`p-4 rounded-3xl border-2 text-sm font-bold shadow-sm ${
                      m.role === 'user'
                        ? 'bg-natural-primary text-white border-natural-primary rounded-br-none'
                        : 'bg-white text-natural-text border-natural-border rounded-bl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 items-end">
                   <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 border-2 border-cyan-200 flex items-center justify-center shrink-0">
                      <Bot size={20} />
                   </div>
                   <div className="p-4 rounded-3xl border-2 bg-white border-natural-border rounded-bl-none text-natural-text flex gap-2 w-20">
                     <div className="w-2 h-2 bg-natural-text/40 rounded-full animate-bounce" />
                     <div className="w-2 h-2 bg-natural-text/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                     <div className="w-2 h-2 bg-natural-text/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                   </div>
                </div>
              )}
           </div>
           
           <div className="p-4 bg-natural-bg/50 border-t-2 border-natural-border flex gap-3">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Ask a question about the PDF..."
               disabled={!fileData || isTyping}
               className="flex-1 px-5 py-4 rounded-2xl border-2 border-natural-border font-bold text-natural-text focus:outline-none focus:border-cyan-500 disabled:opacity-50"
             />
             <button
               onClick={handleSend}
               disabled={!input.trim() || !fileData || isTyping}
               className="w-14 h-14 bg-cyan-500 text-white rounded-2xl flex items-center justify-center shadow-md border-2 border-cyan-600 hover:bg-cyan-600 disabled:opacity-50 active:scale-95 transition-all"
             >
               <Send size={24} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
