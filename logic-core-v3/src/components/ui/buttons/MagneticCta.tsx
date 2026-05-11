"use client";

import React, { useRef, useState, useEffect } from "react";
import { animate, motion, useAnimate, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface MagneticCTAProps {
    label?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

// 4. CLICK RIPPLE Component
const Ripple = ({
    x,
    y,
    onComplete,
}: {
    x: number;
    y: number;
    onComplete: () => void;
}) => {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        animate(
            scope.current,
            { scale: [0, 3], opacity: [0.4, 0] },
            { duration: 0.6, ease: "easeOut" }
        ).then(onComplete);
    }, [animate, scope, onComplete]);

    return (
        <span
            ref={scope}
            className="absolute w-24 h-24 bg-white rounded-full pointer-events-none z-0"
            style={{ left: x - 48, top: y - 48 }}
        />
    );
};

export const MagneticCta = ({
    label,
    children,
    onClick,
    href,
    size = "md",
    className,
}: MagneticCTAProps) => {
    const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    // 1. EFECTO MAGNÉTICO
    const magneticX = useMotionValue(0);
    const magneticY = useMotionValue(0);
    const springX = useSpring(magneticX, { stiffness: 150, damping: 15 });
    const springY = useSpring(magneticY, { stiffness: 150, damping: 15 });

    const handlePointerMove = (e: React.PointerEvent) => {
        if (e.pointerType === "touch" || !ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = clientX - centerX;
        const distanceY = clientY - centerY;

        // Rango de movimiento: ±20px en X, ±10px en Y
        const x = Math.max(-20, Math.min(20, distanceX * 0.5));
        const y = Math.max(-10, Math.min(10, distanceY * 0.5));

        magneticX.set(x);
        magneticY.set(y);
    };

    const handlePointerLeave = () => {
        setIsHovered(false);
        animate(magneticX, 0, { type: "spring", stiffness: 260, damping: 28 });
        animate(magneticY, 0, { type: "spring", stiffness: 260, damping: 28 });
    };

    const handlePointerEnter = () => {
        setIsHovered(true);
    };

    const handleTrigger = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { left, top } = ref.current.getBoundingClientRect();
        const newRipple = {
            x: e.clientX - left,
            y: e.clientY - top,
            id: Date.now(),
        };
        setRipples((prev) => [...prev, newRipple]);
        if (onClick) onClick();
    };

    const removeRipple = (id: number) => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
    };

    const sizeClasses = {
        sm: "px-8 py-4 text-xs",
        md: "px-14 py-6 text-[10px]",
        lg: "px-16 py-8 text-sm",
    };

    const buttonClasses = cn(
        "relative overflow-hidden inline-flex items-center justify-center text-white font-bold",
        "backdrop-blur-3xl rounded-none md:rounded-[2rem] animate-border-spin",
        sizeClasses[size],
        className
    );

    // 2. BORDE ANIMADO: 
    // Definimos la estructura base como style estático que interactúa con globals.css @property --angle
    const containerStyle = {
        border: "1px solid transparent",
        background: `linear-gradient(#0a0a0d, #0a0a0d) padding-box, conic-gradient(from var(--angle), #ffffff, #71717a, #09090b, #d4d4d8, #ffffff) border-box`,
        x: springX,
        y: springY,
    };

    const content = (
        <>
            {/* 3. HOVER STATE - INNER GLOW & BACKGROUND TRANSITION */}
            <motion.div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                initial={{
                    boxShadow: "0 0 0px rgba(255,255,255,0), 0 0 0px rgba(255,255,255,0)",
                    background: "rgba(255,255,255,0.05)",
                }}
                animate={{
                    boxShadow: isHovered
                        ? "inset 0 0 30px rgba(255,255,255,0.16), inset 0 0 60px rgba(255,255,255,0.06)"
                        : "inset 0 0 0px rgba(255,255,255,0), inset 0 0 0px rgba(255,255,255,0)",
                    background: isHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Ripple Container */}
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden mix-blend-screen">
                {ripples.map((ripple) => (
                    <Ripple
                        key={ripple.id}
                        {...ripple}
                        onComplete={() => removeRipple(ripple.id)}
                    />
                ))}
            </div>

            <motion.span
                animate={{
                    letterSpacing: isHovered ? "0.25em" : "0.15em",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10 flex items-center justify-center uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            >
                {label || children}
            </motion.span>
        </>
    );

    if (href) {
        return (
            <Link href={href} legacyBehavior passHref>
                <motion.a
                    ref={ref as React.RefObject<HTMLAnchorElement>}
                    onPointerMove={handlePointerMove}
                    onPointerLeave={handlePointerLeave}
                    onPointerEnter={handlePointerEnter}
                    onClick={handleTrigger}
                    className={buttonClasses}
                    style={containerStyle}
                >
                    {content}
                </motion.a>
            </Link>
        );
    }

    return (
        <motion.button
            ref={ref as React.RefObject<HTMLButtonElement>}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerEnter={handlePointerEnter}
            onClick={handleTrigger}
            className={buttonClasses}
            style={containerStyle}
        >
            {content}
        </motion.button>
    );
};
