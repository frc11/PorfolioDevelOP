/**
 * INVARIANTE — 01 · Hero.
 *
 * Corre con `npx tsx src/app/v3/_secciones/hero/hero.invariant.tsx`.
 *
 * ── Qué comprueba, y por qué cada mitad necesita a la otra ─────────────────
 *
 * La sección se renderiza DE VERDAD, tres veces, en el mismo proceso y sin
 * navegador: en su rama quieta (abajo de 1025 y con `prefers-reduced-motion`), con
 * la coreografía forzada, y con la preferencia mandando sobre el modo. Todas las
 * afirmaciones son sobre el MARCADO que sale, no sobre la intención del componente.
 * Las dos ramas están porque cada una sola miente: "abajo de 1025 no se escribe una
 * transformada" pasa en verde si el sistema no anima NUNCA, y "el contenido llega
 * completo" pasa en verde si el marcado está vacío. ⚠ En un render de servidor no
 * corren los efectos, así que **P1 sale en su fase de medición**: texto plano, sin
 * transformada. El control positivo de "se escribe una transformada" lo da el
 * bloque P2; P1 se comprueba por el atributo del divisor, que sí cambia.
 *
 * ── Los detectores son los del repo, no copias ────────────────────────────
 *
 * `hexEncontrados`, `arbitrariosSinVar` y `apagadosDeFoco` salen de `s3-escaneo`;
 * el contraste, de `razonDeContraste`; el nombre accesible, de `_lib/cta`; y las
 * anclas de §13, de `_lib/motion/anclas`. Un detector reescrito acá se estaría
 * probando contra sí mismo. ⚠ El literal del apagado de foco se ARMA
 * (`['outline','none'].join('-')`) en vez de escribirse: `s5-codigo` escanea TODO
 * el lane buscando esa cadena, y escribirla delataría a este archivo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco, arbitrariosSinVar, hexEncontrados } from '../../_lib/__tests__/s3-escaneo'
import { rotuloAccesible } from '../../_lib/cta'
import { seccionPorId } from '../../_lib/secciones'
import { cuentaDeMarcadores, hallazgosDeCifraConSimbolo, hallazgosDeDigito, hallazgosDeMarcadorDesconocido, marcadoresPedidos, numerosDe, textosDe } from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO } from './contenido'
import {
  ATRIBUTO_DEL_TITULAR,
  GEOMETRIA,
  TIPOGRAFIA_DEL_TITULAR,
  TIPOGRAFIA_DE_LA_SEGUNDA_LINEA,
} from './geometria'
import { Hero } from './Hero'
import {
  afirmarElAjusteDeLaLinea1,
  afirmarElContrasteSobreElCanvas,
  afirmarElFrenoDeB2,
  afirmarElPieDeLaPantalla,
} from './soporte'

const seccion = seccionDe('hero')
const seccionMontada = <Hero seccion={seccion} />

/** La rama de abajo de 1025 — y la misma que produce la preferencia de S2. */
const quieto = marcar(seccionMontada, { anima: false })
/** El control positivo: la coreografía forzada, sin la preferencia. */
const conMotion = marcar(seccionMontada, { anima: true })
/** ⚠ QUÉ SIGNIFICA `conPreferencia` DESPUÉS DE SITIO-S7. Antes la sección consultaba
 *  la compuerta por su cuenta y la política de movimiento reducido de S2 la apagaba
 *  desde adentro. Ahora la compuerta se resuelve UNA vez arriba de las ocho y **la
 *  preferencia se lee ahí**: con `prefers-reduced-motion`, `CompuertaDelHome` no
 *  instala una sola primitiva animada, así que esa persona recibe **el árbol
 *  quieto**. La política de S2 no cambió de fuerza: cambió de lugar. */
const conPreferencia = marcar(seccionMontada, { anima: false, preferencia: 'always' })

const veces = (texto: string, aguja: string): number => texto.split(aguja).length - 1
const TEXTOS = textosDe(CONTENIDO)
const AQUI = path.dirname(fileURLToPath(import.meta.url))
/** La fuente de la sección: los DOS archivos. `geometria.ts` salió de `Hero.tsx`
 *  al partirlo, y §11 escanea la FUENTE — mirando uno solo, la mitad que se
 *  mudó dejaría de estar cubierta sin que nada se ponga rojo. */
