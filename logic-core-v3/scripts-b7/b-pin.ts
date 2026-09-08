/**
 * B7 · FRENTE B — EL PIN DE SERVICIOS, BARRIDO ENTERO, CON SUS DOS ELEMENTOS.
 *
 *     npx tsx scripts-b7/b-pin.ts
 *
 * ── El defecto que este archivo cierra ────────────────────────────────────
 *
 * B4-B publicó «el pin de `servicios` NO pinea en ningún perfil, ni siquiera a
 * 1920 — 0 paradas pegado de 243». La cifra era correcta y el elemento estaba
 * mal elegido: midió el **envoltorio** que emite `Seccion.tsx`, que para esta
 * sección llena a su padre y por lo tanto tiene **cero recorrido por
 * construcción**. El pin de verdad es el hijo `sticky` de la secuencia, que mide
 * una pantalla adentro de un contenedor de tres.
 *
 * ⚠️ **LA TRAMPA ES ESTRUCTURAL Y VA A VOLVER.** Un `sticky` son DOS elementos:
 * el hijo que se pega y el padre que le da recorrido. Medir la posición del hijo
 * devuelve el MISMO cero en los dos casos —el que está roto y el que nunca tuvo
 * recorrido—. La cifra que discrimina es `recorridoDisponible = alto del padre −
 * alto propio`, y por eso este barrido la publica **al lado de cada cero, sin
 * excepción**: es imposible leer una fila de esta salida sin saber de cuál de
 * los dos ceros se trata.
 *
 * ── Lo que se mide, y con qué ─────────────────────────────────────────────
 *
 *   · Scroll REAL, paso a paso. Nunca geometría: ver `b-pin-barrido.ts`.
 *   · Los dos bordes del pin afinados por bisección a 2 px, no al paso de 120.
 *   · Tres controles del SITIO: el pin de Trabajos —que anda— tiene que salir
 *     con su rango; el `<section>` y el padre del pin —que no son `sticky`—
 *     tienen que salir clasificados como tales. En la misma corrida y con el
 *     mismo predicado: un instrumento que devuelve lo mismo para los tres no
 *     separa nada.
 *   · Un control INYECTADO (`b-pin-arnes.ts`) donde sí hay un pin roto, porque
 *     el sitio no tiene ninguno y un barrido que nunca vio uno no puede afirmar
 *     que sabría verlo.
 *   · Los dos lados de la compuerta de 1025 —1920 y 1024, que es lo que el
 *     frente tiene pedido— y además 1440 y 1025, porque la promesa que se está
 *     cerrando depende del ALTO del viewport: el rango vale `alto − viewport`
 *     mientras el contenido entre en UNA pantalla, y 1025×768 es el perfil más
 *     bajo de los que montan la secuencia.
 *
 * `CENSO_DE_STICKIES` del padre se corre TAL CUAL en la misma sesión y se cruza
 * contra el censo de acá: si los dos instrumentos no dijeran lo mismo del mismo
 * elemento, ninguna cifra de este archivo se podría comparar con
 * `f0-reproduccion.json`, y el cruce lo detecta en vez de suponerlo.
 *
 * ── ⚠️ EL ORIGEN VA EN LA SALIDA, Y NO ES BUROCRACIA ──────────────────────
 *
 * Una corrida de este barrido dura minutos y toca 512 paradas. **Contra un
 * servidor de desarrollo COMPARTIDO, la página puede cambiar abajo del
 * instrumento**: pasó el 2026-09-07, con otro frente editando
 * `_lib/motion/reducido.ts` y `_lib/compuerta.ts` en el mismo árbol. El
 * hot-reload volvió a montar el árbol a mitad del barrido y la sección pasó de
 * la rama con coreografía a la apilada — con lo cual el pin «desapareció» y el
 * contenedor cambió de alto, sin que nada del producto estuviera mal.
 *
 * Lo detectó `huellasDistintas`, que compara la huella de cada candidato en CADA
 * parada contra la del censo: 69 y 146 desajustes en dos corridas, y la
 * comprobación «ninguna huella se movió» en rojo. **Esa es la diferencia entre
 * publicar un cero y publicar un cero que sabe de dónde vino.**
 *
 * Por eso el JSON guarda `origen` y `cuando`, y por eso las cifras que quedaron
 * escritas en los docblocks del producto se tomaron contra el **build de
 * producción del 3005**, que no se recarga:
 *
 *     B7_ORIGEN=http://localhost:3005 npx tsx scripts-b7/b-pin.ts
 *
 * Los dos orígenes —el dev del 3002 en una corrida limpia y el build del
 * 3005— dan **exactamente los mismos números**, al píxel y al `scrollY`. Eso es
 * lo que los hace citables.
 */

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { perfilPorId, type Perfil } from '../scripts-b4/perfiles'

import { conLaPagina, guardarJson, MARCA_DE_INTRO, ORIGEN, PUENTE_DE_AUTOMATIZACION } from './b7-comun'
import { correrElArnes, SELECTOR_DEL_QUIETO } from './b-pin-arnes'
import { barrer } from './b-pin-barrido'
import { clasificar, type BarridoDeCandidato } from './b-pin-lectores'
import {
  arribaDeLaCompuerta,
  CONTROLES,
  HUELLA_DEL_PIN,
  PASO,
  PASOS,
  PERFILES_A_BARRER,
  PRECISION,
  SECCION_DE_SERVICIOS,
  type Corrida,
} from './b-pin-comprobaciones'
import { comprobar } from './b-pin-controles'
import { CENSO_DE_STICKIES, type FichaDeSticky } from './lectores-layout'

