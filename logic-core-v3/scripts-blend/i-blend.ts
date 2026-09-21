/**
 * I — V3 CON UN BLEND QUE DE VERDAD MEZCLA. El numero de `h-variantes.ts` no valia.
 *
 *     npx tsx scripts-blend/i-blend.ts [--ancho=768|375|todos]
 *
 * ── El defecto que este script arregla ────────────────────────────────────
 *
 * `h-variantes.ts` midio V3 con el destrabe de BLEND-1 §1.4 y dio dos cifras que
 * no podian ser las del blend:
 *
 *     768 CRUCE    21,32 % de glifo bajo AA   coincidencia con 255-fondo  19,59 %
 *     768 LIMPIO  100,00 %                    coincidencia                0,00 %
 *
 * El 100 % en la parada limpia es el que delata: sobre papel, `difference` con
 * fuente blanca da `255 - 246 = 9`, o sea texto casi negro y 17:1. Si sale 1,06:1
 * es porque el texto pinto BLANCO, no `255 - fondo`.
 *
 * **Y la causa esta en la quinta regla del destrabe.** Las cinco reglas hacen que
 * el grupo de mezcla sea `[data-v3]` con `isolation: isolate`, y para que el
 * canvas quede DEBAJO del texto le ponen `z-index: -1`. Pero una capa de z
 * negativo se pinta debajo del fondo de su propio elemento, asi que el papel
 * —que vive en `[data-v3]`— taparia el canvas; por eso la quinta regla muda el
 * papel a `body`. Y `body` esta AFUERA del grupo. Resultado: adentro del grupo,
 * donde el canvas es transparente, **no hay nada pintado**, y `difference`
 * contra la nada da blanco. O sea que el destrabe de BLEND-1 alcanza para probar
 * que la cadena LLEGA —que es lo que ese sprint queria— pero no para medir el
 * blend: le saca del backdrop justamente el papel.
 *
 * ── El destrabe con piso ──────────────────────────────────────────────────
 *
 * Mismas cuatro primeras reglas, y en vez de mudar el papel a `body` se le pone
 * un PISO ADENTRO del grupo: una capa fija en `z-index: -2`, o sea debajo del
 * canvas (-1) y arriba de nada. El orden de pintado adentro de `[data-v3]` queda
 * papel -> canvas -> texto, y los tres en el mismo grupo. Ahora si el backdrop
 * del texto es lo que se ve.
 *
 * ⚠️ Esto **sigue siendo instrumento y no propuesta**: para llevarlo a producto
 * habria que agregar un nodo y mover el piso de papel del sitio, que es
 * estructura y no una regla inyectada. Lo que este script contesta es una sola
 * pregunta: **cuanto vale V3 cuando el blend de verdad mezcla.**
 *
 * ── El control que separa el antialias de un corte ─────────────────────────
 *
 * La coincidencia con `255 - fondo` no puede llegar a 100 % ni con la cadena
 * perfecta: en el borde de un glifo la cobertura es parcial, el resultado es una
 * mezcla y no cae dentro de +-8 (BLEND-1 §1.3 lo declara y pone el techo en
 * ~70 %). Asi que aca la coincidencia se parte por COBERTURA, derivada de T:
 *
 *     cobertura = (papel - T) / (papel - tinta)
 *
 * y se publica aparte la de los pixeles de NUCLEO (cobertura >= 0,9). Si el
 * nucleo coincide y el borde no, lo que falta es antialias. Si el nucleo tampoco
 * coincide, la cadena sigue cortada y el numero no vale.
 */

import { medir } from '../scripts-b4/navegador'
import type { Perfil } from '../scripts-b4/perfiles'
import { cajaYTinta, ocultarPorSelector } from '../scripts-b5/pagina'
import type { Imagen, Mascara } from '../scripts-b8/glifo-alfa'

import { argumento, asentarElHome, conLaPagina, guardarJson } from './blend-comun'
import {
  ASENTAMIENTO_MS,
  BAJADA,
  CRUCE,
  ESCENA,
  LINEAS_DEL_DESTRABE,
  PERFILES,
  PONER_EL_BLEND,
  RAIZ_V3,
  apagarElOverlayDeDev,
  asegurarCarpetas,
  blendDerivado,
  blendPintado,
  conTintaFija,
  entregar,
  esperar,
  foto,
  fotoDeLaMascara,
  fotoDelFondo,
  mascara,
  scrollA,
  verificarElDestrabe,
  zonaMuerta,
  type Lectura,
  type Puesto,
} from './f-comun'

const ID_DEL_DESTRABE_CON_PISO = 'blend2-destrabe-con-piso'
const ID_DEL_PISO = 'blend2-piso'

