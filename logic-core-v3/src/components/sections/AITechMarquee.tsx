"use client"
import React from 'react'
import { motion } from 'framer-motion'

const techs = [
    "OpenAI GPT-4o",
    "Anthropic Claude 3.5",
    "LangChain",
    "Pinecone",
    "Vercel AI SDK",
    "Llama 3"
]

// Duplicate elements to create a seamless loop
const duplicatedTechs = [...techs, ...techs, ...techs, ...techs]

export const AITechMarquee = () => {
    return (
        <section className="w-full relative z-10 py-16 overflow-hidden border-y border-white/5 bg-black/20 backdrop-blur-md">
            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-void to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-void to-transparent z-20 pointer-events-none" />

            <motion.div
                className="flex whitespace-nowrap items-center w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    duration: 40,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                {duplicatedTechs.map((tech, index) => (
                    <div key={index} className="flex items-center">
                        <span className="text-zinc-500 font-mono text-sm md:text-lg tracking-wider px-8 uppercase">
                            {tech}
                        </span>
                        {/* the separator */}
                        <span className="text-zinc-700/50 font-mono">{"//"}</span>
                    </div>
                ))}
            </motion.div>
        </section>
    )
}
