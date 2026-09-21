/**
 * O — HOVER DONDE HAY, TOQUE DONDE NO: la verificación del disparador dual.
 *
 *     npx tsx scripts-blend/o-hover.ts
 *
 * Dos cosas por ancho, en la MISMA pose:
 *
 *   1. **El disparador que corresponde a la capacidad de puntero.** A 1440 (sin
 *      touch, `movil: false` en `VENTANAS`) se mueve el mouse de verdad sobre un
 *      marco y se lee si reveló SIN clic, y que al alejarlo se cierra solo — el
 *      defecto que `pointer-events: none` existe para evitar. A 375 y 768 (con
 *      touch) se hace un clic real y se lee que revela y que el respiro corría
 *      antes del primer toque.
 *   2. **Que la descripción del equipo no se repita.** A 375 (≤425) tiene que
 *      estar visible AFUERA y ausente adentro del revelado al tocar; a 768
 *      (>425) al revés: sr-only afuera y visible adentro al tocar. Los retratos
 *      de Franco y Valentino no cambian en ningún ancho: su texto vive sólo
 *      adentro del revelado.
 *
 * Y las capturas de control que pide el cierre del sprint, hero y quiénes somos,
 * en los tres anchos.
 */

import { mkdirSync } from 'node:fs'

import { capturar } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

const SALIDA = 'docs/rediseno/outputs/movil'

