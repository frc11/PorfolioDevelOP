"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
    {
        question: "¿Por qué no usar un creador de sitios barato como Wix o TiendaNube?",
        answer: "Para empezar están bien. Pero para escalar, necesitas un activo digital propio. Las plantillas te limitan, son lentas y te hacen ver igual a tu competencia. Nosotros programamos desde cero para garantizar máxima velocidad y una marca inconfundible."
    },
    {
        question: "¿Tengo que pagar un alquiler mensual obligatorio?",
        answer: "No. Te entregamos el código fuente y sos el dueño absoluto de tu plataforma. Solo ofrecemos planes opcionales de mantenimiento si deseás que nosotros nos encarguemos de actualizar los servidores o escalar el sistema."
    },
    {
        question: "¿Cómo esto se traduce en ventas reales?",
        answer: "Al tener un código limpio (Next.js), Google te posiciona por encima de webs lentas. Además, cada sección de la página está diseñada bajo principios de UX para guiar al usuario directamente a tu WhatsApp o formulario de cotización."
    }
]

export const WebDevelopmentFaq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-32 w-full bg-[#030014] relative z-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter text-center md:text-left">
                        Lo que todo dueño de negocio <span className="text-zinc-500">pregunta.</span>
                    </h2>
                </motion.div>

                {/* FAQ Accordion */}
                <div className="flex flex-col">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="border-b border-white/[0.05]"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full py-6 flex items-center justify-between text-left group gap-4"
                                >
                                    <span className={`text-lg md:text-xl font-medium tracking-tight transition-colors duration-300 ${isOpen ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                                        {item.question}
                                    </span>
                                    <span className="shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/30 transition-all duration-300 bg-[#050505]">
                                        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-8 pt-2 text-zinc-500 font-light leading-relaxed md:text-lg max-w-3xl">
                                                {item.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
