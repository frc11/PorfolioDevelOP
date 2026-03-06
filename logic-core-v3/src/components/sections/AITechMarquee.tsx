"use client"
import React from 'react'
import { motion } from 'framer-motion'

const techs = [
    "GPT-4o",
    "CLAUDE 3.5 SONNET",
    "LLAMA 3",
    "LANGCHAIN",
    "PINECONE VECTOR DB",
    "TENSORFLOW",
    "VERCEL AI SDK"
]

// Duplicate elements to create a seamless loop
const duplicatedTechs = [...techs, ...techs, ...techs, ...techs]

export const AITechMarquee = () => {
    return (
        <section className="w-full relative z-10 py-12 md:py-16 overflow-hidden border-y border-emerald-500/10 bg-black/20 backdrop-blur-md">
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-void to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-void to-transparent z-20 pointer-events-none" />

            <motion.div
                className="flex whitespace-nowrap items-center w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    duration: 35,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                {duplicatedTechs.map((tech, index) => (
                    <div key={index} className="flex items-center">
                        <span className="text-emerald-500/30 font-mono text-sm tracking-widest uppercase px-6 md:px-10">
                            {tech}
                        </span>
                        {/* the separator */}
                        <span className="text-emerald-500/30 font-mono text-sm tracking-widest uppercase">{"//"}</span>
                    </div>
                ))}
            </motion.div>
        </section>
    )
}
