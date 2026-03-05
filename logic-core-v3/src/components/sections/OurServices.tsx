'use client';
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Globe, ArrowRight, Sparkles, Network } from "lucide-react";
import { useTransitionContext } from "@/context/TransitionContext";

// --- Services Data Source ---
export type ServiceTheme = 'cyan' | 'purple';

export const SERVICES_DATA = [
    {
        title: "Web Development",
        tagline: "High-Performance Frontend Architecture",
        icon: Globe,
        theme: "cyan" as ServiceTheme,
        duration: "Short-term Sprint",
        features: [
            "React / Next.js Ecosystems",
            "WebGL & 3D Interactions",
            "Headless CMS Integration",
            "Atomic Design Systems"
        ],
        path: '/web-development'
    },
    {
        title: "Software Development",
        tagline: "Scalable Backend & Logic Core",
        icon: Cpu,
        theme: "purple" as ServiceTheme,
        duration: "Long-term Partnership",
        features: [
            "Microservices Architecture",
            "Cloud Native Solutions",
            "API Design & Integration",
            "High-Load System Optimization"
        ],
        path: '/software-development'
    },
    {
        title: "Agentes IA & LLMs",
        tagline: "Modelos de Lenguaje y Agentes Autónomos",
        icon: Sparkles,
        theme: "cyan" as ServiceTheme,
        duration: "Innovation Edge",
        features: [
            "RAG & Fine-tuning",
            "Atención al Cliente Autónoma",
            "Análisis Predictivo",
            "Integración LLM"
        ],
        path: '/ai-implementations'
    },
    {
        title: "Automatización de Flujos (n8n)",
        tagline: "Eficiencia y Reducción de Costos Operativos",
        icon: Network,
        theme: "purple" as ServiceTheme,
        duration: "Operational Efficiency",
        features: [
            "Workflows en n8n",
            "Conexión de APIs",
            "Sincronización de Datos",
            "Eliminación de Tareas Manuales"
        ],
        path: '/process-automation'
    }
];

// --- Particle Field Component (Overclocked) ---
interface ParticleFieldProps {
    color: ServiceTheme;
}

