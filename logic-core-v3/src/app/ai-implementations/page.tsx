"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import HeroIA from '@/components/ia/HeroIA'
import BentoIA from '@/components/ia/BentoIA'
import DemoIA from '@/components/ia/DemoIA'
import PipelineIA from '@/components/ia/PipelineIA'
import RubrosIA from '@/components/ia/RubrosIA'
import ComparadorIA from '@/components/ia/ComparadorIA'
import CalculadorIA from '@/components/ia/CalculadorIA'
import LiveChatIA from '@/components/ia/LiveChatIA'
import VaultIA from '@/components/ia/VaultIA'
import TestimoniosIA from '@/components/ia/TestimoniosIA'
import GarantiaIA from '@/components/ia/GarantiaIA'
import FaqIA from '@/components/ia/FaqIA'
import CtaIA from '@/components/ia/CtaIA'

interface CaseChatMessage {
    from: "client" | "ai"
    text: string
}

interface CaseData {
    industry: string
    client: string
    icon: string
    color: string
    rgb: string
    before: string
    after: string
    chatVariants: CaseChatMessage[][]
    m1: { v: string, l: string }
    m2: { v: string, l: string }
}

// â”€â”€â”€ CASOS DE USO REALES â€” IA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CASOS_IA: CaseData[] = [
    {
        industry: "Restaurante",
        client: "La Esquina Parrilla - Tucuman",
        icon: "\u{1F37D}",
        color: "#34a853",
        rgb: "52,168,83",
        before: "Dueno respondiendo WhatsApp a las 2AM para confirmar reservas. Domingos colapsados de llamadas.",
        after: "Agente IA gestiona reservas, confirma por WhatsApp y envia recordatorio el dia anterior.",
        chatVariants: [
            [
                { from: "client", text: "Hola, tienen mesa para 4 hoy a las 21?" },
                { from: "ai", text: "Si, te la confirmo. A nombre de quien reservo?" },
                { from: "client", text: "A nombre de Garcia, gracias." },
                { from: "ai", text: "Perfecto. Reserva confirmada para las 21:00." },
            ],
            [
                { from: "client", text: "Puedo reservar para manana a la noche?" },
                { from: "ai", text: "Claro. Tengo 20:30 o 22:00 para 2 o 4 personas." },
                { from: "client", text: "22:00 para 2 personas." },
                { from: "ai", text: "Listo. Te envio recordatorio automatico unas horas antes." },
            ],
            [
                { from: "client", text: "Siguen con menu ejecutivo al mediodia?" },
                { from: "ai", text: "Si, de lunes a viernes. Queres que te reserve mesa para hoy?" },
                { from: "client", text: "Si, para las 13:30." },
                { from: "ai", text: "Hecho. Te esperamos 13:30, mesa reservada." },
            ],
            [
                { from: "client", text: "Somos 6, hay lugar el sabado?" },
                { from: "ai", text: "Si, hay disponibilidad 20:00 o 21:30. Cual prefieren?" },
                { from: "client", text: "21:30. A nombre de Luciana." },
                { from: "ai", text: "Reservado para 6 personas, sabado 21:30. Gracias." },
            ],
        ],
        m1: { v: "+47%", l: "ocupacion mensual" },
        m2: { v: "0hs", l: "del dueno en reservas" },
    },
    {
        industry: "Consultorio",
        client: "Dra. Lopez - Psicologia - Tucuman",
        icon: "\u{1F9E0}",
        color: "#22c55e",
        rgb: "34,197,94",
        before: "35% de pacientes no se presentaban sin avisar. Agenda llena de huecos no productivos.",
        after: "IA envia recordatorio 48hs y 2hs antes. Si el paciente cancela, reofrece el turno automaticamente.",
        chatVariants: [
            [
                { from: "client", text: "Necesito turno con la Dra. Lopez esta semana." },
                { from: "ai", text: "Tengo miercoles 10:30 o jueves 17:00. Cual prefieres?" },
                { from: "client", text: "Jueves 17:00, confirmalo por favor." },
                { from: "ai", text: "Turno confirmado. Te recordamos 48h y 2h antes." },
            ],
            [
                { from: "client", text: "Quiero reprogramar mi turno del viernes." },
                { from: "ai", text: "Sin problema. Hay lugar lunes 11:00 o martes 18:30." },
                { from: "client", text: "Martes 18:30 me sirve." },
                { from: "ai", text: "Perfecto, ya quedo actualizado." },
            ],
            [
                { from: "client", text: "Es primera consulta, tienen turno pronto?" },
                { from: "ai", text: "Si. Primer turno disponible: manana 16:00." },
                { from: "client", text: "Me anotas?" },
                { from: "ai", text: "Agendado. Te enviamos ubicacion y recordatorios." },
            ],
            [
                { from: "client", text: "Me olvide de asistir, puedo tomar otro turno?" },
                { from: "ai", text: "Claro, te ofrezco jueves 9:30 o viernes 14:00." },
                { from: "client", text: "Viernes 14:00." },
                { from: "ai", text: "Listo. Quedas confirmada para viernes 14:00." },
            ],
        ],
        m1: { v: "-68%", l: "ausencias sin aviso" },
        m2: { v: "+22%", l: "ingresos sin nuevos pacientes" },
    },
    {
        industry: "Inmobiliaria",
        client: "Grupo Propiedades NOA - Salta",
        icon: "\u{1F3E0}",
        color: "#22c55e",
        rgb: "34,197,94",
        before: "Agentes respondiendo consultas repetitivas de Instagram todo el dia. 60% de leads no calificados.",
        after: "Agente IA filtra leads por intencion real, califica por presupuesto y coordina visitas al agente adecuado.",
        chatVariants: [
            [
                { from: "client", text: "Busco depto 2 amb en Salta, presupuesto 120k." },
                { from: "ai", text: "Perfecto. Te paso 3 opciones y coordinamos visita manana." },
                { from: "client", text: "Genial, priorizo balcon y cochera." },
                { from: "ai", text: "Anotado. Te comparto las mejores opciones ahora." },
            ],
            [
                { from: "client", text: "Quiero alquilar casa 3 dorm en zona norte." },
                { from: "ai", text: "Tengo 2 propiedades dentro de tu rango. Te envio fotos?" },
                { from: "client", text: "Si, y si se puede visitar el jueves." },
                { from: "ai", text: "Perfecto, coordino visita para el jueves por la tarde." },
            ],
            [
                { from: "client", text: "Estoy buscando inversion para renta, que recomiendan?" },
                { from: "ai", text: "Tengo 4 opciones con rentabilidad estimada >7% anual." },
                { from: "client", text: "Mostrame las de menor expensa primero." },
                { from: "ai", text: "Listo. Te envio shortlist y agenda para visitarlas." },
            ],
            [
                { from: "client", text: "Necesito vender mi depto rapido, toman captacion?" },
                { from: "ai", text: "Si, hacemos valuacion inicial y estrategia en 24h." },
                { from: "client", text: "Me interesa. Cuando pueden visitarlo?" },
                { from: "ai", text: "Tenemos disponibilidad manana 11:00 o 17:30." },
            ],
        ],
        m1: { v: "x3", l: "leads calificados/semana" },
        m2: { v: "-5hs", l: "diarias del equipo liberadas" },
    },
]

