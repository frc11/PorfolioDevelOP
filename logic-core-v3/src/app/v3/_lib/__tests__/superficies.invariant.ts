/**
 * INVARIANTE — las cuatro superficies, las ocho secciones y el contraste.
 *
 * Corre con `npm run test:s1-superficies`.
 *
 * Lo que afirma, y por qué:
 *
 *   1. Los cuatro modos existen, son cuatro, y producen marcado DISTINTO. Que un
 *      modo esté declarado en una tabla no prueba que haga algo: acá se
 *      renderiza cada uno y se mira lo que sale. El cuarto —`oscuro-transparente`,
 *      B6-A— se afirma además por lo que NO es: no pinta `bg-fondo` (la escena
 *      se ve) y no lleva `opacity-` (el velo es un FONDO, no una atenuación del
 *      panel), y por lo que la hoja `_estilos/velo.css` declara para su clase.
 *   2. **El recorrido de superficies de las ocho** es el decidido en SITIO-S5
 *      §0.2 más las DOS que B6-A abrió en su PARADA 1, tabla contra tabla, con
 *      la tabla esperada escrita acá y no importada de `secciones.ts` —
 *      comparar un archivo contra sí mismo no comprueba nada.
 *   3. El contraste de la tinta sobre el canvas de prueba, en el modo
 *      transparente, con su peor caso.
 *   3b. Los PISOS del velo en gradiente (B6-A): con el píxel MÁS CLARO que una
 *      escena pueda pintar detrás, la mitad densa deja pasar AA a la tinta
 *      plena y a la tinta a `opacity-casi`; la tinta tenue no —se cita medida—;
 *      y la mitad rala no deja pasar ni la plena —por eso va sólo donde no hay
 *      texto—. Con control positivo sobre la alfa rala.
 *   4. Por qué el anillo de foco está acotado a `/v3` — con el número que lo
 *      justifica, no con una opinión.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Panel } from '../../_componentes/Panel'
import { SECCIONES, SECCIONES_QUE_DEJAN_VER_LA_ESCENA, type Seccion } from '../secciones'
import {
  CLASE_DEL_VELO,
  COLORES_DEL_CANVAS_DE_PRUEBA,
  SUPERFICIES,
  TINTA_HEX,
  TOKENS_DEL_VELO,
  type ModoSuperficie,
} from '../superficies'
import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from './afirmar'
import { afirmarElVelo } from './superficies-velo'
import { SECCION_INVERTIDA, tokensDelBloque, tokensDelTema } from './s3-css'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..')
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

titulo('1 · Los cuatro modos existen y producen marcado distinto')

const modos = Object.keys(SUPERFICIES) as ModoSuperficie[]
afirmarIgual(
  modos.sort(),
  ['oscuro-opaco', 'oscuro-transparente', 'papel-opaco', 'papel-transparente'],
  'son exactamente cuatro modos: dos claros y dos oscuros, dos opacos y dos transparentes',
)

const renderizar = (superficie: ModoSuperficie): string => {
  const seccion: Seccion = { id: 'prueba', numero: '00', nombre: 'Prueba', superficie, alto: '100svh' }
  // `children` como tercer argumento y no como prop: pasarlo adentro del
  // objeto de props es lo que `react/no-children-prop` prohíbe.
  return renderToStaticMarkup(createElement(Panel, { seccion }, null))
}

const salida = Object.fromEntries(modos.map((m) => [m, renderizar(m)])) as Record<ModoSuperficie, string>
const clasesDe = (html: string): string[] => (/class="([^"]*)"/.exec(html)?.[1] ?? '').split(' ')

afirmar(salida['papel-opaco'].includes('bg-fondo'), 'papel-opaco pinta `bg-fondo`')
afirmar(!salida['papel-opaco'].includes('data-seccion'), '  y no escribe `data-seccion`')

afirmar(!salida['papel-transparente'].includes('bg-fondo'), 'papel-transparente NO pinta fondo: el canvas se ve')
afirmar(salida['papel-transparente'].includes('text-tinta'), '  pero sí pinta la tinta')

afirmar(salida['oscuro-opaco'].includes('data-seccion="invertida"'), 'oscuro-opaco escribe `data-seccion="invertida"`')
afirmar(salida['oscuro-opaco'].includes('bg-fondo'), '  con las MISMAS utilidades que papel-opaco: cambia el atributo, no la clase')

/**
 * B6-A · LA CUARTA. La define lo que no tiene y lo que sí: sin `bg-fondo` (la
 * escena se ve), con `data-seccion="invertida"` (la tinta se da vuelta, y los
 * tokens del velo con ella), con el velo como CLASE DE FONDO que declara la
 * hoja `_estilos/velo.css`, y sin `opacity-` en el panel. El velo atenúa lo
 * que hay DETRÁS del texto; el texto va pleno.
 */
