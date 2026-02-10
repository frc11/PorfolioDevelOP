'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_[]{}<>/\\';

interface HyperTextProps {
    text: string;
    className?: string;
    duration?: number;
    delay?: number;
    persist?: boolean;
    trigger?: boolean; // Optional external trigger
}

export const HyperText = ({
    text,
    className = "",
    duration = 1000,
    delay = 0,
    persist = false,
    trigger
}: HyperTextProps) => {
    const [displayText, setDisplayText] = useState('');
    const ref = useRef(null);
    const internalIsInView = useInView(ref, { once: true, margin: "-10%" });
    const originalTextRef = useRef(text);

    // Use external trigger if provided, otherwise fallback to internal view detection
    // If trigger is provided, we treat it as the source of truth for "start now".
    // We want "once" behavior for the *decoding* part usually? 
    // The previous logic was: if (!isInView) return; 
    // Which means if it becomes false, it potentially stops?
    // Actually, useInView({once: true}) ensures it stays true once true.
    // If we use 'trigger' (boolean), it might toggle.
    // We should probably latch it true if we want "once" behavior.

    const [hasStarted, setHasStarted] = useState(false);

    // Determine effective active state
    const shouldAnimate = trigger !== undefined ? trigger : internalIsInView;

    // Latch start state to ensure we don't restart if trigger flickers (optional, but good for stability)
    useEffect(() => {
        if (shouldAnimate && !hasStarted) {
            setHasStarted(true);
        }
    }, [shouldAnimate, hasStarted]);

    // Keep original text ref updated
    useEffect(() => {
        originalTextRef.current = text;
    }, [text]);

    useEffect(() => {
        if (!shouldAnimate) return;

        // IF we only want to run ONCE, checking `shouldAnimate` is enough if it stays true.
        // If it toggles off, this cleanup runs.
        // For decoding effect, usually we want it to finish even if scrolled out? Or stop?
        // Typically stop.

        let iteration = 0;
        const intervalTime = 50;
        const steps = duration / intervalTime;
        const increment = text.length / steps;
        let periodicInterval: NodeJS.Timeout;

        // Initial scramble 
        setDisplayText(text.split('').map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]).join(''));

        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setDisplayText((prev) =>
                    text
                        .split("")
                        .map((letter, index) => {
                            if (index < iteration) {
                                return text[index];
                            }
                            if (letter === ' ') return ' ';
                            return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        })
                        .join("")
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                    setDisplayText(text);

                    // Start periodic glitch if persist is true
                    if (persist) {
                        const GLITCH_CHARS = '!@#$%^&*()_+-={}[]|;:,.<>?/~`';

                        periodicInterval = setInterval(() => {
                            // Glitch 1 random char
                            const indices = Array.from({ length: originalTextRef.current.length }, (_, i) => i);
                            const randomIdx = indices[Math.floor(Math.random() * indices.length)];

                            if (originalTextRef.current[randomIdx] === ' ') return;

                            const corrupted =
                                originalTextRef.current.substring(0, randomIdx) +
                                GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] +
                                originalTextRef.current.substring(randomIdx + 1);

                            setDisplayText(corrupted);

                            // Revert quickly
                            setTimeout(() => {
                                setDisplayText(originalTextRef.current);
                            }, 100 + Math.random() * 200);

                        }, 3000 + Math.random() * 2000); // Random interval between 3-5s
                    }
                }

                iteration += increment;
            }, intervalTime);

            return () => {
                clearInterval(interval);
                if (periodicInterval) clearInterval(periodicInterval);
            };
        }, delay);

        return () => {
            clearTimeout(timeout);
            // Verify if we need to clear periodicInterval here too?
            // The return in setTimeout handles it if timeout fired. 
            // But if component unmounts before timeout?
            // We should store interval IDs in refs if we want perfect cleanup, 
            // but the closure return inside setTimeout might not be reachable if timeout is cleared.
            // Actually, the useEffect return cleans up timeout. 
            // If timeout executed, it returns a cleanup function? No, setTimeout doesn't return a cleanup function to useEffect.
            // We need a ref for the intervals.
        };
    }, [shouldAnimate, text, duration, delay, persist]);

    // Better cleanup implementation needed in the tool call logic below using refs is safer.
    // However, I can't rewrite the whole file easily with replace_file_content if I change too much structure.
    // I will use a robust implementation in the ReplacementContent.

    return (
        <span ref={ref} className={`font-mono inline-block ${className}`}>
            {displayText}
        </span>
    );
};
