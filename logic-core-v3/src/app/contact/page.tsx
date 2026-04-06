'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle, Mail, MapPin, MessageCircle, PhoneCall, Send, ShieldCheck, TimerReset } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { submitContactForm } from '@/lib/actions/contact';
import type { ActionResult } from '@/lib/actions/schemas';

const EMAIL = 'hola@develop.com.ar';
const DEFAULT_PHONE_DIGITS = '543813165293';
const LOCATION = 'Tucuman, Argentina';
const SERVICE_OPTIONS = [
  { value: '', label: 'Selecciona un servicio' },
  { value: 'automation', label: 'Automatizacion de procesos' },
  { value: 'software', label: 'Software a medida' },
  { value: 'web', label: 'Desarrollo web' },
  { value: 'ai', label: 'Implementaciones IA' },
  { value: 'other', label: 'Otro' },
] as const;

const CHANNELS = [
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    subtitle: 'Respuesta rapida en horario comercial',
    cta: 'Escribir ahora',
    icon: MessageCircle,
    accent: '#14b8a6',
  },
  {
    id: 'call',
    title: 'Llamar',
    subtitle: 'Coordinamos una llamada de descubrimiento',
    cta: 'Llamar ahora',
    icon: PhoneCall,
    accent: '#22d3ee',
  },
  {
    id: 'mail',
    title: 'Email',
    subtitle: 'Dejanos contexto y te devolvemos plan de accion',
    cta: 'Enviar email',
    icon: Mail,
    accent: '#5eead4',
  },
] as const;