/** Cobertura a partir de la cual un pixel de glifo cuenta como NUCLEO y no como borde. */
const COBERTURA_DE_NUCLEO = 0.9

/**
 * Las cuatro primeras reglas del destrabe de BLEND-1, mas el piso adentro del grupo.
 *
 * La regla que se saca es la de `body`, y se saca a proposito: ver el docblock.
 */
function DESTRABAR_CON_PISO(poner: boolean): string {
  const cuatro = LINEAS_DEL_DESTRABE.filter((l) => !l.startsWith('body {')).join('\n')
  return [
    '(async () => {',
    `  const viejoEstilo = document.getElementById(${JSON.stringify(ID_DEL_DESTRABE_CON_PISO)})`,
    '  if (viejoEstilo !== null) viejoEstilo.remove()',
    `  const viejoPiso = document.getElementById(${JSON.stringify(ID_DEL_PISO)})`,
    '  if (viejoPiso !== null) viejoPiso.remove()',
    `  if (${poner}) {`,
    '    const estilo = document.createElement("style")',
    `    estilo.id = ${JSON.stringify(ID_DEL_DESTRABE_CON_PISO)}`,
    `    estilo.textContent = ${JSON.stringify(cuatro)}`,
    '    document.head.appendChild(estilo)',
    `    const raiz = document.querySelector(${JSON.stringify(RAIZ_V3)})`,
    '    if (raiz === null) return { tomo: false, porque: "no esta la raiz" }',
    '    const piso = document.createElement("div")',
    `    piso.id = ${JSON.stringify(ID_DEL_PISO)}`,
    '    piso.style.cssText = "position:fixed;inset:0;z-index:-2;pointer-events:none;background-color:var(--color-fondo)"',
    '    raiz.insertBefore(piso, raiz.firstChild)',
    '  }',
    '  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))',
    '  const e = document.querySelector("[data-escena]")',
    `  const r = document.querySelector(${JSON.stringify(RAIZ_V3)})`,
    '  const m = document.querySelector("main")',
    '  if (e === null || r === null || m === null) return { tomo: false, porque: "falta un nodo" }',
    '  const ce = getComputedStyle(e), cr = getComputedStyle(r), cm = getComputedStyle(m)',
    `  const piso = document.getElementById(${JSON.stringify(ID_DEL_PISO)})`,
    '  const cp = piso === null ? null : getComputedStyle(piso)',
    `  const bien = ${poner}`,
    '    ? ce.zIndex === "-1" && cr.isolation === "isolate" && cm.zIndex === "auto" && cp !== null && cp.zIndex === "-2"',
    '    : ce.zIndex === "0" && cr.isolation === "auto" && cm.zIndex === "10" && piso === null',
    '  return { tomo: bien, porque: "escena z=" + ce.zIndex + " | raiz iso=" + cr.isolation + " | main z=" + cm.zIndex + " | piso " + (cp === null ? "(ninguno)" : cp.zIndex + " " + cp.backgroundColor) }',
    '})()',
  ].join('\n')
}

interface Coincidencia {
  readonly nucleo: number
  readonly nucleoPct: number
  readonly borde: number
  readonly bordePct: number
  readonly bajoAADelNucleo: number
  readonly bajoAADelNucleoPct: number
}

/**
 * La coincidencia con `255 - fondo`, partida por cobertura del glifo.
 *
 * Se cuenta solo donde las dos hipotesis —blend real y blanco de la cadena
 * cortada— predicen distinto, o sea con el fondo en 55 sRGB o mas: sobre el logo
 * casi negro las dos dan el mismo numero.
 */