function esperar(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

const LECTOR_DEL_MARCO = (sel: string) => `(() => {
  const marco = document.querySelector(${JSON.stringify(sel)})
  if (marco === null) return null
  const r = marco.getBoundingClientRect()
  const boton = marco.querySelector('[data-toque="marco"]')
  const texto = marco.querySelector('[data-parte="revelado-texto"]')
  // ⚠️ getBoundingClientRect y NO getComputedStyle: un ancestro con display:none
  // no le cambia a un descendiente su \`translate\` COMPUTADO (la propiedad no
  // depende de layout), así que preguntarle eso mentiría "revelado" aunque el
  // párrafo esté oculto. El rect en cambio da 0x0 apenas hay un display:none en
  // cualquier ancestro — es la señal que refleja lo que un ojo vería.
  const rTexto = texto === null ? null : texto.getBoundingClientRect()
  return {
    centro: { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) },
    abierto: marco.getAttribute('data-abierto'),
    respira: marco.hasAttribute('data-respira'),
    animacionDelRespiro: getComputedStyle(marco).animationName,
    pointerEventsDelBoton: boton === null ? null : getComputedStyle(boton).pointerEvents,
    ariaPressed: boton === null ? null : boton.getAttribute('aria-pressed'),
    textoVisible: rTexto !== null && rTexto.width > 4 && rTexto.height > 4,
    textoEnElDom: texto !== null,
    textoDisplay: texto === null ? null : getComputedStyle(texto).display,
    tieneAtributoDeAfuera: marco.hasAttribute('data-descripcion-afuera'),
  }
})()`

const LECTOR_DE_HOVER_MEDIA = `(() => ({
  hoverHover: matchMedia('(hover: hover)').matches,
  hoverNone: matchMedia('(hover: none)').matches,
}))()`

const LECTOR_DE_LA_DESCRIPCION = `(() => {
  const fuera = document.querySelector('[data-pantalla="foto"] figure > p')
  if (fuera === null) return { hay: false }
  const cs = getComputedStyle(fuera)
  // sr-only pone la caja en 1x1 con overflow oculto: eso es "invisible" para un ojo.
  const r = fuera.getBoundingClientRect()
  return { hay: true, visible: r.width > 4 && r.height > 4 && cs.position !== 'fixed' }
})()`

interface LecturaDelMarco {
  readonly centro: { readonly x: number; readonly y: number }
  readonly abierto: string | null
  readonly respira: boolean
  readonly animacionDelRespiro: string
  readonly pointerEventsDelBoton: string | null
  readonly ariaPressed: string | null
  readonly textoVisible: boolean
  readonly textoEnElDom: boolean
  readonly textoDisplay: string | null
  readonly tieneAtributoDeAfuera: boolean
}

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const anchos: readonly number[] = [375, 768, 1440]
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => anchos.includes(v.ancho))

  await conChrome('blend-hover', async (chrome) => {
    for (const v of ventanas) {
      await enLaVentana(
        chrome,
        v,
        async (s) => {
          const media = await medir<{ hoverHover: boolean; hoverNone: boolean }>(s.pagina, LECTOR_DE_HOVER_MEDIA)
          console.log(`\n  === ${v.ancho}x${v.alto} · (hover:hover)=${media.hoverHover} (hover:none)=${media.hoverNone}`)

          await capturar(s.pagina, `${SALIDA}/hero-${v.ancho}.png`)

          const scrollY = await medir<number>(
            s.pagina,
            `(() => { const q = document.querySelector('[data-panel="quienes-somos"]'); return q === null ? 0 : Math.round(q.getBoundingClientRect().top + window.scrollY) })()`,
          )
          await medir<null>(s.pagina, `(() => { window.scrollTo(0, ${Math.max(0, scrollY - 40)}); return null })()`)
          await esperar(900)
          await capturar(s.pagina, `${SALIDA}/quienes-somos-${v.ancho}.png`)

          // ── el marco del equipo (con descripcionYaVisible) ──────────────────
          // ⚠️ La pantalla «foto» es la TERCERA dentro de la sección de 300svh: el
          // tope de `[data-panel="quienes-somos"]` no la trae a la vista. Se lee su
          // posición documental y se scrollea DE NUEVO para centrarla — recién ahí
          // las coordenadas del centro caen adentro del viewport.
          const SEL_EQUIPO = '[data-pantalla="foto"] [data-marco="dos-tomas"]'
          const topDelMarco = await medir<number>(
            s.pagina,
            `(() => { const el = document.querySelector(${JSON.stringify(SEL_EQUIPO)}); return el === null ? -1 : Math.round(el.getBoundingClientRect().top + window.scrollY) })()`,
          )
          if (topDelMarco < 0) throw new Error(`a ${v.ancho}: no se encontró el marco del equipo`)
          await medir<null>(s.pagina, `(() => { window.scrollTo(0, ${Math.max(0, topDelMarco)} - Math.round(window.innerHeight / 2)); return null })()`)
          await esperar(900)
          let m = await medir<LecturaDelMarco | null>(s.pagina, LECTOR_DEL_MARCO(SEL_EQUIPO))
          if (m === null) throw new Error(`a ${v.ancho}: no se encontró el marco del equipo tras centrarlo`)
          if (m.centro.y < 0 || m.centro.y > v.alto) {
            throw new Error(`a ${v.ancho}: el centro del marco (${m.centro.y}) sigue fuera del viewport (${v.alto})`)
          }
          if (media.hoverHover) {
            // Mouse real: mover sobre el marco, leer, alejar, leer de nuevo.
            await s.pagina.conexion.enviar(
              'Input.dispatchMouseEvent',
              { type: 'mouseMoved', x: m.centro.x, y: m.centro.y },
              s.pagina.sessionId,
            )
            await esperar(500)
            const conHover = await medir<LecturaDelMarco | null>(s.pagina, LECTOR_DEL_MARCO(SEL_EQUIPO))
            console.log(`    con mouse encima: textoVisible=${conHover?.textoVisible} abierto=${conHover?.abierto} aria-pressed=${conHover?.ariaPressed}`)
            await s.pagina.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 }, s.pagina.sessionId)
            await esperar(500)
            const sinHover = await medir<LecturaDelMarco | null>(s.pagina, LECTOR_DEL_MARCO(SEL_EQUIPO))
            console.log(`    mouse alejado: textoVisible=${sinHover?.textoVisible} (tiene que ser false; si sigue true, quedó pegado)`)
          } else {
            // Sin hover: clic/toque real.
            for (const tipo of ['mousePressed', 'mouseReleased']) {
              await s.pagina.conexion.enviar(
                'Input.dispatchMouseEvent',
                { type: tipo, x: m.centro.x, y: m.centro.y, button: 'left', clickCount: 1 },
                s.pagina.sessionId,
              )
            }
            await esperar(700)
            const trasElToque = await medir<LecturaDelMarco | null>(s.pagina, LECTOR_DEL_MARCO(SEL_EQUIPO))
            console.log(
              `    tras el toque: abierto=${trasElToque?.abierto} aria-pressed=${trasElToque?.ariaPressed} respira=${trasElToque?.respira} textoEnElDom=${trasElToque?.textoEnElDom} textoDisplay=${trasElToque?.textoDisplay} textoVisible=${trasElToque?.textoVisible}`,
            )
          }

          const descAntes = await medir<{ hay: boolean; visible?: boolean }>(s.pagina, LECTOR_DE_LA_DESCRIPCION)
          console.log(`    equipo: respira=${m.respira} animación=${m.animacionDelRespiro} pointer-events(botón)=${m.pointerEventsDelBoton}`)
          console.log(`    descripción AFUERA visible: ${JSON.stringify(descAntes)}`)

          // ── un retrato (Franco), de control: NUNCA lleva el atributo ──────
          const SEL_PERSONA = '[data-pieza-a="persona"] [data-marco="dos-tomas"]'
          const topDePersona = await medir<number>(
            s.pagina,
            `(() => { const el = document.querySelector(${JSON.stringify(SEL_PERSONA)}); return el === null ? -1 : Math.round(el.getBoundingClientRect().top + window.scrollY) })()`,
          )
          if (topDePersona >= 0) {
            await medir<null>(s.pagina, `(() => { window.scrollTo(0, ${Math.max(0, 0)} + ${topDePersona} - Math.round(window.innerHeight / 2)); return null })()`)
            await esperar(700)
            const p = await medir<LecturaDelMarco | null>(s.pagina, LECTOR_DEL_MARCO(SEL_PERSONA))
            if (p !== null && p.centro.y >= 0 && p.centro.y <= v.alto) {
              if (media.hoverHover) {
                await s.pagina.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.centro.x, y: p.centro.y }, s.pagina.sessionId)
              } else {
                for (const tipo of ['mousePressed', 'mouseReleased']) {
                  await s.pagina.conexion.enviar(
                    'Input.dispatchMouseEvent',
                    { type: tipo, x: p.centro.x, y: p.centro.y, button: 'left', clickCount: 1 },
                    s.pagina.sessionId,
                  )
                }
              }
              await esperar(600)
              const pTras = await medir<LecturaDelMarco | null>(s.pagina, LECTOR_DEL_MARCO(SEL_PERSONA))
              console.log(
                `    persona (control): atributoDeAfuera=${pTras?.tieneAtributoDeAfuera} textoDisplay=${pTras?.textoDisplay} textoVisible=${pTras?.textoVisible}`,
              )
            } else {
              console.log('    persona (control): no entró en el viewport centrado, se saltea')
            }
          }

        },
        { asentamientoMs: 4500 },
      )
    }
    return null
  })
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
