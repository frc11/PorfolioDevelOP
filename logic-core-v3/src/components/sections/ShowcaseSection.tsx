/**
 * SHOWCASE SECTION — DevelOP
 * 
 * IMÁGENES PENDIENTES DE SWAP:
 * Cuando tengas las imágenes reales, reemplazar:
 * 
 * Hero:
 *   src="https://placehold.co/1440x700/0d0d1f/00e5ff?text=." 
 *   → src="/images/showcase/concesionaria-desktop.png"
 * 
 * Carrusel[0] (Restaurante):
 *   → src="/images/showcase/restaurante-desktop.png"
 * 
 * Carrusel[1] (Inmobiliaria):
 *   → src="/images/showcase/inmobiliaria-desktop.png"
 * 
 * Carrusel[2] (Servicios):
 *   → src="/images/showcase/servicios-desktop.png"
 * 
 * Guardar todas las imágenes en /public/images/showcase/
 * Dimensiones recomendadas:
 *   Hero: 1440x700px
 *   Carrusel: 800x500px
 */
'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from 'framer-motion'

// ── Types ──────────────────────────────────────────────────────────
interface CarouselProject {
    id: number
    tag: string
    client: string
    description: string
    stat: { value: string; label: string }
    stack: string[]
    accent: string
    image: string
}

// ── Data ───────────────────────────────────────────────────────────
const carouselProjects: CarouselProject[] = [
    {
        id: 1,
        tag: "GASTRONOMÍA · YERBA BUENA",
        client: "El Patio Restaurant",
        description: "Reservas online, menú con QR y posicionamiento #1 en búsquedas gastronómicas locales.",
        stat: { value: "3x", label: "Más reservas" },
        stack: ["Next.js", "Reservas", "SEO Local"],
        accent: "#00e5ff",
        image: "/images/showcase/case-gastronomia.svg",
    },
    {
        id: 2,
        tag: "INMOBILIARIA · TUCUMÁN",
        client: "Grupo Nórdico Propiedades",
        description: "Portal con búsqueda avanzada, tours virtuales y captación de leads automática.",
        stat: { value: "5x", label: "Más consultas" },
        stack: ["Next.js", "Portal", "Lead Gen"],
        accent: "#7b2fff",
        image: "/images/showcase/case-inmobiliaria.svg",
    },
    {
        id: 3,
        tag: "SERVICIOS PROFESIONALES · NOA",
        client: "Estudio Ferreyra & Asociados",
        description: "Plataforma de turnos automáticos y consultas online con credibilidad institucional.",
        stat: { value: "24/7", label: "Consultas auto" },
        stack: ["Next.js", "Turnos", "WhatsApp API"],
        accent: "#00e5ff",
        image: "/images/showcase/case-servicios.svg",
    },
    {
        id: 4,
        tag: "COMERCIO · TUCUMÁN",
        client: "Distribuidora Central NOA",
        description: "Catálogo online con más de 500 productos, pedidos automáticos y logística integrada.",
        stat: { value: "500+", label: "Productos" },
        stack: ["Next.js", "E-Commerce", "CRM"],
        accent: "#7b2fff",
        image: "/images/showcase/case-comercio.svg",
    },
    {
        id: 5,
        tag: "GASTRONOMÍA · SAN MIGUEL",
        client: "Mercado del Norte",
        description: "Delivery online, carta digital dinámica y gestión de mesas en tiempo real.",
        stat: { value: "2x", label: "Pedidos online" },
        stack: ["Next.js", "Delivery", "SEO Local"],
        accent: "#00e5ff",
        image: "/images/showcase/case-gastronomia.svg",
    },
    {
        id: 6,
        tag: "OTRO RUBRO · NOA",
        client: "Proyecto Personalizado",
        description: "Solución a medida con arquitectura premium y resultados medibles desde el día uno.",
        stat: { value: "100", label: "Lighthouse" },
        stack: ["Next.js", "Custom", "Premium"],
        accent: "#7b2fff",
        image: "/images/showcase/case-default.svg",
    },
    {
        id: 7,
        tag: "COMERCIO · YERBA BUENA",
        client: "El Almacén Digital",
        description: "Tienda online con integración MercadoPago, WhatsApp automático y SEO local dominante.",
        stat: { value: "#1", label: "Google local" },
        stack: ["Next.js", "MercadoPago", "WhatsApp"],
        accent: "#00e5ff",
        image: "/images/showcase/case-comercio.svg",
    },
    {
        id: 8,
        tag: "INMOBILIARIA · SAN MIGUEL",
        client: "Construir Propiedades",
        description: "Vitrina digital de propiedades con filtros avanzados y formularios de contacto inteligentes.",
        stat: { value: "4x", label: "Leads captados" },
        stack: ["Next.js", "Propiedades", "Lead Gen"],
        accent: "#7b2fff",
        image: "/images/showcase/case-inmobiliaria.svg",
    },
]