const ParticleField = ({ color }: ParticleFieldProps) => {
    const isCyan = color === 'cyan';
    const particleColor = isCyan ? "bg-cyan-400" : "bg-fuchsia-400";
    const shadowColor = isCyan ? "rgba(34, 211, 238, 0.8)" : "rgba(232, 121, 249, 0.8)";
    const particleCount = 75;

    const particles = Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 1,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 0.2,
        depth: (Math.random() - 0.5) * 500,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute rounded-full ${particleColor}`}
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        top: p.top,
                        boxShadow: `0 0 ${p.size * 2}px ${shadowColor}`,
                        transform: 'translate(-50%, -50%)',
                    }}
                    initial={{ opacity: 0, scale: 0, z: 0 }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                        z: [0, p.depth],
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                />
            ))}
        </div>
    );
};

// --- Desktop Service Card ---

interface ServiceCardProps {
    title: string;
    tagline: string;
    icon: React.ElementType;
    features: string[];
    duration: string;
    theme: ServiceTheme;
    onClick?: () => void;
}

const ServiceCard = ({ title, tagline, icon: Icon, features, duration, theme, onClick }: ServiceCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const isCyan = theme === 'cyan';
    const bgGradient = isCyan ? "from-cyan-900/20 to-blue-900/20" : "from-fuchsia-900/20 to-purple-900/20";
    const accentText = isCyan ? "text-cyan-400" : "text-fuchsia-400";
    const accentBg = isCyan ? "bg-cyan-500" : "bg-fuchsia-500";
    const accentBorder = isCyan ? "border-cyan-500/30" : "border-fuchsia-500/30";

    const conicGradient = isCyan
        ? "conic-gradient(from 0deg, transparent 0%, rgba(34,211,238,0.8) 25%, transparent 50%, rgba(34,211,238,0.2) 75%, transparent 100%)"
        : "conic-gradient(from 0deg, transparent 0%, rgba(232,121,249,0.8) 25%, transparent 50%, rgba(232,121,249,0.2) 75%, transparent 100%)";

    const IconComponent = Icon as any;

    return (
        <div
            className="group perspective-1000 w-full max-w-md h-[500px] cursor-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            data-cursor="hover"
        >
            <motion.div
                className="w-full h-full relative transition-all duration-500"
                style={{ transformStyle: "preserve-3d" }}
                animate={{
                    rotateY: isHovered ? 180 : 0,
                    y: isHovered ? -20 : 0
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* --- FRONT FACE --- */}
                <div
                    className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden p-[1px]"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Magic Energy Border */}
                    <motion.div
                        className="absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none"
                        style={{ background: conicGradient }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Inner Front Content */}
                    <div className="absolute inset-[1px] rounded-[15px] bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 p-8 flex flex-col items-center justify-center gap-6 text-center shadow-xl z-10 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                        <div className={`relative z-10 p-6 rounded-full bg-zinc-950/80 border border-zinc-700/50 ${accentBorder} transition-colors duration-500`}>
                            <IconComponent className={`w-12 h-12 ${isCyan ? "text-cyan-300" : "text-fuchsia-300"}`} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{title}</h3>
                            <p className="text-zinc-400 font-light">{tagline}</p>
                        </div>
                        <div className="absolute bottom-6 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                            Initialize
                        </div>
                    </div>
                </div>

                {/* --- BACK FACE --- */}
                <div
                    className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden p-[1px]"
                    style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden"
                    }}
                >
                    {/* Magic Energy Border (Back) */}
                    <motion.div
                        className="absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0 pointer-events-none"
                        style={{ background: conicGradient }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Inner Back Content */}
                    <div className="absolute inset-[1px] rounded-[15px] bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-8 flex flex-col justify-between shadow-2xl z-10 overflow-hidden">
                        {/* Particles Inside Content Wrapper to ensure they clip to rounded radius */}
                        <div className="absolute inset-0 z-0 pointer-events-none" style={{ transform: "translateZ(-10px)" }}>
                            <AnimatePresence>
                                {isHovered && <ParticleField color={theme} />}
                            </AnimatePresence>
                        </div>

                        <div className="relative z-10 h-full flex flex-col pt-4" style={{ transform: "translateZ(20px)" }}>
                            <div className="flex justify-between items-start mb-8">
                                <IconComponent className={`w-8 h-8 ${accentText}`} />
                                <span className={`text-[10px] whitespace-nowrap font-bold px-3 py-1 rounded-full border ${accentBorder} ${accentText} bg-white/5 uppercase tracking-wider`}>
                                    {duration}
                                </span>
                            </div>

                            <ul className="space-y-4 mb-auto pt-2">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium leading-snug">
                                        <div className={`w-1.5 h-1.5 rounded-full ${accentBg} shrink-0`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full group/btn py-4 rounded-lg bg-white text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors mt-6`}>
                                Read More
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- MOBILE COMPONENT: TAP-TO-FLIP WITH AUTO-RESET ---

