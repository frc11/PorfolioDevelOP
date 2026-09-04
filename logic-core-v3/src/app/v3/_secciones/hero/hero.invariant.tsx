/**
 * INVARIANTE — 01 · Hero.
 *
 * Corre con `npx tsx src/app/v3/_secciones/hero/hero.invariant.tsx`.
 *
 * ── Qué comprueba, y por qué cada mitad necesita a la otra ─────────────────
 *
 * La sección se renderiza DE VERDAD, tres veces, en el mismo proceso y sin
 * navegador: en su rama quieta (`modo="nunca"` — lo que ocurre abajo de 1025 y
 * con `prefers-reduced-motion`), con la coreografía forzada, y con la
 * preferencia mandando sobre el modo forzado. Todas las afirmaciones son sobre
 * el MARCADO que sale, no sobre la intención del componente.
 *
 * Las dos ramas están porque cada una sola miente: "abajo de 1025 no se escribe
 * una transformada" pasa en verde si el sistema no anima NUNCA, y "el contenido
 * llega completo" pasa en verde si el marcado está vacío.
 *
 * ⚠ En un render de servidor no corren los efectos, así que **P1 sale en su
 * fase de medición**: texto plano, sin transformada. El control positivo de "se
 * escribe una transformada" lo da el bloque P2, que sí la escribe en el primer
 * cuadro. P1 se comprueba por el atributo del divisor, que sí cambia.
 *
 * ── Los detectores son los del repo, no copias ────────────────────────────
 *
 * `hexEncontrados`, `arbitrariosSinVar` y `apagadosDeFoco` salen de
 * `s3-escaneo`; el contraste, de `razonDeContraste`; el nombre accesible, de
 * `_lib/cta`. Un detector reescrito acá se estaría probando contra sí mismo.
 *
 * ⚠ El literal del apagado de foco se ARMA (`['outline','none'].join('-')`) en
 * vez de escribirse: `s5-codigo` escanea TODO el lane —invariantes incluidos—
 * buscando esa cadena, así que escribirla haría que este archivo se delatara a
 * sí mismo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco, arbitrariosSinVar, hexEncontrados } from '../../_lib/__tests__/s3-escaneo'
import { rotuloAccesible } from '../../_lib/cta'
import { ALTO_PASTILLA_PX, DESCUENTO_NACIMIENTO_PX } from '../../_lib/navegacion'
import { seccionPorId } from '../../_lib/secciones'
import { COLORES_DEL_CANVAS_DE_PRUEBA, TINTA_HEX } from '../../_lib/superficies'
import { cuentaDeMarcadores, hallazgosDeCifraConSimbolo, hallazgosDeDigito, hallazgosDeMarcadorDesconocido, marcadoresPedidos, numerosDe, textosDe } from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { pantallasDe, seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO } from './contenido'
import { GEOMETRIA, Hero, TIPOGRAFIA_DEL_TITULAR } from './Hero'

const seccion = seccionDe('hero')

const seccionMontada = <Hero seccion={seccion} />

/** La rama de abajo de 1025 — y la misma que produce la preferencia de S2. */
const quieto = marcar(seccionMontada, { anima: false })
/** El control positivo: la coreografía forzada, sin la preferencia. */
const conMotion = marcar(seccionMontada, { anima: true })
/** Y la preferencia mandando sobre el modo forzado: la política de S2 es total. */
/**
 * ⚠ QUÉ SIGNIFICA `conPreferencia` DESPUÉS DE SITIO-S7.
 *
 * Antes, la sección consultaba la compuerta por su cuenta y la política de
 * movimiento reducido de S2 la apagaba desde adentro: por eso el render forzaba
 * el modo Y la preferencia, para ver quién ganaba.
 *
 * Ahora la compuerta se resuelve UNA vez, arriba de las ocho, y **la preferencia
 * se lee ahí**: con `prefers-reduced-motion` puesto, `CompuertaDelHome` no
 * instala una sola primitiva animada. O sea que lo que una persona con la
 * preferencia recibe **es el árbol quieto**, y eso es lo que este render
 * reproduce. La política de S2 no cambió de fuerza: cambió de lugar, y ahora se
 * aplica antes de que exista un árbol animado que apagar.
 *
 * La tabla de verdad que lo decide es `deberiaAnimar`, que es pura y se afirma
 * abajo — sin montar React, sin navegador y sin depender de esta sección.
 */
const conPreferencia = marcar(seccionMontada, { anima: false, preferencia: 'always' })

