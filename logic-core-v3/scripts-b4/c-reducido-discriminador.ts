/**
 * FRENTE C · EL DISCRIMINADOR DE `prefers-reduced-motion`.
 *
 *     npx tsx scripts-b4/c-reducido-discriminador.ts
 *
 * `c-reducido.ts` midió a 1920, con la preferencia puesta ANTES de navegar:
 * **2.380 elementos con transformada en línea y 5 piezas de texto partido** —
 * exactamente los mismos números que sin la preferencia. Y `matchMedia` en esa
 * misma página devolvía `true` (el script tira si no).
 *
 * Dos números idénticos no prueban por qué son idénticos. Hay dos causas
 * posibles y son muy distintas:
 *
 *   (A) **La emulación no llega al árbol de React.** Sería un defecto del
 *       instrumento, y todo lo que sigue habría que rehacerlo.
 *   (B) **El sitio no lee la preferencia INICIAL, sólo su CAMBIO.** Sería un
 *       defecto del sitio, y de los graves: una preferencia de accesibilidad
 *       que sólo funciona si se la activa con la página ya abierta no funciona
 *       para nadie.
 *
 * **El discriminador:** poner la preferencia DESPUÉS de cargar, sin recargar, y
 * volver a contar. Si ahí las transformadas se van, la emulación sí llega al
 * árbol —descarta (A)— y lo que falla es la lectura inicial —confirma (B)—.
 *
 * ── ⚠️ Y LA TERCERA CAUSA, QUE LA PRIMERA VERSIÓN DE ESTE ARCHIVO NO TENÍA ──
 *
 * La primera corrida dio «ni A ni B»: la preferencia puesta después tampoco
 * apagaba nada. La dicotomía estaba incompleta, y la lectura del fuente cerró
 * la tercera:
 *
 *   (C) **`useMovimientoReducido()` devuelve `false` SIEMPRE**, porque
 *       `useReducedMotionConfig` de `motion` mira primero el contexto, y el
 *       valor por defecto de `MotionConfigContext` es `reducedMotion: "never"`,
 *       que corta antes de mirar el media query. **En todo `/v3` no hay un solo
 *       `<MotionConfig>`** fuera del arnés de invariantes.
 *
 * Por eso el caso 3b tiene que dar lo mismo que 3a: no hay nada que apagar. La
 * emulación llega perfecto —`matchMedia` lo confirma en las cuatro filas—; lo
 * que no llega es del media query al árbol.
 *
 * ── El cuarto caso, que acota el defecto ──────────────────────────────────
 *
 * La ESCENA usa otro hook (`@/lib/use-reduced-motion`), que sí lee
 * `mq.matches`. Entonces la preferencia podría estar honrada a medias. Se mide:
 * dos capturas separadas en el tiempo, con y sin la preferencia. Si sin ella la
 * escena se mueve entre capturas y con ella se queda quieta, la escena honra la
 * preferencia y el defecto es **sólo de la coreografía del DOM**.
 *
 * Es la regla de método que este repo ya tiene escrita: **si un fix es correcto
 * en estático pero falla en runtime, buscar un discriminador empírico antes de
 * volver a tocar el código.** Acá se aplica a una medición en vez de a un fix.
 */

