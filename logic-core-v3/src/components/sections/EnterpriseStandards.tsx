"use client"
import React, { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion'

import { LayoutDashboard, Cpu, Database, Network } from 'lucide-react'

interface CardData {
    title: string
    description: string
    icon: React.ReactNode
    colorClass: string
    delay: number
    className?: string
}

const cardsData: CardData[] = [
    {
        title: "Sistemas de Gestión (ERP/CRM)",
        description: "Olvídate de los excels interminables. Construimos paneles de control a medida donde puedes gestionar ventas, inventario y clientes en tiempo real desde cualquier dispositivo.",
        colorClass: "blue",
        delay: 0,
        icon: <LayoutDashboard className="w-6 h-6" />,
        className: "md:col-span-8"
    },
    {
        title: "Integración con IA",
        description: "No hacemos software estático. Añadimos capacidades de Inteligencia Artificial para que tu sistema analice datos por ti y te ayude a tomar decisiones comerciales.",
        colorClass: "violet",
        delay: 0.1,
        icon: <Cpu className="w-6 h-6" />,
        className: "md:col-span-4"
    },
    {
        title: "Bases de Datos Robustas",
        description: "Tu información empresarial segura y estructurada. Utilizamos PostgreSQL para garantizar que tus datos nunca se pierdan y sean accesibles al instante.",
        colorClass: "indigo",
        delay: 0.2,
        icon: <Database className="w-6 h-6" />,
        className: "md:col-span-4"
    },
    {
        title: "Integración de Sistemas Modernos",
        description: "¿Tienes software viejo que no se habla entre sí? Desarrollamos APIs y conexiones para unificar tus herramientas, logrando que la información fluya sin intervención manual.",
        colorClass: "blue",
        delay: 0.3,
        icon: <Network className="w-6 h-6" />,
        className: "md:col-span-8"
    }
]

const TiltCard = ({ data }: { data: CardData }) => {
    // 3D Tilt Values (Normalized -1 to 1)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Smooth springs for tilt
    const mouseXSpring = useSpring(x, { stiffness: 400, damping: 30 })
    const mouseYSpring = useSpring(y, { stiffness: 400, damping: 30 })

    // Map normalized coordinates to rotation degrees (-7deg to 7deg for more extreme tilt)
    const rotateX = useTransform(mouseYSpring, [-1, 1], ["7deg", "-7deg"])
    const rotateY = useTransform(mouseXSpring, [-1, 1], ["-7deg", "7deg"])

    // Precise Mouse Coordinates for the Glow
    const mouseX = useMotionValue(-1000)
    const mouseY = useMotionValue(-1000)

    const [isHovered, setIsHovered] = useState(false)

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const rect = event.currentTarget.getBoundingClientRect()

        // Tilt calculations
        const width = rect.width
        const height = rect.height

        const localX = event.clientX - rect.left
        const localY = event.clientY - rect.top

        const xPct = (localX / width) * 2 - 1
        const yPct = (localY / height) * 2 - 1

        x.set(xPct)
        y.set(yPct)

        // Glow calculations
        mouseX.set(localX)
        mouseY.set(localY)
    }

    function handleMouseLeave() {
        setIsHovered(false)
        x.set(0)
        y.set(0)
        // Move glow far away
        mouseX.set(-1000)
        mouseY.set(-1000)
    }

    function handleMouseEnter() {
        setIsHovered(true)
    }

    // Creating the radial gradient dynamically linked to motion values
    // Using rgba(139,92,246,0.15) which is a soft violet glow centered at the exact mouse pixel
    const backgroundGlow = useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.15), transparent 80%)`

    // Determine specific color classes based on the data.colorClass
    const colorLineMap: Record<string, string> = {
        'blue': 'group-hover:via-blue-400/50 via-blue-500/20',
        'indigo': 'group-hover:via-indigo-400/50 via-indigo-500/20',
        'violet': 'group-hover:via-violet-400/50 via-violet-500/20',
    }
    const colorTextMap: Record<string, string> = {
        'blue': 'text-blue-400',
        'indigo': 'text-indigo-400',
        'violet': 'text-violet-400',
    }

    const lineClass = colorLineMap[data.colorClass]
    const textClass = colorTextMap[data.colorClass]

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: data.delay, ease: "easeOut" }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className={`group relative flex flex-col p-8 bg-zinc-900/50 hover:bg-zinc-800/80 rounded-2xl border border-white/5 transition-colors duration-300 overflow-hidden ${data.className || ''}`}
        >
            {/* Dynamic Interactive Glow Spotlight */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
                style={{ background: backgroundGlow, opacity: isHovered ? 1 : 0 }}
            />

            {/* Content wrapped in Z-translation for 3D physical depth */}
            <div style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }} className="w-full h-full flex flex-col pointer-events-none">
                {/* Subtle top glow line */}
                <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent to-transparent transition-all duration-300 z-10 ${lineClass}`} />

                <div className="relative z-10 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <div className={textClass}>
                        {data.icon}
                    </div>
                </div>

                <h3 className="relative z-10 text-xl font-bold text-white mb-3">
                    {data.title}
                </h3>

                <p className="relative z-10 text-zinc-400 text-sm leading-relaxed">
                    {data.description}
                </p>
            </div>
        </motion.div>
    )
}

export const EnterpriseStandards = () => {
    return (
        <section className="w-full relative z-10 py-24 px-4 bg-void">
            <div className="max-w-6xl mx-auto">

                {/* Section Header */}
                <div className="mb-16 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4"
                        >
                            <span className="text-zinc-500 font-mono text-sm md:text-base block mb-2 tracking-widest uppercase">// Arquitectura Base</span>
                            Estándares <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Enterprise</span>.
                        </motion.h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6" style={{ perspective: "1000px" }}>
                    {cardsData.map((data, index) => (
                        <TiltCard key={index} data={data} />
                    ))}
                </div>

            </div>
        </section>
    )
}
