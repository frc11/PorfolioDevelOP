'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuroAvatar } from './NeuroAvatar';
import { ChatWindow } from './ChatWindow';
import { useLogicAI } from '../hooks/useLogicAI';

import { usePathname } from 'next/navigation';

const INITIAL_DELAY = 3000;   // Show prompt 3s after page load
const IDLE_TIMEOUT = 15000;   // Re-show after 15s of inactivity

const getContextPrompts = (pathname: string) => {
    if (pathname === '/') {
        return [{ badge: "AI_ASSISTANT // V1.0", title: "> MEJORA_TU_NEGOCIO...", body: "He analizado tu perfil. ¿Impulsamos tu próximo proyecto hoy?" }];
    }
    if (pathname.includes('/ai-implementations')) {
        return [{ badge: "INNOVACIÓN // ACTIVA", title: "> REDUCCIÓN_DE_COSTOS...", body: "Los Agentes de IA pueden reducir tus costos un 40%. ¿Te muestro cómo aplicarlo a tu empresa?" }];
    }
    if (pathname.includes('/process-automation')) {
        return [{ badge: "SISTEMA // LISTO", title: "> OPTIMIZANDO_RUTINAS...", body: "Veo que te interesa n8n. ¿Calculamos cuántas horas de trabajo manual podemos automatizarte hoy?" }];
    }
    if (pathname.includes('/software-development')) {
        return [{ badge: "ARQUITECTURA // ALTA", title: "> INGENIERÍA_SÓLIDA...", body: "El código barato sale caro. ¿Analizamos la arquitectura de tu próximo sistema a medida?" }];
    }
    if (pathname.includes('/web-development')) {
        return [{ badge: "UX_UI // PREMIUM", title: "> CONVERSIÓN_ALTA...", body: "Tu competencia está mejorando su retención web. ¿Diseñamos una experiencia premium para tu marca?" }];
    }
    // Default
    return [{ badge: "AI_ASSISTANT // V1.0", title: "> SISTEMAS_ONLINE...", body: "Sistemas en línea. ¿En qué te puedo ayudar hoy?" }];
};

/**
 * Main AI Companion Wrapper
 * Combines NeuroAvatar with ChatWindow, manages state,
 * and orchestrates the Smart Tooltip idle-detection system.
 */
