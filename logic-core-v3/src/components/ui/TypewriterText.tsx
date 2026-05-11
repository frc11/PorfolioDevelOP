'use client';

import { useState, useEffect, useCallback } from 'react';

interface TypewriterTextProps {
    words: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
    cursorClassName?: string;
}

export function TypewriterText({
    words,
    typingSpeed = 80,
    deletingSpeed = 50,
    pauseDuration = 2000,
    className = '',
    cursorClassName = 'text-zinc-900',
}: TypewriterTextProps) {
    const [wordIndex, setWordIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const currentWord = words[wordIndex];

    const tick = useCallback(() => {
        if (isPaused) return;

        if (!isDeleting) {
            // Typing phase
            const nextText = currentWord.slice(0, displayText.length + 1);
            setDisplayText(nextText);

            if (nextText === currentWord) {
                // Finished typing — pause before deleting
                setIsPaused(true);
                setTimeout(() => {
                    setIsPaused(false);
                    setIsDeleting(true);
                }, pauseDuration);
            }
        } else {
            // Deleting phase
            const nextText = currentWord.slice(0, displayText.length - 1);
            setDisplayText(nextText);

            if (nextText === '') {
                setIsDeleting(false);
                setWordIndex((prev) => (prev + 1) % words.length);
            }
        }
    }, [currentWord, displayText, isDeleting, isPaused, pauseDuration, words.length]);

    useEffect(() => {
        const speed = isDeleting ? deletingSpeed : typingSpeed;
        if (isPaused) return;

        const timer = setTimeout(tick, speed);
        return () => clearTimeout(timer);
    }, [tick, isDeleting, deletingSpeed, typingSpeed, isPaused]);

    return (
        <>
            <style>{`
                @keyframes blink-cursor {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            `}</style>
            <span className={className}>
                {displayText}
            </span>
            <span
                style={{ animation: 'blink-cursor 1s steps(1) infinite' }}
                className={`inline-block ml-[2px] align-baseline font-light [text-shadow:none] ${cursorClassName}`}
            >
                |
            </span>
        </>
    );
}
