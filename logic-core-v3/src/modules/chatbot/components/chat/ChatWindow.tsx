'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useRef, useEffect, useState, useCallback } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Send, Sparkles } from 'lucide-react'
import type { UIChatMessage, ToolCallInUIMessage } from './types'
import type { PublicBotConfig } from '../../shared/publicConfig'
import type { NeuroAvatarState } from '../avatar'
import type { DegradedInfo } from '../../hooks/useChatbot'
import { CHATBOT_Z_INDEX } from '../../shared/zIndex'
import { ChatHeader } from './ChatHeader'
import { DegradedBanner } from './DegradedBanner'
import { ThinkingAvatar } from './ThinkingAvatar'
import { StreamingMarkdown } from './StreamingMarkdown'

// Componentes de ReactMarkdown — estáticos, así que se definen UNA vez a nivel
// módulo. Compartidos por el render del asistente (typewriter) y del usuario;
// al ser estables permiten que `memo(StreamingMarkdown)` no re-renderice los
// bubbles del historial cuando cambia el input u otro estado del panel.
const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
  code: ({ children }) => (
    <code
      style={{
        background: 'rgba(255,255,255,0.08)',
        color: '#4488ff',
        padding: '2px 4px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
      }}
    >
      {children}
    </code>
  ),
  strong: ({ children }) => (
    <strong style={{ color: '#fff', fontWeight: 600 }}>{children}</strong>
  ),
}

// Fondo del panel — paridad WYSIWYG con la preview del admin (BotConfigPreview,
// `surfaceBg`): mismo mapeo intensityLevel → opacidad y mismo `tint + alpha hex`.
// Si esa fórmula cambia allá, cambiar acá también. `intensityLevel` llega crudo
// de DB (enum UPPERCASE) — se normaliza local, sin tocar el shape público.
function buildPanelBackground(config: PublicBotConfig): string {
  if (!config.chatSurfaceTint) {
    // Sin tinte configurado: el gradient original, intacto.
    return 'linear-gradient(180deg, rgba(11, 14, 28, 0.92) 0%, rgba(6, 8, 18, 0.9) 100%)'
  }
  const intensity = config.intensityLevel.toUpperCase()
  const surfaceOpacity = intensity === 'LOW' ? 0.72 : intensity === 'HIGH' ? 0.95 : 0.84
  const alphaHex = Math.round(surfaceOpacity * 255)
    .toString(16)
    .padStart(2, '0')
  return `${config.chatSurfaceTint}${alphaHex}`
}

// Parsea hex #rrggbb → componentes RGB. Devuelve null si el formato no matchea.
function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex)
  if (!m) return null
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

// #06b6d4 cyan — color original hardcodeado; actúa de fallback si accentColor
// viene malformado (cero regresión para bots sin accent configurado).
const ACCENT_FALLBACK: [number, number, number] = [6, 182, 212]

export interface ChatWindowProps {
  config: PublicBotConfig
  messages: UIChatMessage[]
  isStreaming: boolean
  avatarState: NeuroAvatarState
  onSendMessage: (text: string) => void
  onClose: () => void
  onQuickReply: (text: string) => void
  /** Full payload for B8.3 — rendered as DegradedBanner with WhatsApp CTA. */
  degradedInfo?: DegradedInfo | null
  renderToolCall?: (toolCall: ToolCallInUIMessage) => React.ReactNode
  muted?: boolean
  onToggleMute?: () => void
}

