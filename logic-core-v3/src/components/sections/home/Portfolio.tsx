'use client';
import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type BadgeColor = 'green' | 'cyan' | 'yellow' | 'violet';
const PORTFOLIO_REVEAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Project {
    id: number;
    title: string;
    category: string;
    description: string;
    tags: string[];
    badge: string;
    badgeColor: BadgeColor;
    gradient: string;
    image: string;
    imagePosition?: string;
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
        gradient: "linear-gradient(135deg, #020202 0%, #111111 42%, #2b2b2b 100%)",
        image: "/images/showcase/hero-concesionaria.svg",
        imagePosition: "center",
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
        gradient: "linear-gradient(135deg, #030303 0%, #151515 54%, #303030 100%)",
        image: "/images/showcase/case-servicios.svg",
    },
    {
        id: 11,
        title: "Gimnasio",
        category: "FITNESS",
        description: "Membresías, clases y bot de consultas 24/7.",
        tags: ["IA", "WhatsApp Bot", "Web"],
        badge: "DEMO",
        badgeColor: "cyan",
        gradient: "linear-gradient(135deg, #050505 0%, #1a1a1a 50%, #383838 100%)",
        image: "/images/showcase/case-default.svg",
    },
    {
        id: 12,
        title: "Restaurante",
        category: "GASTRONOMÍA",
        description: "Menú QR, reservas y reseñas automáticas en Google.",
        tags: ["QR Menu", "Reservas", "Automatización"],
        badge: "DEMO",
        badgeColor: "yellow",
        gradient: "linear-gradient(135deg, #020202 0%, #171717 48%, #343434 100%)",
        image: "/images/showcase/case-gastronomia.svg",
    },
    {
        id: 13,
        title: "Inmobiliaria",
        category: "REAL ESTATE",
        description: "Portal de propiedades con CRM y seguimiento de leads.",
        tags: ["Portal Web", "CRM", "IA"],
        badge: "DEMO",
        badgeColor: "cyan",
        gradient: "linear-gradient(135deg, #030303 0%, #181818 50%, #3a3a3a 100%)",
        image: "/images/showcase/case-inmobiliaria.svg",
    },
    {
        id: 14,
        title: "Portal SaaS develOP",
        category: "PRODUCTO PROPIO",
        description: "Dashboard para clientes con métricas, proyectos y chat.",
        tags: ["SaaS", "Dashboard", "Multi-tenant"],
        badge: "PROPIO",
        badgeColor: "violet",
        gradient: "linear-gradient(135deg, #040404 0%, #171717 44%, #2d2d2d 100%)",
        image: "/images/showcase/case-comercio.svg",
    },
];

// ─── Badge styles ─────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<BadgeColor, string> = {
    green: "bg-white/8 text-zinc-100 border border-white/24",
    cyan: "bg-white/8 text-zinc-100 border border-white/24",
    yellow: "bg-white/8 text-zinc-100 border border-white/24",
    violet: "bg-white/8 text-zinc-100 border border-white/24",
};

const headerReveal = {
    hidden: { opacity: 0, y: 44, filter: "blur(12px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.9, ease: PORTFOLIO_REVEAL_EASE },
    },
};

const titleWordReveal = {
    hidden: { y: "110%", rotateX: -18, opacity: 0 },
    visible: {
        y: "0%",
        rotateX: 0,
        opacity: 1,
        transition: { duration: 0.78, ease: PORTFOLIO_REVEAL_EASE },
    },
};

const dividerReveal = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
        scaleX: 1,
        opacity: 1,
        transition: { duration: 0.9, delay: 0.18, ease: PORTFOLIO_REVEAL_EASE },
    },
};

const cardReveal = {
    hidden: {
        opacity: 0,
        y: 72,
        scale: 0.96,
        filter: "blur(14px)",
        clipPath: "inset(18% 0% 18% 0% round 2px)",
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        clipPath: "inset(0% 0% 0% 0% round 2px)",
        transition: { duration: 1, ease: PORTFOLIO_REVEAL_EASE },
    },
};

