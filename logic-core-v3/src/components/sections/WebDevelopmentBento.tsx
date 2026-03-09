"use client"
import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CounterTo100 = () => {
    const [count, setCount] = useState(0);
    const countValue = useMotionValue(0);
    const rounded = useSpring(countValue, { stiffness: 50, damping: 20 });

    useEffect(() => {
        rounded.on("change", (latest) => {
            setCount(Math.round(latest));
        });
    }, [rounded]);

    return (
        <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onViewportEnter={() => countValue.set(100)}
        >
            {count}
        </motion.span>
    );
};

export const WebDevelopmentBento = () => {
    const cardBaseStyle = "bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden relative group hover:border-cyan-400/50 transition-colors duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)]";

    return (
        <section className="py-24 w-full bg-transparent relative z-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">

                    {/* Tarea 2: Tarjeta 1 (Retención UX - 2 Columnas) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={`md:col-span-2 ${cardBaseStyle} p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center`}
                    >
                        <div className="flex-1 space-y-4">
                            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
                                Interfaces que atrapan.
                            </h3>
                            <p className="text-zinc-400 leading-relaxed text-lg font-light max-w-md">
                                Diseño UX/UI que genera confianza instantánea y retiene a tu cliente. Nivel Awwwards para conversiones sin fricción.
                            </p>
                        </div>

                        {/* Video de Retención Full Color */}
                        <div className="w-full md:w-[350px] aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/20">
                            <video
                                src="/video/Woman_engrossed_in_screen_delpmaspu_.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Tarea 3: Tarjeta 2 (Velocidad lighthouse - 1 Columna) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={`${cardBaseStyle} p-10 flex flex-col items-center justify-center text-center space-y-6`}
                    >
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" className="stroke-white/5" strokeWidth="6" />
                                <motion.circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    className="stroke-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0 283" }}
                                    whileInView={{ strokeDasharray: "283 283" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-black text-5xl text-white">
                                <CounterTo100 />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white mb-2">Rendimiento Absoluto</h3>
                            <p className="text-zinc-500 text-sm font-light">Arquitectura Next.js. Cero tiempos de espera.</p>
                        </div>
                    </motion.div>

                    {/* Tarjeta 3 (Ancha Inferior - Conversión B2B) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className={`md:col-span-3 bg-gradient-to-br from-[#12002b] via-[#030014] to-[#12002b] ${cardBaseStyle} p-10 md:p-14 border-violet-500/20`}
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="max-w-2xl space-y-6">
                                <h3 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tighter">
                                    De un Folleto Abandonado a una <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Máquina de Ventas.</span>
                                </h3>
                                <p className="text-zinc-400 text-xl font-light leading-relaxed">
                                    Integramos flujos automáticos de WhatsApp y CRM. No solo te ven; te compran, agendan y consultan sin fricciones.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all hover:scale-110">
                                    <svg className="w-10 h-10 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.311.045-.713.073-1.148-.069-.272-.088-.62-.238-1.061-.43-1.869-.812-3.11-2.822-3.203-2.947-.093-.125-.76-.999-.76-1.996 0-.996.52-1.487.705-1.696.186-.208.405-.261.541-.261.135 0 .27 0 .389.006.121.005.284-.046.444.338.165.394.567 1.385.617 1.485.05.1.083.216.017.349-.066.133-.1.216-.199.332-.1.117-.208.261-.298.35-.101.101-.205.21-.088.41.117.2.521.859 1.119 1.391.77.686 1.419.898 1.621.999.202.101.32.084.44-.055.12-.139.52-.61.659-.817.14-.208.28-.175.474-.101.192.074 1.218.574 1.428.682.21.107.349.161.405.253.056.095.056.541-.088.946z" /></svg>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
