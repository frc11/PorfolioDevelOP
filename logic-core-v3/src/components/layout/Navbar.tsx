"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, Grid2x2, X } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import DynamicDock from "@/components/layout/DynamicDock";
import { useTransitionContext } from "@/context/TransitionContext";

type NavItem = {
    href: string;
    label: string;
    expandable?: boolean;
};

type ServiceItem = {
    href: string;
    label: string;
    subLabel: string;
    price: string;
};

const NAV_ITEMS: readonly NavItem[] = [
    { href: "/#inicio", label: "Inicio" },
    { href: "/#nosotros", label: "Nosotros" },
    { href: "/#portfolio", label: "Portfolio" },
    { href: "/#servicios", label: "Servicios", expandable: true },
    { href: "/#caracteristicas", label: "Caracteristicas" },
    { href: "/contact", label: "Contacto" },
] as const;

const SERVICE_ITEMS: readonly ServiceItem[] = [
    { href: "/web-development", label: "Sitio Web", subLabel: "Presencia profesional", price: "$800" },
    { href: "/ai-implementations", label: "Agente IA", subLabel: "Atencion 24/7", price: "$300" },
    { href: "/software-development", label: "Software", subLabel: "Sistema a medida", price: "$1.500" },
    { href: "/process-automation", label: "Automatizacion", subLabel: "Tareas automaticas", price: "$200" },
] as const;

const SERVICE_ROUTE_SET = new Set<string>(SERVICE_ITEMS.map((item) => item.href));
const HASH_TO_LABEL: Readonly<Record<string, string>> = {
    "#inicio": "Inicio",
    "#nosotros": "Nosotros",
    "#portfolio": "Portfolio",
    "#servicios": "Servicios",
    "#caracteristicas": "Caracteristicas",
};

function getActiveTab(pathname: string, hash: string): string {
    if (pathname === "/contact") return "Contacto";
    if (SERVICE_ROUTE_SET.has(pathname)) return "Servicios";
    if (pathname !== "/") return "";

    return HASH_TO_LABEL[hash] ?? "Inicio";
}

