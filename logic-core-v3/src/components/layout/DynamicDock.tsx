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

export const DynamicDock = () => {
    const mouseX = useMotionValue(Infinity);

    const icons = [
        {
            icon: <Home className="w-full h-full" />,
            href: "inicio", // Removed # for ID usage in context
            label: "Inicio",
        },
        {
            icon: <Terminal className="w-full h-full" />,
            href: "nosotros",
            label: "Nosotros",
        },
        {
            icon: <Briefcase className="w-full h-full" />,
            href: "portfolio",
            label: "Portfolio",
        },
        {
            icon: <Layers className="w-full h-full" />,
            href: "servicios",
            label: "Servicios",
        },
        {
            icon: <Lightbulb className="w-full h-full" />,
            href: "porque-develop",
            label: "Características",
        },
        {
            icon: <Mail className="w-full h-full" />,
            href: "pie",
            label: "Fin",
        },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
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

    return (
        <a href={`#${href}`} onClick={handleClick}>
            <motion.div
                ref={ref}
                style={{ width }}
                className="aspect-square flex items-center justify-center rounded-full bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white transition-colors relative"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: -15 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-950/90 px-2 py-1 text-xs text-zinc-200 whitespace-nowrap"
                        >
                            {label}
                        </motion.div>
                    )}
                </AnimatePresence>
                <span className="p-2 w-full h-full flex items-center justify-center">
                    {icon}
                </span>
            </motion.div>
        </a>
    );
}
