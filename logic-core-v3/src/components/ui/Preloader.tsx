'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_TEXTS = [
    "INITIALIZING_CORE...",
    "LOADING_NEURAL_NETS...",
    "OPTIMIZING_SHADERS...",
    "CONNECTING_NODES...",
    "SYSTEM_READY."
];

export const Preloader = ({ onComplete }: { onComplete?: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [bootLog, setBootLog] = useState<string[]>([]);

    // Simulation Logic
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        // Progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsComplete(true);
                        if (onComplete) onComplete();
                    }, 800);
                    return 100;
                }
                return Math.min(prev + (Math.random() * 3), 100);
            });
        }, 50);

        // Boot Log
        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < BOOT_TEXTS.length) {
                setBootLog(prev => [...prev, BOOT_TEXTS[logIndex]]);
                logIndex++;
            }
        }, 400);

        return () => {
            clearInterval(interval);
            clearInterval(logInterval);
            document.body.style.overflow = 'unset';
        };
    }, [onComplete]);

    return (
        <AnimatePresence mode="wait">
            {!isComplete && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        filter: "blur(20px)",
                        transition: { duration: 0.8, ease: "easeInOut" }
                    }}
                >
                    {/* BACKGROUND: Tech Grid & Particles */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="w-full h-full bg-[linear-gradient(rgba(0,255,100,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
                        <motion.div
                            animate={{ backgroundPosition: ["0% 0%", "0% 100%"] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"
                        />
                    </div>

                    {/* CONTAINER: Central Hub */}
                    <div className="relative w-[500px] h-[500px] flex items-center justify-center">

                        {/* DECORATION 1: Rotating Cyber Rings */}
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute inset-0 border border-emerald-500/20 rounded-full"
                                style={{ margin: i * 40 }}
                                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                                transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="absolute top-0 left-1/2 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                            </motion.div>
                        ))}

                        {/* DECORATION 2: Scanning Laser Line */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_20px_#10b981]"
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        {/* MAIN LOGO: SVG Path Drawing */}
                        <svg
                            className="w-48 h-48 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            viewBox="0 0 1024 1024"
                            fill="none"
                            stroke="white"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <motion.path
                                d="M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                            />
                        </svg>

                        {/* DATA STREAM: Binary Micro-text */}
                        <div className="absolute top-full mt-8 flex flex-col items-center gap-2 font-mono text-emerald-500 text-xs tracking-widest">
                            <div className="flex gap-4">
                                <span>CPU: {Math.floor(progress)}%</span>
                                <span>MEM: {Math.floor(progress * 1.5)}MB</span>
                            </div>
                            <motion.div
                                className="h-1 w-64 bg-zinc-800 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                                    style={{ width: `${progress}%` }}
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* BOOT LOG: Bottom Left */}
                    <div className="absolute bottom-8 left-8 font-mono text-xs text-emerald-600 space-y-1">
                        {bootLog.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                {`>> ${log}`}
                            </motion.div>
                        ))}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};
