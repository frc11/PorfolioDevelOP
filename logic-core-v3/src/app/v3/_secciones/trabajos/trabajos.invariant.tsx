/**
 * INVARIANTE — 04 · Trabajos: el Portfolio con el selector lateral. **[B1]**
 *
 * Corre con `npx tsx src/app/v3/_secciones/trabajos/trabajos.invariant.tsx` (`test:s5-trabajos`).
 *
 * La sección se renderiza DE VERDAD tres veces, en el mismo proceso y sin navegador: rama quieta (abajo de 1025 o antes de que la
 * coreografía se instale), coreografía forzada, y movimiento reducido mandando sobre el modo forzado. Todo se afirma sobre el
 * MARCADO que sale.
 *
 * ⚠️ **El invariante de antes se mudó con el túnel** (`_archivo/tunel-portfolio/tunel.invariant.tsx`, `test:s76-archivo-tunel`) y
 * sigue afirmando el código archivado. Acá queda el contrato de la sección nueva: el panel y la noche, el alto (la tabla no cambia y
 * la sección suma los pasos), el contenido (ahora con su pedido y la llave para lo que falta), los nombres, la higiene, los
 * encabezados, las paradas, el selector (`portfolio/portfolio-invariante.tsx`) y lo que siguió vivo: Demos (§25) y el carrusel de
 * abajo de 1024 (§27).
 *
 * ⚠ Entra en 300 líneas por la regla del lane: los detectores puros viven en `trabajos-detectores.ts`.
 */

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { rotuloDeParada } from '../../_lib/__tests__/s10-acceso'
import { paradasDeTabulacion } from '../../_lib/__tests__/s10-lectura'
import { WHATSAPP } from '../../_chrome/enlaces'
import { PANTALLAS_DE_NUMEROS } from '../../_lib/secciones'
import { NOMBRES_REALES } from '../_contrato/escaneo'
import { ATRIBUTO_DE_PANEL, seccionDe } from '../_contrato/forma'
import { MARCADORES, marcadoresPedidos, textosDe } from '../_contrato/marcadores'
import { entradasColgadas } from '../_contrato/pedido'
import { afirmarQueElContenidoNoEsUnDato, conLaLlaveApagada } from '../_invariantes/llave'
import { marcar } from '../_invariantes/render'

import { CONTENIDO, PATRONES_DE_LA_SECCION, PEDIDO, ROTULO_DE_SECCION_RETIRADO } from './contenido'
import { CATALOGO_DE_DEMOS as DEMOS } from './demos/catalogo'
import { afirmarLasDemos } from './demos/demos-invariante'
import { DISPARO_DE_LA_NOCHE, PX_DE_LA_SECCION } from './geometria'
import { afirmarAbajoDe1024 } from './movil-invariante'
import { afirmarElSelector } from './portfolio/portfolio-invariante'
import { PANTALLAS_POR_PASO, pantallasExtra, pxDeLaSeccion } from './portfolio/pasos'
import { PROYECTOS, seMuestraElServicio } from './proyectos'
import { Trabajos } from './Trabajos'
import { clicsFueraDeUnBoton, coloresDelTema, enlacesFueraDelContenido, hoversSinFoco, nombresQueNoSonEncabezado } from './trabajos-detectores'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const leer = (relativa: string): string => readFileSync(path.join(AQUI, relativa), 'utf8')

const seccion = seccionDe('trabajos')
const seccionMontada = <Trabajos seccion={seccion} />
const quieto = marcar(seccionMontada, { anima: false })
const conMotion = marcar(seccionMontada, { anima: true })
const conPreferencia = marcar(seccionMontada, { anima: false, preferencia: 'always' })
const veces = (html: string, aguja: string): number => html.split(aguja).length - 1

