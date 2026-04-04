"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Que diferencia hay entre un chatbot normal y un agente de IA?",
    answer:
      "Un chatbot responde con textos fijos predefinidos. Un agente de IA entiende lenguaje natural, usa contexto, consulta datos en tiempo real y ejecuta acciones: crear pedidos, enviar notificaciones y actualizar tu CRM.",
  },
  {
    question: "Cuanto cuesta implementar IA en mi empresa?",
    answer:
      "Un agente conversacional basico para atencion y ventas por WhatsApp arranca desde 1.800 USD. Un sistema multiagente con integraciones a CRM y ERP puede ir de 4.000 a 12.000 USD.",
  },
  {
    question: "Necesito conocimientos tecnicos para usar la IA?",
    answer:
      "No. Disenamos todo para uso simple desde dashboard web, WhatsApp o tu sistema actual. Tu equipo no necesita programar.",
  },
  {
    question: "La IA puede conectarse con mis sistemas actuales?",
    answer:
      "Si. Integramos con CRM, ERP, Google Sheets, WhatsApp Business API e Instagram. Si tu sistema tiene API o exporta CSV, se puede conectar.",
  },
  {
    question: "Los datos de mis clientes estan seguros?",
    answer:
      "Si. Trabajamos con cifrado en transito y reposo, control de acceso y hosting en infraestructura certificada.",
  },
  {
    question: "Cuanto tiempo lleva implementar una solucion?",
    answer:
      "Un agente basico puede salir en 3 a 4 semanas. Soluciones mas complejas con multiples integraciones suelen tomar de 8 a 12 semanas.",
  },
  {
    question: "Funciona para pymes pequenas o solo grandes empresas?",
    answer:
      "Funciona especialmente bien en pymes, donde cada minuto del equipo cuenta y la automatizacion libera tareas repetitivas.",
  },
  {
    question: "Que pasa si la IA no sabe responder?",
    answer:
      "Escala automaticamente a una persona de tu equipo con contexto completo de la conversacion para que el cliente nunca quede sin respuesta.",
  },
]

export default function FaqIA() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative py-32 w-full overflow-hidden bg-[#080810]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] opacity-[0.05] z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.8) 0%, rgba(22,163,74,0.3) 40%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-6">
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
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.22)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.8)",
              }}
            />
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.22em]"
              style={{ color: "rgba(34,197,94,0.9)" }}
            >
              PREGUNTAS FRECUENTES
            </span>
          </div>

          <h2
            className="font-black leading-[1.05] tracking-[-0.04em] mb-4"
            style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
          >
            <span className="text-white block">Lo que queres saber</span>
            <span
              style={{
                color: "#34d399",
                textShadow: "0 0 16px rgba(52,211,153,0.22)",
              }}
            >
              sobre IA en tu empresa.
            </span>
          </h2>

          <p
            className="text-base max-w-xl leading-relaxed"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            Respondemos sin tecnicismos. La IA es poderosa solo cuando el equipo la entiende y la usa.
          </p>
        </motion.div>

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
                    borderBottom: `1px solid ${
                      isOpen ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"
                    }`,
                    padding: "clamp(18px,2.5vh,28px) 18px",
                    transition: "border-color 200ms",
                  }}
                  aria-expanded={isOpen}
                >
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
                            "linear-gradient(to bottom, rgba(34,197,94,0.8), rgba(22,163,74,0.4), transparent)",
                          transformOrigin: "top",
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "clamp(14px,1.6vw,17px)",
                        fontWeight: 600,
                        color: isOpen ? "#86efac" : "white",
                        transition: "color 250ms",
                      }}
                    >
                      {item.question}
                    </span>

                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        border: `1px solid ${
                          isOpen ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.1)"
                        }`,
                        background: isOpen ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                        color: isOpen ? "#86efac" : "rgba(255,255,255,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 250ms",
                      }}
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                  </div>

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
                          style={{
                            fontSize: "14px",
                            lineHeight: 1.75,
                            color: "rgba(255,255,255,0.52)",
                            paddingTop: "14px",
                            paddingRight: "44px",
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

