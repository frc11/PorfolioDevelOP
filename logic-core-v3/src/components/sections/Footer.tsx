'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform, useScroll } from 'framer-motion';

// --- 1. COMPONENTE: STREAM DE PARTÍCULAS (PRESERVED) ---
const ParticleStream = ({ side }: { side: 'left' | 'right' }) => {
    const particleCount = 50;
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            height: Math.random() * 200 + 50,
            width: Math.random() > 0.5 ? 2 : 3,
            duration: Math.random() * 2 + 1,
            delay: Math.random() * 2,
            opacity: Math.random() * 0.4 + 0.3,
            hue: Math.random() * 360,
        }));
        setParticles(newParticles);
    }, []);

    const isLeft = side === 'left';

    return (
        <div
            className={`absolute w-[20vw] h-full pointer-events-none overflow-hidden z-0 ${isLeft ? 'left-0 top-0' : 'right-0 top-0'}`}
            style={{
                maskImage: 'linear-gradient(to bottom, transparent, black 20%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%)'
            }}
        >
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className={`absolute rounded-full ${isLeft ? 'bg-gradient-to-t' : 'bg-gradient-to-b'} from-white via-cyan-400 to-transparent`}
                    style={{
                        left: p.left,
                        height: p.height,
                        width: p.width,
                        opacity: p.opacity,
                        boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.4)',
                    }}
                    animate={{
                        top: isLeft ? ['-20%', '120%'] : ['120%', '-20%'],
                        filter: [`hue-rotate(${p.hue}deg)`, `hue-rotate(${p.hue + 180}deg)`],
                    }}
                    transition={{
                        top: {
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: p.delay,
                        },
                        filter: {
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear",
                        }
                    }}
                />
            ))}
            <div className={`absolute inset-0 bg-gradient-to-r ${isLeft ? 'from-zinc-950 via-zinc-950/20 to-transparent' : 'from-transparent via-zinc-950/20 to-zinc-950'}`} />
        </div>
    );
};

// --- 2. COMPONENTE: ENLACE "ROLLING" ---
const FlipLink = ({ children, href }: { children: string; href: string }) => {
    return (
        <motion.a
            initial="initial"
            whileHover="hovered"
            href={href}
            className="relative block overflow-hidden whitespace-nowrap text-sm font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors duration-300"
        >
            <div className="relative inline-block">
                <motion.span
                    variants={{
                        initial: { y: 0 },
                        hovered: { y: "-100%" },
                    }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="inline-block"
                >
                    {children}
                </motion.span>
                <motion.span
                    variants={{
                        initial: { y: "100%" },
                        hovered: { y: 0 },
                    }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="absolute left-0 top-0 inline-block text-cyan-400 font-bold"
                >
                    {children}
                </motion.span>
            </div>
        </motion.a>
    );
};

// --- 3. COMPONENTE: BOTÓN MAGNÉTICO AVANZADO (BRIGHT FOCUS) ---
interface MagneticButtonProps {
    onHoverStart: () => void;
    onHoverEnd: () => void;
}

const MagneticButton = ({ onHoverStart, onHoverEnd }: MagneticButtonProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
    const mouseX = useSpring(x, springConfig);
    const mouseY = useSpring(y, springConfig);

    const textX = useTransform(mouseX, (val) => val * 0.3);
    const textY = useTransform(mouseY, (val) => val * 0.3);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        x.set(middleX * 0.8);
        y.set(middleY * 0.8);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
        onHoverEnd();
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={reset}
            onMouseEnter={onHoverStart}
            style={{ x: mouseX, y: mouseY }}
            className="group relative flex items-center justify-center z-40"
            whileHover={{ scale: 1.8 }}
            transition={{ type: "tween", ease: "circOut", duration: 2.5 }}
        >
            {/* JITTER LAYER */}
            <motion.div
                // Increased brightness with stronger shadow on hover
                className="relative w-40 h-40 md:w-56 md:h-56 bg-white rounded-full flex items-center justify-center cursor-pointer overflow-hidden shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_100px_0px_rgba(255,255,255,0.6)] transition-shadow duration-500"
                whileHover={{
                    x: [0, -1, 1, -1, 1, 0],
                    y: [0, 1, -1, 1, -1, 0],
                }}
                transition={{
                    x: { repeat: Infinity, duration: 0.2, ease: "linear" },
                    y: { repeat: Infinity, duration: 0.2, ease: "linear", delay: 0.1 }
                }}
            >
                {/* 1. Base Gradient - Kept bright */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white via-zinc-200 to-zinc-100 opacity-100" />

                {/* 2. REMOVED BLURRY FLARE. Added subtle gradient shift on hover instead. */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50 via-white to-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* 3. Inner Border Ring */}
                <div className="absolute inset-0 rounded-full border border-zinc-300 scale-95 opacity-50 group-hover:border-zinc-400 transition-colors duration-500" />

                {/* 4. CONTENT (Text -> Rocket) */}
                <motion.div style={{ x: textX, y: textY }} className="relative z-10 flex flex-col items-center justify-center">

                    {/* Default State: TEXT */}
                    <span className="text-xl md:text-2xl font-black text-black tracking-tighter group-hover:opacity-0 transition-opacity duration-300 absolute">
                        START
                    </span>

                    {/* Hover State: ROCKET ICON - CHANGED TO GROUP HOVER LOGIC */}
                    {/* Now triggers on any hover of the button, not just center */}
                    <div className="opacity-0 scale-50 rotate-45 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 delay-100 transform origin-center">
                        {/* Rocket Icon - Black Stroke */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64" height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="black"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-sm"
                            style={{ transform: "rotate(-45deg)" }}
                        >
                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                        </svg>
                    </div>

                </motion.div>
            </motion.div>

            {/* Shockwaves */}
            <div className="absolute inset-0 -z-10 rounded-full border border-white/20 scale-100 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30 group-hover:opacity-0 transition-opacity duration-1000" />
        </motion.div>
    );
};

// --- 4. BACKGROUND DINÁMICO (AURORA) ---
const AuroraBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, -50, 0],
                    y: [0, -30, 30, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] left-[20%] w-[50vw] h-[50vw] bg-indigo-600/30 rounded-full blur-[100px] mix-blend-screen"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -30, 30, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen"
            />
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute -bottom-[20%] left-[30%] w-[60vw] h-[40vw] bg-violet-800/20 rounded-full blur-[100px] mix-blend-screen"
            />
        </div>
    )
}

