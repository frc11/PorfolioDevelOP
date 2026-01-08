"use client"
import { motion } from 'framer-motion'
import { ArrowUpRight, ShieldCheck, Zap, Globe } from 'lucide-react'

const PROJECTS = [
    {
        title: "Digital_Banking_Core",
        impact: "Security & Scale",
        metric: "99.9% Uptime",
        icon: <ShieldCheck className="w-6 h-6 text-white" />
    },
    {
        title: "E-Commerce_Evolution",
        impact: "Performance & UX",
        metric: "+250% Conversion",
        icon: <Zap className="w-6 h-6 text-white" />
    },
    {
        title: "AI_Logistic_System",
        impact: "Automation & ROI",
        metric: "-40% Ops Costs",
        icon: <Globe className="w-6 h-6 text-white" />
    }
]

export function ProjectLab() {
    return (
        <section className="py-40 px-8 md:px-24 bg-black text-white">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="max-w-7xl mx-auto"
            >
                <div className="mb-24 space-y-6">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
                        Selected<br />Works
                    </h2>
                    <div className="w-24 h-1 bg-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PROJECTS.map((project, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="group relative flex flex-col overflow-hidden"
                        >
                            {/* Scanner Effect Layer */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
                                className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none z-20"
                            />

                            {/* Card Image Placeholder */}
                            <div className="aspect-[4/5] bg-[#111] relative overflow-hidden mb-8">
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                                    {project.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4 border-l border-white/10 pl-6 group-hover:border-white transition-colors duration-500">
                                <h3 className="text-xl font-bold uppercase tracking-tight">{project.title}</h3>

                                <div className="space-y-1">
                                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Impact</p>
                                    <p className="text-lg text-white font-light">{project.impact}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Metric</p>
                                    <p className="text-lg text-white font-bold">{project.metric}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}
