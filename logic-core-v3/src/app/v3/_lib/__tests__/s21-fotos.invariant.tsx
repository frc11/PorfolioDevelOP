/**
 * ⚠️ INVARIANTE — LOS PLACEHOLDERS DE FOTO (B12 §4.3).
 *
 * Corre con `npm run test:s21-fotos`. Lo que custodia es la regla 6 del sprint
 * y el pedido textual del humano, que son cuatro cosas a la vez:
 *
 *   1. **Ninguna imagen de terceros.** Los tres archivos se GENERAN acá, con
 *      `scripts-b12/placeholders.ts`, y esto lo comprueba **regenerándolos en
 *      memoria y comparando byte a byte**: si alguien reemplazara uno por una
 *      foto bajada de algún lado, el sha1 no coincide y esto se pone en rojo.
 *      No es una promesa escrita en un comentario: es una igualdad.
 *   2. **Blanco y negro, y estructuralmente.** El PNG es de tipo de color 0
 *      —escala de grises, un canal— así que no es que no se haya usado color:
 *      es que **el formato no tiene dónde ponerlo**. Se lee de la cabecera.
 *   3. **La relación de aspecto de una foto real**, y la que su sección
 *      declara: 1800×1200 la del equipo, 1920×1080 el panel y el póster. Los
 *      números salen del componente, no de acá.
 *   4. **Y el peso de una foto real**, que es lo que hace que la página cargue
 *      como va a cargar. Un placeholder de dos kilobytes no dice nada.
 *
 * Y una quinta, que es la que impide el peor final: **que se vean como
 * placeholders.** Eso no lo puede afirmar un instrumento mirando píxeles, así
 * que se afirma lo que sí es comprobable — que el marcador sigue escrito
 * ENCIMA, en texto, en el marcado que sale.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { PLACEHOLDERS, png } from '../../../../../scripts-b12/placeholders'
import { MarcoDeMedio } from '../../_secciones/_contrato/medios'
import { marcar } from '../../_secciones/_invariantes/render'
import { RAIZ } from '../../_secciones/_invariantes/soporte'
import { textoVisible } from '../../_secciones/_contrato/escaneo'
import { CONTENIDO as CONTENIDO_QUIENES } from '../../_secciones/quienes-somos/contenido'
import { GEOMETRIA, SIZES_DE_LA_FOTO } from '../../_secciones/quienes-somos/QuienesSomos'
import { CAPTURA } from '../../_secciones/tu-panel/contenido'
import { ALTO_DEL_MEDIO, ANCHO_DEL_MEDIO, POSTER_PROVISIONAL } from '../../_secciones/servicios/contenido'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

/** La banda de peso declarada, en KiB. Abajo no pesa como una foto; arriba deja
 *  de ser un placeholder y pasa a ser un problema de carga. */
const PESO_MINIMO_KIB = 150
const PESO_MAXIMO_KIB = 450

const leer = (relativo: string): Buffer => readFileSync(path.join(RAIZ, relativo))
const kib = (n: number): string => `${(n / 1024).toFixed(1)} KiB`

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Los tres existen, y son EXACTAMENTE lo que este repo genera')

afirmarIgual(PLACEHOLDERS.length, 3, 'son tres placeholders: la foto del equipo, la captura del panel y el póster')

for (const p of PLACEHOLDERS) {
  const enDisco = leer(p.archivo)
  const regenerado = png(p.ancho, p.alto, p.semilla)
  afirmar(
    enDisco.equals(regenerado),
    `\`${p.archivo}\` es byte a byte lo que \`scripts-b12/placeholders.ts\` produce`,
    `${kib(enDisco.length)} · ${p.ancho}×${p.alto} · ${p.que}`,
  )
}

/** Dos archivos iguales con nombres distintos son un duplicado esperando a que
 *  alguien borre el que no era. El panel y el póster miden lo mismo. */
const huellas = PLACEHOLDERS.map((p) => leer(p.archivo).toString('base64').slice(0, 64))
afirmarIgual(new Set(huellas).size, PLACEHOLDERS.length, 'y los tres son distintos entre sí, aunque dos midan lo mismo')

