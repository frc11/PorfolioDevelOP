"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import LiquidProject from '@/components/canvas/LiquidProject';

// --- SUB-COMPONENTES ---

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    colSpan?: string;
    rowSpan?: string;
    clickable?: boolean;
}

const TiltCard = ({
    children,
    className = "",
    colSpan = "col-span-1",
    rowSpan = "row-span-1",
    clickable = false
}: TiltCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });
    const scale = useSpring(1, { stiffness: 200, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const x = (e.clientX - rect.left - width / 2) / width;
        const y = (e.clientY - rect.top - height / 2) / height;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <motion.div
            ref={ref}
            className={`relative overflow-hidden rounded-[2rem] bg-[#050505] backdrop-blur-xl border border-white/[0.03] shadow-2xl transition-all duration-500 ${isHovered ? 'shadow-black/80 border-white/10' : 'shadow-black/40'} ${colSpan} ${rowSpan} ${clickable ? 'cursor-pointer' : ''} ${className}`}
            style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => { setIsHovered(true); scale.set(1.01); }}
            onMouseLeave={() => { setIsHovered(false); mouseX.set(0); mouseY.set(0); scale.set(1); }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

const CountUpStat = ({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let startTime: number;
        let animationFrame: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, end, duration]);

    return <div ref={ref} className="text-7xl font-light font-mono tracking-tighter text-white">{count}{suffix}</div>;
};

const VerticalTicker = ({ items }: { items: string[] }) => {
    return (
        <div className="relative h-full overflow-hidden">
            <motion.div
                className="flex flex-col gap-6"
                animate={{ y: [0, -100 * items.length] }}
                transition={{ y: { repeat: Infinity, repeatType: "loop", duration: items.length * 3, ease: "linear" } }}
            >
                {[...items, ...items, ...items].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-center h-20 px-6 bg-white/[0.02] rounded-xl border border-white/5 shadow-inner">
                        <span className="text-xl md:text-2xl font-bold text-zinc-300">{item}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

export const WebDesigns = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } },
    };

    const clients = ["Industria", "Logística", "Real Estate", "Finanzas", "Salud", "Retail"];

    return (
        <section ref={ref} className="min-h-screen w-full bg-transparent py-32 px-4 relative z-10">
            {/* Tarea 1: Estética del Contenedor */}
            <motion.div
                className="mb-24 max-w-7xl mx-auto text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-[6vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-500 uppercase leading-none tracking-tighter mb-8">
                    NUESTRAS OBRAS.
                </h2>
                <p className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
                    No lo decimos nosotros. Lo demuestran los activos digitales de <span className="text-white font-medium">clase mundial</span> que construimos para líderes locales e internacionales.
                </p>
            </motion.div>

            {/* The Bento Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] max-w-7xl mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >

                {/* --- CARD A: ELITE SHOWROOM (Con Efecto Líquido) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard
                        colSpan="md:col-span-2"
                        rowSpan="md:row-span-2"
                        clickable
                        className="group relative bg-white/[0.02] border border-white/10"
                    >
                        {/* 1. Fondo Líquido - Tarea 2 */}
                        <div className="absolute inset-0 z-0 bg-[#030014]">
                            <LiquidProject
                                className="w-full h-full opacity-80"
                            />
                            {/* Div Protector - Tarea 2 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/40 to-transparent pointer-events-none z-10" />
                        </div>

                        {/* 2. Contenido */}
                        <div
                            className="relative z-20 w-full h-full p-10 flex flex-col justify-end"
                            onMouseEnter={() => setHoveredCard('showroom')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="space-y-4">
                                <span className="text-cyan-400 font-mono text-xs tracking-widest uppercase bg-cyan-400/10 px-4 py-1.5 rounded-full border border-cyan-400/20">E-Commerce B2B</span>
                                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl">
                                    Elite Showroom
                                </h3>
                                <p className="text-zinc-300 font-light text-lg">
                                    Corralón El Amigo: Transformación integral de venta offline a motor digital de pedidos masivos.
                                </p>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD B: CLIENTES (Ticker encapsulado) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-1" rowSpan="md:row-span-2" className="isolate flex flex-col bg-white/[0.02] border border-white/10">
                        <div className="relative z-20 px-8 pt-8 pb-4 pointer-events-none text-center">
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-500 mb-2">Omnicanalidad</h3>
                            <h3 className="text-2xl font-bold text-white leading-tight underline decoration-cyan-500/30 underline-offset-8">Sectores Optimizados</h3>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 top-32 w-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#030014] to-transparent z-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#030014] to-transparent z-10 pointer-events-none" />
                            <VerticalTicker items={clients} />
                        </div>
                        <div className="absolute inset-0 -z-10 bg-[#030014]/50 backdrop-blur-3xl" />
                    </TiltCard>
                </motion.div>

                {/* --- CARD C: ESTADÍSTICAS --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard className="bg-white/[0.02] border border-white/10">
                        <div className="h-full p-8 flex flex-col justify-center text-left">
                            <CountUpStat end={100} suffix="%" />
                            <p className="text-cyan-400 text-sm font-mono tracking-widest uppercase mt-4">
                                [ SCORE_LIGHTHOUSE ]
                            </p>
                        </div>
                        <div className="absolute inset-0 -z-10 bg-cyan-500/5 backdrop-blur-2xl" />
                    </TiltCard>
                </motion.div>

                {/* --- CARD D: LATEST LAUNCH (Con Video Textura) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-2" rowSpan="md:row-span-1" clickable className="group bg-white/[0.02] border border-white/10">
                        <div className="absolute inset-0 z-0 bg-[#030014]">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover opacity-30 mix-blend-screen grayscale"
                                src="/video/Man_sips_coffee_scrolls_phone_delpmaspu_.mp4"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/60 to-transparent z-10 pointer-events-none" />
                        </div>
                        <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-zinc-400">Sistema ERP</span>
                                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-black">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tight">Distribuidora Central</h3>
                                <p className="text-zinc-400 font-light mt-2 text-sm">Dashboard logístico ultra-rápido para operaciones críticas.</p>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD E: ARCHITECTURE --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard className="text-white bg-white/[0.02] border border-white/10">
                        <div className="h-full p-8 flex flex-col justify-center border-t border-white/5">
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Core Stack</h3>
                            <div className="flex flex-wrap gap-2 font-mono text-[10px]">
                                {['NEXT.JS', 'REACT', 'R3F', 'REDIS'].map((tech) => (
                                    <div key={tech} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-cyan-400">
                                        {tech}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD F: TECH STACK (Alternative view) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard className="bg-white/[0.02] border border-white/10">
                        <div className="h-full p-8 flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-2xl border border-cyan-500/20 flex items-center justify-center mb-6 bg-cyan-500/10">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Carga Instantánea</h3>
                            <p className="text-zinc-500 text-sm font-light">Arquitectura Edge-first para reducir la latencia a cero.</p>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD G: CTA --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-2" clickable className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border-white/20 text-white relative flex items-center justify-center group overflow-hidden">
                        <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-cyan-500/5 transition-colors duration-500" />
                        <div className="relative z-10 flex flex-col items-center text-center p-8">
                            <h3 className="text-4xl font-black mb-4 tracking-tighter">¿TU PRÓXIMA OBRA?</h3>
                            <p className="text-zinc-400 font-light mb-8 max-w-sm text-lg">Agenda una consultoría técnica para transformar tu negocio en un activo digital premium.</p>
                            <span className="px-10 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                INICIAR AUDITORÍA
                            </span>
                        </div>
                    </TiltCard>
                </motion.div>

            </motion.div>
        </section>
    );
};