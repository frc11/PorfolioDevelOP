'use client';

import { motion } from 'framer-motion';
import { Server, Cpu, Cloud, Code2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const BentoGridItem = ({ title, description, icon, delay }: { title: string; description: string; icon: React.ReactNode; delay: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className="group relative overflow-hidden bg-zinc-900/50 border border-white/10 p-8 rounded-xl hover:border-violet-500/30 transition-colors h-full flex flex-col justify-between"
        >
            {/* Laser Scan Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            <div className="mb-4 text-violet-400 group-hover:text-violet-300 transition-colors group-hover:scale-110 duration-300 origin-left">
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

function SoftwareDesktop() {
    return (
        <main className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 selection:bg-violet-500/30 selection:text-violet-200">

            {/* Ambient Background */}
            <div className="fixed top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-violet-900/10 to-transparent pointer-events-none" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-violet-100 to-violet-900/50">
                        SYSTEM_ENGINEERING
                    </h1>
                    <p className="text-xl md:text-2xl text-violet-400/80 font-mono border-l-2 border-violet-500/30 pl-6 max-w-2xl">
                        Robust algorithms. AI integration. Enterprise logic.
                    </p>
                </motion.div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 auto-rows-fr">

                    {/* Tall Item */}
                    <div className="lg:row-span-2">
                        <BentoGridItem
                            title="SaaS Architecture"
                            description="Scalable multi-tenant systems designed for growth. We build resilient backends that handle thousands of concurrent users with zero downtime."
                            icon={<Server className="w-8 h-8" />}
                            delay={0.1}
                        />
                    </div>

                    <BentoGridItem
                        title="AI & ML Integration"
                        description="Smart logic for data-driven decisions. Integrate LLMs, predictive models, and automated reasoning into your core business logic."
                        icon={<Cpu className="w-8 h-8" />}
                        delay={0.2}
                    />

                    <BentoGridItem
                        title="Cloud Infrastructure"
                        description="AWS/Azure serverless deployments. Auto-scaling clusters, managed databases, and global CDNs for minimal latency."
                        icon={<Cloud className="w-8 h-8" />}
                        delay={0.3}
                    />

                    {/* Wide Span Item */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <BentoGridItem
                            title="API Design & Security"
                            description="Secure, documented, and fast endpoints. GraphQL or REST architectures with JWT authentication, rate limiting, and automated testing pipelines."
                            icon={<Code2 className="w-8 h-8" />}
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
                        className="group flex items-center gap-4 text-violet-400 hover:text-white transition-colors duration-300"
                    >
                        <span className="text-2xl md:text-4xl font-black tracking-tighter uppercase border-b border-violet-500/30 pb-1 group-hover:border-white transition-all">
                            Engineer Solution
                        </span>
                        <div className="bg-violet-500/10 p-3 rounded-full group-hover:bg-violet-500 group-hover:text-black transition-all">
                            <ArrowRight className="w-6 h-6 transform group-hover:-rotate-45 transition-transform duration-300" />
                        </div>
                    </Link>
                </motion.div>

            </div>
        </main>
    );
}

function SoftwareMobile() {
    return (
        <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-32 overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200">
            {/* Ambient Base */}
            <div className="fixed inset-0 bg-gradient-to-b from-violet-900/5 to-zinc-950 pointer-events-none" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />

            <div className="container mx-auto px-6 relative z-10 flex flex-col gap-12">
                {/* Mobile Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-4"
                >
                    <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-violet-100 to-violet-900/50 break-words">
                        SYSTEM
                        <br />
                        ENGINEERING
                    </h1>
                    <p className="text-lg text-violet-400/80 font-mono border-l-2 border-violet-500/30 pl-4">
                        Robust algorithms. AI integration. Enterprise logic.
                    </p>
                </motion.div>

                {/* Mobile Stacked Items */}
                <div className="flex flex-col gap-6">
                    <BentoGridItem
                        title="SaaS Architecture"
                        description="Scalable multi-tenant systems designed for growth. We build resilient backends that handle thousands of concurrent users with zero downtime."
                        icon={<Server className="w-6 h-6" />}
                        delay={0.1}
                    />

                    <BentoGridItem
                        title="AI & ML Integration"
                        description="Smart logic for data-driven decisions. Integrate LLMs, predictive models, and automated reasoning into your core business logic."
                        icon={<Cpu className="w-6 h-6" />}
                        delay={0.2}
                    />

                    <BentoGridItem
                        title="Cloud Infrastructure"
                        description="AWS/Azure serverless deployments. Auto-scaling clusters, managed databases, and global CDNs for minimal latency."
                        icon={<Cloud className="w-6 h-6" />}
                        delay={0.3}
                    />

                    <BentoGridItem
                        title="API Design & Security"
                        description="Secure, documented, and fast endpoints. GraphQL or REST architectures with JWT authentication, rate limiting, and automated testing pipelines."
                        icon={<Code2 className="w-6 h-6" />}
                        delay={0.4}
                    />
                </div>

                {/* Mobile CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-8 pb-10 flex justify-center w-full"
                >
                    <Link
                        href="/contact"
                        className="group flex flex-col items-center gap-4 text-violet-400 focus:text-white transition-colors duration-300 w-full"
                    >
                        <span className="text-2xl font-black tracking-tighter uppercase border-b border-violet-500/30 pb-2 text-center w-full">
                            Engineer Solution
                        </span>
                        <div className="bg-violet-500/10 p-4 rounded-full active:bg-violet-500 active:text-black transition-all">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}

export default function SoftwareDevelopmentPage() {
    return (
        <>
            <div className="hidden md:block">
                <SoftwareDesktop />
            </div>
            <div className="block md:hidden">
                <SoftwareMobile />
            </div>
        </>
    );
}