controlPositivo(
  'la comparación vería un archivo que no salió de acá',
  Buffer.from('una foto bajada de internet'),
  (otro: Buffer) => otro.equals(png(PLACEHOLDERS[0].ancho, PLACEHOLDERS[0].alto, PLACEHOLDERS[0].semilla)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · ⚠️ SIN COLOR, Y POR FORMATO: escala de grises de un canal')

for (const p of PLACEHOLDERS) {
  const buf = leer(p.archivo)
  const firma = buf.subarray(0, 8).toString('hex')
  const ancho = buf.readUInt32BE(16)
  const alto = buf.readUInt32BE(20)
  const profundidad = buf[24]
  const tipoDeColor = buf[25]
  afirmar(
    firma === '89504e470d0a1a0a' && profundidad === 8 && tipoDeColor === 0,
    `\`${p.archivo}\` — PNG de 8 bits, tipo de color 0: no hay dónde poner un color`,
    `firma ${firma} · profundidad ${profundidad} · tipo ${tipoDeColor}`,
  )
  afirmarIgual([ancho, alto], [p.ancho, p.alto], `  y mide ${p.ancho}×${p.alto} en su propia cabecera`)
}

controlPositivo(
  'el lector de la cabecera vería un PNG en color',
  Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.alloc(17), Buffer.from([8, 6])]),
  (buf: Buffer) => buf[25] === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La relación de aspecto es la que declara la SECCIÓN, no una de acá')

const DECLARADAS: readonly { archivo: string; ancho: number; alto: number; quien: string }[] = [
  { archivo: 'public/placeholders/equipo.png', ancho: GEOMETRIA.foto.ancho, alto: GEOMETRIA.foto.alto, quien: '`GEOMETRIA.foto` de Quiénes somos' },
  { archivo: 'public/placeholders/panel.png', ancho: CAPTURA.ancho, alto: CAPTURA.alto, quien: '`CAPTURA` de Tu panel' },
  { archivo: 'public/placeholders/poster.png', ancho: ANCHO_DEL_MEDIO, alto: ALTO_DEL_MEDIO, quien: 'el medio de Servicios' },
]

for (const d of DECLARADAS) {
  const p = PLACEHOLDERS.find((x) => x.archivo === d.archivo)
  afirmarIgual(
    [p?.ancho, p?.alto],
    [d.ancho, d.alto],
    `\`${d.archivo}\` mide lo que pide ${d.quien}: ${d.ancho}×${d.alto} (${(d.ancho / d.alto).toFixed(3)}:1)`,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Y PESAN como una foto — que es la mitad del pedido')

for (const p of PLACEHOLDERS) {
  const peso = leer(p.archivo).length / 1024
  afirmar(
    peso >= PESO_MINIMO_KIB && peso <= PESO_MAXIMO_KIB,
    `\`${p.archivo}\` — ${kib(leer(p.archivo).length)}, adentro de la banda declarada (${PESO_MINIMO_KIB}–${PESO_MAXIMO_KIB} KiB)`,
  )
}
console.log('  ⚠️ NO entran en el presupuesto de `s5-peso`: ése mide lo que el lane ESCRIBE en JS,')
console.log('     y una imagen de `public/` no es un chunk. El peso de las tres se publica en el reporte.')
console.log(`     Las tres capturas REALES de Trabajos, para comparar: ${['banu', 'esquina', 'el-garage'].map((n) => kib(leer(`public/capturas/${n}.webp`).length)).join(' · ')} (webp, ya optimizadas).`)

controlPositivo('la banda vería un placeholder de dos kilobytes', 2, (peso: number) => peso >= PESO_MINIMO_KIB)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · ⚠️ SE VEN COMO PLACEHOLDERS: el marcador queda escrito ENCIMA')

const conFoto = marcar(
  <MarcoDeMedio
    marcador={CONTENIDO_QUIENES.equipo.marcador}
    fuente={CONTENIDO_QUIENES.equipo.fuente}
    provisional
    alt={CONTENIDO_QUIENES.equipo.alt}
    ancho={GEOMETRIA.foto.ancho}
    alto={GEOMETRIA.foto.alto}
    sizes={SIZES_DE_LA_FOTO}
  />,
  { anima: false },
)

afirmar(conFoto.includes('data-medio="placeholder"'), 'el marco provisional se declara `placeholder` y no `marcador`: hay archivo, y no es la foto')
afirmar(textoVisible(conFoto).includes(CONTENIDO_QUIENES.equipo.marcador), `  y ${CONTENIDO_QUIENES.equipo.marcador} se lee ENCIMA de la imagen, en texto`)
afirmar(conFoto.includes(encodeURIComponent(CONTENIDO_QUIENES.equipo.fuente)), '  con la imagen de verdad abajo, con su peso y su `sizes`')
afirmar(conFoto.includes(`data-sizes="${SIZES_DE_LA_FOTO}"`), '  y el `sizes` escrito, que es lo que el día de la foto no hay que volver a pensar')
afirmar(/<img[^>]*alt=""/.test(conFoto), '  ⚠️ el `alt` de la imagen va VACÍO: contarle a quien no ve una foto que no existe sería la misma mentira que este contrato evita')
afirmar(conFoto.includes('border-dashed'), '  y el borde punteado, que es el lenguaje del hueco en las ocho secciones')

controlPositivo(
  'el chequeo del marcador encima vería un marco sin él',
  '<figure data-medio="placeholder"><img src="/x.png" alt=""/></figure>',
  (html: string) => textoVisible(html).includes(CONTENIDO_QUIENES.equipo.marcador),
)
afirmar(POSTER_PROVISIONAL === 'public/placeholders/poster.png'.replace('public', ''), 'y el póster de Servicios apunta al archivo servido, no a uno de disco', POSTER_PROVISIONAL)

cerrar('s21-fotos.invariant')