const duplicatedProjects = [...carouselProjects, ...carouselProjects]

// ── Components ─────────────────────────────────────────────────────

function ProjectCard({ project }: { project: CarouselProject }) {
    return (
        <div
            className="group"
            style={{
                minWidth: '320px',
                maxWidth: '320px',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)',
                flexShrink: 0,
                transition: 'border-color 300ms, transform 300ms',
                display: 'flex',
                flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
                // Usamos un color con opacidad basado en el acento
                // Asumiendo que project.accent es en formato hex #RRGGBB
                e.currentTarget.style.borderColor = `${project.accent}40`
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {/* IMAGEN SUPERIOR */}
            <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                <Image
                    src={project.image}
                    alt={project.client}
                    fill
                    className="object-cover transition-transform duration-400 group-hover:scale-105"
                    sizes="(max-width: 768px) 320px, 320px"
                />

                {/* Overlay Inferior */}
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0, height: '60px',
                    background: 'linear-gradient(to top, rgba(8,8,16,0.9), transparent)',
                    zIndex: 1
                }} />

                {/* Tag Superior Izquierdo */}
                <div style={{
                    position: 'absolute',
                    top: '10px', left: '10px',
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '100px',
                    padding: '3px 10px',
                    fontSize: '8px',
                    letterSpacing: '0.2em',
                    color: 'rgba(255,255,255,0.7)',
                    zIndex: 2,
                    textTransform: 'uppercase'
                }}>
                    {project.tag}
                </div>
            </div>

            {/* CONTENIDO INFERIOR */}
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
                    {project.client}
                </h4>
                <p style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                    marginBottom: '12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {project.description}
                </p>

                {/* FILA INFERIOR (Stat + Stack) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: project.accent, lineHeight: 1 }}>
                            {project.stat.value}
                        </span>
                        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', textTransform: 'uppercase' }}>
                            {project.stat.label}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                        {project.stack.slice(0, 2).map(tech => (
                            <span key={tech} style={{
                                padding: '2px 8px',
                                fontSize: '9px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '100px',
                                color: 'rgba(255,255,255,0.4)'
                            }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* BORDE INFERIOR HIGHLIGHT */}
            <div style={{
                height: '2px',
                marginTop: 'auto',
                background: `linear-gradient(90deg, ${project.accent}, transparent)`
            }} />
        </div>
    )
}

