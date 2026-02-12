

'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
// Asegúrate de tener este componente creado en la ruta correcta
import LiquidProject from '@/components/canvas/LiquidProject';
import { AuroraBackground } from '../canvas/AuroraBackground';

// --- SUB-COMPONENTES (Sin cambios mayores) ---

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

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 20 });
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
            className={`relative overflow-hidden rounded-3xl bg-white shadow-lg border border-zinc-100 transition-shadow duration-300 ${isHovered ? 'shadow-2xl' : ''} ${colSpan} ${rowSpan} ${clickable ? 'cursor-pointer' : ''} ${className}`}
            style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => { setIsHovered(true); scale.set(1.02); }}
            onMouseLeave={() => { setIsHovered(false); mouseX.set(0); mouseY.set(0); scale.set(1); }}
            whileHover={{ y: -4 }}
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

    return <div ref={ref} className="text-7xl font-black text-zinc-900">{count}{suffix}</div>;
};

const VerticalTicker = ({ items }: { items: string[] }) => {
    return (
        <div className="relative h-full overflow-hidden">
            <motion.div
                className="flex flex-col gap-8"
                animate={{ y: [0, -100 * items.length] }}
                transition={{ y: { repeat: Infinity, repeatType: "loop", duration: items.length * 3, ease: "linear" } }}
            >
                {[...items, ...items, ...items].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-center h-24 px-6 bg-zinc-50 rounded-xl border border-zinc-200">
                        <span className="text-2xl font-bold text-zinc-700">{item}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ACTUALIZADO ---

export const WebDesigns = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 60, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } },
    };

    const clients = ["Apple", "Nike", "Tesla", "Spotify", "Netflix", "Amazon"];

    return (

        <section ref={ref} className="min-h-screen w-full bg-zinc-50 py-32 px-4 md:px-12 relative z-10">
            <AuroraBackground />
            {/* Header */}
            <motion.div
                className="mb-20 max-w-7xl mx-auto relative z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter uppercase leading-tight">
                    Web
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                        Designs
                    </span>
                </h2>
                <p className="text-zinc-600 text-xl mt-6 max-w-2xl">
                    Experiencias digitales que combinan <strong className="text-zinc-900">diseño de lujo</strong> con ingeniería de vanguardia.
                </p>
            </motion.div>

            {/* The Bento Grid */}
            <motion.div
                ref={ref}
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
                        className="group relative" // Relative para contener el canvas
                    >
                        {/* 1. Fondo Líquido */}
                        <div className="absolute inset-0 z-0">
                            <LiquidProject
                                // Usa una imagen real de tu proyecto o un placeholder de alta calidad
                                imageUrl="/logodevelOP.png"
                                className="w-full h-full"
                            />
                            {/* Overlay sutil para que el texto se lea */}
                            <div className="absolute inset-0 bg-white/40 pointer-events-none" />
                        </div>

                        {/* 2. Contenido */}
                        <div
                            className="relative z-10 w-full h-full p-8 flex flex-col justify-end"
                            onMouseEnter={() => setHoveredCard('showroom')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Animated Circle Decoration */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-zinc-900/10"
                                animate={{
                                    scale: hoveredCard === 'showroom' ? [1, 1.5, 1] : 1,
                                    rotate: hoveredCard === 'showroom' ? 180 : 0,
                                }}
                                transition={{ duration: 4, repeat: hoveredCard === 'showroom' ? Infinity : 0 }}
                            />

                            <div>
                                <h3 className="text-4xl font-black text-zinc-900 mb-3 mix-blend-hard-light">
                                    Elite Showroom
                                </h3>
                                <p className="text-zinc-800 font-bold text-sm bg-white/50 backdrop-blur-md inline-block px-3 py-1 rounded-full">
                                    Ver Proyectos
                                </p>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD B: CLIENTES (Ticker encapsulado) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-1" rowSpan="md:row-span-2" className="bg-zinc-100 isolate flex flex-col">
                        <div className="relative z-20 px-6 pt-6 pb-2 pointer-events-none">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Trusted By</h3>
                            <h3 className="text-xl font-black text-zinc-900 leading-none">Global Leaders</h3>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 top-20 w-full overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-zinc-100 to-transparent z-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-zinc-100 to-transparent z-10 pointer-events-none" />
                            <VerticalTicker items={clients} />
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD C: ESTADÍSTICAS --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard className="bg-gradient-to-br from-cyan-50 to-blue-50">
                        <div className="h-full p-8 flex flex-col justify-center items-center text-center">
                            <CountUpStat end={100} suffix="%" />
                            <p className="text-zinc-600 text-lg font-bold mt-4">Satisfaction<br />Rate</p>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD D: LATEST LAUNCH (Con Efecto Líquido) --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-2" rowSpan="md:row-span-1" clickable className="group">
                        <div className="absolute inset-0 z-0">
                            {/* Usa otra imagen aquí */}
                            <LiquidProject
                                imageUrl="/logodevelOP.png"
                                className="w-full h-full opacity-80"
                            />
                        </div>
                        <div className="relative z-10 h-full p-8 flex items-center justify-between text-zinc-900">
                            <div>
                                <span className="text-xs font-mono uppercase tracking-wider bg-white/80 px-2 py-1 rounded">Latest Launch</span>
                                <h3 className="text-3xl font-black mt-2">Project Alpha</h3>
                            </div>
                            <motion.div
                                className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1 }}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD E: AWARDS --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard className="bg-zinc-900 text-white">
                        <div className="h-full p-8 flex flex-col justify-center">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-2xl font-black">15+ Awards</h3>
                            <p className="text-zinc-400 text-sm mt-2">Awwwards, FWA, CSS Design</p>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD F: TECH STACK --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard>
                        <div className="h-full p-8 flex flex-col justify-center items-center">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {['React', 'Next.js', 'Three.js', 'Framer'].map((tech) => (
                                    <div key={tech} className="px-3 py-2 bg-zinc-100 rounded-lg text-xs font-bold text-zinc-700 text-center">
                                        {tech}
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 text-sm text-center">Cutting-Edge Stack</p>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* --- CARD G: CTA --- */}
                <motion.div variants={cardVariants as any}>
                    <TiltCard colSpan="md:col-span-2" clickable className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                        <div className="h-full p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black mb-2">Ready to Start?</h3>
                                <p className="text-blue-100">Let's build something extraordinary together</p>
                            </div>
                            <motion.button
                                className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Contact Us
                            </motion.button>
                        </div>
                    </TiltCard>
                </motion.div>

            </motion.div>

        </section>
    );
};