function coincidenciaPorCobertura(
  T: Imagen,
  A: Imagen,
  B: Imagen,
  m: Mascara,
  fuente: readonly [number, number, number],
): Coincidencia {
  const papel = (m.papel[0] + m.papel[1] + m.papel[2]) / 3
  // La cobertura plena sale de lo OBSERVADO en T y no del `color` computado: con
  // el blend ya aplicado en el arbol, `color` ES el papel y el rango daria cero.
  // El percentil 1 del gris de glifo en T es el valor de cobertura plena en las
  // dos corridas (17 con la tinta normal, 0 con el blend puesto).
  const grises: number[] = []
  for (let i = 0; i < m.indices.length; i += 1) {
    const k = m.indices[i] * 4
    grises.push((T.datos[k] + T.datos[k + 1] + T.datos[k + 2]) / 3)
  }
  grises.sort((a, b) => a - b)
  const plena = grises[Math.floor(0.01 * grises.length)]
  const rango = papel - plena
  let nucleo = 0
  let nucleoOk = 0
  let borde = 0
  let bordeOk = 0
  let nucleoTotal = 0
  let nucleoBajoAA = 0
  for (let i = 0; i < m.indices.length; i += 1) {
    const k = m.indices[i] * 4
    const gT = (T.datos[k] + T.datos[k + 1] + T.datos[k + 2]) / 3
    const cobertura = rango === 0 ? 0 : (papel - gT) / rango
    const esNucleo = cobertura >= COBERTURA_DE_NUCLEO
    if (esNucleo) {
      nucleoTotal += 1
      const razon = razonDe(A, B, k)
      if (razon < 4.5) nucleoBajoAA += 1
    }
    const gFondo = (A.datos[k] + A.datos[k + 1] + A.datos[k + 2]) / 3
    if (gFondo < 55) continue
    const d = Math.max(
      Math.abs(B.datos[k] - Math.abs(A.datos[k] - fuente[0])),
      Math.abs(B.datos[k + 1] - Math.abs(A.datos[k + 1] - fuente[1])),
      Math.abs(B.datos[k + 2] - Math.abs(A.datos[k + 2] - fuente[2])),
    )
    if (esNucleo) {
      nucleo += 1
      if (d <= 8) nucleoOk += 1
    } else {
      borde += 1
      if (d <= 8) bordeOk += 1
    }
  }
  const dos = (v: number): number => Math.round(v * 100) / 100
  return {
    nucleo,
    nucleoPct: nucleo === 0 ? Number.NaN : dos((100 * nucleoOk) / nucleo),
    borde,
    bordePct: borde === 0 ? Number.NaN : dos((100 * bordeOk) / borde),
    bajoAADelNucleo: nucleoBajoAA,
    bajoAADelNucleoPct: nucleoTotal === 0 ? Number.NaN : dos((100 * nucleoBajoAA) / nucleoTotal),
  }
}

