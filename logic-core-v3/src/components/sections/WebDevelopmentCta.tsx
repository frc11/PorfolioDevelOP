"use client"
import React, { useState } from 'react'

export const WebDevelopmentCta = () => {
    const [showForm, setShowForm] = useState(false)

    return (
        <section className="relative w-full z-10 pb-32">
            {/* Separador antes del CTA */}
            <div style={{
                height: '1px',
                margin: 'clamp(48px,7vh,80px) 0',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
            }} />

            {/* WRAPPER CTA */}
            <div className="max-w-4xl mx-auto px-4 w-full">
                <div style={{
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 'clamp(48px,7vh,80px) clamp(24px,5vw,80px)',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(123,47,255,0.03) 100%)',
                    border: '1px solid rgba(0,229,255,0.12)'
                }}>

                    {/* Glow interno */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.08) 0%, transparent 60%)'
                    }} />

                    {/* Shimmer superior */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, height: '1px',
                        background: 'linear-gradient(90deg, transparent, #00e5ff 30%, #7b2fff 70%, transparent)'
                    }} />

                    {/* Urgency badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.22)',
                        borderRadius: '100px',
                        padding: '6px 16px',
                        marginBottom: '20px',
                        position: 'relative',
                        zIndex: 2,
                    }}>
                        <span style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            background: '#ef4444',
                            boxShadow: '0 0 8px rgba(239,68,68,0.7)',
                            animation: 'pulse-live 2s ease-in-out infinite',
                            flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fca5a5' }}>
                            Cupos limitados — 2 disponibles en las próximas 2 semanas
                        </span>
                    </div>

                    {/* EYEBROW */}
                    <div style={{
                        fontSize: '11px',
                        letterSpacing: '0.35em',
                        color: 'rgba(255,255,255,0.3)',
                        marginBottom: '20px',
                        position: 'relative',
                        zIndex: 2,
                    }}>
                        ¿SEGUÍS PERDIENDO CLIENTES A LAS 2AM?
                    </div>

                    {/* H2 */}
                    <h2 style={{
                        fontSize: 'clamp(36px, 5.5vw, 72px)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: '16px',
                        position: 'relative',
                        zIndex: 2,
                    }}>
                        <span style={{ color: 'white', display: 'block' }}>Tu Sucursal Digital</span>
                        <span style={{
                            background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}>te espera.</span>
                    </h2>

                    {/* Subtítulo */}
                    <p style={{
                        maxWidth: '480px',
                        margin: '0 auto 40px',
                        fontSize: '16px',
                        color: 'rgba(255,255,255,0.5)',
                        lineHeight: 1.6,
                        position: 'relative',
                        zIndex: 2,
                    }}>
                        Sin contrato largo. Sin sorpresas. Con un activo digital que trabaja por vos.
                    </p>

                    {/* GARANTÍA PILL */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '100px',
                        padding: '6px 16px',
                        marginBottom: '32px',
                        position: 'relative',
                        zIndex: 2,
                    }}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                            Consulta inicial gratuita · Sin compromiso
                        </span>
                    </div>

                    {/* CTAs */}
                    <style>{`
                        .cta-whatsapp {
                            display: inline-flex; align-items: center; gap: 10px;
                            background: linear-gradient(135deg, #25d366, #128c7e);
                            color: white; font-weight: 700; border-radius: 100px;
                            padding: 16px 40px; font-size: 15px; letter-spacing: 0.05em;
                            box-shadow: 0 0 30px rgba(37,211,102,0.25), 0 8px 24px rgba(0,0,0,0.3);
                            cursor: pointer; width: fit-content; text-decoration: none;
                            transition: all 200ms;
                        }
                        .cta-whatsapp:hover {
                            filter: brightness(1.1);
                            transform: scale(1.02);
                            box-shadow: 0 0 40px rgba(37,211,102,0.4), 0 12px 30px rgba(0,0,0,0.4);
                        }
                        .cta-secondary {
                            display: inline-flex; align-items: center; gap: 8px;
                            background: transparent; border: 1px solid rgba(255,255,255,0.15);
                            color: rgba(255,255,255,0.7); border-radius: 100px; padding: 14px 32px;
                            font-size: 14px; cursor: pointer; width: fit-content;
                            transition: all 200ms;
                        }
                        .cta-secondary:hover {
                            border-color: rgba(255,255,255,0.3);
                            color: white;
                        }
                        .contact-input {
                            width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04);
                            border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white;
                            font-size: 14px; outline: none; transition: border-color 200ms;
                        }
                        .contact-input:focus {
                            border-color: rgba(0,229,255,0.4);
                        }
                    `}</style>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>

                        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493816223508'}?text=Hola%20DevelOP%2C%20quiero%20saber%20m%C3%A1s%20sobre%20la%20Sucursal%20Digital`}
                            target="_blank" rel="noopener noreferrer"
                            className="cta-whatsapp"
                        >
                            <svg viewBox="0 0 24 24" fill="#ffffff" width="20" height="20">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.547a.5.5 0 00.609.61l5.765-1.458A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-5.032-1.384l-.361-.214-3.718.941.972-3.634-.235-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                            </svg>
                            Escribirnos por WhatsApp →
                        </a>

                        <button
                            className="cta-secondary"
                            onClick={() => {
                                setShowForm(true)
                                setTimeout(() => {
                                    document.getElementById('contacto-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                                }, 100)
                            }}
                        >
                            Completar formulario de contacto
                        </button>

                        <div style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
                            Respondemos en menos de 2 horas en horario comercial
                        </div>

                        {/* FORMULARIO */}
                        <div id="contacto-form" style={{
                            width: '100%',
                            maxWidth: '400px',
                            maxHeight: showForm ? '600px' : '0',
                            opacity: showForm ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'all 500ms ease',
                            marginTop: showForm ? '24px' : '0'
                        }}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    console.log('Formulario enviado a procesar')
                                }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                            >
                                <input type="text" placeholder="Tu nombre" className="contact-input" required />
                                <input type="tel" placeholder="Tu WhatsApp" className="contact-input" required />
                                <select className="contact-input" required style={{ appearance: 'none' }} defaultValue="">
                                    <option value="" disabled hidden style={{ color: 'rgba(255,255,255,0.4)' }}>Mi rubro...</option>
                                    <option value="gastronomia" style={{ color: '#080810' }}>Gastronomía</option>
                                    <option value="comercio" style={{ color: '#080810' }}>Comercio</option>
                                    <option value="servicios" style={{ color: '#080810' }}>Servicios</option>
                                    <option value="salud" style={{ color: '#080810' }}>Salud</option>
                                    <option value="inmobiliaria" style={{ color: '#080810' }}>Inmobiliaria</option>
                                    <option value="otro" style={{ color: '#080810' }}>Otro</option>
                                </select>
                                <textarea placeholder="Contanos brevemente tu negocio (opcional)" rows={3} className="contact-input" style={{ resize: 'none' }}></textarea>

                                <button type="submit" style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #00e5ff, #7b2fff)',
                                    color: '#080810',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    padding: '14px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    border: 'none',
                                    marginTop: '8px'
                                }}>
                                    Enviar mensaje →
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