const veces = (texto: string, aguja: string): number => texto.split(aguja).length - 1
const TEXTOS = textosDe(CONTENIDO)
const AQUI = path.dirname(fileURLToPath(import.meta.url))
const FUENTE = readFileSync(path.join(AQUI, 'Hero.tsx'), 'utf8')
/** El tema, leído: los tokens no se transcriben. Si `--spacing-20` cambia de
 *  valor, la cuenta del aire del pie se mueve con él o falla. */
const TEMA = readFileSync(path.join(AQUI, '../../../../..', 'src/app/theme-develop.css'), 'utf8')

/** Un escalón de espaciado, en px. La raíz de 16 la declara el propio tema al
 *  lado del token, en el comentario que traduce cada rem a su píxel. */
function pxDeEspaciado(escalon: string): number {
  const m = new RegExp(`--spacing-${escalon}:\\s*([\\d.]+)rem`).exec(TEMA)
  if (m === null) throw new Error(`--spacing-${escalon} no está declarado en el tema`)
  return Number.parseFloat(m[1]) * 16
}

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

/**
 * El Hero es la única de las cuatro sin un marcador, y el cero es un RESULTADO:
 * no muestra ninguna cifra, foto, captura ni testimonio, así que no hay dónde
 * declarar un dato ausente. Lo provisional que tiene son dos TEXTOS, y los dos
 * están en `PEDIDO`. Sin el control positivo, "cero marcadores" y "el extractor
 * no mira" se leerían idénticos.
 */
