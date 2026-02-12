'use client';

import { motion } from 'framer-motion';
import { Network, Database, Layers, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const BentoGridItem = ({ title, description, icon, delay }: { title: string; description: string; icon: React.ReactNode; delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className="group relative overflow-hidden bg-zinc-900/50 border border-white/10 p-8 rounded-xl hover:border-cyan-500/30 transition-colors h-full flex flex-col justify-between"
        >
            {/* Laser Scan Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            <div className="mb-4 text-cyan-400 group-hover:text-cyan-300 transition-colors group-hover:scale-110 duration-300 origin-left">
                {icon}
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-2 font-mono uppercase tracking-wider">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default function WebDevelopmentPage() {
    return (
        <main className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* Ambient Background */}
            <div className="fixed top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-cyan-900/50">
                        WEB_ARCHITECTURE
                    </h1>
                    <p className="text-xl md:text-2xl text-cyan-400/80 font-mono border-l-2 border-cyan-500/30 pl-6 max-w-2xl">
                        Immersive interfaces. Scalable backends. Pure performance.
                    </p>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 auto-rows-fr">

                    {/* Tall Item */}
                    <div className="lg:row-span-2">
                        <BentoGridItem
                            title="Next.js & React"
                            description="State-of-the-art frontend engineering. We build lightning-fast, SEO-optimized applications using the latest Next.js 14+ features, Server Actions, and React Server Components."
                            icon={<Layers className="w-8 h-8" />}
                            delay={0.1}
                        />
                    </div>

                    <BentoGridItem
                        title="3D WebGL Experiences"
                        description="Pushing browser limits with Three.js and React Three Fiber. Create immersive 3D worlds that captive users instantly."
                        icon={<Network className="w-8 h-8" />}
                        delay={0.2}
                    />

                    <BentoGridItem
                        title="High-Perf SEO"
                        description="Google-dominating speed scores. Core Web Vitals optimized from day one for maximum visibility."
                        icon={<Database className="w-8 h-8" />}
                        delay={0.3}
                    />

                    {/* Wide Span Item */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <BentoGridItem
                            title="E-Commerce Solutions"
                            description="High-conversion checkout flows. Integrated with Stripe, Shopify, or custom headless architectures for complete control over your sales funnel."
                            icon={<ShoppingBag className="w-8 h-8" />}
                            delay={0.4}
                        />
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex justify-start"
                >
                    <Link
                        href="/contact"
                        className="group flex items-center gap-4 text-cyan-400 hover:text-white transition-colors duration-300"
                    >
                        <span className="text-2xl md:text-4xl font-black tracking-tighter uppercase border-b border-cyan-500/30 pb-1 group-hover:border-white transition-all">
                            Start Priority Project
                        </span>
                        <div className="bg-cyan-500/10 p-3 rounded-full group-hover:bg-cyan-500 group-hover:text-black transition-all">
                            <ArrowRight className="w-6 h-6 transform group-hover:-rotate-45 transition-transform duration-300" />
                        </div>
                    </Link>
                </motion.div>

            </div>
        </main>
    );
}