export function ChatWindow({
  config,
  messages,
  isStreaming,
  avatarState,
  onSendMessage,
  onClose,
  onQuickReply,
  degradedInfo,
  renderToolCall,
  muted,
  onToggleMute,
}: ChatWindowProps) {
  const degraded = !!degradedInfo
  const [ar, ag, ab] = hexToRgb(config.accentColor) ?? ACCENT_FALLBACK
  const secondaryRgb = config.accentSecondary ? hexToRgb(config.accentSecondary) : null
  // Chips: secundario si existe, accent si no — paridad con BotConfigPreview.
  const chipColor = config.accentSecondary ?? config.accentColor
  // ── accentSecondary visual knobs — recalibrar en un toque ──────────────────
  const CHIP_BG_ALPHA = '2E'     // hex ~18% — fondo del chip
  const CHIP_BORDER_ALPHA = '66' // hex ~40% — borde del chip
  const GLOW_OPACITY = 0.14      // halo exterior del panel
  const GLOW_RADIUS = '90px'
  // ───────────────────────────────────────────────────────────────────────────
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fase typewriter del mensaje en curso. `isTyping` lo prende/apaga el propio
  // StreamingMarkdown (1ª letra → true; revelado completo → false), NO el
  // stream del SDK. Así el header dura "Escribiendo…" mientras se REVELA el
  // texto (aunque el stream ya haya terminado) y vuelve a "En línea" al final.
  const [isTyping, setIsTyping] = useState(false)
  const handleTypingStart = useCallback(() => setIsTyping(true), [])
  const handleTypingDone = useCallback(() => setIsTyping(false), [])

  // Fases derivadas:
  //  - PENSANDO: el bot procesa y todavía no se revela texto → indicador inline.
  //  - ESCRIBIENDO: el typewriter revela → header "Escribiendo…".
  // `botBusy` bloquea el input mientras el bot piensa O sigue tipeando.
  const showThinking = isStreaming && !isTyping
  const botBusy = isStreaming || isTyping

  // Auto-scroll que SIGUE el texto que crece, sin pelear con el usuario: si
  // scrolleó hacia arriba para leer, dejamos de pinnear hasta que vuelva al pie.
  const stickRef = useRef(true)
  const handleScroll = useCallback(() => {
    const el = scrollAreaRef.current
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }, [])
  // Pin instantáneo en cada avance del typewriter (el crecimiento de a poco ES
  // la suavidad; un scroll "smooth" por frame pelearía con el siguiente).
  const stickToBottom = useCallback(() => {
    const el = scrollAreaRef.current
    if (el && stickRef.current) el.scrollTop = el.scrollHeight
  }, [])

  // Focus input when chat opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // ── Auto-focus al terminar de responder ───────────────────────────────────
  // Flag "re-enfocar al terminar": TRUE mientras el usuario sigue "en el input"
  // (lo enfocó / envió con Enter), FALSE si salió (blur hacia afuera) o envió con
  // el BOTÓN (que le roba el foco). Al pasar a LISTO (botBusy → false) devolvemos
  // el foco si sigue TRUE, para seguir escribiendo sin click.
  const refocusOnDoneRef = useRef(false)
  const wasBusyRef = useRef(false)
  useEffect(() => {
    if (wasBusyRef.current && !botBusy && refocusOnDoneRef.current) {
      inputRef.current?.focus()
    }
    wasBusyRef.current = botBusy
  }, [botBusy])

  // Scroll suave al aparecer un mensaje nuevo / al entrar en "pensando"
  // (respeta que el usuario no esté leyendo más arriba).
  useEffect(() => {
    if (stickRef.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showThinking])

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !botBusy) {
      // Intención de re-foco al terminar: Enter (requestSubmit → submitter null)
      // SÍ; el BOTÓN de enviar (submitter = el botón) NO, porque le robó el foco.
      refocusOnDoneRef.current = (e.nativeEvent as SubmitEvent).submitter === null
      onSendMessage(input)
      setInput('')
      // Reset del auto-resize: tras vaciar el value, el textarea conserva la
      // altura px del último crecimiento. Volver a 'auto' lo colapsa a una línea
      // (value vacío) en vez de quedar estirado.
      if (inputRef.current) inputRef.current.style.height = 'auto'
    }
  }

  return (
    <>
      <AnimatePresence>
        {true && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              // No `cursor: auto`: the surface inherits `cursor: none` on desktop
              // so the site's custom cursor stays visible over it (see CustomCursor).
              style={{ pointerEvents: 'auto', zIndex: CHATBOT_Z_INDEX.backdrop }}
              aria-hidden="true"
            />

            {/* Chat Window - Glassmorphism 3.0 Boutique */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              data-chatbot-window
              className="fixed bottom-4 left-4 right-4 flex flex-col md:bottom-[6.5rem] md:left-auto md:right-6 md:w-[420px]"
              style={{
                pointerEvents: 'auto',
                // Inherit `cursor: none` on desktop so the custom cursor is kept
                // over the whole panel instead of reverting to the OS pointer.
                zIndex: CHATBOT_Z_INDEX.panel,
                background: buildPanelBackground(config),
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: [
                  '0 0 0 1px rgba(255,255,255,0.04)',
                  '0 32px 80px rgba(0,0,0,0.7)',
                  `0 0 120px rgba(${ar},${ag},${ab},0.08)`,
                  ...(secondaryRgb
                    ? [`0 0 ${GLOW_RADIUS} rgba(${secondaryRgb[0]},${secondaryRgb[1]},${secondaryRgb[2]},${GLOW_OPACITY})`]
                    : []),
                  'inset 0 1px 0 rgba(255,255,255,0.08)',
                  'inset 0 -1px 0 rgba(0,0,0,0.4)',
                ].join(', '),
                borderRadius: '24px',
                overflow: 'hidden',
                // 72dvh: dynamic viewport — the sheet shrinks when the virtual
                // keyboard opens so the textarea + send button stay visible.
                maxHeight: '72dvh',
              }}
              role="dialog"
              aria-label={`Consultor ${config.botName}`}
            >
              {/* Header — uses ChatHeader so the configured avatar shows here too */}
              <ChatHeader
                config={config}
                avatarState={avatarState}
                isStreaming={isStreaming}
                isTyping={isTyping}
                onClose={onClose}
                muted={muted}
                onToggleMute={onToggleMute}
              />

              {/* Messages Area */}
              <div className="chat-messages-area flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:p-6"
                ref={scrollAreaRef}
                onScroll={handleScroll}
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                style={{
                  // Nunca scroll horizontal: el word-wrap de las burbujas evita el
                  // desborde; esto es la red de seguridad por si algo lo fuerza.
                  overflowX: 'hidden',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.12) transparent'
                }}
                role="log"
                aria-live="polite"
              >
                {degradedInfo && <DegradedBanner info={degradedInfo} />}
                <AnimatePresence initial={false}>
                  {/* Offline/degradado con chat vacío: el card de WhatsApp (DegradedBanner,
                      arriba) es el ÚNICO contenido — sin saludo "Sistema listo". El else
                      mapea [] → no renderiza nada. */}
                  {messages.length === 0 && !degraded ? (
                    <div key="__empty__" className="flex h-full flex-col items-center justify-center space-y-4 py-6 text-center opacity-75">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/6"
                        style={{
                          // Cyan hardcodeado → accent del runtime (ar,ag,ab). El stop
                          // púrpura es decorativo fijo (no es el accent del tenant).
                          background: `linear-gradient(to bottom right, rgba(${ar},${ag},${ab},0.10), rgba(168,85,247,0.10))`,
                          boxShadow: `0 0 30px rgba(${ar},${ag},${ab},0.10)`,
                        }}
                      >
                        <Sparkles
                          className="w-6 h-6"
                          strokeWidth={1.5}
                          style={{ color: `rgba(${ar},${ag},${ab},0.8)` }}
                        />
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
                        key={m.id || `msg-${idx}`}
                        data-chatbot-message={m.role}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex min-w-0 flex-col gap-3 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        {m.content && (
                          <div style={{
                            maxWidth: '86%',
                            // Word-wrap: palabra normal larga baja entera; palabra
                            // imposible (sin espacios, más ancha que la burbuja) se
                            // rompe. `min-width:0` deja que el flex se encoja en vez
                            // de empujar el ancho. (overflow-wrap se hereda al texto.)
                            minWidth: 0,
                            overflowWrap: 'break-word',
                            padding: m.role === 'user' ? '11px 15px' : '12px 15px',
                            fontSize: '13px',
                            lineHeight: 1.68,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                            boxShadow: m.role === 'user'
                              ? `0 4px 16px rgba(${ar},${ag},${ab},0.12), 0 2px 8px rgba(0,0,0,0.25)`
                              : '0 2px 12px rgba(0,0,0,0.2)',
                            ...(m.role === 'user' ? {
                              background: `linear-gradient(135deg, rgba(${ar},${ag},${ab},0.18) 0%, rgba(${ar},${ag},${ab},0.08) 100%)`,
                              border: `1px solid rgba(${ar},${ag},${ab},0.28)`,
                              borderRadius: '18px 6px 18px 18px',
                              color: 'rgba(255,255,255,0.94)',
                            } : {
                              background: 'rgba(255,255,255,0.038)',
                              borderTop: '1px solid rgba(255,255,255,0.08)',
                              borderRight: '1px solid rgba(255,255,255,0.08)',
                              borderBottom: '1px solid rgba(255,255,255,0.08)',
                              borderLeft: `2px solid rgba(${ar},${ag},${ab},0.38)`,
                              borderTopLeftRadius: '6px',
                              borderTopRightRadius: '18px',
                              borderBottomRightRadius: '18px',
                              borderBottomLeftRadius: '18px',
                              color: 'rgba(255,255,255,0.88)',
                            })
                          }}>
                            {m.role === 'assistant' ? (
                              <StreamingMarkdown
                                text={m.content}
                                // En stream solo el ÚLTIMO mensaje del asistente;
                                // los demás (e históricos al reabrir el panel) se
                                // muestran completos, sin re-tipear.
                                streaming={isStreaming && idx === messages.length - 1}
                                components={MARKDOWN_COMPONENTS}
                                accentColor={config.accentColor}
                                onTypingStart={handleTypingStart}
                                onTypingDone={handleTypingDone}
                                onRevealTick={stickToBottom}
                              />
                            ) : (
                              <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                                  {m.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Tool Calls Rendering */}
                        {m.toolCalls && m.toolCalls.length > 0 && renderToolCall && (
                          <div className="flex flex-col gap-2 w-full max-w-[90%]">
                            {m.toolCalls.map((tc) => (
                              <div key={tc.toolCallId}>
                                {renderToolCall(tc)}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}

                  {/* Indicador inline "pensando" — SOLO en fase pensando (bot
                      procesa y aún no se revela texto). Al empezar el typewriter
                      (`isTyping`) desaparece; el header toma la posta con
                      "Escribiendo…". */}
                  {showThinking && (
                    <motion.div
                      key="__thinking__"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 14px',
                      }}
                    >
                      {/* Mini avatar coherente con el avatarStyle configurado
                          (no un valor fijo). Pesados → eco liviano sin canvas. */}
                      <ThinkingAvatar config={config} />

                      {/* Dots orgánicos */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: `rgba(${ar},${ag},${ab},${0.5 + i * 0.15})`,
                                boxShadow: `0 0 4px rgba(${ar},${ag},${ab},0.4)`,
                              }}
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 1, 0.4],
                              }}
                              transition={{
                                duration: 1.1,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.18,
                              }}
                            />
                          ))}
                        </div>
                        <span style={{
                          fontSize: '10px',
                          color: `rgba(${ar},${ag},${ab},0.55)`,
                          fontFamily: 'ui-monospace, monospace',
                          letterSpacing: '0.1em',
                        }}>
                          pensando
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Quick replies — nunca en degradado/offline: dispararían sendMessage
                    contra un bot que no puede responder (el único CTA es WhatsApp). */}
                {!degraded && config.quickReplies && config.quickReplies.length > 0 && messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {config.quickReplies.map((qr) => (
                      <button
                        key={qr.label}
                        onClick={() => onQuickReply(qr.promptToSend)}
                        // hover vía brightness: un hover:bg-* perdería contra el
                        // backgroundColor inline (inline > clase, siempre).
                        // color: chipColor sólido — contraste ~5-8:1 sobre el fondo
                        // al ~18% en el panel oscuro; colores muy claros pueden no
                        // cumplir WCAG AA (el admin elige la paleta).
                        className="text-xs px-3 py-1.5 rounded-full border text-left transition-all hover:brightness-125"
                        style={{
                          backgroundColor: `${chipColor}${CHIP_BG_ALPHA}`,
                          borderColor: `${chipColor}${CHIP_BORDER_ALPHA}`,
                          color: chipColor,
                        }}
                      >
                        {qr.emoji && <span className="mr-2">{qr.emoji}</span>}{qr.label}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleFormSubmit}
                style={{ 
                  padding: '14px', 
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.018)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-end',
                  position: 'relative',
                }}
              >
                {/* Wrapper con glow on focus */}
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    position: 'relative',
                    transition: 'border-color 200ms, box-shadow 200ms',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                  }}
                  onFocusCapture={(e) => {
                    e.currentTarget.style.borderColor = `rgba(${ar},${ag},${ab},0.35)`
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${ar},${ag},${ab},0.08), inset 0 1px 0 rgba(255,255,255,0.03)`
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.03)'
                  }}
                >
                  <textarea
                    data-chatbot-input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
                    }}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (input.trim() && !botBusy && !degraded) {
                          const form = e.currentTarget.closest('form')
                          if (form) form.requestSubmit()
                        }
                      }
                    }}
                    onFocus={() => {
                      // El usuario está "en el input" → re-enfocar al terminar.
                      refocusOnDoneRef.current = true
                    }}
                    onBlur={() => {
                      // Salió del input (click afuera, o el botón de enviar le robó
                      // el foco) → NO re-enfocar al terminar.
                      refocusOnDoneRef.current = false
                    }}
                    placeholder={
                      degraded
                        ? 'Continuá la conversación por WhatsApp'
                        : botBusy
                          ? 'Esperá a que termine de responder…'
                          : 'Escribí tu consulta...'
                    }
                    // Mientras responde: readOnly (enfocable pero NO editable) en
                    // vez de disabled, para habilitar el auto-foco al terminar. El
                    // degradado sí queda disabled (estado terminal). El guard de
                    // onKeyDown/handleFormSubmit impide enviar mientras botBusy.
                    readOnly={botBusy}
                    disabled={degraded}
                    rows={1}
                    inputMode="text"
                    autoCapitalize="sentences"
                    autoCorrect="on"
                    spellCheck={true}
                    enterKeyHint="send"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'rgba(255,255,255,0.88)',
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

                  {/* Hint Enter — en flujo normal DEBAJO del texto y alineado a la
                      derecha, para no superponerse nunca con lo que se escribe. */}
                  <AnimatePresence>
                    {input.trim().length > 0 && !botBusy && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '3px',
                          marginTop: '4px',
                          fontSize: '9px',
                          color: 'rgba(255,255,255,0.25)',
                          fontFamily: 'ui-monospace, monospace',
                          pointerEvents: 'none',
                          overflow: 'hidden',
                        }}
                      >
                        <span style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                          padding: '1px 4px',
                          fontSize: '8px',
                        }}>
                          Enter
                        </span>
                        para enviar
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Botón enviar */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  disabled={botBusy || degraded || !input.trim()}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    border: `1px solid rgba(${ar},${ag},${ab},0.2)`,
                    // No inline cursor: falls back to the global `button { cursor: none }`
                    // on desktop so the custom cursor shows (disabled state is conveyed
                    // by the dimmed background, not an OS not-allowed cursor).
                    background: botBusy || degraded || !input.trim()
                      ? 'rgba(255,255,255,0.05)'
                      : `linear-gradient(135deg, rgba(${ar},${ag},${ab},0.85), rgba(${ar},${ag},${ab},0.65))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: botBusy || degraded || !input.trim() ? 'none' : `0 0 16px rgba(${ar},${ag},${ab},0.3), 0 2px 8px rgba(0,0,0,0.3)`,
                    transition: 'all 200ms',
                    color: botBusy || degraded || !input.trim() ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.95)',
                  }}
                  aria-label="Send message"
                >
                  <Send size={15} strokeWidth={2.25} />
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes chatbotCaretBlink {
          0%, 49% { opacity: 0.85; }
          50%, 100% { opacity: 0; }
        }
        /* Placeholder legible sobre el panel oscuro (Firefox baja el opacity por
           defecto → opacity:1). Cuando el input está deshabilitado (bot
           respondiendo / degradado) el placeholder explicativo se mantiene con
           buen contraste y el texto no se atenúa de más. */
        [data-chatbot-input]::placeholder {
          color: rgba(255, 255, 255, 0.45);
          opacity: 1;
        }
        [data-chatbot-input]:disabled {
          -webkit-text-fill-color: rgba(255, 255, 255, 0.6);
          opacity: 1;
        }
        /* Bloqueado mientras responde es :read-only (enfocable, no editable);
           degradado es :disabled. :read-only matchea AMBOS → el placeholder
           explicativo se ve con buen contraste en los dos casos. */
        [data-chatbot-input]:read-only::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        /* Cursor custom del sitio sobre el input (solo desktop, igual que el resto
           del widget): el textarea trae 'cursor: text' del UA y tapaba el cursor
           custom. Se oculta solo el PUNTERO del mouse; el caret de escritura sigue
           visible con normalidad. */
        @media (min-width: 768px) {
          [data-chatbot-input] {
            cursor: none;
          }
        }
      `}</style>
    </>
  )
}
