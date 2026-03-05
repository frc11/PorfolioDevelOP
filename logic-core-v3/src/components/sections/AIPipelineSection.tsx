"use client"
import React from 'react'
import { motion } from 'framer-motion'

export const AIPipelineSection = () => {
    return (
        <section className="max-w-7xl mx-auto py-32 px-4 relative z-10 w-full">
            {/* Section Header */}
            <div className="mb-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                        // WORKFLOW_ENGINE
                    </span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
                >
                    Un sistema. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Infinitas conexiones.</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-zinc-400 max-w-2xl mx-auto text-lg"
                >
                    Visualiza cómo un lead nuevo detona una cadena inteligente de eventos, calificando y notificando en milisegundos.
                </motion.p>
            </div>

            {/* Pipeline Visualizer Container */}
            <div className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[300px] flex flex-col md:flex-row items-center justify-between p-8 md:p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">

                {/* Background Grid & Glows for the Glass Box */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Connecting Line Path (Background Track) */}
                <div className="absolute top-1/2 left-12 right-12 h-[2px] -translate-y-1/2 bg-white/[0.05] hidden md:block rounded-full" />
                <div className="absolute top-12 bottom-12 left-1/2 w-[2px] -translate-x-1/2 bg-white/[0.05] md:hidden rounded-full" />

                {/* The "Data Packet" Ray of Light Animation */}
                {/* Desktop horizontal ray */}
                <motion.div
                    className="absolute top-1/2 left-12 h-[2px] w-32 -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 hidden md:block z-0 blur-[1px]"
                    animate={{
                        x: ['0%', '800%'], // Travels across the width
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.2, 0.8, 1]
                    }}
                />
                {/* Mobile vertical ray */}
                <motion.div
                    className="absolute top-12 left-1/2 w-[2px] h-32 -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-400 to-cyan-400 md:hidden z-0 blur-[1px]"
                    animate={{
                        y: ['0%', '800%'], // Travels across the height
                        opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        times: [0, 0.2, 0.8, 1]
                    }}
                />

                {/* --- Box 1: Web Lead --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg">
                        <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Nuevo Lead (Web)</span>
                </div>

                {/* --- Box 2: n8n + OpenAI (The Brain) --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto">
                    {/* Pulsing container for the brain */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-2xl blur-xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">Cerebro n8n + OpenAI</span>
                </div>

                {/* --- Box 3: CRM --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg">
                        <svg className="w-8 h-8 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Añadir a CRM</span>
                </div>

                {/* --- Box 4: Slack --- */}
                <div className="relative z-10 flex flex-col items-center gap-3 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-lg">
                        <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Alerta en Slack</span>
                </div>
            </div>
        </section>
    )
}
