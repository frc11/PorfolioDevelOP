"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { CtaButton, accentBgClass, type ServiceAccent } from "@/components/design-system";
import { useChromeRevealed } from "@/components/layout/useChromeRevealed";
import { useTransitionContext } from "@/context/TransitionContext";
import {
    CHROME_REVEAL_DURATION_S,
    CHROME_REVEAL_EASE,
    CHROME_REVEAL_OFFSET_PX,
} from "@/lib/chromeReveal";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { getWhatsappHref } from "@/lib/whatsapp";

/**
 * Chrome de navegación del sitio público — B2-S2.
 *
 * Reemplaza al par `Navbar` + `DynamicDock`: una barra superior plana, opaca y
 * quieta, en lugar de un dock flotante inferior de vidrio esmerilado. El dock
 * se borró; este archivo es todo lo que queda.
 *
 * Por qué arriba y no abajo — no es preferencia, resuelve dos bugs medidos que
 * el dock inferior causaba por posición:
 *
 *  1. A 390px el launcher del chat (310–366 × 764–820) tapaba por completo el
 *     botón del menú (318–366 × 772–820). El widget vive en z-index
 *     2.147.000.100, así que no había forma de ganarle apilando — se resuelve
 *     moviendo el disparador del menú al extremo opuesto del viewport.
 *  2. A 1440×760, con un H1 de 4 líneas, el microcopy del hero caía 66px por
 *     debajo del dock. Sin chrome fijo abajo, la colisión no puede existir.
 *
 * Qué se fue con el dock, y por qué:
 *  - Glassmorphism (`backdrop-filter: blur(48px) saturate(180%)`) — la
 *    dirección pide superficies planas. La barra es opaca.
 *  - Radios y píldoras — radio 0 en superficies.
 *  - Los 7 iconos de Lucide (House/Bot/Code2/Network/Workflow/Mail/LogIn) — la
 *    flecha `→` del `CtaButton` es el único icono del sistema. Las anclas son
 *    texto.
 *  - Dos animaciones infinitas (el shimmer del CTA y el latido del logo) —
 *    nada perpetuo.
 *  - `getLightLevel()`, la heurística de luz/oscuridad por umbrales de scroll
 *    que el dock reimplementaba al margen de `ThemeContext`. La barra es
 *    chrome, no contenido: va siempre en tema oscuro vía `data-ds-theme`, el
 *    mismo mecanismo que usa `SectionShell`.
 *  - Los DOS listeners de scroll sin coordinar (Framer `useScroll` en Navbar +
 *    `window.addEventListener` nativo en el dock) y el ocultarse/mostrarse
 *    según dirección. La barra es persistente: no se esconde.
 *
 * Los `id` de destino NO se tocan. Las secciones que mueren se rediseñan en
 * B3/B4 y sus anclas se remapean ahí.
 */

type NavItem = {
    href: string;
    label: string;
};

type ServiceItem = {
    href: string;
    label: string;
    subLabel: string;
    accent: ServiceAccent;
};

const MAIN_NAV_ITEMS: readonly NavItem[] = [
    { href: "/#inicio", label: "Inicio" },
    { href: "/#nosotros", label: "Nosotros" },
    { href: "/#portfolio", label: "Portfolio" },
    { href: "/#servicios", label: "Servicios" },
    { href: "/#caracteristicas", label: "Características" },
    { href: "/contact", label: "Contacto" },
] as const;

const SERVICE_ITEMS: readonly ServiceItem[] = [
    {
        href: "/web-development",
        label: "Sitio web",
        subLabel: "Presencia profesional",
        accent: "web",
    },
    {
        href: "/ai-implementations",
        label: "Agente de IA",
        subLabel: "Atención 24/7",
        accent: "ia",
    },
    {
        href: "/software-development",
        label: "Software",
        subLabel: "Sistema a medida",
        accent: "software",
    },
    {
        href: "/process-automation",
        label: "Automatización",
        subLabel: "Tareas automáticas",
        accent: "automation",
    },
] as const;

const SERVICE_ROUTE_SET = new Set<string>(SERVICE_ITEMS.map((item) => item.href));

// El ancla de "Proceso" no es la misma en las 4 landings: /process-automation y
// /ai-implementations exponen id="proceso"; las otras dos tenían id propio de
// antes — se corrige el link, no el destino. Verificado contra los ids reales.
const PROCESO_ANCHOR_BY_ROUTE: Readonly<Record<string, string>> = {
    "/web-development": "web-development-timeline",
    "/software-development": "pipeline",
};

