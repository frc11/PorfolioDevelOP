"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, DatabaseZap, Eye, LineChart } from 'lucide-react'
import { TypewriterText } from '@/components/ui/TypewriterText'

interface BentoCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    colSpan?: string;
    rowSpan?: string;
    delay?: number;
    children?: React.ReactNode;
}

const BentoCard = ({ title, description, icon, colSpan = "col-span-1", rowSpan = "row-span-1", delay = 0, children }: BentoCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay, ease: "easeOut" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${colSpan} ${rowSpan} bg-emerald-950/10 border border-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden group transition-colors duration-500`}
        >
            {/* Processing Pulse Indicator */}
            <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">[PROCESSING]</span>
                <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    animate={{ opacity: [1, 0.2, 0.9, 0.1, 0.8, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Quantum Scanner Line */}
            <motion.div
                className="absolute left-0 right-0 h-[2px] bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] z-50 pointer-events-none opacity-0 group-hover:opacity-100"
                animate={isHovered ? { top: ["0%", "100%", "0%"] } : { top: "0%" }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            />

            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-emerald-500/10" />

            <div className="relative z-10 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors duration-500 text-emerald-400 group-hover:text-emerald-300">
                        {icon}
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>

                {/* Glitch/Typewriter Description on Hover */}
                <div className="text-zinc-400 text-sm max-w-md min-h-[60px]">
                    {isHovered ? (
                        <TypewriterText
                            words={[description]}
                            typingSpeed={20}
                            className="text-emerald-50"
                        />
                    ) : (
                        <p>{description}</p>
                    )}
                </div>
            </div>

            <div className="mt-auto relative z-10 flex-1 flex flex-col justify-end w-full">
                {children}
            </div>

            {/* Animated rotating border gradient on hover */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl overflow-hidden">
                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(52,211,153,0.3)_360deg)] animate-[spin_4s_linear_infinite]" />
            </div>
        </motion.div>
    )
}

export const AIBentoGrid = () => {
    return (
        <section className="max-w-7xl mx-auto py-24 md:py-32 px-4 relative z-10 w-full">
            <div className="mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center mb-4"
                >
                    <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-widest">
                        Neural Capabilities
                    </span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
                >
                    El Cerebro detrás de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Operación</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-zinc-400 max-w-2xl mx-auto text-lg"
                >
                    Sistemas que piensan, analizan y deciden en tiempo real mediante arquitecturas de IA avanzadas.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px] lg:auto-rows-[300px]">

                {/* --- Tarjeta 1: Agentes Autónomos --- */}
                <BentoCard
                    title="Autonomous Agents"
                    description="Flujos de trabajo que operan 24/7 de forma independiente tomando decisiones lógicas complejas y ejecutando tareas automatizadas sin intervención humana."
                    icon={<BrainCircuit className="w-6 h-6" />}
                    colSpan="md:col-span-2 lg:col-span-2"
                    rowSpan="row-span-2"
                    delay={0}
                >
                    <div className="flex-1 flex flex-col justify-end gap-3 w-full max-w-lg mx-auto lg:mx-0">
                        {/* Chat bubbles animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: -20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 w-11/12 backdrop-blur-md relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <span className="text-xs font-mono text-emerald-400">Agent_Core.exe</span>
                            </div>
                            <p className="text-sm text-zinc-300 relative z-10">Procesando 10,000 registros corporativos...</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            whileInView={{ opacity: 1, scale: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 1.5 }}
                            className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl rounded-tr-sm p-4 w-11/12 self-end backdrop-blur-md"
                        >
                            <div className="flex items-center gap-2 mb-2 justify-end">
                                <span className="text-xs font-mono text-emerald-300">Status: Optimized</span>
                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-white font-medium">Reporte generado. <span className="text-emerald-400">Eficiencia: +340%</span></p>
                        </motion.div>
                    </div>
                </BentoCard>

                {/* --- Tarjeta 2: RAG & Knowledge Bases --- */}
                <BentoCard
                    title="RAG & Knowledge Bases"
                    description="Arquitecturas RAG. Consulta toda la documentación interna de tu empresa al instante con respuestas precisas y citadas."
                    icon={<DatabaseZap className="w-6 h-6" />}
                    delay={0.2}
                >
                    <div className="w-full flex justify-center pb-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Neural Nodes SVG */}
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <motion.circle cx="50" cy="50" r="20" fill="transparent" stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="4 4"
                                    animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.circle cx="50" cy="50" r="35" fill="transparent" stroke="rgba(52,211,153,0.1)" strokeWidth="1" strokeDasharray="2 6"
                                    animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.path d="M50 30 L35 65 L65 65 Z" fill="rgba(52,211,153,0.1)" stroke="rgba(52,211,153,0.4)" strokeWidth="1"
                                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                                />
                                <circle cx="50" cy="50" r="4" fill="#34d399" className="animate-pulse" />
                            </svg>
                        </div>
                    </div>
                </BentoCard>

                {/* --- Tarjeta 3: Computer Vision --- */}
                <BentoCard
                    title="Computer Vision"
                    description="Redes neuronales convolucionales para clasificación de imágenes, detección de objetos y análisis visual automatizado."
                    icon={<Eye className="w-6 h-6" />}
                    delay={0.3}
                >
                    <div className="w-full h-[80px] border border-emerald-500/20 rounded-xl relative overflow-hidden bg-black/20 flex items-center justify-center">
                        {/* Scanning Effect */}
                        <motion.div
                            className="absolute top-0 left-0 w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-10"
                            animate={{ y: [0, 80, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Fake Object Detection Boxes */}
                        <div className="absolute inset-0 p-3 opacity-50 flex items-center justify-between">
                            <motion.div
                                className="w-8 h-8 border border-emerald-500 bg-emerald-500/10"
                                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1 }}
                            />
                            <motion.div
                                className="w-12 h-12 border border-emerald-500 bg-emerald-500/10 rounded-full"
                                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.5 }}
                            />
                            <motion.div
                                className="w-6 h-10 border border-emerald-500 bg-emerald-500/10"
                                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 2 }}
                            />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500/70 z-0">TARGET_ACQUIRED</span>
                    </div>
                </BentoCard>

                {/* --- Tarjeta 4: Predictive Analytics --- */}
                <BentoCard
                    title="Predictive Analytics"
                    description="Modelos de series temporales y machine learning para anticipar tendencias, optimizar inventarios y predecir comportamientos."
                    icon={<LineChart className="w-6 h-6" />}
                    delay={0.4}
                >
                    <div className="w-full relative h-[80px] border-b border-l border-emerald-500/20 p-2 flex items-end">
                        <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Line Chart Rising */}
                            <motion.path
                                d="M 0 70 Q 30 60, 60 40 T 130 30 T 180 15 T 200 5"
                                fill="none"
                                stroke="#34d399"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                whileInView={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                            />
                            {/* Glow under line */}
                            <motion.path
                                d="M 0 70 Q 30 60, 60 40 T 130 30 T 180 15 T 200 5 L 200 80 L 0 80 Z"
                                fill="url(#emeraldGradient)"
                                opacity="0.2"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 0.2 }}
                                transition={{ duration: 2, delay: 0.2 }}
                            />
                            <defs>
                                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <motion.circle
                                cx="200" cy="5" r="4"
                                fill="#fff"
                                className="drop-shadow-[0_0_8px_rgba(52,211,153,1)]"
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 2.1 }}
                            />
                        </svg>
                    </div>
                </BentoCard>

            </div>
        </section>
    )
}