export function LogicCompanion() {
    const pathname = usePathname();
    const activePrompts = getContextPrompts(pathname || '/');

    const [isOpen, setIsOpen] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptIndex, setPromptIndex] = useState(0);
    const [isBooped, setIsBooped] = useState(false);
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

    // ─── Open chat from external trigger (AiSection demo badge) ──
    useEffect(() => {
        const handleOpenMascot = () => {
            setShowPrompt(false);
            setIsOpen(true);
        };
        window.addEventListener('open-mascot-chat', handleOpenMascot);
        return () => window.removeEventListener('open-mascot-chat', handleOpenMascot);
    }, []);

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
    const handleAvatarClick = () => {
        setIsBooped(true);
        setTimeout(() => setIsBooped(false), 600);
        setIsOpen((prev) => !prev);
    };

    const dismissPrompt = () => {
        setShowPrompt(false);
        hasShownOnceRef.current = true;
        setPromptIndex(prev => (prev + 1) % activePrompts.length);
        startIdleTimer();
    };

    const openFromPrompt = () => {
        setShowPrompt(false);
        setPromptIndex(prev => (prev + 1) % activePrompts.length);
        setIsOpen(true);
    };

    return (
        <>
            {/* ── Holographic Notification ─────────────────── */}
            <AnimatePresence>
                {showPrompt && !isOpen && (
                    <motion.div
                        key="holo-notification"
                        initial={{ opacity: 0, scale: 0.8, x: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, x: 10, filter: 'blur(4px)' }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        style={{ transformOrigin: 'bottom right' }}
                        onClick={openFromPrompt}
                        className="fixed bottom-[8.5rem] right-24 z-[101] hidden md:block cursor-pointer group"
                    >
                        {/* Neural Link (Connector Ray) */}
                        <div
                            className="absolute top-[100%] right-[-2.5rem] w-28 h-16 pointer-events-none -z-10"
                            style={{
                                maskImage: 'linear-gradient(to bottom, transparent 2px, black 12px)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent 2px, black 12px)'
                            }}
                        >
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                <motion.line
                                    x1="10%" y1="0%"
                                    x2="85%" y2="100%"
                                    stroke="url(#cyan-glow)"
                                    strokeWidth="1.5"
                                    className="animate-pulse"
                                    strokeDasharray="4 2"
                                />
                                <defs>
                                    <linearGradient id="cyan-glow" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Animated gradient border wrapper with Clip Path */}
                        <div
                            className="relative p-[1px] overflow-visible"
                            style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                        >
                            {/* Rotating gradient border (simulating energetic outline) */}
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(6,182,212,0.8) 25%, transparent 50%, rgba(139,92,246,0.6) 75%, transparent 100%)',
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            />

                            {/* Inner card — HUD style */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.02, 1],
                                    boxShadow: [
                                        '0 0 0px rgba(6,182,212,0)',
                                        '0 0 25px rgba(6,182,212,0.4)',
                                        '0 0 0px rgba(6,182,212,0)'
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} // Smooth attention pulse
                                className="relative px-5 py-4 flex flex-col gap-3 font-mono border-white/10"
                                style={{
                                    background: 'rgba(9, 9, 11, 0.85)',
                                    backgroundImage: 'radial-gradient(rgba(6,182,212,0.15) 1px, transparent 1px)',
                                    backgroundSize: '6px 6px',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
                                }}
                            >
                                {/* Shimmer sweep (repeats every 5s) */}
                                <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden pointer-events-none">
                                    <motion.div
                                        className="h-full w-1/4 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent"
                                        animate={{ x: ['-200%', '600%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
                                    />
                                </div>

                                {/* Text & Copys */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                                    className="flex flex-col gap-2 pr-6 w-64"
                                >
                                    {/* Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="bg-cyan-400 text-zinc-950 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-widest shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse">
                                            [ {activePrompts[promptIndex % activePrompts.length].badge} ]
                                        </span>
                                    </div>

                                    {/* Título tipo máquina de escribir */}
                                    <motion.div
                                        key={`title-${pathname}-${promptIndex}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ delay: 0.3, duration: 1.2, ease: 'linear' }}
                                        className="overflow-hidden whitespace-nowrap border-r-2 border-cyan-400 pr-1"
                                    >
                                        <span className="text-[11px] text-cyan-400/80 uppercase font-bold tracking-wider">
                                            {activePrompts[promptIndex % activePrompts.length].title}
                                        </span>
                                    </motion.div>

                                    {/* Cuerpo (Pregunta) */}
                                    <motion.span
                                        key={`body-${pathname}-${promptIndex}`}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.6, duration: 0.5, ease: 'easeOut' }}
                                        className="text-xs text-zinc-200 w-[95%] font-medium leading-relaxed drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
                                    >
                                        {activePrompts[promptIndex % activePrompts.length].body}
                                    </motion.span>
                                </motion.div>

                                {/* Close button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dismissPrompt();
                                    }}
                                    className="absolute top-2.5 right-2.5 p-1 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors duration-200"
                                    aria-label="Dismiss"
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M1 1l8 8M9 1l-8 8" />
                                    </svg>
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── NeuroAvatar ──────────────────────────────── */}
            <div onClick={handleAvatarClick} role="button" aria-label="Toggle AI Chat">
                <NeuroAvatar isThinking={isThinking} messages={messages} showPrompt={showPrompt && !isOpen} isBooped={isBooped} isOpen={isOpen} />
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
            />
        </>
    );
}