function BrandLogo() {
    return (
        <motion.div
            animate={{ opacity: [0.82, 1, 0.82], scale: [1, 1.02, 1] }}
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

function AccederButton({ compact = false }: { compact?: boolean }) {
    const { triggerTransition } = useTransitionContext();

    return (
        <motion.button
            type="button"
            onClick={() => triggerTransition("/login")}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className={`group relative isolate overflow-hidden rounded-full bg-gradient-to-r from-cyan-600 to-cyan-800 font-medium tracking-wide text-white shadow-[0_14px_34px_rgba(8,145,178,0.26),inset_0_1px_0_rgba(255,255,255,0.12)] ${
                compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"
            }`}
        >
            <span className="relative z-10">Acceder</span>
            <motion.span
                aria-hidden="true"
                animate={{ x: ["-140%", "260%"] }}
                transition={{ duration: 1.05, repeat: Infinity, repeatDelay: 3.95, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-y-[-30%] left-[-45%] z-0 w-[42%] rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.48),transparent)] opacity-80"
            />
        </motion.button>
    );
}

export function Navbar() {
    const pathname = usePathname();
    const { triggerTransition } = useTransitionContext();
    const { scrollY } = useScroll();

    const lastScrollYRef = useRef(0);

    const [activeTab, setActiveTab] = useState("Inicio");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServicesExpanded, setIsServicesExpanded] = useState(false);
    const [isDockVisible, setIsDockVisible] = useState(true);

    useMotionValueEvent(scrollY, "change", (current) => {
        const previous = lastScrollYRef.current;
        const delta = current - previous;

        if (isMobileMenuOpen) {
            setIsDockVisible(true);
            lastScrollYRef.current = current;
            return;
        }

        if (current <= 8) {
            setIsDockVisible(true);
            lastScrollYRef.current = current;
            return;
        }

        if (delta > 0) {
            setIsDockVisible(false);
        } else if (delta < 0) {
            setIsDockVisible(true);
        }

        lastScrollYRef.current = current;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const syncActiveTab = () => {
            setActiveTab(getActiveTab(pathname, window.location.hash));
        };

        syncActiveTab();
        window.addEventListener("hashchange", syncActiveTab);

        return () => {
            window.removeEventListener("hashchange", syncActiveTab);
        };
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setIsMobileMenuOpen(false);
            setIsServicesExpanded(false);
            setIsDockVisible(true);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [pathname]);

    return (
        <>
            <DynamicDock />

            <div className="md:hidden">
                <AnimatePresence>
                    {isMobileMenuOpen ? (
                        <motion.button
                            type="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                setIsServicesExpanded(false);
                            }}
                            aria-label="Cerrar menu"
                        />
                    ) : null}
                </AnimatePresence>

                <motion.button
                    type="button"
                    onClick={() => {
                        setIsMobileMenuOpen((value) => {
                            const nextValue = !value;

                            if (!nextValue) {
                                setIsServicesExpanded(false);
                            }

                            return nextValue;
                        });
                    }}
                    animate={isDockVisible || isMobileMenuOpen ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
                    transition={{
                        y: {
                            type: "spring",
                            stiffness: isDockVisible ? 360 : 280,
                            damping: isDockVisible ? 22 : 30,
                            mass: 0.9,
                        },
                        opacity: { duration: 0.18, ease: "easeOut" },
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{ pointerEvents: isDockVisible || isMobileMenuOpen ? "auto" : "none" }}
                    className="fixed bottom-6 right-6 z-[9999] flex h-12 w-12 items-center justify-center rounded-[14px] border border-white/[0.08] bg-[#030305]/80 shadow-2xl shadow-black/50 backdrop-blur-2xl"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isMobileMenuOpen ? (
                            <motion.span
                                key="close"
                                initial={{ rotate: -90, scale: 0.75 }}
                                animate={{ rotate: 0, scale: 1 }}
                                exit={{ rotate: 90, scale: 0.75 }}
                                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                            >
                                <X size={16} color="rgba(255,255,255,0.74)" />
                            </motion.span>
                        ) : (
                            <motion.span
                                key="open"
                                initial={{ rotate: 90, scale: 0.75 }}
                                animate={{ rotate: 0, scale: 1 }}
                                exit={{ rotate: -90, scale: 0.75 }}
                                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                            >
                                <Grid2x2 size={16} color="rgba(255,255,255,0.74)" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>

                <AnimatePresence>
                    {isMobileMenuOpen ? (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-x-0 bottom-0 z-[9995] overflow-hidden rounded-t-[24px] border-t border-white/[0.08] bg-[#030305]/92 px-5 pt-3 pb-8 backdrop-blur-2xl"
                            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
                        >
                            <div className="mb-4 flex justify-center">
                                <div className="h-1 w-10 rounded-full bg-white/[0.14]" />
                            </div>

                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <BrandLogo />
                                    <div className="text-[10px] font-semibold tracking-[0.24em] text-white/38">
                                        develOP
                                    </div>
                                </div>
                                <AccederButton compact />
                            </div>

                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.04,
                                            delayChildren: 0.04,
                                        },
                                    },
                                }}
                            >
                                {NAV_ITEMS.map((item) => {
                                    const isServices = item.expandable === true;
                                    const isActive = activeTab === item.label;

                                    return (
                                        <motion.div
                                            key={item.label}
                                            variants={{
                                                hidden: { opacity: 0, x: -12 },
                                                visible: { opacity: 1, x: 0 },
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isServices) {
                                                        setIsServicesExpanded((value) => !value);
                                                        setActiveTab(item.label);
                                                        return;
                                                    }

                                                    setActiveTab(item.label);
                                                    triggerTransition(item.href);
                                                    setTimeout(() => setIsMobileMenuOpen(false), 250);
                                                }}
                                                className="flex h-[54px] w-full items-center justify-between border-b border-white/[0.05] text-left"
                                            >
                                                <span className={`text-[15px] font-medium tracking-wide ${isActive ? "text-white" : "text-white/78"}`}>
                                                    {item.label}
                                                </span>
                                                {isServices ? (
                                                    <motion.span
                                                        animate={{ rotate: isServicesExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.18 }}
                                                    >
                                                        <ChevronDown size={14} color="rgba(255,255,255,0.28)" />
                                                    </motion.span>
                                                ) : null}
                                            </button>

                                            {isServices ? (
                                                <AnimatePresence>
                                                    {isServicesExpanded ? (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            {SERVICE_ITEMS.map((service) => (
                                                                <button
                                                                    key={service.href}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setActiveTab("Servicios");
                                                                        triggerTransition(service.href);
                                                                        setTimeout(() => setIsMobileMenuOpen(false), 250);
                                                                    }}
                                                                    className="flex w-full items-center justify-between border-b border-white/[0.04] py-4 pl-4 text-left"
                                                                >
                                                                    <span>
                                                                        <span className="block text-sm font-medium tracking-wide text-white/82">
                                                                            {service.label}
                                                                        </span>
                                                                        <span className="mt-1 block text-[11px] tracking-wide text-white/34">
                                                                            {service.subLabel}
                                                                        </span>
                                                                    </span>
                                                                    <span className="text-[11px] font-medium tracking-wide text-cyan-100/72">
                                                                        {service.price}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    ) : null}
                                                </AnimatePresence>
                                            ) : null}
                                        </motion.div>
                                    );
                                })}
                            </motion.div>

                            <div className="pt-5 text-xs tracking-wide text-white/24">
                                Tucuman, Argentina
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </>
    );
}

export default Navbar;
