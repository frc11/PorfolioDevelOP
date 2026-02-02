'use client';

import React, { useRef, useState, MouseEvent } from 'react';
import { motion, useSpring, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MagneticCtaProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'ghost';
    className?: string;
}

export const MagneticCta = ({
    children,
    onClick,
    variant = 'primary',
    className,
}: MagneticCtaProps) => {
    const ref = useRef<HTMLButtonElement>(null);

    // Magnetic movement springs
    const x = useSpring(0, { stiffness: 150, damping: 15 });
    const y = useSpring(0, { stiffness: 150, damping: 15 });

    // Mouse position for internal glow
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Text/Content parallax (moves less than the button)
    const textX = useTransform(x, (latest) => latest * 0.5);
    const textY = useTransform(y, (latest) => latest * 0.5);

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // Magnetic pull calculation
        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        x.set(distanceX * 0.35); // Adjust multiplier for stronger/weaker pull
        y.set(distanceY * 0.35);

        // Internal glow position relative to button
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className={cn(
                "relative overflow-hidden rounded-full px-8 py-4 text-sm font-medium transition-colors duration-300 group",
                "cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2",
                variant === 'primary' && "bg-zinc-900/80 text-white backdrop-blur-md border border-white/10 hover:bg-zinc-800/80",
                variant === 'ghost' && "bg-transparent text-zinc-900 dark:text-white border border-transparent hover:bg-zinc-100/10",
                className
            )}
        >
            {/* Internal Glow Effect */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
                }}
            />

            {/* Content with Parallax */}
            <motion.div
                style={{ x: textX, y: textY }}
                className="relative z-10 flex items-center gap-2"
            >
                {children}
            </motion.div>
        </motion.button>
    );
};
