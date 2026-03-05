"use client";

import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    AnimatePresence,
} from "framer-motion";
import { Home, Briefcase, Terminal, Layers, Mail, Lightbulb, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useTransitionContext } from "@/context/TransitionContext";
import { usePathname } from "next/navigation";

// --- Neuronal Components ---

const Axon = ({ direction, delay }: { direction: 'left-1' | 'left-2' | 'right-1' | 'right-2'; delay: number }) => {
    let rotation = '';
    let height = 60;

    if (direction === 'left-1') { rotation = '-rotate-[50deg]'; height = 65; }
    if (direction === 'left-2') { rotation = '-rotate-[15deg]'; height = 85; }
    if (direction === 'right-1') { rotation = 'rotate-[15deg]'; height = 85; }
    if (direction === 'right-2') { rotation = 'rotate-[50deg]'; height = 65; }

    const isCyan = direction.startsWith('left');
    const colorClass = isCyan ? 'via-cyan-400 shadow-[0_0_15px_cyan]' : 'via-fuchsia-400 shadow-[0_0_15px_fuchsia]';

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, delay, ease: "easeOut" }}
            className={`absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom ${rotation} w-[2px] bg-gradient-to-t from-transparent ${colorClass} to-white -z-10`}
        >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
    );
};

const Synapse = ({ label, href, direction, delay }: { label: string; href: string; direction: 'left-1' | 'left-2' | 'right-1' | 'right-2'; delay: number }) => {
    const { triggerTransition } = useTransitionContext();

    let posClass = '';
    if (direction === 'left-1') posClass = 'bottom-[60px] right-[calc(50%+40px)]';
    if (direction === 'left-2') posClass = 'bottom-[100px] right-[calc(50%+10px)]';
    if (direction === 'right-1') posClass = 'bottom-[100px] left-[calc(50%+10px)]';
    if (direction === 'right-2') posClass = 'bottom-[60px] left-[calc(50%+40px)]';

    const isCyan = direction.startsWith('left');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: delay + 0.2 }}
            className={`absolute ${posClass} z-50`}
        >
            <Link
                href={href}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerTransition(href);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2 group hover:bg-zinc-800 ${isCyan ? 'hover:border-cyan-500/50' : 'hover:border-fuchsia-500/50'} transition-colors`}
            >
                <div className={`w-2 h-2 rounded-full ${isCyan ? 'bg-cyan-400' : 'bg-fuchsia-400'} shadow-[0_0_10px_currentColor] group-hover:scale-125 transition-transform`} />
                <span className="text-[10px] font-semibold text-zinc-300 group-hover:text-white uppercase tracking-wider">{label}</span>
            </Link>
        </motion.div>
    );
};

export const DynamicDock = () => {
    const mouseX = useMotionValue(Infinity);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Ensure menu closes securely on any route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

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
        <>
            {/* Desktop Dock */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9990] pointer-events-auto hidden md:block">
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

            {/* Mobile Dock */}
            <div className="fixed bottom-6 left-6 z-[9990] pointer-events-auto md:hidden flex flex-col-reverse items-center gap-4">
                {/* Toggle Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-14 h-14 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-50 transition-colors active:bg-zinc-800"
                >
                    {isMobileMenuOpen ? <X className="text-white w-6 h-6" /> : <Menu className="text-white w-6 h-6" />}
                </button>

                {/* Expandable Vertical Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom' },
                                show: {
                                    opacity: 1, scale: 1, y: 0,
                                    transition: {
                                        type: "spring", stiffness: 300, damping: 25,
                                        staggerChildren: 0.05,
                                        delayChildren: 0.1
                                    }
                                },
                                exit: {
                                    opacity: 0, scale: 0.9, y: -20,
                                    transition: { staggerChildren: 0.05, staggerDirection: -1 }
                                }
                            }}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="flex flex-col w-[72px] items-center gap-3 rounded-[36px] border border-white/10 bg-zinc-950/90 py-4 backdrop-blur-2xl shadow-2xl overflow-visible whitespace-nowrap"
                        >
                            {/* We keep the original array order or reverse it? Let's just map normally, first icon (Inicio) is on top */}
                            {icons.map((item, i) => (
                                <motion.div key={i} variants={{
                                    hidden: { opacity: 0, y: 10, scale: 0.8 },
                                    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300 } },
                                    exit: { opacity: 0, scale: 0.8 }
                                }}>
                                    <MobileDockIcon
                                        icon={item.icon}
                                        href={item.href}
                                        label={item.label}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
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

                        {/* Left Axons & Synapses */}
                        <Axon direction="left-1" delay={0} />
                        <Synapse label="Web Dev" href="/web-development" direction="left-1" delay={0.1} />

                        <Axon direction="left-2" delay={0.1} />
                        <Synapse label="Agentes IA" href="/ai-implementations" direction="left-2" delay={0.2} />

                        {/* Right Axons & Synapses */}
                        <Axon direction="right-1" delay={0.2} />
                        <Synapse label="Software" href="/software-development" direction="right-1" delay={0.3} />

                        <Axon direction="right-2" delay={0.3} />
                        <Synapse label="n8n" href="/process-automation" direction="right-2" delay={0.4} />
                    </>
                )}
            </AnimatePresence>

            <Link href={href} onClick={handleClick} className="p-2 w-full h-full flex items-center justify-center z-10">
                {icon}
            </Link>
        </motion.div>
    );
}

// --- Mobile specific icon rendering without the physics width scaling ---
function MobileDockIcon({
    icon,
    href,
    label,
    onClick
}: {
    icon: React.ReactNode;
    href: string;
    label: string;
    onClick: () => void;
}) {
    const { triggerTransition } = useTransitionContext();
    const isServices = label === "Servicios";

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        triggerTransition(href);
        setTimeout(() => {
            onClick(); // gracefully close menu under the shutter
        }, 400);
    };

    return (
        <div className="relative flex flex-col items-center justify-center gap-1 my-2">
            <AnimatePresence>
                {/* Horizontal Popup Menu for Services (Mobile Version) */}
                {isServices && (
                    <>
                        {/* Connecting Horizontal Axon Lines */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 30, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                            className="absolute top-[20px] left-[50px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_15px_cyan] origin-left -rotate-12 z-0 pointer-events-none"
                        >
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
                        </motion.div>

                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 30, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
                            className="absolute top-[30px] left-[50px] h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400 to-white shadow-[0_0_15px_fuchsia] origin-left rotate-12 z-0 pointer-events-none"
                        >
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
                        </motion.div>

                        {/* Dropdown Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: -10, transformOrigin: 'left center' }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: -10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                            className="absolute top-1/2 -translate-y-1/2 left-[75px] flex flex-col gap-2 z-50"
                        >
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    triggerTransition("/web-development");
                                    setTimeout(() => onClick(), 400);
                                }}
                                className="whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]" />
                                <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Web Dev</span>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    triggerTransition("/ai-implementations");
                                    setTimeout(() => onClick(), 400);
                                }}
                                className="whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]" />
                                <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Agentes IA</span>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    triggerTransition("/software-development");
                                    setTimeout(() => onClick(), 400);
                                }}
                                className="whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_fuchsia]" />
                                <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Software</span>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    triggerTransition("/process-automation");
                                    setTimeout(() => onClick(), 400);
                                }}
                                className="whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_fuchsia]" />
                                <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">n8n</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Link
                href={href}
                onClick={handleClick}
                className={`flex items-center justify-center w-10 h-10 rounded-full border text-zinc-400 transition-colors z-10 ${isServices ? 'bg-zinc-800 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-zinc-900/50 border-white/5 active:bg-zinc-800 active:text-white'}`}
            >
                <div className="w-5 h-5 pointer-events-none">
                    {icon}
                </div>
            </Link>

            {/* Persistent Mobile Label */}
            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                {label}
            </span>
        </div>
    );
}
