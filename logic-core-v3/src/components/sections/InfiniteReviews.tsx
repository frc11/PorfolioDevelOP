'use client';
import { useRef, useState } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame
} from "framer-motion";

// Local utility to avoid external dependency
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface ParallaxProps {
    children: React.ReactNode;
    baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

    const [isHovered, setIsHovered] = useState(false);

    // Wrap range for seamless looping (-20% to -45% usually works for 4 items, adjust if needed)
    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        // Pause if hovered
        if (isHovered) return;

        let moveBy = directionFactor.current * baseVelocity * (delta / 1000); // delta is in ms

        // Flip direction if scroll velocity changes sign
        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        // Add scroll velocity to base movement
        moveBy += directionFactor.current * moveBy * velocityFactor.get();

        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div
            className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap mb-8 last:mb-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div className="flex whitespace-nowrap gap-10 items-center" style={{ x }}>
                {children}
                {children}
                {children}
                {children}
            </motion.div>
        </div>
    );
}

// Active Word Component
// Variants: 'solid' (Black -> Transparent w/ Border), 'outline' (Transparent w/ Border -> Black)
const ActiveWord = ({ text, variant = 'solid' }: { text: string, variant?: 'solid' | 'outline' }) => {
    const isSolid = variant === 'solid';

    return (
        <motion.span
            data-cursor="hover"
            initial="idle"
            whileHover="hover"
            className="text-6xl md:text-8xl font-black uppercase mr-16 cursor-none inline-block transition-colors duration-300"
            variants={{
                idle: {
                    scale: 1,
                    color: isSolid ? "#18181b" : "transparent", // zinc-900 vs transparent
                    WebkitTextStroke: isSolid ? "0px transparent" : "1px #18181b" // none vs black border
                },
                hover: {
                    scale: 1.1,
                    color: isSolid ? "transparent" : "#18181b", // transparent vs zinc-900
                    WebkitTextStroke: isSolid ? "1px #18181b" : "0px transparent" // black border vs none
                }
            }}
        >
            {text}
        </motion.span>
    );
};

// Review Card Component
const ReviewCard = ({ name, text }: { name: string; text: string }) => (
    <motion.div
        data-cursor="hover"
        whileHover={{
            scale: 1.05,
            backgroundColor: "#18181b", // zinc-900
            boxShadow: "0px 20px 40px rgba(0,0,0,0.2)",
            borderColor: "#18181b"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group flex flex-col gap-2 p-8 bg-white border border-zinc-100 shadow-sm rounded-none w-[400px] h-[200px] whitespace-normal shrink-0 justify-center cursor-none"
    >
        <motion.p
            className="text-xl font-medium text-zinc-800 leading-snug group-hover:text-zinc-50 transition-colors duration-300"
        >
            "{text}"
        </motion.p>
        <motion.span
            className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-4 group-hover:text-zinc-500 transition-colors duration-300"
        >
            {name}
        </motion.span>
    </motion.div>
);

export const InfiniteReviews = () => {
    return (
        <section className="pt-50 pb-25 bg-zinc-50 overflow-hidden text-zinc-900 relative">
            {/* Top Fade (Integration with Portfolio) */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-zinc-950 to-transparent z-20 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Marquee 1 - Left direction */}
                <ParallaxText baseVelocity={-1}>
                    <ReviewCard name="TechCrunch" text="Redefining what a digital agency can deliver through sheer engineering excellence." />
                    <ReviewCard name="Awwwards" text="A masterclass in user experience, combining 3D depth with seamless interactions." />
                    <ReviewCard name="Forbes" text="The team behind the most scalable visual systems of 2024." />
                    <ReviewCard name="Wired" text="Where brutalist aesthetics meet sophisticated neural architecture." />
                </ParallaxText>

                {/* Marquee 2 - Right direction (faster) - Mixed Variants */}
                <ParallaxText baseVelocity={1.5}>
                    <ActiveWord text="RESULTS" variant="solid" />
                    <ActiveWord text="PRECISION" variant="outline" />
                    <ActiveWord text="SCALE" variant="solid" />
                    <ActiveWord text="IMPACT" variant="outline" />
                </ParallaxText>

                {/* Marquee 3 - Left direction - Mixed Variants */}
                <ParallaxText baseVelocity={-2}>
                    <ActiveWord text="ENGINEERING" variant="outline" />
                    <ActiveWord text="CREATIVITY" variant="solid" />
                    <ActiveWord text="INNOVATION" variant="outline" />
                    <ActiveWord text="LOGIC" variant="solid" />
                </ParallaxText>
            </motion.div>

        </section>
    );
};
