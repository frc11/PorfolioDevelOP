"use client"
import { motion } from 'framer-motion'
import { Smartphone, BrainCircuit, Cog, Binary } from 'lucide-react'

const SYSTEMS = [
    {
        title: 'AI_INTEGRATION',
        desc: 'Neural networks and custom language models.',
        icon: <BrainCircuit />,
        size: 'col-span-1 md:col-span-2',
        color: 'text-purple-500'
    },
    {
        title: 'MOBILE_OS',
        desc: 'Native iOS/Android ecosystems.',
        icon: <Smartphone />,
        size: 'col-span-1',
        color: 'text-neon'
    },
    {
        title: 'AUTOMATION',
        desc: 'High-level scripts and CI/CD pipelines.',
        icon: <Cog />,
        size: 'col-span-1',
        color: 'text-blue-500'
    },
    {
        title: 'CYBER_SEC',
        desc: 'System auditing and hardening.',
        icon: <Binary />,
        size: 'col-span-1 md:col-span-2',
        color: 'text-green-500'
    }
]

export function SoftwareEcosystem() {
    return (
        <section className="py-32 px-8 md:px-24 bg-[#030303] border-t border-white/5 relative z-10 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 space-y-2">
                    <span className="text-neon font-mono text-[10px] tracking-[0.4em] uppercase">Multi_Platform_Deployment</span>
                    <h3 className="text-5xl font-bold tracking-tighter uppercase">Core_Capabilities</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SYSTEMS.map((sys, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
                            className={`${sys.size} group relative bg-black border border-white/10 p-8 rounded-xl overflow-hidden flex flex-col justify-between`}
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className={`p-4 bg-white/5 rounded-xl ${sys.color} transition-transform group-hover:scale-110 duration-500`}>
                                    {sys.icon}
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(d => (
                                        <motion.div
                                            key={d}
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                                            className="w-1 h-3 bg-neon/20 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xl font-bold font-mono tracking-tight">{sys.title}</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{sys.desc}</p>
                            </div>

                            {/* Subtle background glow */}
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 blur-[80px] group-hover:bg-white/10 transition-all" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
