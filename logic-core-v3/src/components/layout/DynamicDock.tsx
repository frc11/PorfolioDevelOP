"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, type Transition } from "motion/react";
import {
    Bot,
    Code2,
    House,
    LogIn,
    Mail,
    Network,
    Workflow,
    type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useTransitionContext } from "@/context/TransitionContext";
import { useChromeRevealed } from "@/components/layout/useChromeRevealed";

type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    color?: string;
};

const NAV_ITEMS: readonly NavItem[] = [
    { href: "/#inicio", label: "Inicio", icon: House },
    { href: "/web-development", label: "Desarrollo Web", icon: Network, color: "#06b6d4" },
    { href: "/ai-implementations", label: "Chatbot", icon: Bot, color: "#10b981" },
    { href: "/software-development", label: "Desarrollo de Software", icon: Code2, color: "#8b5cf6" },
    { href: "/process-automation", label: "Automatizaciones", icon: Workflow, color: "#f59e0b" },
    { href: "/contact", label: "Contacto", icon: Mail },
] as const;

const ROUTE_TO_LABEL: Readonly<Record<string, string>> = {
    "/web-development": "Desarrollo Web",
    "/ai-implementations": "Chatbot",
    "/software-development": "Desarrollo de Software",
    "/process-automation": "Automatizaciones",
    "/contact": "Contacto",
};

function getActiveTab(pathname: string): string {
    if (pathname === "/") return "Inicio";
    return ROUTE_TO_LABEL[pathname] ?? "";
}

function getLightLevel(scrollPosition: number, viewportHeight: number): "light" | "dark" {
    if (viewportHeight <= 0) return "dark";
    if (scrollPosition < viewportHeight * 0.8) return "light";
    if (scrollPosition < viewportHeight * 2.5) return "dark";
    if (scrollPosition < viewportHeight * 5) return "dark";
    return "dark";
}

