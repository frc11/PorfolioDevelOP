/**
 * B5 · `prefers-reduced-motion` SOBRE LAS TRES PIEZAS NUEVAS, SIN ARNÉS.
 *
 *     npx tsx scripts-b5/c-reducido.ts
 *
 * ── ⚠️ Por qué esto no se puede afirmar en un invariante de Node ──────────
 *
 * La regla que B4-B dejó escrita: *«ninguna entrada que venga de afuera del
 * árbol —preferencia, breakpoint, `matchMedia`— se puede cerrar en un render
 * forzado. El discriminador es una pregunta: ¿qué parte de esta afirmación la
 * puso el propio instrumento?»*
 *
 * Un invariante que llame `deberiaMontarseElCursor(true, true)` y verifique que
 * da `false` está comprobando una función pura con el argumento que él mismo le
 * pasó: no dice nada sobre si el navegador le va a pasar ese argumento. Eso ya
 * lo afirma `b5-compuertas.invariant.ts`, **y ahí termina lo que se puede
 * afirmar sin un navegador.**
 *
 * Acá la preferencia la pone **`Emulation.setEmulatedMedia`**, o sea el entorno,
 * y el instrumento no toca el árbol: sólo lee lo que el árbol montó. Lo único
 * que el instrumento pone es la preferencia; todo lo que afirma lo puso el
 * producto.
 *
 * ── Y el control positivo, que es la otra mitad ──────────────────────────
 *
 * La misma corrida, con la preferencia en `no-preference`, tiene que ver las
 * tres piezas MONTADAS. Sin eso, «no hay cursor» pasaría en verde también si el
 * cursor no existiera, si la página no cargara, o si el selector estuviera mal
 * escrito — que es la forma de verde por vacío que este bloque tiene prohibida.
 *
 * ── El tercer eje: abajo de 1025 ─────────────────────────────────────────
 *
 * Se mide en la misma corrida y con los mismos lectores, porque es la misma
 * pregunta con otra entrada del entorno: **abajo del umbral no se carga ninguna
 * de las tres**, con la preferencia apagada.
 */

