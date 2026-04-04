"use client";

import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const ScrollCue = () => {
    const handleClick = () => {
        document.getElementById('web-development-timeline')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
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
        </>
    );
};

export default function ComparadorSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.15 });
    const prefersReduced = useReducedMotion();
    const shouldReveal = prefersReduced || isInView;

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

    return (
        <motion.section
            ref={containerRef}
            className="w-full min-h-screen bg-[#080810] flex flex-col items-center justify-center relative overflow-hidden"
            style={{ padding: 'clamp(60px, 8vh, 100px) 24px' }}
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
                  transition: transform 200ms ease, background-color 200ms ease;
                  border-radius: 8px;
                  transform: translateZ(0);
                  backface-visibility: hidden;
                }
                .comparador-item:hover {
                  background-color: rgba(255, 255, 255, 0.02);
                  transform: translateX(4px) translateZ(0);
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
                <div className="flex flex-col items-center text-center space-y-4 w-full max-w-7xl mx-auto px-2 py-2 md:px-4 md:py-3">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: prefersReduced ? 0 : 0.5, delay: 0 }}
                        className="text-[#00e5ff] font-mono uppercase block relative z-10"
                        style={{ fontSize: '11px', letterSpacing: '0.4em', marginBottom: '16px' }}
                    >
                        [ EL ANTES Y EL DESPUES ]
                    </motion.span>

                    <h2 className="text-[clamp(36px,5.5vw,72px)] text-center leading-[1.19] tracking-tight flex flex-col items-center py-3 md:py-4">
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: prefersReduced ? 0 : 0.6, ease: [0.16, 1, 0.3, 1], delay: prefersReduced ? 0 : 0 }}
                            className="font-black text-white block pb-[0.06em]"
                        >
                            Dos negocios iguales.
                        </motion.span>
                        <motion.span
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            animate={shouldReveal ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                            transition={{ duration: prefersReduced ? 0 : 0.6, ease: [0.16, 1, 0.3, 1], delay: prefersReduced ? 0 : 0.2 }}
                            className="font-black text-transparent bg-clip-text block pb-[0.06em]"
                            style={{
                                backgroundImage: 'linear-gradient(135deg, #00e5ff 0%, #0891b2 100%)',
                                WebkitBackgroundClip: 'text',
                            }}
                        >
                            Uno gana clientes 24/7.
                        </motion.span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: prefersReduced ? 0 : 0.5, delay: 0.4 }}
                        className="text-[17px] text-center"
                        style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '480px', margin: '16px auto 0', fontWeight: 500 }}
                    >
                        ¿En cual estas vos?
                    </motion.p>
                </div>

                <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row justify-center gap-6 lg:gap-12 mt-[clamp(32px,4vh,48px)]">
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-full flex-col items-center justify-center pointer-events-none z-10 w-[40px]">
                        <div className="h-[40%] w-[1px] bg-[rgba(255,255,255,0.12)]"></div>
                        <div className="flex items-center gap-1 my-5 rotate-90 lg:rotate-0 relative z-20 text-[11px] text-[#ffffff50] font-mono tracking-[0.12em]" style={{ textShadow: '0 0 20px rgba(255,255,255,0.15)' }}>
                            <span className="font-semibold">VS</span>
                        </div>
                        <div className="h-[40%] w-[1px] bg-[rgba(255,255,255,0.12)]"></div>
                    </div>

                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={shouldReveal ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                        transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.4 }}
                        className="caos-card w-full lg:w-[40%] rounded-[16px] p-8 lg:p-10 flex flex-col relative z-10 overflow-hidden"
                        style={{
                            backgroundColor: 'rgba(255, 68, 68, 0.07)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            willChange: 'transform',
                        }}
                    >
                        <div className="mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-[6px]" style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.3)' }}>
                                    <span className="text-[#ff4444] text-[12px] font-bold">x</span>
                                </div>
                                <h3 className="text-[#ff4444] font-bold text-[13px]" style={{ letterSpacing: '0.12em', textShadow: '0 0 20px rgba(255,68,68,0.4)' }}>
                                    EL NEGOCIO DE INSTAGRAM
                                </h3>
                            </div>
                            <div className="w-full shrink-0" style={{ height: '1px', margin: '16px 0', background: 'linear-gradient(90deg, rgba(255,68,68,0.4), transparent)' }} />
                        </div>

                        <ul className="flex flex-col w-full">
                            {caosItems.map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                    transition={{ duration: prefersReduced ? 0 : 0.4, ease: 'easeOut', delay: prefersReduced ? 0 : 0.8 + i * 0.06 }}
                                    className={`comparador-item flex items-start gap-4 py-[12px] px-2 -mx-2 ${i !== caosItems.length - 1 ? 'border-b border-[rgba(255,68,68,0.08)]' : ''}`}
                                >
                                    <span className="text-[#ff4444] text-[10px] shrink-0 mt-[4px] font-bold flex items-center justify-center bg-[rgba(255,68,68,0.15)] rounded-full w-[20px] h-[20px]">x</span>
                                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed">{item}</p>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        animate={shouldReveal ? { x: 0, opacity: 1 } : { x: 30, opacity: 0 }}
                        transition={{ duration: prefersReduced ? 0 : 0.7, delay: prefersReduced ? 0 : 0.4 }}
                        className="control-card w-full lg:w-[40%] rounded-[16px] p-8 lg:p-10 flex flex-col relative z-10 overflow-hidden"
                        style={{
                            backgroundColor: 'rgba(0, 229, 255, 0.06)',
                            border: '1px solid rgba(0, 229, 255, 0.25)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            willChange: 'transform',
                        }}
                    >
                        <div className="mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center shrink-0 w-[28px] h-[28px] rounded-[6px]" style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)' }}>
                                    <span className="text-[#00e5ff] text-[12px] font-bold">*</span>
                                </div>
                                <h3 className="text-[#00e5ff] font-bold text-[13px]" style={{ letterSpacing: '0.12em', textShadow: '0 0 20px rgba(0,229,255,0.4)' }}>
                                    LA SUCURSAL DIGITAL
                                </h3>
                            </div>
                            <div className="w-full h-[1px]" style={{ margin: '16px 0', background: 'linear-gradient(90deg, rgba(0,229,255,0.4), transparent)' }} />
                        </div>

                        <ul className="flex flex-col w-full">
                            {controlItems.map((item, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={shouldReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                                    transition={{ duration: prefersReduced ? 0 : 0.4, ease: 'easeOut', delay: prefersReduced ? 0 : 0.8 + i * 0.06 }}
                                    className={`comparador-item flex items-start gap-4 py-[12px] px-2 -mx-2 ${i !== controlItems.length - 1 ? 'border-b border-[rgba(0,229,255,0.08)]' : ''}`}
                                >
                                    <span className="text-[#00e5ff] text-[10px] shrink-0 mt-[4px] font-bold flex items-center justify-center bg-[rgba(0,229,255,0.12)] rounded-full w-[20px] h-[20px]">{'\u2713'}</span>
                                    <p className="text-white text-sm md:text-base leading-relaxed drop-shadow-sm">{item}</p>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={shouldReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : 1.4 }}
                    className="mt-12 w-full flex justify-center max-w-[520px] z-20 relative px-2"
                >
                    <motion.div
                        animate={
                            shouldReveal && !prefersReduced
                                ? { borderColor: ['rgba(0,229,255,0.10)', 'rgba(0,229,255,0.40)', 'rgba(0,229,255,0.10)'] }
                                : { borderColor: 'rgba(0,229,255,0.15)' }
                        }
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.9 }}
                        className="backdrop-blur-md bg-white/5 border-[1px] rounded-full px-5 md:px-7 py-4 text-center shadow-[0_4px_30px_rgba(0,0,0,0.1)] w-full block border-solid"
                    >
                        <span className="text-zinc-300 text-sm md:text-base font-light tracking-wide leading-relaxed">
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
