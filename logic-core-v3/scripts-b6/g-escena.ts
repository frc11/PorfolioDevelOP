/**
 * EL LENTE Y EL REVELADO, EN EL NAVEGADOR — lo que los invariantes de Node no
 * pueden ver. Instrumento de la PARADA 2 (c) y (f).
 *
 *     npx tsx scripts-b6/g-escena.ts
 *
 *   1. EL LENTE DE P7, en el pin de Trabajos: la `perspective` y el
 *      `perspective-origin` COMPUTADOS del bloque de P7, contra el foco de la
 *      escena y el centro del viewport en coordenadas del bloque. Y tres
 *      capturas del pin para el «después»; el «antes» son las de
 *      `abierto-trabajos-*` en `docs/rediseno/capturas/b6/`, tomadas con los
 *      1000 px del patrón y el punto de fuga en el centro del bloque.
 *   2. EL REVELADO, en las cuatro fronteras que cambiaron: la máscara que la
 *      escena lleva con cada costura a mitad del cuadro. Números→Trabajos y
 *      Tu panel→Por qué develOP tienen que ablandarse con un `entra`;
 *      Trabajos→Servicios con un `sale`; y Por qué develOP→Cierre NO tiene que
 *      tener máscara: dos transparentes contiguas no tienen costura (B6-A).
 */