function getNavItems(pathname: string): readonly NavItem[] {
    if (SERVICE_ROUTE_SET.has(pathname)) {
        const procesoAnchor = PROCESO_ANCHOR_BY_ROUTE[pathname] ?? "proceso";

        return [
            { href: `${pathname}#hero`, label: "Inicio" },
            { href: `${pathname}#${procesoAnchor}`, label: "Proceso" },
            { href: `${pathname}#faq`, label: "FAQ" },
            { href: "/contact", label: "Contacto" },
        ];
    }

    return MAIN_NAV_ITEMS;
}

const HASH_TO_LABEL: Readonly<Record<string, string>> = {
    "#inicio": "Inicio",
    "#nosotros": "Nosotros",
    "#portfolio": "Portfolio",
    "#servicios": "Servicios",
    "#caracteristicas": "Características",
    "#hero": "Inicio",
    "#proceso": "Proceso",
    "#web-development-timeline": "Proceso",
    "#pipeline": "Proceso",
    "#faq": "FAQ",
};

function getActiveLabel(pathname: string, hash: string): string {
    if (pathname === "/contact") return "Contacto";
    return HASH_TO_LABEL[hash] ?? "Inicio";
}

/** Los ids que el observador vigila. Derivados de las anclas, no del DOM entero. */
function getObservedIds(items: readonly NavItem[]): string[] {
    return items
        .map((item) => item.href.split("#")[1])
        .filter((id): id is string => Boolean(id));
}

// El hash de la URL es estado EXTERNO al árbol de React, así que se lee con
// `useSyncExternalStore` y no copiándolo a un `useState` desde un efecto. De
// yapa arregla algo que la versión anterior no hacía: la barra ahora reacciona
// a `hashchange` (botón atrás del navegador, o el chatbot navegando por hash).
// Identidades a nivel de módulo para que no se resuscriba en cada render.
function subscribeToHash(onStoreChange: () => void) {
    window.addEventListener("hashchange", onStoreChange);
    return () => window.removeEventListener("hashchange", onStoreChange);
}

const getHashSnapshot = () => window.location.hash;
// En SSR no hay hash: el servidor nunca lo recibe.
const getHashServerSnapshot = () => "";

function Wordmark({ onActivate }: { onActivate: () => void }) {
    return (
        <button
            type="button"
            onClick={onActivate}
            aria-label="develOP — ir al inicio"
            className="flex shrink-0 items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-fg"
        >
            <Image
                src="/logodevelOP.svg"
                alt=""
                aria-hidden="true"
                width={18}
                height={18}
                className="h-[18px] w-[18px] object-contain brightness-0 invert"
            />
            <span className="font-ds-mono text-[11px] font-medium tracking-[0.22em] text-ds-fg">
                develOP
            </span>
        </button>
    );
}

/**
 * Ancla de la barra. El estado activo es una regla de 1px bajo la palabra — no
 * una píldora con fondo. El subrayado ocupa su lugar siempre (transparente
 * cuando no está activo) para que activarse no mueva el texto.
 */
function NavLink({
    item,
    isActive,
    onActivate,
}: {
    item: NavItem;
    isActive: boolean;
    onActivate: (item: NavItem) => void;
}) {
    return (
        <a
            href={item.href}
            onClick={(event) => {
                event.preventDefault();
                onActivate(item);
            }}
            aria-current={isActive ? "page" : undefined}
            className={`border-b pb-0.5 text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-fg ${
                isActive
                    ? "border-b-ds-fg text-ds-fg"
                    : "border-b-transparent text-ds-fg-muted hover:text-ds-fg"
            }`}
        >
            {item.label}
        </a>
    );
}