const velo = salida['oscuro-transparente']
afirmar(velo.includes('data-seccion="invertida"'), 'oscuro-transparente escribe `data-seccion="invertida"`: es banda oscura')
afirmar(!velo.includes('bg-fondo'), '  y NO pinta `bg-fondo`: la escena se ve')
afirmar(clasesDe(velo).includes(CLASE_DEL_VELO), `  pinta el velo como clase — \`${CLASE_DEL_VELO}\``)
afirmar(velo.includes('text-tinta'), '  con la tinta plena encima')
const SIN_OPACIDAD_DE_PANEL = /(^|[\s"])opacity-/
afirmar(!SIN_OPACIDAD_DE_PANEL.test(velo), '  y sin `opacity-` en el panel: el velo NO es una opacidad del panel')
controlPositivo(
  'el detector de «sin opacity- en el panel» vería una',
  '<section class="relative z-10 w-full opacity-casi text-tinta">',
  (html) => !SIN_OPACIDAD_DE_PANEL.test(html),
)

/**
 * La clase es de la HOJA, no de Tailwind: un gradiente con dos tokens y una
 * frontera derivada de tokens de layout no cabe en una utilidad. Lo que se
 * afirma acá es que la hoja la define colgada de `[data-v3]`, que enciende el
 * gradiente sólo con la escena montada, y que consume los dos tokens del velo,
 * que existen en el tema y se dan vuelta en la invertida. La forma del
 * gradiente y sus propiedades las custodia `s3-tokens` (§3 a §6).
 */
const HOJA = leer('src/app/v3/_estilos/velo.css').replace(/\/\*[\s\S]*?\*\//g, '')
const defineLaClase = (css: string, clase: string): boolean => new RegExp(`\\[data-v3\\][^{]*\\.${clase}\\s*\\{`).test(css)
afirmar(defineLaClase(HOJA, CLASE_DEL_VELO), 'la hoja `_estilos/velo.css` define la clase del velo, colgada de `[data-v3]`')
afirmar(/\[data-v3\]:has\(\[data-escena\]\)\s+\.velo\s*\{/.test(HOJA), '  y enciende el gradiente SÓLO con la escena montada: sin escena, sin velo')
afirmar(/\[data-v3\]\s+\.velo\s*\{[^}]*background-color:\s*var\(--color-fondo\)/.test(HOJA), '  sin escena el panel es el sólido de siempre, `--color-fondo`')
for (const token of TOKENS_DEL_VELO) {
  afirmar(HOJA.includes(`var(${token})`), `  la hoja consume ${token}`)
  afirmar(tokensDelTema().has(token), `  ${token} existe en \`@theme static\``)
  afirmar(tokensDelBloque(SECCION_INVERTIDA).has(token), `  y la sección invertida lo redefine`)
}
afirmar(HOJA.includes('var(--velo-borde, var(--container-tope))'), 'sin borde propio el velo es denso hasta el tope del envoltorio')
afirmar(/\[data-panel="trabajos"\]\.velo\s*\{[^}]*--velo-borde:/.test(HOJA), '  y Trabajos declara su franja desnuda donde termina su columna de texto')
controlPositivo('el detector de «la hoja define la clase» no ve una que nadie define', 'velo-que-nadie-define', (c) => defineLaClase(HOJA, c))

const distintos = new Set(Object.values(salida))
afirmarIgual(distintos.size, 4, 'los cuatro marcados son distintos entre sí')

// Las dos parejas: los transparentes comparten «sin relleno»; los oscuros, el atributo.
afirmarIgual(
  modos.filter((m) => SUPERFICIES[m].dejaVerElCanvas).sort(),
  ['oscuro-transparente', 'papel-transparente'],
  'dos modos dejan ver la escena',
)
afirmarIgual(modos.filter((m) => SUPERFICIES[m].invertida).sort(), ['oscuro-opaco', 'oscuro-transparente'], 'y dos son oscuros')
afirmar(
  modos.every((m) => SUPERFICIES[m].dejaVerElCanvas === !salida[m].includes('bg-fondo')),
  'y en los cuatro, «deja ver la escena» es exactamente «no pinta bg-fondo», en el marcado real',
)

afirmar(
  !/#[0-9a-fA-F]{3,8}\b/.test(Object.values(salida).join('')),
  'cero color fuera de los tokens: ni un hex suelto en el marcado',
)

controlPositivo(
  'el chequeo de "sin hex suelto" ve un hex',
  '<section style="background:#ff0000">',
  (html) => !/#[0-9a-fA-F]{3,8}\b/.test(html),
)

titulo('2 · Las ocho secciones y su recorrido de superficies')

afirmarIgual(SECCIONES.length, 8, 'son ocho secciones')
afirmarIgual(
  SECCIONES.map((s) => s.nombre),
  ['Hero', 'Quiénes somos', 'Números', 'Trabajos', 'Servicios', 'Tu panel', 'Por qué develOP', 'Cierre'],
  'en el orden del sprint',
)
afirmarIgual(new Set(SECCIONES.map((s) => s.id)).size, 8, 'con ocho ids distintos')

/**
 * EL RECORRIDO ESPERADO — la tabla de SITIO-S5 §0.2, con las dos que B6-A
 * abrió en su PARADA 1, transcrita acá.
 *
 * Está en el instrumento y no en `secciones.ts` a propósito: si saliera del
 * mismo archivo que verifica, la comparación sería una tautología. Son dos
 * fuentes, y este check existe para que difieran cuando alguien mueva una sin
 * decidirlo.
 *
 * ⚠ S1 afirmaba "las ocho en `papel-opaco`", que era verdad mientras la
 * decisión estética no estuviera tomada. SITIO-S5 la tomó; B6-A la movió en
 * dos filas con la escena real medida detrás (`docs/rediseno/outputs/b6/`):
 * Trabajos y el Cierre pasan a `oscuro-transparente`. Quiénes somos y Números
 * NO se abren en B6-A —el logo pasa detrás de su texto: 39,9 % del cuerpo y
 * 100 % del rótulo— y son el insumo de B6-B. Lo que se afirma es EL
 * RECORRIDO, no un valor único.
 */
const RECORRIDO_ESPERADO: readonly [string, ModoSuperficie][] = [
  ['hero', 'papel-transparente'],
  ['quienes-somos', 'papel-opaco'],
  ['numeros', 'papel-opaco'],
  ['trabajos', 'oscuro-transparente'],
  ['servicios', 'papel-opaco'],
  ['tu-panel', 'papel-opaco'],
  ['por-que-develop', 'papel-transparente'],
  ['cierre', 'oscuro-transparente'],
]

afirmarIgual(
  SECCIONES.map((s) => [s.id, s.superficie]),
  RECORRIDO_ESPERADO,
  'el recorrido de superficies es el de SITIO-S5 §0.2 con las dos que B6-A abrió',
)

/** Cinco momentos de escena, no ocho: la cifra la produce esta cuenta. */
const dejanVer = SECCIONES.filter((s) => SUPERFICIES[s.superficie].dejaVerElCanvas)
afirmarIgual(
  dejanVer.map((s) => s.id),
  ['hero', 'trabajos', 'por-que-develop', 'cierre'],
  'CUATRO paneles dejan ver el canvas — aparece, desaparece, vuelve en Trabajos, desaparece y vuelve al final',
)
afirmarIgual(
  SECCIONES_QUE_DEJAN_VER_LA_ESCENA,
  dejanVer.map((s) => s.id),
  '  y la constante derivada de `secciones.ts` dice lo mismo que la tabla de superficies',
)
const invertidas = SECCIONES.filter((s) => SUPERFICIES[s.superficie].invertida)
afirmarIgual(invertidas.map((s) => s.id), ['trabajos', 'cierre'], 'y DOS son la banda oscura — las mismas dos, ahora con velo')

afirmar(SECCIONES.every((s) => /^\d+svh$/.test(s.alto)), 'las ocho declaran su altura en `svh`, no en `vh`')

const pinneadas = SECCIONES.filter((s) => s.pinneada)
afirmarIgual(pinneadas.map((s) => s.id), ['trabajos', 'servicios'], 'dos secciones son secuencias pinneadas')
afirmarIgual(
  pinneadas.map((s) => s.alto),
  ['300svh', '300svh'],
  '  las dos con 300svh de recorrido y un hijo sticky de 100svh → 200svh de pin cada una',
)

controlPositivo(
  'el comparador de recorridos ve una superficie cambiada',
  SECCIONES.map((s) => (s.id === 'cierre' ? { ...s, superficie: 'papel-opaco' as const } : s)),
  (lista) =>
    JSON.stringify(lista.map((s) => [s.id, s.superficie])) === JSON.stringify(RECORRIDO_ESPERADO),
)
controlPositivo(
  'y ve un recorrido APLANADO, que es el error que reemplaza a un recorrido',
  SECCIONES.map((s) => ({ ...s, superficie: 'papel-opaco' as const })),
  (lista) =>
    JSON.stringify(lista.map((s) => [s.id, s.superficie])) === JSON.stringify(RECORRIDO_ESPERADO),
)

titulo('3 · Contraste de la tinta sobre el canvas de prueba, en modo transparente')

/**
 * ⚠ Esta cifra vale para EL MARCADOR DE POSICIÓN, que es plano y pinta dos
 * tokens del sistema. La escena real es una sala con gradiente y no hereda
 * este número: hay que volver a medirlo cuando entre.
 */
const razones = COLORES_DEL_CANVAS_DE_PRUEBA.map(({ token, hex }) => ({
  token,
  hex,
  razon: razonDeContraste(TINTA_HEX, hex),
}))
for (const r of razones) {
  afirmar(r.razon >= 4.5, `tinta sobre ${r.token} (${r.hex}) — ${r.razon.toFixed(4)}:1, pasa AA`)
}
const peor = razones.reduce((a, b) => (a.razon < b.razon ? a : b))
afirmar(peor.razon >= 7, `PEOR CASO ${peor.razon.toFixed(4)}:1 sobre ${peor.hex} — pasa AAA`, peor.token)

// Control positivo de la calculadora: si no reproduce cifras conocidas, no
// mide contraste. Las dos últimas son las que PUBLICÓ S0.
afirmarIgual(Number(razonDeContraste('#000000', '#FFFFFF').toFixed(4)), 21, 'negro sobre blanco = 21,0000')
afirmarIgual(Number(razonDeContraste('#123456', '#123456').toFixed(4)), 1, 'un color contra sí mismo = 1,0000')
afirmarIgual(Number(razonDeContraste('#111111', '#F7F7F5').toFixed(2)), 17.6, 'reproduce el 17,60 que publicó S0 (tinta/papel)')
afirmarIgual(Number(razonDeContraste('#F7F7F5', '#0E0E0E').toFixed(2)), 18, 'reproduce el 18,00 que publicó S0 (papel/invertida)')

controlPositivo(
  'la calculadora de contraste no devuelve "pasa" para un par que falla',
  ['#DBDBD9', '#E8E8E6'] as const,
  ([a, b]) => razonDeContraste(a, b) >= 4.5,
)

afirmarElVelo()

titulo('4 · El anillo de foco: por qué está acotado a /v3')

const hoja = leer('src/app/theme-develop.css')
afirmar(hoja.includes('[data-v3] :focus-visible'), 'la regla existe y está acotada con `[data-v3]`')
afirmar(hoja.includes('var(--color-foco)'), '  y consume `--color-foco`, que ES `var(--color-tinta)`')
afirmar(hoja.includes('--color-foco: var(--color-tinta)'), '  cadena de dos niveles: el foco se invierte solo')

const TINTA_INVERTIDA = '#F7F7F5'
const FONDO_INVERTIDO = '#0E0E0E'
afirmar(razonDeContraste(TINTA_HEX, '#DBDBD9') >= 3, `el anillo pasa 3:1 sobre claro — ${razonDeContraste(TINTA_HEX, '#DBDBD9').toFixed(2)}:1 peor caso`)
afirmar(razonDeContraste(TINTA_INVERTIDA, FONDO_INVERTIDO) >= 3, `y sobre la sección invertida — ${razonDeContraste(TINTA_INVERTIDA, FONDO_INVERTIDO).toFixed(2)}:1`)

// LA CIFRA que justifica el alcance acotado. El portal es zinc-950 (#09090B).
const ZINC_950 = '#09090B'
const sobreElPortal = razonDeContraste(TINTA_HEX, ZINC_950)
afirmar(
  sobreElPortal < 3,
  `sobre el portal (zinc-950) el anillo daría ${sobreElPortal.toFixed(4)}:1 — invisible: por eso NO es global`,
)

cerrar('superficies.invariant')
