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
            {/* Header */}
            <motion.div
                className="mb-24 max-w-5xl mx-auto text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
                    NUESTRO TRABAJO.
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                    No lo decimos nosotros. Lo demuestran los activos digitales que construimos.
                </p>
            </motion.div>

            {/* The Bento Grid */}
            <motion.div
                ref={ref}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] max-w-6xl mx-auto w-full"
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
                        className="group relative" // Relative para contener el canvas
                    >
                        {/* 1. Fondo Líquido */}
                        <div className="absolute inset-0 z-0 bg-[#050505]">
                            <LiquidProject
                                imageUrl="/logodevelOP.png"
                                className="w-full h-full opacity-60 grayscale-[50%]"
                            />
                            {/* Overlay oscuro masivo para que el texto blanco resalte */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                        </div>

                        {/* 2. Contenido */}
                        <div
                            className="relative z-10 w-full h-full p-10 flex flex-col justify-end"
                            onMouseEnter={() => setHoveredCard('showroom')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Animated Circle Decoration */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/5"
                                animate={{
                                    scale: hoveredCard === 'showroom' ? [1, 1.2, 1] : 1,
                                    rotate: hoveredCard === 'showroom' ? 90 : 0,
                                }}
                                transition={{ duration: 6, repeat: hoveredCard === 'showroom' ? Infinity : 0, ease: "linear" }}
                            />

                            <div>
                                <h3 className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                                    Corralón El Amigo
                                </h3>
                                <p className="text-white font-medium text-xs tracking-widest uppercase bg-white/10 backdrop-blur-md inline-block px-4 py-2 rounded-full border border-white/10">
                                    Ver E-Commerce B2B
                                </p>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD B: CLIENTES (Ticker encapsulado) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-1" rowSpan="md:row-span-2" className="isolate flex flex-col">
                        <div className="relative z-20 px-8 pt-8 pb-4 pointer-events-none text-center">
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">Sectores</h3>
                            <h3 className="text-2xl font-bold text-white leading-tight">Industrias que transformamos</h3>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 top-32 w-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
                            <VerticalTicker items={clients} />
                        </div>
                        {/* Dark base layer to enforce the luxury theme over any inherited background */}
                        <div className="absolute inset-0 -z-10 bg-[#050505]/50 backdrop-blur-3xl" />
                    </TiltCard>
                </motion.div>

                {/* --- CARD C: ESTADÍSTICAS --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard>
                        <div className="h-full p-8 flex flex-col justify-center text-left">
                            <CountUpStat end={100} suffix="%" />
                            <p className="text-zinc-500 text-sm font-light leading-relaxed mt-4 max-w-[200px]">
                                Score en Google Lighthouse
                            </p>
                        </div>
                        <div className="absolute inset-0 -z-10 bg-[#050505]/50 backdrop-blur-3xl" />
                    </TiltCard>
                </motion.div>

                {/* --- CARD D: LATEST LAUNCH (Con Video Textura) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-2" rowSpan="md:row-span-1" clickable className="group">
                        <div className="absolute inset-0 z-0 bg-[#050505]">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover opacity-20 mix-blend-luminosity grayscale-[80%]"
                                src="/business-owner-dashboard.mp4"
                            />
                            {/* Dark Gradient Overlay for perfect text contrast on video */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                        </div>
                        <div className="relative z-10 h-full p-8 flex flex-col justify-between text-white">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-zinc-400">Sistema ERP</span>
                                <motion.div
                                    className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-zinc-400 transition-colors"
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </motion.div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold mt-auto tracking-tight">Distribuidora Central</h3>
                                <p className="text-zinc-500 font-light mt-2 text-sm">Dashboard de gestión logística en tiempo real.</p>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD E: ARCHITECTURE --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard className="text-white">
                        <div className="h-full p-8 flex flex-col justify-center border-t border-white/5">
                            <h3 className="text-2xl font-bold mb-4 tracking-tight">Arquitectura<br />Moderna</h3>
                            <div className="flex flex-wrap gap-2">
                                {['React', 'Next.js', 'Node.js', 'PostgreSQL'].map((tech) => (
                                    <div key={tech} className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded text-xs font-mono text-zinc-400">
                                        {tech}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute inset-0 -z-10 bg-[#050505]/50 backdrop-blur-3xl" />
                    </TiltCard>
                </motion.div>

                {/* --- CARD F: TECH STACK (Alternative view) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard>
                        <div className="h-full p-8 flex flex-col justify-center">
                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-white/[0.02]">
                                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Alta Disponibilidad</h3>
                            <p className="text-zinc-500 text-sm font-light">Servidores dedicados con 99.9% de uptime garantizado.</p>
                        </div>
                        <div className="absolute inset-0 -z-10 bg-[#050505]/50 backdrop-blur-3xl" />
                    </TiltCard>
                </motion.div>

                {/* --- CARD G: CTA --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-2" clickable className="bg-white/[0.02] border-white/10 text-white relative flex items-center justify-center group overflow-hidden">
                        <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors duration-500" />
                        <div className="relative z-10 flex flex-col items-center text-center p-8">
                            <h3 className="text-3xl font-bold mb-4 tracking-tight">¿Listo para auditar tu proceso?</h3>
                            <p className="text-zinc-400 font-light mb-8 max-w-sm">Agenda una llamada de descubrimiento sin costo para evaluar tu infraestructura digital.</p>
                            <span className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-zinc-200 transition-colors">
                                Contactar equipo
                            </span>
                        </div>
                    </TiltCard>
                </motion.div>

            </motion.div>
        </section>
    );
};