function ServiceRow({
    service,
    onActivate,
    className = "",
}: {
    service: ServiceItem;
    onActivate: (href: string) => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onActivate(service.href)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-ds-fg/[0.06] motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ds-fg ${className}`}
        >
            {/*
              El acento en su dosis mínima: un cuadrado de 6px. Es el único
              color de toda la barra.
            */}
            <span
                aria-hidden="true"
                className={`size-1.5 shrink-0 ${accentBgClass[service.accent]}`}
            />
            <span className="min-w-0">
                <span className="block text-sm text-ds-fg">{service.label}</span>
                <span className="mt-0.5 block text-xs text-ds-fg-muted">{service.subLabel}</span>
            </span>
        </button>
    );
}

export function Navbar() {
    const pathname = usePathname();
    const { triggerTransition } = useTransitionContext();
    const revealed = useChromeRevealed();
    const reduced = useReducedMotion();

    // Etiqueta activa: la manda el observador de secciones si ya dijo algo; si
    // no, se deriva de la URL. Se guarda SOLO lo que el observador aporta, en
    // vez de espejar la URL en un estado — así no hay dos fuentes de verdad que
    // sincronizar desde un efecto.
    const [observedLabel, setObservedLabel] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    const servicesRef = useRef<HTMLDivElement>(null);

    const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot, getHashServerSnapshot);

    // Reseteo al cambiar de ruta, ajustando estado DURANTE el render en vez de
    // en un efecto: es el patrón que documenta React para "estado derivado que
    // se resetea cuando cambia una prop". Un efecto acá pinta un frame con el
    // menú de la ruta anterior todavía abierto.
    const [routeKey, setRouteKey] = useState(pathname);

    if (routeKey !== pathname) {
        setRouteKey(pathname);
        setObservedLabel(null);
        setIsMenuOpen(false);
        setIsServicesOpen(false);
    }

    const items = getNavItems(pathname);
    const showServicesMenu = !SERVICE_ROUTE_SET.has(pathname);
    const activeLabel = observedLabel ?? getActiveLabel(pathname, hash);

    const navigate = useCallback(
        (href: string) => {
            setIsMenuOpen(false);
            setIsServicesOpen(false);
            triggerTransition(href);
        },
        [triggerTransition],
    );

    const handleNavItem = useCallback(
        (item: NavItem) => {
            setObservedLabel(item.label);
            navigate(item.href);
        },
        [navigate],
    );

    // Sección activa. A diferencia del observador anterior —que vigilaba TODO
    // `section[id], div[id]` del documento— este solo mira los destinos que la
    // barra realmente puede resaltar.
    useEffect(() => {
        const ids = getObservedIds(getNavItems(pathname));
        if (ids.length === 0) return;

        let observer: IntersectionObserver | undefined;

        // El home monta sus secciones por `next/dynamic`: al primer frame varios
        // destinos todavía no están en el DOM. Un reintento corto los alcanza sin
        // dejar un intervalo colgado.
        const timeoutId = window.setTimeout(() => {
            const targets = ids
                .map((id) => document.getElementById(id))
                .filter((node): node is HTMLElement => node !== null);

            if (targets.length === 0) return;

            observer = new IntersectionObserver(
                (entries) => {
                    const visible = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                    if (!visible) return;

                    const match = getNavItems(pathname).find((item) =>
                        item.href.endsWith(`#${visible.target.id}`),
                    );
                    if (match) setObservedLabel(match.label);
                },
                { rootMargin: "-30% 0px -40% 0px", threshold: [0, 0.25, 0.5, 1] },
            );

            targets.forEach((target) => observer?.observe(target));
        }, 500);

        return () => {
            window.clearTimeout(timeoutId);
            observer?.disconnect();
        };
    }, [pathname]);

    // El panel mobile es un modal: mientras está abierto, el fondo no scrollea.
    // Es lo único de este archivo que toca `overflow`, y solo por interacción
    // del usuario — nunca en carga.
    useEffect(() => {
        if (!isMenuOpen) return;

        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    // Escape cierra; un click fuera cierra el desplegable de servicios.
    useEffect(() => {
        if (!isMenuOpen && !isServicesOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setIsMenuOpen(false);
            setIsServicesOpen(false);
        };

        const onPointerDown = (event: PointerEvent) => {
            if (!isServicesOpen) return;
            if (servicesRef.current?.contains(event.target as Node)) return;
            setIsServicesOpen(false);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("pointerdown", onPointerDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("pointerdown", onPointerDown);
        };
    }, [isMenuOpen, isServicesOpen]);

    return (
        <motion.header
            // La barra es chrome, no contenido: no acompaña la inversión de tema
            // por sección. `data-ds-theme` fija el oscuro para todo el subárbol,
            // el mismo mecanismo que usa `SectionShell`.
            data-ds-theme="dark"
            initial={false}
            animate={{
                opacity: revealed ? 1 : 0,
                y: revealed ? 0 : reduced ? 0 : -CHROME_REVEAL_OFFSET_PX,
            }}
            transition={
                reduced
                    ? { duration: 0 }
                    : { duration: CHROME_REVEAL_DURATION_S, ease: CHROME_REVEAL_EASE }
            }
            style={{ pointerEvents: revealed ? "auto" : "none" }}
            className="fixed inset-x-0 top-0 z-[9991] border-b border-ds-rule bg-ds-canvas"
        >
            <nav
                aria-label="Navegación principal"
                className="mx-auto flex h-ds-nav max-w-ds-page items-center justify-between gap-6 px-ds-gutter"
            >
                <Wordmark onActivate={() => handleNavItem(MAIN_NAV_ITEMS[0])} />

                {/* ── Anclas, desktop ────────────────────────────────── */}
                <div className="hidden items-center gap-7 lg:flex">
                    {items.map((item) => {
                        const isServices = showServicesMenu && item.label === "Servicios";

                        if (!isServices) {
                            return (
                                <NavLink
                                    key={item.label}
                                    item={item}
                                    isActive={activeLabel === item.label}
                                    onActivate={handleNavItem}
                                />
                            );
                        }

                        return (
                            <div key={item.label} ref={servicesRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsServicesOpen((value) => !value)}
                                    aria-expanded={isServicesOpen}
                                    aria-haspopup="true"
                                    className={`border-b pb-0.5 text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-fg ${
                                        activeLabel === item.label || isServicesOpen
                                            ? "border-b-ds-fg text-ds-fg"
                                            : "border-b-transparent text-ds-fg-muted hover:text-ds-fg"
                                    }`}
                                >
                                    {item.label}
                                </button>

                                <AnimatePresence mode="wait">
                                    {isServicesOpen ? (
                                        <motion.div
                                            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                                            transition={{ duration: reduced ? 0.12 : 0.18, ease: "easeOut" }}
                                            className="absolute left-1/2 top-[calc(100%+1.1rem)] w-72 -translate-x-1/2 border border-ds-rule bg-ds-panel py-1"
                                        >
                                            {SERVICE_ITEMS.map((service) => (
                                                <ServiceRow
                                                    key={service.href}
                                                    service={service}
                                                    onActivate={navigate}
                                                />
                                            ))}

                                            <div className="border-t border-ds-rule">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(item.href)}
                                                    className="w-full px-4 py-3 text-left text-xs text-ds-fg-muted transition-colors duration-150 hover:text-ds-fg motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ds-fg"
                                                >
                                                    Ver todos los servicios
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* ── Controles, desktop ─────────────────────────────── */}
                <div className="hidden shrink-0 items-center gap-5 lg:flex">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm text-ds-fg-muted transition-colors duration-150 hover:text-ds-fg motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-fg"
                    >
                        Acceder
                    </button>

                    <CtaButton density="compact" href={getWhatsappHref()} target="_blank">
                        Escribinos
                    </CtaButton>
                </div>

                {/*
                  ── Disparador del menú, mobile ─────────────────────────
                  Arriba a la derecha: el extremo opuesto al launcher del chat
                  (abajo a la derecha), que es lo que tapaba al botón viejo.
                  Es texto y no un icono — la flecha del CtaButton es el único
                  icono del sistema.
                */}
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((value) => !value)}
                    aria-expanded={isMenuOpen}
                    aria-controls="menu-mobile"
                    className="shrink-0 border border-ds-rule px-3 py-2 text-xs tracking-[0.14em] text-ds-fg uppercase transition-colors duration-150 hover:border-ds-fg motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-fg lg:hidden"
                >
                    {isMenuOpen ? "Cerrar" : "Menú"}
                </button>
            </nav>

            {/* ── Panel mobile ───────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {isMenuOpen ? (
                    <motion.div
                        id="menu-mobile"
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        transition={{ duration: reduced ? 0.12 : 0.22, ease: "easeOut" }}
                        className="max-h-[calc(100svh-var(--spacing-ds-nav))] overflow-y-auto border-t border-ds-rule bg-ds-canvas lg:hidden"
                    >
                        {items.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => handleNavItem(item)}
                                aria-current={activeLabel === item.label ? "page" : undefined}
                                className={`flex h-14 w-full items-center border-b border-ds-rule px-ds-gutter text-left text-[15px] transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ds-fg ${
                                    activeLabel === item.label ? "text-ds-fg" : "text-ds-fg-muted"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}

                        {showServicesMenu ? (
                            <div className="border-b border-ds-rule py-1">
                                {SERVICE_ITEMS.map((service) => (
                                    <ServiceRow
                                        key={service.href}
                                        service={service}
                                        onActivate={navigate}
                                        className="px-ds-gutter"
                                    />
                                ))}
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-4 px-ds-gutter py-6">
                            <CtaButton
                                density="compact"
                                href={getWhatsappHref()}
                                target="_blank"
                                className="w-full"
                            >
                                Escribinos
                            </CtaButton>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-left text-sm text-ds-fg-muted transition-colors duration-150 hover:text-ds-fg motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ds-fg"
                            >
                                Acceder al portal
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.header>
    );
}

export default Navbar;
