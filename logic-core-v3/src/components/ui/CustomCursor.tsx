'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const [isHovering, setIsHovering] = useState(false);

    // Physics configuration for the "aura" (trailing effect)
    const springConfig = { damping: 25, stiffness: 150 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        // Move cursor logic
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        // Hover detection logic
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check for buttons, links, or elements with .magnetic class or data-cursor="hover"
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('.magnetic') ||
                target.closest('[data-cursor="hover"]') ||
                // Also check if parent is button/a (sometimes target is icon inside)
                target.closest('button') ||
                target.closest('a');

            if (isInteractive) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        // Initial position to prevent jump
        cursorX.set(window.innerWidth / 2);
        cursorY.set(window.innerHeight / 2);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            <style jsx global>{`
        /* Hide default cursor */
        body, a, button {
          cursor: none;
        }
      `}</style>

            {/* Primary Cursor (Fast Dot) */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
            />

            {/* Aura Cursor (Slow/Fluid) */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9998] mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    opacity: isHovering ? 0.8 : 0.4,
                    backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeOut"
                }}
            />
        </>
    );
};
