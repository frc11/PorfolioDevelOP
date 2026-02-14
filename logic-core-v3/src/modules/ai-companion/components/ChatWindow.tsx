'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from 'ai';
import { Send, Sparkles, Activity } from 'lucide-react';
import useSound from 'use-sound';
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

// High-tech sound assets (CDN)
const SOUNDS = {
    OPEN: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Tech click
    HUM: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Subtle tech hum
};

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

    // Sound hooks
    const [playOpen] = useSound(SOUNDS.OPEN, { volume: 0.4 });
    const [playHum, { stop: stopHum }] = useSound(SOUNDS.HUM, {
        volume: 0.2,
        loop: true
    });

    // Play open sound and handle focus
    useEffect(() => {
        if (isOpen) {
            playOpen();
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, playOpen]);

    // Handle background hum while thinking
    useEffect(() => {
        if (isThinking) {
            playHum();
        } else {
            stopHum();
        }
        return () => stopHum();
    }, [isThinking, playHum, stopHum]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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

    // Play sound effect on message send
    const playMessageSound = () => {
        // Use the same open sound or a slight variation for feedback
        playOpen();
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            playMessageSound();
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                        style={{ pointerEvents: 'auto' }}
                        aria-hidden="true"
                    />

                    {/* Chat Window - Advanced Glassmorphism */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100, rotateX: 20 }}
                        transition={prefersReducedMotion ? { duration: 0 } : {
                            type: 'spring',
                            stiffness: 280,
                            damping: 24,
                            mass: 0.8
                        }}
                        className="fixed bottom-44 right-8 w-[420px] h-[600px] rounded-2xl flex flex-col overflow-hidden z-[100]"
                        style={{ pointerEvents: 'auto' }}
                        role="dialog"
                        aria-label="AI Chat Window"
                    >
                        {/* Layer 1: Outer Glow */}
                        <div className="absolute -inset-1 rounded-3xl blur-xl bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 pointer-events-none" />

                        {/* Layer 2: Animated Gradient Border */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl p-[1px] overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(99,102,241,0.1), rgba(192,38,211,0.3), rgba(34,211,238,0.1))',
                                backgroundSize: '300% 300%',
                            }}
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        >
                            {/* Inner container within the border */}
                            <div className="h-full w-full rounded-2xl relative overflow-hidden">
                                {/* Layer 3a: Black base */}
                                <div className="absolute inset-0 bg-black/95" />

                                {/* Layer 3b: Frosted glass with gradient */}
                                <div className="absolute inset-0 backdrop-blur-3xl bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-black/95" />

                                {/* Layer 3c: Reflection highlight */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-cyan-500/[0.05] pointer-events-none" />

                                {/* Noise Texture Overlay */}
                                <div
                                    className="absolute inset-0 opacity-5 pointer-events-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                    }}
                                />

                                {/* Layer 4: Content Container */}
                                <div className="relative z-10 h-full flex flex-col overflow-hidden rounded-2xl">

                                    {/* Holographic Scanline */}
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none z-20"
                                        style={{
                                            backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(34,211,238,0.03) 2px, rgba(34,211,238,0.03) 4px)',
                                        }}
                                        animate={{ y: ['0%', '100%'] }}
                                        transition={{
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: 'linear',
                                        }}
                                    />

                                    {/* Chromatic Edge Glow */}
                                    <div className="absolute inset-0 pointer-events-none z-20">
                                        <div
                                            className="w-full h-full rounded-2xl"
                                            style={{
                                                boxShadow: 'inset 0 0 100px rgba(34,211,238,0.05), inset 0 0 50px rgba(192,38,211,0.03)',
                                            }}
                                        />
                                    </div>

                                    {/* Technical Header - System Status */}
                                    <div className="relative p-4 border-b border-white/[0.03] bg-black/40 backdrop-blur-md">
                                        <div className="flex items-center justify-between">
                                            {/* System Link Status */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    {/* Network Activity Indicators */}
                                                    <motion.div
                                                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                                        animate={{ opacity: [1, 0.3, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                    <motion.div
                                                        className="w-1.5 h-1.5 rounded-full bg-red-400"
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
                                                    :: SYSTEM LINK ESTABLISHED ::
                                                </span>
                                            </div>

                                            {/* Status Indicators */}
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-3 h-3 text-cyan-400/50" />
                                                <button
                                                    onClick={onClose}
                                                    className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-red-500/60 transition-colors"
                                                    aria-label="Close"
                                                />
                                            </div>
                                        </div>

                                        {/* Secondary Info Bar */}
                                        <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-zinc-600">
                                            <span>LOGIC.CORE v3.0.1</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1 h-1 rounded-full ${isThinking ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400'}`} />
                                                <span>{isThinking ? 'PROCESSING' : 'READY'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div
                                        className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
                                        style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
                                        role="log"
                                        aria-live="polite"
                                        aria-label="Chat messages"
                                    >
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                                                <div className="relative">
                                                    <Sparkles className="w-8 h-8 text-zinc-800" />
                                                    <motion.div
                                                        className="absolute inset-0"
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        <Sparkles className="w-8 h-8 text-cyan-400/30" />
                                                    </motion.div>
                                                </div>
                                                <p className="text-zinc-600 text-xs font-mono tracking-wide">
                                                    &gt;_ AWAITING INPUT
                                                </p>
                                                <p className="text-zinc-700 text-[10px] max-w-[300px] leading-relaxed">
                                                    Initialize conversation protocol. Query portfolio data, project specifications, or technical capabilities.
                                                </p>
                                            </div>
                                        ) : (
                                            messages.map((m, idx) => (
                                                <motion.div
                                                    key={m.id}
                                                    initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
                                                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 30,
                                                        mass: 0.5,
                                                        delay: idx * 0.04,
                                                    }}
                                                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {m.role === 'assistant' ? (
                                                        // AI message - Direct on glass, monospace
                                                        <div className="max-w-[90%] space-y-1">
                                                            {/* Animated label with pulsing dot */}
                                                            <motion.div
                                                                className="flex items-center gap-2 mb-1.5"
                                                                initial={{ opacity: 0, x: -8 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: idx * 0.04 + 0.1 }}
                                                            >
                                                                <motion.div
                                                                    className="w-1 h-1 rounded-full bg-cyan-400"
                                                                    animate={{
                                                                        scale: [1, 1.3, 1],
                                                                        opacity: [0.6, 1, 0.6],
                                                                    }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        repeat: Infinity,
                                                                        ease: 'easeInOut',
                                                                    }}
                                                                />
                                                                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.15em]">
                                                                    LOGIC_AI
                                                                </span>
                                                            </motion.div>
                                                            {/* Message content with staggered entry */}
                                                            <motion.div
                                                                className="text-zinc-300 text-[13px] leading-relaxed font-mono prose prose-invert prose-sm max-w-none"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: idx * 0.04 + 0.15 }}
                                                            >
                                                                <ReactMarkdown
                                                                    components={{
                                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                                        code: ({ children }) => (
                                                                            <code className="bg-zinc-800/50 text-cyan-400 px-1.5 py-0.5 rounded text-xs border border-cyan-400/20">
                                                                                {children}
                                                                            </code>
                                                                        ),
                                                                        strong: ({ children }) => (
                                                                            <strong className="text-white font-semibold">{children}</strong>
                                                                        ),
                                                                    }}
                                                                >
                                                                    {getTextContent(m)
                                                                        .replace(/\[(?:SHOW_CONNECT_FORM|CONNECT_WHATSAPP|NAVIGATE:\s*[^\]]*)\]/g, '')
                                                                        .replace(/\[(?:SHOW_CONNECT(?:_FORM?)?|CONNECT(?:_WHATSAPP?)?|NAVIGATE:?[^\]]*)$/g, '')
                                                                        .trim()}
                                                                </ReactMarkdown>
                                                                {/* Blinking cursor at end of last AI message */}
                                                                {idx === messages.length - 1 && isThinking && showCursor && (
                                                                    <span className="text-cyan-400 ml-1">|</span>
                                                                )}
                                                            </motion.div>
                                                        </div>
                                                    ) : (
                                                        // User message - Premium glass bubble with shimmer
                                                        <motion.div
                                                            className="max-w-[85%]"
                                                            whileHover={{
                                                                boxShadow: '0 0 20px rgba(34, 211, 238, 0.15)',
                                                                transition: { duration: 0.3 },
                                                            }}
                                                        >
                                                            <div className="relative overflow-hidden bg-gradient-to-r from-white/[0.08] to-white/[0.03] text-white p-3.5 rounded-xl rounded-tr-sm border border-white/5 shadow-lg backdrop-blur-sm">
                                                                {/* Shimmer sweep effect */}
                                                                <motion.div
                                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                                                                    initial={{ x: '-100%' }}
                                                                    animate={{ x: '100%' }}
                                                                    transition={{
                                                                        duration: 2,
                                                                        delay: idx * 0.04 + 0.3,
                                                                        ease: 'easeInOut',
                                                                    }}
                                                                />
                                                                <p className="relative z-10 text-[13px] leading-relaxed">{getTextContent(m)}</p>
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    {/* Lead Capture Form - appears when Logic Core activates it */}
                                                    {m.role === 'assistant' &&
                                                        idx === messages.length - 1 &&
                                                        getTextContent(m).includes('[SHOW_CONNECT_FORM]') &&
                                                        leadContext && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: 0.3 }}
                                                                className="flex justify-start mt-4"
                                                            >
                                                                <LeadCaptureForm
                                                                    leadContext={leadContext}
                                                                    onConnect={() => { }}
                                                                />
                                                            </motion.div>
                                                        )}
                                                </motion.div>
                                            ))
                                        )}

                                        {/* Cinematic Thinking Indicator */}
                                        <AnimatePresence>
                                            {isThinking && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="flex items-center gap-3 bg-zinc-950/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl px-4 py-2.5">
                                                        <div className="flex gap-1.5">
                                                            {[0, 1, 2].map((i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600"
                                                                    animate={{
                                                                        y: [0, -8, 0],
                                                                        scale: [1, 1.2, 1],
                                                                        opacity: [0.5, 1, 0.5],
                                                                    }}
                                                                    transition={{
                                                                        duration: 1.2,
                                                                        repeat: Infinity,
                                                                        delay: i * 0.15,
                                                                        ease: 'easeInOut',
                                                                    }}
                                                                    style={{
                                                                        boxShadow: '0 0 8px rgba(34, 211, 238, 0.5)',
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <motion.span
                                                            className="text-[10px] font-mono text-cyan-400/70 uppercase tracking-[0.2em]"
                                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                                        >
                                                            NEURAL PROCESSING
                                                        </motion.span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Auto-scroll anchor */}
                                        <div ref={scrollRef} />
                                    </div>

                                    {/* Input Area - Premium Terminal */}
                                    <form
                                        onSubmit={handleFormSubmit}
                                        className="relative p-4 border-t border-white/[0.03]"
                                        aria-label="Chat input"
                                    >
                                        <div className="relative">
                                            {/* Focus ring glow */}
                                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500/40 via-purple-500/20 to-cyan-500/40 blur-md opacity-0 transition-opacity duration-300 pointer-events-none peer-focus-within:opacity-100 group-focus-within:opacity-100" />

                                            {/* Input container */}
                                            <div className="group relative flex items-center gap-3 bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-3 transition-colors duration-300 focus-within:border-cyan-400/50">
                                                {/* Animated prompt */}
                                                <motion.span
                                                    className="text-cyan-400/50 text-sm font-mono select-none"
                                                    animate={{
                                                        opacity: input.trim() ? 1 : 0.5,
                                                    }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    &gt;_
                                                </motion.span>

                                                <input
                                                    ref={inputRef}
                                                    value={input}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter command..."
                                                    disabled={isThinking}
                                                    className="flex-1 bg-transparent text-white outline-none font-mono text-sm placeholder:text-zinc-700 disabled:opacity-50 caret-cyan-400"
                                                    aria-label="Type a message"
                                                />

                                                <AnimatePresence>
                                                    {input.trim() && (
                                                        <motion.button
                                                            type="submit"
                                                            initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
                                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                            exit={{ opacity: 0, scale: 0.8, rotate: -180 }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 500,
                                                                damping: 25,
                                                            }}
                                                            whileHover={{
                                                                scale: 1.1,
                                                                boxShadow: '0 0 16px rgba(34, 211, 238, 0.3)',
                                                                transition: { duration: 0.2 },
                                                            }}
                                                            disabled={isThinking}
                                                            aria-label="Send message"
                                                            className="relative overflow-hidden p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all border border-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {/* Shimmer effect on button */}
                                                            <motion.div
                                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent pointer-events-none"
                                                                animate={{ x: ['-100%', '200%'] }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                    ease: 'linear',
                                                                }}
                                                            />
                                                            <Send className="relative z-10 w-3.5 h-3.5" />
                                                        </motion.button>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </form>
                                </div>{/* /Content Container */}
                            </div>{/* /Inner container */}
                        </motion.div>{/* /Animated Border */}
                    </motion.div>{/* /Chat Window */}
                </>
            )}
        </AnimatePresence>
    );
}
