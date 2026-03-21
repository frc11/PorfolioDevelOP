'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { NeuroAvatar, AvatarPhase } from './NeuroAvatar';
import { ChatWindow } from './ChatWindow';
import { useLogicAI } from '../hooks/useLogicAI';

import { usePathname } from 'next/navigation';

const INITIAL_DELAY = 3000;   // Show prompt 3s after page load
const IDLE_TIMEOUT = 25000;   // Re-show after 25s of inactivity

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

    const [isOpen, setIsOpen] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [promptIndex, setPromptIndex] = useState(0);
    const [isBooped, setIsBooped] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [phase, setPhase] = useState<AvatarPhase>('dormant');
    const [scrollSection, setScrollSection] = useState<string>('top');
    const { messages, input, handleInputChange, handleSubmit, isThinking, leadContext, updateLeadContext } = useLogicAI();

    const scrollYRef = useRef(0);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rotationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasShownOnceRef = useRef(false);

    // ─── Buoyancy / Scroll Linked Motion ──────────────────
    const avatarY = useMotionValue(0);
    const smoothScrollOffset = useSpring(0, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const checkMobile = () => window.innerWidth < 768;
        
        function handleScroll() {
            const y = window.scrollY;
            scrollYRef.current = y;

            // 1. Update Buoyancy (Disabled on mobile)
            if (!checkMobile()) {
                // Move up slightly as we scroll down (max -20px)
                const targetOffset = Math.max(-20, y * -0.015);
                smoothScrollOffset.set(targetOffset);
            } else {
                smoothScrollOffset.set(0);
            }

            // 2. Detect Active Section
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

            // 3. Auto-Trigger Tooltip (>80% height)
            const scrollPercent = (y + window.innerHeight) / document.documentElement.scrollHeight;
            if (scrollPercent > 0.82 && !isOpen && !showPrompt && !hasShownOnceRef.current) {
                setShowPrompt(true);
                // Cycle to a closing/CTA prompt
                setPromptIndex(3); 
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen, showPrompt, smoothScrollOffset]);

    // ─── Cinematic Initialization Sequence ──────────────────
    useEffect(() => {
        // Skip for mobile/reduced motion or if already initialized in this session
        const skipInit = typeof window !== 'undefined' && (
            sessionStorage.getItem('avatarInit') === 'true' || 
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        );

        if (skipInit) {
            setPhase('active');
            return;
        }

        const t1 = setTimeout(() => setPhase('initializing'), 800);
        const t2 = setTimeout(() => {
            setPhase('stabilizing');
            sessionStorage.setItem('avatarInit', 'true');
        }, 2800);
        const t3 = setTimeout(() => setPhase('active'), 4000);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

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
        if (hasShownOnceRef.current) {
            startIdleTimer();
        }
    }, [startIdleTimer]);

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
            {/* ── Glassmorphism 3.0 Tooltip ─────────────────── */}
            <AnimatePresence mode="wait">
                {showPrompt && !isOpen && (
                    <motion.div
                        key={`prompt-${promptIndex}`}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{
                            background: 'rgba(8, 10, 20, 0.72)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            border: '1px solid rgba(180, 210, 255, 0.12)',
                            borderRadius: '16px',
                            boxShadow: `
                                0 0 0 1px rgba(255,255,255,0.04),
                                0 4px 24px rgba(0,0,0,0.5),
                                0 1px 0 rgba(255,255,255,0.08) inset,
                                0 -1px 0 rgba(0,0,0,0.3) inset
                            `,
                            padding: '14px 18px',
                            maxWidth: '240px',
                            minWidth: '180px',
                            position: 'absolute',
                            bottom: '8.5rem',
                            right: '6rem',
                            zIndex: 101,
                            cursor: 'pointer'
                        }}
                        onClick={openFromPrompt}
                        className="hidden md:block group"
                    >
                        {/* Upper accent line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '20%',
                            right: '20%',
                            height: '1px',
                            background: `linear-gradient(90deg, transparent, rgba(100,160,255,0.5) 40%, rgba(140,100,255,0.5) 60%, transparent)`,
                            borderRadius: '1px',
                        }} />

                        {/* Content */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            {/* Pulse indicator */}
                            <div style={{ marginTop: '3px', flexShrink: 0 }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#4488ff',
                                    boxShadow: '0 0 6px rgba(68,136,255,0.6)',
                                    animation: 'breathe 2.5s ease-in-out infinite',
                                }} />
                            </div>

                            {/* Text */}
                            <div>
                                <p style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: 'rgba(255,255,255,0.75)',
                                    margin: 0,
                                    lineHeight: 1.55,
                                    letterSpacing: '0.01em',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                }}>
                                    {activePrompts[promptIndex % activePrompts.length]}
                                </p>

                                {/* Micro CTA */}
                                <p style={{
                                    fontSize: '11px',
                                    color: 'rgba(100,160,255,0.6)',
                                    margin: '5px 0 0',
                                    fontWeight: 500,
                                    letterSpacing: '0.02em',
                                }}>
                                    Escribime →
                                </p>
                            </div>
                        </div>

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
                )}
            </AnimatePresence>

            {/* ── NeuroAvatar ──────────────────────────────── */}
            <motion.div 
                onClick={handleAvatarClick} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                role="button" 
                aria-label="Toggle AI Chat"
                style={{ 
                    y: smoothScrollOffset,
                    cursor: 'pointer' 
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
                />
            </motion.div>



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
