'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import type { PublicBotConfig } from '../shared/publicConfig'
import { prefetchBotConfig } from '../shared/configCache'
import type { UIChatMessage, ToolCallInUIMessage } from '../components/chat/types'
import type { NeuroAvatarState } from '../components/avatar'
import type { ParsedAttribution } from '../shared/attribution'
import {
  classifyStatus,
  shouldRetry,
  backoffForAttempt,
  type FetchOutcome,
} from '../shared/chatRetryPolicy'
import { trimHistory, HISTORY_WINDOW_MESSAGES } from '../shared/historyPolicy'

/** Narrow a parsed JSON value to an indexable record sin usar `any`. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-placeholder'
  try {
    const existing = window.sessionStorage.getItem('chatbot:sessionId')
    if (existing) return existing
    const fresh = crypto.randomUUID()
    window.sessionStorage.setItem('chatbot:sessionId', fresh)
    return fresh
  } catch {
    return crypto.randomUUID()
  }
}

const FIRST_TOUCH_STORAGE_KEY = 'chatbot:firstTouch'

/** UTM.1 — atribución first-touch ya cacheada en esta sesión de tab, si hay. */
function readCachedFirstTouch(): ParsedAttribution | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(FIRST_TOUCH_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ParsedAttribution) : null
  } catch {
    return null
  }
}

/** UTM.1 — persiste el first-touch UNA sola vez (llamar solo si no hay cache). */
function writeCachedFirstTouch(value: ParsedAttribution): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // sessionStorage deshabilitado (private mode) — igual se manda en este
    // request, solo no sobrevive un remount de esta sesión.
  }
}

export interface UseChatbotOptions {
  slug: string
  currentPath: string
  /**
   * UTM.1 — candidato de atribución first-touch para ESTE mount. `undefined`
   * = todavía no resuelto (caso embed: espera el handshake postMessage del
   * padre — ver ChatbotEmbed.tsx). Un valor resuelto — incluso uno todo-null
   * (tráfico directo) — es lo que puede cachearse como first-touch si todavía
   * no hay nada guardado.
   */
  attribution?: ParsedAttribution
}

// Estados degradados que el widget muestra en lugar de un error técnico crudo.
//
//  - quota_exhausted / domain_overflow: vienen del payload de /chat
//    (handleChatRequest.ts). Reactivos a cada request; derivan a WhatsApp.
//  - bot_paused: viene del /config cuando `BotConfig.isActive = false`
//    (B8.3). Persistente — al reabrir el panel sigue mostrándose, hasta
//    que el cliente recargue la página o el admin reactive el bot. Deriva a WhatsApp.
//  - connection_failed: INFRA.2 — el POST a /chat falló de forma transitoria (red /
//    timeout / 5xx) y el widget AGOTÓ sus reintentos (ver chatRetryPolicy). NO es un
//    handoff a WhatsApp: es un estado honesto "probá de nuevo" con el input HABILITADO
//    para reintentar a mano (no bloquea el input — ver inputLockedByDegrade). El
//    reintento server-side es idempotente, así que reenviar no duplica el turno.
//    Supersede al viejo `provider_error` (que degradaba a WhatsApp al primer fallo).
//  - conversation_limit: C0.2 — la conversación llegó al hard-cap server-side
//    (HARD_CAP_MESSAGES en historyPolicy). Terminal para ESTA conversación;
//    deriva a WhatsApp si el bot lo tiene configurado.
//  - rate_limited: BLOQUE VOZ — 429 del POST a /chat. El 429 de sesión
//    (handleChatRequest) trae un mensaje escrito para el visitante en JSON y
//    ese se muestra; el de origen+IP (route.ts) es texto plano y cae al canned
//    local (mismo texto — misma situación para el visitante). Transitorio:
//    input habilitado, reintenta en un rato.
//  - chat_unavailable: BLOQUE VOZ — 400/403/404 del POST a /chat (body
//    inválido, origin bloqueado, bot inexistente o pausado a mitad de sesión).
//    Antes estos caminos terminaban en status:'error' del SDK sin UI (caminos
//    1 y 2 del mapa de MUDEZ): el visitante no veía NADA.
//  - stream_interrupted: BLOQUE VOZ — frame de error DENTRO del stream (fila
//    12 del mapa: NoOutputGeneratedError, Vertex muerto a mitad de respuesta).
//    Banner honesto "se cortó"; el texto parcial ya renderizado queda.
export type DegradedReason =
  | 'quota_exhausted'
  | 'domain_overflow'
  | 'conversation_limit'
  | 'bot_paused'
  | 'connection_failed'
  | 'rate_limited'
  | 'chat_unavailable'
  | 'stream_interrupted'

