'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Wifi, WifiOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'gemini' | 'simulated';
  timestamp: Date;
}

const SUGGESTIONS = [
  'How do I earn more IQ points?',
  'How does photo verification work?',
  'Tips for reducing my carbon footprint',
  'What is my Trust Score?',
  'Tell me about the marketplace',
];

export default function AIChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
        content: "Hey! I'm **LumeIQ AI** — your sustainability assistant. Ask me about earning IQ points, your eco-impact, photo verification, or anything green!",
      source: 'simulated',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "Sorry, I couldn't process that. Try again!",
        source: data.source || 'simulated',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting. Here's a tip: try cycling to work tomorrow — it earns 50 IQ points!",
          source: 'simulated',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple markdown-like rendering for bold text
  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          {/* Chat Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative mt-12 flex flex-1 flex-col rounded-t-3xl overflow-hidden
              bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-2xl
              border-t border-white/30 dark:border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-[17px] font-semibold text-[var(--ios-label)]">LumeIQ AI</h3>
                    <p className="text-[11px] text-[var(--ios-secondary-label)]">Your sustainability assistant</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[var(--ios-secondary-label)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[15px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#007aff] text-white rounded-br-md'
                          : 'bg-black/5 dark:bg-white/10 text-[var(--ios-label)] rounded-bl-md'
                      }`}
                    >
                      {renderContent(msg.content)}
                    </div>
                    {msg.source && msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-1 px-1">
                        {msg.source === 'gemini' ? (
                          <Wifi className="w-2.5 h-2.5 text-emerald-500" />
                        ) : (
                          <WifiOff className="w-2.5 h-2.5 text-amber-500" />
                        )}
                        <span className="text-[10px] text-[var(--ios-tertiary-label)]">
                          {msg.source === 'gemini' ? 'Gemini AI' : 'Offline Mode'}
                        </span>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#007aff] flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-black/5 dark:bg-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--ios-secondary-label)] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--ios-secondary-label)] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-[var(--ios-secondary-label)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (shown only when few messages) */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px] font-medium text-[var(--ios-secondary-label)]">Try asking</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-[12px] px-3 py-1.5 rounded-full 
                        bg-emerald-50 dark:bg-emerald-900/30 
                        text-emerald-700 dark:text-emerald-300
                        border border-emerald-200/50 dark:border-emerald-700/30
                        active:scale-95 transition-transform"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-8 pt-3 border-t border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 rounded-full px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Ask LumeIQ AI anything..."
                  className="flex-1 bg-transparent text-[15px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 
                    flex items-center justify-center
                    disabled:opacity-30 active:scale-90 transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