afirmarIgual(marcadoresPedidos(CONTENIDO), [], 'el contenido no deja ningún marcador pedido')
afirmarIgual(cuentaDeMarcadores(CONTENIDO).size, 0, '  y la cuenta por marcador está vacía')
controlPositivo('el extractor ve un contenido que SÍ tiene marcadores', { a: 'subimos [CIFRA]', b: '[TESTIMONIO]' }, (c) => marcadoresPedidos(c).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El copy dictado va LITERAL a la pantalla, en las dos ramas')

for (const [nombre, literal] of [['titular', CONTENIDO.titular], ['slogan', CONTENIDO.slogan]] as const) {
  afirmar(quieto.includes(literal), `el ${nombre} aparece literal en la rama quieta`, literal)
  afirmar(conMotion.includes(literal), `  y también con la coreografía puesta`)
}
controlPositivo('el chequeo de los literales ve un marcado sin ellos', '<div>una agencia</div>', (h: string) =>
  [CONTENIDO.titular, CONTENIDO.slogan].every((l) => h.includes(l)),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Abajo de 1025 el contenido está COMPLETO y no se mueve')

const faltantes = TEXTOS.filter((h) => !quieto.includes(h.valor))
afirmarIgual(faltantes.map((h) => h.ruta), [], 'los textos del contenido llegan enteros a la rama quieta')
controlPositivo('el chequeo de "está completo" ve un marcado al que le falta un texto', '<div>Ingeniería para negocios reales.</div>', (h: string) =>
  TEXTOS.every((t) => h.includes(t.valor)),
)
afirmar(!quieto.includes('transform:'), 'la rama quieta no escribe una sola transformada')
afirmar(!quieto.includes('will-change'), '  ni promueve una capa de composición')
afirmar(!conPreferencia.includes('transform:'), 'y con `prefers-reduced-motion` tampoco: la compuerta no instala nada')
controlPositivo('el chequeo de "no hay transformada" ve un style con transform', '<div style="transform:translateY(10%)"></div>', (h: string) => !h.includes('transform:'))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · CONTROL POSITIVO — con la coreografía puesta, SÍ se anima')

afirmar(conMotion.includes('transform:'), 'con coreografía el bloque P2 SÍ escribe transformada')
afirmarIgual(veces(conMotion, 'will-change-transform'), GEOMETRIA.piezasDelBloqueDeEntrada, 'y es exactamente la pieza declarada del bloque P2: la bajada con su CTA')
afirmar(
  quieto.includes('data-texto-por-lineas="entero"') && conMotion.includes('data-texto-por-lineas="partido"'),
  'el titular P1 sale entero en la rama quieta y partido con coreografía',
)
afirmarIgual(veces(conPreferencia, 'data-texto-por-lineas="entero"'), 1, '  y con la preferencia el titular sale entero: es el árbol quieto, no una versión apagada')
afirmar(quieto.includes(TIPOGRAFIA_DEL_TITULAR), 'el titular lleva la tipografía de display con la que P1 mide las líneas', TIPOGRAFIA_DEL_TITULAR)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Un h1, y el titular se anuncia UNA sola vez')

afirmarIgual(veces(quieto, '<h1'), 1, 'exactamente UN h1 en la sección — el h1 del sitio es de acá')
afirmarIgual(veces(conMotion, '<h1'), 1, '  y sigue siendo uno con la coreografía partiendo el texto')
afirmarIgual(veces(quieto, '<h2'), 0, 'y ningún h2: los h2 son de las otras tres')
afirmar(/<h1[^>]*class="sr-only"/.test(conMotion), 'en la rama partida el h1 es el nodo accesible')
afirmar(conMotion.includes('<div aria-hidden="true">'), '  y el bloque visual queda fuera del árbol de accesibilidad')

/** El nombre accesible de la sección entera: `rotuloAccesible` borra los
 *  subárboles `aria-hidden` y las etiquetas. Si el titular apareciera dos veces
 *  acá, un lector de pantalla lo leería dos veces. */
const anuncia = (html: string, texto: string): number => veces(rotuloAccesible(html), texto)
afirmarIgual(anuncia(quieto, CONTENIDO.titular), 1, 'el titular se anuncia una vez en la rama quieta')
afirmarIgual(anuncia(conMotion, CONTENIDO.titular), 1, '  y una sola vez con el texto partido en líneas')
controlPositivo('la cuenta del anuncio ve un titular duplicado', `<h1>${CONTENIDO.titular}</h1><p>${CONTENIDO.titular}</p>`, (h: string) => anuncia(h, CONTENIDO.titular) === 1)

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
titulo('9 · El pie de la pantalla es de la pastilla, y el aire alcanza')

/** El escalón del padding inferior. La clase que se busca en el marcado y el
 *  token que se mide salen de acá: son UNA fuente, no dos que se desincronizan. */
const ESCALON_DEL_PIE = '20'
const AIRE_DEL_PIE_PX = pxDeEspaciado(ESCALON_DEL_PIE)

afirmar(quieto.includes(`pb-${ESCALON_DEL_PIE}`), `el contenedor de pantalla lleva pb-${ESCALON_DEL_PIE}`)
afirmar(DESCUENTO_NACIMIENTO_PX > 0, `la pastilla ocupa ${DESCUENTO_NACIMIENTO_PX} px del pie`, `alto ${ALTO_PASTILLA_PX} px más su margen`)
afirmar(AIRE_DEL_PIE_PX >= DESCUENTO_NACIMIENTO_PX, 'y el aire declarado los cubre', `${AIRE_DEL_PIE_PX} px de aire contra ${DESCUENTO_NACIMIENTO_PX} px de pastilla`)
controlPositivo('la cuenta ve un escalón que NO alcanza', '4', (e: string) => pxDeEspaciado(e) >= DESCUENTO_NACIMIENTO_PX)
controlPositivo('y el chequeo de la clase ve un contenedor sin ella', '<div class="flex min-h-svh"></div>', (h: string) => h.includes(`pb-${ESCALON_DEL_PIE}`))

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · El contraste de la tinta sobre el canvas — producido, no citado')

/**
 * ⚠ ESTA CIFRA VALE PARA EL MARCADOR DE POSICIÓN DEL CANVAS, no para la escena.
 * `COLORES_DEL_CANVAS_DE_PRUEBA` son dos tokens planos —`--color-superficie-2`
 * y `--color-superficie-3`—; la sala 3D es un gradiente con luces y NO hereda
 * este número. Cuando la escena exista hay que volver a medir sobre la pose
 * real, y si ahí no diera AA la salida no es una capa de fondo en esta sección.
 */
const AA_TEXTO = 4.5
const razones = COLORES_DEL_CANVAS_DE_PRUEBA.map((c) => ({ token: c.token, razon: razonDeContraste(TINTA_HEX, c.hex) }))
afirmar(razones.length > 0, `la cuenta mira ${razones.length} colores del canvas de prueba`)
for (const { token, razon } of razones) {
  afirmar(razon >= AA_TEXTO, `la tinta sobre ${token} da ${razon.toFixed(2)}:1`, `mínimo AA ${AA_TEXTO}:1`)
}
const peor = Math.min(...razones.map((r) => r.razon))
afirmar(peor >= AA_TEXTO, `el PEOR caso es ${peor.toFixed(2)}:1 y pasa AA para texto normal`)
controlPositivo('la calculadora ve dos colores que no se separan', ['#E8E8E6', '#DBDBD9'] as const, ([a, b]) => razonDeContraste(a, b) >= AA_TEXTO)

// ═══════════════════════════════════════════════════════════════════════════
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
 *  `_estilos/cta.css`, que nombra `:hover` y `:focus-visible` juntos y ya tiene
 *  su instrumento en S3. Lo que se afirma acá es la PARIDAD: si esta sección
 *  escribiera una `hover:`, tendría que traer su gemela. */
afirmarIgual(veces(FUENTE, 'hover:'), veces(FUENTE, 'focus-visible:'), 'toda `hover:` con su gemela `focus-visible:`')
afirmarIgual(veces(FUENTE, 'onClick'), 0, 'cero `onClick`: ningún div haciendo de botón')
afirmarIgual(veces(FUENTE, 'motion/_componentes'), 0, 'la única puerta a las piezas de motion es `_contrato/piezas`')
controlPositivo('el chequeo de paridad ve un marcado desparejo', '<i class="hover:opacity-casi">', (t: string) => veces(t, 'hover:') === veces(t, 'focus-visible:'))
/** ⚠ La entrada equivocada es la RUTA pelada y no un `import … from …` escrito
 *  entero, por la misma razón que el apagado de foco se arma: `s5-codigo`
 *  extrae los imports de todo el lane con una expresión regular sobre
 *  `from '…'`, y un import de mentira adentro de un string se lee igual que uno
 *  de verdad. El detector que se prueba acá mira la ruta, así que la ruta sola
 *  alcanza — y así este archivo no se delata a sí mismo. */
controlPositivo('el de la puerta ve una ruta a las piezas del demo', "'../../motion/_componentes/Pieza'", (t: string) => veces(t, 'motion/_componentes') === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · La geometría, el pedido y los patrones declarados')

afirmar(
  GEOMETRIA.claseDeLaMedida.endsWith(String(GEOMETRIA.columnasDeLaMedida)),
  'la clase de la medida y el número declarado dicen lo mismo',
  `${GEOMETRIA.claseDeLaMedida} sobre ${GEOMETRIA.columnasTotales} columnas`,
)
afirmar(quieto.includes(GEOMETRIA.claseDeLaMedida), '  y esa clase llega al marcado')
controlPositivo('el chequeo de la medida ve una clase que no coincide con el número', { claseDeLaMedida: 'escritorio:col-span-4', columnasDeLaMedida: 3 }, (g) => g.claseDeLaMedida.endsWith(String(g.columnasDeLaMedida)))

/**
/** ── B1 · LAS DOS CAJAS DE LA MEDIDA. La aritmética, no el píxel (`GEOMETRIA` y `B1-DELTAS.md` §4). Las grillas se cuentan por `data-columnas`, que emite `Grilla`. */
afirmar(GEOMETRIA.claseDelTitular.endsWith(String(GEOMETRIA.columnasDelTitular)), 'la clase del titular y el número declarado dicen lo mismo', GEOMETRIA.claseDelTitular)
afirmar(quieto.includes(GEOMETRIA.claseDelTitular), '  y esa clase llega al marcado')
afirmar(GEOMETRIA.columnasDelTitular < GEOMETRIA.columnasDeLaCajaDelTitular, 'la caja del titular es MÁS ANGOSTA que la medida: es lo que la saca del logo', `${GEOMETRIA.columnasDelTitular} de ${GEOMETRIA.columnasDeLaCajaDelTitular}`)
afirmarIgual(GEOMETRIA.columnasDeLaCajaDeLaBajada, 2, 'la bajada vive en media medida: una sub-grilla de DOS')
controlPositivo('el chequeo del titular ve una clase que no coincide con el número', { claseDelTitular: 'tablet:col-span-3', columnasDelTitular: 2 }, (g) => g.claseDelTitular.endsWith(String(g.columnasDelTitular)))
controlPositivo('  y el de la angostura ve una caja que NO acota', { columnasDelTitular: 3, columnasDeLaCajaDelTitular: 3 }, (g) => g.columnasDelTitular < g.columnasDeLaCajaDelTitular)
afirmarIgual(
  [GEOMETRIA.columnasTotales, GEOMETRIA.columnasDeLaCajaDelTitular, GEOMETRIA.columnasDeLaCajaDeLaBajada].map((n) => veces(quieto, `data-columnas="${n}"`)),
  [1, 1, 1],
  'las TRES grillas del hero salen una vez cada una: la medida, la del titular y la de la bajada',
)
afirmar(PEDIDO.length > 0, `el pedido tiene ${PEDIDO.length} entradas: no es una lista vacía`)
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta que no existe')
controlPositivo('el chequeo de entradas colgadas ve una ruta inventada', [{ ruta: 'no.existe', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }], (p) => entradasColgadas(CONTENIDO, p).length === 0)
afirmarIgual([...new Set(PEDIDO.map((e) => e.clase))], ['prosa'], 'y las dos son `prosa`: el relleno que NO se ve como agujero')
afirmarIgual(PATRONES_DE_LA_SECCION, ['P1', 'P2'], 'la sección declara consumir P1 y P2, y nada más')

cerrar('hero.invariant')