function BrandLogo() {
    return (
        <motion.div
            animate={{ opacity: [0.78, 1, 0.78], scale: [1, 1.02, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-[8px] border border-white/[0.08] bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        >
            <Image
                src="/logodevelOP.svg"
                alt="develOP"
                width={18}
                height={18}
                className="h-[18px] w-[18px] object-contain brightness-0 invert"
            />
        </motion.div>
    );
}

function MagneticItem({
    children,
    className,
    range = 5,
}: {
    children: ReactNode;
    className?: string;
    range?: number;
}) {
    const ref = useRef<HTMLSpanElement | null>(null);
    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);
    const x = useSpring(targetX, { stiffness: 150, damping: 15 });
    const y = useSpring(targetY, { stiffness: 150, damping: 15 });

    const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;

        const normalizedX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const normalizedY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

        targetX.set(Math.max(-range, Math.min(range, normalizedX * range)));
        targetY.set(Math.max(-range, Math.min(range, normalizedY * range)));
    };

    const handleMouseLeave = () => {
        targetX.set(0);
        targetY.set(0);
    };

    return (
        <motion.span
            ref={ref}
            style={{ x, y }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
        >
            {children}
        </motion.span>
    );
}

function DockCta({
    isExpanded,
    sizeTransition,
    swapTransition,
}: {
    isExpanded: boolean;
    sizeTransition: Transition;
    swapTransition: Transition;
}) {
    const { triggerTransition } = useTransitionContext();

    return (
        <motion.button
            type="button"
            onClick={() => triggerTransition("/login")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            animate={{
                width: isExpanded ? 114 : 38,
                height: isExpanded ? 32 : 30,
                paddingLeft: isExpanded ? 14 : 0,
                paddingRight: isExpanded ? 14 : 0,
                borderRadius: 9999,
            }}
            transition={{
                width: sizeTransition,
                height: sizeTransition,
                paddingLeft: sizeTransition,
                paddingRight: sizeTransition,
                y: { type: "spring", stiffness: 360, damping: 28 },
            }}
            className="group relative isolate flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-cyan-600 to-cyan-800 text-white shadow-[0_14px_34px_rgba(8,145,178,0.28),inset_0_1px_0_rgba(255,255,255,0.14)]"
        >
            <AnimatePresence mode="wait" initial={false}>
                {isExpanded ? (
                    <motion.span
                        key="full"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={swapTransition}
                        className="relative z-10 flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium tracking-wide"
                    >
                        <span aria-hidden="true">→</span>
                        <span>Acceder</span>
                    </motion.span>
                ) : (
                    <motion.span
                        key="icon"
                        initial={{ opacity: 0, scale: 0.82 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.82 }}
                        transition={swapTransition}
                        className="relative z-10 flex items-center justify-center"
                    >
                        <LogIn size={13} strokeWidth={1.9} />
                    </motion.span>
                )}
            </AnimatePresence>

            <motion.span
                aria-hidden="true"
                animate={{ x: ["-140%", "260%"] }}
                transition={{ duration: 1.05, repeat: Infinity, repeatDelay: 3.95, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-y-[-30%] left-[-45%] z-0 w-[42%] rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.48),transparent)] opacity-80"
            />
        </motion.button>
    );
}

function DockItem({
    item,
    isExpanded,
    isHighlighted,
    pillTransition,
    sizeTransition,
    textTransition,
    reduceMotion,
    onActivate,
    onHoverStart,
    onHoverEnd,
    children,
}: {
    item: NavItem;
    isExpanded: boolean;
    isHighlighted: boolean;
    pillTransition: Transition;
    sizeTransition: Transition;
    textTransition: Transition;
    reduceMotion: boolean;
    onActivate: (label: string) => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    children?: ReactNode;
}) {
    const { triggerTransition } = useTransitionContext();
    const expandedMinWidth = item.label.length > 11 ? 84 : 75;

    return (
        <div
            className="relative flex shrink-0 items-center"
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
        >
            <AnimatePresence>{children}</AnimatePresence>

            <Link
                href={item.href}
                onClick={(event) => {
                    event.preventDefault();
                    onActivate(item.label);
                    triggerTransition(item.href);
                }}
                className="relative block rounded-[18px]"
            >
                {isHighlighted ? (
                    <motion.div
                        layoutId="navbar-pill"
                        transition={pillTransition}
                        className="absolute inset-0 rounded-[18px] border"
                        style={{
                            borderColor: item.color ? `${item.color}3d` : "rgba(255,255,255,0.08)",
                            backgroundColor: item.color ? `${item.color}1f` : "rgba(255,255,255,0.10)",
                        }}
                    />
                ) : null}

                <motion.div
                    animate={{
                        minWidth: isExpanded ? expandedMinWidth : 60,
                        height: isExpanded ? 40 : 36,
                    }}
                    transition={sizeTransition}
                    className="relative z-10 flex items-center justify-center px-2.5"
                >
                    <MagneticItem
                        range={isExpanded ? 5 : 4}
                        className="flex flex-col items-center justify-center gap-[1px]"
                    >
                        <motion.div
                            key={`${item.label}-${isExpanded ? "expanded" : "compact"}`}
                            initial={{ scale: isExpanded ? 0.9 : 1 }}
                            animate={{ scale: reduceMotion ? 1 : isExpanded ? [0.9, 1.08, 1] : [1, 0.85, 1] }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
                            className="flex items-center justify-center"
                        >
                            <item.icon
                                size={isExpanded ? 16 : 15}
                                strokeWidth={1.75}
                                className={isHighlighted ? "text-white" : "text-white/38"}
                                color={isHighlighted && item.color ? item.color : undefined}
                                style={
                                    isHighlighted && !item.color
                                        ? { filter: "drop-shadow(0 0 5px rgba(255,255,255,0.40))" }
                                        : undefined
                                }
                            />
                        </motion.div>

                        <AnimatePresence initial={false}>
                            {isExpanded ? (
                                <motion.span
                                    key={`label-${item.label}`}
                                    initial={
                                        reduceMotion
                                            ? { opacity: 0, width: 0, height: 0 }
                                            : {
                                                  opacity: 0,
                                                  width: 0,
                                                  height: 0,
                                                  y: TEXT_FADE_Y,
                                                  filter: `blur(${TEXT_FADE_BLUR}px)`,
                                              }
                                    }
                                    animate={
                                        reduceMotion
                                            ? { opacity: 1, width: "auto", height: "auto" }
                                            : {
                                                  opacity: 1,
                                                  width: "auto",
                                                  height: "auto",
                                                  y: 0,
                                                  filter: "blur(0px)",
                                              }
                                    }
                                    exit={
                                        reduceMotion
                                            ? { opacity: 0, width: 0, height: 0 }
                                            : {
                                                  opacity: 0,
                                                  width: 0,
                                                  height: 0,
                                                  y: -TEXT_FADE_Y,
                                                  filter: `blur(${TEXT_FADE_BLUR}px)`,
                                              }
                                    }
                                    transition={textTransition}
                                    className="overflow-hidden whitespace-nowrap font-medium"
                                    style={{
                                        fontSize: 9,
                                        letterSpacing: "0.05em",
                                        color: isHighlighted
                                            ? item.color ?? "#ffffff"
                                            : "rgba(255,255,255,0.27)",
                                        willChange: "opacity, transform, filter",
                                    }}
                                >
                                    {item.label}
                                </motion.span>
                            ) : null}
                        </AnimatePresence>
                    </MagneticItem>
                </motion.div>
            </Link>
        </div>
    );
}

const PILL_SPRING: Transition = { type: "spring", stiffness: 420, damping: 34, mass: 0.72 };
const PILL_INSTANT: Transition = { duration: 0 };

// Entrada del dock: oculto durante el intro del hero, sube desde abajo (slide-up
// + fade) cuando el hero termina. Tunables.
const DOCK_HIDDEN_Y = 80;
const DOCK_REVEAL_SECONDS = 0.5;
const DOCK_REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ---- Compresión/descompresión del dock (tunables de animación) ----
// Cambio de tamaño/forma del contenedor, ítems y CTA. Subí DOCK_RESIZE_SECONDS para
// una compresión aún más lenta; el easing es un cubic-bezier suave (entra/sale tranquilo).
const DOCK_RESIZE_SECONDS = 0.52;
const DOCK_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Fade progresivo de los textos (labels de ítems, "develOP" del logo, "Acceder" del CTA).
const TEXT_FADE_SECONDS = 0.26;

// Coreografía por delays relativos (sin timeouts sueltos):
//  - Comprimir: los textos se van primero; el colapso de tamaño arranca apenas después.
//  - Expandir: el ancho crece primero; los textos entran con un leve retardo.
const SIZE_COLLAPSE_DELAY = 0.12; // s — retardo del colapso de tamaño al comprimir
const TEXT_ENTER_DELAY = 0.2; // s — retardo del fade-in de textos al expandir

// Refuerzo "desvanecer" de los textos (muy leve, tunable; poné 0 para desactivar).
const TEXT_FADE_Y = 4; // px de translateY en el fade
const TEXT_FADE_BLUR = 2; // px de blur en el fade

export function DynamicDock() {
    const pathname = usePathname();
    // Revelado del chrome (compartido con el widget de chat vía useChromeRevealed):
    // home espera el intro (phase 'done'); marketing espera su propio intro local
    // (evento 'chrome:revealed'); demás rutas, inmediato. Dock + widget al mismo tiempo.
    const dockVisible = useChromeRevealed();

    const lastScrollY = useRef(0);
    const collapseTimeoutRef = useRef<number | null>(null);

    const [activeTab, setActiveTab] = useState("Inicio");
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
    const [scrollPosition, setScrollPosition] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [hoverExpanded, setHoverExpanded] = useState(false);

    const isExpanded = scrollDirection === "up" || hoverExpanded;
    const highlightedTab = hoveredTab ?? activeTab;
    const lightLevel = getLightLevel(scrollPosition, viewportHeight);

    // Animación de compresión/descompresión: el tamaño (contenedor/ítems/CTA) y el fade
    // de textos comparten easing pero difieren en duración y delay para coreografiar el
    // movimiento (al comprimir, los textos se van primero; al expandir, el ancho crece
    // antes que entren). Bajo prefers-reduced-motion: crossfade corto, sin slide ni
    // colapso largo.
    const reduceMotion = useReducedMotion() ?? false;

    const sizeTransition: Transition = reduceMotion
        ? { duration: 0 }
        : {
              duration: DOCK_RESIZE_SECONDS,
              ease: DOCK_EASE,
              delay: isExpanded ? 0 : SIZE_COLLAPSE_DELAY,
          };

    const textTransition: Transition = reduceMotion
        ? { duration: 0.12 }
        : {
              duration: TEXT_FADE_SECONDS,
              ease: DOCK_EASE,
              delay: isExpanded ? TEXT_ENTER_DELAY : 0,
          };

    const swapTransition: Transition = reduceMotion
        ? { duration: 0.12 }
        : { duration: TEXT_FADE_SECONDS * 0.7, ease: DOCK_EASE };

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleResize = () => {
            setViewportHeight(window.innerHeight);
        };

        const handleScroll = () => {
            const current = window.scrollY;

            if (current < 50) {
                setScrollDirection((prev) => (prev === "up" ? prev : "up"));
                setHoverExpanded((prev) => (prev ? false : prev));
            } else if (current > lastScrollY.current + 5) {
                setScrollDirection((prev) => (prev === "down" ? prev : "down"));
            } else if (current < lastScrollY.current - 5) {
                setScrollDirection((prev) => (prev === "up" ? prev : "up"));
                setHoverExpanded((prev) => (prev ? false : prev));
            }

            lastScrollY.current = current;
            setScrollPosition((prev) => (prev === current ? prev : current));
        };

        handleResize();
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);

            if (collapseTimeoutRef.current !== null) {
                window.clearTimeout(collapseTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setActiveTab(getActiveTab(pathname));
    }, [pathname]);

    // Gate the pill's layout transition: spring (slide) only on the render where the
    // highlight moves to another item (hover / route change); for scroll/expand/collapse/
    // resize reflows the highlight is unchanged, so the pill snaps to its item's new box
    // instantly (duration 0) with no lateral glide.
    //
    // We read the ref during render and update it in an effect (which does NOT re-render).
    // This is intentional and required: a state-based equivalent forces an extra render to
    // duration:0 right after the spring starts, truncating the slide mid-flight. Reading the
    // ref here keeps the spring committed on the "moved" render alive until the next natural
    // re-render. So the react-hooks/refs lint rule is disabled on the read below by design.
    const prevHighlightRef = useRef(highlightedTab);
    // eslint-disable-next-line react-hooks/refs
    const highlightMoved = prevHighlightRef.current !== highlightedTab;
    useEffect(() => {
        prevHighlightRef.current = highlightedTab;
    });
    const pillTransition = highlightMoved ? PILL_SPRING : PILL_INSTANT;

    const clearCollapseTimeout = () => {
        if (collapseTimeoutRef.current !== null) {
            window.clearTimeout(collapseTimeoutRef.current);
            collapseTimeoutRef.current = null;
        }
    };

    const handleDockMouseEnter = () => {
        clearCollapseTimeout();

        if (scrollDirection === "down") {
            setHoverExpanded(true);
        }
    };

    const handleDockMouseLeave = () => {
        setHoveredTab(null);
        clearCollapseTimeout();

        if (scrollDirection === "down") {
            collapseTimeoutRef.current = window.setTimeout(() => {
                setHoverExpanded(false);
            }, 400);
        }
    };

    const handleTabActivate = (label: string) => {
        setActiveTab(label);
    };

    return (
        <div className="fixed bottom-8 left-1/2 z-[9990] hidden -translate-x-1/2 md:block">
            <motion.div
                initial={false}
                animate={{ opacity: dockVisible ? 1 : 0, y: dockVisible ? 0 : DOCK_HIDDEN_Y }}
                transition={{ duration: DOCK_REVEAL_SECONDS, ease: DOCK_REVEAL_EASE }}
                style={{ pointerEvents: dockVisible ? "auto" : "none" }}
            >
            <motion.nav
                onMouseEnter={handleDockMouseEnter}
                onMouseLeave={handleDockMouseLeave}
                animate={{
                    height: isExpanded ? 52 : 40,
                    borderRadius: isExpanded ? 20 : 9999,
                    paddingLeft: isExpanded ? 20 : 16,
                    paddingRight: isExpanded ? 20 : 16,
                    backgroundColor: lightLevel === "light" ? "rgba(0,0,0,0.55)" : "rgba(15,15,15,0.50)",
                    borderColor: lightLevel === "light" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.10)",
                }}
                transition={{
                    height: sizeTransition,
                    borderRadius: sizeTransition,
                    paddingLeft: sizeTransition,
                    paddingRight: sizeTransition,
                    backgroundColor: { duration: 0.8, ease: "easeInOut" },
                    borderColor: { duration: 0.8, ease: "easeInOut" },
                }}
                className="relative flex items-center gap-1.5 border shadow-2xl shadow-black/50"
                style={{ backdropFilter: "blur(48px) saturate(180%)" }}
            >
                <div className="mr-1 flex items-center">
                    <BrandLogo />

                    <AnimatePresence initial={false}>
                        {isExpanded ? (
                            <motion.span
                                key="ecosistema"
                                initial={
                                    reduceMotion
                                        ? { opacity: 0, width: 0, marginLeft: 0 }
                                        : {
                                              opacity: 0,
                                              width: 0,
                                              marginLeft: 0,
                                              x: -6,
                                              filter: `blur(${TEXT_FADE_BLUR}px)`,
                                          }
                                }
                                animate={
                                    reduceMotion
                                        ? { opacity: 1, width: "auto", marginLeft: 10 }
                                        : {
                                              opacity: 1,
                                              width: "auto",
                                              marginLeft: 10,
                                              x: 0,
                                              filter: "blur(0px)",
                                          }
                                }
                                exit={
                                    reduceMotion
                                        ? { opacity: 0, width: 0, marginLeft: 0 }
                                        : {
                                              opacity: 0,
                                              width: 0,
                                              marginLeft: 0,
                                              x: -6,
                                              filter: `blur(${TEXT_FADE_BLUR}px)`,
                                          }
                                }
                                transition={textTransition}
                                className="overflow-hidden whitespace-nowrap text-[10px] font-semibold tracking-[0.22em] text-white/42"
                                style={{ willChange: "opacity, transform, filter" }}
                            >
                                develOP
                            </motion.span>
                        ) : null}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-1">
                    {NAV_ITEMS.map((item) => (
                        <DockItem
                            key={item.label}
                            item={item}
                            isExpanded={isExpanded}
                            isHighlighted={highlightedTab === item.label}
                            pillTransition={pillTransition}
                            sizeTransition={sizeTransition}
                            textTransition={textTransition}
                            reduceMotion={reduceMotion}
                            onActivate={handleTabActivate}
                            onHoverStart={() => setHoveredTab(item.label)}
                            onHoverEnd={() => setHoveredTab(null)}
                        />
                    ))}
                </div>

                <div className="pl-1.5">
                    <DockCta
                        isExpanded={isExpanded}
                        sizeTransition={sizeTransition}
                        swapTransition={swapTransition}
                    />
                </div>
            </motion.nav>
            </motion.div>
        </div>
    );
}

export default DynamicDock;