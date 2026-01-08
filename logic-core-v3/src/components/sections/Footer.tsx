"use client"
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ShieldCheck } from 'lucide-react'

export function Footer() {
    return (
        <footer className="py-20 px-8 md:px-24 bg-void border-t border-white/5 relative z-10 w-full">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">

                {/* LEFT: SYSTEM STATUS */}
                <div className="order-2 md:order-1 w-full md:w-auto">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-[10px] text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            SERVER: STABLE
                        </div>
                        <div>ENCRYPTION: AES_256</div>
                        <div>LOCATION: REMOTE_NODE</div>
                        <div>RUNTIME: 1.0.2_V3</div>
                    </div>
                    <p className="mt-8 text-[10px] text-gray-500 font-mono">
                        © 2026 LOGIC_CORE. ALL_RIGHTS_RESERVED_//_BY_DEVEL_OP
                    </p>
                </div>

                {/* RIGHT: THE INTERACTIVE ID CHIP */}
                <motion.div
                    layout
                    initial={{ width: 180, borderRadius: 12 }}
                    whileHover={{ width: 320 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="order-1 md:order-2 h-16 bg-white text-black p-4 flex items-center justify-between cursor-pointer overflow-hidden relative shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
                >
                    {/* Default State: ID Label */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="p-2 bg-black rounded-lg text-white">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="font-bold tracking-widest text-sm whitespace-nowrap">ID: DEVEL_OP</span>
                    </div>

                    {/* Hover State: Revealed Links */}
                    <div className="flex gap-4 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        <motion.a href="#" whileHover={{ scale: 1.2 }} className="text-black"><Github className="w-5 h-5" /></motion.a>
                        <motion.a href="#" whileHover={{ scale: 1.2 }} className="text-black"><Linkedin className="w-5 h-5" /></motion.a>
                        <motion.a href="#" whileHover={{ scale: 1.2 }} className="text-black"><Mail className="w-5 h-5" /></motion.a>
                    </div>

                    {/* Decorative Scan Line */}
                    <div className="absolute top-0 bottom-0 w-[2px] bg-cyan-500/50 opacity-0 group-hover:opacity-100 group-hover:animate-scan transition-opacity" />

                </motion.div>
            </div>
        </footer>
    )
}
