"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { VideoCard } from '../ui/VideoCard'

const LighthouseGauge = () => {
    const prefersReduced = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.5 });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        if (prefersReduced) {
            setCount(100);
            return;
        }

        let start = 0;
        const end = 100;
        const duration = 1500;
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // easeOutQuart approximation
            const easeOut = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isInView, prefersReduced]);

    return (
        <div ref={containerRef} className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                <motion.circle
                    cx="60" cy="60" r="45"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.6))' }}
                    initial={{ strokeDasharray: "283", strokeDashoffset: prefersReduced ? 0 : 283 }}
                    animate={isInView ? { strokeDashoffset: 0 } : { strokeDashoffset: 283 }}
                    transition={{ duration: prefersReduced ? 0 : 1.8, ease: [0.16, 1, 0.3, 1] }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-white" style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}>
                {count}
            </div>
        </div>
    );
};

const ScrollCue = () => {
    const handleClick = () => {
        document.getElementById("sensory-section")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div
            onClick={handleClick}
            className="w-full flex flex-col items-center relative cursor-pointer z-20 group"
            style={{ marginTop: '64px', paddingBottom: '48px' }}
        >
            <span className="text-[12px] tracking-widest text-[#ffffff40] mb-4">
                MIRÁ CÓMO LO HACEMOS
            </span>
            <div className="scroll-chevron" style={{ color: '#00e5ff', opacity: 0.6 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 15L12 21L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <p className="text-center text-[14px] text-[#ffffff60] italic mt-6">
                Una web que no convierte, es decoración cara.
            </p>

            <style>{`
              @keyframes bounce-chevron-bento {
                0% { transform: translateY(0px); }
                50% { transform: translateY(8px); }
                100% { transform: translateY(0px); }
              }
              .scroll-chevron {
                animation: bounce-chevron-bento 1.5s infinite ease-in-out;
              }
            `}</style>
        </div>
    );
};

export const WebDevelopmentBento = () => {
    const cardBaseStyle = "bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden relative transition-colors duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)]";

    const sectionRef = useRef<HTMLElement>(null);
    const isSectionInView = useInView(sectionRef, { once: true, amount: 0.1 });

    return (
        <section ref={sectionRef} className="py-24 w-full bg-transparent relative z-10 px-4 overflow-hidden">
            {/* GLOWS AMBIENTALES */}
            <div className="absolute pointer-events-none" style={{ top: '-100px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} aria-hidden="true" />
            <div className="absolute pointer-events-none" style={{ top: '50%', right: '-80px', transform: 'translateY(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(123,47,255,0.05) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} aria-hidden="true" />
            <div className="absolute pointer-events-none" style={{ bottom: '-60px', left: '40%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} aria-hidden="true" />

            <div className="relative z-10 flex-col items-center w-full">
                <div className="max-w-7xl mx-auto">

                    {/* TÍTULO DE SECCIÓN */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center text-center w-full relative z-10"
                        style={{ marginBottom: 'clamp(32px, 5vh, 56px)' }}
                    >
                        <span className="text-[11px] tracking-widest text-[#00e5ff] font-mono uppercase mb-4">
                            [ POR QUÉ LA WEB CAMBIA TODO ]
                        </span>
                        <h2 className="font-black text-white leading-tight tracking-tight" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
                            No es una página web.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00e5ff]" style={{ textShadow: '0 0 80px rgba(0,229,255,0.15)' }}>Es tu vendedor más eficiente.</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10">

                        {/* Tarea 2: Tarjeta 1 (Retención UX - 2 Columnas) */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className={`lg:col-span-2 lg:col-start-1 lg:row-start-1 min-h-[320px] overflow-hidden relative transition-colors duration-500`}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '16px',
                                boxShadow: 'inset 0 0 40px rgba(0, 229, 255, 0.05)'
                            }}
                        >
                            <div className="flex flex-col md:flex-row items-stretch h-full w-full relative z-10">
                                {/* Columna Texto */}
                                <div className="flex-1 p-[32px] relative z-10 flex flex-col justify-center">
                                    <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                        Confianza en 3 segundos.
                                    </h3>
                                    <p className="text-zinc-400 leading-relaxed text-lg font-light max-w-md">
                                        La primera impresión decide si el cliente se queda o se va. Un diseño que transmite profesionalismo vende antes de que lean una sola palabra.
                                    </p>
                                </div>

                                {/* Cápsula de Cristal (Wrapper del Video) */}
                                <div
                                    className="w-full md:w-[45%] relative shrink-0 overflow-hidden flex"
                                    style={{
                                        height: '100%',
                                        minHeight: '200px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.08)'
                                    }}
                                >
                                    <VideoCard />

                                    {/* Overlay Gradient Izquierda */}
                                    <div
                                        className="absolute inset-0 pointer-events-none z-10"
                                        style={{ background: 'linear-gradient(90deg, #080810 0%, transparent 40%)' }}
                                    />

                                    {/* Overlay Sutil de Color */}
                                    <div
                                        className="absolute inset-0 pointer-events-none z-10"
                                        style={{ background: 'rgba(0, 229, 255, 0.04)' }}
                                    />

                                    {/* Badge EN VIVO */}
                                    <div
                                        className="absolute top-[12px] right-[12px] z-20 flex items-center gap-[6px]"
                                        style={{
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '100px',
                                            padding: '4px 10px'
                                        }}
                                    >
                                        <style>{`
                                        @keyframes live-pulse {
                                            0% { opacity: 1; }
                                            50% { opacity: 0.2; }
                                            100% { opacity: 1; }
                                        }
                                    `}</style>
                                        <span
                                            className="text-[#00e5ff] text-[10px]"
                                            style={{ animation: 'live-pulse 2s infinite' }}
                                        >●</span>
                                        <span className="text-white text-[10px] font-medium tracking-wide">EN VIVO</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tarea 3: Tarjeta 2 (Velocidad lighthouse - 1 Columna) */}
                        <motion.div
                            initial={{ opacity: 0, y: 24, boxShadow: '0 0 0 rgba(0,229,255,0)' }}
                            animate={isSectionInView ? { opacity: 1, y: 0, boxShadow: ['0 0 0 rgba(0,229,255,0)', '0 0 30px rgba(0,229,255,0.2)', '0 0 0 rgba(0,229,255,0)'] } : { opacity: 0, y: 24, boxShadow: '0 0 0 rgba(0,229,255,0)' }}
                            transition={{
                                opacity: { duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
                                y: { duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] },
                                boxShadow: { delay: 1.85, duration: 0.6 } // Flash at 1.85s when count 0->100 finishes (0.35s delay + 1.5s duration)
                            }}
                            whileHover={{ scale: 1.015, borderColor: 'rgba(0,229,255,0.25)', transition: { duration: 0.2 } }}
                            className={`lg:col-span-1 lg:col-start-3 lg:row-start-1 min-h-[320px] ${cardBaseStyle} p-10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(0,229,255,0.04) 0%, transparent 70%)' }} />

                            <LighthouseGauge />

                            <div className="relative z-10 flex flex-col items-center">
                                <h3 className="text-2xl font-black text-white mb-2">El cliente que espera, se va</h3>
                                <p className="text-zinc-500 text-sm font-light mb-4">Tu web carga antes de que el cliente se impaciente. En menos de 2 segundos, en cualquier celular.</p>

                                {/* Mini Stats */}
                                <div className="flex items-center gap-2 text-[11px] text-[#ffffff60]">
                                    <span>⚡ Rápido</span>
                                    <span>·</span>
                                    <span>📱 Mobile</span>
                                    <span>·</span>
                                    <span>✓ Sin espera</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Nueva Tarjeta 3 (SEO Local) */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ scale: 1.015, borderColor: 'rgba(0,229,255,0.25)', transition: { duration: 0.2 } }}
                            className={`lg:col-span-1 lg:col-start-1 lg:row-start-2 min-h-[220px] p-8 flex flex-col items-start rounded-[2rem] overflow-hidden relative transition-colors duration-500`}
                            style={{
                                backgroundColor: 'rgba(0,229,255,0.03)',
                                border: '1px solid rgba(0,229,255,0.18)',
                                borderTop: '2px solid rgba(0,229,255,0.3)'
                            }}
                        >
                            <div className="flex flex-col gap-4 w-full">

                                {/* BLOQUE SUPERIOR - Google Search Mock */}
                                <div
                                    aria-hidden="true"
                                    className="relative w-full rounded-[10px] mb-2"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        padding: '12px 14px',
                                    }}
                                >
                                    {/* Etiqueta flotante "TU NEGOCIO" */}
                                    <span className="absolute" style={{ top: '-8px', right: '10px', background: '#00e5ff', color: '#080810', fontSize: '8px', fontWeight: 800, letterSpacing: '0.08em', padding: '2px 8px', borderRadius: '100px' }}>
                                        TU NEGOCIO
                                    </span>

                                    {/* Barra de búsqueda simulada */}
                                    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '6px 12px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>
                                        🔍&nbsp;&nbsp;corralón materiales Yerba Buena
                                    </div>

                                    {/* Resultado #1 — tu cliente */}
                                    <div style={{ borderLeft: '2px solid #00e5ff', paddingLeft: '8px', marginBottom: '6px' }}>
                                        <div style={{ fontSize: '9px', color: '#00e5ff', lineHeight: 1.4 }}>tu-negocio.com.ar</div>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>Corralón El Amigo — Yerba Buena</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            Materiales de construcción · Abierto ahora ·
                                            <span style={{ background: 'rgba(0,229,255,0.1)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px' }}>⭐ 4.9</span>
                                        </div>
                                    </div>

                                    {/* Resultados 2 y 3 — competencia */}
                                    <div style={{ opacity: 0.3 }}>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>corralon-abc.com &nbsp;·&nbsp; Corralón ABC</div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>materiales-xyz.com &nbsp;·&nbsp; Materiales XYZ</div>
                                    </div>
                                </div>

                                {/* BLOQUE MEDIO - Ícono + Título */}
                                <div className="flex flex-col gap-2">
                                    <span className="text-[#00e5ff] text-2xl">📍</span>
                                    <h3 className="text-[20px] font-bold text-white leading-tight">Primero en Google en tu ciudad</h3>
                                    <p className="text-[#ffffff80] text-[14px] leading-relaxed">
                                        Cuando alguien busca tu rubro en Tucumán, Salta o Jujuy, tu negocio aparece antes que el de tu competencia.
                                    </p>
                                </div>

                                {/* BLOQUE INFERIOR - Stat de impacto */}
                                <div className="w-full flex flex-col mt-1">
                                    {/* Stat wrapper */}
                                    <div style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: '10px', padding: '12px 16px', margin: '12px 0 4px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '36px', fontWeight: 900, color: '#00e5ff', textShadow: '0 0 24px rgba(0,229,255,0.5)', lineHeight: 1, flexShrink: 0 }}>
                                            3x
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'white', lineHeight: 1.3 }}>más consultas</span>
                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.3 }}>para negocios con SEO local</span>
                                        </div>
                                    </div>
                                    {/* Fuente */}
                                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', marginTop: '-2px', marginBottom: '8px' }}>
                                        — Fuente: Google Business Profile 2024
                                    </span>
                                </div>

                                {/* TAG EXISTENTE */}
                                <div className="mt-2 inline-flex" style={{ backgroundColor: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '100px', padding: '6px 14px' }}>
                                    <span className="text-[11px] font-medium text-[#00e5ff] tracking-wide">Google · Búsqueda local · NOA</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tarjeta 4 (Ancha Inferior - Conversión B2B) */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={isSectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                            transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{ scale: 1.015, borderColor: 'rgba(0,229,255,0.25)', transition: { duration: 0.2 } }}
                            className={`lg:col-span-2 lg:col-start-2 lg:row-start-2 min-h-[220px] bg-gradient-to-br from-[#12002b] via-[#030014] to-[#12002b] ${cardBaseStyle} p-8 md:p-10 border-violet-500/20 flex flex-col justify-center`}
                        >
                            <div className="max-w-2xl space-y-6">
                                <h3 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tighter">
                                    Tu web <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">vende mientras dormís.</span>
                                </h3>
                                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                                    Formularios, WhatsApp integrado y catálogo de productos. Todo diseñado para que el cliente tome acción sin necesitar que estés presente.
                                </p>
                                <div className="mt-2 inline-flex" style={{ backgroundColor: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '100px', padding: '6px 14px' }}>
                                    <span className="text-[11px] font-medium text-[#00e5ff] tracking-wide">Venta 24/7 · WhatsApp · Catálogo</span>
                                </div>
                            </div>
                        </motion.div>

                    </div>

                    {/* CTA - CONSTRUIR MI SUCURSAL */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-12 w-full flex justify-center z-20"
                    >
                        <a
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20construir%20mi%20sucursal%20digital`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-10 py-5 bg-gradient-to-br from-[#25d366] to-[#128c7e] text-white rounded-full font-extrabold text-[14px] uppercase tracking-wider shadow-[0_0_28px_rgba(37,211,102,0.2)] hover:scale(1.04) transition-transform active:scale(0.97) no-underline"
                        >
                            🚀 CONSTRUIR MI SUCURSAL →
                        </a>
                    </motion.div>

                    {/* SCROLL CUE TRANSICIÓN */}
                    <ScrollCue />

                </div>
            </div>
        </section>
    )
}
