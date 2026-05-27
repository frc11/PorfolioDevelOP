'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { PublicBotConfig } from '../shared/publicConfig'
import type { UIChatMessage, ToolCallInUIMessage } from '../components/chat/types'
import type { NeuroAvatarState } from '../components/avatar'

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

export interface UseChatbotOptions {
  slug: string
  currentPath: string
}

// Estados degradados que el widget muestra como derivación digna a WhatsApp.
//
//  - quota_exhausted / domain_overflow: vienen del payload de /chat
//    (handleChatRequest.ts:83-101). Reactivos a cada request.
//  - bot_paused: viene del /config cuando `BotConfig.isActive = false`
//    (B8.3). Persistente — al reabrir el panel sigue mostrándose, hasta
//    que el cliente recargue la página o el admin reactive el bot.
//  - provider_error: el SDK de chat falló (5xx, red, Vertex caído). El
//    widget NO debe quedar mostrando un error técnico — degrada a la
//    misma tarjeta de WhatsApp usando el contacto del config ya cargado.
export type DegradedReason =
  | 'quota_exhausted'
  | 'domain_overflow'
  | 'bot_paused'
  | 'provider_error'

export interface DegradedInfo {
  reason: DegradedReason
  message: string
  whatsappNumber: string | null
  whatsappMessage: string | null
  companyName: string | null
}

const PROVIDER_ERROR_MESSAGE =
  'Estamos teniendo una dificultad técnica para responder en este momento. Seguí la conversación por WhatsApp y te contestamos enseguida.'

export interface UseChatbotReturn {
  config: PublicBotConfig | null
  isLoading: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  messages: UIChatMessage[]
  isStreaming: boolean
  avatarState: NeuroAvatarState
  degradedMode: boolean
  degradedInfo: DegradedInfo | null
  sendMessage: (text: string) => void
  acceptProactivePrompt: (prompt: string) => void
  triggerWhatsappHandoff: () => void
  triggerCallbackHandoff: () => void
  navigateTo: (path: string) => void
}

export function useChatbot({ slug, currentPath }: UseChatbotOptions): UseChatbotReturn {
  const [config, setConfig] = useState<PublicBotConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [degradedInfo, setDegradedInfo] = useState<DegradedInfo | null>(null)
  const sessionIdRef = useRef<string>(getOrCreateSessionId())
  // Mirror of `config` for use inside the transport's `fetch` (whose closure
  // is created once and would otherwise capture a stale `null` config).
  const configRef = useRef<PublicBotConfig | null>(null)
  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/chatbot/${slug}/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PublicBotConfig | null) => {
        if (cancelled) return
        setConfig(data)
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
        setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/chatbot/${slug}/chat`,
        fetch: async (input, init) => {
          // B8.3 — provider_error: cualquier 5xx o falla de red del endpoint
          // de chat se reescribe a una respuesta degradada con CTA WhatsApp,
          // usando el contacto del config que ya cargamos. El visitante NUNCA
          // ve un error técnico (modo "cero-Vertex": si Vertex/Gemini cae,
          // esto cubre la UX sin un kill switch dedicado).
          const buildProviderErrorStream = (): Response => {
            const cfg = configRef.current
            setDegradedInfo({
              reason: 'provider_error',
              message: PROVIDER_ERROR_MESSAGE,
              whatsappNumber: cfg?.whatsappNumber ?? null,
              whatsappMessage: null,
              companyName: null,
            })
            return new Response('', {
              status: 200,
              headers: { 'content-type': 'text/event-stream' },
            })
          }

          let response: Response
          try {
            response = await fetch(input, init)
          } catch {
            return buildProviderErrorStream()
          }
          if (response.status >= 500) {
            return buildProviderErrorStream()
          }
          // Clone so we can read body without consuming for the SDK
          if (response.headers.get('content-type')?.includes('application/json')) {
            try {
              const cloned = response.clone()
              const data = await cloned.json()
              if (data?.mode === 'degraded') {
                // MS-2: capturamos el payload completo del backend (B4.5) para
                // que el widget pueda armar el handoff a WhatsApp con la info
                // real del bot (número, mensaje pre-armado, nombre de la org).
                // Si algún campo no viene, normalizamos a null sin romper.
                const reason: DegradedReason =
                  data.reason === 'domain_overflow' ? 'domain_overflow' : 'quota_exhausted'
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
        },
        prepareSendMessagesRequest: ({ messages: msgs, body }) => ({
          body: {
            ...body,
            messages: msgs.map((m) => ({
              role: m.role,
              content: m.parts.map((p) => (p.type === 'text' ? p.text : '')).join(''),
            })),
            sessionId: sessionIdRef.current,
            currentPath,
          },
        }),
      }),
    [slug, currentPath]
  )

  const { messages: sdkMessages, sendMessage: sdkSendMessage, status } = useChat({ transport })

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
      // Setear el flag ANTES de delegar al SDK garantiza que "Pensando" /
      // avatar thinking aparezcan en el mismo frame del Enter — sin gap.
      setPendingSubmit(true)
      sdkSendMessage({ text })
    },
    [sdkSendMessage]
  )

  const acceptProactivePrompt = useCallback(
    (prompt: string) => {
      setIsOpen(true)
      setTimeout(() => sendMessage(prompt), 50)
    },
    [sendMessage]
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
    setDegradedInfo((prev) => (prev?.reason === 'bot_paused' ? prev : null))
  }, [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  // `degradedMode` se deriva de `degradedInfo` para que cualquier consumer
  // viejo siga funcionando, mientras el flujo nuevo (B4.5/MS-2) usa el payload
  // entero para armar el handoff a WhatsApp.
  const degradedMode = degradedInfo !== null

  return {
    config, isLoading, isOpen, open, close, toggle,
    messages, isStreaming, avatarState, degradedMode, degradedInfo,
    sendMessage, acceptProactivePrompt,
    triggerWhatsappHandoff, triggerCallbackHandoff, navigateTo,
  }
}
