"use client"
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const REVIEWS = [
    {
        text: "Logic Core transformó nuestra operación logística. La eficiencia aumentó un 40% en el primer trimestre.",
        author: "Carlos Méndez",
        role: "COO @ LogiTech Global"
    },
    {
        text: "La calidad del código y la arquitectura es simplemente superior. Una inversión que se pagó sola.",
        author: "Sarah Johnson",
        role: "CTO @ Fintech Solutions"
    }
]

export function FeedbackLoop() {
    return (
        <section className="py-40 px-8 md:px-24 bg-black text-white border-t border-white/5">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="max-w-7xl mx-auto"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                    <div className="space-y-8">
                        <Quote className="w-12 h-12 text-white/20" />
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
                            Partner<br />Feedback
                        </h2>
                    </div>

                    <div className="space-y-16">
                        {REVIEWS.map((review, i) => (
                            <motion.div
                                key={i}
                                className="space-y-6 relative p-8 border border-transparent hover:border-white/10 transition-colors duration-500 rounded-lg group"
                                whileHover={{ scale: 1.02 }}
                            >
                                {/* Subtle Glow Background */}
                                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />

                                <p className="text-2xl md:text-3xl font-light leading-snug text-gray-200 relative z-10">
                                    "{review.text}"
                                </p>
                                <div className="relative z-10">
                                    <p className="text-base font-bold uppercase tracking-widest text-white">{review.author}</p>
                                    <p className="text-sm font-mono text-gray-500 mt-1">{review.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
