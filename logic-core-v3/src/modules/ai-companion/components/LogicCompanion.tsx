'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuroAvatar } from './NeuroAvatar';
import { ChatWindow } from './ChatWindow';
import { useLogicAI } from '../hooks/useLogicAI';

const INITIAL_DELAY = 3000;   // Show prompt 3s after page load
const IDLE_TIMEOUT = 15000;   // Re-show after 15s of inactivity

/**
 * Main AI Companion Wrapper
 * Combines NeuroAvatar with ChatWindow, manages state,
 * and orchestrates the Smart Tooltip idle-detection system.
 */
export function LogicCompanion() {
    const [isOpen, setIsOpen] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isThinking, leadContext, updateLeadContext } = useLogicAI();

    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasShownOnceRef = useRef(false);

    // ─── Start idle countdown (15s) ──────────────────────────
    const startIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setShowPrompt(true);
        }, IDLE_TIMEOUT);
    }, []);

    // ─── Reset the idle countdown on user activity ───────────
    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        // Only start a new idle timer if the prompt was already dismissed
        // (i.e., don't start the timer while it's visible — let user read it)
        if (hasShownOnceRef.current) {
            startIdleTimer();
        }
    }, [startIdleTimer]);

    // ─── Initial 3s entry + idle event listeners ─────────────
    useEffect(() => {
        // Show after initial delay
        const initialTimer = setTimeout(() => {
            setShowPrompt(true);
            hasShownOnceRef.current = true;
        }, INITIAL_DELAY);

        // Idle detection listeners
        const events = ['mousemove', 'keydown', 'scroll', 'touchstart'] as const;
        events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));

        return () => {
            clearTimeout(initialTimer);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
        };
    }, [resetIdleTimer]);

    // ─── When chat closes, restart idle timer ────────────────
    useEffect(() => {
        if (!isOpen && hasShownOnceRef.current) {
            startIdleTimer();
        }
        if (isOpen) {
            // Chat open → ensure prompt hidden + clear timer
            setShowPrompt(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        }
    }, [isOpen, startIdleTimer]);

    // ─── Handlers ────────────────────────────────────────────
    const toggleChat = () => setIsOpen(!isOpen);

    const dismissPrompt = () => {
        setShowPrompt(false);
        hasShownOnceRef.current = true;
        startIdleTimer();
    };

    const openFromPrompt = () => {
        setShowPrompt(false);
        setIsOpen(true);
    };

    return (
        <>
            {/* ── Holographic Notification ─────────────────── */}
            <AnimatePresence>
                {showPrompt && !isOpen && (
                    <motion.div
                        key="holo-notification"
                        initial={{ opacity: 0, scale: 0.85, y: 10, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 8, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        style={{ transformOrigin: 'bottom right' }}
                        onClick={openFromPrompt}
                        className="fixed bottom-44 right-8 z-[101] hidden md:block cursor-pointer group"
                    >
                        {/* Animated gradient border wrapper */}
                        <div className="relative rounded-2xl p-[1px] overflow-hidden">
                            {/* Rotating gradient border */}
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(6,182,212,0.4) 25%, transparent 50%, rgba(139,92,246,0.3) 75%, transparent 100%)',
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                            />
                            {/* Static subtle border fallback */}
                            <div className="absolute inset-0 rounded-2xl border border-white/[0.06]" />

                            {/* Inner card */}
                            <div
                                className="relative rounded-2xl px-5 py-4 flex items-center gap-4"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(9,9,11,0.95) 0%, rgba(15,15,20,0.95) 100%)',
                                    backdropFilter: 'blur(24px)',
                                }}
                            >
                                {/* Inner glow layer */}
                                <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-violet-500/[0.04]" />

                                {/* Shimmer sweep */}
                                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden rounded-t-2xl">
                                    <motion.div
                                        className="h-full w-1/4 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                                        animate={{ x: ['-100%', '500%'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
                                    />
                                </div>

                                {/* Animated status ring */}
                                <div className="relative flex items-center justify-center shrink-0 w-9 h-9">
                                    <motion.div
                                        className="absolute inset-0 rounded-full border border-cyan-500/30"
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                    </div>
                                </div>

                                {/* Text */}
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                                    className="flex flex-col gap-1 pr-6"
                                >
                                    <span className="text-[10px] uppercase bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent font-semibold tracking-[0.2em] font-mono">
                                        Logic Core — Online
                                    </span>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                        className="text-sm text-zinc-300 leading-snug"
                                    >
                                        Sistemas en línea. Habla con Logic Core.
                                    </motion.span>
                                </motion.div>

                                {/* Close button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dismissPrompt();
                                    }}
                                    className="absolute top-3 right-3 p-1.5 rounded-full text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all duration-200"
                                    aria-label="Dismiss"
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M1 1l8 8M9 1l-8 8" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Connector glow line — visual link to avatar below */}
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="absolute -bottom-6 right-10 w-[1px] h-6 origin-top"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(6,182,212,0.3), transparent)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── NeuroAvatar ──────────────────────────────── */}
            <div onClick={toggleChat} role="button" aria-label="Toggle AI Chat">
                <NeuroAvatar isThinking={isThinking} />
            </div>

            {/* ── Chat Window ─────────────────────────────── */}
            <ChatWindow
                messages={messages}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isOpen={isOpen}
                isThinking={isThinking}
                onClose={() => setIsOpen(false)}
                leadContext={leadContext}
            />
        </>
    );
}
