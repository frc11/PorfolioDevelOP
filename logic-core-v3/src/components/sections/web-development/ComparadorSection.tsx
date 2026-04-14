"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls, useInView, useReducedMotion } from 'framer-motion';
import { Check, Clock3, GaugeCircle, Sparkles, Target, X } from 'lucide-react';

const ScrollCue = () => {
    const handleClick = () => {
        document.getElementById('web-development-timeline')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="lg:hidden">
            <div
                className="w-full h-[1px]"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                    margin: '48px 0 32px 0',
                }}
            />

            <p className="text-center text-[14px] text-[#ffffff60] italic">Tu competencia ya esta mirando esto.</p>

            <div
                onClick={handleClick}
                className="flex flex-col items-center relative cursor-pointer z-20 group"
                style={{ marginTop: '64px', paddingBottom: '48px' }}
            >
                <span className="text-[12px] tracking-widest text-[#ffffff40] mb-4">MIRA COMO LO HACEMOS</span>
                <div className="scroll-chevron" style={{ color: '#00e5ff', opacity: 0.6 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 15L12 21L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <style>{`
                  @keyframes bounce-chevron {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(8px); }
                    100% { transform: translateY(0px); }
                  }
                  .scroll-chevron {
                    animation: bounce-chevron 1.5s infinite ease-in-out;
                  }
                `}</style>
            </div>
        </div>
    );
};

