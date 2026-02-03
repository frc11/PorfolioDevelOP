'use client';
import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

const PROJECTS = [
    { title: "Neon Nexus", category: "Fintech Core", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" },
    { title: "Void Scope", category: "AI Analytics", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop" },
    { title: "Cyber Lattice", category: "Blockchain", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop" },
    { title: "Zero Gravity", category: "Aerospace", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" },
    { title: "Prism Core", category: "Data Vis", img: "https://images.unsplash.com/photo-1558494949-ef248ac89f5f?q=80&w=1000&auto=format&fit=crop" },
    { title: "Flux Engine", category: "Automotive", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop" },
    { title: "Quantum Pulse", category: "Healthcare", img: "https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000&auto=format&fit=crop" },
    { title: "Echo Grid", category: "Acoustics", img: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1000&auto=format&fit=crop" },
    { title: "Neural Net", category: "Machine Learning", img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop" },
    { title: "Solar Flare", category: "Energy", img: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1000&auto=format&fit=crop" },
    { title: "Deep Dive", category: "Oceanography", img: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop" },
    { title: "Aether Mist", category: "Cloud Computing", img: "https://images.unsplash.com/photo-1536514072410-5319443266bf?q=80&w=1000&auto=format&fit=crop" }
];

// Chunk projects into Columns of 2
const chunk = (arr: any[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
const COLUMNS = chunk(PROJECTS, 2); // 6 columns total

const TiltCard = ({ project, isHovered, isBlur, setHovered }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 30 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        x.set(mouseXVal / width - 0.5);
        y.set(mouseYVal / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setHovered(null);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
            className="relative w-full h-[45vh] cursor-pointer"
            animate={{ opacity: isBlur ? 0.25 : 1, scale: isHovered ? 1.1 : 1 }}
        >
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full h-full bg-zinc-900 border border-zinc-800 overflow-hidden relative rounded-sm group"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${project.img})`, transform: "translateZ(0px)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6" style={{ transform: "translateZ(20px)" }}>
                    <h3 className="text-xl font-bold text-white tracking-tight">{project.title}</h3>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">{project.category}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export const Portfolio = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 or 1
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);

    const TOTAL_COLUMNS = COLUMNS.length; // 6

    // Derived state: calculate the 3 visible columns based on currentIndex
    const visibleIndices = [
        currentIndex % TOTAL_COLUMNS,
        (currentIndex + 1) % TOTAL_COLUMNS,
        (currentIndex + 2) % TOTAL_COLUMNS
    ];

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % TOTAL_COLUMNS);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + TOTAL_COLUMNS) % TOTAL_COLUMNS);
    };

    const variants = {
        enter: (dir: number) => ({
            x: dir > 0 ? "100%" : "-100%",
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (dir: number) => ({
            x: dir > 0 ? "-100%" : "100%",
            opacity: 0
        })
    };

    return (
        <section className="relative h-screen bg-zinc-950 flex flex-col justify-center overflow-hidden">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 3px, transparent 0)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5
                }}
            />

            <div className="relative z-10 w-full max-w-[90vw] mx-auto">
                {/* Header & Controls */}
                <div className="flex justify-between items-end mb-12 px-4">
                    <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter">
                        PORTFOLIO
                    </h2>
                    <div className="flex gap-4">
                        <button
                            onClick={prevSlide}
                            className="p-4 rounded-full border border-zinc-700 text-white hover:bg-zinc-800 transition-colors active:scale-95"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-4 rounded-full border border-zinc-700 text-white hover:bg-zinc-800 transition-colors active:scale-95"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {/* Sliding Column Window */}
                <div className="w-full relative h-[70vh]">
                    {/* 
                        Use standard flex layout for the visible columns. 
                        We animate the transition by keys using LayoutGroup or simpler approach.
                        For a truly robust 'carousel' feel with infinite loop, rendering the 3 columns and mapping them 
                        to a stable layout transition is best.
                     */}
                    <motion.div
                        className="flex w-full h-full gap-8"
                        layout
                    >
                        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                            {visibleIndices.map((colIndex) => (
                                <motion.div
                                    key={`col-${colIndex}`}
                                    layout
                                    initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="flex-1 flex flex-col gap-8 justify-center min-w-[30%]"
                                >
                                    {COLUMNS[colIndex].map((project) => (
                                        <TiltCard
                                            key={project.title}
                                            project={project}
                                            isHovered={hoveredProject === project.title}
                                            isBlur={hoveredProject !== null && hoveredProject !== project.title}
                                            setHovered={(val: boolean) => setHoveredProject(val ? project.title : null)}
                                        />
                                    ))}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
