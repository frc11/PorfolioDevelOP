'use client';
import { useRef } from "react";
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

    // Wrap range for seamless looping (-20% to -45% usually works for 4 items, adjust if needed)
    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
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
        <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap mb-8 last:mb-0">
            <motion.div className="flex whitespace-nowrap gap-10 items-center" style={{ x }}>
                {children}
                {children}
                {children}
                {children}
            </motion.div>
        </div>
    );
}

// Review Card Component
const ReviewCard = ({ name, text }: { name: string; text: string }) => (
    <div className="flex flex-col gap-2 p-8 bg-white border border-zinc-100 shadow-sm rounded-none w-[400px] h-[200px] whitespace-normal shrink-0 justify-center">
        <p className="text-xl font-medium text-zinc-800 leading-snug">"{text}"</p>
        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-4">{name}</span>
    </div>
);

export const InfiniteReviews = () => {
    return (
        <section className="py-32 bg-zinc-50 overflow-hidden text-zinc-900 border-t border-zinc-200">

            {/* Marquee 1 - Left direction */}
            <ParallaxText baseVelocity={-1}>
                <ReviewCard name="TechCrunch" text="Redefining what a digital agency can deliver through sheer engineering excellence." />
                <ReviewCard name="Awwwards" text="A masterclass in user experience, combining 3D depth with seamless interactions." />
                <ReviewCard name="Forbes" text="The team behind the most scalable visual systems of 2024." />
                <ReviewCard name="Wired" text="Where brutalist aesthetics meet sophisticated neural architecture." />
            </ParallaxText>

            {/* Marquee 2 - Right direction (faster) */}
            <ParallaxText baseVelocity={1.5}>
                <span className="text-8xl font-black uppercase text-zinc-200 mr-20">RESULTS</span>
                <span className="text-8xl font-black uppercase text-zinc-900 mr-20">PRECISION</span>
                <span className="text-8xl font-black uppercase text-zinc-200 mr-20">SCALE</span>
                <span className="text-8xl font-black uppercase text-zinc-900 mr-20">IMPACT</span>
            </ParallaxText>

            {/* Marquee 3 - Left direction */}
            <ParallaxText baseVelocity={-2}>
                <span className="text-6xl font-outline text-transparent stroke-black uppercase mr-16 stroke-1">ENGINEERING</span>
                <span className="text-6xl font-black text-zinc-900 uppercase mr-16">CREATIVITY</span>
                <span className="text-6xl font-outline text-transparent stroke-black uppercase mr-16 stroke-1">INNOVATION</span>
                <span className="text-6xl font-black text-zinc-900 uppercase mr-16">LOGIC</span>
            </ParallaxText>

        </section>
    );
};
