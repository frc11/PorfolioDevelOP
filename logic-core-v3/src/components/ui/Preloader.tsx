"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Bloquear scroll
        document.body.style.overflow = "hidden";

        // Tiempo total de la animación antes de desbloquear
        // Fase 1 (Draw 1.5s) + Fase 2 (Fill 0.5s) + Fase 3 (Pulse 0.5s) = 2.5s
        // + un pequeño buffer antes del exit
        const timer = setTimeout(() => {
            setIsLoading(false);
            document.body.style.overflow = "auto";
            window.scrollTo(0, 0);
        }, 2800);

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.8, ease: "easeInOut" },
                    }}
                >
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1024 1024"
                        className="w-32 md:w-48 overflow-visible"
                    >
                        <motion.path
                            d="M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z"
                            fill="#ffffff"
                            stroke="#ffffff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, fillOpacity: 0 }}
                            animate={{
                                pathLength: 1,
                                fillOpacity: 1,
                                scale: [1, 1, 1.1, 1], // Normal -> Normal -> Latido -> Normal
                            }}
                            transition={{
                                pathLength: { duration: 1.5, ease: "easeInOut" }, // 0s - 1.5s
                                fillOpacity: { delay: 1.5, duration: 0.5, ease: "easeOut" }, // 1.5s - 2.0s
                                scale: { delay: 2.0, duration: 0.5, ease: "easeInOut" }, // 2.0s - 2.5s
                            }}
                        />
                    </motion.svg>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
