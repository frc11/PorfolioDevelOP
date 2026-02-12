'use client';
import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

// Project Data - 12 High-Fidelity Items
const PROJECTS = [
    {
        id: 1,
        title: "VOID WALKER",
        category: "SPATIAL AUDIO",
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200",
        year: "2024"
    },
    {
        id: 2,
        title: "DATA MESH",
        category: "ANALYTICS",
        img: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1200",
        year: "2023"
    },
    {
        id: 3,
        title: "CYBER CORE",
        category: "SECURITY",
        img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
        year: "2024"
    },
    {
        id: 4,
        title: "HYPER LOOP",
        category: "LOGISTICS",
        img: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1200",
        year: "2023"
    },
    {
        id: 5,
        title: "ORBITAL",
        category: "AEROSPACE",
        img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
        year: "2024"
    },
    {
        id: 6,
        title: "SYNTH WAVE",
        category: "DIGITAL ART",
        img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200",
        year: "2023"
    }
];

export const Portfolio = () => {
    // Cyclic Navigation Logic
    const [currentIndex, setCurrentIndex] = useState(0);

    // Focus Mode Logic: Track which of the VISIBLE cards (0, 1, 2) is hovered relative to the grid
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const nextProject = () => {
        setCurrentIndex((prev) => (prev + 1) % PROJECTS.length);
    };

    const prevProject = () => {
        setCurrentIndex((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length);
    };

    // Calculate visible projects (Current, +1, +2)
    const visibleProjects = [
        PROJECTS[currentIndex],
        PROJECTS[(currentIndex + 1) % PROJECTS.length],
        PROJECTS[(currentIndex + 2) % PROJECTS.length],
    ];

    return (
        <section className="relative h-screen bg-zinc-950 flex flex-col justify-center overflow-hidden" id='portfolio'>
            {/* Background Pattern */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #27272a 3px, transparent 0)',
                    backgroundSize: '32px 32px', // Increased spacing for elegance
                    opacity: 0.25
                }}
            />

            {/* Top Fade (Integration with About) */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-zinc-950 to-transparent z-0 pointer-events-none" />

            {/* Bottom Fade (Integration with Next Section) */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-zinc-950 to-transparent z-0 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="container mx-auto px-6 md:px-12 relative z-10 h-[60vh]"
            >
                <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-8">
                    <div>
                        <h2 className="text-5xl md:text-8xl font-black text-zinc-100 tracking-tighter">
                            PORT<span className="text-transparent bg-clip-text bg-gradient-to-r pr-2 from-zinc-400 to-zinc-700">FOLIO</span>
                        </h2>
                    </div>
                    {/* Navigation Arrows */}
                    <div className="flex gap-4">
                        <button
                            data-cursor="hover"
                            onClick={prevProject}
                            className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-none"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <button
                            data-cursor="hover"
                            onClick={nextProject}
                            className="w-16 h-16 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-none"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Sliding Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
                    <AnimatePresence mode='popLayout'>
                        {visibleProjects.map((project, i) => {
                            // Determine dimmed state based on parent hoveredIndex
                            const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
                            const isFocused = hoveredIndex === i;

                            return (
                                <motion.div
                                    key={`${project.id}-${i}`} // Unique key for AnimatePresence
                                    layout
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{
                                        opacity: isDimmed ? 0.2 : 1,
                                        x: 0,
                                        scale: isFocused ? 1.1 : 1
                                    }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="h-full"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <ProjectCard project={project} />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </motion.div>
        </section>
    );
};

// 3D Tilt Card Component
const ProjectCard = ({ project }: { project: typeof PROJECTS[0] }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-15, 15]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            data-cursor="hover"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ perspective: 1000 }}
            className="group relative w-full h-[45vh] cursor-none"
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="w-full h-full relative"
            >
                {/* Image Layer */}
                <div
                    className="absolute inset-0 bg-cover bg-center rounded-sm grayscale group-hover:grayscale-0 transition-all duration-500"
                    style={{ backgroundImage: `url(${project.img})` }}
                >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                </div>

                {/* Content Layer (Floating) */}
                <div
                    className="absolute bottom-8 left-8 transform translate-z-20"
                    style={{ transform: "translateZ(50px)" }}
                >
                    <p className="text-zinc-400 text-xs font-mono tracking-widest mb-2">{project.category}</p>
                    <h3 className="text-3xl font-bold text-white uppercase leading-none">{project.title}</h3>
                </div>

                {/* Year Layer (Floating Background) */}
                <div
                    className="absolute top-4 right-4 transform translate-z-10"
                    style={{ transform: "translateZ(30px)" }}
                >
                    <span className="text-zinc-500 font-mono text-sm border border-zinc-700 px-2 py-1 rounded-full">{project.year}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};
