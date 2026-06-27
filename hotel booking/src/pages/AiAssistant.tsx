import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Compass, MessageSquare, Bot, BookOpen } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Welcome to the StaySphere AI Concierge! I can assist you in finding luxury hotels, pricing information, cancellation policies, or general stay queries. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'Hotels in Goa',
    'Luxury hotels under ₹10,000',
    'Hotels with swimming pool',
    'Hotels with free breakfast',
    'Booking cancellation rules',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.ai.chat(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response?.response || 'No matching hotel information found.',
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'I apologize, but I am unable to connect to the concierge database right now. Please check your network and try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[80vh] flex flex-col md:flex-row gap-6 text-left">
      {/* Sidebar: AI Info & Quick Prompts */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight m-0">StaySphere AI</h2>
              <span className="text-xxs font-bold text-slate-400">RAG Concierge Engine</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Ask our concierge about pricing, amenities, room availability, cancellation terms, or locations. The assistant directly fetches real-time records from MongoDB Atlas.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Compass size={16} className="text-blue-500" />
            <span>Suggested Questions</span>
          </div>
          <div className="flex flex-col gap-2">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-left w-full text-slate-650 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 rounded-xl p-3 text-xs font-bold transition-all cursor-pointer bg-white"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Hub */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Hub Header */}
        <div className="border-b border-slate-150 p-5 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-slate-500" />
            <span className="text-slate-800 font-extrabold text-xs">Active Concierge Conversation</span>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live DB RAG
          </span>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[350px] max-h-[50vh] bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2.5">
                <Loader2 size={16} className="text-blue-500 animate-spin" />
                <span className="text-xs text-slate-500 font-bold">Querying RAG Knowledge Base...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Input Form */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query Goa resorts, pools, pricing or refund state..."
              className="w-full pl-4 pr-14 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