/** Los fuentes que llegan al navegador: la sección y el Portfolio. */
const DEL_PORTFOLIO = [
  'Acordeon.tsx', 'EncabezadoDelPortfolio.tsx', 'EscenarioDelPortfolio.tsx', 'Ficha.tsx', 'LaTuya.tsx', 'MarcaDeAgua.tsx', 'MedioDeLaTira.tsx', 'Tira.tsx',
  'anclas.ts', 'estado.ts', 'medios.ts', 'pasos.ts', 'saltar.ts', 'secuencia.ts', 'tipografia.ts', 'tramoDelSelector.ts', 'usePortfolio.ts',
  // [B1.2c] las piezas y los módulos nuevos: el formulario corto, el «?» que se arma, el orden, la rueda, la transición entre
  // proyectos, el hueco del logo, lo que se mide en el DOM y sus ganchos. [B1.2d B] Las barras de la tablet se fueron (T2).
  'FormularioDeLaTuya.tsx', 'SignoDePregunta.tsx', 'orden.ts', 'rueda.ts', 'transicion.ts', 'signo.ts', 'hueco.ts', 'medida.ts',
  'useOrdenDeLaEscena.ts', 'useRuedaDelPortfolio.ts', 'useTransicionDeLasTiras.ts',
  // [B1.3] el ancla al cargar. [B1.2e] Las historias se fueron (sus dos piezas): debajo de 1024, el carrusel —el flujo, la tarjeta, su medio
  // medido y el disparo por línea—, con el componente común de `_componentes/carrusel/`.
  'useAnclaDeLaCarga.ts', 'FlujoDelPortfolio.tsx', 'TarjetaDelProyecto.tsx', 'medioDelCarrusel.ts', 'useMedioDelCarrusel.ts', 'useDisparoPorLinea.ts',
].map((f) => `portfolio/${f}`)
const ARCHIVOS = ['Trabajos.tsx', 'CapaDeLaGota.tsx', 'gota.ts', 'geometria.ts', 'contenido.ts', 'proyectos.ts', ...DEL_PORTFOLIO]
const FUENTES = ARCHIVOS.map((archivo) => ({ archivo, texto: leer(archivo) }))
const FUENTE_DE_LA_COMPOSICION = FUENTES.filter((f) => f.archivo.endsWith('.tsx')).map((f) => f.texto).join('\n')
const FUENTE_DEL_PANEL = leer('../../_componentes/Panel.tsx')
const CSS = leer('../../../theme-develop.css')
const { fondo: FONDO_OSCURO, tinta: TINTA_CLARA, acentos: ACENTOS, acentosClaros: ACENTOS_CLAROS } = coloresDelTema(CSS)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El puente del atributo del panel, y las dos líneas de la noche')

afirmar(FUENTE_DEL_PANEL.includes(`${ATRIBUTO_DE_PANEL}={seccion.id}`), 'el atributo que `anclaje: "seccion"` busca es el que `Panel.tsx` emite', ATRIBUTO_DE_PANEL)
controlPositivo('el puente vería a las dos fuentes separadas', 'data-panel-viejo={seccion.id}', (t: string) => t.includes(`${ATRIBUTO_DE_PANEL}={seccion.id}`))
afirmar(DISPARO_DE_LA_NOCHE.vuelta > DISPARO_DE_LA_NOCHE.ida, `las dos líneas del disparo son distintas y la de soltar va DEBAJO: ${DISPARO_DE_LA_NOCHE.ida} % para prender, ${DISPARO_DE_LA_NOCHE.vuelta} % para soltar`)
const mideSinSolape = (src: string): boolean => src.includes("panel?.querySelector('[data-caja-sin-solape]') ?? panel") && src.includes('data-caja-sin-solape')
afirmar(mideSinSolape(leer('CapaDeLaGota.tsx')) && FUENTE_DEL_PANEL.includes('data-caja-sin-solape'), `  y se miden contra la caja SIN solape que emite \`Panel\`: ${(PANTALLAS_DE_NUMEROS - 1) * 100} % a cualquier ancho`)
controlPositivo('  el detector vería la gota observando el panel', "const caja = capa?.closest('[data-panel]') ?? null", mideSinSolape)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El alto: la tabla no cambia y la sección suma los pasos del selector')

