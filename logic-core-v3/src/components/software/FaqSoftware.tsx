"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

interface FaqItem {
    question: string
    answer: string
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "¿Cuánto cuesta un sistema a medida para mi empresa?",
        answer: "Depende de la complejidad. Un CRM básico arranca desde $1.500 USD con panel de clientes, historial de ventas y reportes. Un ERP completo con múltiples módulos puede ir desde $4.000 USD. Lo que siempre garantizamos: el costo es fijo (sin sorpresas) y lo que construimos es tuyo para siempre, sin suscripciones de plataforma.",
    },
    {
        question: "¿Cuánto tiempo demora el desarrollo desde el día 1?",
        answer: "Entre 6 y 16 semanas según la escala. Semana 1-2: relevamiento y arquitectura. Semana 3-4: diseño de interfaces. Semana 5-10: desarrollo del core. Semana 11-16: módulos adicionales, pruebas y lanzamiento. Tenés acceso a un demo funcional desde la semana 4 para dar feedback en tiempo real.",
    },
    {
        question: "¿Pueden migrar mis datos de Excel, Google Sheets o sistema anterior?",
        answer: "Sí, siempre. La migración de datos es parte del proceso estándar. Exportamos todo lo que tenés (clientes, productos, historial), lo limpiamos y lo cargamos en el nuevo sistema. Si tu sistema anterior tiene una API o exportación CSV, el proceso es limpio y sin pérdida de información.",
    },
    {
        question: "¿El sistema funciona desde el celular de mis empleados?",
        answer: "Completamente. Desarrollamos en Next.js con diseño responsive que funciona igual en celular, tablet y computadora. No necesitás instalar nada — se accede desde el navegador con usuario y contraseña. Si necesitás una app nativa para iOS o Android, podemos cotizarla por separado.",
    },
    {
        question: "¿Qué pasa si necesito cambios o nuevas funciones después de la entrega?",
        answer: "El sistema es tuyo: podés pedirme cambios cuando quieras. Ofrecemos un plan de mantenimiento mensual que cubre hasta 10 horas de ajustes, actualizaciones de seguridad y soporte prioritario. También podés contratar horas sueltas para features nuevos. Nunca quedás 'encadenado' a un proveedor.",
    },
    {
        question: "¿Trabajan con empresas de otras provincias o solo Tucumán?",
        answer: "Trabajamos con empresas de todo el país y también en el exterior. Tucumán es nuestra base, pero el 40% de nuestros proyectos son para clientes de Buenos Aires, Mendoza, Córdoba y Uruguay. Todo el proceso puede hacerse 100% remoto con reuniones por videollamada y entregas por demo en vivo.",
    },
    {
        question: "¿Qué tecnologías usan y por qué?",
        answer: "Stack moderno y estable: Next.js + TypeScript para el frontend (velocidad + seguridad de tipos), Node.js o Python para el backend, PostgreSQL para la base de datos y hosting en la nube (AWS o Vercel según necesidad). Elegimos tecnología madura con comunidad activa — sin experimentos que te dejen colgado en 2 años.",
    },
    {
        question: "¿Cómo garantizan que el sistema no va a fallar en producción?",
        answer: "Tres capas de protección: (1) testing automatizado antes de cada deploy, (2) monitoreo 24/7 con alertas en tiempo real, y (3) backups automáticos diarios. Nuestro uptime promedio en sistemas productivos es del 99,7%. En 3 años de desarrollo, ningún cliente perdió datos. Si algo falla, lo resolvemos en menos de 4 horas hábiles.",
    },
]

export default function FaqSoftware() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <section className="relative py-32 w-full overflow-hidden">
            {/* Background glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-[0.06] z-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.3) 40%, transparent 70%)",
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16"
                >
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
                        style={{
                            background: "rgba(99,102,241,0.08)",
                            border: "1px solid rgba(99,102,241,0.22)",
                        }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "#6366f1", boxShadow: "0 0 6px rgba(99,102,241,0.8)" }}
                        />
                        <span
                            className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                            style={{ color: "rgba(99,102,241,0.85)" }}
                        >
                            PREGUNTAS FRECUENTES
                        </span>
                    </div>

                    <h2
                        className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                        style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
                    >
                        <span className="text-white block">Todo lo que querés saber</span>
                        <span
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            antes de empezar.
                        </span>
                    </h2>

                    <p
                        className="text-base max-w-xl leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.42)" }}
                    >
                        Respondemos las dudas más comunes sobre desarrollo de software a medida para
                        empresas de Tucumán y Argentina.
                    </p>
                </motion.div>

                {/* Accordion */}
                <div className="flex flex-col">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.07,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full text-left relative"
                                    style={{
                                        borderBottom: `1px solid ${isOpen ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)"}`,
                                        padding: "clamp(18px, 2.5vh, 28px) clamp(8px, 1vw, 14px)",
                                        transition: "border-color 200ms",
                                    }}
                                    aria-expanded={isOpen}
                                >
                                    {/* Left accent line when open */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                exit={{ scaleY: 0 }}
                                                style={{
                                                    position: "absolute",
                                                    left: "-1px",
                                                    top: 0,
                                                    bottom: 0,
                                                    width: "2px",
                                                    background:
                                                        "linear-gradient(to bottom, rgba(99,102,241,0.7), rgba(139,92,246,0.4), transparent)",
                                                    transformOrigin: "top",
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <div className="flex justify-between items-center gap-4">
                                        <span
                                            className="font-semibold transition-colors duration-200"
                                            style={{
                                                fontSize: "clamp(14px, 1.6vw, 17px)",
                                                color: isOpen ? "#a5b4fc" : "white",
                                            }}
                                        >
                                            {item.question}
                                        </span>

                                        <div
                                            className="flex-shrink-0 flex items-center justify-center transition-all duration-200"
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                borderRadius: "50%",
                                                border: `1px solid ${isOpen ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.1)"}`,
                                                background: isOpen
                                                    ? "rgba(99,102,241,0.1)"
                                                    : "rgba(255,255,255,0.04)",
                                                color: isOpen ? "#a5b4fc" : "rgba(255,255,255,0.5)",
                                            }}
                                        >
                                            {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                                        </div>
                                    </div>

                                    {/* Answer */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.28, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <p
                                                    className="leading-relaxed pt-3 pb-1 pr-12"
                                                    style={{
                                                        fontSize: "14px",
                                                        color: "rgba(255,255,255,0.52)",
                                                        maxWidth: "680px",
                                                    }}
                                                >
                                                    {item.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