function getWhatsappHref() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_PHONE_DIGITS;
  const cleanNumber = rawNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=Hola%20develOP%2C%20quiero%20hablar%20sobre%20mi%20proyecto.`;
}

function getPhoneContact() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_PHONE_DIGITS;
  const cleanNumber = rawNumber.replace(/\D/g, '');
  const international = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;

  return {
    href: `tel:${international}`,
    display: international,
  };
}

export default function ContactPage() {
  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(submitContactForm, null);

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverscroll = document.documentElement.style.overscrollBehavior;
    const bodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overscrollBehavior = htmlOverscroll;
      document.body.style.overscrollBehavior = bodyOverscroll;
    };
  }, []);

  const whatsappHref = getWhatsappHref();
  const phone = getPhoneContact();

  const channelHrefById: Record<string, string> = {
    whatsapp: whatsappHref,
    call: phone.href,
    mail: `mailto:${EMAIL}`,
  };

  return (
    <main className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#040d11] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[16%] top-[-30%] h-[58vh] w-[58vh] rounded-full bg-[#14b8a6]/20 blur-[120px]" />
        <div className="absolute -right-[12%] bottom-[-35%] h-[62vh] w-[62vh] rounded-full bg-[#22d3ee]/20 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_1px_1px,rgba(94,234,212,0.35)_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 mx-auto h-full w-full max-w-7xl px-4 pt-3 pb-24 md:px-6 md:pt-4 md:pb-28 lg:px-8 lg:pt-5 lg:pb-24">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#031319]/84 p-5 md:p-6 lg:flex"
            style={{ boxShadow: '0 0 0 1px rgba(20,184,166,0.12), inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px rgba(2,12,18,0.55)' }}
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#5eead4]/70">
                develOP - contacto directo
              </p>
              <h1 className="mt-3 text-[clamp(2.2rem,6.5vw,5.8rem)] font-black leading-[0.95] tracking-[-0.03em] text-white">
                Hablemos
                <span className="text-[#5eead4]"> hoy.</span>
              </h1>
              <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-[#c6e8e9]/76">
                Esta pagina es solo para contacto. Sin scroll, sin distracciones, directo a la accion.
                Elegi el canal que te quede comodo y te respondemos rapido.
              </p>
            </div>

            <div className="mt-auto pt-3">
              {state?.success ? (
                <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle className="h-4 w-4" />
                    <p className="text-sm font-semibold">Mensaje enviado</p>
                  </div>
                  <p className="mt-2 text-sm text-[#c6e8e9]/80">
                    Te respondemos pronto. Si queres acelerar, tambien podes contactarnos por WhatsApp o llamada.
                  </p>
                </div>
              ) : (
                <form action={action} className="grid grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#8deef5]/60">Nombre *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Tu nombre"
                      className="h-9 w-full rounded-xl border border-[#22d3ee]/25 bg-[#081a20]/70 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#22d3ee]/50"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#8deef5]/60">Email *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      className="h-9 w-full rounded-xl border border-[#22d3ee]/25 bg-[#081a20]/70 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#22d3ee]/50"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#8deef5]/60">Telefono</label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+54..."
                      className="h-9 w-full rounded-xl border border-[#22d3ee]/25 bg-[#081a20]/70 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#22d3ee]/50"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#8deef5]/60">Empresa</label>
                    <input
                      name="company"
                      type="text"
                      placeholder="Nombre empresa"
                      className="h-9 w-full rounded-xl border border-[#22d3ee]/25 bg-[#081a20]/70 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#22d3ee]/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#8deef5]/60">Servicio</label>
                    <select
                      name="service"
                      className="h-9 w-full rounded-xl border border-[#22d3ee]/25 bg-[#081a20]/70 px-3 text-sm text-white outline-none focus:border-[#22d3ee]/50"
                      defaultValue=""
                    >
                      {SERVICE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#081a20]">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-[10px] font-mono uppercase tracking-[0.18em] text-[#8deef5]/60">Mensaje *</label>
                    <textarea
                      name="message"
                      rows={2}
                      required
                      placeholder="Contanos brevemente que necesitas..."
                      className="w-full rounded-xl border border-[#22d3ee]/25 bg-[#081a20]/70 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#22d3ee]/50 resize-none"
                    />
                  </div>
                  {state?.error ? (
                    <p className="col-span-2 text-xs text-rose-300">{state.error}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="col-span-2 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#5eead4]/35 bg-gradient-to-r from-[#14b8a6]/20 to-[#22d3ee]/20 text-sm font-semibold text-[#bff9f2] disabled:opacity-65"
                    style={{ transition: 'none' }}
                  >
                    <span>{isPending ? 'Enviando...' : 'Enviar consulta'}</span>
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#14b8a6]/30 bg-[#14b8a6]/12 p-2.5">
                <div className="mb-1 flex items-center gap-2 text-[#8ff8eb]">
                  <TimerReset className="h-4 w-4" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Tiempo de respuesta</span>
                </div>
                <p className="text-[13px] font-semibold text-white">Menos de 2 horas</p>
              </div>

              <div className="rounded-2xl border border-[#22d3ee]/30 bg-[#22d3ee]/12 p-2.5">
                <div className="mb-1 flex items-center gap-2 text-[#9feeff]">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Diagnostico inicial</span>
                </div>
                <p className="text-[13px] font-semibold text-white">Sin costo</p>
              </div>

              <div className="rounded-2xl border border-[#5eead4]/30 bg-[#5eead4]/12 p-2.5">
                <div className="mb-1 flex items-center gap-2 text-[#b9fff5]">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Base operativa</span>
                </div>
                <p className="text-[13px] font-semibold text-white">{LOCATION}</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#02141a]/86 p-4 md:p-5"
            style={{ boxShadow: '0 0 0 1px rgba(34,211,238,0.12), inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px rgba(2,12,18,0.58)' }}
          >
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:hidden">
              <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#86d4da]/70">develOP - contacto directo</p>
              <h1 className="mt-2 text-[clamp(1.8rem,8.2vw,3.2rem)] font-black leading-[0.95] tracking-[-0.03em] text-white">
                Hablemos <span className="text-[#5eead4]">hoy.</span>
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#c6e8e9]/75">
                WhatsApp, llamada o email. Elegi tu canal y arrancamos.
              </p>
            </div>

            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#8deef5]/72">Canales</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">Elegi como hablar</h2>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7cdce4]/60">Online ahora</p>
            </div>

            <div className="grid flex-1 min-h-0 grid-cols-1 gap-3">
              {CHANNELS.map((channel, index) => {
                const Icon = channel.icon;
                return (
                  <motion.a
                    key={channel.id}
                    href={channelHrefById[channel.id]}
                    target={channel.id === 'mail' ? undefined : '_blank'}
                    rel={channel.id === 'mail' ? undefined : 'noopener noreferrer'}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.14 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative flex min-h-0 flex-1 items-center justify-between overflow-hidden rounded-2xl border px-4 py-3 md:px-5"
                    style={{
                      borderColor: `${channel.accent}4D`,
                      background: `linear-gradient(130deg, ${channel.accent}1F, rgba(2,20,26,0.75))`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${channel.accent}1A`,
                      transition: 'none',
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at 78% 50%, ${channel.accent}33 0%, transparent 58%)`,
                        transition: 'none',
                      }}
                    />

                    <div className="relative z-10 flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                          borderColor: `${channel.accent}66`,
                          background: `${channel.accent}24`,
                          boxShadow: `0 0 0 1px ${channel.accent}1A, 0 0 18px ${channel.accent}2E`,
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: channel.accent }} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-lg font-bold leading-tight text-white">{channel.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#c6e8e9]/74 md:text-sm">{channel.subtitle}</p>
                      </div>
                    </div>

                    <div className="relative z-10 ml-3 flex shrink-0 items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-[0.14em]" style={{ color: channel.accent }}>
                        {channel.cta}
                      </span>
                      <ArrowUpRight className="h-4 w-4" style={{ color: channel.accent }} />
                    </div>
                  </motion.a>
                );
              })}
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#86d4da]/60">Datos directos</p>
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-[#d9f8fb]/82 sm:grid-cols-2">
                <a href={`mailto:${EMAIL}`} className="truncate hover:text-white" style={{ transition: 'none' }}>{EMAIL}</a>
                <a href={phone.href} className="truncate hover:text-white" style={{ transition: 'none' }}>{phone.display}</a>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