function InfiniteCarousel() {
    const [isPaused, setIsPaused] = useState(false)
    const x = useMotionValue(0)

    // Calcular ancho total: cardWidth(320px) + gap(20px) = 340px por la cantidad original
    const totalWidth = carouselProjects.length * 340

    useAnimationFrame((_, delta) => {
        if (isPaused) return

        // Velocidad equivalente a la implementación previa:
        // desktop: totalWidth / 40 px/s, mobile: totalWidth / 25 px/s
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
        const duration = isMobile ? 25 : 40
        const speedPxPerSecond = totalWidth / duration
        const deltaPx = speedPxPerSecond * (delta / 1000)

        let next = x.get() - deltaPx
        if (next <= -totalWidth) {
            next += totalWidth
        }
        x.set(next)
    })

    return (
        <div className="w-full relative flex flex-col">
            {/* ── HEADER DEL CARRUSEL ── */}
            <div style={{
                height: '1px',
                marginBottom: 'clamp(40px, 5vh, 64px)',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
            }} />

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
            }}>
                {/* TÍTULO IZQUIERDA */}
                <div className="flex flex-col items-start pt-[6px]">
                    <span style={{ fontSize: '11px', letterSpacing: '0.25em', color: '#00e5ff', textTransform: 'uppercase', marginBottom: '8px' }}>
                        OTROS PROYECTOS
                    </span>
                    <h3 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900, color: 'white', lineHeight: 1.15 }}>
                        Más industrias,<br className="md:hidden" />
                        <span style={{ color: '#00e5ff' }}> mismo estándar.</span>
                    </h3>
                </div>

                {/* INDICADOR DERECHA (solo desktop) */}
                <div className="hidden md:block">
                    <span style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.2)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        Hover para pausar
                    </span>
                </div>
            </div>

            {/* ── CARRUSEL INTERNO ── */}
            <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{ overflow: 'hidden', position: 'relative', paddingTop: '8px', marginTop: '-8px' }}
                role="region"
                aria-label="Carrusel de proyectos"
            >
                {/* FADE IZQUIERDO */}
                <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: '120px',
                    background: 'linear-gradient(to right, #080810, transparent)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }} />

                {/* FADE DERECHO */}
                <div style={{
                    position: 'absolute',
                    right: 0, top: 0, bottom: 0,
                    width: '120px',
                    background: 'linear-gradient(to left, #080810, transparent)',
                    zIndex: 2,
                    pointerEvents: 'none'
                }} />

                <motion.div
                    style={{ display: 'flex', gap: '20px', width: 'max-content', x }}
                >
                    {duplicatedProjects.map((project, index) => (
                        <ProjectCard key={`${project.id}-${index}`} project={project} />
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

// ── ShowcaseSection ────────────────────────────────────────────────
export default function ShowcaseSection() {
    const shouldReduceMotion = useReducedMotion()

    // Header Observer
    const headerRef = useRef<HTMLDivElement>(null)
    const headerInView = useInView(headerRef, { once: true, amount: 0.3 })

    // Hero Observer
    const heroRef = useRef<HTMLDivElement>(null)
    const heroInView = useInView(heroRef, { once: true, amount: 0.15 })

    // Metrics Data
    const metricsArr = [
        { value: '100', label: 'Lighthouse Score' },
        { value: '#1', label: 'Google Local' },
        { value: 'Premium', label: 'Diseño UX/UI' }
    ]

    return (
        <section id="showcase-section" className="relative w-full bg-[#080810] py-32 px-4 overflow-hidden">

            {/* ── GLOWS AMBIENTALES ── */}
            {/* GLOW 1: Violet header */}
            <div
                className="absolute pointer-events-none z-0"
                style={{
                    top: '-100px', left: '50%', transform: 'translateX(-50%)',
                    width: '700px', height: '400px',
                    background: 'radial-gradient(ellipse, rgba(123,47,255,0.08) 0%, transparent 60%)',
                    filter: 'blur(120px)'
                }}
                aria-hidden="true"
            />
            {/* GLOW 2: Cyan hero (left) */}
            <div
                className="absolute pointer-events-none z-0"
                style={{
                    top: '20%', left: '-80px',
                    width: '500px', height: '500px',
                    background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%)',
                    filter: 'blur(100px)'
                }}
                aria-hidden="true"
            />
            {/* GLOW 3: Violet carrusel (right) */}
            <div
                className="absolute pointer-events-none z-0"
                style={{
                    bottom: '15%', right: '-80px',
                    width: '450px', height: '450px',
                    background: 'radial-gradient(circle, rgba(123,47,255,0.06) 0%, transparent 65%)',
                    filter: 'blur(90px)'
                }}
                aria-hidden="true"
            />

            {/* CONTENIDO BASE */}
            <div className="max-w-[1440px] mx-auto relative z-10 w-full">

                {/* ── HEADER DE SECCIÓN ── */}
                <div
                    ref={headerRef}
                    style={{ marginBottom: 'clamp(60px, 8vh, 100px)' }}
                    className="flex flex-col items-center justify-center text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={(headerInView && !shouldReduceMotion) ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            letterSpacing: '0.35em',
                            color: '#00e5ff',
                            background: 'rgba(0,229,255,0.08)',
                            border: '1px solid rgba(0,229,255,0.2)',
                            borderRadius: '100px',
                            padding: '5px 14px',
                            marginBottom: '24px',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                        }}
                    >
                        [ TRABAJOS QUE LO DEMUESTRAN ]
                    </motion.div>

                    <h2 style={{ lineHeight: 1.05, marginBottom: '24px' }}>
                        <motion.span
                            initial={{ clipPath: 'inset(0 0 100% 0)' }}
                            animate={(headerInView && !shouldReduceMotion) ? { clipPath: 'inset(0 0 0% 0)' } : { clipPath: 'inset(0 0 0% 0)' }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            style={{
                                display: 'block',
                                fontSize: 'clamp(42px, 6vw, 80px)',
                                fontWeight: 900,
                                color: '#ffffff',
                            }}
                        >
                            Lo que
                        </motion.span>
                        <motion.span
                            initial={{ clipPath: 'inset(0 0 100% 0)' }}
                            animate={(headerInView && !shouldReduceMotion) ? { clipPath: 'inset(0 0 0% 0)' } : { clipPath: 'inset(0 0 0% 0)' }}
                            transition={{ duration: 0.6, delay: 0.22 }}
                            style={{
                                display: 'block',
                                fontSize: 'clamp(42px, 6vw, 80px)',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #ffffff 0%, #00e5ff 50%, #7b2fff 100%)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                color: 'transparent',
                            }}
                        >
                            construimos.
                        </motion.span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={(headerInView && !shouldReduceMotion) ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        style={{
                            fontSize: '15px',
                            color: 'rgba(255,255,255,0.45)',
                            maxWidth: '520px',
                            lineHeight: 1.6,
                        }}
                    >
                        Cada proyecto es un activo de negocio diseñado
                        para dominar su mercado. Sin excusas.
                    </motion.p>
                </div>

                {/* ── PROYECTO HERO — Concesionaria ── */}
                <motion.div
                    ref={heroRef}
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={(heroInView && !shouldReduceMotion) ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full flex flex-col group overflow-hidden"
                    style={{
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginBottom: 'clamp(48px, 6vh, 80px)',
                        background: '#0d0d1f',
                    }}
                >
                    <div className="relative w-full" style={{ height: 'clamp(320px, 50vh, 600px)' }}>
                        <Image
                            src="/images/showcase/hero-concesionaria.svg"
                            alt="Concesionaria — Proyecto Hero"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1440px) 100vw, 1440px"
                            priority
                        />

                        <div
                            aria-hidden="true"
                            className="absolute inset-0 z-10 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to bottom, rgba(8,8,16,0.1) 0%, rgba(8,8,16,0.2) 40%, rgba(8,8,16,0.85) 75%, rgba(8,8,16,1) 100%)'
                            }}
                        />

                        <div
                            aria-hidden="true"
                            className="hidden md:block absolute inset-0 z-10 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to right, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.5) 35%, transparent 65%)'
                            }}
                        />
                    </div>

                    <div
                        className="absolute bottom-0 left-0 right-0 z-20 flex flex-col md:grid items-end gap-8"
                        style={{
                            padding: 'clamp(32px, 4vw, 52px)',
                            gridTemplateColumns: 'minmax(0, 1fr) auto',
                        }}
                    >
                        <div className="flex flex-col items-start w-full">
                            <div style={{
                                fontSize: '10px',
                                letterSpacing: '0.3em',
                                color: '#00e5ff',
                                marginBottom: '12px',
                                fontFamily: 'monospace',
                                textTransform: 'uppercase'
                            }}>
                                CONCESIONARIA · E-COMMERCE · TUCUMÁN
                            </div>

                            <h3 style={{
                                fontSize: 'clamp(28px, 4vw, 52px)',
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: 1.05,
                                marginBottom: '12px'
                            }}>
                                Del salón físico<br />
                                al showroom digital.
                            </h3>

                            <p style={{
                                fontSize: '15px',
                                color: 'rgba(255,255,255,0.6)',
                                lineHeight: 1.6,
                                maxWidth: '480px',
                                marginBottom: '24px'
                            }}>
                                Transformamos una concesionaria local en una
                                plataforma de ventas premium. Catálogo online,
                                consultas automáticas y presencia dominante en Google.
                            </p>

                            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mt-2 md:mt-0">
                                {metricsArr.map((metric, i) => (
                                    <React.Fragment key={i}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={(heroInView && !shouldReduceMotion) ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.5 + (i * 0.1) }}
                                            className="flex flex-col"
                                        >
                                            <span style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900, color: '#00e5ff', lineHeight: 1 }}>{metric.value}</span>
                                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metric.label}</span>
                                        </motion.div>
                                        {i < metricsArr.length - 1 && (
                                            <div className="hidden md:block w-px h-[40px] bg-white/10" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-8">
                                {['Next.js', 'SEO Local', 'E-Commerce', 'Diseño Premium'].map((tag) => (
                                    <span key={tag} style={{
                                        fontSize: '11px',
                                        color: 'rgba(255,255,255,0.6)',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="hidden md:flex justify-end items-end h-full">
                            <motion.div
                                style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '1px solid rgba(0,229,255,0.2)',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                whileHover={{ scale: 1.05, borderColor: 'rgba(0,229,255,0.5)' }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e5ff]"></span>
                                    </span>
                                    <span style={{
                                        fontSize: '9px',
                                        letterSpacing: '0.3em',
                                        color: 'rgba(255,255,255,0.6)',
                                        textTransform: 'uppercase'
                                    }}>
                                        EN PRODUCCIÓN
                                    </span>
                                </div>
                                <Link
                                    href="#"
                                    className="transition-opacity hover:opacity-80"
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: '#00e5ff',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Ver proyecto →
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ── PROJECTS CAROUSEL (Mobile / Desktop) ── */}
                <InfiniteCarousel />

            </div>
        </section>
    )
}
