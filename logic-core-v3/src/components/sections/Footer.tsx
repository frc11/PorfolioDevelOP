'use client';
import { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const MagneticButton = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Magnetic Physics
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const mouseX = useSpring(x, springConfig);
    const mouseY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);

        // Attraction strength
        x.set(middleX * 0.5);
        y.set(middleY * 0.5);
    };

    const reset = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={reset}
            style={{ x: mouseX, y: mouseY }}
            className="group relative flex items-center justify-center cursor-pointer"
        >
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-white flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                {/* Text inside */}
                <span className="relative z-10 text-xl font-bold text-black group-hover:scale-110 transition-transform">{children}</span>

                {/* Hover ripple visual filler (optional) */}
                <div className="absolute inset-0 rounded-full bg-blue-500/10 scale-0 group-hover:scale-150 transition-transform duration-700 ease-out" />
            </div>
        </motion.div>
    );
};

export const Footer = () => {
    return (
        <footer className="relative min-h-[90vh] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden">

            {/* Massive Text CTA */}
            <div className="text-center z-10 mb-12 mix-blend-difference">
                <h2 className="text-[12vw] leading-none font-black text-white tracking-tighter uppercase">
                    READY TO
                </h2>
                <h2 className="text-[12vw] leading-none font-black text-zinc-800 tracking-tighter uppercase">
                    SCALE?
                </h2>
            </div>

            {/* Magnetic Button - Absolute Center if possible or just below */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 mix-blend-normal">
                <MagneticButton>START</MagneticButton>
            </div>

            {/* Footprint */}
            <div className="absolute bottom-10 w-full px-12 flex justify-between items-end text-zinc-500 text-sm font-mono uppercase tracking-widest">
                <div className="flex flex-col gap-2">
                    <span>© 2026 DEVEL_OP™</span>
                    <span>ALL RIGHTS RESERVED</span>
                </div>

                <div className="flex gap-8">
                    <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                    <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter_X</a>
                </div>
            </div>

            {/* Subtle decorative grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />
        </footer>
    );
};
