'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  { icon: Clock, text: 'Respuesta < 2hs' },
  { icon: Shield, text: 'Consulta gratuita' },
  { icon: Users, text: '4+ años en el mercado' },
] as const;

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/company/develop-agency' },
  { label: 'Instagram', href: 'https://instagram.com/develop.agency' },
  { label: 'Twitter/X', href: 'https://twitter.com/develop_agency' },
  { label: 'Email', href: 'mailto:hola@develop.com.ar' },
];

export const Footer = () => {
  const [showForm, setShowForm] = useState(false);
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
        background: '#080808',
        paddingTop: 128,
        paddingBottom: 80,
      }}
    >
      {/* ── FONDOS DECORATIVOS ── */}

      {/* Línea superior */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.35) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Glow principal centrado */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '70vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          willChange: 'transform',
        }}
      />

      {/* Glow secundario — violeta bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-5%',
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Logo SVG de fondo — muy sutil */}
      <div
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
        <svg
          viewBox="0 0 1024 1024"
          style={{ width: '78vw', maxWidth: 760, opacity: 0.028 }}
        >
          <path d={LOGO_PATH} fill="white" />
        </svg>
      </div>

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
          textAlign: 'center',
        }}
      >

        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(6,182,212,0.22)',
            borderRadius: 100,
            padding: '6px 16px',
            background: 'rgba(6,182,212,0.07)',
            marginBottom: 36,
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: '#06b6d4',
              boxShadow: '0 0 8px rgba(6,182,212,0.8)',
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'rgba(6,182,212,0.85)',
            }}
          >
            HABLEMOS
          </span>
        </motion.div>

        {/* HEADLINE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08 }}
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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.14 }}
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 52,
          }}
        >
          <div
            style={{
              height: 1,
              width: 32,
              background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4))',
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#06b6d4',
              letterSpacing: '0.04em',
            }}
          >
            El primer paso es gratis.
          </span>
          <div
            style={{
              height: 1,
              width: 32,
              background: 'linear-gradient(90deg, rgba(6,182,212,0.4), transparent)',
            }}
          />
        </motion.div>

        {/* DOS CAMINOS DE CONVERSIÓN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.18 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(268px, 1fr))',
            gap: 14,
            width: '100%',
            maxWidth: 660,
            marginBottom: 0,
          }}
        >
          {/* CTA WHATSAPP */}
          <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WA_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.025, y: -3 }}
            whileTap={{ scale: 0.975 }}
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 10,
              padding: '22px 24px',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.13) 0%, rgba(6,182,212,0.04) 100%)',
              border: '1px solid rgba(6,182,212,0.28)',
              borderRadius: 18,
              textDecoration: 'none',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 0 0 rgba(6,182,212,0)',
              transition: 'box-shadow 300ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(6,182,212,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 0 0 rgba(6,182,212,0)';
            }}
          >
            {/* Shimmer top-left */}
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '60%', height: '60%',
                background: 'radial-gradient(circle at top left, rgba(6,182,212,0.08), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
              <div
                style={{
                  width: 34, height: 34,
                  borderRadius: 10,
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageCircle size={16} color="#06b6d4" strokeWidth={1.5} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#06b6d4',
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
                color: '#06b6d4',
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
            transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.9 }}
            onClick={() => setShowForm((prev) => !prev)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 10,
              padding: '22px 24px',
              background: showForm
                ? 'rgba(255,255,255,0.055)'
                : 'rgba(255,255,255,0.03)',
              border: showForm
                ? '1px solid rgba(255,255,255,0.13)'
                : '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18,
              cursor: 'pointer',
              transition: 'background 250ms, border 250ms, box-shadow 300ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34, height: 34,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={16} color="rgba(255,255,255,0.45)" strokeWidth={1.5} />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.65)',
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
              {showForm ? 'Cerrar ↑' : 'Ver formulario →'}
            </div>
          </motion.div>
        </motion.div>

        {/* FORMULARIO INLINE */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ width: '100%', maxWidth: 560, overflow: 'hidden', marginTop: 14 }}
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
                      background: 'rgba(6,182,212,0.06)',
                      border: '1px solid rgba(6,182,212,0.18)',
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
                        background: 'rgba(6,182,212,0.12)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20,
                        color: '#06b6d4',
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
                      background: 'rgba(255,255,255,0.035)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 16,
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {(
                      [
                        { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Tu nombre' },
                        { key: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '+54 381 000-0000' },
                        { key: 'rubro', label: 'Rubro de tu negocio', type: 'text', placeholder: 'Ej: Clínica, Restaurante, Gimnasio...' },
                      ] as const
                    ).map((field) => (
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                            border: '1px solid rgba(255,255,255,0.09)',
                            borderRadius: 10,
                            padding: '11px 14px',
                            fontSize: 14,
                            color: 'white',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    ))}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                        rows={3}
                        value={form.mensaje}
                        onChange={(e) => setForm((prev) => ({ ...prev, mensaje: e.target.value }))}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          borderRadius: 10,
                          padding: '11px 14px',
                          fontSize: 14,
                          color: 'white',
                          outline: 'none',
                          width: '100%',
                          boxSizing: 'border-box',
                          resize: 'none',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.97 }}
                      style={{
                        padding: '13px 24px',
                        background: loading
                          ? 'rgba(6,182,212,0.25)'
                          : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'white',
                        letterSpacing: '0.08em',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: loading ? 'none' : '0 0 28px rgba(6,182,212,0.3)',
                        transition: 'background 200ms, box-shadow 200ms',
                      }}
                    >
                      {loading ? 'ENVIANDO...' : 'ENVIAR CONSULTA →'}
                    </motion.button>

                    <p
                      style={{
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

        {/* TRUST ROW */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.28 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 48,
          }}
        >
          {TRUST_ITEMS.map((item, i) => {
            const IconComp = item.icon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.28)',
                    padding: '0 20px',
                  }}
                >
                  <IconComp size={12} strokeWidth={1.5} color="rgba(6,182,212,0.5)" />
                  {item.text}
                </div>
                {i < TRUST_ITEMS.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      height: 14,
                      background: 'rgba(255,255,255,0.08)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* ── SEPARADOR ── */}
      <div
        style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
          margin: '72px 0 56px',
        }}
      />

      {/* ── FOOTER ── */}
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
          gap: 20,
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
      </div>
    </section>
  );
};
