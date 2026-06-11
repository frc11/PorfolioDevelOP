'use client'

import { memo, useEffect, useRef, useState } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useReducedMotion } from 'motion/react'
import { revealSafeMarkdown } from './revealSafeMarkdown'

// ── Calibración del typewriter (a ojo) ──────────────────────────────────────
// El revelado va DESACOPLADO del stream: el texto de Gemini se acumula en `text`
// (el buffer completo conocido hasta ahora) y se revela carácter por carácter a
// velocidad controlada. Nunca hay "teletransporte": aunque el stream ya haya
// entregado todo el texto, el typewriter sigue revelando hasta completar.
//
// La velocidad por carácter se ADAPTA a la longitud para que el tiempo total se
// acerque al objetivo (mensaje largo → más rápido por letra, pero TODAS las
// letras se muestran), acotada entre un piso y un techo.
const TYPEWRITER_TARGET_MS = 1100 // tiempo objetivo para revelar un mensaje entero
const TYPEWRITER_MIN_CPS = 45 // piso (chars/seg): mensajes cortos no se arrastran
const TYPEWRITER_MAX_CPS = 230 // techo (chars/seg): mensajes largos no se vuelven dump

interface StreamingMarkdownProps {
  /** Texto acumulado del mensaje (buffer completo conocido hasta ahora). */
  text: string
  /** True mientras el stream del SDK sigue produciendo ESTE mensaje. */
  streaming: boolean
  /** Componentes de ReactMarkdown (estables — definidos a nivel módulo). */
  components: Components
  /** Color de acento del bot — para el cursor de tipeo. */
  accentColor: string
  /** Se dispara UNA vez al revelar el primer carácter (entra fase ESCRIBIENDO). */
  onTypingStart?: () => void
  /** Se dispara UNA vez al completar el revelado (entra fase LISTO). */
  onTypingDone?: () => void
  /** Se dispara en cada avance del revelado (para el auto-scroll suave). */
  onRevealTick?: () => void
}

function StreamingMarkdownImpl({
  text,
  streaming,
  components,
  accentColor,
  onTypingStart,
  onTypingDone,
  onRevealTick,
}: StreamingMarkdownProps) {
  const reduced = useReducedMotion() ?? false

  // ¿Este mensaje debe animarse? Se decide UNA vez al montar: solo el mensaje
  // que está en stream en ese momento. Los históricos (al reabrir el panel)
  // montan con streaming=false → se muestran completos, sin re-tipear.
  const [animate] = useState(() => streaming)

  // Caracteres revelados. Este state dispara el re-render SOLO de este bubble
  // (no del historial completo) en cada frame del typewriter.
  const [revealed, setRevealed] = useState(() => (streaming ? 0 : text.length))

  // Espejos para leer el último valor dentro del loop de rAF sin reiniciarlo.
  const textRef = useRef(text)
  const streamingRef = useRef(streaming)
  useEffect(() => {
    textRef.current = text
    streamingRef.current = streaming
  })

  const revealedRef = useRef(revealed)
  const accRef = useRef(0)
  const lastTsRef = useRef<number | null>(null)
  const startedRef = useRef(false)
  const doneRef = useRef(false)

  // Loop de revelado (modo animado, sin reduced-motion). Lee text/streaming via
  // refs para no reiniciarse en cada chunk; corre hasta revelar TODO el buffer
  // y, recién cuando el stream terminó, dispara `onTypingDone`.
  useEffect(() => {
    if (!animate || reduced) return
    let raf = 0
    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts
      const dt = ts - lastTsRef.current
      lastTsRef.current = ts

      const full = textRef.current.length
      const cps = Math.min(
        TYPEWRITER_MAX_CPS,
        Math.max(TYPEWRITER_MIN_CPS, full / (TYPEWRITER_TARGET_MS / 1000)),
      )
      accRef.current += (cps * dt) / 1000
      if (accRef.current >= 1) {
        const add = Math.floor(accRef.current)
        accRef.current -= add
        const next = Math.min(full, revealedRef.current + add)
        if (next !== revealedRef.current) {
          revealedRef.current = next
          if (!startedRef.current && next > 0) {
            startedRef.current = true
            onTypingStart?.()
          }
          setRevealed(next)
          onRevealTick?.()
        }
      }

      const caughtUp = revealedRef.current >= textRef.current.length
      if (caughtUp && !streamingRef.current) {
        // Buffer completo Y stream terminado → revelado completo.
        if (!doneRef.current) {
          doneRef.current = true
          onTypingDone?.()
        }
        lastTsRef.current = null
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      lastTsRef.current = null
    }
  }, [animate, reduced, onTypingStart, onTypingDone, onRevealTick])

  // Reduced-motion: sin animación de tipeo (el texto se muestra completo, ver
  // `revealedCount` abajo). Las FASES de estado igual cambian: disparamos las
  // transiciones para que el header pase por escribiendo → en línea.
  useEffect(() => {
    if (!animate || !reduced) return
    if (text.length > 0 && !startedRef.current) {
      startedRef.current = true
      onTypingStart?.()
    }
    if (!streaming && !doneRef.current) {
      doneRef.current = true
      onTypingDone?.()
    }
  }, [animate, reduced, streaming, text, onTypingStart, onTypingDone])

  const full = text.length
  const revealedCount = reduced ? full : revealed
  // "settled" = nada más por venir: render del texto crudo COMPLETO (markdown ya
  // cerrado). Mientras no, revelamos un prefijo balanceado (sin sintaxis cruda).
  const settled = !streaming && revealedCount >= full
  const body = settled ? text : revealSafeMarkdown(text.slice(0, revealedCount))
  const showCaret = animate && !reduced && (revealed < full || streaming)

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown components={components}>{body}</ReactMarkdown>
      {showCaret && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '6px',
            height: '14px',
            marginLeft: '4px',
            verticalAlign: 'middle',
            background: accentColor,
            opacity: 0.8,
            animation: 'chatbotCaretBlink 1s steps(1, end) infinite',
          }}
        />
      )}
    </div>
  )
}

export const StreamingMarkdown = memo(StreamingMarkdownImpl)
