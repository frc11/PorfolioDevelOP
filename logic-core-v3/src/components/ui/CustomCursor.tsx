'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const [isHovering, setIsHovering] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
    const lastCursorModeRef = useRef<'default' | 'hover' | 'hidden'>('default');
    const scrollRafRef = useRef<number | null>(null);

    // Physics configuration for the "aura" (trailing effect)
    const springConfig = { damping: 25, stiffness: 150 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const updateCursorStateFromTarget = (target: Element | null) => {
            if (!(target instanceof HTMLElement)) {
                if (lastCursorModeRef.current !== 'default') {
                    lastCursorModeRef.current = 'default';
                    setIsHidden(false);
                    setIsHovering(false);
                }
                return;
            }

            const isCursorSuppressed = !!target.closest('[data-cursor="off"]');

            if (isCursorSuppressed) {
                if (lastCursorModeRef.current !== 'hidden') {
                    lastCursorModeRef.current = 'hidden';
                    setIsHidden(true);
                    setIsHovering(false);
                }
                return;
            }

            // Check for buttons, links, or elements with .magnetic class or data-cursor="hover"
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('.magnetic') ||
                target.closest('[data-cursor="hover"]') ||
                // Also check if parent is button/a (sometimes target is icon inside)
                target.closest('button') ||
                target.closest('a');

            const nextMode = isInteractive ? 'hover' : 'default';

            if (lastCursorModeRef.current === nextMode) {
                return;
            }

            lastCursorModeRef.current = nextMode;
            setIsHidden(false);
            setIsHovering(Boolean(isInteractive));
        };

        // Move cursor logic
        const moveCursor = (e: MouseEvent) => {
            lastPointerRef.current = { x: e.clientX, y: e.clientY };
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            updateCursorStateFromTarget(e.target as Element | null);
        };

        // Hover detection logic
        const handleMouseOver = (e: MouseEvent) => {
            updateCursorStateFromTarget(e.target as Element | null);
        };

        const syncCursorTargetFromPoint = () => {
            const point = lastPointerRef.current;

            if (!point) {
                return;
            }

            const target = document.elementFromPoint(point.x, point.y);
            updateCursorStateFromTarget(target);
        };

        const handleScroll = () => {
            if (scrollRafRef.current !== null) {
                return;
            }

            scrollRafRef.current = window.requestAnimationFrame(() => {
                scrollRafRef.current = null;
                syncCursorTargetFromPoint();
            });
        };

        window.addEventListener('mousemove', moveCursor, { passive: true });
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

        // NO inicializar en el centro: el dot primario usa mix-blend-difference y
        // sobre el blanco del intro se veía NEGRO, fijo en el centro, hasta el
        // primer mousemove. Queda fuera de pantalla (-100,-100, su valor inicial)
        // hasta que el usuario mueve el mouse — entonces aparece directo en el cursor.

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('scroll', handleScroll, true);

            if (scrollRafRef.current !== null) {
                window.cancelAnimationFrame(scrollRafRef.current);
            }
        };
    }, [cursorX, cursorY]);

    return (
        <>
            <style jsx global>{`
        /* Hide default cursor on desktop only */
        @media (min-width: 768px) {
          body, a, button {
            cursor: none;
          }

          [data-cursor="off"],
          [data-cursor="off"] * {
            cursor: auto !important;
          }

          [data-cursor="off"] a,
          [data-cursor="off"] button,
          [data-cursor="off"] [role="button"] {
            cursor: pointer !important;
          }

        }
      `}</style>

            {/* Primary Cursor (Fast Dot) */}
            <motion.div
                className="hidden md:block fixed top-0 left-0 w-2.5 h-2.5 bg-white rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                    mixBlendMode: 'difference',
                    opacity: isHidden ? 0 : 1,
                    visibility: isHidden ? 'hidden' : 'visible',
                }}
            />

            {/* Aura Cursor (Slow/Fluid) */}
            <motion.div
                className="hidden md:block fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full pointer-events-none z-[9998] shadow-[0_0_20px_rgba(0,0,0,0.05)]"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%',
                    mixBlendMode: 'difference',
                    visibility: isHidden ? 'hidden' : 'visible',
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    opacity: isHidden ? 0 : isHovering ? 0.8 : 0.4,
                    backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
                    borderColor: isHovering ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)'
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeOut"
                }}
            />
        </>
    );
};
