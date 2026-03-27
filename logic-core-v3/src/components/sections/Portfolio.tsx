'use client';
import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type BadgeColor = 'green' | 'cyan' | 'yellow' | 'violet';

interface Project {
    id: number;
    title: string;
    category: string;
    description: string;
    tags: string[];
    badge: string;
    badgeColor: BadgeColor;
    gradient: string;
    year?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const REAL_PROJECTS: Project[] = [
    {
        id: 1,
        title: "Concesionaria San Miguel",
        category: "AUTOMOTIVE — TUCUMÁN",
        description:
            "Sitio web corporativo con catálogo de vehículos 0km y usados, formulario de consultas inteligente y panel de administración de leads para el equipo de ventas.",
        tags: ["Next.js", "TypeScript", "Panel Admin", "CRM"],
        badge: "CASO REAL ✓",
        badgeColor: "green",
        gradient: "linear-gradient(135deg, #052e16 0%, #064e3b 40%, #0f766e 80%, #134e4a 100%)",
        year: "2026",
    },
];

const DEMO_PROJECTS: Project[] = [
    {
        id: 10,
        title: "Clínica Médica",
        category: "SALUD",
        description: "Turnos online + recordatorios WhatsApp + panel del staff.",
        tags: ["Automatización", "WhatsApp", "n8n"],
        badge: "DEMO",
        badgeColor: "cyan",
        gradient: "linear-gradient(135deg, #0c0a1e 0%, #1e1b4b 50%, #312e81 80%, #1e1b4b 100%)",
    },
    {
        id: 11,
        title: "Gimnasio",
        category: "FITNESS",
        description: "Membresías, clases y bot de consultas 24/7.",
        tags: ["IA", "WhatsApp Bot", "Web"],
        badge: "DEMO",
        badgeColor: "cyan",
        gradient: "linear-gradient(135deg, #0a0a0a 0%, #052e16 50%, #14532d 100%)",
    },
    {
        id: 12,
        title: "Restaurante",
        category: "GASTRONOMÍA",
        description: "Menú QR, reservas y reseñas automáticas en Google.",
        tags: ["QR Menu", "Reservas", "Automatización"],
        badge: "DEMO",
        badgeColor: "yellow",
        gradient: "linear-gradient(135deg, #0c0400 0%, #431407 50%, #7c2d12 80%, #1c0a00 100%)",
    },
    {
        id: 13,
        title: "Inmobiliaria",
        category: "REAL ESTATE",
        description: "Portal de propiedades con CRM y seguimiento de leads.",
        tags: ["Portal Web", "CRM", "IA"],
        badge: "DEMO",
        badgeColor: "cyan",
        gradient: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #27272a 80%, #09090b 100%)",
    },
    {
        id: 14,
        title: "Portal SaaS develOP",
        category: "PRODUCTO PROPIO",
        description: "Dashboard para clientes con métricas, proyectos y chat.",
        tags: ["SaaS", "Dashboard", "Multi-tenant"],
        badge: "PROPIO",
        badgeColor: "violet",
        gradient: "linear-gradient(135deg, #030712 0%, #0c1127 40%, #0e1a3d 70%, #020617 100%)",
    },
];

// ─── Badge styles ─────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<BadgeColor, string> = {
    green: "bg-emerald-950 text-emerald-400 border border-emerald-700",
    cyan: "bg-cyan-950 text-cyan-400 border border-cyan-700",
    yellow: "bg-amber-950 text-amber-400 border border-amber-700",
    violet: "bg-violet-950 text-violet-400 border border-violet-700",
};

// ─── Background pattern shared ───────────────────────────────────────────────
const BgPattern = () => (
    <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #27272a 3px, transparent 0)',
            backgroundSize: '32px 32px',
            opacity: 0.25,
        }}
    />
);

