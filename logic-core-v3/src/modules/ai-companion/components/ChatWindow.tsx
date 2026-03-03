'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from 'ai';
import { Send, Sparkles, Activity } from 'lucide-react';

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
}

export function ChatWindow({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isOpen,
    isThinking,
    onClose,
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

    // Auto-scroll to bottom when new messages arrive, content streams, or typing indicator appears
    const lastMessageContent = messages.length > 0 ? getTextContent(messages[messages.length - 1]) : '';
    useEffect(() => {
        if (messages.length || isThinking) {
            // Small delay to let DOM update with new content
            const timer = setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [messages.length, lastMessageContent, isThinking]);

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
                        className="fixed bottom-24 right-56 w-[440px] h-[650px] rounded-3xl flex flex-col z-[100]"
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
                                            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 250,
                                                damping: 25,
                                                delay: idx * 0.03,
                                            }}
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
                                                            .replace(/\[(?:ACTION:\s*SHOW_CONTACT|SHOW_CONNECT_FORM|CONNECT_WHATSAPP|NAVIGATE:\s*[^\]]*)\]/g, '')
                                                            .replace(/\[(?:ACTION:\s*SHOW_CONTACT|SHOW_CONNECT(?:_FORM?)?|CONNECT(?:_WHATSAPP?)?|NAVIGATE:?[^\]]*)$/g, '')
                                                            .trim()}
                                                    </ReactMarkdown>
                                                    {m.role === 'assistant' && idx === messages.length - 1 && isThinking && showCursor && (
                                                        <span className="text-cyan-400 ml-1 inline-block w-1.5 h-3 bg-cyan-400/80 animate-pulse align-middle" />
                                                    )}
                                                </div>

                                                {/* Premium Contact Card — triggered ONLY by [ACTION: SHOW_CONTACT] */}
                                                {m.role === 'assistant' &&
                                                    getTextContent(m).includes('[ACTION: SHOW_CONTACT]') && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                                                            className="mt-4 border-t border-white/5 pt-4"
                                                        >
                                                            <div className="rounded-2xl p-5 border border-cyan-900/40 shadow-2xl"
                                                                style={{
                                                                    background: 'rgba(9, 9, 11, 0.6)',
                                                                    backdropFilter: 'blur(16px)',
                                                                }}
                                                            >
                                                                {/* Header */}
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                                                    <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Slot Disponible</span>
                                                                </div>

                                                                <p className="text-zinc-200 text-sm mb-5 font-medium">
                                                                    Inicia tu proyecto con el equipo de DevelOP.
                                                                </p>

                                                                {/* WhatsApp CTA */}
                                                                <a
                                                                    href="https://wa.me/543815674738?text=Hola%20DevelOP,%20habl%C3%A9%20con%20Logic%20Core%20y%20me%20interesa%20iniciar%20un%20proyecto..."
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="group/wa flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300
                                                                        bg-zinc-950 border border-cyan-500/30 hover:border-cyan-400
                                                                        text-cyan-50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                                                                >
                                                                    <svg className="w-4 h-4 transition-transform group-hover/wa:scale-110" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                    </svg>
                                                                    Solicitar Análisis Arquitectónico
                                                                </a>

                                                                {/* Email fallback */}
                                                                <p className="text-center mt-3 text-[11px] text-zinc-600">
                                                                    O escribí a{' '}
                                                                    <a href="mailto:develop33.arg@gmail.com" className="text-cyan-500/70 hover:text-cyan-400 transition-colors">
                                                                        develop33.arg@gmail.com
                                                                    </a>
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {/* Premium Thinking Indicator */}
                                {isThinking && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, filter: 'blur(4px)' }}
                                        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                                        className="flex justify-start pt-2"
                                    >
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-sm bg-black/30 border border-cyan-900/20 backdrop-blur-md">
                                            <div className="flex gap-1">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="w-1.5 h-1.5 rounded-full bg-cyan-500/70"
                                                        animate={{
                                                            y: [0, -4, 0],
                                                            opacity: [0.4, 1, 0.4],
                                                        }}
                                                        transition={{
                                                            duration: 0.8,
                                                            repeat: Infinity,
                                                            delay: i * 0.15,
                                                            ease: 'easeInOut',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest text-cyan-500/60 font-mono">
                                                Procesando respuesta...
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleFormSubmit}
                            className="relative z-10 p-5 pt-3 border-t border-white/[0.04] rounded-b-3xl"
                            style={{ background: 'rgba(9, 9, 11, 0.4)', backdropFilter: 'blur(16px)' }}
                            aria-label="Chat input"
                        >
                            <div className="relative group">
                                {/* Animated focus glow */}
                                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />

                                <div className="relative flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 transition-all duration-300 group-focus-within:border-cyan-500/40 group-focus-within:bg-white/[0.05] group-focus-within:shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                                    <span className="text-zinc-600 font-mono text-sm mr-3 select-none group-focus-within:text-cyan-600 transition-colors">&gt;_</span>
                                    <input
                                        ref={inputRef}
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Pregúntale a Logic Core..."
                                        disabled={isThinking}
                                        className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-[13px] font-mono disabled:opacity-50"
                                        aria-label="Type a message"
                                    />
                                    <AnimatePresence>
                                        {input.trim() && (
                                            <motion.button
                                                type="submit"
                                                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                disabled={isThinking}
                                                className="ml-3 p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
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