const FUENTE_DE_TRABAJOS = leer('Trabajos.tsx')
afirmarIgual(PX_DE_LA_SECCION, 6813, 'la tabla sigue declarando 717svh + 40 de solape: 6.813 px de la regla (lo que la escena lee)')
afirmarIgual(pxDeLaSeccion(PANTALLAS_POR_PASO), 9231, `la sección mide 900 + 4 × ${PANTALLAS_POR_PASO} × 900 + 2.931 = 9.231 ([B1.2b] un paso de 1,5 pantallas por proyecto y uno para «la tuya»)`)
afirmar(FUENTE_DE_TRABAJOS.includes('min-h-[calc(var(--alto-minimo-del-panel)+var(--pantallas-extra-del-portfolio)*100svh)]'), '  y lo suma en CSS sobre el alto del panel, en todo ancho (sin una rama de JS por ancho)')
afirmar(quieto.includes(`--pantallas-extra-del-portfolio:${pantallasExtra(PANTALLAS_POR_PASO).toFixed(5)}`), `  desde el servidor: ${pantallasExtra(PANTALLAS_POR_PASO).toFixed(5)} pantallas de más, en la rama quieta`)
afirmar(conMotion.includes(`--pantallas-extra-del-portfolio:${pantallasExtra(PANTALLAS_POR_PASO).toFixed(5)}`), '  y en la animada: las dos ramas miden lo mismo (la escena descuenta igual)')
controlPositivo('  la cuenta vería un paso de una pantalla', 1, (paso: number) => pxDeLaSeccion(paso) === 8556)
afirmar(FUENTE_DE_TRABAJOS.includes('max-escritorio:[--ancho-del-portfolio:tablet]') && FUENTE_DE_TRABAJOS.includes('max-movil:[--ancho-del-portfolio:movil]'), 'el ancho lo decide el CSS (`--ancho-del-portfolio`): la sección no mide el ancho en JS')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El contenido no se puede leer como un dato')

const { SIN_LLAVE, quietoSinLlave, animadoSinLlave } = conLaLlaveApagada(CONTENIDO, quieto, conMotion)
const TEXTOS = textosDe(CONTENIDO)
afirmar(TEXTOS.length > 0, `el contenido tiene ${TEXTOS.length} textos: la cuenta no es vacía`)
afirmarQueElContenidoNoEsUnDato(CONTENIDO, SIN_LLAVE)
afirmar(CONTENIDO.titular.length > 0 && !/\d/.test(CONTENIDO.titular), 'el titular existe y no lleva una sola cifra', CONTENIDO.titular)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Lo que falta, pedido y a la vista (la llave apagada)')

afirmarIgual([...marcadoresPedidos(SIN_LLAVE)].sort(), ['[NOMBRE]', '[TESTIMONIO]', '[TEXTO]'], 'el contenido pide tres clases de marcador: las reseñas (texto y firma) y lo que se le resolvió a Esquina y a Banú')
afirmarIgual(MARCADORES.filter((m: string) => quietoSinLlave.includes(m)).sort(), ['[NOMBRE]', '[TESTIMONIO]', '[TEXTO]'], '  y los tres llegan al marcado de la rama quieta')
afirmarIgual(MARCADORES.filter((m: string) => animadoSinLlave.includes(m)).sort(), ['[NOMBRE]', '[TESTIMONIO]', '[TEXTO]'], '  y al de la animada: el hueco se ve en todo ancho')
afirmarIgual(veces(quietoSinLlave, '[TESTIMONIO] · pendiente'), PROYECTOS.length, '  las tres reseñas, «[TESTIMONIO] · pendiente»: ninguna inventada')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los tres nombres reales, literales — y DERIVADOS de la lista')

