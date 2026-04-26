'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeuroAvatar, AvatarPhase } from './NeuroAvatar';
import { ChatWindow } from './ChatWindow';
import { useLogicAI } from '../hooks/useLogicAI';

import { usePathname } from 'next/navigation';

const INITIAL_DELAY = 3000;   // Show prompt 3s after page load
const IDLE_TIMEOUT = 25000;   // Re-show after 25s of inactivity
const SLEEP_TIMEOUT = 90000;  // 90 seconds sin actividad -> dormir

const IDLE_PROMPTS: Record<string, string[]> = {
    '/web-development': [
        '¿Cómo están encontrándote tus clientes hoy?',
        'Si alguien busca lo que hacés en Google, ¿aparecés?',
        '¿Qué estarías resolviendo si tu web trajera consultas sola?',
    ],
    '/ai-implementations': [
        '¿Qué tarea repetitiva le roba más tiempo a tu equipo?',
        'La IA bien implementada resuelve un problema concreto.',
        '¿Querés entender si esto aplica a tu operación?',
    ],
    '/software-development': [
        '¿Cuántos sistemas distintos usa tu equipo en un día?',
        '¿Hay procesos que dependen de que alguien esté disponible?',
        'Contame cómo opera tu negocio hoy.',
    ],
    '/process-automation': [
        '¿Qué tarea de tu empresa se repite más de 10 veces por semana?',
        '¿Hay algo que siempre queda sin hacer por falta de tiempo?',
        'Un flujo bien armado trabaja aunque nadie esté mirando.',
    ],
    '/contact': [
        '¿Tenés en mente qué necesitás? Podemos charlar antes del formulario.',
        '¿Alguna duda antes de escribirnos?',
        'Si querés, adelantamos la conversación por acá.',
    ],
    default: [
        '¿Cuál es el principal desafío de tu negocio hoy?',
        '¿Qué estarías mejorando si tuvieras más tiempo?',
        'Contame sobre tu operación, sin apuro.',
    ],
};

const getContextPrompts = (pathname: string): string[] => {
    return IDLE_PROMPTS[pathname] || IDLE_PROMPTS.default;
};

/**
 * Main AI Companion Wrapper
 */
