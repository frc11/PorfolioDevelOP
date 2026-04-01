"use client"

import React, { useEffect, useId, useMemo, useRef } from "react"
import {
    animate as motionAnimate,
    motion,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "framer-motion"

type ChargeTraceButtonProps = {
    label: string
    onClick?: () => void
    className?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export function ChargeTraceButton({
    label,
    onClick,
    className = "",
    leftIcon = "+",
    rightIcon = ">",
}: ChargeTraceButtonProps) {
    const prefersReducedMotion = useReducedMotion()
    const traceProgress = useMotionValue(0)
    const traceOpacity = useTransform(traceProgress, [0, 0.02, 1], [0, 0.45, 1])
    const traceFillOpacity = useTransform(traceProgress, [0, 0.82, 1], [0, 0.03, 0.12])
    const activeAnimationRef = useRef<ReturnType<typeof motionAnimate> | null>(null)

    const rawId = useId()
    const safeId = useMemo(() => rawId.replace(/[^a-zA-Z0-9_-]/g, ""), [rawId])
    const gradientId = `charge-trace-${safeId}`
    const glowId = `charge-trace-glow-${safeId}`

    const animateTraceTo = (target: 0 | 1) => {
        activeAnimationRef.current?.stop()
        const current = traceProgress.get()
        const distance = Math.abs(target - current)
        if (distance < 0.001) return

        if (prefersReducedMotion) {
            traceProgress.set(target)
            return
        }

        const isForward = target > current
        activeAnimationRef.current = motionAnimate(traceProgress, target, {
            duration: isForward ? 0.2 + distance * 1.05 : 0.14 + distance * 0.65,
            ease: isForward ? [0.06, 0.9, 0.24, 1] : [0.45, 0, 0.92, 0.5],
        })
    }

    useEffect(() => {
        return () => {
            activeAnimationRef.current?.stop()
        }
    }, [])

    return (
        <motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onHoverStart={() => animateTraceTo(1)}
            onHoverEnd={() => animateTraceTo(0)}
            onFocus={() => animateTraceTo(1)}
            onBlur={() => animateTraceTo(0)}
            onClick={onClick}
            className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-[22px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(7,15,28,0.94)_0%,rgba(4,9,18,0.98)_100%)] px-7 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_44px_rgba(0,0,0,0.3)] transition-colors hover:border-cyan-300/28 md:px-8 md:py-[18px] md:text-[11px] ${className}`}
        >
            <span className="pointer-events-none absolute inset-[1.5px] rounded-[20px] border border-cyan-300/35 opacity-45" />
            <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[1.5px] rounded-[20px] bg-cyan-300/10"
                style={{ opacity: traceFillOpacity }}
            />

            <span className="pointer-events-none absolute inset-0">
                <svg className="h-full w-full" viewBox="0 0 420 72" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%">
                            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                            <stop offset="45%" stopColor="#67e8f9" stopOpacity="1" />
                            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.25" />
                        </linearGradient>
                        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
                            <feGaussianBlur stdDeviation="1.6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <motion.rect
                        x="1.5"
                        y="1.5"
                        width="417"
                        height="69"
                        rx="21"
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#${glowId})`}
                        style={{ pathLength: traceProgress, opacity: traceOpacity }}
                    />
                </svg>
            </span>

            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/18 bg-cyan-400/12 text-sm text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {leftIcon}
            </span>
            <span className="relative z-10">{label}</span>
            <span className="relative z-10 text-cyan-300 transition-transform duration-300 group-hover:translate-x-0.5">{rightIcon}</span>
        </motion.button>
    )
}

