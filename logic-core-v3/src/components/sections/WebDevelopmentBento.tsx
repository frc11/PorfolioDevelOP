"use client"
import React, { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface BentoCardProps {
    children: React.ReactNode;
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
}

const CounterTo100 = () => {
    const [count, setCount] = useState(0);
    const countValue = useMotionValue(0);
    const rounded = useSpring(countValue, { stiffness: 50, damping: 20 });

    rounded.on("change", (latest) => {
        setCount(Math.round(latest));
    });

    return (
        <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onViewportEnter={() => countValue.set(100)}
        >
            {count}
        </motion.span>
    );
};

const BentoCard = ({ children, icon, title, description, delay = 0 }: BentoCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-[#050505] border border-white/[0.05] rounded-[2rem] p-10 md:p-12 overflow-hidden transition-all duration-500 hover:border-white/10"
            onMouseMove={handleMouseMove}
            ref={ref}
        >
            {/* Spotlight Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-500 group-hover:opacity-100 mix-blend-screen"
                style={{
                    background: useSpring(
                        useMotionValue(0),
                        { stiffness: 50, damping: 20 }
                    ).get() === 0 ? `radial-gradient(600px circle at ${mouseX.get()}px ${mouseY.get()}px, rgba(255,255,255,0.03), transparent 40%)` : `radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.03), transparent 40%)`,
                }}
                onUpdate={(latest) => {
                    if (ref.current) {
                        ref.current.style.setProperty('--x', `${mouseX.get()}px`);
                        ref.current.style.setProperty('--y', `${mouseY.get()}px`);
                    }
                }}
            />

            {/* Glowing Icon Container */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shrink-0 group-hover:bg-white/[0.04] transition-colors duration-500 shadow-inner">
                    {icon}
                </div>

                <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight leading-snug group-hover:text-cyan-50 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed font-light text-sm md:text-base group-hover:text-zinc-300 transition-colors duration-300">
                        {description}
                    </p>
                </div>

                {children}
            </div>
        </motion.div>
    );
};

export const WebDevelopmentBento = () => {
    return (
        <section className="py-32 w-full bg-transparent relative z-10">
            <div className="max-w-5xl mx-auto px-4">
                {/* Section Header */}
                <div className="mb-24 text-center">
                    <motion.h2
                        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight"
                    >
                        Ingeniería diseñada para <span className="text-cyan-500">convertir.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed"
                    >
                        No ensamblamos plantillas. Codificamos plataformas web desde cero enfocadas en rendimiento, posicionamiento SEO y conversión.
                    </motion.p>
                </div>

                {/* The 3 Pillars of Conversion */}
                {/* The 3 Pillars of Conversion */}
                <div className="flex flex-col gap-6">
                    {/* Pilar 1 (Velocidad) */}
                    <BentoCard
                        delay={0.1}
                        title="El costo oculto de hacer esperar a tu cliente."
                        description="Cada segundo que tu web tarda en cargar, perdés un 20% de ventas. Reemplazamos plantillas pesadas (WordPress/Wix) por arquitectura nativa en Next.js. El resultado: carga en milisegundos y una experiencia que retiene al usuario."
                        icon={
                            <svg className="w-7 h-7 text-zinc-300 group-hover:text-cyan-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                    >
                        <div className="hidden lg:flex w-48 shrink-0 flex-col items-end justify-center relative h-full min-h-[100px]">
                            {/* Animated Chart Line */}
                            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 50" preserveAspectRatio="none">
                                <motion.path
                                    d="M0 45 C 20 40, 40 10, 60 5 S 80 5, 100 5"
                                    fill="none"
                                    stroke="url(#cyan-gradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatDelay: 3 }}
                                    style={{ filter: "drop-shadow(0px 4px 6px rgba(6,182,212,0.4))" }}
                                />
                                <defs>
                                    <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="relative z-10 flex flex-col items-end">
                                <div className="text-4xl font-black text-white font-mono tracking-tighter">0.8<span className="text-cyan-500 text-2xl">s</span></div>
                                <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">LCP Core Vital</div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Pilar 2 (Conversión y WhatsApp) */}
                    <BentoCard
                        delay={0.2}
                        title="El síndrome del 'Folleto Digital'."
                        description="Tu web no debe ser un adorno, debe ser un vendedor 24/7. Diseñamos embudos visuales que guían instintivamente al visitante hacia el botón de WhatsApp o cotización."
                        icon={
                            <svg className="w-7 h-7 text-zinc-300 group-hover:text-cyan-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        }
                    >
                        <div className="hidden lg:flex w-48 shrink-0 flex-col items-end justify-center">
                            <div className="h-10 px-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase tracking-widest group-hover:bg-white/10 transition-colors">
                                Contactar
                            </div>
                        </div>
                    </BentoCard>

                    {/* Pilar 3 (Posicionamiento SEO) */}
                    <BentoCard
                        delay={0.3}
                        title="El cementerio de la página 2 de Google."
                        description="Estructuramos tu código bajo los estándares más estrictos de Google (Lighthouse 100). Si alguien busca tu servicio en tu región, te va a encontrar a vos primero."
                        icon={
                            <svg className="w-7 h-7 text-zinc-300 group-hover:text-cyan-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    >
                        <div className="hidden lg:flex w-48 shrink-0 flex-col items-end justify-center relative">
                            {/* SVG Performance Circle */}
                            <div className="relative w-24 h-24 mb-2 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    {/* Track */}
                                    <circle cx="50" cy="50" r="45" fill="none" className="stroke-white/5" strokeWidth="4" />
                                    {/* Progress */}
                                    <motion.circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        className="stroke-emerald-400"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        initial={{ strokeDasharray: "0 283" }}
                                        whileInView={{ strokeDasharray: "283 283" }}
                                        transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                                    />
                                </svg>
                                {/* Center number */}
                                <div className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-light tracking-tighter text-white">
                                    <CounterTo100 />
                                </div>
                            </div>
                            <div className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase text-center w-24">Lighthouse</div>
                        </div>
                    </BentoCard>
                </div>
            </div>
        </section>
    )
}