const MobileServiceCard = ({ title, tagline, icon: Icon, features, duration, theme, onClick }: ServiceCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const isCyan = theme === 'cyan';
    const bgGradient = isCyan ? "from-cyan-900/20 to-blue-900/20" : "from-fuchsia-900/20 to-purple-900/20";
    const accentText = isCyan ? "text-cyan-400" : "text-fuchsia-400";
    const accentBg = isCyan ? "bg-cyan-500" : "bg-fuchsia-500";
    const accentBorder = isCyan ? "border-cyan-500/30" : "border-fuchsia-500/30";

    const conicGradient = isCyan
        ? "conic-gradient(from 0deg, transparent 0%, rgba(34,211,238,0.8) 25%, transparent 50%, rgba(34,211,238,0.2) 75%, transparent 100%)"
        : "conic-gradient(from 0deg, transparent 0%, rgba(232,121,249,0.8) 25%, transparent 50%, rgba(232,121,249,0.2) 75%, transparent 100%)";

    const IconComponent = Icon as any;

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting && isFlipped) {
                setIsFlipped(false);
            }
        }, { threshold: 0 });

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, [isFlipped]);

    return (
        <div
            ref={cardRef}
            className="perspective-1000 w-full max-w-md h-[500px] cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="w-full h-full relative transition-all duration-500"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* --- FRONT FACE --- */}
                <div
                    className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden p-[1px]"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <motion.div
                        className={`absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isFlipped ? 'opacity-100' : 'opacity-30'} transition-opacity duration-700 z-0 pointer-events-none`}
                        style={{ background: conicGradient }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="absolute inset-[1px] rounded-[15px] bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 p-8 flex flex-col items-center justify-center gap-6 text-center shadow-xl z-10 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-100 transition-opacity duration-500`} />
                        <p className="absolute top-6 left-0 w-full text-zinc-500 text-[10px] tracking-widest uppercase animate-pulse">
                            (click to rotate)
                        </p>
                        <div className={`relative z-10 p-6 rounded-full bg-zinc-950/80 border border-zinc-700/50 ${accentBorder} transition-colors duration-500`}>
                            <IconComponent className={`w-12 h-12 ${isCyan ? "text-cyan-300" : "text-fuchsia-300"}`} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{title}</h3>
                            <p className="text-zinc-400 font-light">{tagline}</p>
                        </div>
                        <div className="absolute bottom-6 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                            Tap To Initialize
                        </div>
                    </div>
                </div>

                {/* --- BACK FACE --- */}
                <div
                    className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden p-[1px]"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                    <motion.div
                        className={`absolute w-[150%] h-[150%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isFlipped ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 z-0 pointer-events-none`}
                        style={{ background: conicGradient }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="absolute inset-[1px] rounded-[15px] bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-8 flex flex-col justify-between shadow-2xl z-10 overflow-hidden">
                        <div className="absolute inset-0 z-0 pointer-events-none" style={{ transform: "translateZ(-10px)" }}>
                            <AnimatePresence>
                                {isFlipped && <ParticleField color={theme} />}
                            </AnimatePresence>
                        </div>
                        <div className="relative z-10 h-full flex flex-col pt-4" style={{ transform: "translateZ(20px)" }}>
                            <div className="flex justify-between items-start mb-8">
                                <IconComponent className={`w-8 h-8 ${accentText}`} />
                                <span className={`text-[10px] whitespace-nowrap font-bold px-3 py-1 rounded-full border ${accentBorder} ${accentText} bg-white/5 uppercase tracking-wider`}>
                                    {duration}
                                </span>
                            </div>
                            <ul className="space-y-4 mb-auto pt-2">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium leading-snug">
                                        <div className={`w-1.5 h-1.5 rounded-full ${accentBg} shrink-0`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onClick) onClick();
                                }}
                                className={`w-full group/btn py-4 rounded-lg bg-white text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:bg-zinc-200 transition-colors mt-6`}
                            >
                                Read More
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const OurServicesMobile = () => {
    const { triggerTransition } = useTransitionContext();

    return (
        <div className="relative py-40 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[0%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/20 rounded-full blur-[128px] mix-blend-screen animate-pulse duration-[10s]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[128px] mix-blend-screen animate-pulse duration-[12s]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-4 relative inline-block pl-1">
                        SERVICES <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 pr-1">HUB</span>
                    </h2>
                    <p className="text-zinc-400 max-w-xl mx-auto text-base font-light">
                        Deploying scalar architecture and neural interfaces for the next generation of web presence.
                    </p>
                </div>

                <div className="flex flex-col gap-12 w-full max-w-xl justify-center items-center perspective-origin-center relative z-20">
                    {SERVICES_DATA.map((service, idx) => (
                        <MobileServiceCard
                            key={idx}
                            {...service}
                            onClick={() => triggerTransition(service.path)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- DESKTOP COMPONENT: ORIGINAL HOVER BEHAVIOR ---

const OurServicesDesktop = () => {
    const { triggerTransition } = useTransitionContext();

    return (
        <div className="relative min-h-screen py-40 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[0%] left-[10%] w-[40%] h-[60%] bg-cyan-900/10 rounded-full blur-[128px] mix-blend-screen animate-pulse duration-[10s]" />
                <div className="absolute bottom-[0%] right-[10%] w-[40%] h-[60%] bg-fuchsia-900/10 rounded-full blur-[128px] mix-blend-screen animate-pulse duration-[12s]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10 flex flex-col items-center">
                <div className="mb-20 text-center">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 relative inline-block">
                        SERVICES <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">HUB</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
                        Deploying scalar architecture and neural interfaces for the next generation of web presence.
                    </p>
                </div>

                {/* 2x2 Grid Layout for 4 services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 w-full justify-items-center perspective-origin-center">
                    {SERVICES_DATA.map((service, idx) => (
                        <ServiceCard
                            key={idx}
                            {...service}
                            onClick={() => triggerTransition(service.path)}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Blur Transition - Ensures smooth blend into next section */}
            <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[rgb(3,7,18)] to-transparent pointer-events-none z-0" />
        </div>
    );
};

export const OurServices = () => {
    return (
        <section id="servicios" className="relative w-full bg-zinc-950 border-t border-white/5">
            {/* MOBILE VIEW */}
            <div className="block md:hidden">
                <OurServicesMobile />
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
                <OurServicesDesktop />
            </div>
        </section>
    );
};