/** Lo que el arnés inyecta, para el encabezado de su tabla. */
const QUE_INYECTA_EL_ARNES = 'un `sticky` bueno, uno roto por `overflow`, y una caja quieta'

/**
 * El cruce entre los dos censos. No es una formalidad: si el censo del padre y
 * el de acá discreparan sobre el recorrido de un elemento, las cifras de este
 * archivo y las de `f0-reproduccion.json` no se podrían poner en la misma tabla.
 */
function cruzar(
  mias: readonly BarridoDeCandidato[],
  delPadre: readonly FichaDeSticky[],
): readonly string[] {
  const problemas: string[] = []
  for (const f of delPadre) {
    const mia = mias.find((m) => m.ficha.huella === f.huella)
    if (mia === undefined) {
      problemas.push(`el padre ve «${f.huella}» y este censo no`)
      continue
    }
    if (Math.abs(mia.ficha.recorridoDisponible - f.recorridoDisponible) >= 1) {
      problemas.push(
        `«${f.huella}»: recorrido ${mia.ficha.recorridoDisponible} acá contra ${f.recorridoDisponible} en el censo del padre`,
      )
    }
  }
  return problemas
}

async function corrida(idPerfil: string): Promise<Corrida> {
  const perfil: Perfil = perfilPorId(idPerfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      const documento = await medir<number>(pagina, 'document.documentElement.scrollHeight')
      const censoDelPadre = await medir<readonly FichaDeSticky[]>(pagina, CENSO_DE_STICKIES)
      const { paradas, barridos } = await barrer(pagina, {
        selectores: CONTROLES,
        desdeY: 0,
        hastaY: documento - perfil.alto,
        paso: PASO,
        precision: PRECISION,
      })
      return {
        perfil: idPerfil,
        viewport: `${perfil.ancho}×${perfil.alto}`,
        altoDelViewport: perfil.alto,
        arribaDeLaCompuerta: arribaDeLaCompuerta(idPerfil),
        documento,
        paradas,
        filas: barridos.map((b) => {
          const v = clasificar(b)
          return { huella: b.ficha.huella, clase: v.clase, porQue: v.porQue, barrido: b }
        }),
        censoDelPadre,
        desacuerdosConElPadre: cruzar(barridos, censoDelPadre),
        recorridoDerivadoDeLaTabla: (PASOS - 1) * perfil.alto,
      }
    },
    { antesDelPintado: [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION], quien: 'b7-b-pin' },
  )
}

function imprimir(c: Corrida): void {
  console.log(`\n· ${c.viewport} — documento ${c.documento} px, ${c.paradas} paradas de ${PASO} px`)
  for (const f of c.filas) {
    const b = f.barrido
    console.log(`  [${f.clase}] ${f.huella.slice(0, 96)}`)
    console.log(
      `     hijo ${b.ficha.altoPropio} · padre ${b.ficha.altoDelPadre} · recorrido disponible ${b.ficha.recorridoDisponible}`,
    )
    console.log(`     ${f.porQue}`)
    if (b.huellasDistintas > 0) {
      console.log(`     ⚠️ ${b.huellasDistintas} paradas con la huella cambiada`)
    }
  }
  for (const d of c.desacuerdosConElPadre) {
    console.log(`  ⚠️ desacuerdo con CENSO_DE_STICKIES: ${d}`)
  }
}

async function principal(): Promise<void> {
  console.log(
    `Servicios declara ${PASOS} pasos → alto ${SECCION_DE_SERVICIOS.alto}. El pin se busca por «${HUELLA_DEL_PIN.slice(0, 64)}…»`,
  )
  const corridas = new Map<string, Corrida>()
  for (const id of PERFILES_A_BARRER) {
    const c = await corrida(id)
    corridas.set(id, c)
    imprimir(c)
  }

  console.log(`\n· ARNÉS — el control positivo inyectado: ${QUE_INYECTA_EL_ARNES}`)
  const arnes = await correrElArnes('1920', PASO, PRECISION)
  for (const f of arnes.filas) console.log(`  [${f.clase}] data-arnes=${f.marca} — ${f.porQue}`)

  const comprobaciones = comprobar(corridas, arnes)
  console.log('')
  for (const c of comprobaciones) {
    console.log(`  ${c.ok ? 'ok   ' : 'FALLA'} ${c.que}\n           ${c.obtenido}`)
  }
  const fallas = comprobaciones.filter((c) => !c.ok).length

  const ruta = guardarJson('b-pin', {
    instrumento: {
      origen: ORIGEN,
      cuando: new Date().toISOString(),
      pasoPx: PASO,
      precisionPx: PRECISION,
      predicado: 'el de LECTURA_DE_PEGADO de scripts-b7/lectores-layout.ts, sin tocarle un umbral',
      controlesDelSitio: CONTROLES,
      controlInyectado: SELECTOR_DEL_QUIETO,
      huellaDelPinDerivadaDe:
        'CLASE_DEL_STICKY de src/app/v3/_secciones/servicios/geometria.ts, no escrita a mano',
    },
    perfiles: Object.fromEntries(corridas),
    arnes,
    comprobaciones,
    fallas,
  })
  console.log(`\n→ ${ruta}`)
  console.log(`b-pin: ${comprobaciones.length} comprobaciones, ${fallas} fallas`)
  if (fallas > 0) process.exitCode = 1
}

void principal()