const FUENTE = ['Hero.tsx', 'geometria.ts']
  .map((archivo) => readFileSync(path.join(AQUI, archivo), 'utf8'))
  .join(' ')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El alto, la superficie y el pinneo salen de la tabla, no de acá')

afirmarIgual(seccion.superficie, 'papel-transparente', 'la superficie deja ver la escena')
afirmarIgual(pantallasDe(seccion), 1, 'ocupa UNA pantalla: 100svh')
afirmarIgual(seccion.pinneada, undefined, 'y NO es pinneada: el visitante no pierde el scroll')
afirmarIgual(veces(quieto, 'data-pinneado="sticky"'), 0, '  no hay un solo hijo sticky en el marcado')
afirmarIgual(veces(quieto, 'data-pantalla='), 1, 'el marcado declara UNA caja de pantalla')
afirmarIgual(veces(quieto, 'min-h-svh'), 1, '  y una sola pide el alto de viewport')
afirmar(!quieto.includes('bg-fondo'), 'la sección NO pinta fondo: el canvas se ve a través del panel')
controlPositivo('la lectura del alto ve un alto distinto', { ...seccion, alto: '300svh' }, (s) => pantallasDe(s) === 1)
controlPositivo('el chequeo del fondo ve un panel que sí lo pinta', '<section class="bg-fondo text-tinta">', (h: string) => !h.includes('bg-fondo'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El contenido no se puede leer como un dato')

afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)
afirmarIgual(hallazgosDeCifraConSimbolo(CONTENIDO).length, 0, 'cero cifras con símbolo')
controlPositivo('el detector ve un +340%', { a: 'crecimos +340% en consultas' }, (c) => hallazgosDeCifraConSimbolo(c).length === 0)
afirmarIgual(hallazgosDeDigito(CONTENIDO).length, 0, 'cero dígitos, punto')
controlPositivo('el detector ve un 12 sin símbolo', { a: '12 proyectos entregados' }, (c) => hallazgosDeDigito(c).length === 0)
afirmarIgual(numerosDe(CONTENIDO).length, 0, 'cero hojas numéricas: nada que el escáner de cadenas no vea')
controlPositivo('el detector ve un { clientes: 12 }', { clientes: 12 }, (c) => numerosDe(c).length === 0)
afirmarIgual(hallazgosDeMarcadorDesconocido(CONTENIDO).length, 0, 'cero marcadores fuera del conjunto cerrado')
controlPositivo('el detector ve un [METRICA] sin tilde', { a: 'subimos [METRICA]' }, (c) => hallazgosDeMarcadorDesconocido(c).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CERO marcadores, y el extractor NO está ciego')

/** El Hero es la única de las cuatro sin un marcador, y el cero es un RESULTADO: no
 *  muestra ninguna cifra, foto, captura ni testimonio, así que no hay dónde declarar
 *  un dato ausente. Lo provisional que tiene son dos TEXTOS, los dos en `PEDIDO`. Sin
 *  el control positivo, "cero marcadores" y "el extractor no mira" se leerían igual. */
afirmarIgual(marcadoresPedidos(CONTENIDO), [], 'el contenido no deja ningún marcador pedido')
afirmarIgual(cuentaDeMarcadores(CONTENIDO).size, 0, '  y la cuenta por marcador está vacía')
controlPositivo('el extractor ve un contenido que SÍ tiene marcadores', { a: 'subimos [CIFRA]', b: '[TESTIMONIO]' }, (c) => marcadoresPedidos(c).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El copy dictado va LITERAL a la pantalla, en las dos ramas')

/** ⚠ Los literales se buscan EN MINÚSCULAS y eso ES la comprobación: la
 *  mayusculación del titular la pone `uppercase` —el CSS— y el texto del
 *  documento sigue siendo prosa. Subirla al dato pondría esto en rojo. */
const DICTADOS = [
  ['titular · línea 1', CONTENIDO.titularLinea1],
  ['titular · línea 2', CONTENIDO.titularLinea2],
] as const
for (const [nombre, literal] of DICTADOS) {
  afirmar(quieto.includes(literal), `el ${nombre} aparece literal en la rama quieta`, literal)
  afirmar(conMotion.includes(literal), `  y también con la coreografía puesta`)
}
controlPositivo('el chequeo de los literales ve un marcado sin ellos', '<div>una agencia</div>', (h: string) => DICTADOS.every(([, l]) => h.includes(l)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Abajo de 1025 el contenido está COMPLETO y no se mueve')

const faltantes = TEXTOS.filter((h) => !quieto.includes(h.valor))
afirmarIgual(faltantes.map((h) => h.ruta), [], 'los textos del contenido llegan enteros a la rama quieta')
controlPositivo('el chequeo de "está completo" ve un marcado al que le falta un texto', '<div>Ingeniería para negocios reales.</div>', (h: string) => TEXTOS.every((t) => h.includes(t.valor)))
afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco: la compuerta no instala nada')
controlPositivo('el chequeo de "no hay transformada" ve un style con transform', '<div style="transform:translateY(10%)"></div>', (h: string) => !h.includes('transform:'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · CONTROL POSITIVO — con la coreografía puesta, SÍ se anima')

afirmar(conMotion.includes('transform:'), 'con coreografía el bloque P2 SÍ escribe transformada')
/** LA PIEZA QUIETA: el titular tiene DOS líneas y sólo UNA entra. Los dos
 *  números van juntos y ninguno se deriva del otro. */
afirmarIgual(
  veces(conMotion, 'will-change-transform'),
  GEOMETRIA.piezasAnimadasDelTitular + GEOMETRIA.piezasDelBloqueDeEntrada,
  `y son exactamente las ${GEOMETRIA.piezasAnimadasDelTitular + GEOMETRIA.piezasDelBloqueDeEntrada} piezas declaradas: la línea 2 (P1) y el bloque de bajada y CTA (P2) — la línea 1 NO promueve capa porque es la pieza quieta`,
)
afirmar(GEOMETRIA.piezasAnimadasDelTitular < GEOMETRIA.lineasDelTitular, `el titular tiene ${GEOMETRIA.lineasDelTitular} líneas y entran ${GEOMETRIA.piezasAnimadasDelTitular}: la línea 1 está en el primer cuadro sin coreografía`)
afirmar(quieto.includes(`<span class="${TIPOGRAFIA_DEL_TITULAR}"`), '  y sale como un `<span>` pelado, sin canal: es OTRO árbol, no P1 con duración cero')
/**
 * ⚠️ **EL TITULAR YA NO SE COMPRUEBA POR `data-texto-por-lineas`.** Ese atributo
 * lo emitía `TextoPorLineas`, y el rehecho lo saca del hero: un divisor que
 * reparte UNA cadena con UNA métrica no puede producir dos caras. Lo que se
 * afirma es la PROPIEDAD y no el atributo viejo — que las dos piezas del
 * escalonado estén, con su tipografía, en las tres ramas.
 */
const HANDLE = `${ATRIBUTO_DEL_TITULAR}="dos-registros"`
for (const [rama, html] of [['quieta', quieto], ['animada', conMotion], ['con la preferencia', conPreferencia]] as const) afirmarIgual(veces(html, HANDLE), 1, `el titular es UNA pieza de dos registros en la rama ${rama}`)
afirmar(quieto.includes(TIPOGRAFIA_DEL_TITULAR), 'la línea 1 lleva la tipografía de display: la cara condensada, en mayúsculas', TIPOGRAFIA_DEL_TITULAR)
afirmar(quieto.includes(TIPOGRAFIA_DE_LA_SEGUNDA_LINEA), '  y la línea 2 la itálica liviana, en el nivel MÁS GRANDE de la escala', TIPOGRAFIA_DE_LA_SEGUNDA_LINEA)
afirmar(conMotion.includes(TIPOGRAFIA_DEL_TITULAR) && conMotion.includes(TIPOGRAFIA_DE_LA_SEGUNDA_LINEA), '  y las dos sobreviven a la coreografía: P1 envuelve, no reemplaza la tipografía')
/** Las dos piezas son `<span>` y NO `<div>`: el modelo de contenido de un `h1`
 *  es contenido de FRASE. Es la desviación que `TextoPorLineas` declara y
 *  compensa con `sr-only` + `aria-hidden`, y acá no existe. */
const adentroDelH1 = (html: string): string => {
  const desde = html.indexOf('<h1')
  const hasta = html.indexOf('</h1>', desde)
  return desde < 0 || hasta < 0 ? '' : html.slice(desde, hasta)
}
afirmar(adentroDelH1(quieto).length > 0, 'el h1 de la rama quieta se pudo aislar para mirarlo por dentro')
afirmarIgual(veces(adentroDelH1(quieto), '<div'), 0, '  y no tiene un solo `<div>` adentro: contenido de frase, que es lo único que un encabezado admite')
afirmarIgual(veces(adentroDelH1(conMotion), '<div'), 0, '  ni con la coreografía puesta: P1 envuelve en `<span>` porque la sección lo pide así')
afirmarIgual(veces(adentroDelH1(quieto), '<span'), GEOMETRIA.lineasDelTitular, `  y son exactamente ${GEOMETRIA.lineasDelTitular} spans: las dos líneas declaradas`)
controlPositivo('el aislador del h1 ve un div adentro cuando lo hay', '<h1><div>x</div></h1>', (h: string) => veces(adentroDelH1(h), '<div') === 0)
controlPositivo('el contador del handle del titular ve un marcado sin él', '<h1>x</h1>', (h: string) => veces(h, HANDLE) === 1)
/** El uppercase es la condición de que se vea la letra que se eligió: los dos
 *  `.woff2` son subsets de MAYÚSCULAS y sin él las minúsculas caen al fallback. */
afirmarIgual(
  [TIPOGRAFIA_DEL_TITULAR, TIPOGRAFIA_DE_LA_SEGUNDA_LINEA].filter((t) => !t.split(/\s+/).includes('uppercase')),
  [],
  'las dos tipografías del titular llevan `uppercase`: sus binarios no tienen minúsculas',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Un h1, y el titular se anuncia UNA sola vez')

afirmarIgual(veces(quieto, '<h1'), 1, 'exactamente UN h1 en la sección — el h1 del sitio es de acá')
afirmarIgual(veces(conMotion, '<h1'), 1, '  y sigue siendo uno con la coreografía partiendo el texto')
afirmarIgual(veces(quieto, '<h2'), 0, 'y ningún h2: los h2 son de las otras tres')

/**
 * ⚠️ **DESAPARECIÓ EL PAR `sr-only` + `aria-hidden`, Y ES UNA MEJORA MEDIBLE.**
 * Hasta el rehecho, la rama partida servía el titular DOS veces —el texto entero
 * en un `sr-only` y el bloque visual en un `<div aria-hidden>`— porque
 * `LineasDeTexto` emite un `<div>` y `<h1><div>` es marcado inválido. Con las dos
 * líneas declaradas en `<span>`, el `h1` es el nodo accesible en las DOS ramas y
 * el texto viaja UNA sola vez. Las dos afirmaciones que exigían el par se
 * reemplazan por las que afirman que ya no hace falta.
 */
afirmarIgual(veces(conMotion, 'sr-only'), 0, 'la rama animada no necesita una copia `sr-only` del titular: el h1 ES el nodo accesible')
afirmarIgual(veces(adentroDelH1(conMotion), 'aria-hidden'), 0, '  y nada del titular queda fuera del árbol de accesibilidad')

/** El nombre accesible de la sección entera: `rotuloAccesible` borra los subárboles
 *  `aria-hidden` y las etiquetas. Un titular duplicado acá se leería dos veces. */
const anuncia = (html: string, texto: string): number => veces(rotuloAccesible(html), texto)
for (const [nombre, literal] of DICTADOS.slice(0, 2)) {
  afirmarIgual(anuncia(quieto, literal), 1, `el ${nombre} se anuncia una vez en la rama quieta`)
  afirmarIgual(anuncia(conMotion, literal), 1, `  y una sola vez con la coreografía puesta`)
}
/** Y el nombre accesible del h1 es LAS DOS LÍNEAS, con un espacio en medio: es el
 *  h1 del sitio y tiene que leerse como una frase, no como dos fragmentos. */
afirmarIgual(
  rotuloAccesible(adentroDelH1(quieto) + '</h1>').trim(),
  `${CONTENIDO.titularLinea1} ${CONTENIDO.titularLinea2}`,
  'el nombre accesible del h1 son las dos líneas separadas por UN espacio',
)
controlPositivo('la cuenta del anuncio ve un titular duplicado', `<h1>${CONTENIDO.titularLinea1}</h1><p>${CONTENIDO.titularLinea1}</p>`, (h: string) => anuncia(h, CONTENIDO.titularLinea1) === 1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El CTA: un enlace nativo, a un ancla que existe, sin anidar')

afirmarIgual(veces(quieto, '<a '), 1, 'hay UN solo elemento interactivo en la sección')
afirmarIgual(veces(quieto, '<button'), 0, '  y no es un botón: es un enlace')
afirmar(quieto.includes(`href="${CONTENIDO.cta.destino}"`), `el CTA apunta a ${CONTENIDO.cta.destino}`)
afirmarIgual(seccionPorId(CONTENIDO.cta.destino.slice(1)).id, 'trabajos', '  y ese ancla es una sección REAL de `secciones.ts`, no un destino inventado')
afirmarIgual(anuncia(quieto, CONTENIDO.cta.rotulo), 1, 'el rótulo se anuncia una vez: la copia del rollover va oculta')

const RE_ANIDADO = /<(a|button)\b[^>]*>(?:(?!<\/\1>)[\s\S])*?<(?:a|button)\b/
afirmar(!RE_ANIDADO.test(quieto), 'ningún interactivo adentro de otro: una sola parada de tabulación')
controlPositivo('el detector ve un button adentro de un enlace', '<a href="#x"><button type="button">y</button></a>', (h: string) => !RE_ANIDADO.test(h))
controlPositivo('y la cuenta del rótulo ve las dos copias sin ocultar', `<span>${CONTENIDO.cta.rotulo}</span><span>${CONTENIDO.cta.rotulo}</span>`, (h: string) => anuncia(h, CONTENIDO.cta.rotulo) === 1)

// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ §9, §10, §12b Y §13 VIVEN EN `soporte.ts` — las CUENTAS del frente, contra
// las que miran el MARCADO, que quedan acá. Salieron cuando este archivo cruzó
// las 300 líneas al rehacerse el titular, y se llaman EN SU LUGAR para que la
// salida siga leyéndose §1 → §13 de arriba a abajo.
afirmarElPieDeLaPantalla(quieto)
afirmarElContrasteSobreElCanvas()


titulo('11 · Higiene del lane: color, foco, estado y puertas')

afirmarIgual(veces(quieto, 'text-acento'), 0, 'cero `text-acento`: sobre fondo oscuro no llega a 3:1')
afirmarIgual(hexEncontrados(quieto), [], 'cero color fuera de los tokens: ni un hex suelto en el marcado')
afirmarIgual(arbitrariosSinVar(quieto), [], 'todo valor arbitrario del marcado consume un var(--token)')
controlPositivo('el detector de hex ve uno', 'style="color:#ff0000"', (t: string) => hexEncontrados(t).length === 0)
controlPositivo('el de arbitrarios ve un p-[7px]', '<i class="p-[7px]">', (t: string) => arbitrariosSinVar(t).length === 0)

/** El literal se arma: ver el docblock de arriba. */
const APAGADO = ['outline', 'none'].join('-')
afirmarIgual(apagadosDeFoco(quieto), [], 'nadie apaga el anillo de foco en el marcado')
afirmarIgual(apagadosDeFoco(FUENTE), [], '  ni en la fuente de la sección')
controlPositivo('el detector de apagados lo ve', `class="${APAGADO}"`, (t: string) => apagadosDeFoco(t).length === 0)

/** La sección no escribe estados de puntero: la coreografía del CTA vive en
 *  `_estilos/cta.css`, con su instrumento en S3. Acá se afirma la PARIDAD. */
afirmarIgual(veces(FUENTE, 'hover:'), veces(FUENTE, 'focus-visible:'), 'toda `hover:` con su gemela `focus-visible:`')
afirmarIgual(veces(FUENTE, 'onClick'), 0, 'cero `onClick`: ningún div haciendo de botón')
afirmarIgual(veces(FUENTE, 'motion/_componentes'), 0, 'la única puerta a las piezas de motion es `_contrato/piezas`')
controlPositivo('el chequeo de paridad ve un marcado desparejo', '<i class="hover:opacity-casi">', (t: string) => veces(t, 'hover:') === veces(t, 'focus-visible:'))
/** ⚠ La entrada equivocada es la RUTA pelada y no un `import … from …` entero, por la
 *  misma razón que el apagado de foco se arma: `s5-codigo` extrae los imports del lane
 *  con una regular sobre `from '…'`. */
controlPositivo('el de la puerta ve una ruta a las piezas del demo', "'../../motion/_componentes/Pieza'", (t: string) => veces(t, 'motion/_componentes') === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · La geometría, el pedido y los patrones declarados')

afirmar(GEOMETRIA.claseDeLaMedida.endsWith(String(GEOMETRIA.columnasDeLaMedida)), 'la clase de la medida y el número declarado dicen lo mismo', `${GEOMETRIA.claseDeLaMedida} sobre ${GEOMETRIA.columnasTotales} columnas`)
afirmar(quieto.includes(GEOMETRIA.claseDeLaMedida), '  y esa clase llega al marcado')
controlPositivo('el chequeo de la medida ve una clase que no coincide con el número', { claseDeLaMedida: 'escritorio:col-span-4', columnasDeLaMedida: 3 }, (g) => g.claseDeLaMedida.endsWith(String(g.columnasDeLaMedida)))

/** ── B1 · LAS DOS CAJAS DE LA MEDIDA. La aritmética, no el píxel (`GEOMETRIA` y `B1-DELTAS.md` §4). Las grillas se cuentan por `data-columnas`, que emite `Grilla`. */
afirmar(GEOMETRIA.claseDelTitular.endsWith(String(GEOMETRIA.columnasDelTitular)), 'la clase del titular y el número declarado dicen lo mismo', GEOMETRIA.claseDelTitular)
afirmar(quieto.includes(GEOMETRIA.claseDelTitular), '  y esa clase llega al marcado')
afirmar(GEOMETRIA.columnasDelTitular < GEOMETRIA.columnasDeLaCajaDelTitular, 'la caja del titular es MÁS ANGOSTA que la medida: es lo que la saca del logo', `${GEOMETRIA.columnasDelTitular} de ${GEOMETRIA.columnasDeLaCajaDelTitular}`)
afirmarIgual(GEOMETRIA.columnasDeLaCajaDeLaBajada, 2, 'la bajada vive en media medida: una sub-grilla de DOS')
controlPositivo('el chequeo del titular ve una clase que no coincide con el número', { claseDelTitular: 'tablet:col-span-3', columnasDelTitular: 2 }, (g) => g.claseDelTitular.endsWith(String(g.columnasDelTitular)))
controlPositivo('  y el de la angostura ve una caja que NO acota', { columnasDelTitular: 3, columnasDeLaCajaDelTitular: 3 }, (g) => g.columnasDelTitular < g.columnasDeLaCajaDelTitular)
afirmarIgual([GEOMETRIA.columnasTotales, GEOMETRIA.columnasDeLaCajaDelTitular, GEOMETRIA.columnasDeLaCajaDeLaBajada].map((n) => veces(quieto, `data-columnas="${n}"`)), [1, 1, 1], 'las TRES grillas del hero salen una vez cada una: la medida, la del titular y la de la bajada')
afirmar(PEDIDO.length > 0, `el pedido tiene ${PEDIDO.length} entradas: no es una lista vacía`)
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta que no existe')
controlPositivo('el chequeo de entradas colgadas ve una ruta inventada', [{ ruta: 'no.existe', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }], (p) => entradasColgadas(CONTENIDO, p).length === 0)
afirmarIgual([...new Set(PEDIDO.map((e) => e.clase))], ['prosa'], 'y las dos son `prosa`: el relleno que NO se ve como agujero')
afirmarIgual(PATRONES_DE_LA_SECCION, ['P1', 'P2'], 'la sección declara consumir P1 y P2, y nada más')

afirmarElAjusteDeLaLinea1()
afirmarElFrenoDeB2()

cerrar('hero.invariant')
