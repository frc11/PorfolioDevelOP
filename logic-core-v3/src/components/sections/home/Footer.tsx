'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, FileText, MapPin, Clock, Shield, Users } from 'lucide-react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493815000000';
const WA_TEXT = encodeURIComponent(
  'Hola! Vi tu página y me gustaría saber qué necesita mi negocio para crecer. ¿Pueden ayudarme?'
);

const LOGO_PATH =
  'M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z';

interface FormState {
  nombre: string;
  whatsapp: string;
  rubro: string;
  mensaje: string;
}

const TRUST_ITEMS = [
  { icon: MapPin, text: 'Tucumán, Argentina' },
  { icon: Clock, text: 'Respuesta Inmediata' },
  { icon: Shield, text: 'Consulta gratuita' },
  { icon: Users, text: '2+ años en el mercado' },
] as const;

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/develop-agency' },
  { label: 'Instagram', href: 'https://instagram.com/develop.agency' },
  { label: 'Twitter/X', href: 'https://twitter.com/develop_agency' },
  { label: 'Email', href: 'mailto:hola@develop.com.ar' },
];

const CTA_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const Footer = () => {
  const [contactMode, setContactMode] = useState<'options' | 'form'>('options');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    nombre: '',
    whatsapp: '',
    rubro: '',
    mensaje: '',
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        setSubmitted(true);
      } catch {
        window.open(
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            `Hola! Soy ${form.nombre}. Rubro: ${form.rubro}. ${form.mensaje}`
          )}`,
          '_blank'
        );
      }
    } else {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hola! Soy ${form.nombre}. Rubro: ${form.rubro}. ${form.mensaje}`
        )}`,
        '_blank'
      );
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#050505',
        minHeight: '100svh',
        paddingTop: 'clamp(18px, 2.5svh, 42px)',
        paddingBottom: 'clamp(12px, 2svh, 28px)',
      }}
    >
      {/* Fondo minimalista */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 44%, rgba(255,255,255,0.025) 0%, transparent 38%, rgba(0,0,0,0.72) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Firma de marca */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985, y: 10 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 1.4, ease: CTA_EASE }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <motion.svg
          viewBox="0 0 1024 1024"
          style={{ width: 'min(66vw, 620px)', opacity: 0.18 }}
        >
          <motion.path
            d={LOGO_PATH}
            fill="transparent"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 2.4, ease: CTA_EASE }}
          />
          <motion.path
            d={LOGO_PATH}
            fill="white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.12 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 1.2, delay: 1.25, ease: CTA_EASE }}
          />
        </motion.svg>
      </motion.div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >

        <div aria-hidden="true" style={{ height: 54 }} />

        {/* HEADLINE */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.68, delay: 0.08, ease: CTA_EASE }}
          style={{ marginBottom: 16 }}
        >
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
              fontWeight: 300,
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              margin: 0,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            ¿No sabés por dónde
          </h2>
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.8rem)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.035em',
              margin: 0,
              color: 'white',
            }}
          >
            empezar?
          </h2>
        </motion.div>

        {/* SUBLINE — copy central */}
        <motion.p
          initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.64, delay: 0.16, ease: CTA_EASE }}
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.38)',
            maxWidth: 480,
            margin: '0 auto',
            marginBottom: 16,
          }}
        >
          Contanos tu negocio en 2 minutos. Te decimos exactamente
          qué necesitás y cuánto te costaría.{' '}
          <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            Sin compromiso. Sin tecnicismos.
          </span>
        </motion.p>

        {/* CALLOUT — El primer paso es gratis */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.58, delay: 0.24, ease: CTA_EASE }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              height: 1,
              width: 32,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.24))',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.68)',
              letterSpacing: '0.04em',
            }}
          >
            El primer paso es gratis.
          </span>
          <div
            style={{
              height: 1,
              width: 32,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.24), transparent)',
            }}
          />
        </motion.div>

        {/* BLOQUE INTERACTIVO: opciones/formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.66, delay: 0.32, ease: CTA_EASE }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 720,
            minHeight: 'clamp(250px, 28svh, 300px)',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {contactMode === 'options' ? (
              <motion.div
                key="options"
                initial={{ opacity: 0, y: 22, scale: 0.985, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -18, scale: 0.985, filter: 'blur(6px)' }}
                transition={{ duration: 0.72, ease: CTA_EASE }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(268px, 1fr))',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            maxWidth: 660,
            margin: '0 auto',
          }}
        >
          {/* CTA WHATSAPP */}
          <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WA_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.025, y: -3 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 100%)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 18,
              textDecoration: 'none',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 rgba(255,255,255,0)',
              transition: 'background 500ms ease, border-color 500ms ease, box-shadow 500ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.095) 0%, rgba(255,255,255,0.028) 100%)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.28)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.14), 0 18px 52px rgba(255,255,255,0.075), 0 22px 70px rgba(0,0,0,0.42)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 100%)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.13)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 rgba(255,255,255,0)';
            }}
          >
            {/* Shimmer top-left */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '60%', height: '60%',
                background: 'radial-gradient(circle at top left, rgba(255,255,255,0.075), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              <div
                style={{
                  width: 34, height: 34,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.065)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageCircle size={16} color="rgba(255,255,255,0.78)" strokeWidth={1.5} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.86)',
                  letterSpacing: '0.04em',
                }}
              >
                WhatsApp directo
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.38)',
                lineHeight: 1.45,
                textAlign: 'left',
              }}
            >
              Respondemos en menos de 2hs en horario comercial
            </span>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.66)',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              Abrir chat →
            </div>
          </motion.a>

          {/* CTA FORMULARIO */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
            onClick={() => setContactMode('form')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)',
              border: '1px solid rgba(255,255,255,0.095)',
              borderRadius: 18,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045), 0 0 0 rgba(255,255,255,0)',
              transition: 'background 500ms ease, border-color 500ms ease, box-shadow 500ms ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.024) 100%)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.24)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 48px rgba(255,255,255,0.055), 0 22px 70px rgba(0,0,0,0.42)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)';
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.095)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.045), 0 0 0 rgba(255,255,255,0)';
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.045) 48%, transparent 72%)',
                opacity: 0.45,
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34, height: 34,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.055)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={16} color="rgba(255,255,255,0.72)" strokeWidth={1.5} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.82)',
                  letterSpacing: '0.04em',
                }}
              >
                Completar formulario
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.28)',
                lineHeight: 1.45,
                textAlign: 'left',
              }}
            >
              Contanos tu negocio y te preparamos una propuesta
            </span>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.38)',
                fontWeight: 500,
              }}
            >
              Ver formulario →
            </div>
          </motion.div>
        </motion.div>
            ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 22, scale: 0.985, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -18, scale: 0.985, filter: 'blur(6px)' }}
              transition={{ duration: 0.72, ease: CTA_EASE }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                maxWidth: 720,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: 'rgba(255,255,255,0.045)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 16,
                      padding: '36px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 44, height: 44,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20,
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      ✓
                    </div>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 600 }}>
                      ¡Consulta enviada!
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                      Te contactamos en menos de 2hs.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    style={{
                      width: '100%',
                      maxWidth: 720,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.052), rgba(255,255,255,0.026))',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.115)',
                      borderRadius: 16,
                      padding: 12,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 7,
                    }}
                  >
                    {(
                      [
                        { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Tu nombre' },
                        { key: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '+54 381 000-0000' },
                        { key: 'rubro', label: 'Rubro de tu negocio', type: 'text', placeholder: 'Ej: Clínica, Restaurante, Gimnasio...' },
                      ] as const
                    ).map((field) => (
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textAlign: 'left',
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={form[field.key]}
                          onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          required
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.11)',
                            borderRadius: 10,
                            padding: '8px 10px',
                            fontSize: 12,
                            color: 'white',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                            transition: 'border-color 250ms ease, background 250ms ease, box-shadow 250ms ease',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.34)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.075)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.045)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    ))}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: '1 / -1' }}>
                      <label
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.35)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          textAlign: 'left',
                        }}
                      >
                        ¿Qué necesitás?
                      </label>
                      <textarea
                        placeholder="Contanos brevemente qué querés lograr con tu negocio..."
                        rows={2}
                        value={form.mensaje}
                        onChange={(e) => setForm((prev) => ({ ...prev, mensaje: e.target.value }))}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.11)',
                          borderRadius: 10,
                          padding: '8px 10px',
                          fontSize: 12,
                          color: 'white',
                          outline: 'none',
                          width: '100%',
                          boxSizing: 'border-box',
                          resize: 'none',
                          fontFamily: 'inherit',
                          transition: 'border-color 250ms ease, background 250ms ease, box-shadow 250ms ease',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.34)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.075)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.045)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setContactMode('options')}
                      style={{
                        alignSelf: 'stretch',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 12,
                        color: 'rgba(255,255,255,0.54)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        minHeight: 40,
                        transition: 'color 250ms ease, border-color 250ms ease, background 250ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.82)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.24)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.045)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.54)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      Volver
                    </button>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.97 }}
                      style={{
                        padding: '11px 18px',
                        background: loading
                          ? 'rgba(255,255,255,0.18)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(185,185,185,0.78))',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#050505',
                        letterSpacing: '0.08em',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 12px 36px rgba(255,255,255,0.09)',
                        transition: 'background 200ms, box-shadow 200ms',
                        gridColumn: '2 / -1',
                      }}
                    >
                      {loading ? 'ENVIANDO...' : 'ENVIAR CONSULTA →'}
                    </motion.button>

                    <p
                      style={{
                        gridColumn: '1 / -1',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.18)',
                        textAlign: 'center',
                        margin: 0,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Te respondemos en menos de 2hs · Sin compromiso
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>

        {/* TRUST ROW */}
        <motion.div
          initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.62, delay: 0.46, ease: CTA_EASE }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 28,
          }}
        >
          {TRUST_ITEMS.map((item, i) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.25, ease: CTA_EASE }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.5)',
                    padding: '3px 14px',
                    transition: 'color 250ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.82)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  }}
                >
                  <IconComp size={14} strokeWidth={1.5} color="rgba(255,255,255,0.54)" />
                  {item.text}
                </div>
                {i < TRUST_ITEMS.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      height: 18,
                      background: 'rgba(255,255,255,0.075)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── SEPARADOR ── */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
          margin: '36px 0 28px',
        }}
      />

      {/* ── FOOTER ── */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.62, delay: 0.12, ease: CTA_EASE }}
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Logo + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <svg
            viewBox="0 0 1024 1024"
            style={{ width: 26, height: 26, opacity: 0.35 }}
          >
            <path d={LOGO_PATH} fill="white" />
          </svg>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.18)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            develOP · Tucumán, Argentina · V.3.0
          </div>
        </div>

        {/* Redes */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SOCIAL_LINKS.map((link, i) => (
            <span key={link.label} style={{ display: 'flex', alignItems: 'center' }}>
              <a
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  color: 'rgba(255,255,255,0.2)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  transition: 'color 200ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
              >
                {link.label}
              </a>
              {i < SOCIAL_LINKS.length - 1 && (
                <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: 10 }}>·</span>
              )}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.1)',
            letterSpacing: '0.06em',
          }}
        >
           2026 develOP. Todos los derechos reservados.
        </div>
      </motion.div>
    </section>
  );
};