export interface DegradedInfo {
  reason: DegradedReason
  message: string
  whatsappNumber: string | null
  whatsappMessage: string | null
  companyName: string | null
}

const CONNECTION_ERROR_MESSAGE = 'No pudimos conectar. Probá de nuevo en un momento.'

// BLOQUE VOZ — canned locales de los caminos que el widget descartaba. Regla
// dura: JAMÁS se rendea el body/error.message crudo del wire (son técnicos y
// en inglés — "Invalid request body", "An error occurred."). Allowlist: el
// ÚNICO texto del server que se muestra es el `error` del 429 JSON de sesión,
// que está escrito para el visitante (handleChatRequest.ts).
//
// RATE_LIMITED_MESSAGE es espejo deliberado de ese texto del server: cubre el
// 429 por origen+IP (route.ts), que responde texto plano sin JSON — para el
// visitante es la misma situación, así que es el mismo mensaje.
const RATE_LIMITED_MESSAGE = 'Demasiadas consultas seguidas. Probá en un minuto.'
const CHAT_UNAVAILABLE_MESSAGE = 'El chat no está disponible en este momento.'
const STREAM_INTERRUPTED_MESSAGE = 'Se cortó la respuesta.'

// BLOQUE VOZ — degradados que NO bloquean el input (mismo trato que
// connection_failed: son transitorios o re-intentables a mano; el resto —
// cuota/dominio/tope/pausa— es terminal y su único CTA es WhatsApp).
// Constante pura a nivel de módulo (sin estado — la regla es sobre estado).
const NON_LOCKING_DEGRADES: ReadonlySet<DegradedReason> = new Set([
  'connection_failed',
  'rate_limited',
  'chat_unavailable',
  'stream_interrupted',
])

export interface UseChatbotReturn {
  config: PublicBotConfig | null
  isLoading: boolean
  /** RE-2 — true si `/config` no pudo cargar tras agotar los reintentos automáticos. */
  configError: boolean
  /** RE-2 — redispara el fetch de `/config` desde cero (reintento manual). */
  retryLoadConfig: () => void
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  messages: UIChatMessage[]
  /**
   * True when at least one REAL message exists in the current session
   * (proactive-* teaser bubbles don't count). In-memory only — resets on reload.
   * Drives the teaser↔retomar gate and the launcher badge.
   */
  hasConversation: boolean
  isStreaming: boolean
  avatarState: NeuroAvatarState
  degradedMode: boolean
  degradedInfo: DegradedInfo | null
  /** INFRA.2 — true mientras se reintenta el POST a /chat (cold-start). Estado soft del header. */
  reconnecting: boolean
  /** INFRA.2 — true si el degradado actual BLOQUEA el input (todos menos connection_failed). */
  inputLockedByDegrade: boolean
  sendMessage: (text: string) => void
  acceptProactivePrompt: (prompt: string) => void
  triggerWhatsappHandoff: () => void
  triggerCallbackHandoff: () => void
  navigateTo: (path: string) => void
}

