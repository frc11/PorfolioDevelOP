/**
 * B7 · FRENTE C — EL CONTRASTE DEL CUERPO DEL DIFERENCIAL (`D-B5.1`).
 *
 *     npx tsx scripts-b7/c-contraste.ts antes      → guarda `c-contraste-antes`
 *     npx tsx scripts-b7/c-contraste.ts despues    → guarda `c-contraste-despues`
 *
 * ── Qué agrega sobre `f0-contraste.ts`, y por qué no lo reemplaza ─────────
 *
 * El agregado es **el mismo**: la misma secuencia de `c-glifo-medicion.ts`, la
 * misma lista de cajas, el mismo piso de 3000 píxeles de glifo, el mismo puntero
 * quieto en el centro y el mismo `scrollY`. Si esta corrida no reprodujera las
 * cifras de la Fase 0, la columna «después» no se podría comparar con nada.
 *
 * Lo que agrega es **de dónde salen los píxeles bajo AA**, porque sin eso no se
 * puede elegir palanca:
 *
 *   · **Por elemento.** El selector `.font-cuerpo` del panel matchea SEIS
 *     elementos —el rótulo, los cuatro cuerpos de tarjeta y el del testimonio— y
 *     el agregado los promedia. Un 34,72 % repartido parejo pide una palanca de
 *     sistema; concentrado en un elemento, pide moverlo. Cada elemento se mide
 *     llamando a **la misma función** con una lista de una sola caja: no hay un
 *     segundo criterio de glifo.
 *
 *   · **Por franja vertical.** Cada caja se corta en franjas de
 *     `ANCHO_DE_FRANJA` y cada franja se mide con la misma llamada. Es lo que
 *     dice si el fondo oscuro entra por un lado —el logo de la escena— o si está
 *     por todos lados. Fue lo que decidió el arreglo: a 1440 el testimonio tenía
 *     cuatro franjas en 1,10 · 1,97 · 1,10 · 4,22:1 y las tarjetas no tenían
 *     ninguna.
 *
 * ⚠️ **Las franjas y los elementos NO son otro instrumento.** Los tres niveles
 * —agregado, elemento, franja— son la MISMA función sobre las MISMAS dos
 * capturas; lo único que cambia es qué rectángulos se le pasan. Dos criterios de
 * glifo distintos producirían dos números que no se pueden comparar.
 *
 * ⚠️ **El piso de píxeles de glifo (3000) se aplica al AGREGADO y sólo ahí.**
 * Una franja de 40 px de ancho tiene por construcción pocos píxeles de glifo:
 * exigirle el piso convertiría el desglose en un error. El piso existe para que
 * «cero píxeles bajo AA» no sea verde por vacío, y esa afirmación se hace sobre
 * el agregado, que es la que se publica.
 *
 * ⚠️ **LA COLUMNA «ANTES» SE TOMÓ CON ESTE MISMO ARCHIVO ANTES DE QUE LA
 * SECUENCIA SE EXTRAJERA A `c-glifo-medicion.ts`**, y eso queda dicho en vez de
 * taparse. El control de que la extracción no movió nada es que la columna
 * «después» se volvió a tomar con la versión extraída y reprodujo sus cifras
 * dentro del ruido de una escena que se mueve.
 */

import type { CajaDeTexto } from '../scripts-b5/glifo'

import { dos, guardarJson } from './b7-comun'
import { sellarCarpeta } from './c-sello'
import {
  carpetaTemporal,
  leerElContraste,
  medirElContrasteBajoElGlifo,
  type Escenario,
} from './c-glifo-medicion'

const TEMP = carpetaTemporal('b7-c-contraste')

/** El piso de B5. Se exige al AGREGADO — ver el docblock. */
const MINIMO_DE_GLIFO = 3000

const ANCHO_DE_FRANJA = 40

interface EscenarioDelDefecto extends Escenario {
  /** `false` para los controles: no se les exige el piso y no deciden nada. */
  readonly esElDefecto: boolean
}

const ESCENARIOS: readonly EscenarioDelDefecto[] = [
  {
    id: 'diferencial-cuerpo-1440',
    perfil: '1440',
    scrollY: 14800,
    selectorDelTexto: '[data-panel="por-que-develop"] .font-cuerpo',
    textoGrande: false,
    esElDefecto: true,
  },
  /** El titular del mismo panel, que B5 midió cómodo. Es el control de la sección. */
  {
    id: 'diferencial-titular-1440',
    perfil: '1440',
    scrollY: 14400,
    selectorDelTexto: '[data-panel="por-que-develop"] .text-fluido-titulo-xl',
    textoGrande: true,
    esElDefecto: false,
  },
  {
    id: 'diferencial-cuerpo-1920',
    perfil: '1920',
    scrollY: 17600,
    selectorDelTexto: '[data-panel="por-que-develop"] .font-cuerpo',
    textoGrande: false,
    esElDefecto: true,
  },
]

