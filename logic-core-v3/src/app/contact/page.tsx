'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-hidden relative">

            {/* Background Noise & Gradient */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />

            <div className="relative z-10 container mx-auto px-6 py-24 min-h-screen flex flex-col justify-center">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mb-16"
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
                        LET'S TALK
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
                        Ready to scale your digital presence? We are currently accepting new projects.
                        Tell us about your vision.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-8"
                    >
                        <form className="space-y-6">
                            <div className="group">
                                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-cyan-400 transition-colors">Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-cyan-500/50 rounded-lg p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900 duration-300"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-cyan-400 transition-colors">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-cyan-500/50 rounded-lg p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900 duration-300"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-cyan-400 transition-colors">Message</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-cyan-500/50 rounded-lg p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900 duration-300 resize-none"
                                    placeholder="Tell us about your project..."
                                />
                            </div>

                            <button className="relative overflow-hidden group w-full bg-zinc-100 hover:bg-white text-black font-bold py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                                <span className="relative z-10">SEND MESSAGE</span>
                                <Send className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-cyan-400/0 group-hover:bg-cyan-400/10 transition-colors" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col justify-between"
                    >
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500">Contact Details</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-zinc-300 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <span className="text-lg group-hover:text-white transition-colors">hello@develop.com</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-zinc-300 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-lg group-hover:text-white transition-colors">+1 (555) 123-4567</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-zinc-300 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <span className="text-lg group-hover:text-white transition-colors">San Francisco, CA</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-sm">
                                <h4 className="text-white font-bold mb-2">Office Hours</h4>
                                <div className="flex justify-between text-zinc-400 text-sm mb-1">
                                    <span>Mon - Fri</span>
                                    <span>09:00 - 18:00</span>
                                </div>
                                <div className="flex justify-between text-zinc-400 text-sm">
                                    <span>Sat - Sun</span>
                                    <span>Closed</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