export function useChatbot({ slug, currentPath, attribution }: UseChatbotOptions): UseChatbotReturn {
  const [config, setConfig] = useState<PublicBotConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // RE-2 — true si /config agotó los reintentos automáticos sin éxito (estado
  // terminal, distinto de "todavía cargando"). `configLoadAttempt` es un contador
  // de invalidación puro: bumpearlo re-ejecuta el efecto de carga de abajo sin
  // que el efecto necesite leer su valor.
  const [configError, setConfigError] = useState(false)
  const [configLoadAttempt, setConfigLoadAttempt] = useState(0)
  // El reset a "cargando" vive en este handler (evento de click), no en el
  // cuerpo del efecto de abajo — un setState síncrono al inicio de un efecto
  // dispara cascading renders innecesarios (react-hooks/set-state-in-effect);
  // acá es la reacción directa a la acción del usuario.
  const retryLoadConfig = useCallback(() => {
    setIsLoading(true)
    setConfigError(false)
    setConfigLoadAttempt((n) => n + 1)
  }, [])
  const [isOpen, setIsOpen] = useState(false)
  const [degradedInfo, setDegradedInfo] = useState<DegradedInfo | null>(null)
  // INFRA.2 — true mientras el widget reintenta un POST a /chat tras un fallo
  // transitorio (cold-start de Neon). Enriquece el header ("Conectando…") sin
  // bloquear nada extra: el input ya queda deshabilitado porque el SDK sigue en
  // 'submitted' mientras el transport await-ea el retry.
  const [reconnecting, setReconnecting] = useState(false)
  const sessionIdRef = useRef<string>(getOrCreateSessionId())
  // UTM.1 — first-touch resuelto (de cache o del `attribution` candidato).
  // null = todavía no resuelto. Ver readCachedFirstTouch/writeCachedFirstTouch
  // arriba: se cachea UNA sola vez, nunca se pisa dentro de esta sesión de tab.
  const firstTouchRef = useRef<ParsedAttribution | null>(null)
  useEffect(() => {
    if (firstTouchRef.current !== null) return
    const cached = readCachedFirstTouch()
    if (cached) {
      firstTouchRef.current = cached
      return
    }
    if (attribution) {
      firstTouchRef.current = attribution
      writeCachedFirstTouch(attribution)
    }
  }, [attribution])
  // Proactive teaser opener: the question text the bot "asked" via the tooltip.
  // Sent to the backend with the visitor's FIRST reply only (then cleared), so
  // the model gets the context once without re-applying it to every later turn.
  const proactiveOpenerRef = useRef<string | null>(null)
  // Id of the UI-only bubble injected by `acceptProactivePrompt`. Tracked so we
  // can strip exactly THAT bubble if the visitor closes without replying — never
  // an older proactive bubble that was already answered (legitimate history).
  const proactiveBubbleIdRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // Reuse the config warmed by ChatWidgetMount during the intro (shared cache,
    // dedup'd by slug) so the launcher isn't blocked on a cold fetch at reveal.
    // RE-2 — prefetchBotConfig ya reintenta internamente (chatRetryPolicy) y solo
    // cachea éxitos: `data === null` acá significa "reintentos agotados", no
    // "todavía sin resolver". `configLoadAttempt` en las deps re-dispara este
    // efecto desde `retryLoadConfig` (que ya puso isLoading/configError en el
    // estado "cargando" ANTES de bumpear el contador — ver el handler arriba).
    prefetchBotConfig(slug)
      .then((data) => {
        if (cancelled) return
        setConfig(data)
        setConfigError(data === null)
        // B8.3 — bot pausado llega vía config.paused (en lugar del viejo 404
        // silencioso). Lo proyectamos al mismo carril de `degradedInfo` que
        // los degradados de /chat para que ChatWindow/ChatbotEmbed lo rendericen
        // con DegradedBanner sin lógica especial.
        if (data?.paused) {
          setDegradedInfo({
            reason: 'bot_paused',
            message: data.paused.message,
            whatsappNumber: data.paused.whatsappNumber,
            whatsappMessage: data.paused.whatsappMessage,
            companyName: data.paused.companyName,
          })
        }
        setIsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setConfigError(true)
        setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, configLoadAttempt])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/chatbot/${slug}/chat`,
        fetch: async (input, init) => {
          // INFRA.2 — Reintento acotado para el cold-start de Neon (branch free): un
          // fallo transitorio (red / timeout / 5xx) suele ser la DB dormida, y el 2º
          // request pega contra la DB ya despierta. Reintentamos hasta agotar el
          // presupuesto (chatRetryPolicy) con backoff; SOLO transitorios, NUNCA 4xx.
          // La idempotencia server-side del user message garantiza que el reintento no
          // duplique el turno. Al agotar, degradamos a un estado honesto "probá de
          // nuevo" (connection_failed) con el input habilitado para reintentar a mano.
          // `fetch` resuelve al llegar los HEADERS (antes del 1er byte), así que este
          // wrapper solo captura fallos pre-primer-byte — justo el caso cold-start; una
          // caída mid-stream queda enmascarada como 200 (INFRA.1/INFRA.3), no acá.
          const buildConnectionErrorStream = (): Response => {
            setDegradedInfo({
              reason: 'connection_failed',
              message: CONNECTION_ERROR_MESSAGE,
              whatsappNumber: null,
              whatsappMessage: null,
              companyName: null,
            })
            return new Response('', {
              status: 200,
              headers: { 'content-type': 'text/event-stream' },
            })
          }
          const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

          let attemptsMade = 0
          for (;;) {
            attemptsMade += 1
            let response: Response | null = null
            let outcome: FetchOutcome
            try {
              response = await fetch(input, init)
              outcome = classifyStatus(response.status, response.headers.get('retry-after'))
            } catch {
              outcome = { kind: 'network-error' }
            }

            // Éxito (2xx). Incluye el 200 con JSON `mode:'degraded'` del backend (cuota /
            // dominio): ese payload arma el handoff a WhatsApp, igual que antes.
            if (outcome.kind === 'success' && response) {
              setReconnecting(false)
              // Clone so we can read body without consuming for the SDK
              if (response.headers.get('content-type')?.includes('application/json')) {
                try {
                  const cloned = response.clone()
                  const data: unknown = await cloned.json()
                  if (isRecord(data) && data.mode === 'degraded') {
                    // MS-2: capturamos el payload completo del backend (B4.5) para armar
                    // el handoff a WhatsApp con la info real del bot. Campos faltantes →
                    // null sin romper.
                    const reason: DegradedReason =
                      data.reason === 'domain_overflow'
                        ? 'domain_overflow'
                        : data.reason === 'conversation_limit'
                          ? 'conversation_limit'
                          : 'quota_exhausted'
                    setDegradedInfo({
                      reason,
                      message: typeof data.message === 'string' ? data.message : '',
                      whatsappNumber:
                        typeof data.whatsappNumber === 'string' && data.whatsappNumber.length > 0
                          ? data.whatsappNumber
                          : null,
                      whatsappMessage:
                        typeof data.whatsappMessage === 'string' && data.whatsappMessage.length > 0
                          ? data.whatsappMessage
                          : null,
                      companyName:
                        typeof data.companyName === 'string' && data.companyName.length > 0
                          ? data.companyName
                          : null,
                    })
                    // Return an empty stream so the SDK doesn't error
                    return new Response('', {
                      status: 200,
                      headers: { 'content-type': 'text/event-stream' },
                    })
                  }
                } catch {
                  // Not JSON, pass through
                }
              }
              return response
            }

            // 4xx (incl. 429): NUNCA reintentar (se respeta el Retry-After por NO
            // martillar, no como retry ciego).
            //
            // BLOQUE VOZ — antes el response pasaba tal cual al SDK, cuyo transport
            // hace `throw new Error(await response.text())` → status:'error' que
            // este hook descartaba: el visitante no veía NADA (caminos 1 y 2 del
            // mapa de MUDEZ). El error se resuelve ACÁ, donde el status HTTP existe
            // (el Error del SDK no lo trae), con el mismo patrón del resto del
            // wrapper: degradedInfo + stream vacío 200 para que el SDK no erre.
            //
            // Allowlist del copy: SOLO el `error` del 429 JSON de sesión se muestra
            // (está escrito para el visitante); cualquier otro body (JSON técnico,
            // texto plano, HTML de un proxy) cae al canned local. Jamás el body crudo.
            if (outcome.kind === 'client-error' && response) {
              setReconnecting(false)
              let message = CHAT_UNAVAILABLE_MESSAGE
              if (outcome.status === 429) {
                message = RATE_LIMITED_MESSAGE
                try {
                  const data: unknown = await response.json()
                  if (isRecord(data) && typeof data.error === 'string' && data.error.length > 0) {
                    // Cota defensiva: el mensaje real del server mide ~45 chars;
                    // nada legítimo se acerca al tope.
                    message = data.error.slice(0, 200)
                  }
                } catch {
                  // Texto plano (rate-limit por origen+IP de route.ts) → canned local.
                }
              }
              setDegradedInfo({
                reason: outcome.status === 429 ? 'rate_limited' : 'chat_unavailable',
                message,
                whatsappNumber: null,
                whatsappMessage: null,
                companyName: null,
              })
              return new Response('', {
                status: 200,
                headers: { 'content-type': 'text/event-stream' },
              })
            }

            // Transitorio (red / 5xx) con presupuesto → reintentar con backoff. El
            // intento fallido igual dejó su rastro en el sink off-Neon (INFRA.1); el
            // reintento es un POST adicional y no oculta esa telemetría.
            if (shouldRetry(outcome, attemptsMade)) {
              setReconnecting(true)
              await sleep(backoffForAttempt(attemptsMade))
              continue
            }

            // Agotado → estado honesto "probá de nuevo".
            setReconnecting(false)
            return buildConnectionErrorStream()
          }
        },
        prepareSendMessagesRequest: ({ messages: msgs, body }) => {
          // The proactive teaser bubble is UI-only — it must NEVER be sent as a
          // turn (keeps the array user-led, which Gemini/Vertex requires). Its
          // context reaches the model via `proactiveOpener` on the FIRST reply
          // only; read-and-clear here so later turns don't re-apply it.
          const opener = proactiveOpenerRef.current
          proactiveOpenerRef.current = null
          const ft = firstTouchRef.current
          return {
            body: {
              ...body,
              // C0.2 — ventana deslizante: se mandan solo los últimos
              // HISTORY_WINDOW_MESSAGES, no todo el historial acumulado (el
              // costo por turno crecía lineal y al mensaje 51 el server
              // rechazaba). trimHistory preserva SIEMPRE el último 'user' (el
              // turno en curso) y mantiene el array user-led. Cubre AMBOS
              // renders (on-site y embed): los dos mandan por este transport.
              messages: trimHistory(
                msgs
                  .filter((m) => !m.id.startsWith('proactive-'))
                  .map((m) => ({
                    role: m.role,
                    content: m.parts.map((p) => (p.type === 'text' ? p.text : '')).join(''),
                  })),
                HISTORY_WINDOW_MESSAGES,
              ),
              sessionId: sessionIdRef.current,
              currentPath,
              ...(opener ? { proactiveOpener: opener } : {}),
              // UTM.1 — se manda en cada turno; el servidor solo actúa sobre
              // esto al crear la conversación (mismo trato que currentPath/
              // referrer hoy), así que re-enviarlo en turnos posteriores es
              // inofensivo.
              ...(ft?.referrer ? { referrer: ft.referrer } : {}),
              ...(ft?.utmSource ? { utmSource: ft.utmSource } : {}),
              ...(ft?.utmMedium ? { utmMedium: ft.utmMedium } : {}),
              ...(ft?.utmCampaign ? { utmCampaign: ft.utmCampaign } : {}),
            },
          }
        },
      }),
    [slug, currentPath]
  )

  const { messages: sdkMessages, sendMessage: sdkSendMessage, setMessages, status } = useChat({
    transport,
    // BLOQUE VOZ — fila 12 del mapa de MUDEZ: un frame de error DENTRO del
    // stream (NoOutputGeneratedError, Vertex muerto a mitad de respuesta)
    // termina en status:'error', que este hook no rendea → el visitante no
    // veía NADA. Banner honesto "se cortó" con el input libre para reintentar.
    // El error.message NUNCA se muestra (allowlist): viene del wire con
    // textos técnicos en inglés ("An error occurred."). El texto parcial ya
    // streameado queda en messages — el SDK lo commiteó antes del error.
    // `bot_paused` no se pisa (persistente, viene del config — mismo guard
    // que sendMessage/close).
    onError: () => {
      setDegradedInfo((prev) =>
        prev?.reason === 'bot_paused'
          ? prev
          : {
              reason: 'stream_interrupted',
              message: STREAM_INTERRUPTED_MESSAGE,
              whatsappNumber: null,
              whatsappMessage: null,
              companyName: null,
            },
      )
    },
  })

  // B3.7 — pendingSubmit hace que el estado "Pensando" reaccione en el mismo
  // frame en que el usuario presiona Enter, sin esperar al microtick del SDK
  // ni al primer byte HTTP. El SDK toma el control en el siguiente render y
  // el flag se limpia. Decisión de B1.3: la única palanca de "velocidad" real
  // es la PERCEPCIÓN — Vertex TTFB son ~2.3s y no se mueve.
  const [pendingSubmit, setPendingSubmit] = useState(false)

  useEffect(() => {
    // En cuanto el SDK pasa a cualquier estado activo (o vuelve a ready/error)
    // el flag optimista deja de ser necesario — `isStreaming` derived ya cubre.
    if (status === 'submitted' || status === 'streaming' || status === 'error' || status === 'ready') {
      setPendingSubmit(false)
    }
  }, [status])

  const isStreaming = pendingSubmit || status === 'streaming' || status === 'submitted'

  const messages: UIChatMessage[] = useMemo(() => {
    return sdkMessages.map((m) => {
      const textParts: string[] = []
      const toolCalls: ToolCallInUIMessage[] = []
      for (const part of m.parts) {
        if (part.type === 'text') textParts.push(part.text)
        else if (part.type && part.type.startsWith('tool-')) {
          const anyPart = part as unknown as {
            toolCallId: string
            toolName?: string
            type: string
            input?: unknown
          }
          toolCalls.push({
            toolCallId: anyPart.toolCallId,
            toolName: anyPart.toolName ?? anyPart.type.replace(/^tool-/, ''),
            input: anyPart.input,
          })
        }
      }
      return {
        id: m.id,
        role: m.role === 'user' ? 'user' : 'assistant',
        content: textParts.join(''),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      }
    })
  }, [sdkMessages])

  const avatarState: NeuroAvatarState = useMemo(() => {
    if (pendingSubmit || status === 'submitted') return 'thinking'
    if (status === 'streaming') return 'speaking'
    return 'idle'
  }, [status, pendingSubmit])

  const sendMessage = useCallback(
    (text: string) => {
      // INFRA.2 — al reenviar tras un connection_failed (input habilitado para
      // reintentar a mano), limpiar el degrade reactivo para que el nuevo intento
      // arranque limpio. `bot_paused` es persistente (viene del config) y NO se limpia.
      setDegradedInfo((prev) => (prev?.reason === 'bot_paused' ? prev : null))
      // Setear el flag ANTES de delegar al SDK garantiza que "Pensando" /
      // avatar thinking aparezcan en el mismo frame del Enter — sin gap.
      setPendingSubmit(true)
      sdkSendMessage({ text })
    },
    [sdkSendMessage]
  )

  const acceptProactivePrompt = useCallback(
    (prompt: string) => {
      // The teaser is a question the BOT asked, not the visitor. Open the panel
      // and inject it as a UI-only assistant bubble (id `proactive-*`, filtered
      // out of the outgoing request by the transport). Remember it as the opener
      // so the visitor's first reply carries the context to the model via the
      // system prompt — without ever sending the bubble as a real turn.
      const bubbleId = `proactive-${crypto.randomUUID()}`
      proactiveOpenerRef.current = prompt
      proactiveBubbleIdRef.current = bubbleId
      setIsOpen(true)
      setMessages((prev) => [
        ...prev,
        {
          id: bubbleId,
          role: 'assistant',
          parts: [{ type: 'text', text: prompt }],
        } satisfies UIMessage,
      ])
    },
    [setMessages]
  )

  const triggerWhatsappHandoff = useCallback(() => {
    if (!config?.whatsappNumber) return
    sendMessage('quiero seguir por whatsapp')
  }, [config?.whatsappNumber, sendMessage])

  const triggerCallbackHandoff = useCallback(() => {
    sendMessage('prefiero que me contacten ustedes')
  }, [sendMessage])

  const navigateTo = useCallback((path: string) => {
    if (typeof window === 'undefined') return
    window.location.href = path
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  // Cierre del panel: limpiamos los degradados *reactivos* (los que vienen
  // por /chat — cuota, dominio, error de proveedor) para que la próxima
  // apertura no muestre el cartel viejo si el server ya volvió a la normalidad.
  // `bot_paused` NO se limpia: es estado persistente del config; sigue válido
  // hasta que el cliente recargue la página o el admin reactive el bot.
  const close = useCallback(() => {
    setIsOpen(false)
    // If the visitor accepted a teaser but closed WITHOUT replying, the opener is
    // still pending (a real reply read-and-clears it in the transport). In that
    // case strip the UI-only bubble we injected so unanswered questions don't pile
    // up across re-opens. Remove ONLY that bubble — an older proactive bubble that
    // was answered is legitimate history and must stay.
    if (proactiveOpenerRef.current !== null && proactiveBubbleIdRef.current !== null) {
      const staleId = proactiveBubbleIdRef.current
      setMessages((prev) => prev.filter((m) => m.id !== staleId))
    }
    // Drop a pending proactive opener if the visitor closes without replying —
    // it must not later attach to an unrelated message.
    proactiveOpenerRef.current = null
    proactiveBubbleIdRef.current = null
    setDegradedInfo((prev) => (prev?.reason === 'bot_paused' ? prev : null))
  }, [setMessages])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  // `degradedMode` se deriva de `degradedInfo` para que cualquier consumer
  // viejo siga funcionando, mientras el flujo nuevo (B4.5/MS-2) usa el payload
  // entero para armar el handoff a WhatsApp.
  const degradedMode = degradedInfo !== null

  // INFRA.2 — Cuáles degradados BLOQUEAN el input. connection_failed NO bloquea:
  // es "probá de nuevo", el visitante reintenta a mano. Los demás (cuota, dominio,
  // bot pausado) son terminales → input deshabilitado (el único CTA es WhatsApp).
  // BLOQUE VOZ — los reasons nuevos (rate_limited / chat_unavailable /
  // stream_interrupted) tampoco bloquean: ver NON_LOCKING_DEGRADES arriba.
  const inputLockedByDegrade =
    degradedInfo !== null && !NON_LOCKING_DEGRADES.has(degradedInfo.reason)

  // "Conversación activa" = al menos un mensaje REAL en la sesión actual (en
  // memoria, se reinicia al recargar). Las burbujas proactive-* son el teaser
  // efímero y NO cuentan (si contaran, el teaser se auto-bloquearía).
  const hasConversation = messages.some((m) => !m.id.startsWith('proactive-'))

  return {
    config, isLoading, configError, retryLoadConfig, isOpen, open, close, toggle,
    messages, hasConversation, isStreaming, avatarState, degradedMode, degradedInfo,
    reconnecting, inputLockedByDegrade,
    sendMessage, acceptProactivePrompt,
    triggerWhatsappHandoff, triggerCallbackHandoff, navigateTo,
  }
}