const NOMBRES = CONTENIDO.proyectos.map((p) => p.nombre)
afirmarIgual(NOMBRES_REALES.filter((real) => !NOMBRES.some((n) => n.includes(real))), [], 'cada nombre de NOMBRES_REALES está adentro de un nombre del contenido')
for (const n of NOMBRES) afirmar(quieto.includes(n) && conMotion.includes(n), `"${n}" aparece literal en las dos ramas`)
controlPositivo('el chequeo de los nombres ve un marcado sin ellos', '<div>tres clientes</div>', (html: string) => NOMBRES.every((n) => html.includes(n)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El contenido llega COMPLETO a las dos ramas, y la quieta no se mueve')

/** Las filas de la ficha que van al marcado OCULTAS, derivadas: el servicio mientras los tres digan lo mismo, el resultado si no hay. */
const OCULTAS = [...(seMuestraElServicio(PROYECTOS) ? [] : ['servicio']), ...(PROYECTOS.some((p) => p.resultado !== null) ? [] : ['resultado'])]
/**
 * [B1.2d B] Lo único del contenido que NO va al marcado servido, con su razón: [B1.2e] los nombres de las dos flechas del carrusel (eran los
 * dos controles del teclado de las historias). El carrusel se monta en el cliente, debajo de 1024 (el servidor sirve el acordeón).
 */
const SOLO_EN_EL_CARRUSEL = ['carrusel.anterior', 'carrusel.siguiente']
const ENTEROS = TEXTOS.filter((h) => !SOLO_EN_EL_CARRUSEL.includes(h.ruta))
afirmarIgual(TEXTOS.filter((h) => SOLO_EN_EL_CARRUSEL.includes(h.ruta)).length, SOLO_EN_EL_CARRUSEL.length, 'lo que no va al marcado servido es sólo lo del carrusel (las dos rutas existen)')
afirmarIgual(ENTEROS.filter((h) => !quieto.includes(h.valor)).map((h) => h.ruta), [], 'los textos del contenido llegan enteros a la rama quieta')
afirmarIgual(ENTEROS.filter((h) => !conMotion.includes(h.valor)).map((h) => h.ruta), [], '  y a la animada')
afirmarIgual(OCULTAS, ['servicio', 'resultado'], 'dos filas de la ficha van al marcado ocultas, derivadas: el servicio (los tres dicen lo mismo) y el resultado (ninguno tiene)')
afirmar(OCULTAS.every((f) => veces(quieto, `data-fila="${f}" hidden=""`) === PROYECTOS.length), '  en las tres fichas')
afirmar(!quieto.includes(ROTULO_DE_SECCION_RETIRADO), `y el RÓTULO DE SECCIÓN («${ROTULO_DE_SECCION_RETIRADO}») ya NO se lee (B12: se da vuelta, no se borra)`)
controlPositivo('el chequeo de "está completo" ve un marcado al que le falta un texto', '<div>Portfolio</div>', (html: string) => TEXTOS.every((h) => html.includes(h.valor)))
const DEL_CARRUSEL = 4 * DEMOS.length
const DE_LA_CINTA = 4 * DEMOS.length
// [B1] Nada del Portfolio se pide antes de que la sección esté cerca: en el servidor ni un póster, y los tres videos sin `src`.
afirmarIgual(veces(quieto, '<img'), DE_LA_CINTA + DEL_CARRUSEL, 'en la rama quieta, sólo las imágenes de Demos (la cinta y el carrusel): ni un póster del Portfolio antes de estar cerca')
afirmarIgual(veces(conMotion, '<img'), DEMOS.length + DEL_CARRUSEL, '  y con la coreografía, sólo las de Demos (el estante y el carrusel)')
afirmarIgual(veces(quieto, '<video'), PROYECTOS.length, 'un video por proyecto en el acordeón, el de escritorio ([B1.2d B] el del teléfono lo pinta su historia, debajo de 1024)')
afirmar(!/<video[^>]*\ssrc="/.test(quieto) && !/<video[^>]*\ssrc="/.test(conMotion), '  y ninguno con `src` en el servidor')
afirmar(!quieto.includes('transform:') && !quieto.includes('will-change'), 'la rama quieta no escribe una transformada ni promueve una capa')
afirmar(!conPreferencia.includes('transform:'), '  y con `prefers-reduced-motion` tampoco')
controlPositivo('el chequeo de "no hay transformada" ve un style con transform', '<div style="transform:translateY(10%)"></div>', (html: string) => !html.includes('transform:'))
const soloParaLectores = [...quieto.matchAll(/<(\w+)([^>]*)class="sr-only"/g)].map((m) => (/role="(alert|status)"/.exec(m[2])?.[1] ?? m[1]))
afirmarIgual(soloParaLectores, ['alert', 'status'], 'ningún `sr-only` de nombre: el del «Visitar sitio» va en su `aria-label`; [B1.2c] los dos que hay son las regiones vivas del formulario de la tuya (el aviso y el gracias, como en el contacto)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Cero `three` y cero contextos: el Portfolio no abre un lienzo')

const TRES = /from ['"](three|@react-three\/[a-z-]+|three\/[^'"]+)['"]/
const CONTEXTO = /<Canvas\b|WebGLRenderer|getContext\(\s*['"]webgl/
for (const { archivo, texto } of FUENTES) afirmar(!TRES.test(texto) && !CONTEXTO.test(texto), `${archivo}: ni three ni un contexto WebGL ([B1.2b] el «?» es un SVG en el DOM)`)
// [F6] Reemplazada por la spec: el formulario en 3D (B7) salió; quedan los tres de las historias. [P-H31b] Y su scroll quieto pasó al
// componente común: quedan dos. [B1.2e] Reemplazada por la spec: las dos de las historias se fueron y entran las cinco del carrusel.
afirmarIgual(FUENTES.length, 23 + 11 + 1 + 5, 'se leyeron del disco los cuarenta archivos de la sección y del Portfolio (los veintitrés de B1.2b, once de B1.2c, uno de B1.3 y [B1.2e] los cinco del carrusel: las barras de la tablet, el deslizamiento, [F6] el formulario en 3D, [P-H31b] el freno del arrastre y [B1.2e] las dos piezas de las historias se fueron)')
controlPositivo('  el detector ve el padrón de B (con el formulario en 3D, que ya no está en el disco)', [...DEL_PORTFOLIO, 'portfolio/FormularioEnPerspectiva.tsx'], (lista: readonly string[]) => lista.every((a) => existsSync(path.join(AQUI, a))))
controlPositivo('el detector ve un renderer propio', 'const r = new THREE.WebGLRenderer()', (t: string) => !CONTEXTO.test(t))

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Sobre el oscuro el acento no llega ni a 3:1 — así que no es texto')

afirmarIgual(ACENTOS.length, 3, 'se leyeron los tres acentos de theme-develop.css')
afirmarIgual(FONDO_OSCURO, '#0E0E0E', 'y el fondo de la sección invertida (el negro de la marca: el panel «tinta»)')
for (const acento of ACENTOS) afirmar(razonDeContraste(acento, FONDO_OSCURO) < 3, `${acento} sobre ${FONDO_OSCURO}: no llega a 3:1`)
controlPositivo('la cuenta de contraste ve un par que SÍ llega a 3:1', '#FFFFFF', (hex: string) => razonDeContraste(hex, FONDO_OSCURO) < 3)
afirmar(razonDeContraste(TINTA_CLARA, FONDO_OSCURO) >= 4.5, `la tinta sobre el panel da ${razonDeContraste(TINTA_CLARA, FONDO_OSCURO).toFixed(2)}: AA`)
/** Las clases enteras de un marcado (`text-acento` no es `text-acento-claro`). */
const clase = (html: string, nombre: string): number => [...html.matchAll(/class="([^"]*)"/g)].reduce((n, m) => n + m[1].split(/\s+/).filter((c) => c === nombre).length, 0)
afirmarIgual(clase(quieto, 'text-acento') + clase(quieto, 'border-acento'), 0, 'cero `text-acento` y cero `border-acento` en el marcado')
// [B1.2c] P-H2 · salvo el acento CLARO: el tema emitió las variantes claras (el disparador que dejó escrito) y son las únicas que
// pueden ser texto sobre la sala de noche. Los rótulos de la ficha las usan, por su alias (`text-acento-claro`, `_contrato/acento.ts`).
afirmarIgual(ACENTOS_CLAROS.length, 3, '[B1.2c] y se leyeron los tres acentos CLAROS (P-H2)')
for (const acento of ACENTOS_CLAROS) afirmar(razonDeContraste(acento, FONDO_OSCURO) >= 4.5, `  ${acento} sobre ${FONDO_OSCURO}: ${razonDeContraste(acento, FONDO_OSCURO).toFixed(2)}, AA como texto`)
controlPositivo('  la cuenta ve un acento claro que no llega (el sólido de web)', ACENTOS[0], (hex: string) => razonDeContraste(hex, FONDO_OSCURO) >= 4.5)
const ROTULOS_DE_LA_FICHA = PROYECTOS.length * 6 + PROYECTOS.filter((p) => p.resena !== null).length
afirmarIgual(clase(quieto, 'text-acento-claro'), ROTULOS_DE_LA_FICHA, `  y el acento claro es sólo el de los rótulos de la ficha (seis filas por proyecto y la reseña): ${String(ROTULOS_DE_LA_FICHA)}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · Higiene: color, foco, interactividad y puertas')

afirmarIgual(veces(quieto, 'outline-none'), 0, 'cero `outline-none`: el anillo de foco lo pone el tema')
afirmar(!/#[0-9a-fA-F]{3,8}\b/.test(quieto), 'cero color fuera de los tokens: ni un hex suelto')
const CLASE_DE_PRUEBA = 'p-' + '[' + '7px' + ']'
afirmar(!/-\[\d+(px|rem)\]/.test(quieto), 'cero px o rem suelto en un valor arbitrario de clase')
controlPositivo('el chequeo del px suelto ve una clase con un valor en px', `<i class="${CLASE_DE_PRUEBA}">`, (html: string) => !/-\[\d+(px|rem)\]/.test(html))
afirmarIgual(hoversSinFoco(quieto), [], `los ${veces(quieto, 'hover:')} \`hover:\` llevan su \`focus-visible:\` en la misma clase`)
controlPositivo('  el detector ve un hover sin su gemela', '<a class="hover:underline">x</a>', (html: string) => hoversSinFoco(html).length === 0)
afirmarIgual(veces(quieto, '<button'), CONTENIDO.proyectos.length + 1 + 1, 'CINCO botones: una cabecera por tira (las tres y la tuya) y [B1.2c] «Enviar» del formulario de la tuya ([B1.2e] las flechas del carrusel, debajo de 1024, se montan en el cliente)')
afirmarIgual(veces(quieto, '<a '), 2 * PROYECTOS.length + 1 + DE_LA_CINTA + DEL_CARRUSEL, 'SIETE enlaces del Portfolio (el medio de cada tira, sólo para el mouse, y su «Visitar sitio»; [B1.2c] y WhatsApp en la tuya) más los de Demos')
afirmarIgual(veces(quieto, 'rel="noopener noreferrer"'), veces(quieto, '<a '), '  todos salen del sitio sin darle acceso a esta ventana ni el referente')
afirmarIgual(veces(conMotion, '<a '), 2 * PROYECTOS.length + 1 + DEMOS.length + DEL_CARRUSEL, '  y los mismos siete con la coreografía puesta')
afirmarIgual(enlacesFueraDelContenido(quieto, [...PROYECTOS.map((p) => p.url), ...DEMOS.map((d) => d.url), WHATSAPP.href]), [], '  y ni un `href` que no salga del contenido: ninguna URL inventada ([B1.2c] WhatsApp, el del archivo del pie)')
controlPositivo('el detector ve un enlace inventado', '<a href="https://inventado.example">Esquina</a>', (html: string) => enlacesFueraDelContenido(html, PROYECTOS.map((p) => p.url)).length === 0)
afirmarIgual(clicsFueraDeUnBoton(FUENTE_DE_LA_COMPOSICION), [], 'cada `onClick` de la fuente va en un `<button>`: ningún div haciendo de botón')
controlPositivo('  el detector ve un div con un manejador', '<div className="x" onClick={() => undefined}>', (src: string) => clicsFueraDeUnBoton(src).length === 0)
afirmarIgual(veces(FUENTE_DE_LA_COMPOSICION, 'motion/_componentes'), 0, 'la única puerta a las piezas es `_contrato`')

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · El árbol de encabezados')

afirmarIgual(veces(quieto, '<h1'), 0, 'ningún h1: el h1 es del Hero')
afirmarIgual(veces(quieto, '<h2'), 1, 'exactamente UN h2 — «Portfolio»')
afirmarIgual(veces(quieto, '<h3'), PROYECTOS.length + 2, 'y cinco h3: la cabecera de cada tira (las tres y la tuya) y el de Demos')
afirmarIgual(veces(conMotion, '<h3'), PROYECTOS.length + 2, '  también con la coreografía')
afirmarIgual(nombresQueNoSonEncabezado(quieto, NOMBRES), [], 'los tres nombres son la cabecera (h3) de su tira')
controlPositivo('el detector ve un nombre que NO es encabezado', '<p>Esquina Estudio</p>', (html: string) => nombresQueNoSonEncabezado(html, NOMBRES).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('14 · El pedido y el patrón declarado')

afirmarIgual(PEDIDO.length, 2 + 2 + 2 * PROYECTOS.length, 'DIEZ casillas: dos de prosa (la bajada y la de la tuya, para C2), dos `[TEXTO]` y las tres reseñas con su firma')
afirmarIgual(entradasColgadas(CONTENIDO, PEDIDO).map((e) => e.ruta), [], 'ninguna apunta a una ruta que no existe')
controlPositivo('el chequeo de entradas colgadas ve una ruta inventada', [{ ruta: 'proyectos[3].nombre', clase: 'prosa' as const, marcador: null, quienLoTrae: 'valentino' as const, que: 'nada', formato: 'texto plano' }], (p) => entradasColgadas(CONTENIDO, p).length === 0)
afirmar(PEDIDO.every((e) => e.quienLoTrae === 'valentino' && e.formato.length > 0 && e.que.length > 0), '  todas con su dueño (Valentino), qué hay que traer y en qué formato')
afirmarIgual(PEDIDO.filter((e) => e.marcador === null).map((e) => e.ruta).sort(), ['bajada', 'laTuya.bajada'], '  y las de prosa son las dos sin marcador visible (decisión de la aprobación)')
const valorEn = (ruta: string): string | undefined => textosDe(SIN_LLAVE).find((h) => h.ruta === ruta)?.valor
afirmarIgual(PEDIDO.filter((e) => e.marcador !== null && !(valorEn(e.ruta) ?? '').includes(e.marcador)).map((e) => e.ruta), [], '  y cada casilla con marcador lo lleva en su lugar con la llave apagada')
const patronesDelFuente = [...new Set([...FUENTE_DE_LA_COMPOSICION.matchAll(/patron="(P\d)"/g)].map((m) => m[1]))].sort()
afirmarIgual(patronesDelFuente, ['P2', 'P7'], 'la sección consume DOS patrones: P2 (el titular y la bajada) y P7 (el bloque)')
afirmarIgual([...PATRONES_DE_LA_SECCION].sort(), patronesDelFuente, '  y `PATRONES_DE_LA_SECCION` dice exactamente los mismos')

// ═══════════════════════════════════════════════════════════════════════════
titulo('16 · Las paradas de teclado')

const PARADAS_DE_DEMOS = 2 * DEMOS.length
const PARADAS = paradasDeTabulacion(quieto)
afirmarIgual(PARADAS.length, PROYECTOS.length + 1 + PROYECTOS.length + 5 + PARADAS_DE_DEMOS, 'DOCE paradas del Portfolio (cuatro cabeceras, tres «Visitar sitio» y [B1.2c] el formulario de la tuya: dos campos, [B1.2d B] el texto largo, «Enviar» y WhatsApp; los dos toques de la historia se fueron) más las de Demos (la cinta y el carrusel)')
afirmarIgual(PARADAS.filter((p) => p.etiqueta !== 'a' && p.etiqueta !== 'button' && p.etiqueta !== 'input' && p.etiqueta !== 'textarea').map((p) => p.etiqueta), [], '  todas son anclas, botones o [B1.2c] los campos del formulario ([B1.2d B] con el texto largo): ningún `tabindex` escrito')
afirmarIgual(PARADAS.filter((p) => rotuloDeParada(quieto, p).rotulo.trim() === '').map((p) => p.destino ?? p.etiqueta), [], '  y todas se anuncian con algo (un campo, con su `<label for>`)')
afirmarIgual(PARADAS.filter((p) => p.ocultoALectores).length, 0, '  ninguna cuelga de algo escondido a los lectores')
afirmarIgual(paradasDeTabulacion(conMotion).length, PARADAS.length, 'y con la coreografía puesta son las mismas: el recorrido no lo cambia el ancho')
afirmarIgual(veces(quieto, 'visibility:hidden'), 1, '  y lo único oculto por estilo es la capa del barrido de la gota, que es decoración')

// ═══════════════════════════════════════════════════════════════════════════
afirmarElSelector(quieto, conMotion)
// §25 —Demos— y §27 —abajo de 1024, el carrusel— siguen vivos y se afirman acá.
afirmarLasDemos()
afirmarAbajoDe1024()

cerrar('trabajos.invariant')
