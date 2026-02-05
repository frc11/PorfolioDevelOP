'use client';
import { useEffect, useState, useRef } from 'react';

const GLITCH_CHARS = '!@#$%^&*()_+-={}[]|;:,.<>?/~`';

interface PersistentGlitchTextProps {
    text: string;
    className?: string;
}

export const PersistentGlitchText = ({ text, className }: PersistentGlitchTextProps) => {
    const [displayedText, setDisplayedText] = useState(text);
    const originalTextRef = useRef(text);

    useEffect(() => {
        originalTextRef.current = text;
        setDisplayedText(text);
    }, [text]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        // Phase 1: Initial Scramble on Mount
        let scrambleIterations = 0;
        const maxIterations = 10;
        const scrambleInterval = setInterval(() => {
            if (scrambleIterations >= maxIterations) {
                clearInterval(scrambleInterval);
                setDisplayedText(originalTextRef.current);
            } else {
                const scrambled = originalTextRef.current.split('').map((char, index) => {
                    if (char === ' ') return ' ';
                    if (Math.random() < 0.5) return originalTextRef.current[index];
                    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                }).join('');
                setDisplayedText(scrambled);
                scrambleIterations++;
            }
        }, 50);

        // Phase 2: Periodic Glitch Loop
        intervalId = setInterval(() => {
            // Glitch: Corrupt 1 random character
            const indices = Array.from({ length: originalTextRef.current.length }, (_, i) => i);
            const randomIdx = indices[Math.floor(Math.random() * indices.length)];

            if (originalTextRef.current[randomIdx] === ' ') return; // Skip spaces

            const corrupted =
                originalTextRef.current.substring(0, randomIdx) +
                GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] +
                originalTextRef.current.substring(randomIdx + 1);

            setDisplayedText(corrupted);

            // Revert: Restore text after 100ms
            setTimeout(() => {
                setDisplayedText(originalTextRef.current);
            }, 300);

        }, 2000); // Every 3 seconds

        return () => {
            clearInterval(scrambleInterval);
            clearInterval(intervalId);
        };
    }, [text]);

    return (
        <span className={className}>
            {displayedText}
        </span>
    );
};
