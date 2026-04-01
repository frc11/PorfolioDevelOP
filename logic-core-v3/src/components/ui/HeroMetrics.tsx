"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, useInView, useReducedMotion, Variants } from "framer-motion";

interface MetricType {
    value: string;
    label: string;
    suffix: string;
}

const METRICS: MetricType[] = [
    { value: "24/7", label: "atendiendo clientes", suffix: "Hs" },
    { value: "2", label: "segundos de carga máximo", suffix: "s" },
    { value: "1", label: "en Google local", suffix: "#" },
];

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const AnimatedCounter = ({ from = 0, to, duration = 2 }: { from?: number; to: number; duration?: number }) => {
    const [count, setCount] = useState(from);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const isReducedMotion = useReducedMotion();

    useEffect(() => {
        if (isReducedMotion || !isInView) return;

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

    return <span ref={ref}>{isReducedMotion ? to : count}</span>;
};

export default function HeroMetrics() {
    const trackRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const lastTsRef = useRef<number | null>(null);
    const scrollPosRef = useRef(0);
    const isInteractingRef = useRef(false);
    const resumeAfterRef = useRef(0);
    const lastAutoSetRef = useRef(0);
    const [isMobile, setIsMobile] = useState(false);

    const metricsToRender = useMemo(
        () => (isMobile ? [...METRICS, ...METRICS] : METRICS),
        [isMobile]
    );

    useEffect(() => {
        const container = trackRef.current;
        const mediaQuery = window.matchMedia("(max-width: 767px)");

        const applyViewport = () => setIsMobile(mediaQuery.matches);
        applyViewport();
        mediaQuery.addEventListener("change", applyViewport);

        return () => {
            if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
            mediaQuery.removeEventListener("change", applyViewport);
            if (container) container.scrollTo({ left: 0, behavior: "auto" });
        };
    }, []);

    useEffect(() => {
        const container = trackRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        if (!isMobile) {
            if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTsRef.current = null;
            scrollPosRef.current = 0;
            container.scrollTo({ left: 0, behavior: "auto" });
            return;
        }

        // Keep the first card fully visible with the same left/right breathing room.
        container.scrollTo({ left: 0, behavior: "auto" });
        scrollPosRef.current = 0;

        const pauseAutoplay = (ms = 1400) => {
            resumeAfterRef.current = performance.now() + ms;
        };

        const onPointerDown = () => {
            isInteractingRef.current = true;
            pauseAutoplay(1800);
        };
        const onPointerUp = () => {
            isInteractingRef.current = false;
            scrollPosRef.current = container.scrollLeft;
            pauseAutoplay(1200);
        };
        const onWheel = () => {
            scrollPosRef.current = container.scrollLeft;
            pauseAutoplay(1200);
        };
        const onScroll = () => {
            const now = performance.now();
            if (now - lastAutoSetRef.current < 80) return;
            scrollPosRef.current = container.scrollLeft;
            pauseAutoplay(1200);
        };

        container.addEventListener("pointerdown", onPointerDown);
        container.addEventListener("pointerup", onPointerUp);
        container.addEventListener("pointercancel", onPointerUp);
        container.addEventListener("touchstart", onPointerDown, { passive: true });
        container.addEventListener("touchend", onPointerUp);
        container.addEventListener("wheel", onWheel, { passive: true });
        container.addEventListener("scroll", onScroll, { passive: true });

        const speedPxPerSecond = 28;
        const animate = (ts: number) => {
            if (lastTsRef.current == null) lastTsRef.current = ts;
            const dt = (ts - lastTsRef.current) / 1000;
            lastTsRef.current = ts;

            const now = performance.now();
            if (!isInteractingRef.current && now >= resumeAfterRef.current) {
                scrollPosRef.current += speedPxPerSecond * dt;
                const loopPoint = content.scrollWidth / 2;
                if (loopPoint > 0 && scrollPosRef.current >= loopPoint) {
                    scrollPosRef.current -= loopPoint;
                }
                lastAutoSetRef.current = now;
                container.scrollLeft = scrollPosRef.current;
            }

            rafRef.current = window.requestAnimationFrame(animate);
        };

        rafRef.current = window.requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
            lastTsRef.current = null;
            scrollPosRef.current = 0;
            isInteractingRef.current = false;
            resumeAfterRef.current = 0;
            lastAutoSetRef.current = 0;
            container.removeEventListener("pointerdown", onPointerDown);
            container.removeEventListener("pointerup", onPointerUp);
            container.removeEventListener("pointercancel", onPointerUp);
            container.removeEventListener("touchstart", onPointerDown);
            container.removeEventListener("touchend", onPointerUp);
            container.removeEventListener("wheel", onWheel);
            container.removeEventListener("scroll", onScroll);
        };
    }, [isMobile]);

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
            ref={trackRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="hide-scrollbar flex w-full flex-row justify-start overflow-x-auto px-4 pb-4 md:w-full md:flex-col md:items-start md:overflow-visible md:px-0 md:pb-0"
        >
            <div ref={contentRef} className="flex flex-row gap-4 md:w-full md:flex-col">
                {metricsToRender.map((metric, index) => {
                    const numericValue = parseFloat(metric.value);
                    const isNumeric = !isNaN(numericValue);

                    return (
                        <motion.div
                            key={`${metric.label}-${metric.suffix}-${index}`}
                            variants={itemVariants}
                            className="flex max-w-[300px] flex-shrink-0 flex-col items-start justify-center rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(10,16,28,0.84)_0%,rgba(6,10,18,0.92)_100%)] p-6 shadow-[0_18px_44px_rgba(0,0,0,0.32)] backdrop-blur-xl md:w-full md:max-w-none"
                        >
                            <div className="flex items-baseline gap-1 text-4xl font-black tracking-tight text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.16)] lg:text-5xl">
                                {isNumeric ? (
                                    <AnimatedCounter to={numericValue} />
                                ) : (
                                    <span>{metric.value}</span>
                                )}
                                <span className="text-2xl lg:text-3xl">{metric.suffix}</span>
                            </div>
                            <p className="mt-2 text-sm font-medium tracking-wide text-zinc-100 md:text-base">
                                {metric.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
