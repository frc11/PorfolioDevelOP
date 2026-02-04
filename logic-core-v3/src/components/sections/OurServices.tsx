'use client';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Globe, ArrowRight } from "lucide-react";

// --- Particle Field Component (Overclocked) ---
interface ParticleFieldProps {
    color: 'cyan' | 'purple';
}

const ParticleField = ({ color }: ParticleFieldProps) => {
    const isCyan = color === 'cyan';
    const particleColor = isCyan ? "bg-cyan-400" : "bg-fuchsia-400";
    const shadowColor = isCyan ? "rgba(34, 211, 238, 0.8)" : "rgba(232, 121, 249, 0.8)";
    const particleCount = 75; // Increased density

    // Generate heavy-density particles
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 1, // 1px to 5px size variation
        left: `${Math.random() * 100}%`, // Full width coverage
        top: `${Math.random() * 100}%`, // Full height coverage
        duration: Math.random() * 1.5 + 0.5, // Faster, chaotic movement (0.5s - 2s)
        delay: Math.random() * 0.2, // Quick ignition
        depth: (Math.random() - 0.5) * 500, // Deep 3D field
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
                        boxShadow: `0 0 ${p.size * 2}px ${shadowColor}`, // Reactve Glow
                        transform: 'translate(-50%, -50%)',
                    }}
                    initial={{
                        opacity: 0,
                        scale: 0,
                        z: 0
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.5, 0],
                        z: [0, p.depth], // Explode outwards in 3D
                        x: (Math.random() - 0.5) * 100, // Random drift
                        y: (Math.random() - 0.5) * 100, // Random drift
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay
                    }}
                />
            ))}
        </div>
    );
};

// --- Card Component ---

interface ServiceCardProps {
    title: string;
    tagline: string;
    icon: React.ElementType;
    features: string[];
    duration: string;
    theme: 'cyan' | 'purple';
}

const ServiceCard = ({ title, tagline, icon: Icon, features, duration, theme }: ServiceCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const isCyan = theme === 'cyan';
    // Theme Colors
    const borderColor = isCyan ? "group-hover:border-cyan-500/50" : "group-hover:border-fuchsia-500/50";
    const shadowColor = isCyan ? "group-hover:shadow-[0_20px_50px_-12px_rgba(34,211,238,0.3)]" : "group-hover:shadow-[0_20px_50px_-12px_rgba(232,121,249,0.3)]";
    const bgGradient = isCyan
        ? "from-cyan-900/20 to-blue-900/20"
        : "from-fuchsia-900/20 to-purple-900/20";
    const accentText = isCyan ? "text-cyan-400" : "text-fuchsia-400";
    const accentBg = isCyan ? "bg-cyan-500" : "bg-fuchsia-500";
    const accentBorder = isCyan ? "border-cyan-500/30" : "border-fuchsia-500/30";

    return (
        <div
            className="group perspective-1000 w-full max-w-md h-[500px] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-cursor="block"
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
                    className={`absolute inset-0 backface-hidden bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 text-center shadow-xl ${borderColor} transition-colors duration-300 overflow-hidden`}
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* Icon */}
                    <div className={`relative z-10 p-6 rounded-full bg-zinc-950/50 border border-zinc-700/50 ${accentBorder} transition-colors duration-500`}>
                        <Icon className={`w-12 h-12 ${isCyan ? "text-cyan-300" : "text-fuchsia-300"}`} />
                    </div>

                    {/* Text */}
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{title}</h3>
                        <p className="text-zinc-400 font-light">{tagline}</p>
                    </div>

                    {/* Hover Hint */}
                    <div className="absolute bottom-6 text-xs font-mono text-zinc-600 uppercase tracking-widest">
                        Initialize
                    </div>
                </div>

                {/* --- BACK FACE --- */}
                <div
                    className={`absolute inset-0 backface-hidden bg-zinc-950 border border-zinc-800 rounded-2xl p-8 flex flex-col justify-between shadow-2xl ${borderColor} ${shadowColor} overflow-hidden`}
                    style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden"
                    }}
                >
                    {/* Orbital Particles - Behind Content */}
                    <div className="absolute inset-0 z-0 pointer-events-none" style={{ transform: "translateZ(-10px)" }}>
                        <AnimatePresence>
                            {isHovered && <ParticleField color={theme} />}
                        </AnimatePresence>
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 h-full flex flex-col" style={{ transform: "translateZ(20px)" }}>

                        {/* Header: Icon + Badge */}
                        <div className="flex justify-between items-start mb-8">
                            <Icon className={`w-8 h-8 ${accentText}`} />
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${accentBorder} ${accentText} bg-white/5 uppercase tracking-wider`}>
                                {duration}
                            </span>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-4 mb-auto">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                                    <div className={`w-1.5 h-1.5 rounded-full ${accentBg} shrink-0`} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Action Button */}
                        <button className={`w-full group/btn py-4 rounded-lg bg-white text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors mt-6`}>
                            Read More
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export const OurServices = () => {
    return (
        <section className="relative min-h-screen py-32 bg-zinc-950 flex flex-col items-center justify-center overflow-hidden" id="services">

            {/* Layered Digital Aurora Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-900/20 rounded-full blur-[128px] mix-blend-screen animate-pulse duration-[10s]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[128px] mix-blend-screen animate-pulse duration-[12s]" />
                {/* Wireframe Mesh Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="mb-24 text-center">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 relative inline-block">
                        OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">SERVICES</span>
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
                        Deploying scalar architecture and neural interfaces for the next generation of web presence.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="flex flex-col md:flex-row gap-12 justify-center items-center perspective-origin-center">

                    <ServiceCard
                        title="Web Development"
                        tagline="High-Performance Frontend Architecture"
                        icon={Globe}
                        theme="cyan"
                        duration="Short-term Sprint"
                        features={[
                            "React / Next.js Ecosystems",
                            "WebGL & 3D Interactions",
                            "Headless CMS Integration",
                            "Atomic Design Systems"
                        ]}
                    />

                    <ServiceCard
                        title="Software Development"
                        tagline="Scalable Backend & Logic Core"
                        icon={Cpu}
                        theme="purple"
                        duration="Long-term Partnership"
                        features={[
                            "Microservices Architecture",
                            "Cloud Native Solutions",
                            "API Design & Integration",
                            "High-Load System Optimization"
                        ]}
                    />

                </div>
            </div>
        </section>
    );
};
