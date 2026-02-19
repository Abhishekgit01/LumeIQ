'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, User, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { getSimulatedResponse } from '@/lib/simulatedAI';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isSimulated?: boolean;
  suggestions?: string[];
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  userContext?: {
    iq?: number;
    tier?: string;
    ecoPoints?: number;
    greenCredits?: number;
    totalCarbonSaved?: number;
    verificationCount?: number;
  };
}

export function AIChat({ isOpen, onClose, userContext }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey! I'm LumeIQ AI, your personal eco-sustainability assistant. I can help you earn more IQ points, suggest green habits, explain app features, or answer questions about reducing your carbon footprint. What would you like to know?",
      suggestions: ['How do I earn points?', 'Eco tips for today', 'What is Impact IQ?', 'How does photo verification work?'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
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
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build message history for API (last 10 messages)
    const history = [...messages.filter(m => m.id !== 'welcome'), userMsg]
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      // Try Gemini API first
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, userContext }),
      });

      const data = await res.json();

      if (data.fallback || !data.text) {
        // Fallback to simulated AI
        throw new Error(data.error || 'Gemini unavailable');
      }

      setUsingFallback(false);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      // Use simulated AI
      setUsingFallback(true);
      const simulated = getSimulatedResponse(text, userContext);
      
      // Add a small delay to feel natural
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: simulated.text,
        isSimulated: true,
        suggestions: simulated.suggestions,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="mt-auto w-full max-w-[430px] mx-auto h-[85vh] bg-[var(--ios-bg)] rounded-t-[28px] flex flex-col overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 px-5 py-4 flex items-center gap-3 border-b border-[var(--ios-separator)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#30d158] to-[#0d9488] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-[17px] font-bold text-[var(--ios-label)]">LumeIQ AI</h3>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${usingFallback ? 'bg-[#ff9f0a]' : 'bg-[#30d158]'}`} />
                  <span className="text-[11px] text-[var(--ios-tertiary-label)]">
                    {usingFallback ? 'Offline mode (simulated)' : 'Powered by Gemini AI'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--ios-fill)] flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[var(--ios-secondary-label)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#30d158] to-[#0d9488] flex items-center justify-center mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-[18px] px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-[var(--ios-blue)] text-white rounded-br-[6px]'
                          : 'bg-[var(--ios-card-bg)] text-[var(--ios-label)] rounded-bl-[6px] border border-[var(--ios-separator)]'
                      }`}
                    >
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {msg.isSimulated && (
                        <div className="flex items-center gap-1 mt-1.5 opacity-50">
                          <WifiOff className="w-2.5 h-2.5" />
                          <span className="text-[9px]">Offline response</span>
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="shrink-0 w-7 h-7 rounded-full bg-[var(--ios-blue)] flex items-center justify-center mt-0.5">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Suggestion chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(s)}
                          className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[var(--ios-blue)]/10 text-[var(--ios-blue)] hover:bg-[var(--ios-blue)]/20 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#30d158] to-[#0d9488] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-[var(--ios-card-bg)] border border-[var(--ios-separator)] rounded-[18px] rounded-bl-[6px] px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.div className="w-2 h-2 rounded-full bg-[var(--ios-tertiary-label)]"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-[var(--ios-tertiary-label)]"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-[var(--ios-tertiary-label)]"
                        animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 px-4 py-3 border-t border-[var(--ios-separator)] bg-[var(--ios-bg)] pb-safe">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
                  placeholder="Ask LumeIQ AI anything..."
                  disabled={isLoading}
                  className="flex-1 h-[42px] px-4 rounded-full bg-[var(--ios-card-bg)] border border-[var(--ios-separator)] text-[14px] text-[var(--ios-label)] placeholder:text-[var(--ios-tertiary-label)] focus:outline-none focus:border-[var(--ios-blue)] transition-colors disabled:opacity-50"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-[42px] h-[42px] rounded-full bg-[#30d158] flex items-center justify-center disabled:opacity-30 transition-opacity"
                >
                  {isLoading ? (
                    <Loader2 className="w-4.5 h-4.5 text-white animate-spin" />
                  ) : (
                    <Send className="w-4.5 h-4.5 text-white ml-0.5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