import { mkdirSync } from 'node:fs'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { conLaPagina, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b5-comun'

import { decodificarPng } from '../scripts-b4/png'
import { luminancia } from '../scripts-b4/color'
import { readFileSync } from 'node:fs'

interface Quietud {
  readonly pctPixeles: number
  readonly mediaDelta: number
}

interface LoQueMonto {
  readonly quietud?: Quietud
  /** El atributo que `ScrollSuaveDeV3` escribe en el `<html>` mientras corre. */
  readonly scrollSuave: string | null
  /** La clase que la propia librería agrega al construirse. */
  readonly claseLenis: boolean
  /** ⚠️ La que apagaría el `sticky`. Nunca tiene que aparecer. */
  readonly claseLenisStopped: boolean
  readonly overflowDelHtml: string
  /** La marca del cursor propio, como valor de atributo. */
  readonly cursor: string | null
  readonly capasDelCursor: number
  /** La marca de la escena. Es la tercera compuerta del mismo umbral. */
  readonly escena: string | null
  /** Lo que el navegador dice que el visitante pidió. Se lee, no se asume. */
  readonly preferenciaLeidaPorLaPagina: boolean
  readonly ancho: number
}

const LECTOR = `(() => {
  const h = document.documentElement
  return {
    scrollSuave: h.getAttribute('data-v3-scroll-suave'),
    claseLenis: h.classList.contains('lenis'),
    claseLenisStopped: h.classList.contains('lenis-stopped'),
    overflowDelHtml: getComputedStyle(h).overflow,
    cursor: document.querySelector('[data-cursor]')?.getAttribute('data-cursor') ?? null,
    capasDelCursor: document.querySelectorAll('[data-pieza="cursor"] > [data-parte]').length,
    escena: document.querySelector('[data-escena]')?.getAttribute('data-escena') ?? null,
    preferenciaLeidaPorLaPagina: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ancho: window.innerWidth,
  }
})()`

const TEMP = '.b5-capturas'

/** Cuanto se deja pasar entre las dos capturas de quietud. */
const VENTANA_DE_QUIETUD_MS = 5000

/**
 * ⚠️ **CUÁNTO SE ESPERA ANTES DE LA PRIMERA CAPTURA, Y POR QUÉ NO ALCANZA CON
 * LA GRACIA DE ESCENA.**
 *
 * Las revelaciones de las secciones —las del sistema de motion, no las de la
 * escena— corren al entrar en cuadro y duran su propio rato. Capturando a los
 * 1.200 ms, el par de quietud daba **83 % de los píxeles cambiando con media
 * 46,6 incluso sin la preferencia**, y ese número no describe a la escena: es el
 * contenido apareciendo. Con 4 s de más ya terminaron y lo que queda cambiando
 * es la sala.
 *
 * ⚠️ Y esto NO tapa el defecto heredado que B4-B midió —que
 * `prefers-reduced-motion` no se honra en el sistema de motion—: lo deja afuera
 * de esta medición a propósito, porque esta medición es sobre las tres piezas de
 * B5 y aquel arreglo es de otro bloque.
 */
const ASENTAMIENTO_DEL_CONTENIDO_MS = 4000

/**
 * ⚠️ **LA ESCENA SÍ SE MONTA CON LA PREFERENCIA PUESTA, Y ESO ES CORRECTO.**
 *
 * Fue el primer rojo de este instrumento y el producto tenía razón: la escena no
 * es una animación, es **el fondo de la página**. Desmontarla con
 * `prefers-reduced-motion` no sería «menos movimiento»: sería otra composición,
 * con los ocho paneles transparentes sobre papel liso. Lo que la preferencia
 * apaga vive ADENTRO (`OrbitRig`: inercia, mouse, vira; y la deriva del aire y
 * el moiré por su cuenta), no en la compuerta.
 *
 * Así que para la escena la afirmación no es «no se monta» sino **«no se
 * mueve»**, y eso se mide sobre el píxel: dos capturas separadas por 5 s con la
 * página quieta y el puntero sin tocar. Con la preferencia puesta tienen que ser
 * prácticamente idénticas; **sin la preferencia, el mismo par tiene que
 * diferir** — ese es el control positivo que impide que «quieta» pase en verde
 * porque el canvas estaba negro o la página no cargó.
 */
function cuantoSeMovio(rutaA: string, rutaB: string): { pctPixeles: number; mediaDelta: number } {
  const A = decodificarPng(readFileSync(rutaA))
  const B = decodificarPng(readFileSync(rutaB))
  let distintos = 0
  let suma = 0
  const total = A.ancho * A.alto
  for (let i = 0; i < total; i += 1) {
    const k = i * 4
    const la = luminancia(A.datos[k], A.datos[k + 1], A.datos[k + 2])
    const lb = luminancia(B.datos[k], B.datos[k + 1], B.datos[k + 2])
    const d = Math.abs(la - lb) * 255
    suma += d
    if (d > 3) distintos += 1
  }
  return { pctPixeles: Math.round((10000 * distintos) / total) / 100, mediaDelta: Math.round((suma / total) * 1000) / 1000 }
}

const CASOS = [
  { id: '1440-normal', perfil: '1440', reducido: false, esperado: 'las tres, y la escena viva' },
  { id: '1440-reducido', perfil: '1440', reducido: true, esperado: 'sin scroll ni cursor, escena QUIETA' },
  { id: '1024-normal', perfil: '1024', reducido: false, esperado: 'ninguna de las tres' },
  { id: '1025-normal', perfil: '1025', reducido: false, esperado: 'las tres montadas' },
] as const

async function principal(): Promise<void> {
  mkdirSync(TEMP, { recursive: true })
  const filas: (LoQueMonto & { caso: string; esperado: string; cumple: boolean; problemas: string[] })[] = []

  for (const caso of CASOS) {
    const perfil = perfilPorId(caso.perfil)
    console.log(`  … caso ${caso.id}`)
    const leido = await conLaPagina(
      perfil,
      '/v3',
      async ({ pagina }) => {
        await esperarElPrimerCuadro(pagina)
        // ⚠️ La lectura va DESPUÉS del asentamiento, no antes. El chunk perezoso
        // de la escena a veces llega más tarde que la gracia de 1.200 ms en una
        // ruta fría de `next dev`, y leer ahí devolvía `escena: null` con la
        // escena dibujando —medido, un falso rojo en una de cada varias corridas—.
        await new Promise((r) => setTimeout(r, ASENTAMIENTO_DEL_CONTENIDO_MS))
        const leido = await medir<LoQueMonto>(pagina, LECTOR)
        const antes = `${TEMP}/quietud-${caso.id}-A.png`
        const despues = `${TEMP}/quietud-${caso.id}-B.png`
        await capturar(pagina, antes)
        // La espera va del lado de Node y no adentro de la página: un
        // `Runtime.evaluate` de 5 s con `awaitPromise` deja una petición de CDP
        // colgada todo ese rato, y si el objetivo se mueve en el medio la corrida
        // muere con «Inspected target navigated or closed». Medido: pasaba en el
        // primer caso, siempre.
        await new Promise((r) => setTimeout(r, VENTANA_DE_QUIETUD_MS))
        await capturar(pagina, despues)
        return { ...leido, quietud: cuantoSeMovio(antes, despues) }
      },
      {
        antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO],
        movimientoReducido: caso.reducido,
      },
    )

    const problemas: string[] = []
    // Lo primero: que la emulación TOMÓ. Sin esto, «con la preferencia puesta no
    // se monta nada» podría estar midiendo una corrida sin preferencia.
    if (leido.preferenciaLeidaPorLaPagina !== caso.reducido) {
      problemas.push(
        `la emulación NO tomó: la página lee ${leido.preferenciaLeidaPorLaPagina} y se pidió ${caso.reducido}`,
      )
    }
    if (leido.ancho !== perfil.ancho) problemas.push(`ancho ${leido.ancho}, se pidió ${perfil.ancho}`)

    const arribaDelUmbral = perfil.ancho >= 1025
    const tienenQueEstar = !caso.reducido && arribaDelUmbral
    const montadas = {
      'scroll suave': leido.scrollSuave !== null,
      cursor: leido.cursor !== null && leido.capasDelCursor === 2,
    }
    for (const [nombre, esta] of Object.entries(montadas)) {
      if (esta !== tienenQueEstar) {
        problemas.push(`${nombre}: ${esta ? 'MONTADA' : 'ausente'} y tendría que estar ${tienenQueEstar ? 'montada' : 'ausente'}`)
      }
    }
    // La escena se monta por ANCHO y nada más: la preferencia la apaga adentro.
    if ((leido.escena !== null) !== arribaDelUmbral) {
      problemas.push(`escena: ${leido.escena !== null ? 'MONTADA' : 'ausente'} y tendría que estar ${arribaDelUmbral ? 'montada' : 'ausente'}`)
    }
    // Y ahí sí: con la preferencia puesta tiene que estar QUIETA; sin ella, viva.
    if (arribaDelUmbral) {
      const q = leido.quietud
      if (caso.reducido && q.pctPixeles > 0.5) {
        problemas.push(`la escena SE MUEVE con la preferencia puesta: ${q.pctPixeles}% de los píxeles cambian en ${VENTANA_DE_QUIETUD_MS} ms (media ${q.mediaDelta})`)
      }
      if (!caso.reducido && q.pctPixeles < 5) {
        problemas.push(`control positivo CAÍDO: sin la preferencia la escena tendría que moverse y sólo cambia el ${q.pctPixeles}% de los píxeles`)
      }
    }
    // La clase que apagaría el `sticky`. Nunca, en ningún caso.
    if (leido.claseLenisStopped) problemas.push('el `<html>` tiene `lenis-stopped`: eso le pone `overflow: clip`')
    if (leido.overflowDelHtml !== 'visible') {
      problemas.push(`el \`overflow\` del \`<html>\` es "${leido.overflowDelHtml}" y tiene que ser "visible"`)
    }

    filas.push({ caso: caso.id, esperado: caso.esperado, cumple: problemas.length === 0, problemas, ...leido })
  }

  const ruta = guardarJson('b5-reducido', {
    que: 'las tres fuentes de movimiento de B5 contra la preferencia del entorno y contra el umbral de 1025',
    instrumento: 'scripts-b5/c-reducido.ts — la preferencia la pone Emulation.setEmulatedMedia, no el árbol',
    porQueNoEsUnInvariante:
      'la preferencia es una entrada de AFUERA del árbol; forzarla en un render y después afirmarla es verde por arnés (regla de B4-B). Acá el instrumento sólo pone la preferencia y verifica que la página la LEE; todo lo demás lo puso el producto.',
    controlPositivo:
      'los casos `1440-normal` y `1025-normal` tienen que ver las TRES montadas. Sin ellos, «no hay cursor» pasaría también si el cursor no existiera.',
    filas,
  })
  console.log(`escrito: ${ruta}`)
  for (const f of filas) {
    console.log(
      `  ${f.cumple ? 'ok   ' : 'FALLA'} ${f.caso.padEnd(16)} ${f.esperado.padEnd(22)} ` +
        `preferencia=${String(f.preferenciaLeidaPorLaPagina).padEnd(5)} scroll=${String(f.scrollSuave).padEnd(20)} ` +
        `cursor=${String(f.cursor).padEnd(26)} capas=${f.capasDelCursor} escena=${f.escena === null ? 'null' : 'sí'} ` +
        `lenis=${f.claseLenis} stopped=${f.claseLenisStopped} overflow=${f.overflowDelHtml} ` +
        `quietud=${f.quietud === undefined ? 'n/d' : `${f.quietud.pctPixeles}% · media ${f.quietud.mediaDelta}`}`,
    )
    for (const p of f.problemas) console.log(`         · ${p}`)
  }
  const fallas = filas.filter((f) => !f.cumple).length
  console.log(`\n  ${filas.length} casos, ${fallas} con falla`)
  if (fallas > 0) process.exitCode = 1
}

void principal()
