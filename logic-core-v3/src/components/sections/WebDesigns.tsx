'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';

// 3D Tilt Card Component with Mouse Tracking
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

    // Motion values for mouse position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring animations for smooth rotation
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
        stiffness: 150,
        damping: 20,
    });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
        stiffness: 150,
        damping: 20,
    });

    // Scale effect on hover
    const scale = useSpring(1, { stiffness: 200, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Calculate mouse position relative to card center (-0.5 to 0.5)
        const x = (e.clientX - rect.left - width / 2) / width;
        const y = (e.clientY - rect.top - height / 2) / height;

        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        scale.set(1.02);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
        scale.set(1);
    };

    return (
        <motion.div
            ref={ref}
            className={`relative overflow-hidden rounded-3xl bg-white shadow-lg border border-zinc-100 transition-shadow duration-300 ${isHovered ? 'shadow-2xl' : ''
                } ${colSpan} ${rowSpan} ${clickable ? 'cursor-pointer' : ''} ${className}`}
            style={{
                rotateX,
                rotateY,
                scale,
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.div>
    );
};

// Animated Counter Component
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

            // Easing function for smooth counting
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, end, duration]);

    return (
        <div ref={ref} className="text-7xl font-black text-zinc-900">
            {count}{suffix}
        </div>
    );
};

// Vertical Infinite Ticker
const VerticalTicker = ({ items }: { items: string[] }) => {
    return (
        <div className="relative h-full overflow-hidden">
            <motion.div
                className="flex flex-col gap-8"
                animate={{
                    y: [0, -100 * items.length],
                }}
                transition={{
                    y: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: items.length * 3,
                        ease: "linear",
                    },
                }}
            >
                {[...items, ...items, ...items].map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-center h-24 px-6 bg-zinc-50 rounded-xl border border-zinc-200"
                    >
                        <span className="text-2xl font-bold text-zinc-700">{item}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// Main WebDesigns Component
export const WebDesigns = () => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 60,
            scale: 0.9,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                bounce: 0.4,
                duration: 0.8,
            },
        },
    };

    const clients = ["Apple", "Nike", "Tesla", "Spotify", "Netflix", "Amazon"];

    return (
        <section className="min-h-screen w-full bg-zinc-50 py-32 px-4 md:px-12 relative z-10">
            {/* Header */}
            <motion.div
                className="mb-20 max-w-7xl mx-auto"
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

            {/* The Bento Grid - Constrained & Centered */}
            <motion.div
                ref={ref}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px] max-w-7xl mx-auto w-full"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                {/* Card A: Showroom Principal (2x2) */}
                <motion.div variants={cardVariants}>
                    <TiltCard
                        colSpan="md:col-span-2"
                        rowSpan="md:row-span-2"
                        clickable
                        className="group"
                    >
                        <div
                            className="relative w-full h-full p-8 flex flex-col justify-end bg-gradient-to-br from-zinc-100 to-zinc-50"
                            onMouseEnter={() => setHoveredCard('showroom')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Video Background (plays on hover) */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-500/20">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
                            </div>

                            {/* Animated Circle */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                animate={{
                                    scale: hoveredCard === 'showroom' ? [1, 1.2, 1] : 1,
                                    rotate: hoveredCard === 'showroom' ? 360 : 0,
                                }}
                                transition={{ duration: 2, repeat: hoveredCard === 'showroom' ? Infinity : 0 }}
                            />

                            <div className="relative z-10">
                                <h3 className="text-4xl font-black text-zinc-900 mb-3">
                                    Elite Showroom
                                </h3>
                                <p className="text-zinc-600 text-sm">
                                    Proyectos premium que definen estándares
                                </p>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* Card B: Clientes Selectos (1x2) - REFACTORED FOR OVERFLOW SAFETY */}
                <motion.div variants={cardVariants}>
                    <TiltCard colSpan="md:col-span-1" rowSpan="md:row-span-2" className="overflow-hidden bg-zinc-100 flex flex-col relative isolate transform-gpu">
                        {/* Header Content */}
                        <div className="relative z-20 px-6 pt-6 pb-2 pointer-events-none">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Trusted By</h3>
                            <h3 className="text-xl font-black text-zinc-900 leading-none">Global Leaders</h3>
                        </div>

                        {/* Ticker Container with Absolute Positioning and proper Masking */}
                        <div className="absolute inset-x-0 bottom-0 top-20 w-full overflow-hidden">
                            {/* Gradient Masks for smooth fade in/out */}
                            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-zinc-100 to-transparent z-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-zinc-100 to-transparent z-10 pointer-events-none" />

                            {/* The Ticker itself */}
                            <VerticalTicker items={clients} />
                        </div>
                    </TiltCard>
                </motion.div>

                {/* Card C: Estadísticas (1x1) */}
                <motion.div variants={cardVariants}>
                    <TiltCard className="bg-gradient-to-br from-cyan-50 to-blue-50">
                        <div className="h-full p-8 flex flex-col justify-center items-center text-center">
                            <CountUpStat end={100} suffix="%" />
                            <p className="text-zinc-600 text-lg font-bold mt-4">
                                Satisfaction<br />Rate
                            </p>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* Card D: Último Lanzamiento (2x1) */}
                <motion.div variants={cardVariants}>
                    <TiltCard
                        colSpan="md:col-span-2"
                        rowSpan="md:row-span-1"
                        clickable
                        className="group"
                    >
                        <div className="relative w-full h-full overflow-hidden">
                            {/* Parallax Background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                            />

                            <div className="relative z-10 h-full p-8 flex items-center justify-between text-white">
                                <div>
                                    <span className="text-xs font-mono uppercase tracking-wider opacity-80">
                                        Latest Launch
                                    </span>
                                    <h3 className="text-3xl font-black mt-2">
                                        Project Alpha
                                    </h3>
                                </div>
                                <motion.div
                                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </motion.div>
                            </div>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* Card E: Awards (1x1) */}
                <motion.div variants={cardVariants}>
                    <TiltCard className="bg-zinc-900 text-white">
                        <div className="h-full p-8 flex flex-col justify-center">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-2xl font-black">
                                15+ Awards
                            </h3>
                            <p className="text-zinc-400 text-sm mt-2">
                                Awwwards, FWA, CSS Design
                            </p>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* Card F: Tech Stack (1x1) */}
                <motion.div variants={cardVariants}>
                    <TiltCard>
                        <div className="h-full p-8 flex flex-col justify-center items-center">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {['React', 'Next.js', 'Three.js', 'Framer'].map((tech) => (
                                    <div key={tech} className="px-3 py-2 bg-zinc-100 rounded-lg text-xs font-bold text-zinc-700 text-center">
                                        {tech}
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 text-sm text-center">
                                Cutting-Edge Stack
                            </p>
                        </div>
                    </TiltCard>
                </motion.div>

                {/* Card G: CTA (2x1) */}
                <motion.div variants={cardVariants}>
                    <TiltCard
                        colSpan="md:col-span-2"
                        clickable
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                    >
                        <div className="h-full p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black mb-2">
                                    Ready to Start?
                                </h3>
                                <p className="text-blue-100">
                                    Let's build something extraordinary together
                                </p>
                            </div>
                            <motion.button
                                className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold"
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
