'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useActionState } from 'react';
import { submitContactForm } from '@/lib/actions/contact';

const SERVICE_OPTIONS = [
    { value: '', label: 'Seleccioná un servicio' },
    { value: 'web', label: 'Desarrollo Web' },
    { value: 'software', label: 'Software a Medida' },
    { value: 'automation', label: 'Automatización de Procesos' },
    { value: 'ai', label: 'Implementaciones de IA' },
    { value: 'other', label: 'Otro / No sé todavía' },
]

export default function ContactPage() {
    const [state, action, isPending] = useActionState(submitContactForm, { success: false })

    return (
        <main className="min-h-screen bg-[#070709] text-white overflow-hidden relative">
            {/* Ambient glows */}
            <div className="absolute top-[-15%] left-[-5%] w-[50vw] h-[50vw] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-5%] w-[40vw] h-[40vw] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-6 py-24 min-h-screen flex flex-col justify-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl mb-16"
                >
                    <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-500/60 mb-4">
                        develOP — Tucumán, Argentina
                    </p>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-white leading-none">
                        Hablemos.
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
                        Contanos sobre tu proyecto. Respondemos en menos de 24 horas con un diagnóstico inicial sin cargo.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {state.success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col items-start gap-4 py-12"
                            >
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-amber-400" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-white">Mensaje recibido.</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    Te respondemos en las próximas 24 horas con un diagnóstico inicial. Si es urgente, podés escribirnos directamente por WhatsApp.
                                </p>
                            </motion.div>
                        ) : (
                            <form action={action} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="group">
                                        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2 group-focus-within:text-amber-400 transition-colors">
                                            Nombre *
                                        </label>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500/40 rounded-xl p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900/80 text-sm"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2 group-focus-within:text-amber-400 transition-colors">
                                            Email *
                                        </label>
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500/40 rounded-xl p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900/80 text-sm"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="group">
                                        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2 group-focus-within:text-amber-400 transition-colors">
                                            Teléfono
                                        </label>
                                        <input
                                            name="phone"
                                            type="tel"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500/40 rounded-xl p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900/80 text-sm"
                                            placeholder="+54 381..."
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2 group-focus-within:text-amber-400 transition-colors">
                                            Empresa
                                        </label>
                                        <input
                                            name="company"
                                            type="text"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500/40 rounded-xl p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900/80 text-sm"
                                            placeholder="Nombre de tu empresa"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2 group-focus-within:text-amber-400 transition-colors">
                                        Servicio de interés
                                    </label>
                                    <select
                                        name="service"
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500/40 rounded-xl p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900/80 text-sm"
                                    >
                                        {SERVICE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value} className="bg-zinc-900">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2 group-focus-within:text-amber-400 transition-colors">
                                        Mensaje *
                                    </label>
                                    <textarea
                                        name="message"
                                        rows={4}
                                        required
                                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500/40 rounded-xl p-4 outline-none text-zinc-200 transition-all focus:bg-zinc-900/80 text-sm resize-none"
                                        placeholder="Contanos sobre tu proyecto o el problema que querés resolver..."
                                    />
                                </div>

                                {state.error && (
                                    <p className="text-sm text-red-400/80">{state.error}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="relative overflow-hidden w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60"
                                    style={{
                                        background: isPending
                                            ? 'rgba(245,158,11,0.08)'
                                            : 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))',
                                        border: '1px solid rgba(245,158,11,0.25)',
                                        color: '#fbbf24',
                                    }}
                                >
                                    <span>{isPending ? 'Enviando...' : 'Enviar mensaje'}</span>
                                    {!isPending && <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col justify-between"
                    >
                        <div className="space-y-10">
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Datos de contacto</h3>
                                <div className="space-y-4">
                                    {[
                                        { icon: Mail, label: 'hola@develop.com.ar' },
                                        { icon: Phone, label: '+54 381 XXX XXXX' },
                                        { icon: MapPin, label: 'Tucumán, Argentina' },
                                    ].map(({ icon: Icon, label }) => (
                                        <div key={label} className="flex items-center gap-4 text-zinc-400 group cursor-pointer">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                                                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}
                                            >
                                                <Icon className="w-4 h-4 text-amber-500/60" />
                                            </div>
                                            <span className="text-base group-hover:text-white transition-colors">{label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div
                                className="p-6 rounded-2xl"
                                style={{ background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.08)' }}
                            >
                                <h4 className="text-white font-bold mb-1">Horario de atención</h4>
                                <p className="text-zinc-500 text-xs mb-4">Respondemos consultas en horario extendido</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Lun – Vie</span>
                                        <span className="text-zinc-300">09:00 – 19:00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Sáb</span>
                                        <span className="text-zinc-300">10:00 – 14:00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Dom</span>
                                        <span className="text-zinc-600">Cerrado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}
