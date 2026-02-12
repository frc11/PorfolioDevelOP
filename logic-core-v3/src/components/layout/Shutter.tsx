'use client';

import { motion } from 'framer-motion';
import { useTransitionContext } from '@/context/TransitionContext';

export const Shutter = () => {
    const { isAnimating } = useTransitionContext();

    const transition = {
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1] as any, // Aggressive snap
    };

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex">
            {/* Left Panel */}
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: isAnimating ? '0%' : '-100%' }}
                transition={transition}
                className="w-[50vw] h-full bg-zinc-950 relative flex items-center justify-end overflow-hidden "
            >
                {/* Left Half Container - 30vw width (Half of 60vw total logo) */}
                <div className="w-[30vw] h-auto overflow-hidden flex justify-start">
                    {/* Full Logo - 60vw width */}
                    <div className="w-[60vw] mr-[-30vw] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter">
                        <LogoSVG />
                    </div>
                </div>
            </motion.div>

            {/* Right Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isAnimating ? '0%' : '100%' }}
                transition={transition}
                className="w-[50vw] h-full bg-zinc-950 relative flex items-center justify-start overflow-hidden"
            >
                {/* Right Half Container - 30vw width */}
                <div className="w-[30vw] h-auto overflow-hidden flex justify-start">
                    {/* Full Logo - 60vw width - Shifted Left by 30vw to show right half */}
                    <div className="w-[60vw] ml-[-30vw] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter">
                        <LogoSVG />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const LogoSVG = () => (
    <svg viewBox="0 0 1024 1024" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <title>DevelOP Logo</title>
        <path d="M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z" />
    </svg>
);
