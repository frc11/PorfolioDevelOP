"use client";

import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
} from "framer-motion";
import { Home, Briefcase, Terminal, Layers, Mail, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useTransitionContext } from "@/context/TransitionContext";

// --- Neuronal Components ---

const Axon = ({ direction, delay }: { direction: 'left' | 'right'; delay: number }) => {
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 60, opacity: 1 }} // Grows upwards
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, delay, ease: "easeOut" }}
            className={`absolute bottom-1/2 ${direction === 'left' ? 'left-1/2 -ml-[1px] origin-bottom -rotate-[45deg]' : 'right-1/2 -mr-[1px] origin-bottom rotate-[45deg]'} w-[2px] bg-gradient-to-t from-transparent via-cyan-400 to-white shadow-[0_0_15px_cyan] -z-10`}
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
    );
};

const Synapse = ({ label, href, direction, delay }: { label: string; href: string; direction: 'left' | 'right'; delay: number }) => {
    const { triggerTransition } = useTransitionContext();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: delay + 0.2 }}
            className={`absolute bottom-[70px] ${direction === 'left' ? '-left-[80px]' : '-right-[80px]'} z-50`}
        >
            <Link
                href={href}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerTransition(href);
                }}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2 group hover:bg-zinc-800 hover:border-cyan-500/50 transition-colors"
            >
                <div className={`w-2 h-2 rounded-full ${direction === 'left' ? 'bg-cyan-400' : 'bg-fuchsia-400'} shadow-[0_0_10px_currentColor] group-hover:scale-125 transition-transform`} />
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white uppercase tracking-wider">{label}</span>
            </Link>
        </motion.div>
    );
};

export const DynamicDock = () => {
    const mouseX = useMotionValue(Infinity);

    const icons = [
        {
            icon: <Home className="w-full h-full" />,
            href: "/#inicio",
            label: "Inicio",
        },
        {
            icon: <Terminal className="w-full h-full" />,
            href: "/#nosotros",
            label: "Nosotros",
        },
        {
            icon: <Briefcase className="w-full h-full" />,
            href: "/#portfolio",
            label: "Portfolio",
        },
        {
            icon: <Layers className="w-full h-full" />,
            href: "/#servicios",
            label: "Servicios",
        },
        {
            icon: <Lightbulb className="w-full h-full" />,
            href: "/#caracteristicas",
            label: "Características",
        },
        {
            icon: <Mail className="w-full h-full" />,
            href: "/contact",
            label: "Contacto",
        },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9990] pointer-events-auto">
            <motion.div
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="flex h-16 items-end gap-4 rounded-full border border-white/10 bg-zinc-950/20 px-4 pb-3 backdrop-blur-2xl shadow-2xl"
            >
                {icons.map((item, i) => (
                    <DockIcon key={i} mouseX={mouseX} {...item} />
                ))}
            </motion.div>
        </div>
    );
};

function DockIcon({
    mouseX,
    icon,
    href,
    label,
}: {
    mouseX: any;
    icon: React.ReactNode;
    href: string;
    label: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);
    const { triggerTransition } = useTransitionContext();

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 75, 40]);
    const width = useSpring(widthSync, {
        mass: 0.1,
        stiffness: 150,
        damping: 15,
    });

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        triggerTransition(href);
    };



    const isServices = label === "Servicios";
    const [isServicesHovered, setIsServicesHovered] = useState(false);

    // Handling hover for Services specially to keep menu open
    const handleMouseEnter = () => {
        setHovered(true);
        if (isServices) setIsServicesHovered(true);
    };

    const handleMouseLeave = () => {
        setHovered(false);
        if (isServices) setIsServicesHovered(false);
    };

    return (
        <motion.div
            ref={ref}
            style={{ width }}
            className={`aspect-square flex items-center justify-center rounded-full bg-zinc-900/50 border border-white/5 text-zinc-400 relative transition-colors ${isServicesHovered ? 'bg-zinc-800 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'hover:text-white'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <AnimatePresence>
                {/* Standard Tooltip */}
                {hovered && !isServicesHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -15 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-950/90 px-2 py-1 text-xs text-zinc-200 whitespace-nowrap pointer-events-none"
                    >
                        {label}
                    </motion.div>
                )}

                {/* Neuronal Menu for Services + Persistent Label */}
                {isServices && isServicesHovered && (
                    <>
                        {/* Persistent Label Below */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 10 }} // Pushed down
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-950/90 px-2 py-1 text-xs text-zinc-200 whitespace-nowrap pointer-events-none z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        >
                            {label}
                        </motion.div>

                        {/* Left Axon & Synapse */}
                        <Axon direction="left" delay={0} />
                        <Synapse label="Web Dev" href="/web-development" direction="left" delay={0.1} />

                        {/* Right Axon & Synapse */}
                        <Axon direction="right" delay={0.1} />
                        <Synapse label="Software" href="/software-development" direction="right" delay={0.2} />
                    </>
                )}
            </AnimatePresence>

            <Link href={href} onClick={handleClick} className="p-2 w-full h-full flex items-center justify-center z-10">
                {icon}
            </Link>
        </motion.div>
    );
}
