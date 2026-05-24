"use client"

import { motion } from 'motion/react'

export function SectionWrapper({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`relative bg-[#030303] ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  )
}