// ─── Background pattern shared ───────────────────────────────────────────────
const BgPattern = () => (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black">
        <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)',
                backgroundSize: '30px 30px',
                maskImage: 'radial-gradient(ellipse at center, black 0%, black 46%, transparent 78%)',
            }}
        />
        <div
            className="absolute -left-[18vw] -top-[18vw] h-[46vw] w-[46vw] rounded-[42%] opacity-[0.38]"
            style={{
                background:
                    'repeating-radial-gradient(ellipse at center, transparent 0 16px, rgba(255,255,255,0.2) 17px 18px, transparent 19px 34px)',
                maskImage: 'radial-gradient(circle at center, black 0%, transparent 72%)',
            }}
        />
        <div
            className="absolute -right-[10vw] top-[-6vw] h-[38vw] w-[38vw] rotate-[-8deg] rounded-[45%] opacity-[0.42]"
            style={{
                background:
                    'repeating-radial-gradient(ellipse at center, transparent 0 13px, rgba(255,255,255,0.18) 14px 15px, transparent 16px 28px)',
                maskImage: 'radial-gradient(circle at center, black 0%, transparent 74%)',
            }}
        />
        <div
            className="absolute -bottom-[18vw] left-[-8vw] h-[44vw] w-[58vw] rotate-[8deg] opacity-[0.34]"
            style={{
                background:
                    'repeating-radial-gradient(ellipse at center, transparent 0 18px, rgba(255,255,255,0.18) 19px 20px, transparent 21px 36px)',
                maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 76%)',
            }}
        />
        <div
            className="absolute -right-[10vw] bottom-[-8vw] h-[42vw] w-[52vw] rotate-[-18deg] opacity-[0.24]"
            style={{
                backgroundImage:
                    'linear-gradient(135deg, transparent 0 46%, rgba(255,255,255,0.28) 47%, transparent 48%), linear-gradient(45deg, transparent 0 48%, rgba(255,255,255,0.14) 49%, transparent 50%)',
                backgroundSize: '42px 42px',
                maskImage: 'linear-gradient(135deg, transparent 0%, black 35%, black 72%, transparent 100%)',
            }}
        />
        <div
            className="absolute left-[7vw] top-[9vw] h-72 w-72 rotate-12 opacity-[0.2]"
            style={{
                clipPath: 'polygon(8% 22%, 68% 0%, 100% 42%, 54% 100%, 0% 72%)',
                background:
                    'linear-gradient(135deg, rgba(255,255,255,0.18), transparent 42%), linear-gradient(45deg, transparent 18%, rgba(255,255,255,0.08) 19%, transparent 62%)',
                border: '1px solid rgba(255,255,255,0.18)',
            }}
        />
        <div
            className="absolute right-[18vw] top-[20vw] h-32 w-32 -rotate-12 opacity-[0.16]"
            style={{
                clipPath: 'polygon(50% 0%, 100% 34%, 82% 100%, 14% 88%, 0% 24%)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.2), transparent 60%)',
            }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.78)_100%)]" />
    </div>
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
            className="group relative w-full h-[52vh]"
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
                <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 90vw, 100vw"
                    className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale saturate-0 contrast-125 transition-[filter,opacity,transform] duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-95 group-hover:grayscale-0 group-hover:saturate-100 group-hover:contrast-100"
                    style={{ objectPosition: project.imagePosition ?? "center" }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/24 transition-colors duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_12%,rgba(255,255,255,0.18),transparent_34%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.74)_100%)]" />

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
                    <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {project.description}
                    </p>
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
            className="group relative w-full h-[38vh]"
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full h-full relative rounded-sm overflow-hidden"
            >
                <div className="absolute inset-0" style={{ background: project.gradient }} />
                <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="absolute inset-0 h-full w-full object-cover opacity-62 grayscale saturate-0 contrast-125 transition-[filter,opacity,transform] duration-700 ease-out group-hover:scale-[1.05] group-hover:opacity-90 group-hover:grayscale-0 group-hover:saturate-100 group-hover:contrast-100"
                    style={{ objectPosition: project.imagePosition ?? "center" }}
                />
                <div className="absolute inset-0 bg-black/58 group-hover:bg-black/28 transition-colors duration-500" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_18%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.72)_100%)]" />

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
                    <p className="text-zinc-400 text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                        {project.description}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Separator ───────────────────────────────────────────────────────────────