// --- 5. COMPONENTE PRINCIPAL: FOOTER (GLOBAL FOCUS STATE) ---
export const Footer = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    });

    // Global Focus State
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    const yText = useTransform(scrollYProgress, [0, 1], [100, 0]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <footer ref={containerRef} className="relative min-h-screen bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">

            {/* CINEMA MODE OVERLAY - Reduced Opacity to 40% */}
            {/* z-20: Sits above background and particles, but BELOW Content with z-50 */}
            <motion.div
                className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] pointer-events-none"
                animate={{ opacity: isButtonHovered ? 1 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* Background Layers (Behind Overlay) */}
            <AuroraBackground />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />

            {/* Streams (Behind Overlay) */}
            <ParticleStream side="left" />
            <ParticleStream side="right" />

            {/* Top Transition - Catches the Fade from WhyDevelOP */}
            <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-zinc-950 via-zinc-950/0 to-transparent backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none z-10" />

            {/* Main Content */}
            {/* Removed z-10 from parent to avoid trapping stacking context. Used pointer-events-none to let clicks pass through gaps. */}
            <div className="relative w-full max-w-[90vw] flex flex-col items-center justify-center pointer-events-none">

                {/* Text 1 - TITANIUM ALLOY GRADIENT */}
                <motion.div style={{ y: yText, opacity: opacityText }} className="relative z-10">
                    <h2 className="text-[13vw] leading-[0.85] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400 tracking-tighter text-center select-none pl-2 pr-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]">
                        READY TO
                    </h2>
                </motion.div>

                {/* BUTTON - z-50: Intentionally kept ABOVE the z-20 overlay so it stays bright */}
                {/* Pointer events auto re-enabled for button interaction */}
                <div className="my-[-2vw] z-50 pointer-events-auto">
                    <MagneticButton
                        onHoverStart={() => setIsButtonHovered(true)}
                        onHoverEnd={() => setIsButtonHovered(false)}
                    />
                </div>

                {/* Text 2 - TITANIUM ALLOY GRADIENT */}
                <motion.div style={{ y: useTransform(yText, (v) => v * -0.5), opacity: opacityText }} className="relative z-10">
                    <h2 className="text-[13vw] leading-[0.85] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400 tracking-tighter text-center select-none pl-5 pr-5 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]">
                        SCALE?
                    </h2>
                </motion.div>

            </div>

            {/* Bottom Bar (Behind Overlay) */}
            <div className="absolute bottom-12 w-full px-8 md:px-16 flex flex-col md:flex-row justify-between items-end gap-8 z-30">
                <div className="flex flex-col gap-2 text-zinc-500 text-xs font-mono tracking-widest uppercase">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Systems Operational</span>
                    </div>
                    <span>© 2026 DEVEL_OP™ — V.3.0</span>
                </div>

                <div className="flex gap-8 md:gap-12 pointer-events-auto">
                    <FlipLink href="#">LinkedIn</FlipLink>
                    <FlipLink href="#">Instagram</FlipLink>
                    <FlipLink href="#">Twitter_X</FlipLink>
                    <FlipLink href="#">Email</FlipLink>
                </div>
            </div>

            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </footer>
    );
};