import { copyFileSync, mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { FOCO_EN_ALTOS_DE_VENTANA, origenDeLaLente } from '../src/app/v3/_lib/motion/lente'

import { CARPETA_DE_CAPTURAS, MARCA_DE_INTRO, PERFIL, PUENTE_DE_AUTOMATIZACION, TEMP, asegurarCarpetas, asentarElHome, conLaPagina, dos, guardarJson } from './b6-comun'
import { LECTOR_DE_PANELES } from './lectores'

const LECTOR_DEL_LENTE = `(() => {
  const bloque = document.querySelector('[data-panel="trabajos"] [data-anclaje="seccion"]')
  if (bloque === null) throw new Error('no hay bloque de P7 con anclaje de sección')
  const cs = getComputedStyle(bloque)
  const r = bloque.getBoundingClientRect()
  const pegado = bloque.closest('[data-pinneado]')
  const rp = pegado === null ? null : pegado.getBoundingClientRect()
  return {
    perspective: cs.perspective,
    perspectiveOrigin: cs.perspectiveOrigin,
    rect: { left: r.left, top: r.top, width: r.width, height: r.height },
    pegado: rp === null ? null : { top: rp.top, height: rp.height, position: getComputedStyle(pegado).position },
    ventana: { ancho: innerWidth, alto: innerHeight },
  }
})()`

const LECTOR_DE_LA_MASCARA = `(() => {
  const el = document.querySelector('[data-escena]')
  return el === null ? null : (el.style.maskImage || el.style.webkitMaskImage || '')
})()`

interface Lente {
  readonly perspective: string
  readonly perspectiveOrigin: string
  readonly rect: { readonly left: number; readonly top: number; readonly width: number; readonly height: number }
  readonly pegado: { readonly top: number; readonly height: number; readonly position: string } | null
  readonly ventana: { readonly ancho: number; readonly alto: number }
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async (s) => {
      await asentarElHome(s)
      const paneles = await medir<{ id: string; top: number; alto: number }[]>(s.pagina, LECTOR_DE_PANELES)
      const panel = (id: string): { id: string; top: number; alto: number } => {
        const p = paneles.find((x) => x.id === id)
        if (p === undefined) throw new Error(`no existe ${id}`)
        return p
      }
      const v = s.perfil.alto

      // 1 · el lente, en tres posiciones del pin (las mismas del «antes»)
      const lente: { scrollY: number; leido: Lente; esperado: { perspectivePx: number; origen: string }; capturaC: string }[] = []
      for (const y of [7200, 8100, 9000]) {
        await scrollA(s.pagina, y)
        await esperarElPrimerCuadro(s.pagina)
        const leido = await medir<Lente>(s.pagina, LECTOR_DEL_LENTE)
        const rutaC = `${TEMP}/final-trabajos-${y}-C.png`
        await capturar(s.pagina, rutaC)
        lente.push({
          scrollY: y,
          leido,
          esperado: {
            perspectivePx: FOCO_EN_ALTOS_DE_VENTANA * leido.ventana.alto,
            origen: origenDeLaLente({ left: leido.rect.left, top: leido.rect.top }, leido.ventana),
          },
          capturaC: rutaC,
        })
      }

      // 2 · el revelado en las cuatro fronteras, con la costura a mitad del cuadro
      const fronteras = [
        { de: 'numeros', a: 'trabajos', espera: 'entra' },
        { de: 'trabajos', a: 'servicios', espera: 'sale' },
        { de: 'tu-panel', a: 'por-que-develop', espera: 'entra' },
        { de: 'por-que-develop', a: 'cierre', espera: 'ninguna' },
      ] as const
      const revelado: { frontera: string; scrollY: number; mascara: string | null; espera: string }[] = []
      for (const f of fronteras) {
        const y = Math.round(panel(f.a).top - v / 2)
        await scrollA(s.pagina, y)
        await esperarElPrimerCuadro(s.pagina)
        const mascara = await medir<string | null>(s.pagina, LECTOR_DE_LA_MASCARA)
        revelado.push({ frontera: `${f.de} → ${f.a}`, scrollY: y, mascara, espera: f.espera })
      }
      return { lente, revelado }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO] },
  )

  console.log('1 · EL LENTE DE P7 en el pin de Trabajos')
  let lenteOk = true
  for (const l of salida.lente) {
    const px = Number.parseFloat(l.leido.perspective)
    const okPerspectiva = Math.abs(px - l.esperado.perspectivePx) < 1
    // El navegador devuelve el origen COMPUTADO redondeado al píxel (Chrome: «688px 209px»
    // para 688,0 y 209,3): se compara componente a componente con un píxel de tolerancia.
    const leidos = l.leido.perspectiveOrigin.split(' ').map(Number.parseFloat)
    const esperados = l.esperado.origen.split(' ').map(Number.parseFloat)
    const okOrigen = leidos.length === 2 && leidos.every((v, i) => Math.abs(v - esperados[i]) < 1)
    lenteOk = lenteOk && okPerspectiva && okOrigen
    console.log(
      `  y=${l.scrollY}: perspective ${l.leido.perspective} (esperado ${dos(l.esperado.perspectivePx)}px) ${okPerspectiva ? '✓' : '✗'} · origin ${l.leido.perspectiveOrigin} (esperado ${l.esperado.origen}) ${okOrigen ? '✓' : '✗'}` +
        ` · bloque en (${dos(l.leido.rect.left)}, ${dos(l.leido.rect.top)}) ${dos(l.leido.rect.width)}×${dos(l.leido.rect.height)} · pegado ${l.leido.pegado?.position ?? '—'} top ${dos(l.leido.pegado?.top ?? Number.NaN)}`,
    )
  }
  console.log('2 · EL REVELADO en las cuatro fronteras')
  let reveladoOk = true
  for (const r of salida.revelado) {
    const tipo = r.mascara === null || r.mascara === '' ? 'ninguna' : /transparent 0px|^linear-gradient\(to bottom, transparent/.test(r.mascara) ? 'entra' : 'sale'
    const ok = tipo === r.espera
    reveladoOk = reveladoOk && ok
    console.log(`  ${r.frontera.padEnd(30)} y=${r.scrollY}: ${tipo.padEnd(7)} (se espera ${r.espera}) ${ok ? '✓' : '✗'} — ${r.mascara ?? 'sin escena'}`)
  }

  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })
  for (const l of salida.lente) copyFileSync(l.capturaC, `${CARPETA_DE_CAPTURAS}/final-trabajos-${l.scrollY}-C.png`)
  console.log(`  ${guardarJson('g-escena', salida)}`)
  if (!lenteOk || !reveladoOk) process.exitCode = 1
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
