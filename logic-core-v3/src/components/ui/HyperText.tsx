'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const SYMBOLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_[]{}<>/\\';

interface HyperTextProps {
    text: string;
    className?: string;
    duration?: number;
    delay?: number;
}

export const HyperText = ({
    text,
    className = "",
    duration = 1000,
    delay = 0
}: HyperTextProps) => {
    const [displayText, setDisplayText] = useState('');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    useEffect(() => {
        if (!isInView) return;

        let iteration = 0;
        const intervalTime = 50; // Speed of "hack" effect
        const steps = duration / intervalTime;
        const increment = text.length / steps;

        // Initial scramble (optional, but good for empty start)
        setDisplayText(text.split('').map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]).join(''));

        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setDisplayText((prev) =>
                    text
                        .split("")
                        .map((letter, index) => {
                            // If we've passed this index, show the real letter
                            if (index < iteration) {
                                return text[index];
                            }
                            // Handle spaces - keep them empty or scramble them? usually keep empty
                            if (letter === ' ') return ' ';

                            // Otherwise show random symbol
                            return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        })
                        .join("")
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                    setDisplayText(text); // Ensure final fidelity
                }

                iteration += increment;
            }, intervalTime);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timeout);
    }, [isInView, text, duration, delay]);

    return (
        <span ref={ref} className={`font-mono inline-block ${className}`}>
            {displayText}
        </span>
    );
};
