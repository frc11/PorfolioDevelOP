"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence, Variants } from "framer-motion";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";

const ScrambledLetter = ({
    char,
    index
}: {
    char: string;
    index: number;
}) => {
    const isReducedMotion = useReducedMotion();
    const [current, setCurrent] = useState(char);

    useEffect(() => {
        if (isReducedMotion || char === " ") {
            setCurrent(char);
            return;
        }

        // FASE 1 - SCRAMBLE: 0ms -> 600ms total baseline
        // Each letter resolves left-to-right with a 40ms stagger.
        const resolveTime = 600 + index * 40;
        const startTime = Date.now();

        // Start scrambling immediately using random chars
        setCurrent(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= resolveTime) {
                setCurrent(char);
                clearInterval(interval);
            } else {
                setCurrent(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
            }
        }, 40);

        return () => clearInterval(interval);
    }, [char, index, isReducedMotion]);

    return (
        <span className={char === " " ? "mr-[0.2em]" : ""}>
            {char === " " ? "\u00A0" : current}
        </span>
    );
};

interface HeroTitleProps {
    text: string[];
    className?: string;
}

export default function HeroTitle({ text, className = "" }: HeroTitleProps) {
    const isReducedMotion = useReducedMotion();

    // FASE 3 — COLOR SWEEP (1000ms -> 1800ms)
    // Sweeps from right to left or left to right. Background length is 200%.
    const sweepVariants: Variants = {
        hidden: { backgroundPosition: isReducedMotion ? "0% 0" : "200% 0" },
        visible: {
            backgroundPosition: "-200% 0",
            transition: {
                delay: 1.0,
                duration: isReducedMotion ? 0 : 0.8,
                ease: "linear",
            }
        }
    };

    // Calculate a cumulative index for letters to stagger the scramble correctly
    let cumulativeLetterIndex = 0;

    return (
        <div className={`flex flex-col items-center justify-center w-full z-10 ${className}`}>
            <AnimatePresence>
                {text.map((line, lineIndex) => {
                    return (
                        <motion.div
                            key={lineIndex}
                            className="overflow-hidden flex items-baseline justify-center"
                            // FASE 2 — CLIP-PATH REVEAL (600ms -> 1000ms)
                            initial={isReducedMotion ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
                            animate={{ clipPath: "inset(0 0% 0 0)" }}
                            transition={{
                                delay: 0.6 + lineIndex * 0.15, // Stagger 150ms between lines
                                duration: 0.4,
                                ease: [0.16, 1, 0.3, 1] // expo out suave
                            }}
                        >
                            <motion.h1
                                initial="hidden"
                                animate="visible"
                                variants={sweepVariants}
                                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.1)" }}
                                className="text-[13vw] sm:text-[11vw] md:text-[8rem] lg:text-[7vw] xl:text-[7.5vw] 2xl:text-[8vw] font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-[linear-gradient(110deg,#fff,45%,#00e5ff,55%,#fff)] bg-[length:200%_100%] text-center lg:text-left uppercase flex items-baseline"
                            >
                                {line.split("").map((char, charIndex) => {
                                    const isLastDot = char === "." && lineIndex === text.length - 1 && charIndex === line.length - 1;
                                    const currentGlobalIndex = cumulativeLetterIndex++;

                                    if (isLastDot) {
                                        return (
                                            <motion.span
                                                key={charIndex}
                                                initial={{ scale: 1 }}
                                                animate={{ scale: [1, 1.15, 1] }}
                                                transition={{
                                                    delay: 1.8,
                                                    duration: 0.6,
                                                    times: [0, 0.5, 1],
                                                    ease: "easeInOut"
                                                }}
                                                className="inline-block w-4 h-4 md:w-6 md:h-6 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] ml-2 md:ml-3 shrink-0"
                                            />
                                        );
                                    }

                                    return (
                                        <ScrambledLetter
                                            key={charIndex}
                                            char={char}
                                            index={currentGlobalIndex}
                                        />
                                    );
                                })}
                            </motion.h1>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