function franjasDe(caja: CajaDeTexto): CajaDeTexto[] {
  const franjas: CajaDeTexto[] = []
  for (let x = caja.x; x < caja.x + caja.ancho; x += ANCHO_DE_FRANJA) {
    franjas.push({
      x,
      y: caja.y,
      ancho: Math.min(ANCHO_DE_FRANJA, caja.x + caja.ancho - x),
      alto: caja.alto,
    })
  }
  return franjas
}

async function medirEscenario(e: EscenarioDelDefecto): Promise<unknown> {
  const m = await medirElContrasteBajoElGlifo(e, TEMP)
  if (e.esElDefecto && m.agregado.pixelesDeGlifo < MINIMO_DE_GLIFO) {
    throw new Error(
      `${e.id} @ ${m.scrollYReal}: sólo ${m.agregado.pixelesDeGlifo} píxeles de glifo (piso ${MINIMO_DE_GLIFO}). ` +
        'Cualquier contraste de acá sería verde por vacío.',
    )
  }
  const leer = (cajas: readonly CajaDeTexto[]) =>
    leerElContraste(m.rutaDeLaMascara, m.rutaDelFondo, cajas, m.tinta, e.textoGrande)

  return {
    id: e.id,
    perfil: e.perfil,
    scrollY: e.scrollY,
    scrollYReal: m.scrollYReal,
    selectorDelTexto: e.selectorDelTexto,
    textoGrande: e.textoGrande,
    umbralAA: m.umbralAA,
    texto: m.texto,
    elementos: m.elementos,
    cajas: m.cajas.length,
    caja: m.caja,
    tinta: m.tinta,
    ...m.agregado,
    porElemento: m.cajas.map((c, i) => ({
      indice: i,
      rotulo: m.rotulos[i] ?? {},
      caja: {
        x: dos(c.x),
        y: dos(c.y),
        ancho: dos(c.ancho),
        alto: dos(c.alto),
        derecha: dos(c.x + c.ancho),
      },
      ...leer([c]),
      franjas: franjasDe(c)
        .map((f) => ({ x: dos(f.x), ...leer([f]) }))
        .filter((f) => f.pixelesDeGlifo > 0),
    })),
  }
}

async function principal(): Promise<void> {
  const sufijo = process.argv[2] ?? ''
  const asunto = sufijo === '' ? 'c-contraste' : `c-contraste-${sufijo}`
  const filas: unknown[] = []
  for (const e of ESCENARIOS) {
    console.log(`· ${e.id} — ${e.perfil}, scrollY ${e.scrollY}`)
    try {
      const fila = await medirEscenario(e)
      filas.push(fila)
      const f = fila as { pixelesDeGlifo: number; medianaContraste: number; peorContraste: number; bajoAA: number; porcientoBajoAA: number; porElemento: readonly unknown[] }
      console.log(
        `  glifo ${f.pixelesDeGlifo} px · mediana ${f.medianaContraste}:1 · peor ${f.peorContraste}:1 · bajo AA ${f.bajoAA} (${f.porcientoBajoAA} %)`,
      )
      for (const el of f.porElemento) {
        const x = el as {
          indice: number
          rotulo: { texto?: string; tamano?: string }
          pixelesDeGlifo: number
          medianaContraste: number
          bajoAA: number
          porcientoBajoAA: number
        }
        console.log(
          `    [${x.indice}] ${x.rotulo.tamano ?? '?'} «${(x.rotulo.texto ?? '').slice(0, 30)}» ` +
            `glifo ${x.pixelesDeGlifo} · mediana ${x.medianaContraste}:1 · bajo AA ${x.bajoAA} (${x.porcientoBajoAA} %)`,
        )
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error)
      filas.push({ id: e.id, error: mensaje })
      console.log(`  ✗ ${mensaje}`)
      // Ver la nota de `c-tipografia.ts`: un escenario que tira tiene que dejar
      // la corrida en rojo, no en un renglón que alguien lea o no lea.
      process.exitCode = 1
    }
  }
  /**
   * ⚠️ **EL SELLO VA EN LOS DOS ARTEFACTOS, Y ES LO QUE ATA LOS PÍXELES A LA
   * GEOMETRÍA.** Sin él, `c-palancas` y `c-mapa` re-derivan cajas de esta
   * corrida sobre PNG de otra y no falla nada. El porqué, con el número que lo
   * destapó, está en `c-sello.ts`.
   */
  const sello = sellarCarpeta(TEMP, asunto)
  console.log(`  sello de la corrida: ${sello.archivos} PNG, ${sello.bytes} B, ${sello.huella}`)
  console.log(`\n→ ${guardarJson(asunto, { filas, temp: TEMP, sello })}`)
}

void principal()
