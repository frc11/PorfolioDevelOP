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
}

export const HyperText = ({
    text,
    className = "",
    duration = 1000,
    delay = 0,
    persist = false
}: HyperTextProps) => {
    const [displayText, setDisplayText] = useState('');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    useEffect(() => {
        if (!isInView) return;

        let interval: NodeJS.Timeout;
        let persistentInterval: NodeJS.Timeout;

        // Phase 1: Reveal Animation
        let iteration = 0;
        const intervalTime = 50; // Speed of "hack" effect
        const steps = duration / intervalTime;
        const increment = text.length / steps;

        // Initial scramble (optional, but good for empty start)
        setDisplayText(
            text
                .split("")
                .map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
                .join("")
        );

        const timeout = setTimeout(() => {
            interval = setInterval(() => {
                setDisplayText((prev) =>
                    text
                        .split("")
                        .map((letter, index) => {
                            // If we've passed this index, show the real letter
                            if (index < iteration) {
                                return text[index];
                            }
                            // Handle spaces - keep them empty or scramble them? usually keep empty
                            if (letter === " ") return " ";

                            // Otherwise show random symbol
                            return SYMBOLS[
                                Math.floor(Math.random() * SYMBOLS.length)
                            ];
                        })
                        .join("")
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                    setDisplayText(text); // Ensure final fidelity

                    // Phase 2: Periodic Persistent Glitch (if enabled)
                    if (persist) {
                        persistentInterval = setInterval(() => {
                            const indices = Array.from(
                                { length: text.length },
                                (_, i) => i
                            );
                            // Avoid spaces
                            const validIndices = indices.filter(
                                (i) => text[i] !== " "
                            );
                            if (validIndices.length === 0) return;

                            const randomIdx =
                                validIndices[
                                Math.floor(
                                    Math.random() * validIndices.length
                                )
                                ];

                            const corrupted =
                                text.substring(0, randomIdx) +
                                SYMBOLS[
                                Math.floor(Math.random() * SYMBOLS.length)
                                ] +
                                text.substring(randomIdx + 1);

                            setDisplayText(corrupted);

                            // Revert quickly
                            setTimeout(() => {
                                setDisplayText(text);
                            }, 100);
                        }, 3000); // Glitch every 3 seconds
                    }
                }

                iteration += increment;
            }, intervalTime);
        }, delay);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
            if (persistentInterval) clearInterval(persistentInterval);
        };
    }, [isInView, text, duration, delay, persist]);

    return (
        <span ref={ref} className={`font-mono inline-block ${className}`}>
            {displayText}
        </span>
    );
};
