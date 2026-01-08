"use client"
import { motion } from 'framer-motion'
import { Rocket, Timer, ShieldCheck, ArrowRight } from 'lucide-react'

const ACCELERATORS = [
    {
        name: "Enterprise SaaS",
        desc: "Lanza tu MVP en 15 días con seguridad bancaria y pagos integrados.",
        time: "15 Days",
        icon: <Rocket className="w-6 h-6 text-white" />
    },
    {
        name: "High-Scale Retail",
        desc: "Arquitectura de comercio electrónico diseñada para tráfico masivo.",
        time: "21 Days",
        icon: <Timer className="w-6 h-6 text-white" />
    },
    {
        name: "Business Intelligence",
        desc: "Paneles de control ejecutivos que centralizan tus datos.",
        time: "10 Days",
        icon: <ShieldCheck className="w-6 h-6 text-white" />
    }
]

export function BusinessAccelerators() {
    return (
        <section className="py-40 px-8 md:px-24 bg-black text-white">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="max-w-7xl mx-auto"
            >
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase max-w-2xl leading-[0.9]">
                        Business<br />Accelerators
                    </h2>
                    <p className="text-gray-400 font-light text-lg leading-relaxed max-w-sm text-right">
                        Infraestructura de élite lista para despliegue inmediato. Ahorra meses de desarrollo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {ACCELERATORS.map((item, i) => (
                        <div
                            key={i}
                            className="group p-10 bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-colors duration-500 relative overflow-hidden"
                        >
                            {/* Vertical Scanner (Right Edge) */}
                            <motion.div
                                initial={{ y: '-100%' }}
                                whileHover={{ y: '100%' }}
                                transition={{ duration: 1.5, ease: 'linear', repeat: Infinity }}
                                className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-neon to-transparent opacity-0 group-hover:opacity-50"
                            />

                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-white/5 text-white">
                                        {item.icon}
                                    </div>
                                    <span className="font-mono text-xs border border-white/10 px-3 py-1 text-gray-400">
                                        {item.time}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold uppercase tracking-tight">{item.name}</h3>
                                    <p className="text-gray-400 font-light text-lg leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="pt-8 border-t border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                                    Ver Detalles <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}