// ─── 3D Tilt Card (Desktop Real) ─────────────────────────────────────────────
const RealProjectCard = ({ project }: { project: Project }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <motion.div
            data-cursor="hover"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ perspective: 1200 }}
            className="group relative w-full h-[52vh] cursor-none"
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full h-full relative rounded-sm overflow-hidden"
            >
                {/* Gradient background */}
                <div
                    className="absolute inset-0"
                    style={{ background: project.gradient }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Big title background watermark */}
                <div
                    className="absolute -bottom-4 -right-4 text-[10rem] font-black text-white/5 leading-none select-none pointer-events-none"
                    style={{ transform: "translateZ(10px)" }}
                >
                    {project.title.split(" ").pop()?.toUpperCase()}
                </div>

                {/* Badge */}
                <div
                    className="absolute top-6 left-6"
                    style={{ transform: "translateZ(50px)" }}
                >
                    <span className={`text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full ${BADGE_STYLES[project.badgeColor]}`}>
                        {project.badge}
                    </span>
                </div>

                {/* Year */}
                <div
                    className="absolute top-6 right-6"
                    style={{ transform: "translateZ(40px)" }}
                >
                    <span className="text-zinc-400 font-mono text-sm border border-zinc-700 px-2 py-1 rounded-full">
                        {project.year}
                    </span>
                </div>

                {/* Content */}
                <div
                    className="absolute bottom-8 left-8 right-8"
                    style={{ transform: "translateZ(60px)" }}
                >
                    <p className="text-zinc-400 text-xs font-mono tracking-widest mb-2">{project.category}</p>
                    <h3 className="text-4xl md:text-5xl font-black text-white uppercase leading-none mb-4">
                        {project.title}
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4 max-w-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                        {project.tags.map((tag) => (
                            <span key={tag} className="text-xs font-mono bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full border border-white/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── 3D Tilt Card (Desktop Demo, smaller) ────────────────────────────────────
const DemoCard = ({ project, isDimmed, isFocused }: { project: Project; isDimmed: boolean; isFocused: boolean }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <motion.div
            data-cursor="hover"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ perspective: 1000 }}
            animate={{ opacity: isDimmed ? 0.25 : 1, scale: isFocused ? 1.04 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="group relative w-full h-[38vh] cursor-none"
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full h-full relative rounded-sm overflow-hidden"
            >
                <div className="absolute inset-0" style={{ background: project.gradient }} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Badge */}
                <div className="absolute top-4 left-4" style={{ transform: "translateZ(40px)" }}>
                    <span className={`text-xs font-mono font-bold tracking-widest px-2 py-0.5 rounded-full ${BADGE_STYLES[project.badgeColor]}`}>
                        {project.badge}
                    </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-6 left-6 right-6" style={{ transform: "translateZ(50px)" }}>
                    <p className="text-zinc-500 text-xs font-mono tracking-widest mb-1">{project.category}</p>
                    <h3 className="text-xl font-bold text-white uppercase leading-none mb-3">{project.title}</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                        {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-75">
                        {project.tags.map((tag) => (
                            <span key={tag} className="text-xs font-mono bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full border border-white/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Separator ───────────────────────────────────────────────────────────────
const SectionSeparator = () => (
    <div className="relative z-10 flex flex-col items-center py-12 md:py-16">
        <div className="flex items-center gap-4 w-full max-w-2xl">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-500 font-mono text-sm tracking-widest whitespace-nowrap">
                — DEMOS Y CONCEPTOS —
            </span>
            <div className="flex-1 h-px bg-zinc-800" />
        </div>
        <p className="text-zinc-600 text-xs font-mono mt-3 text-center max-w-md leading-relaxed">
            Propuestas desarrolladas para mostrar capacidades en diferentes rubros
        </p>
    </div>
);

// ─── Disclaimer ──────────────────────────────────────────────────────────────
const Disclaimer = () => (
    <p className="relative z-10 text-center text-zinc-600 text-xs font-mono max-w-xl mx-auto mt-8 leading-relaxed px-6">
        Los demos son propuestas conceptuales desarrolladas por el equipo develOP para ilustrar capacidades.
        No representan clientes reales.
    </p>
);

// ─── Desktop View ─────────────────────────────────────────────────────────────
const PortfolioDesktop = () => {
    const [demoIndex, setDemoIndex] = useState(0);
    const [hoveredDemo, setHoveredDemo] = useState<number | null>(null);

    const visibleDemos = [
        DEMO_PROJECTS[demoIndex % DEMO_PROJECTS.length],
        DEMO_PROJECTS[(demoIndex + 1) % DEMO_PROJECTS.length],
        DEMO_PROJECTS[(demoIndex + 2) % DEMO_PROJECTS.length],
    ];

    return (
        <div className="relative bg-zinc-950 overflow-hidden">
            <BgPattern />
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-zinc-950 to-transparent z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-zinc-950 to-transparent z-0 pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10 pt-24 pb-20">

                {/* ── BLOQUE 1: Trabajos Reales ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex justify-between items-end mb-10 border-b border-zinc-800 pb-8">
                        <div>
                            <p className="text-zinc-500 text-xs font-mono tracking-widest mb-2">develOP — PORTAFOLIO</p>
                            <h2 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tighter">
                                NUESTROS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">TRABAJOS</span>
                            </h2>
                        </div>
                        <span className="text-xs font-mono text-zinc-600 border border-zinc-800 px-3 py-1 rounded-full">
                            CLIENTES REALES
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {REAL_PROJECTS.map((project) => (
                            <RealProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </motion.div>

                {/* ── Separator ── */}
                <SectionSeparator />

                {/* ── BLOQUE 2: Demos por Rubro ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex justify-between items-end mb-10 border-b border-zinc-800 pb-8">
                        <div>
                            <p className="text-zinc-500 text-xs font-mono tracking-widest mb-2">CAPACIDADES develOP</p>
                            <h2 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tighter">
                                DEMOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-700">POR RUBRO</span>
                            </h2>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="text-xs font-mono text-cyan-500 border border-cyan-900 bg-cyan-950/50 px-3 py-1 rounded-full">
                                DEMO CONCEPTS
                            </span>
                            <button
                                data-cursor="hover"
                                onClick={() => setDemoIndex((prev) => (prev - 1 + DEMO_PROJECTS.length) % DEMO_PROJECTS.length)}
                                className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-none"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                data-cursor="hover"
                                onClick={() => setDemoIndex((prev) => (prev + 1) % DEMO_PROJECTS.length)}
                                className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-none"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {visibleDemos.map((project, i) => (
                                <motion.div
                                    key={`${project.id}-${i}`}
                                    layout
                                    initial={{ opacity: 0, x: 80 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -80 }}
                                    transition={{ type: "spring", stiffness: 280, damping: 28 }}
                                    onMouseEnter={() => setHoveredDemo(i)}
                                    onMouseLeave={() => setHoveredDemo(null)}
                                >
                                    <DemoCard
                                        project={project}
                                        isDimmed={hoveredDemo !== null && hoveredDemo !== i}
                                        isFocused={hoveredDemo === i}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {DEMO_PROJECTS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setDemoIndex(i)}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                    i === demoIndex % DEMO_PROJECTS.length ? 'bg-zinc-400 w-4' : 'bg-zinc-700'
                                }`}
                            />
                        ))}
                    </div>
                </motion.div>

                <Disclaimer />
            </div>
        </div>
    );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const MobileCard = ({ project, size = 'normal' }: { project: Project; size?: 'large' | 'normal' }) => {
    const height = size === 'large' ? 'h-72' : 'h-52';

    return (
        <div className={`relative w-full ${height} rounded-md overflow-hidden border border-zinc-800`}>
            <div className="absolute inset-0" style={{ background: project.gradient }} />
            <div className="absolute inset-0 bg-black/30" />

            {/* Badge */}
            <div className="absolute top-4 left-4 z-10">
                <span className={`text-xs font-mono font-bold tracking-widest px-2 py-0.5 rounded-full ${BADGE_STYLES[project.badgeColor]}`}>
                    {project.badge}
                </span>
            </div>

            {project.year && (
                <div className="absolute top-4 right-4 z-10">
                    <span className="text-zinc-300 font-mono text-xs border border-zinc-700 bg-black/60 px-2 py-0.5 rounded-full">
                        {project.year}
                    </span>
                </div>
            )}

            <div className="absolute bottom-5 left-5 right-5 z-10">
                <p className="text-zinc-400 text-xs font-mono tracking-widest mb-1">{project.category}</p>
                <h3 className={`font-black text-white uppercase leading-none mb-2 ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>
                    {project.title}
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {project.tags.map((tag) => (
                        <span key={tag} className="text-xs font-mono bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full border border-white/10">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Mobile View ─────────────────────────────────────────────────────────────
const PortfolioMobile = () => {
    const [demoPage, setDemoPage] = useState(0);
    const demosPerPage = 3;
    const totalPages = Math.ceil(DEMO_PROJECTS.length / demosPerPage);
    const visibleDemos = DEMO_PROJECTS.slice(demoPage * demosPerPage, (demoPage + 1) * demosPerPage);

    return (
        <div className="relative bg-zinc-950 flex flex-col pt-20 pb-12 px-5 overflow-hidden">
            <BgPattern />

            {/* ── BLOQUE 1 ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative z-10"
            >
                <div className="mb-6 border-b border-zinc-800 pb-5">
                    <p className="text-zinc-500 text-xs font-mono tracking-widest mb-1">develOP — PORTAFOLIO</p>
                    <h2 className="text-4xl font-black text-zinc-100 tracking-tighter">
                        NUESTROS <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">TRABAJOS</span>
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    {REAL_PROJECTS.map((p) => (
                        <MobileCard key={p.id} project={p} size="large" />
                    ))}
                </div>
            </motion.div>

            {/* ── Separator ── */}
            <SectionSeparator />

            {/* ── BLOQUE 2 ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative z-10"
            >
                <div className="mb-5 border-b border-zinc-800 pb-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-black text-zinc-100 tracking-tighter">
                            DEMOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-700">POR RUBRO</span>
                        </h2>
                        <span className="text-xs font-mono text-cyan-500 border border-cyan-900 bg-cyan-950/50 px-2 py-0.5 rounded-full">
                            DEMO
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {visibleDemos.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <MobileCard project={p} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex gap-4 mt-6 justify-center">
                    <button
                        onClick={() => setDemoPage((p) => Math.max(0, p - 1))}
                        disabled={demoPage === 0}
                        className="flex-1 max-w-[140px] h-12 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 active:bg-zinc-800 transition-colors disabled:opacity-30 disabled:border-zinc-800"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setDemoPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={demoPage >= totalPages - 1}
                        className="flex-1 max-w-[140px] h-12 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 active:bg-zinc-800 transition-colors disabled:opacity-30 disabled:border-zinc-800"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            <Disclaimer />
        </div>
    );
};

// ─── Main Export ─────────────────────────────────────────────────────────────
export const Portfolio = () => (
    <section id="portfolio" className="relative w-full bg-zinc-950 overflow-hidden">
        <div className="block md:hidden">
            <PortfolioMobile />
        </div>
        <div className="hidden md:block">
            <PortfolioDesktop />
        </div>
    </section>
);