const SectionSeparator = () => (
    <div className="relative z-10 flex flex-col items-center py-10 max-[360px]:py-8 md:py-16">
        <div className="flex w-full max-w-2xl items-center gap-3 max-[360px]:justify-center">
            <div className="h-px flex-1 bg-zinc-800 max-[360px]:hidden" />
            <span className="whitespace-nowrap text-center font-mono text-[11px] tracking-[0.2em] text-zinc-500 sm:text-sm sm:tracking-widest">
                — DEMOS Y CONCEPTOS —
            </span>
            <div className="h-px flex-1 bg-zinc-800 max-[360px]:hidden" />
        </div>
        <p className="mt-3 max-w-md px-3 text-center font-mono text-[11px] leading-relaxed text-zinc-600 sm:text-xs">
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
    const demoStageRef = useRef<HTMLDivElement>(null);
    const isDemoStageInView = useInView(demoStageRef, { amount: 0.35, once: true });

    const visibleDemos = [
        DEMO_PROJECTS[demoIndex % DEMO_PROJECTS.length],
        DEMO_PROJECTS[(demoIndex + 1) % DEMO_PROJECTS.length],
        DEMO_PROJECTS[(demoIndex + 2) % DEMO_PROJECTS.length],
    ];

    return (
        <div className="relative overflow-hidden bg-black">
            <BgPattern />
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-black to-transparent z-0 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-black to-transparent z-0 pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10 pt-24 pb-20">

                {/* ── BLOQUE 1: Trabajos Reales ── */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.38 }}
                >
                    <motion.div variants={headerReveal} className="relative flex justify-between items-end mb-10 pb-8">
                        <div>
                            <p className="text-zinc-500 text-xs font-mono tracking-widest mb-2">develOP — PORTAFOLIO</p>
                            <h2 className="text-5xl md:text-7xl font-black text-zinc-100 tracking-tighter leading-[0.95]">
                                <span className="inline-block overflow-hidden align-bottom pb-[0.05em]">
                                    <motion.span variants={titleWordReveal} className="inline-block">
                                        NUESTROS
                                    </motion.span>
                                </span>{" "}
                                <span className="inline-block overflow-hidden align-bottom pb-[0.05em]">
                                    <motion.span variants={titleWordReveal} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-700 pr-[0.06em]">
                                        TRABAJOS
                                    </motion.span>
                                </span>
                            </h2>
                        </div>
                        <span className="text-xs font-mono text-zinc-600 border border-zinc-800 px-3 py-1 rounded-full">
                            CLIENTES REALES
                        </span>
                        <motion.div variants={dividerReveal} className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-white/24 via-white/10 to-transparent" />
                    </motion.div>

                    <div className="grid grid-cols-1 gap-8">
                        {REAL_PROJECTS.map((project) => (
                            <motion.div key={project.id} variants={cardReveal}>
                                <RealProjectCard project={project} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Separator ── */}
                <SectionSeparator />

                {/* ── BLOQUE 2: Demos por Rubro ── */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.34 }}
                >
                    <motion.div variants={headerReveal} className="relative flex justify-between items-end mb-10 pb-8">
                        <div>
                            <p className="text-zinc-500 text-xs font-mono tracking-widest mb-2">CAPACIDADES develOP</p>
                            <h2 className="text-4xl md:text-6xl font-black text-zinc-100 tracking-tighter">
                                <span className="inline-block overflow-hidden align-bottom pb-[0.05em]">
                                    <motion.span variants={titleWordReveal} className="inline-block">
                                        DEMOS
                                    </motion.span>
                                </span>{" "}
                                <span className="inline-block overflow-hidden align-bottom pb-[0.05em]">
                                    <motion.span variants={titleWordReveal} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-700 pr-[0.06em]">
                                        POR RUBRO
                                    </motion.span>
                                </span>
                            </h2>
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="text-xs font-mono text-zinc-200 border border-white/18 bg-white/[0.04] px-3 py-1 rounded-full">
                                DEMO CONCEPTS
                            </span>
                            <button
                                data-cursor="hover"
                                onClick={() => setDemoIndex((prev) => (prev - 1 + DEMO_PROJECTS.length) % DEMO_PROJECTS.length)}
                                className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                                data-cursor="hover"
                                onClick={() => setDemoIndex((prev) => (prev + 1) % DEMO_PROJECTS.length)}
                                className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                        <motion.div variants={dividerReveal} className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-white/24 via-white/10 to-transparent" />
                    </motion.div>

                    <div ref={demoStageRef} className="grid grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {visibleDemos.map((project, i) => (
                                <motion.div
                                    key={`${project.id}-${i}`}
                                    layout
                                    initial={{
                                        opacity: 0,
                                        x: 80,
                                        y: 58,
                                        scale: 0.96,
                                        filter: "blur(12px)",
                                        clipPath: "inset(18% 0% 18% 0% round 2px)",
                                    }}
                                    animate={{
                                        opacity: isDemoStageInView ? 1 : 0,
                                        x: isDemoStageInView ? 0 : 80,
                                        y: isDemoStageInView ? 0 : 58,
                                        scale: isDemoStageInView ? 1 : 0.96,
                                        filter: isDemoStageInView ? "blur(0px)" : "blur(12px)",
                                        clipPath: isDemoStageInView ? "inset(0% 0% 0% 0% round 2px)" : "inset(18% 0% 18% 0% round 2px)",
                                    }}
                                    exit={{ opacity: 0, x: -80, y: 16, filter: "blur(8px)" }}
                                    transition={{
                                        duration: 0.9,
                                        delay: isDemoStageInView ? i * 0.11 : 0,
                                        ease: PORTFOLIO_REVEAL_EASE,
                                    }}
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
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === demoIndex % DEMO_PROJECTS.length ? 'bg-zinc-400 w-4' : 'bg-zinc-700'
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
    const height = size === 'large' ? 'h-[22rem] max-[360px]:h-[24.5rem]' : 'h-[15.5rem] max-[360px]:h-[16.5rem]';

    return (
        <div className={`relative w-full ${height} overflow-hidden rounded-lg border border-zinc-800`}>
            <div className="absolute inset-0" style={{ background: project.gradient }} />
            <Image
                src={project.image}
                alt=""
                fill
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale saturate-0 contrast-125"
                style={{ objectPosition: project.imagePosition ?? "center" }}
            />
            <div className="absolute inset-0 bg-black/54" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_12%,rgba(255,255,255,0.16),transparent_36%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.76)_100%)]" />

            {/* Badge */}
            <div className="absolute left-4 top-4 z-10 max-[360px]:left-3 max-[360px]:top-3">
                <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] max-[360px]:text-[9px] ${BADGE_STYLES[project.badgeColor]}`}>
                    {project.badge}
                </span>
            </div>

            {project.year && (
                <div className="absolute right-4 top-4 z-10 max-[360px]:right-3 max-[360px]:top-3">
                    <span className="rounded-full border border-zinc-700 bg-black/60 px-2 py-0.5 font-mono text-[10px] text-zinc-300 max-[360px]:text-[9px]">
                        {project.year}
                    </span>
                </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 z-10 max-[360px]:bottom-3 max-[360px]:left-3 max-[360px]:right-3">
                <p className="mb-1.5 font-mono text-[10px] tracking-[0.14em] text-zinc-300/85 max-[360px]:tracking-[0.1em]">{project.category}</p>
                <h3 className={`mb-2.5 font-black uppercase text-white ${size === 'large' ? 'text-[1.85rem] leading-[0.92] max-[360px]:text-[1.65rem]' : 'text-[1.18rem] leading-[1.02] max-[360px]:text-[1.05rem]'}`}>
                    {project.title}
                </h3>
                <p className="text-[12px] leading-[1.6] text-zinc-200/78">{project.description}</p>
            </div>
        </div>
    );
};

// ─── Mobile View ─────────────────────────────────────────────────────────────
const PortfolioMobile = () => {
    const [demoPage, setDemoPage] = useState(0);
    const mobileDemoStageRef = useRef<HTMLDivElement>(null);
    const isMobileDemoStageInView = useInView(mobileDemoStageRef, { amount: 0.28, once: true });
    const demosPerPage = 3;
    const totalPages = Math.ceil(DEMO_PROJECTS.length / demosPerPage);
    const visibleDemos = DEMO_PROJECTS.slice(demoPage * demosPerPage, (demoPage + 1) * demosPerPage);

    return (
        <div className="relative flex flex-col overflow-hidden bg-black px-4 pb-12 pt-[4.75rem] max-[360px]:px-3 max-[360px]:pt-[4.25rem]">
            <BgPattern />

            {/* ── BLOQUE 1 ── */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                className="relative z-10"
            >
                <motion.div variants={headerReveal} className="mb-6 border-b border-zinc-800 pb-5 max-[360px]:pb-4">
                    <p className="mb-1 font-mono text-[11px] tracking-[0.16em] text-zinc-500">develOP — PORTAFOLIO</p>
                    <h2 className="max-w-full pr-[0.05em] text-[clamp(1.8rem,9.2vw,2.35rem)] font-black leading-[0.92] tracking-[-0.03em] text-zinc-100">
                        <span className="inline-block overflow-hidden align-bottom pb-[0.05em]">
                            <motion.span variants={titleWordReveal} className="inline-block">
                                NUESTROS
                            </motion.span>
                        </span>{" "}
                        <span className="block overflow-hidden pb-[0.05em] sm:inline-block sm:align-bottom">
                            <motion.span variants={titleWordReveal} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-700">
                                TRABAJOS
                            </motion.span>
                        </span>
                    </h2>
                </motion.div>

                <div className="flex flex-col gap-4">
                    {REAL_PROJECTS.map((p) => (
                        <motion.div key={p.id} variants={cardReveal}>
                            <MobileCard project={p} size="large" />
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* ── Separator ── */}
            <SectionSeparator />

            {/* ── BLOQUE 2 ── */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.32 }}
                className="relative z-10"
            >
                <motion.div variants={headerReveal} className="mb-5 border-b border-zinc-800 pb-5 max-[360px]:pb-4">
                    <div className="flex items-center justify-between gap-2 max-[360px]:flex-col max-[360px]:items-start">
                        <h2 className="max-w-full pr-[0.05em] text-[clamp(1.4rem,7.1vw,1.9rem)] font-black leading-[0.98] tracking-tighter text-zinc-100">
                            <span className="inline-block overflow-hidden align-bottom pb-[0.05em]">
                                <motion.span variants={titleWordReveal} className="inline-block">
                                    DEMOS
                                </motion.span>
                            </span>{" "}
                            <span className="inline-block overflow-hidden align-bottom pb-[0.05em]">
                                <motion.span variants={titleWordReveal} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-700">
                                    POR RUBRO
                                </motion.span>
                            </span>
                        </h2>
                        <span className="rounded-full border border-white/18 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-200">
                            DEMO
                        </span>
                    </div>
                </motion.div>

                <div ref={mobileDemoStageRef} className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {visibleDemos.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(10px)" }}
                                animate={{
                                    opacity: isMobileDemoStageInView ? 1 : 0,
                                    y: isMobileDemoStageInView ? 0 : 28,
                                    scale: isMobileDemoStageInView ? 1 : 0.96,
                                    filter: isMobileDemoStageInView ? "blur(0px)" : "blur(10px)",
                                }}
                                exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                                transition={{
                                    duration: 0.72,
                                    delay: isMobileDemoStageInView ? i * 0.08 : 0,
                                    ease: PORTFOLIO_REVEAL_EASE,
                                }}
                            >
                                <MobileCard project={p} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="mt-6 flex justify-center gap-3 max-[360px]:gap-2">
                    <button
                        onClick={() => setDemoPage((p) => Math.max(0, p - 1))}
                        disabled={demoPage === 0}
                        className="flex h-11 max-w-[132px] flex-1 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors active:bg-zinc-800 disabled:border-zinc-800 disabled:opacity-30"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setDemoPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={demoPage >= totalPages - 1}
                        className="flex h-11 max-w-[132px] flex-1 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors active:bg-zinc-800 disabled:border-zinc-800 disabled:opacity-30"
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
    <section id="portfolio" className="relative w-full overflow-hidden bg-black">
        <div className="block md:hidden">
            <PortfolioMobile />
        </div>
        <div className="hidden md:block">
            <PortfolioDesktop />
        </div>
    </section>
);
