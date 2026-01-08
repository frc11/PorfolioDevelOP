"use client"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'

export function Preloader({ onTransitionStart }: { onTransitionStart?: () => void }) {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        document.body.style.overflow = 'hidden'

        const timer = setTimeout(() => {
            setLoading(false)
            if (onTransitionStart) onTransitionStart()
            document.body.style.overflow = 'auto'
        }, 3000)

        return () => clearTimeout(timer)
    }, [onTransitionStart])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    key="preloader"
                    exit={{
                        scale: 20, // EXPLODE
                        opacity: 0,
                        filter: "blur(20px)",
                    }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
                >
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: [0.8, 1.05, 1],
                                opacity: 1,
                                filter: ["blur(10px)", "blur(0px)"]
                            }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="w-32 h-32 md:w-48 md:h-48"
                        >
                            <svg viewBox="0 0 1024 1024" className="w-full h-full fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                                <path d="M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z" />
                            </svg>
                        </motion.div>

                        {/* Loader Bar */}
                        <div className="mt-12 w-48 h-[2px] bg-white/10 overflow-hidden relative">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                className="absolute inset-0 bg-white"
                            />
                        </div>

                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 font-mono text-[10px] text-white tracking-[0.5em] uppercase"
                        >
                            Establishing_Connection
                        </motion.span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
