"use client"
import { motion } from 'framer-motion'
import { Box, MousePointer2 } from 'lucide-react'

const TEMPLATES = [
    { id: 'T-01', name: 'SaaS_Core_V1', modules: ['Auth', 'Stripe', 'Dashboard'], type: 'Enterprise' },
    { id: 'T-02', name: 'Ecom_Engine', modules: ['Cart', 'Inventory', 'Payments'], type: 'Commercial' },
    { id: 'T-03', name: 'Studio_Portfolio', modules: ['GSAP', '3D_Canvas', 'CMS'], type: 'Creative' },
    { id: 'T-04', name: 'Mobile_Sync', modules: ['Push', 'Offline_Data', 'Auth'], type: 'Utility' },
]

export function TemplateWarehouse() {
    return (
        <section className="py-32 px-8 md:px-24 bg-void relative z-10 w-full">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20">
                    <h2 className="text-sm font-mono text-neon tracking-[0.5em] mb-4">//_STABLE_ASSETS</h2>
                    <h3 className="text-5xl font-bold tracking-tighter uppercase">The_Warehouse</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {TEMPLATES.map((tpl, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="group relative bg-white/[0.02] border border-white/5 p-1 rounded-sm overflow-hidden"
                        >
                            {/* Hardware Screws Visual */}
                            <div className="absolute top-2 left-2 w-1 h-1 bg-white/20 rounded-full group-hover:rotate-90 group-hover:bg-neon transition-all" />
                            <div className="absolute top-2 right-2 w-1 h-1 bg-white/20 rounded-full group-hover:rotate-90 group-hover:bg-neon transition-all" />
                            <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/20 rounded-full group-hover:rotate-90 group-hover:bg-neon transition-all" />
                            <div className="absolute bottom-2 right-2 w-1 h-1 bg-white/20 rounded-full group-hover:rotate-90 group-hover:bg-neon transition-all" />

                            <div className="p-8 flex items-start justify-between h-full relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-[10px] font-mono text-gray-500">ID: {tpl.id}</span>
                                        <h4 className="text-2xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">{tpl.name}</h4>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {tpl.modules.map(mod => (
                                            <span key={mod} className="text-[9px] font-mono border border-white/10 px-2 py-1 text-gray-400 group-hover:border-neon/30 group-hover:text-neon transition-colors">
                                                {mod}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden md:flex flex-col items-end justify-between h-full">
                                    <Box className="w-10 h-10 text-white/5 group-hover:text-neon/20 transition-colors" strokeWidth={1} />
                                    <button className="mt-8 md:mt-auto p-3 border border-white/5 group-hover:border-neon/50 rounded-full transition-colors cursor-pointer">
                                        <MousePointer2 className="w-4 h-4 text-gray-500 group-hover:text-neon" />
                                    </button>
                                </div>
                            </div>

                            {/* Background Accent */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neon/5 blur-[50px] group-hover:bg-neon/10 transition-all pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
