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
  const [degradedMode, setDegradedMode] = useState(false)
  const sessionIdRef = useRef<string>(getOrCreateSessionId())

  useEffect(() => {
    let cancelled = false
    fetch(`/api/chatbot/${slug}/config`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PublicBotConfig | null) => {
        if (cancelled) return
        setConfig(data)
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
          const response = await fetch(input, init)
          // Clone so we can read body without consuming for the SDK
          if (response.headers.get('content-type')?.includes('application/json')) {
            try {
              const cloned = response.clone()
              const data = await cloned.json()
              if (data?.mode === 'degraded') {
                setDegradedMode(true)
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
    if (!isOpen) return 'idle'
    if (pendingSubmit || status === 'submitted') return 'thinking'
    if (status === 'streaming') return 'speaking'
    return 'listening'
  }, [isOpen, status, pendingSubmit])

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
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return {
    config, isLoading, isOpen, open, close, toggle,
    messages, isStreaming, avatarState, degradedMode,
    sendMessage, acceptProactivePrompt,
    triggerWhatsappHandoff, triggerCallbackHandoff, navigateTo,
  }
}