function LiveCaseChat({ variants, color, rgb }: { variants: CaseChatMessage[][], color: string, rgb: string }) {
    const [visible, setVisible] = useState<number[]>([])
    const [typing, setTyping] = useState(false)
    const [activeVariant, setActiveVariant] = useState(0)
    const activeVariantRef = useRef(0)
    const visibleMessages = variants[activeVariant] ?? []

    useEffect(() => {
        if (variants.length === 0) return

        let active = true
        const timers: ReturnType<typeof setTimeout>[] = []
        activeVariantRef.current = Math.floor(Math.random() * variants.length)
        setActiveVariant(activeVariantRef.current)

        const getNextVariant = () => {
            if (variants.length <= 1) return 0
            let next = activeVariantRef.current
            while (next === activeVariantRef.current) {
                next = Math.floor(Math.random() * variants.length)
            }
            return next
        }

        const runCycle = () => {
            if (!active) return

            const nextVariant = getNextVariant()
            activeVariantRef.current = nextVariant
            setActiveVariant(nextVariant)

            const messages = variants[nextVariant]
            const aiBase = 1180 + Math.floor(Math.random() * 680)
            const clientBase = 980 + Math.floor(Math.random() * 540)
            const typingLead = 260 + Math.floor(Math.random() * 220)

            setVisible([])
            setTyping(false)
            let cursor = 220 + Math.floor(Math.random() * 700)

            messages.forEach((msg, idx) => {
                if (msg.from === "ai") {
                    timers.push(setTimeout(() => {
                        if (active) setTyping(true)
                    }, Math.max(0, cursor - typingLead)))
                }

                timers.push(setTimeout(() => {
                    if (!active) return
                    setTyping(false)
                    setVisible((prev) => [...prev, idx])
                }, cursor))

                cursor += msg.from === "ai" ? aiBase : clientBase
                cursor += Math.floor(Math.random() * 260)
            })

            timers.push(setTimeout(runCycle, cursor + 1900 + Math.floor(Math.random() * 2800)))
        }

        timers.push(setTimeout(runCycle, 220 + Math.floor(Math.random() * 1800)))

        return () => {
            active = false
            timers.forEach(clearTimeout)
        }
    }, [variants])

    return (
        <div
            style={{
                background: "rgba(10,11,19,0.7)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "14px",
                overflow: "hidden",
                marginBottom: "12px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 11px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.03)",
                }}
            >
                <div
                    style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${color}, rgba(${rgb},0.65))`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        flexShrink: 0,
                    }}
                >
                    {"\u{1F916}"}
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: "white" }}>Asistente IA</p>
                    <p style={{ margin: 0, fontSize: "10px", color }}>{'\u2022'} En linea ahora</p>
                </div>
            </div>

            <div
                style={{
                    height: "170px",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    gap: "7px",
                    overflow: "hidden",
                }}
            >
                {visibleMessages.map((msg, idx) => {
                    if (!visible.includes(idx)) return null
                    const isAI = msg.from === "ai"
                    return (
                        <motion.div
                            key={`${msg.text}-${idx}`}
                            initial={{ opacity: 0, y: 7, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                display: "flex",
                                justifyContent: isAI ? "flex-start" : "flex-end",
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: "90%",
                                    borderRadius: isAI ? "8px 12px 12px 12px" : "12px 8px 12px 12px",
                                    padding: "7px 9px",
                                    background: isAI ? `rgba(${rgb},0.16)` : "rgba(255,255,255,0.08)",
                                    border: isAI ? `1px solid rgba(${rgb},0.26)` : "1px solid rgba(255,255,255,0.13)",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "11px",
                                        lineHeight: 1.35,
                                        color: "rgba(255,255,255,0.82)",
                                        margin: 0,
                                    }}
                                >
                                    {msg.text}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}

                {typing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div
                            style={{
                                padding: "8px 10px",
                                borderRadius: "8px 12px 12px 12px",
                                background: `rgba(${rgb},0.12)`,
                                border: `1px solid rgba(${rgb},0.2)`,
                                display: "flex",
                                gap: "4px",
                                alignItems: "center",
                            }}
                        >
                            {[0, 1, 2].map((dot) => (
                                <span
                                    key={dot}
                                    style={{
                                        width: "5px",
                                        height: "5px",
                                        borderRadius: "999px",
                                        background: color,
                                        animation: `caseTyping 1.1s ${dot * 0.16}s ease-in-out infinite`,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <div
                style={{
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    padding: "8px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        borderRadius: "999px",
                        padding: "7px 10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.25)",
                    }}
                >
                    Escribi tu mensaje...
                </div>
                <div
                    style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: `linear-gradient(135deg, ${color}, rgba(${rgb},0.55))`,
                        color: "rgba(3,8,12,0.95)",
                        fontWeight: 900,
                        fontSize: "12px",
                    }}
                >
                    {"\u2191"}
                </div>
            </div>
        </div>
    )
}
const CasosUsoIA = () => (
    <section className="relative py-24 px-4 lg:px-8 overflow-hidden bg-[#080810]">
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 60%)",
            }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-12 text-center"
            >
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                    style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)" }}
                >
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.8)" }}
                    />
                    <span
                        className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
                        style={{ color: "rgba(34,197,94,0.85)" }}
                    >
                        CASOS REALES
                    </span>
                </div>
                <h2
                    className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
                    style={{ fontSize: "clamp(28px,4vw,48px)" }}
                >
                    <span className="text-white block">La IA que ya trabaja</span>
                    <span
                        style={{
                            color: "#34d399",
                                textShadow: "0 0 16px rgba(52,211,153,0.22)",
                        }}
                    >
                        en estos negocios.
                    </span>
                </h2>
                <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Resultados reales. No demos. No simulaciones. Sistemas en produccion hoy.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CASOS_IA.map((c, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 32 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{
                            y: -6,
                            boxShadow: `0 24px 48px rgba(${c.rgb},0.18)`,
                        }}
                        style={{
                            background: `linear-gradient(135deg, rgba(${c.rgb},0.07) 0%, rgba(255,255,255,0.02) 100%)`,
                            border: `1px solid rgba(${c.rgb},0.2)`,
                            borderRadius: "20px",
                            padding: "clamp(20px,2.5vw,28px)",
                            transition: "border-color 300ms",
                            cursor: "default",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "12px",
                                    background: `rgba(${c.rgb},0.12)`,
                                    border: `1px solid rgba(${c.rgb},0.25)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "22px",
                                    flexShrink: 0,
                                }}
                            >
                                {c.icon}
                            </div>
                            <div>
                                <p
                                    style={{
                                        fontSize: "10px",
                                        color: c.color,
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        margin: "0 0 2px",
                                    }}
                                >
                                    {c.industry}
                                </p>
                                <p style={{ fontSize: "12px", color: "white", fontWeight: 600, margin: 0 }}>
                                    {c.client}
                                </p>
                            </div>
                        </div>

                        <LiveCaseChat variants={c.chatVariants} color={c.color} rgb={c.rgb} />

                        <div className="space-y-2 mb-5">
                            <div
                                style={{
                                    background: "rgba(148,163,184,0.06)",
                                    border: "1px solid rgba(148,163,184,0.18)",
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "9px",
                                        color: "rgba(203,213,225,0.82)",
                                        fontWeight: 700,
                                        letterSpacing: "0.15em",
                                        margin: "0 0 4px",
                                    }}
                                >
                                    ANTES
                                </p>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "rgba(255,255,255,0.45)",
                                        lineHeight: 1.6,
                                        margin: 0,
                                    }}
                                >
                                    {c.before}
                                </p>
                            </div>
                            <div
                                style={{
                                    background: `rgba(${c.rgb},0.09)`,
                                    border: `1px solid rgba(${c.rgb},0.2)`,
                                    borderRadius: "10px",
                                    padding: "10px 12px",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "9px",
                                        color: c.color,
                                        fontWeight: 700,
                                        letterSpacing: "0.15em",
                                        margin: "0 0 4px",
                                    }}
                                >
                                    DESPUES
                                </p>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "rgba(255,255,255,0.55)",
                                        lineHeight: 1.6,
                                        margin: 0,
                                    }}
                                >
                                    {c.after}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {[c.m1, c.m2].map((m, j) => (
                                <div
                                    key={j}
                                    style={{
                                        background: `rgba(${c.rgb},0.08)`,
                                        border: `1px solid rgba(${c.rgb},0.18)`,
                                        borderRadius: "10px",
                                        padding: "10px 8px",
                                        textAlign: "center",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: "clamp(16px,2vw,20px)",
                                            fontWeight: 900,
                                            color: c.color,
                                            margin: 0,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {m.v}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "9px",
                                            color: "rgba(255,255,255,0.4)",
                                            margin: "4px 0 0",
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {m.l}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
        <style>{`
            @keyframes caseTyping {
                0%, 100% { opacity: 0.35; transform: translateY(0); }
                50% { opacity: 1; transform: translateY(-2px); }
            }
        `}</style>
    </section>
)

// Section reveal wrapper
const SectionReveal = ({
    children,
    delay = 0,
}: {
    children: React.ReactNode
    delay?: number
}) => (
    <motion.div
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
)

// Thin gradient divider â€” purple palette for IA
const SectionDivider = () => (
    <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
            height: "1px",
            background:
                "linear-gradient(90deg, transparent, rgba(34,197,94,0.12) 25%, rgba(22,163,74,0.30) 50%, rgba(34,197,94,0.12) 75%, transparent)",
            transformOrigin: "center",
        }}
    />
)

export default function AIImplementationsPage() {
    return (
        <main className="ai-impl-page relative min-h-screen w-full bg-[#080810] overflow-x-hidden text-white scroll-smooth">
            {/* Global atmosphere overlays */}
            <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#080810] to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#080810] to-transparent" />
            </div>

            {/* 1. Hero */}
            <HeroIA />

            {/* 2. Bento Grid */}
            <SectionReveal>
                <BentoIA />
            </SectionReveal>

            <SectionDivider />

            {/* 3. Live Chat Demo */}
            <SectionReveal delay={0.05}>
                <LiveChatIA />
            </SectionReveal>

            <SectionDivider />

            {/* 4. GarantÃ­a / Trust */}
            <SectionReveal delay={0.05}>
                <GarantiaIA />
            </SectionReveal>

            <SectionDivider />

            {/* 4b. Casos de uso reales */}
            <SectionReveal delay={0.05}>
                <CasosUsoIA />
            </SectionReveal>

            <SectionDivider />

            {/* 5. Rubros (Vertical focus) */}
            <SectionReveal delay={0.05}>
                <RubrosIA />
            </SectionReveal>

            <SectionDivider />

            {/* 6. Pipeline */}
            <SectionReveal delay={0.05}>
                <PipelineIA />
            </SectionReveal>

            <SectionDivider />

            {/* 7. Demo interactivo */}
            <SectionReveal delay={0.05}>
                <DemoIA />
            </SectionReveal>

            <SectionDivider />

            {/* 8. Comparador ROI */}
            <SectionReveal delay={0.05}>
                <ComparadorIA />
            </SectionReveal>

            <SectionDivider />

            {/* 9. Calculador */}
            <SectionReveal delay={0.05}>
                <CalculadorIA />
            </SectionReveal>

            <SectionDivider />

            {/* 10. Testimonios */}
            <SectionReveal delay={0.05}>
                <TestimoniosIA />
            </SectionReveal>

            <SectionDivider />

            {/* 11. FAQ */}
            <SectionReveal delay={0.05}>
                <FaqIA />
            </SectionReveal>

            <SectionDivider />

            {/* 12. CTA con urgencia */}
            <SectionReveal delay={0.05}>
                <CtaIA />
            </SectionReveal>

            {/* 13. Vault closure */}
            <VaultIA />

            <style>{`
                .ai-impl-page,
                .ai-impl-page * {
                    cursor: none !important;
                }
            `}</style>
        </main>
    )
}



