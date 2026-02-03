"use client"
import { motion } from 'framer-motion'
import { Cpu, Code2, Terminal } from 'lucide-react'

const TEAM = [
    {
        name: "Architect_01",
        role: "Lead System Engineer",
        skills: ["Architecture", "Backend", "Cloud"],
        icon: <Cpu className='w-5 h-5' />
    },
    {
        name: "Architect_02",
        role: "Creative Technologist",
        skills: ["Three.js", "UI/UX", "Frontend"],
        icon: <Code2 className='w-5 h-5' />
    }
]

export function TeamSection() {
    return (
        <section className="py-32 px-8 md:px-24 bg-white text-black relative z-10 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter flex items-center gap-4">
                        <Terminal className="text-neon" />
                        SYSTEM_ARCHITECTS
                    </h2>
                    <div className="h-[1px] w-full bg-gradient-to-r from-neon/50 to-transparent mt-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {TEAM.map((member, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="group relative p-8 rounded-2xl bg-black/[0.03] border border-black/10 overflow-hidden"
                        >
                            {/* Glow Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-neon/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 space-y-4">
                                <div className="p-3 bg-neon/10 rounded-lg w-fit text-neon">
                                    {member.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-neon/70 tracking-widest uppercase mb-1">{member.role}</p>
                                    <h3 className="text-3xl font-bold uppercase">{member.name}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {member.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono hover:bg-neon/10 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
