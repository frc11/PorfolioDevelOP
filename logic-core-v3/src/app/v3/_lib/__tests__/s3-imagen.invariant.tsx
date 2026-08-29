/**
 * INVARIANTE — el `srcset` lleva descriptores de ANCHO, y un `sizes` ausente
 * se rechaza.
 *
 * Corre con `npm run test:s3-imagen`.
 *
 * ── El defecto medido ─────────────────────────────────────────────────────
 *
 * El `srcset` de la referencia usa descriptores de densidad (`1x`, `2x`) con
 * `sizes` en `null`. Con densidad el navegador elige por `devicePixelRatio` y
 * **no mira el ancho de la caja**: de 768 a 1920 descarga exactamente lo
 * mismo, en las 134 imágenes del sitio.
 *
 * ── Por qué hacen falta tres capas y no una ───────────────────────────────
 *
 * Cada una atrapa algo que las otras dejan pasar:
 *   · el TIPO atrapa el olvido — sin `sizes` no compila;
 *   · la VALIDACIÓN atrapa el `sizes=""`, que compila perfecto;
 *   · el ESCÁNER atrapa a quien agregue otro componente de imagen que no pase
 *     por el nuestro, que es la forma en que estas reglas se pierden de verdad.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { Imagen, type ImagenProps } from '../../_componentes/medios/Imagen'
import { ESCENARIO_MIN_ANCHO_PX } from '../compuerta'
import {
  ANCHO_TABLET_PX,
  CLAVE_DE_OVERRIDE_DE_ESCALERA,
  ERROR_SIZES_AUSENTE,
  sizesPorColumnas,
  sizesPorTresTramos,
  sizesPorViewport,
} from '../imagen'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { ARCHIVOS_DE_CODIGO, leer } from './s3-archivos'
import { resolver, tokensDelTema } from './s3-css'
import { quitarComentarios } from './s3-escaneo'

const tokens = tokensDelTema()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El srcset emitido usa descriptores de ANCHO')

const html = renderToStaticMarkup(
  <Imagen src="/logodevelOP.png" alt="" ancho={1024} alto={1024} sizes={sizesPorViewport(33)} />,
)

const srcset = /srcSet="([^"]*)"|srcset="([^"]*)"/.exec(html)
afirmar(srcset !== null, 'la imagen emite un srcset')
const candidatos = (srcset?.[1] ?? srcset?.[2] ?? '').split(',').map((c) => c.trim()).filter(Boolean)
afirmar(candidatos.length > 1, `con ${candidatos.length} candidatos`, candidatos.length.toString())

const conDescriptorDeAncho = candidatos.filter((c) => /\s\d+w$/.test(c))
const conDescriptorDeDensidad = candidatos.filter((c) => /\s\d+(\.\d+)?x$/.test(c))
afirmarIgual(conDescriptorDeAncho.length, candidatos.length, 'todos con descriptor `w`')
afirmarIgual(conDescriptorDeDensidad, [], 'ninguno con descriptor de densidad — el defecto medido')

afirmar(/sizes="[^"]+"/.test(html), 'y el atributo `sizes` viaja en el HTML', /sizes="([^"]*)"/.exec(html)?.[1])

controlPositivo(
  'el lector de descriptores distingue `w` de `x`',
  '/a.png 1x, /b.png 2x',
  (valor) =>
    valor
      .split(',')
      .map((c) => c.trim())
      .every((c) => /\s\d+w$/.test(c)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Un `sizes` vacío se rechaza en construcción')

function construir(props: ImagenProps): 'ok' | string {
  try {
    Imagen(props)
    return 'ok'
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

const base = { src: '/logodevelOP.png', alt: '', ancho: 1024, alto: 1024 }
afirmarIgual(construir({ ...base, sizes: sizesPorViewport(33) }), 'ok', 'con un sizes real construye')
afirmarIgual(construir({ ...base, sizes: '' }), ERROR_SIZES_AUSENTE, 'con `""` tira, con el mensaje entero')
afirmarIgual(construir({ ...base, sizes: '   ' }), ERROR_SIZES_AUSENTE, 'y con espacios en blanco, también')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Ningún uso de <Imagen> en el árbol se queda sin `sizes`')

/** Los usos de `<Imagen` que no declaran `sizes` antes de cerrar la etiqueta. */
function usosSinSizes(codigo: string): string[] {
  return [...quitarComentarios(codigo).matchAll(/<Imagen\b[\s\S]*?\/?>/g)]
    .map((m) => m[0])
    .filter((uso) => !/\bsizes=/.test(uso))
}

const usos = ARCHIVOS_DE_CODIGO.flatMap((a) => usosSinSizes(leer(a)))
afirmarIgual(usos, [], 'todos los usos declaran sizes')

const cuantosUsos = ARCHIVOS_DE_CODIGO.reduce(
  (total, a) => total + [...quitarComentarios(leer(a)).matchAll(/<Imagen\b/g)].length,
  0,
)
afirmar(cuantosUsos > 0, `hay ${cuantosUsos} uso(s) que el escáner tuvo que mirar`, 'no es verde por vacío')

controlPositivo(
  'el escáner ve un uso sin sizes',
  '<Imagen src="/x.png" alt="" ancho={10} alto={10} />',
  (codigo) => usosSinSizes(codigo).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Los `sizes` se componen desde el breakpoint del sistema')

afirmarIgual(
  sizesPorViewport(33),
  `(min-width: ${ESCENARIO_MIN_ANCHO_PX}px) 33vw, 100vw`,
  'dos tramos, con el corte estructural',
)
afirmarIgual(sizesPorColumnas(1, 3), `(min-width: ${ESCENARIO_MIN_ANCHO_PX}px) 33vw, 100vw`, 'una de tres columnas')
afirmarIgual(
  sizesPorTresTramos(33, 50),
  `(min-width: ${ESCENARIO_MIN_ANCHO_PX}px) 33vw, (min-width: ${ANCHO_TABLET_PX}px) 50vw, 100vw`,
  'tres tramos, con los dos cortes medidos',
)

afirmarIgual(
  resolver('var(--breakpoint-escritorio)', tokens)?.n,
  ESCENARIO_MIN_ANCHO_PX,
  'el 1025 de los `sizes` es el token del sistema',
)
afirmarIgual(resolver('var(--breakpoint-tablet)', tokens)?.n, ANCHO_TABLET_PX, 'y el 768, también')

const fueraDeRango = [0, -1, 101, Number.NaN].filter((p) => {
  try {
    sizesPorViewport(p)
    return true
  } catch {
    return false
  }
})
afirmarIgual(fueraDeRango, [], 'un porcentaje de viewport fuera de rango se rechaza')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La escalera de candidatos es la del framework, sin override')

const configDeNext = quitarComentarios(leer('next.config.ts'))
afirmar(
  !configDeNext.includes(CLAVE_DE_OVERRIDE_DE_ESCALERA),
  'next.config.ts no sobreescribe images.deviceSizes: rige la escalera por defecto',
)

controlPositivo(
  'el buscador vería el override si estuviera',
  'images: { deviceSizes: [640, 1920] }',
  (config) => !config.includes(CLAVE_DE_OVERRIDE_DE_ESCALERA),
)

cerrar('s3-imagen.invariant')