export default function ComparadorSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const chaosCardRef = useRef<HTMLDivElement>(null);
    const controlCardRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.15 });
    const isChaosCentered = useInView(chaosCardRef, { margin: '-42% 0px -42% 0px', amount: 0.08 });
    const isControlCentered = useInView(controlCardRef, { margin: '-42% 0px -42% 0px', amount: 0.08 });
    const prefersReduced = useReducedMotion();
    const shouldReveal = prefersReduced || isInView;
    const chaosGlowControls = useAnimationControls();
    const controlGlowControls = useAnimationControls();
    const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
    const [chaosHovered, setChaosHovered] = useState(false);
    const [controlHovered, setControlHovered] = useState(false);

    const caosItems = [
        'Respondes precios 100 veces por dia',
        'Si no contestas, el cliente se va',
        'Dependes del algoritmo de Instagram',
        'A las 2AM, el cliente no puede comprarte',
        'Google no sabe que existis',
    ];

    const controlItems = [
        'Tu web cotiza sola mientras dormis',
        'Google te trae clientes listos para comprar',
        'Tu catalogo actualizado sin llamarte',
        'Pedidos a las 3AM sin que estes presente',
        'Primero en Google en tu ciudad',
    ];

    const chaosSignals = ['+8h semanales en respuestas manuales', 'Visibilidad local casi nula'];
    const controlSignals = ['Primera respuesta en menos de 15s', 'Flujo de leads activo 24/7'];
    const centerCardHoverByViewport = !prefersReduced && isTabletOrMobile;
    const chaosCardActive = centerCardHoverByViewport ? isChaosCentered : chaosHovered;
    const controlCardActive = centerCardHoverByViewport ? isControlCentered : controlHovered;

    useEffect(() => {
        const media = window.matchMedia('(max-width: 1023px)');
        const sync = () => setIsTabletOrMobile(media.matches);
        sync();

        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', sync);
            return () => media.removeEventListener('change', sync);
        }

        media.addListener(sync);
        return () => media.removeListener(sync);
    }, []);

    useEffect(() => {
        let cancelled = false;
        let chaosTimer: ReturnType<typeof window.setTimeout> | null = null;
        let controlTimer: ReturnType<typeof window.setTimeout> | null = null;

        const wait = (ms: number, kind: 'chaos' | 'control') =>
            new Promise<void>((resolve) => {
                const timeout = window.setTimeout(resolve, ms);
                if (kind === 'chaos') chaosTimer = timeout;
                else controlTimer = timeout;
            });

        const runChaosPulse = async () => {
            chaosGlowControls.set({ opacity: 0.24, scale: 1, x: 0, y: 0 });
            while (!cancelled) {
                const peak = 0.52 + Math.random() * 0.26;
                const duration = 3.2 + Math.random() * 4.1;
                const driftX = (Math.random() - 0.5) * 10;
                const driftY = (Math.random() - 0.5) * 7.5;

                try {
                    await chaosGlowControls.start({
                        opacity: [0.24, peak, 0.2 + Math.random() * 0.08],
                        scale: [1, 1.06 + Math.random() * 0.05, 1],
                        x: [0, driftX, 0],
                        y: [0, driftY, 0],
                        transition: { duration, ease: 'easeInOut', times: [0, 0.52, 1] },
                    });
                } catch {
                    return;
                }

                const rest = 560 + Math.floor(Math.random() * 2100);
                await wait(rest, 'chaos');
            }
        };

        const runControlPulse = async () => {
            controlGlowControls.set({ opacity: 0.22, scale: 1, x: 0, y: 0 });
            while (!cancelled) {
                const peak = 0.46 + Math.random() * 0.28;
                const duration = 3.6 + Math.random() * 4.8;
                const driftX = (Math.random() - 0.5) * 10.5;
                const driftY = (Math.random() - 0.5) * 8;

                try {
                    await controlGlowControls.start({
                        opacity: [0.22, peak, 0.18 + Math.random() * 0.08],
                        scale: [1, 1.055 + Math.random() * 0.05, 1],
                        x: [0, driftX, 0],
                        y: [0, driftY, 0],
                        transition: { duration, ease: 'easeInOut', times: [0, 0.48, 1] },
                    });
                } catch {
                    return;
                }

                const rest = 900 + Math.floor(Math.random() * 2600);
                await wait(rest, 'control');
            }
        };

        if (!shouldReveal || prefersReduced) {
            chaosGlowControls.set({ opacity: 0.24, scale: 1, x: 0, y: 0 });
            controlGlowControls.set({ opacity: 0.22, scale: 1, x: 0, y: 0 });
            return () => {
                cancelled = true;
            };
        }

        runChaosPulse();
        runControlPulse();

        return () => {
            cancelled = true;
            if (chaosTimer) window.clearTimeout(chaosTimer);
            if (controlTimer) window.clearTimeout(controlTimer);
            chaosGlowControls.stop();
            controlGlowControls.stop();
        };
    }, [chaosGlowControls, controlGlowControls, prefersReduced, shouldReveal]);

    return (
        <motion.section
            ref={containerRef}
            className="relative flex w-full min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080810] px-4 py-[clamp(56px,8vh,96px)] lg:min-h-[820px] lg:py-14 xl:py-16"
        >
            <style>{`
                .caos-card::before {
                  content: '';
                  position: absolute;
                  top: -100px;
                  left: -100px;
                  width: 200px;
                  height: 200px;
                  background: radial-gradient(circle, rgba(255,68,68,0.14) 0%, transparent 70%);
                  filter: blur(60px);
                  pointer-events: none;
                  z-index: -1;
                }
                .control-card::before {
                  content: '';
                  position: absolute;
                  top: -125px;
                  right: -125px;
                  width: 250px;
                  height: 250px;
                  background: radial-gradient(circle, rgba(0,229,255,0.10) 0%, transparent 70%);
                  filter: blur(80px);
                  pointer-events: none;
                  z-index: -1;
                }
                .comparador-item {
                  transition: transform 220ms ease, background-color 220ms ease, box-shadow 220ms ease;
                  border-radius: 8px;
                  transform: translateZ(0);
                  backface-visibility: hidden;
                }
                @media (hover: hover) and (pointer: fine) and (min-width: 1024px) {
                  .comparador-item:hover {
                    background-color: rgba(255, 255, 255, 0.024);
                    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
                    transform: translateX(4px) translateZ(0);
                  }
                }
                .signal-pill {
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
                }
            `}</style>

            <div
                className="absolute pointer-events-none z-0"
                aria-hidden="true"
                style={{
                    top: '20%',
                    left: '-60px',
                    width: '450px',
                    height: '450px',
                    background: 'radial-gradient(circle, rgba(255,68,68,0.08) 0%, transparent 65%)',
                    filter: 'blur(90px)',
                }}
            />
            <div
                className="absolute pointer-events-none z-0"
                aria-hidden="true"
                style={{
                    top: '20%',
                    right: '-60px',
                    width: '450px',
                    height: '450px',
                    background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 65%)',
                    filter: 'blur(90px)',
                }}
            />

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="mx-auto flex w-full max-w-7xl flex-col items-center space-y-3 px-2 py-1 text-center md:px-4 md:py-2 lg:space-y-2">
                    <motion.span
                        initial={{ opacity: 0, y: 14 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                        transition={{ duration: prefersReduced ? 0 : 0.78, delay: 0 }}
                        className="relative z-10 block font-mono uppercase text-[#00e5ff]"
                        style={{ fontSize: '11px', letterSpacing: '0.4em', marginBottom: '10px' }}
                    >
                        [ EL ANTES Y EL DESPUES ]
                    </motion.span>

                    <div className="relative">
                        {!prefersReduced && (
                            <motion.div
                                aria-hidden="true"
                                initial={{ opacity: 0, scale: 0.86, y: 22 }}
                                animate={shouldReveal ? { opacity: [0, 0.95, 0.26], scale: [0.86, 1.08, 1], y: [22, 0, -4] } : { opacity: 0 }}
                                transition={{ duration: 1.55, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                                className="pointer-events-none absolute inset-x-[20%] top-[30%] h-24 rounded-full blur-[38px]"
                                style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.86) 0%, rgba(6,182,212,0.58) 40%, transparent 100%)' }}
                            />
                        )}

                        <h2 className="flex flex-col items-center py-2 text-center text-[clamp(34px,5.2vw,68px)] leading-[1.14] tracking-tight lg:py-1">
                            <motion.span
                                initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 32, filter: 'blur(10px) brightness(1.8)' }}
                                animate={shouldReveal ? { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)' } : { opacity: 0, y: 32 }}
                                transition={{ duration: prefersReduced ? 0 : 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
                                className="block pb-[0.06em] font-black text-white"
                            >
                                Dos negocios iguales.
                            </motion.span>
                            <motion.span
                                initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 34, filter: 'blur(10px) brightness(2)' }}
                                animate={shouldReveal ? { opacity: 1, y: 0, filter: 'blur(0px) brightness(1)' } : { opacity: 0, y: 34 }}
                                transition={{ duration: prefersReduced ? 0 : 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
                                className="block bg-clip-text pb-[0.06em] font-black text-transparent"
                                style={{
                                    backgroundImage: 'linear-gradient(135deg, #00e5ff 0%, #0891b2 100%)',
                                    WebkitBackgroundClip: 'text',
                                }}
                            >
                                Uno gana clientes 24/7.
                            </motion.span>
                        </h2>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                        transition={{ duration: prefersReduced ? 0 : 0.8, delay: 0.55 }}
                        className="text-center text-[17px]"
                        style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '540px', margin: '10px auto 0', fontWeight: 500 }}
                    >
                        ¿En cual estas vos?
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                        transition={{ duration: prefersReduced ? 0 : 0.9, delay: 0.72 }}
                        className="mt-4 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2.5"
                    >
                        <span className="signal-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] tracking-[0.08em] text-white/68">
                            <Clock3 className="h-3.5 w-3.5 text-cyan-300/80" />
                            Tiempo de respuesta real
                        </span>
                        <span className="signal-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] tracking-[0.08em] text-white/68">
                            <GaugeCircle className="h-3.5 w-3.5 text-cyan-300/80" />
                            Fricción de compra
                        </span>
                        <span className="signal-pill inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] tracking-[0.08em] text-white/68">
                            <Target className="h-3.5 w-3.5 text-cyan-300/80" />
                            Calidad de lead
                        </span>
                    </motion.div>
                </div>

                <div className="relative mx-auto mt-8 flex w-full max-w-7xl flex-col justify-center gap-6 lg:mt-6 lg:flex-row lg:gap-10">
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full flex-col items-center justify-center pointer-events-none z-10 w-[40px]">
                        <div className="h-[40%] w-[1px] bg-[rgba(255,255,255,0.12)]"></div>
                        <div className="flex items-center gap-1 my-5 rotate-90 lg:rotate-0 relative z-20 text-[11px] text-[#ffffff50] font-mono tracking-[0.12em]" style={{ textShadow: '0 0 20px rgba(255,255,255,0.15)' }}>
                            <span className="font-semibold">VS</span>
                        </div>
                        <div className="h-[40%] w-[1px] bg-[rgba(255,255,255,0.12)]"></div>
                    </div>

                    <motion.div
                        initial={{ x: -56, y: 20, opacity: 0, scale: 0.98 }}
                        animate={shouldReveal ? { x: 0, y: 0, opacity: 1, scale: 1 } : { x: -56, y: 20, opacity: 0, scale: 0.98 }}
                        transition={{ duration: prefersReduced ? 0 : 1.08, delay: prefersReduced ? 0 : 0.52, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 flex w-full lg:w-[42%]"
                    >
                        <motion.div
                            ref={chaosCardRef}
                            onHoverStart={() => {
                                if (!isTabletOrMobile) setChaosHovered(true);
                            }}
                            onHoverEnd={() => setChaosHovered(false)}
                            initial={false}
                            animate={
                                chaosCardActive
                                    ? {
                                        scale: 1.017,
                                        y: -4,
                                        backgroundColor: 'rgba(255, 68, 68, 0.12)',
                                        borderColor: 'rgba(255, 92, 92, 0.62)',
                                        boxShadow:
                                            '0 0 0 1px rgba(255,84,84,0.34), 0 0 36px rgba(255,68,68,0.34), 0 22px 54px rgba(0,0,0,0.34)',
                                    }
                                    : {
                                        scale: 1,
                                        y: 0,
                                        backgroundColor: 'rgba(255, 68, 68, 0.07)',
                                        borderColor: 'rgba(255, 68, 68, 0.3)',
                                        boxShadow: '0 0 0 1px rgba(255,84,84,0), 0 10px 28px rgba(0,0,0,0.22)',
                                    }
                            }
                            transition={{ duration: prefersReduced ? 0 : 0.1, ease: 'linear' }}
                            className="caos-card relative flex w-full flex-col overflow-hidden rounded-[16px] border p-6 md:p-8 lg:p-7"
                            style={{
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                willChange: 'transform',
                            }}
                        >
                            {!prefersReduced && (
                                <motion.div
                                    aria-hidden="true"
                                    animate={chaosGlowControls}
                                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                                >
                                    <div
                                        className="absolute -left-[26%] -top-[26%] h-[72%] w-[66%] rounded-full blur-[66px]"
                                        style={{ background: 'radial-gradient(circle, rgba(255,88,88,0.72) 0%, rgba(255,88,88,0.22) 44%, transparent 78%)' }}
                                    />
                                    <div
                                        className="absolute right-[-20%] bottom-[-28%] h-[72%] w-[62%] rounded-full blur-[74px]"
                                        style={{ background: 'radial-gradient(circle, rgba(255,64,64,0.46) 0%, rgba(255,64,64,0.14) 46%, transparent 80%)' }}
                                    />
                                    <div
                                        className="absolute left-[28%] top-[36%] h-[42%] w-[44%] rounded-full blur-[52px]"
                                        style={{ background: 'radial-gradient(circle, rgba(255,96,96,0.24) 0%, transparent 76%)' }}
                                    />
                                </motion.div>
                            )}
                            <motion.div
                                aria-hidden="true"
                                initial={false}
                                animate={{ opacity: chaosCardActive ? 0.34 : 0.14 }}
                                transition={{ duration: prefersReduced ? 0 : 0.1, ease: 'linear' }}
                                className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
                                style={{
                                    background:
                                        'radial-gradient(120% 80% at 0% 0%, rgba(255,120,120,0.2) 0%, transparent 64%), radial-gradient(120% 70% at 100% 100%, rgba(255,82,82,0.22) 0%, transparent 68%)',
                                }}
                            />

                            <div className="relative z-10 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-[6px]" style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)' }}>
                                        <X className="h-3.5 w-3.5 text-[#ff4444]" strokeWidth={2.4} />
                                    </div>
                                    <h3 className="text-[#ff4444] font-bold text-[13px]" style={{ letterSpacing: '0.12em', textShadow: '0 0 20px rgba(255,68,68,0.4)' }}>
                                        EL NEGOCIO DE INSTAGRAM
                                    </h3>
                                </div>
                                <div className="w-full shrink-0" style={{ height: '1px', margin: '16px 0', background: 'linear-gradient(90deg, rgba(255,68,68,0.4), transparent)' }} />
                            </div>
                            <ul className="relative z-10 flex w-full flex-col">
                                {caosItems.map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                        transition={{ duration: prefersReduced ? 0 : 0.54, ease: 'easeOut', delay: prefersReduced ? 0 : 1.08 + i * 0.09 }}
                                        className={`comparador-item flex items-start gap-4 py-[12px] px-2 -mx-2 ${i !== caosItems.length - 1 ? 'border-b border-[rgba(255,68,68,0.08)]' : ''}`}
                                    >
                                        <span className="text-[#ff4444] text-[10px] shrink-0 mt-[3px] font-bold flex items-center justify-center bg-[rgba(255,68,68,0.15)] rounded-full w-[20px] h-[20px]">
                                            <X className="h-3 w-3" strokeWidth={2.6} />
                                        </span>
                                        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">{item}</p>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="relative z-10 mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {chaosSignals.map((signal) => (
                                    <div
                                        key={signal}
                                        className="signal-pill rounded-[10px] border border-white/10 bg-black/20 px-3 py-2 text-[11px] leading-relaxed text-zinc-300/85"
                                    >
                                        {signal}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ x: 56, y: 20, opacity: 0, scale: 0.98 }}
                        animate={shouldReveal ? { x: 0, y: 0, opacity: 1, scale: 1 } : { x: 56, y: 20, opacity: 0, scale: 0.98 }}
                        transition={{ duration: prefersReduced ? 0 : 1.08, delay: prefersReduced ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 flex w-full lg:w-[42%]"
                    >
                        <motion.div
                            ref={controlCardRef}
                            onHoverStart={() => {
                                if (!isTabletOrMobile) setControlHovered(true);
                            }}
                            onHoverEnd={() => setControlHovered(false)}
                            initial={false}
                            animate={
                                controlCardActive
                                    ? {
                                        scale: 1.017,
                                        y: -4,
                                        backgroundColor: 'rgba(0, 229, 255, 0.12)',
                                        borderColor: 'rgba(34, 211, 238, 0.58)',
                                        boxShadow:
                                            '0 0 0 1px rgba(34,211,238,0.32), 0 0 34px rgba(34,211,238,0.32), 0 22px 54px rgba(0,0,0,0.32)',
                                    }
                                    : {
                                        scale: 1,
                                        y: 0,
                                        backgroundColor: 'rgba(0, 229, 255, 0.06)',
                                        borderColor: 'rgba(0, 229, 255, 0.25)',
                                        boxShadow: '0 0 0 1px rgba(34,211,238,0), 0 10px 28px rgba(0,0,0,0.22)',
                                    }
                            }
                            transition={{ duration: prefersReduced ? 0 : 0.1, ease: 'linear' }}
                            className="control-card relative flex w-full flex-col overflow-hidden rounded-[16px] border p-6 md:p-8 lg:p-7"
                            style={{
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                willChange: 'transform',
                            }}
                        >
                            {!prefersReduced && (
                                <motion.div
                                    aria-hidden="true"
                                    animate={controlGlowControls}
                                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
                                >
                                    <div
                                        className="absolute -left-[24%] -top-[26%] h-[72%] w-[66%] rounded-full blur-[64px]"
                                        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.62) 0%, rgba(0,229,255,0.2) 44%, transparent 78%)' }}
                                    />
                                    <div
                                        className="absolute right-[-18%] bottom-[-26%] h-[72%] w-[62%] rounded-full blur-[74px]"
                                        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.42) 0%, rgba(34,211,238,0.14) 46%, transparent 80%)' }}
                                    />
                                    <div
                                        className="absolute left-[30%] top-[35%] h-[42%] w-[44%] rounded-full blur-[50px]"
                                        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.22) 0%, transparent 76%)' }}
                                    />
                                </motion.div>
                            )}
                            <motion.div
                                aria-hidden="true"
                                initial={false}
                                animate={{ opacity: controlCardActive ? 0.36 : 0.14 }}
                                transition={{ duration: prefersReduced ? 0 : 0.1, ease: 'linear' }}
                                className="pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
                                style={{
                                    background:
                                        'radial-gradient(120% 80% at 0% 0%, rgba(34,211,238,0.2) 0%, transparent 64%), radial-gradient(120% 70% at 100% 100%, rgba(0,229,255,0.22) 0%, transparent 68%)',
                                }}
                            />

                            <div className="relative z-10 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-[6px]" style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)' }}>
                                        <Sparkles className="h-3.5 w-3.5 text-[#00e5ff]" strokeWidth={2.4} />
                                    </div>
                                    <h3 className="text-[#00e5ff] font-bold text-[13px]" style={{ letterSpacing: '0.12em', textShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
                                        LA SUCURSAL DIGITAL
                                    </h3>
                                </div>
                                <div className="w-full h-[1px]" style={{ margin: '16px 0', background: 'linear-gradient(90deg, rgba(0,229,255,0.4), transparent)' }} />
                            </div>

                            <ul className="relative z-10 flex w-full flex-col">
                                {controlItems.map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                                        transition={{ duration: prefersReduced ? 0 : 0.54, ease: 'easeOut', delay: prefersReduced ? 0 : 1.08 + i * 0.09 }}
                                        className={`comparador-item flex items-start gap-4 py-[12px] px-2 -mx-2 ${i !== controlItems.length - 1 ? 'border-b border-[rgba(0,229,255,0.08)]' : ''}`}
                                    >
                                        <span className="text-[#00e5ff] text-[10px] shrink-0 mt-[3px] font-bold flex items-center justify-center bg-[rgba(0,229,255,0.12)] rounded-full w-[20px] h-[20px]">
                                            <Check className="h-3 w-3" strokeWidth={2.8} />
                                        </span>
                                        <p className="text-white text-sm md:text-base leading-relaxed drop-shadow-sm">{item}</p>
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="relative z-10 mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {controlSignals.map((signal) => (
                                    <div
                                        key={signal}
                                        className="signal-pill rounded-[10px] border border-cyan-300/20 bg-cyan-400/[0.06] px-3 py-2 text-[11px] leading-relaxed text-cyan-100/86"
                                    >
                                        {signal}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                    transition={{ duration: prefersReduced ? 0 : 0.85, delay: prefersReduced ? 0 : 1.55 }}
                    className="relative z-20 mt-8 flex w-full max-w-[560px] justify-center px-2 lg:mt-5"
                >
                    <motion.div
                        animate={
                            shouldReveal && !prefersReduced
                                ? { borderColor: ['rgba(0,229,255,0.10)', 'rgba(0,229,255,0.40)', 'rgba(0,229,255,0.10)'] }
                                : { borderColor: 'rgba(0,229,255,0.15)' }
                        }
                        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 2.1 }}
                        className="block w-full rounded-full border-[1px] border-solid bg-white/5 px-5 py-4 text-center shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md md:px-7"
                    >
                        <span className="text-sm font-light leading-relaxed tracking-wide text-zinc-300 md:text-base">
                            <Target className="mr-1.5 inline h-4 w-4 text-cyan-300/85" />
                            47 negocios locales ya eligieron <br className="md:hidden" />El Control <span className="mx-1">-&gt;</span>
                            <strong className="text-[#00e5ff] font-bold ml-1 whitespace-nowrap">{'¿Y\u00a0vos?'}</strong>
                        </span>
                    </motion.div>
                </motion.div>

                <ScrollCue />
            </div>
        </motion.section>
    );
}
