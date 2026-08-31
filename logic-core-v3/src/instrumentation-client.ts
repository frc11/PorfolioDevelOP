// ⚠️ SITIO-S9 — EL SDK ARRANCA ACÁ, EN LÍNEA, Y ASÍ SE QUEDA (§7.30).
//
// El chunk del SDK son 142,1 KiB gzip en toda ruta y §7.30 lo dejó abierto con
// dos salidas: lazy-init, o browserTracing fuera del bundle. SITIO-S9 las midió
// y NO difirió, por dos razones que están medidas en
// `components/layout/carga-diferida/__tests__/s9-sentry.invariant.ts`:
//
//   1. diferir no devuelve 142,1 sino 77,9 KiB gzip como TECHO — el chunk es
//      compartido y 18 chunks más de la carga inicial le piden módulos;
//   2. y sin `init` corrido, `Scope.captureException` descarta el evento y
//      devuelve un id igual (`@sentry/core/.../scope.js:471`), sin avisar en
//      producción. `src/app/error.tsx` y `src/app/global-error.tsx` lo llaman y
//      viajan en la carga inicial de las 11 rutas prerenderizadas: diferir deja
//      mudo al límite de «la app no pudo cargar» en su única ventana. **Un
//      evento descartado que devuelve un id y no avisa es peor que no tener
//      Sentry, porque parece que funciona.**
//
// El porqué entero está en `components/layout/carga-diferida/puertas-de-sentry.ts`.
import * as Sentry from '@sentry/nextjs'
import { scrubPii } from '@/lib/sentry/scrub-pii'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
  debug: false,
  // ⚠️ ACÁ VIVÍAN `replaysOnErrorSampleRate: 1.0` Y `replaysSessionSampleRate:
  // 0.0`, HEREDADAS DE `sentry.client.config.ts` (B1.2, pre-Turbopack) CON UN
  // COMENTARIO QUE DECÍA QUE «PRESERVABAN LOS SESSION REPLAYS ON ERROR».
  // **BORRADAS EN SITIO-S9, y no por peso: por honestidad.**
  //
  // Medido: con `@sentry/nextjs` 10.62.0 el default son 13 integraciones y
  // `replayIntegration` NO está entre ellas; nadie la agrega, y `replayIntegration`
  // y `rrweb` aparecen en CERO chunks del build. Las tasas de replay sólo las lee
  // esa integración, así que estas dos líneas costaban **0 bytes y capturaban 0
  // replays**. Un flag que dice preservar algo que no existe es peor que no
  // estar: le hace creer al próximo que hay replays cuando no hay ninguno.
  //
  // Borrarlas **no cambia un byte del bundle ni una captura**. El día que se
  // quieran replays de verdad hay que agregar `replayIntegration()` —que SÍ
  // pesa— y ahí volver a poner las tasas. `s9-sentry.invariant.ts` §4 lo mide y
  // custodia que no vuelvan sin su integración.
  environment: process.env.NODE_ENV,
  // B14.5 — PII scrubbing también en client. Importante: si algún día se agrega
  // Session Replay, tiene su propio scrubbing nativo (maskAllText por default);
  // los eventos de error pasan por acá.
  beforeSend(event, hint) {
    return scrubPii(event, hint)
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
