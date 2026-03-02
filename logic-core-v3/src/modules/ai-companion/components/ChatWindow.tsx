'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from 'ai';
import { Send, Sparkles, Activity } from 'lucide-react';
import { LeadCaptureForm } from './LeadCaptureForm';
import type { LeadContext } from '../lib/sales-strategy';

/** Safely extract text content from AI SDK messages (handles string, array, undefined) */
function getTextContent(message: any): string {
    const content = message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .filter((part: any) => part?.type === 'text')
            .map((part: any) => part.text || '')
            .join('');
    }
    return '';
}



interface ChatWindowProps {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isOpen: boolean;
    isThinking: boolean;
    onClose?: () => void;
    leadContext?: LeadContext;
}

export function ChatWindow({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isOpen,
    isThinking,
    onClose,
    leadContext,
}: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [showCursor, setShowCursor] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Auto-scroll to bottom when new messages arrive or typing indicator appears
    useEffect(() => {
        if (messages.length || isThinking) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isThinking]);

    // Blinking cursor effect for AI responses
    useEffect(() => {
        if (isThinking) {
            const interval = setInterval(() => {
                setShowCursor((prev) => !prev);
            }, 530);
            return () => clearInterval(interval);
        } else {
            setShowCursor(false);
        }
    }, [isThinking]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            handleSubmit(e);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90]"
                        style={{ pointerEvents: 'auto' }}
                        aria-hidden="true"
                    />

                    {/* Chat Window - Glassmorphism 3.0 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        transition={prefersReducedMotion ? { duration: 0 } : {
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed bottom-24 right-8 w-[440px] h-[650px] rounded-3xl flex flex-col z-[100]"
                        style={{
                            pointerEvents: 'auto',
                            background: 'rgba(9, 9, 11, 0.8)', /* bg-zinc-950/80 */
                            boxShadow: '0 0 40px rgba(6, 182, 212, 0.08), 0 0 80px rgba(139, 92, 246, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(24px)', /* backdrop-blur-xl */
                        }}
                        role="dialog"
                        aria-label="AI Chat Window"
                    >
                        {/* Subtle inner gradient highlighting */}
                        <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-b from-white/[0.03] to-transparent" />

                        {/* Neon top accent */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[1px]" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

                        {/* Header */}
                        <div className="relative z-10 p-5 pb-4 border-b border-white/[0.04] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-white/5">
                                    <Activity className="w-4 h-4 text-cyan-400" />
                                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                </div>
                                <div>
                                    <h3 className="text-zinc-100 text-sm font-semibold tracking-wide flex items-center gap-2">
                                        LOGIC<span className="text-zinc-500 font-light">CORE</span> {isThinking && <span className="text-[10px] text-cyan-400 animate-pulse">PROCESSING</span>}
                                    </h3>
                                    <p className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase mt-0.5">QUANTUM LINK ESTABLISHED</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5"
                                aria-label="Close"
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M1 1l12 12M13 1L1 13" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
                            data-lenis-prevent
                            onWheel={(e) => e.stopPropagation()}
                            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
                            role="log"
                            aria-live="polite"
                            aria-label="Chat messages"
                        >
                            <AnimatePresence initial={false}>
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                            <Sparkles className="w-6 h-6 text-cyan-400/80" />
                                        </div>
                                        <div>
                                            <p className="text-cyan-400/80 text-xs font-mono tracking-widest uppercase mb-1">
                                                SYSTEM READY
                                            </p>
                                            <p className="text-zinc-500 text-[11px] max-w-[240px] leading-relaxed mx-auto font-mono">
                                                Initialize protocol. How can I assist you today?
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((m, idx) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`relative max-w-[85%] rounded-2xl p-4 border ${m.role === 'user'
                                                ? 'bg-zinc-900/50 border-zinc-800 text-zinc-200 rounded-tr-sm'
                                                : 'bg-black/40 border-cyan-900/30 text-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.05)] backdrop-blur-md rounded-tl-sm'
                                                }`}>
                                                {m.role === 'assistant' && (
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                                        <span className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest">LOGIC_AI</span>
                                                    </div>
                                                )}

                                                <div className={`text-[13px] leading-relaxed ${m.role === 'assistant' ? 'font-mono prose prose-invert prose-sm max-w-none text-zinc-300' : ''}`}>
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                                                            code: ({ children }) => (
                                                                <code className="bg-zinc-800/80 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-white/10">
                                                                    {children}
                                                                </code>
                                                            ),
                                                            strong: ({ children }) => (
                                                                <strong className="text-zinc-100 font-semibold">{children}</strong>
                                                            ),
                                                        }}
                                                    >
                                                        {getTextContent(m)
                                                            .replace(/\[(?:SHOW_CONNECT_FORM|CONNECT_WHATSAPP|NAVIGATE:\s*[^\]]*)\]/g, '')
                                                            .replace(/\[(?:SHOW_CONNECT(?:_FORM?)?|CONNECT(?:_WHATSAPP?)?|NAVIGATE:?[^\]]*)$/g, '')
                                                            .trim()}
                                                    </ReactMarkdown>
                                                    {m.role === 'assistant' && idx === messages.length - 1 && isThinking && showCursor && (
                                                        <span className="text-cyan-400 ml-1 inline-block w-1.5 h-3 bg-cyan-400/80 animate-pulse align-middle" />
                                                    )}
                                                </div>

                                                {/* Lead Capture Form - appears when Logic Core activates it */}
                                                {m.role === 'assistant' &&
                                                    idx === messages.length - 1 &&
                                                    getTextContent(m).includes('[SHOW_CONNECT_FORM]') &&
                                                    leadContext && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 }}
                                                            className="mt-4 border-t border-white/5 pt-4 flex justify-start w-full"
                                                        >
                                                            <LeadCaptureForm
                                                                leadContext={leadContext}
                                                                onConnect={() => { }}
                                                            />
                                                        </motion.div>
                                                    )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {/* Cinematic Thinking Indicator */}
                                {isThinking && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        className="flex justify-start pt-2"
                                    >
                                        <div className="relative max-w-[85%] rounded-2xl rounded-tl-sm p-4 bg-black/40 border border-cyan-900/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                                                <span className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest">LOGIC_AI</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 h-5">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                                                        animate={{
                                                            opacity: [0.3, 1, 0.3],
                                                            scale: [0.8, 1.2, 0.8],
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            delay: i * 0.2,
                                                            ease: 'easeInOut',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleFormSubmit}
                            className="relative z-10 p-5 pt-3 bg-zinc-950/40 border-t border-white/[0.04] backdrop-blur-md rounded-b-3xl"
                            aria-label="Chat input"
                        >
                            <div className="relative group">
                                {/* Animated focus glow */}
                                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />

                                <div className="relative flex items-center bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 transition-colors group-focus-within:border-white/10 group-focus-within:bg-black/80">
                                    <span className="text-zinc-600 font-mono text-sm mr-3 select-none">&gt;_</span>
                                    <input
                                        ref={inputRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Type your command..."
                                        disabled={isThinking}
                                        className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-[13px] font-mono disabled:opacity-50"
                                        aria-label="Type a message"
                                    />
                                    <AnimatePresence>
                                        {input.trim() && (
                                            <motion.button
                                                type="submit"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                disabled={isThinking}
                                                className="ml-3 p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-400 transition-colors disabled:opacity-50 group-focus-within:text-cyan-300"
                                                aria-label="Send message"
                                            >
                                                <Send className="w-4 h-4" />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
