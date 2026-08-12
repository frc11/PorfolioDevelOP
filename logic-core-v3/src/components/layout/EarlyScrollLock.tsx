'use client'

import { useRef } from 'react'
import { useServerInsertedHTML } from 'next/navigation'

/**
 * Scroll-lock temprano del intro del home, inyectado al stream SSR FUERA del
 * árbol de React: `useServerInsertedHTML` lo splicea justo antes de `</head>`
 * (createHeadInsertionTransformStream), así que el parser lo ejecuta
 * bloqueante → corre ANTES del primer paint, idéntico al viejo <script>
 * inline del root layout. Al no ser parte del árbol, React nunca lo crea en
 * cliente → no dispara el dev-warning "Encountered a script tag…" (react-dom
 * crea inertes los <script> ejecutables que renderiza un componente y avisa).
 *
 * NO migrar a next/script strategy="beforeInteractive": en App Router eso NO
 * emite un script ejecutable — encola el código como data en `self.__next_s`
 * y lo ejecuta app-bootstrap recién cuando carga main-app.js (bundle async),
 * o sea potencialmente DESPUÉS del primer paint en red lenta → frames con
 * scroll habilitado durante el intro. (Fuente: next/dist/client/script.js,
 * branch appDir beforeInteractive, y next/dist/client/app-bootstrap.js.)
 *
 * Semántica del script (sagrada): lockea solo en '/' y nunca bajo automation
 * (navigator.webdriver — visual-qa necesita scrollear). El Hero lo libera en
 * phase 'done'.
 */
const EARLY_SCROLL_LOCK_JS =
  "try{if(location.pathname==='/'&&navigator.webdriver!==true){document.documentElement.style.overflow='hidden'}}catch(e){}"

export function EarlyScrollLock() {
  // El callback corre en CADA flush del stream; one-shot para no re-inyectar
  // el script en chunks tardíos (re-lockearía el scroll si el Hero ya lo
  // liberó). En cliente el hook es no-op (ServerInsertedHTMLContext = null).
  const insertedRef = useRef(false)
  useServerInsertedHTML(() => {
    if (insertedRef.current) return null
    insertedRef.current = true
    return <script dangerouslySetInnerHTML={{ __html: EARLY_SCROLL_LOCK_JS }} />
  })
  return null
}