export function LogicCompanion() {
    const pathname = usePathname();
    const activePrompts = getContextPrompts(pathname || '/');

    const CONTEXT_COLORS: Record<string, 'cyan' | 'violet' | 'emerald' | 'amber'> = {
        '/web-development': 'cyan',
        '/ai-implementations': 'violet',
        '/process-automation': 'amber',
        '/software-development': 'amber', // indigo no está en palette, fallback amber
        '/contact': 'cyan',
    };

    const getContextColor = (path: string): 'cyan' | 'violet' | 'emerald' | 'amber' | 'cycle' => {
        for (const [key, color] of Object.entries(CONTEXT_COLORS)) {
            if (path.includes(key)) return color;
        }
        return 'cycle'; // landing y otras → cycling default
    };

    const contextColor = getContextColor(pathname || '/');

    const [isOpen, setIsOpen] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptIndex, setPromptIndex] = useState(0);
    const [isBooped, setIsBooped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [hoverPulse, setHoverPulse] = useState(0);
    const [phase, setPhase] = useState<AvatarPhase>('active');
    const [scrollSection, setScrollSection] = useState<string>('top');
    const { messages, input, handleInputChange, handleSubmit, isThinking } = useLogicAI();

    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rotationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasShownOnceRef = useRef(false);
    const messagePulse = Math.max(0, messages.length - 1);
    const lastMessageRole = messages[messages.length - 1]?.role ?? 'assistant';

    // ─── Buoyancy / Scroll Linked Motion ──────────────────
    useEffect(() => {
        function handleScroll() {
            const y = window.scrollY;

            // 1. Detect Active Section
            const sections = document.querySelectorAll('section[id]');
            let current = 'top';
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // If section top is in the upper half of screen
                if (rect.top <= window.innerHeight * 0.5) {
                    current = section.id;
                }
            });
            setScrollSection(current);

            // 2. Auto-Trigger Tooltip (>80% height)
            const scrollPercent = (y + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrollPercent > 0.82 && !isOpen && !showPrompt && !hasShownOnceRef.current) {
                setShowPrompt(true);
                // Cycle to a closing/CTA prompt
                setPromptIndex(3); 
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen, showPrompt]);

    // ─── Cinematic Initialization Sequence ──────────────────
    // ─── Start idle countdown (25s) ──────────────────────────
    const startIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setShowPrompt(true);
        }, IDLE_TIMEOUT);
    }, []);

    // ─── Reset the idle countdown on user activity ───────────
    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        // Despertar si está durmiendo
        if (phase === 'sleeping') setPhase('active');
        if (hasShownOnceRef.current) {
            startIdleTimer();
        }
    }, [startIdleTimer, phase]);

    // ─── Periodic prompt rotation (8s) ────────────────────────
    useEffect(() => {
        if (showPrompt && !isOpen) {
            rotationTimerRef.current = setInterval(() => {
                setPromptIndex(prev => (prev + 1) % activePrompts.length);
            }, 8000);
        } else {
            if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
        }
        return () => {
            if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
        };
    }, [showPrompt, isOpen, activePrompts.length]);

    const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Si el chat está abierto, no dormir
        if (isOpen) {
            if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
            if (phase === 'sleeping') setPhase('active');
            return;
        }

        // Si hay un prompt visible, no dormir
        if (showPrompt) {
            if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
            if (phase === 'sleeping') setPhase('active');
            return;
        }

        // Arrancar el timer de sleep
        if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = setTimeout(() => {
            setPhase('sleeping');
        }, SLEEP_TIMEOUT);

        return () => {
            if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
        };
    }, [isOpen, showPrompt, phase]);

    // ─── Initial 3s entry + idle event listeners ─────────────
    useEffect(() => {
        const initialTimer = setTimeout(() => {
            setShowPrompt(true);
            hasShownOnceRef.current = true;
        }, INITIAL_DELAY);

        const events = ['mousemove', 'keydown', 'scroll', 'touchstart'] as const;
        events.forEach((evt) => window.addEventListener(evt, resetIdleTimer, { passive: true }));

        return () => {
            clearTimeout(initialTimer);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
        };
    }, [resetIdleTimer]);

    // ─── Open chat from external trigger ────────────────────
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
            {/* WRAPPER ÚNICO: avatar + tooltip se anclan acá */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '0.5rem',
                    right: '0.5rem',
                    zIndex: 96,
                    pointerEvents: 'none',
                }}
                className="md:bottom-3 md:right-3"
            >
                {/* TOOLTIP — anclado relativo al wrapper */}
                <AnimatePresence mode="wait">
                    {showPrompt && !isOpen && phase !== 'sleeping' && (
                        <motion.div
                            key={`prompt-${promptIndex}`}
                            initial={{ opacity: 0, y: 12, scale: 0.92, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 6, scale: 0.96, filter: 'blur(4px)' }}
                            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                            onClick={openFromPrompt}
                            className="hidden md:block group"
                            style={{
                                position: 'absolute',
                                bottom: 'calc(100% - 1rem)',
                                right: 'calc(100% - 4rem)',
                                transformOrigin: 'bottom right',
                                // Glassmorphism cyan-aware
                                background: 'linear-gradient(145deg, rgba(6,182,212,0.08) 0%, rgba(8,10,22,0.82) 40%, rgba(8,10,22,0.78) 100%)',
                                backdropFilter: 'blur(28px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                                border: '1px solid rgba(6,182,212,0.22)',
                                borderRadius: '18px',
                                boxShadow: `
                                    0 0 0 1px rgba(255,255,255,0.04),
                                    0 0 24px rgba(6,182,212,0.12),
                                    0 8px 32px rgba(0,0,0,0.55),
                                    inset 0 1px 0 rgba(6,182,212,0.15),
                                    inset 0 -1px 0 rgba(0,0,0,0.3)
                                `,
                                padding: '16px 18px 14px',
                                maxWidth: '252px',
                                minWidth: '200px',
                                zIndex: 101,
                                cursor: 'pointer',
                                pointerEvents: 'auto',
                                overflow: 'visible',
                            }}
                        >
                            {/* Accent line top — cyan */}
                            <motion.div
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '12%',
                                    right: '12%',
                                    height: '1px',
                                    background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.9) 40%, rgba(124,58,237,0.7) 70%, transparent)',
                                    transformOrigin: 'center',
                                }}
                            />

                            {/* Shimmer sweep */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: '18px',
                                overflow: 'hidden',
                                pointerEvents: 'none',
                            }}>
                                <motion.div
                                    aria-hidden="true"
                                    animate={{ x: ['-150%', '250%'] }}
                                    transition={{
                                        duration: 2.2,
                                        repeat: Infinity,
                                        repeatDelay: 5.5,
                                        ease: 'easeInOut',
                                    }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.06), transparent)',
                                        pointerEvents: 'none',
                                        borderRadius: '18px',
                                    }}
                                />
                            </div>

                            {/* Badge develOP */}
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(6,182,212,0.10)',
                                    border: '1px solid rgba(6,182,212,0.25)',
                                    borderRadius: '100px',
                                    padding: '3px 9px',
                                    marginBottom: '10px',
                                }}
                            >
                                <div style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    background: '#06b6d4',
                                    boxShadow: '0 0 6px rgba(6,182,212,0.9)',
                                    animation: 'breathe 2.2s ease-in-out infinite',
                                    flexShrink: 0,
                                }} />
                                <span style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    letterSpacing: '0.18em',
                                    color: 'rgba(6,182,212,0.85)',
                                    fontFamily: 'ui-monospace, monospace',
                                    textTransform: 'uppercase',
                                }}>
                                    develOP · IA
                                </span>
                            </motion.div>

                            {/* Texto principal — más bold y legible */}
                            <motion.p
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.25 }}
                                style={{
                                    fontSize: '13.5px',
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.92)',
                                    margin: '0 0 10px',
                                    lineHeight: 1.5,
                                    letterSpacing: '0.01em',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                }}
                            >
                                {activePrompts[promptIndex % activePrompts.length]}
                            </motion.p>

                            {/* CTA con flecha animada */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.35, delay: 0.38 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <motion.span
                                    style={{
                                        fontSize: '11px',
                                        color: 'rgba(6,182,212,0.75)',
                                        fontWeight: 600,
                                        letterSpacing: '0.04em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                    }}
                                >
                                    Escribime
                                    <motion.span
                                        animate={{ x: [0, 4, 0] }}
                                        transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{ display: 'inline-block' }}
                                    >
                                        →
                                    </motion.span>
                                </motion.span>

                                {/* Hint de tecla */}
                                <span style={{
                                    fontSize: '9px',
                                    color: 'rgba(255,255,255,0.18)',
                                    fontFamily: 'ui-monospace, monospace',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '4px',
                                    padding: '2px 5px',
                                    letterSpacing: '0.04em',
                                }}>
                                    click
                                </span>
                            </motion.div>

                            {/* Close button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    dismissPrompt()
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.3)',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 150ms',
                                    padding: 0,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(6,182,212,0.12)'
                                    e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'
                                    e.currentTarget.style.color = 'rgba(6,182,212,0.9)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                                }}
                                aria-label="Dismiss"
                            >
                                ×
                            </button>

                            {/* TAIL: SVG que conecta tooltip → avatar */}
                            <svg
                                aria-hidden="true"
                                width="80"
                                height="60"
                                viewBox="0 0 80 60"
                                style={{
                                    position: 'absolute',
                                    bottom: '-52px',
                                    right: '-24px',
                                    pointerEvents: 'none',
                                    overflow: 'visible',
                                    zIndex: -1,
                                }}
                            >
                                <defs>
                                    <linearGradient id="tailGradientLogic" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(100,160,255,0.55)" />
                                        <stop offset="50%" stopColor="rgba(140,100,255,0.35)" />
                                        <stop offset="100%" stopColor="rgba(140,100,255,0)" />
                                    </linearGradient>
                                    <filter id="tailGlowLogic">
                                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <motion.path
                                    d="M 8 0 Q 40 28, 65 52"
                                    stroke="url(#tailGradientLogic)"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    fill="none"
                                    filter="url(#tailGlowLogic)"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                />

                                <motion.circle
                                    cx="65"
                                    cy="52"
                                    r="2"
                                    fill="rgba(140,100,255,0.9)"
                                    filter="url(#tailGlowLogic)"
                                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.4, 0.8] }}
                                    transition={{
                                        duration: 1.8,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: 0.7,
                                    }}
                                />

                                <motion.circle
                                    r="1.5"
                                    fill="rgba(180,200,255,1)"
                                    filter="url(#tailGlowLogic)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: 1,
                                    }}
                                >
                                    <animateMotion
                                        dur="2s"
                                        repeatCount="indefinite"
                                        begin="1s"
                                        path="M 8 0 Q 40 28, 65 52"
                                    />
                                </motion.circle>
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AVATAR: ahora es child del wrapper (no fixed) */}
                <div
                    onClick={handleAvatarClick}
                    onMouseEnter={() => {
                        setIsHovered(true);
                        setHoverPulse((prev) => prev + 1);
                        if (phase === 'sleeping') setPhase('active');
                    }}
                    onMouseLeave={() => setIsHovered(false)}
                    role="button"
                    aria-label="Toggle AI Chat"
                    style={{
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        position: 'relative',
                    }}
                >
                    <NeuroAvatar
                        isThinking={isThinking}
                        showPrompt={showPrompt && !isOpen}
                        isBooped={isBooped}
                        isHovered={isHovered}
                        isOpen={isOpen}
                        phase={phase}
                        scrollSection={scrollSection}
                        messagePulse={messagePulse}
                        lastMessageRole={lastMessageRole}
                        hoverPulse={hoverPulse}
                        contextColor={contextColor}
                        embedded
                    />
                </div>
            </div>

            {/* Chat Window queda fuera del wrapper porque tiene su propia posición */}
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
