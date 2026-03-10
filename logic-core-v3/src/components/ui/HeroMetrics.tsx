"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, useReducedMotion, Variants } from "framer-motion";

interface MetricType {
    value: string;
    label: string;
    suffix: string;
}

const METRICS: MetricType[] = [
    { value: "47", label: "Proyectos entregados", suffix: "+" },
    { value: "98", label: "Satisfacción de clientes", suffix: "%" },
    { value: "2.1", label: "Tiempo de carga promedio", suffix: "s" },
];

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const AnimatedCounter = ({ from = 0, to, duration = 2 }: { from?: number; to: number; duration?: number }) => {
    const [count, setCount] = useState(from);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const isReducedMotion = useReducedMotion();

    useEffect(() => {
        if (isReducedMotion) {
            setCount(to);
            return;
        }

        if (!isInView) return;

        let startTime: number | null = null;
        let animationFrameId: number;

        const tick = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const t = Math.min(progress / (duration * 1000), 1);

            const easedT = easeOutExpo(t);
            const currentCount = from + (to - from) * easedT;

            // Ensure exact targeting for floats or ints
            if (to % 1 !== 0) {
                setCount(Number(currentCount.toFixed(1)));
            } else {
                setCount(Math.floor(currentCount));
            }

            if (t < 1) {
                animationFrameId = requestAnimationFrame(tick);
            } else {
                setCount(to);
            }
        };

        animationFrameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animationFrameId);
    }, [from, to, duration, isInView, isReducedMotion]);

    return <span ref={ref}>{count}</span>;
};

export default function HeroMetrics() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.6, // Wait for parent column to enter
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-visible w-full pb-4 md:pb-0 hide-scrollbar justify-center md:items-center px-4 md:px-0"
        >
            {METRICS.map((metric, index) => {
                const numericValue = parseFloat(metric.value);
                const isNumeric = !isNaN(numericValue);

                return (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex-shrink-0 w-[80vw] md:w-full max-w-[280px] bg-metric-bg backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-start shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                    >
                        <div className="flex items-baseline gap-1 text-cyan-400 font-black text-4xl lg:text-5xl tracking-tighter drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                            {isNumeric ? (
                                <AnimatedCounter to={numericValue} />
                            ) : (
                                <span>{metric.value}</span>
                            )}
                            <span className="text-2xl lg:text-3xl">{metric.suffix}</span>
                        </div>
                        <p className="text-zinc-200 text-sm md:text-base font-medium mt-2 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            {metric.label}
                        </p>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