/** El contraste de UN pixel: lo pintado (B) contra el fondo (A). Se usa para el nucleo. */
function razonDe(A: Imagen, B: Imagen, k: number): number {
  const lum = (r: number, g: number, b: number): number => {
    const c = (v: number): number => {
      const s = v / 255
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
  }
  const l1 = lum(B.datos[k], B.datos[k + 1], B.datos[k + 2])
  const l2 = lum(A.datos[k], A.datos[k + 1], A.datos[k + 2])
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

function linea(etiqueta: string, l: Lectura, extra: string): string {
  return `    ${etiqueta.padEnd(16)} ${String(l.bajoAA).padStart(6)}/${l.pixeles}  ${String(l.bajoAAPct).padStart(6)}%  peor ${String(l.peor).padStart(5)}  mediana ${String(l.mediana).padStart(6)}  ${extra}`
}

async function conElAncho(perfil: Perfil): Promise<Record<string, unknown>> {
  const y = CRUCE[perfil.id]
  return conLaPagina(
    perfil,
    '/v3',
    async (s) => {
      await asentarElHome(s)
      await apagarElOverlayDeDev(s.pagina)
      const porParada: Record<string, unknown> = {}

      const aplicado = argumento('aplicado', 'no') === 'si'
      for (const parada of ['cruce', 'limpio'] as const) {
        await scrollA(s.pagina, y)
        if (!(await ocultarPorSelector(s.pagina, ESCENA, parada === 'limpio'))) throw new Error('no se pudo poner el estado de la escena')
        await esperar(ASENTAMIENTO_MS)
        console.log(`\n    --- ${perfil.id} | ${parada.toUpperCase()} (scroll ${y}${parada === 'limpio' ? ', escena apagada' : ''})`)

        const texto = await cajaYTinta(s.pagina, BAJADA)
        if (texto.cajas.length === 0) throw new Error('la bajada no devolvio caja de texto')
        const tinta: readonly [number, number, number] = [texto.tinta[0], texto.tinta[1], texto.tinta[2]]
        const T =
          parada === 'limpio'
            ? await foto(s.pagina, `i-${perfil.id}-${parada}-t`)
            : await fotoDeLaMascara(s.pagina, `i-${perfil.id}-${parada}-t`)
        const m = mascara(T, texto.cajas)
        const A0 = await fotoDelFondo(s.pagina, `i-${perfil.id}-${parada}-a0`)
        // El compuesto SIN tratamiento: es lo que V0 pinta de verdad, antialias incluido.
        const C = await foto(s.pagina, `i-${perfil.id}-${parada}-c`)
        const v0 = conTintaFija(m, A0, tinta)
        const zm = zonaMuerta(m, A0)
        console.log(linea('V0 tinta', v0, `fondo mediano ${zm.fondoMediano} | zona muerta AA ${zm.pctAA}% | nucleo ${zm.pctNucleo}%`))

        /**
         * ⚠️ V0 Y V3 NO SE MIDEN IGUAL, Y HAY QUE PONERLOS EN LA MISMA VARA.
         *
         * `conTintaFija` —el instrumento del repo desde B5— le pone la tinta PLENA
         * a todo pixel de la mascara, asi que nunca cobra el antialias. `blendPintado`
         * lee el pixel de verdad, asi que SI lo cobra. Comparar las dos columnas
         * directamente le cargaria al blend un costo que el control no paga.
         *
         * Asi que aca se mide V0 con la vara del otro: el compuesto pintado (C)
         * contra el fondo (A0). Lo que queda comparable es la columna de NUCLEO.
         */
        const v0Pintado = blendPintado(m, A0, C)
        const v0PorCobertura = coincidenciaPorCobertura(T, A0, C, m, tinta)
        console.log(linea('V0 pintado', v0Pintado, `misma vara que V3 | nucleo ${v0PorCobertura.bajoAADelNucleo} px bajo AA (${v0PorCobertura.bajoAADelNucleoPct}%)`))

        // ⚠️ `--aplicado=si` NO inyecta: mide el arbol tal como esta. Es el unico
        // modo que cierra la medicion, porque hasta que el numero no se reproduce
        // sobre el codigo real lo unico probado es la inyeccion.
        const fuente: readonly [number, number, number] = aplicado ? tinta : [255, 255, 255]
        let destrabe: Puesto = { tomo: true, porque: 'el arbol ya lo trae (--aplicado)' }
        if (!aplicado) {
          destrabe = await medir<Puesto>(s.pagina, DESTRABAR_CON_PISO(true))
          if (!destrabe.tomo) throw new Error(`el destrabe con piso no tomo: ${destrabe.porque}`)
        }
        console.log(`    destrabe: ${destrabe.porque}`)
        const A = await fotoDelFondo(s.pagina, `i-${perfil.id}-${parada}-a`)
        if (!aplicado) await medir<Puesto>(s.pagina, PONER_EL_BLEND(true))
        const compuesto = `i-${perfil.id}-${parada}-v3`
        await foto(s.pagina, compuesto)
        const B = await foto(s.pagina, `i-${perfil.id}-${parada}-b`)
        if (!aplicado) {
          await medir<Puesto>(s.pagina, PONER_EL_BLEND(false))
          const vuelta = await medir<Puesto>(s.pagina, DESTRABAR_CON_PISO(false))
          if (!vuelta.tomo) throw new Error(`el destrabe con piso no volvio: ${vuelta.porque}`)
        }

        const pintado = blendPintado(m, A, B, fuente)
        const derivado = blendDerivado(m, A)
        const cob = coincidenciaPorCobertura(T, A, B, m, fuente)
        entregar(compuesto, `v3-${perfil.id}-${parada}`)

        console.log(linea('V3 pintado', pintado, `coincidencia global ${pintado.coincidencia}% sobre ${pintado.discriminantes}`))
        console.log(linea('V3 derivado', derivado, 'techo analitico, sin antialias'))
        console.log(`    cobertura        nucleo ${cob.nucleoPct}% de ${cob.nucleo} px | borde ${cob.bordePct}% de ${cob.borde} px`)
        console.log(`    y el nucleo solo ${cob.bajoAADelNucleo} px bajo AA (${cob.bajoAADelNucleoPct}%)`)

        porParada[parada] = {
          scrollY: y,
          pixelesDeGlifo: m.indices.length,
          tinta,
          zonaMuerta: zm,
          v0,
          v0Pintado,
          v0PorCobertura,
          pintado,
          derivado,
          cobertura: cob,
          destrabe: destrabe.porque,
        }
      }
      if (!(await ocultarPorSelector(s.pagina, ESCENA, false))) throw new Error('la escena quedo apagada')
      return { ancho: perfil.id, porParada }
    },
    { quien: 'blend3' },
  )
}

async function principal(): Promise<void> {
  verificarElDestrabe()
  asegurarCarpetas()
  const pedido = argumento('ancho', 'todos')
  const elegidos = pedido === 'todos' ? PERFILES : PERFILES.filter((p) => p.id === pedido)
  const salida: Record<string, unknown>[] = []
  for (const perfil of elegidos) {
    console.log(`\n=== ${perfil.id} (${perfil.ancho}x${perfil.alto})`)
    salida.push(await conElAncho(perfil))
  }
  console.log(`\n  ${guardarJson('f-blend-con-piso', { coberturaDeNucleo: COBERTURA_DE_NUCLEO, anchos: salida })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
