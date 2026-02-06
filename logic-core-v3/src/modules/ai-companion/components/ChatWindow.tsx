'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from 'ai';
import { Send, Sparkles, Activity } from 'lucide-react';
import useSound from 'use-sound';

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
                    />

                    {/* Chat Window - Obsidian HUD */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100, rotateX: 20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                            mass: 1
                        }}
                        className="fixed bottom-44 right-8 w-[420px] h-[600px] rounded-2xl flex flex-col overflow-hidden z-[100] preserve-3d"
                    >
                        {/* Gradient Border Container */}
                        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-transparent">
                            <div className="h-full w-full rounded-2xl bg-[#050505]/80 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative">
                                {/* Noise Texture Overlay */}
                                <div
                                    className="absolute inset-0 opacity-5 pointer-events-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                    }}
                                />

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
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5">
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
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {m.role === 'assistant' ? (
                                                    // AI message - Direct on glass, monospace
                                                    <div className="max-w-[90%] space-y-1">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                                                            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.15em]">
                                                                LOGIC_AI
                                                            </span>
                                                        </div>
                                                        <div className="text-zinc-300 text-[13px] leading-relaxed font-mono prose prose-invert prose-sm max-w-none">
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
                                                                {(m as any).content || ''}
                                                            </ReactMarkdown>
                                                            {/* Blinking cursor at end of last AI message */}
                                                            {idx === messages.length - 1 && isThinking && showCursor && (
                                                                <span className="text-cyan-400 ml-1">|</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // User message - Glass bubble
                                                    <div className="max-w-[85%]">
                                                        <div className="bg-white/5 text-white p-3.5 rounded-xl rounded-tr-sm border border-white/5 shadow-lg backdrop-blur-sm">
                                                            <p className="text-[13px] leading-relaxed">{(m as any).content || ''}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}

                                    {/* Thinking indicator */}
                                    {isThinking && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex justify-start"
                                        >
                                            <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono">
                                                <div className="flex gap-1">
                                                    <motion.div
                                                        className="w-1 h-1 rounded-full bg-cyan-400"
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                                    />
                                                    <motion.div
                                                        className="w-1 h-1 rounded-full bg-cyan-400"
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                                    />
                                                    <motion.div
                                                        className="w-1 h-1 rounded-full bg-cyan-400"
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                                    />
                                                </div>
                                                <span>&gt;_ PROCESSING INPUT...</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Auto-scroll anchor */}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Input Area - Terminal Style */}
                                <form
                                    onSubmit={handleFormSubmit}
                                    className="relative p-4 border-t border-white/[0.03] bg-black/40 backdrop-blur-md"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-cyan-400/50 text-sm font-mono">&gt;_</span>
                                        <input
                                            ref={inputRef}
                                            value={input}
                                            onChange={handleInputChange}
                                            placeholder="Enter command..."
                                            disabled={isThinking}
                                            className="flex-1 bg-transparent text-white outline-none font-mono text-sm placeholder:text-zinc-700 disabled:opacity-50 caret-cyan-400"
                                        />

                                        <AnimatePresence>
                                            {input.trim() && (
                                                <motion.button
                                                    type="submit"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    disabled={isThinking}
                                                    className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all border border-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Send className="w-3.5 h-3.5" />
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
