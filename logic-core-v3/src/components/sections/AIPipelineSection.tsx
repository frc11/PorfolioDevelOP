"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Webhook, BrainCircuit, Cloud, Bell } from 'lucide-react'

export const AIPipelineSection = () => {
    return (
        <section className="max-w-5xl mx-auto py-20 px-4 relative z-10 w-full">
            {/* Section Header */}
            <div className="mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6"
                >
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-[pulse_2s_ease-in-out_infinite]" />
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                        // DATA_PIPELINE
                    </span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4"
                >
                    Un cerebro central. <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Conexión total.</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg"
                >
                    Observa cómo fluye la información: de un evento inicial a una respuesta procesada, categorizada y notificada en tiempo real.
                </motion.p>
            </div>

            {/* Pipeline Visualizer Container */}
            <div className="relative w-full flex flex-col md:flex-row items-center justify-between p-8 md:p-12 bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-[2rem] overflow-hidden relative shadow-2xl h-[600px] md:h-auto">

                {/* Background Grid & Glows for the Glass Box */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

                {/* Connecting Line Track */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-white/10 hidden md:block rounded-full z-0" />
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/10 md:hidden rounded-full z-0" />

                {/* The "Data Packets" - Glowing moving dots */}
                {/* Desktop Data Packet */}
                <motion.div
                    className="absolute top-1/2 left-0 h-1 w-24 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-500 to-orange-400 hidden md:block z-0 blur-[1px] rounded-full drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-0 h-[4px] w-[4px] -translate-y-1/2 bg-white hidden md:block z-0 rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Mobile Data Packet */}
                <motion.div
                    className="absolute top-0 left-1/2 w-1 h-24 -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-500 to-orange-400 md:hidden z-0 blur-[1px] drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] rounded-full"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute top-0 left-1/2 w-[4px] h-[4px] -translate-x-1/2 bg-white md:hidden z-0 rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"
                    animate={{ top: ["0%", "100%"] }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />


                {/* --- Box 1: Webhook / Typeform --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-1/4">
                    <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                        <Webhook className="w-7 h-7 text-zinc-300" />
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-semibold text-white block">Webhook / Lead</span>
                        <span className="text-[10px] text-zinc-500 font-mono">TRIGGER_EVENT</span>
                    </div>
                </div>

                {/* --- Box 2: n8n Core + ChatGPT --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-1/4">
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl animate-pulse" />
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-orange-500/10 border border-orange-500 flex items-center justify-center backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.2)] group overflow-hidden">
                            {/* Inner rotating gradient for extra tech feel */}
                            <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(249,115,22,0.4)_360deg)] animate-[spin_4s_linear_infinite]" />
                            <div className="absolute inset-[2px] rounded-[14px] bg-[#0a0a0a] flex items-center justify-center">
                                <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-sm md:text-base font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)] block">n8n Core + OpenAI</span>
                        <span className="text-[10px] text-orange-500/70 font-mono">PROCESSING_LOGIC</span>
                    </div>
                </div>

                {/* --- Box 3: Salesforce / CRM --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-1/4">
                    <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                        <Cloud className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-semibold text-white block">Salesforce</span>
                        <span className="text-[10px] text-zinc-500 font-mono">DATA_SYNC</span>
                    </div>
                </div>

                {/* --- Box 4: Slack Alert --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-1/4">
                    <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                        <Bell className="w-7 h-7 text-zinc-300" />
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-semibold text-white block">Team Alerts</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ACTION_COMPLETE</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