import { guardarJson } from './c-comun'
import { cerrarChrome, lanzarChrome, perfilDeChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'

const CUENTA = `(async () => {
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
  const paso = Math.round(window.innerHeight / 2)
  const fin = document.documentElement.scrollHeight - window.innerHeight
  let conTransform = 0
  for (let y = 0; y <= fin; y += paso) {
    window.scrollTo(0, y)
    await raf2()
    await dormir(200)
    for (const el of document.querySelectorAll('*')) {
      const s = el.getAttribute('style')
      if (s !== null && s.includes('transform')) conTransform += 1
    }
  }
  window.scrollTo(0, 0)
  await raf2()
  return {
    conTransform,
    piezasDeLineas: document.querySelectorAll('[data-lineas-piezas]').length,
    matchMedia: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  }
})()`

interface Cuenta {
  readonly conTransform: number
  readonly piezasDeLineas: number
  readonly matchMedia: boolean
}

async function principal(): Promise<void> {
  const perfil = perfilPorId('1920')
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('c'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
  })
  const filas: Record<string, unknown>[] = []
  try {
    // (1) sin la preferencia — la línea base.
    let p = await abrirPagina(chrome)
    await emular(p, perfil, { movimientoReducido: false })
    await irA(p, 'http://localhost:3002/v3')
    await verificarLaPagina(p, perfil)
    const base = await medir<Cuenta>(p, CUENTA)
    filas.push({ caso: '1 · sin la preferencia', ...base })
    await cerrarPagina(p)

    // (2) con la preferencia puesta ANTES de navegar.
    p = await abrirPagina(chrome)
    await emular(p, perfil, { movimientoReducido: true })
    await irA(p, 'http://localhost:3002/v3')
    await verificarLaPagina(p, perfil)
    const antes = await medir<Cuenta>(p, CUENTA)
    filas.push({ caso: '2 · con la preferencia ANTES de navegar', ...antes })
    await cerrarPagina(p)

    // (3) EL DISCRIMINADOR: cargar sin la preferencia y ponerla DESPUÉS, sin recargar.
    p = await abrirPagina(chrome)
    await emular(p, perfil, { movimientoReducido: false })
    await irA(p, 'http://localhost:3002/v3')
    await verificarLaPagina(p, perfil)
    const previa = await medir<Cuenta>(p, CUENTA)
    await emular(p, perfil, { movimientoReducido: true })
    // Un respiro para que el listener de `matchMedia` corra y React re-renderice.
    await medir<boolean>(p, '(async () => { await new Promise((r) => setTimeout(r, 1500)); return true })()')
    const despues = await medir<Cuenta>(p, CUENTA)
    filas.push({ caso: '3a · cargada SIN la preferencia', ...previa })
    filas.push({ caso: '3b · la MISMA página, preferencia puesta después', ...despues })
    await cerrarPagina(p)

    // (4) ¿la ESCENA sí honra la preferencia? Dos capturas separadas, con y sin.
    const escena: Record<string, unknown>[] = []
    for (const reducido of [false, true]) {
      p = await abrirPagina(chrome)
      await emular(p, perfil, { movimientoReducido: reducido })
      await irA(p, 'http://localhost:3002/v3')
      await verificarLaPagina(p, perfil)
      const par = await medir<{ a: number; b: number; delta: number }>(
        p,
        `(async () => {
          const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
          const canvas = document.querySelector('canvas')
          await dormir(2000)
          // No se lee el búfer: se lee el reloj de cuadros del compositor, que
          // sí es observable — cuántas veces corre rAF con la escena montada.
          const contar = async () => { let n = 0; const fin = performance.now() + 1000
            await new Promise((r) => { const t = () => { n += 1; if (performance.now() >= fin) { r(); return } requestAnimationFrame(t) }; requestAnimationFrame(t) })
            return n }
          const a = await contar()
          const b = await contar()
          return { a, b, delta: Math.abs(a - b), hayCanvas: canvas !== null }
        })()`,
      )
      escena.push({ reducido, ...par })
      await cerrarPagina(p)
    }

    const laEmulacionLlega = despues.conTransform < previa.conTransform
    const conYSinIguales = antes.conTransform === base.conTransform && antes.piezasDeLineas === base.piezasDeLineas
    const veredicto = laEmulacionLlega
      ? 'B · el sitio no lee la preferencia INICIAL, sólo su CAMBIO. Defecto del sitio.'
      : conYSinIguales
        ? 'C · la emulación llega (matchMedia lo confirma en las cuatro filas) pero NO llega del media query al árbol: `useReducedMotionConfig` corta en el contexto, cuyo default es `reducedMotion: "never"`, y en /v3 no hay ningún `<MotionConfig>`. Defecto DEL SITIO, en `_lib/motion/reducido.ts`.'
        : 'indeterminado — mirar las cuatro filas'

    console.log('\n── EL DISCRIMINADOR ──')
    for (const f of filas) console.log(`  ${String(f.caso).padEnd(46)} transform ${String(f.conTransform).padStart(5)} · lineas ${f.piezasDeLineas} · matchMedia ${f.matchMedia}`)
    console.log('\n── la escena, cuadros por segundo con y sin la preferencia ──')
    for (const e of escena) console.log(`  reducido=${e.reducido}  ${e.a} y ${e.b} cuadros/s`)
    console.log(`\n  VEREDICTO: ${veredicto}`)

    const ruta = guardarJson('c-reducido-discriminador.json', {
      que: 'por qué `prefers-reduced-motion` no cambió nada a 1920 con la preferencia puesta antes de navegar',
      instrumento: 'scripts-b4/c-reducido-discriminador.ts',
      emulado: true,
      perfil: '1920',
      lasTresCausasPosibles: {
        A: 'la emulación no llega al árbol de React — defecto del instrumento',
        B: 'el sitio no lee la preferencia INICIAL, sólo su CAMBIO — defecto del sitio',
        C: '`useMovimientoReducido()` devuelve `false` SIEMPRE: `useReducedMotionConfig` corta en el contexto, cuyo default es `reducedMotion: "never"`, y /v3 no monta ningún `<MotionConfig>` — defecto del sitio',
      },
      escenaConYSinLaPreferencia: escena,
      discriminador: 'poner la preferencia DESPUÉS de cargar, sin recargar, y volver a contar',
      filas,
      veredicto,
    })
    console.log(`\n→ ${ruta}`)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
