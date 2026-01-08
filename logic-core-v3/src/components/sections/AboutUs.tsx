"use client"
import { motion } from 'framer-motion'
import { Target, CheckCircle2, Rocket } from 'lucide-react'

const PILLARS = [
    {
        icon: <Target className="w-8 h-8 text-white" />,
        title: "Diagnóstico",
        desc: "Auditoría profunda de infraestructura y procesos para identificar cuellos de botella."
    },
    {
        icon: <CheckCircle2 className="w-8 h-8 text-white" />,
        title: "Desarrollo",
        desc: "Ingeniería de software de precisión con estándares militares de seguridad y rendimiento."
    },
    {
        icon: <Rocket className="w-8 h-8 text-white" />,
        title: "Escalabilidad",
        desc: "Arquitectura diseñada para soportar crecimiento exponencial sin deuda técnica."
    }
]

export function AboutUs() {
    return (
        <section className="py-40 px-8 md:px-24 bg-black text-white">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="max-w-7xl mx-auto"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
                    <div className="space-y-8">
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                            The<br />Methodology
                        </h2>
                        <p className="text-gray-400 font-light text-lg leading-relaxed max-w-md">
                            No improvisamos. Ejecutamos un protocolo probado para convertir capital en activos digitales de alto rendimiento.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {PILLARS.map((pillar, i) => (
                            <div key={i} className="group flex gap-8 items-start border-t border-white/10 pt-8 transition-colors hover:border-white/30">
                                <span className="font-mono text-xs text-gray-500 mt-2">0{i + 1}</span>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        {pillar.icon}
                                        <h3 className="text-2xl font-bold uppercase tracking-tight">{pillar.title}</h3>
                                    </div>
                                    <p className="text-gray-400 font-light text-lg leading-relaxed">
                                        {pillar.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
