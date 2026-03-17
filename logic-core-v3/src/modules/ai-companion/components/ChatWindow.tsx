'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from 'ai';
import { Send, Sparkles, Activity } from 'lucide-react';

/** Safely extract text content from AI SDK messages (handles string, array, undefined) */
function getTextContent(message: any): string {
    const content = message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .filter((part: any) => part?.type === 'text')
            .map((part: any) => part.text || '')
            .join('');
    }
    return '';
}



interface ChatWindowProps {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isOpen: boolean;
    isThinking: boolean;
    onClose?: () => void;
}

export function ChatWindow({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isOpen,
    isThinking,
    onClose,
}: ChatWindowProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [showCursor, setShowCursor] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    // Blinking cursor effect for AI responses
    useEffect(() => {
        if (isThinking) {
            const interval = setInterval(() => {
                setShowCursor((prev) => !prev);
            }, 530);
            return () => clearInterval(interval);
        } else {
            setShowCursor(false);
        }
    }, [isThinking]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            handleSubmit(e);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90]"
                        style={{ pointerEvents: 'auto' }}
                        aria-hidden="true"
                    />

                    {/* Chat Window - Glassmorphism 3.0 Boutique */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-28 right-32 z-[100] flex flex-col"
                        style={{
                            pointerEvents: 'auto',
                            background: 'rgba(6, 8, 18, 0.85)',
                            backdropFilter: 'blur(32px)',
                            WebkitBackdropFilter: 'blur(32px)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            boxShadow: `
                                0 0 0 1px rgba(255,255,255,0.04),
                                0 32px 80px rgba(0,0,0,0.7),
                                0 0 120px rgba(68,100,255,0.08),
                                inset 0 1px 0 rgba(255,255,255,0.08),
                                inset 0 -1px 0 rgba(0,0,0,0.4)
                            `,
                            borderRadius: '24px',
                            overflow: 'hidden',
                            width: 'clamp(320px, 90vw, 420px)',
                            maxHeight: '72vh',
                        }}
                        role="dialog"
                        aria-label="Consultor DevelOP"
                    >
                        {/* Header */}
                        <div style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            background: 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            position: 'relative',
                        }}>
                            {/* Línea de acento superior */}
                            <div style={{
                                position: 'absolute',
                                top: 0, left: '15%', right: '15%',
                                height: '1px',
                                background: `linear-gradient(90deg,
                                    transparent,
                                    rgba(80,120,255,0.6) 30%,
                                    rgba(120,80,255,0.6) 70%,
                                    transparent)`,
                            }} />

                            {/* Avatar mini del asistente */}
                            <div style={{
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(60,100,255,0.3), rgba(120,60,255,0.3))',
                                border: '1px solid rgba(100,150,255,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <div style={{
                                    width: '10px', height: '10px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(100,160,255,1) 0%, rgba(80,100,255,0.4) 70%, transparent 100%)',
                                    boxShadow: '0 0 8px rgba(80,140,255,0.8)',
                                }} />
                            </div>

                            {/* Info del asistente */}
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: 'rgba(255,255,255,0.85)',
                                    margin: 0,
                                    letterSpacing: '0.01em',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                }}>
                                    Consultor DevelOP
                                </p>
                                <p style={{
                                    fontSize: '11px',
                                    color: isThinking ? 'rgba(120,160,255,0.7)' : 'rgba(80,220,130,0.6)',
                                    margin: 0,
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                }}>
                                    {isThinking ? 'Analizando tu consulta...' : '● Disponible ahora'}
                                </p>
                            </div>

                            {/* Botón de cierre minimalista */}
                            <button
                                onClick={onClose}
                                style={{
                                    width: '28px', height: '28px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.35)',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 200ms',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 chat-messages-area"
                            data-lenis-prevent
                            onWheel={(e) => e.stopPropagation()}
                            style={{ 
                                overscrollBehavior: 'contain', 
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                            }}
                            role="log"
                            aria-live="polite"
                        >
                            <AnimatePresence initial={false}>
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                                            <Sparkles className="w-6 h-6 text-cyan-400/80" />
                                        </div>
                                        <div>
                                            <p style={{
                                                fontSize: '11px',
                                                color: 'rgba(255,255,255,0.3)',
                                                fontFamily: 'monospace',
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase',
                                                marginBottom: '4px'
                                            }}>
                                                Sistema Listo
                                            </p>
                                            <p style={{
                                                fontSize: '12px',
                                                color: 'rgba(255,255,255,0.5)',
                                                maxWidth: '240px',
                                                lineHeight: 1.55,
                                                margin: '0 auto',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                            }}>
                                                Protocolo de consultoría iniciado. ¿Cómo puedo asistirle hoy?
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((m, idx) => (
                                        <motion.div
                                            key={m.id}
                                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div style={{
                                                maxWidth: '85%',
                                                padding: '10px 14px',
                                                fontSize: '13px',
                                                lineHeight: 1.65,
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                                ...(m.role === 'user' ? {
                                                    background: 'linear-gradient(135deg, rgba(60,90,255,0.18), rgba(100,60,255,0.12))',
                                                    border: '1px solid rgba(80,100,255,0.25)',
                                                    borderRadius: '16px 4px 16px 16px',
                                                    color: 'rgba(255,255,255,0.88)',
                                                } : {
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.07)',
                                                    borderRadius: '4px 16px 16px 16px',
                                                    color: 'rgba(255,255,255,0.82)',
                                                })
                                            }}>
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                                                            code: ({ children }) => (
                                                                <code style={{ 
                                                                    background: 'rgba(255,255,255,0.08)', 
                                                                    color: '#4488ff', 
                                                                    padding: '2px 4px', 
                                                                    borderRadius: '4px',
                                                                    fontSize: '11px',
                                                                    fontFamily: 'monospace' 
                                                                }}>
                                                                    {children}
                                                                </code>
                                                            ),
                                                            strong: ({ children }) => (
                                                                <strong style={{ color: '#fff', fontWeight: 600 }}>{children}</strong>
                                                            ),
                                                        }}
                                                    >
                                                        {getTextContent(m)
                                                            .replace(/\[(?:ACTION:\s*SHOW_CONTACT|SHOW_CONNECT_FORM|CONNECT_WHATSAPP|NAVIGATE:\s*[^\]]*)\]/g, '')
                                                            .replace(/\[(?:ACTION:\s*SHOW_CONTACT|SHOW_CONNECT(?:_FORM?)?|CONNECT(?:_WHATSAPP?)?|NAVIGATE:?[^\]]*)$/g, '')
                                                            .trim()}
                                                    </ReactMarkdown>
                                                    {m.role === 'assistant' && idx === messages.length - 1 && isThinking && showCursor && (
                                                        <span style={{ 
                                                            display: 'inline-block', 
                                                            width: '6px', 
                                                            height: '14px', 
                                                            background: '#4488ff', 
                                                            marginLeft: '4px',
                                                            verticalAlign: 'middle',
                                                            opacity: 0.8
                                                        }} />
                                                    )}
                                                </div>

                                                {/* Premium Contact Card [ACTION: SHOW_CONTACT] */}
                                                {m.role === 'assistant' && getTextContent(m).includes('[ACTION: SHOW_CONTACT]') && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                        style={{
                                                            background: 'linear-gradient(135deg, rgba(40,60,120,0.4), rgba(60,30,100,0.3))',
                                                            border: '1px solid rgba(100,140,255,0.2)',
                                                            borderRadius: '16px',
                                                            padding: '16px',
                                                            margin: '12px 0 4px',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {/* Shimmer en el borde superior */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0, left: '10%', right: '10%',
                                                            height: '1px',
                                                            background: 'linear-gradient(90deg, transparent, rgba(100,160,255,0.7) 40%, rgba(150,100,255,0.7) 60%, transparent)',
                                                        }} />

                                                        <p style={{
                                                            fontSize: '11px',
                                                            letterSpacing: '0.18em',
                                                            color: 'rgba(100,160,255,0.6)',
                                                            fontWeight: 600,
                                                            margin: '0 0 10px',
                                                            fontFamily: 'monospace',
                                                        }}>
                                                            SIGUIENTE PASO
                                                        </p>

                                                        <p style={{
                                                            fontSize: '13px',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            margin: '0 0 14px',
                                                            lineHeight: 1.5,
                                                        }}>
                                                            Hablemos en detalle sobre tu proyecto.
                                                        </p>

                                                        <motion.a
                                                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '543815674738'}?text=Hola%20DevelOP,%20habl%C3%A9%20con%20Logic%20Core%20y%20me%20interesa%20iniciar%20un%20proyecto...`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                background: 'rgba(37,211,102,0.15)',
                                                                border: '1px solid rgba(37,211,102,0.3)',
                                                                borderRadius: '100px',
                                                                padding: '8px 16px',
                                                                textDecoration: 'none',
                                                                color: 'rgba(37,211,102,0.9)',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            💬 Escribir por WhatsApp
                                                        </motion.a>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {/* Redesigned Thinking Indicator */}
                                {isThinking && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}
                                    >
                                        <div style={{
                                            width: '120px',
                                            height: '2px',
                                            background: 'rgba(255,255,255,0.06)',
                                            borderRadius: '100px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                        }}>
                                            <motion.div
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0, bottom: 0,
                                                    width: '40%',
                                                    background: 'linear-gradient(90deg, transparent, rgba(80,140,255,0.8), transparent)',
                                                    borderRadius: '100px',
                                                }}
                                            />
                                        </div>
                                        <span style={{
                                            fontSize: '11px',
                                            color: 'rgba(255,255,255,0.3)',
                                            fontFamily: 'monospace',
                                            letterSpacing: '0.08em',
                                        }}>
                                            Procesando
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} className="h-1" />
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleFormSubmit}
                            style={{ 
                                padding: '12px 14px', 
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.015)',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-end',
                            }}
                        >
                            <div style={{
                                flex: 1,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: '14px',
                                padding: '10px 14px',
                                position: 'relative',
                                transition: 'all 200ms',
                            }}>
                                <textarea
                                    ref={inputRef as any}
                                    value={input}
                                    onChange={(e) => {
                                        handleInputChange(e as any);
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                    }}
                                    onInput={(e) => {
                                        e.currentTarget.style.height = 'auto';
                                        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                    }}
                                    placeholder="Escribí tu consulta..."
                                    disabled={isThinking}
                                    rows={1}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: '13px',
                                        width: '100%',
                                        resize: 'none',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                        lineHeight: 1.55,
                                        minHeight: '20px',
                                        maxHeight: '80px',
                                        overflow: 'auto',
                                    }}
                                />
                            </div>

                            {/* Botón enviar */}
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.94 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                disabled={isThinking || !input.trim()}
                                style={{
                                    width: '36px', height: '36px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    cursor: isThinking || !input.trim() ? 'not-allowed' : 'pointer',
                                    background: isThinking || !input.trim()
                                        ? 'rgba(255,255,255,0.06)'
                                        : 'linear-gradient(135deg, rgba(60,100,255,0.8), rgba(100,60,255,0.8))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: isThinking || !input.trim() ? 'none' : '0 0 16px rgba(80,100,255,0.3)',
                                    transition: 'all 200ms',
                                }}
                                aria-label="Send message"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </motion.button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
