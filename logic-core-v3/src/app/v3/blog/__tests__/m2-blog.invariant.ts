/**
 * INVARIANTE M2 — el blog, la nota y la 404 con lo que Valentino eligió del laboratorio (`docs/cola/2026-10-30/M2.md`). Sin navegador: las
 * cuentas puras y el marcado leído del disco. Cada regla con su control positivo (una entrada rota que la tiene que hacer fallar).
 *
 * Corre con `npm run test:s93-m2-blog` (lo sumó M-INT; `verificar` lo corre). Antes, a mano con `npx tsx`, porque `package.json` estaba fuera del
 * carril M2.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { CARRUSEL } from '../../_componentes/carrusel/maquinaDelCarrusel'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { ARRANQUE, esperaDelIntento, puedeArrancar, type CondicionesDelArranque } from '../../_no-encontrada/arranque'
import { NOTAS, lugarDelDestacado } from '../_notas/indice'
import type { Nota } from '../_notas/tipos'
import { APOYO_LARGO_MS, CORRIDA_DE_LA_FOTO, FORMA_DE_LA_DESTACADA, MS_POR_DESTACADA, bloqueaElClic, corridaDeLaFoto } from '../_movimiento/carrusel'
import { LINEA_DE_LECTURA, avanceDelHilo, formaDelHiloPedida, posicionDeLaAguja } from '../_movimiento/hilo'
import { SOBRA, corrimientoDeLaFoto } from '../_movimiento/parallax'
import { avanceDelBloque } from '../_movimiento/pintado'
import { LUGARES } from '../lugares'

const V3 = 'src/app/v3'
const BLOG = `${V3}/blog`
const leer = (ruta: string): string => readFileSync(join(process.cwd(), ruta), 'utf8')
/** El código sin comentarios: la prosa puede nombrar lo que se sacó. */
const codigo = (f: string): string => f.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const cerca = (a: number, b: number): boolean => Math.abs(a - b) < 1e-9

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El carrusel de las destacadas: más rápido, la foto con profundidad y la tarjeta entera es el enlace')

const rapido = (ms: number): boolean => ms >= 5000 && ms <= 6000 && ms < CARRUSEL.duracionMs
afirmar(rapido(MS_POR_DESTACADA), `cada destacada dura ${MS_POR_DESTACADA} ms (entre 5 y 6 s, menos que los ${CARRUSEL.duracionMs} del común)`)
controlPositivo('el reloj de 10 s del prototipo es lento', CARRUSEL.duracionMs, rapido)

const carrusel = leer(`${BLOG}/CarruselDeDestacadas.tsx`)
const usaElComun = (f: string): boolean =>
  /<CarruselDeTarjetas[\s\S]*?duracionMs=\{MS_POR_DESTACADA\}[\s\S]*?asoma=\{FORMA_DE_LA_DESTACADA\}/.test(f) && /from '\.\.\/_componentes\/carrusel\/CarruselDeTarjetas'/.test(f)
afirmar(usaElComun(carrusel), 'usa el carrusel común (importado) con su reloj y el modo asoma: pausa al mantener, flechas, dedo y movimiento reducido son los suyos')
controlPositivo('un carrusel propio no cuenta', carrusel.replace('<CarruselDeTarjetas', '<CarruselPropio'), usaElComun)
afirmar(FORMA_DE_LA_DESTACADA.fraccion < 1 && FORMA_DE_LA_DESTACADA.proporcion > 1, 'la tarjeta es apaisada y deja asomar la siguiente')

/** La tarjeta destacada: un `EnlaceDeRuta` que abre antes de la foto y cierra después del título (toda la imagen entra a la nota). */
const tarjetaEsElEnlace = (f: string): boolean => {
  const tarjeta = f.slice(f.indexOf('function TarjetaDestacada'))
  const abre = tarjeta.indexOf('<EnlaceDeRuta')
  const foto = tarjeta.indexOf('<FotoDeNota')
  const tituloDeLaNota = tarjeta.indexOf('{nota.titulo}')
  const cierra = tarjeta.indexOf('</EnlaceDeRuta>')
  return abre !== -1 && abre < foto && foto < tituloDeLaNota && tituloDeLaNota < cierra
}
afirmar(tarjetaEsElEnlace(carrusel), 'la tarjeta entera (la foto y el título) es el enlace a la nota')
// El control mueve el enlace entre la foto y el título: existe, pero la foto queda afuera.
const conElEnlaceDespuesDeLaFoto = carrusel.replace(/<EnlaceDeRuta([\s\S]*?)>\s*(<FotoDeNota[^>]*\/>)/, '<span>$2<EnlaceDeRuta$1>')
controlPositivo('con el enlace sólo en el título, la foto no entra', conElEnlaceDespuesDeLaFoto, (f) => conElEnlaceDespuesDeLaFoto !== carrusel && tarjetaEsElEnlace(f))

/** La guarda del clic, por comportamiento: un apoyo largo no abre; un toque (aun lento), el teclado y un lector, sí. */
type Guarda = typeof bloqueaElClic
const guardaBien = (g: Guarda): boolean =>
  g({ desde: 0, tipo: 'mouse' }, 1500, 1) && // apoyo largo con el mouse: pausó, soltar no abre
  !g({ desde: 0, tipo: 'touch' }, 220, 1) && // un toque lento (pasó la pausa de 200 ms): entra
  !g({ desde: 0, tipo: 'mouse' }, 90, 1) && // un clic: entra
  !g({ desde: 0, tipo: 'mouse' }, 60_000, 0) && // Enter o un lector, con un apoyo viejo de un arrastre: entra
  !g(null, 60_000, 1) &&
  APOYO_LARGO_MS > CARRUSEL.mantenerMs
afirmar(guardaBien(bloqueaElClic), `un apoyo de ${APOYO_LARGO_MS} ms o más no abre la nota; un toque lento, un clic, Enter y un lector sí`)
controlPositivo('la guarda vieja (por los 200 ms del carrusel, sin mirar el teclado)', (a, ahora) => a !== null && ahora - a.desde >= CARRUSEL.mantenerMs, guardaBien)
afirmar(/if \(bloqueaElClic\(a, performance\.now\(\), e\.detail\)\) e\.preventDefault\(\)/.test(carrusel), 'la tarjeta usa esa guarda con el `detail` del clic')

afirmarIgual(corridaDeLaFoto(0), 0, 'la foto de la tarjeta de ahora está en su lugar')
afirmar(corridaDeLaFoto(1) === -CORRIDA_DE_LA_FOTO && corridaDeLaFoto(-1) === CORRIDA_DE_LA_FOTO, 'la de la vecina, corrida al revés de su lado')
// La corrida va en % de la CAPA (que mide 1 + 2·SOBRA del marco); la sobra, en % del marco.
afirmar(corridaDeLaFoto(7) === -CORRIDA_DE_LA_FOTO && CORRIDA_DE_LA_FOTO * (1 + 2 * SOBRA) < SOBRA * 100, 'acotada, y menos que lo que sobra la capa medido en el marco (no se ve el borde)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El parallax de las fotos')

afirmarIgual(corrimientoDeLaFoto(400, 200, 1000), 0, 'con el marco centrado en el cuadro, la foto en su lugar')
afirmar(cerca(corrimientoDeLaFoto(1000, 200, 1000), -SOBRA * 200), 'con el marco asomando abajo, corrida hacia arriba la sobra entera')
afirmar(cerca(corrimientoDeLaFoto(-200, 200, 1000), SOBRA * 200), 'con el marco yéndose por arriba, hacia abajo la sobra entera')
afirmar(cerca(corrimientoDeLaFoto(5000, 200, 1000), -SOBRA * 200) && corrimientoDeLaFoto(0, 0, 1000) === 0, 'acotada lejos del cuadro y quieta sin alto')
const parallax = leer(`${BLOG}/_movimiento/parallax.ts`)
const leeYDespuesEscribe = (f: string): boolean => /const bordes = cerca\.map\(\(f\) => f\.marco\.getBoundingClientRect\(\)\)\s*\n\s*cerca\.forEach/.test(f)
afirmar(leeYDespuesEscribe(parallax), 'una suscripción para todas las fotos: lee todos los marcos y después escribe')
controlPositivo('leer y escribir intercalados', parallax.replace('const bordes = cerca.map((f) => f.marco.getBoundingClientRect())', 'const bordes = []'), leeYDespuesEscribe)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La grilla: la foto en el marco y el título debajo, dispersa, llegando desde abajo')

const tarjeta = leer(`${BLOG}/TarjetaDeNota.tsx`)
const tituloDebajo = (f: string): boolean => {
  const foto = f.indexOf('<FotoDeNota')
  const t = f.indexOf('<TitularQueSeLevantaAlCruzar')
  return foto !== -1 && t > foto && /<FotoDeNota[^>]*\/>/.test(f)
}
afirmar(tituloDebajo(tarjeta), 'la foto es su propio marco (sin texto adentro) y el título va debajo y se levanta')
controlPositivo('el título adentro de la foto', tarjeta.replace(/<FotoDeNota([^>]*)\/>/, '<FotoDeNota$1><TitularQueSeLevantaAlCruzar /></FotoDeNota>').replace(/<TitularQueSeLevantaAlCruzar nivel/, '<span nivel'), tituloDebajo)

const grilla = codigo(leer(`${BLOG}/NotasEnDesorden.tsx`))
const llegaDesdeAbajoSinGiro = (f: string): boolean => /<Gatillo desde="abajo">/.test(f) && !/rotate|giro/.test(f)
afirmar(llegaDesdeAbajoSinGiro(grilla), 'cada tarjeta llega con el gatillo de siempre, desde abajo, sin el giro que se endereza')
controlPositivo('el giro del prototipo', `${grilla}\nconst giro = 2`, llegaDesdeAbajoSinGiro)

const disperso = (l: readonly { readonly escritorio: string; readonly forma: string }[]): boolean => {
  const columnas = new Set(l.map((x) => /col-start-(\d+)/.exec(x.escritorio)?.[1]))
  const formas = new Set(l.map((x) => x.forma))
  const corridas = l.filter((x) => /mt-\[\d+svh\]/.test(x.escritorio)).length
  return columnas.size >= 4 && formas.size >= 3 && corridas >= 4
}
afirmar(disperso(LUGARES), `dispersión: ${LUGARES.length} lugares con 4+ columnas de arranque, 3+ proporciones y 4+ corrimientos hacia abajo`)
controlPositivo('una grilla pareja', LUGARES.map(() => ({ escritorio: 'escritorio:col-start-1 escritorio:col-span-6', forma: 'aspect-[4/3]' })), disperso)
afirmar(/escritorio:\[grid-row:var\(--fila\)\/span_2\]/.test(grilla), 'desde 1024, escalonadas: cada una ocupa dos filas y la siguiente arranca en la segunda (el orden del documento es el de la lectura)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las notas: fotos (no tapas tipográficas) y la frase destacada sacada de su texto')

afirmar(!existsSync(join(process.cwd(), `${BLOG}/PortadaDeNota.tsx`)) && !/portada/.test(leer(`${BLOG}/_notas/tipos.ts`)), 'no queda la portada tipográfica')
for (const n of NOTAS) {
  afirmar(n.foto === `/v3/blog/${n.slug}.webp` && existsSync(join(process.cwd(), 'public', n.foto)), `«${n.slug}»: su foto existe en public${n.foto}`)
}
const textoDe = (n: Nota): string => [...n.introduccion, ...n.secciones.flatMap((s) => s.parrafos)].join('\n')
const destacadoLiteral = (n: Nota): boolean => lugarDelDestacado(n) !== null && textoDe(n).split(n.destacado).length === 2 && n.destacado.split(' ').length >= 5
for (const n of NOTAS) afirmar(destacadoLiteral(n), `«${n.slug}»: la frase destacada está UNA vez, literal, en un párrafo (no es texto nuevo)`)
const primera = NOTAS[0]
if (primera !== undefined) controlPositivo('una frase inventada', { ...primera, destacado: 'Una frase que no está en ninguna parte de la nota.' }, destacadoLiteral)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La nota: subtítulos que se levantan, la frase que se pinta, sin el tachado, y el hilo')

const nota = codigo(leer(`${BLOG}/[slug]/CuerpoDeLaNota.tsx`))
const notaElegida = (f: string): boolean =>
  /<HiloDeLectura>/.test(f) && /<TitularQueSeLevantaAlCruzar nivel="titulo-s" como="h3">/.test(f) && /<FraseDestacada /.test(f) && /min de lectura/.test(f) && !/Trazo|tachado|Leída/.test(f)
afirmar(notaElegida(nota), 'el hilo, los subtítulos que se levantan, la frase destacada y «N min de lectura» sin tachar')
controlPositivo('con el tachado del prototipo', `${nota}\n// <Trazo tipo="tachado">`, notaElegida)
afirmar(posicionDeLaAguja(100, 2000, 400) === 300, 'la aguja va EN la línea de lectura mientras el texto la cruza')
afirmar(posicionDeLaAguja(900, 2000, 400) === 0 && posicionDeLaAguja(-3000, 2000, 400) === 2000, 'clavada arriba antes del texto y abajo después')
afirmar(avanceDelHilo(-1600, 2000, 400) === 1 && posicionDeLaAguja(0, 0, 400) === 0 && LINEA_DE_LECTURA > 0 && LINEA_DE_LECTURA < 1, 'el avance llega a 1 al final; sin alto, quieta')
afirmar(formaDelHiloPedida('') === 'costado' && formaDelHiloPedida('?hilo=barra') === 'barra' && formaDelHiloPedida('?hilo=x') === 'costado', 'la elegida es el hilo al costado; `?hilo=barra` muestra la otra versión')
const hilo = leer(`${BLOG}/[slug]/HiloDeLectura.tsx`)
const hiloALaVista = (f: string): boolean => /data-forma="costado"/.test(f) && /data-parte="aguja-del-hilo"/.test(f) && /data-parte="marca-del-hilo"/.test(f) && /w-\[3px\]/.test(f)
afirmar(hiloALaVista(hilo), 'el hilo al costado del texto, grueso, con su aguja y una marca por subtítulo')
controlPositivo('la raya fina de arriba del prototipo', hilo.replace('data-parte="aguja-del-hilo"', ''), hiloALaVista)
afirmar(avanceDelBloque(500, 100, 550) === 0.5 && avanceDelBloque(900, 100, 550) === 0 && avanceDelBloque(0, 0, 550) === 1, 'el pintado de la frase avanza con la línea de lectura')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · La 404: el encastre del error del formulario, cuando se puede ver')

const TODO: CondicionesDelArranque = { entrada: true, visible: true, enVista: true }
afirmar(puedeArrancar(TODO), 'con la entrada abierta, la pestaña visible y la tarjeta a la vista, arranca')
for (const falta of ['entrada', 'visible', 'enVista'] as const) afirmar(!puedeArrancar({ ...TODO, [falta]: false }), `sin «${falta}», espera`)
const esperaLaEntrada = (f: (c: CondicionesDelArranque) => boolean): boolean => f(TODO) && !f({ ...TODO, entrada: false })
afirmar(esperaLaEntrada(puedeArrancar), 'espera a que el preloader se vaya')
controlPositivo('arrancar con el preloader encima (lo que hacía el prototipo)', (c: CondicionesDelArranque) => c.visible && c.enVista, esperaLaEntrada)
afirmar(esperaDelIntento(0) === ARRANQUE.esperaMs && esperaDelIntento(3) === ARRANQUE.otraVezMs && ARRANQUE.otraVezMs < ARRANQUE.esperaMs, 'el primero con su respiro; un toque la vuelve a tirar enseguida')
const logo = leer(`${V3}/_no-encontrada/LogoQueNoEncaja.tsx`)
const esElDelFormulario = (f: string): boolean =>
  /<EncajeDelLogo key=\{intento\} resultado="no-encaja"/.test(f) && /data-tarjeta="resultado"/.test(f) && /from '\.\.\/_componentes\/formularios\/EncajeDelLogo'/.test(f) && /onClick=\{\(\) => setIntento/.test(f)
afirmar(esElDelFormulario(logo), 'la pieza, los tiempos y el sonido son los del error del formulario (importado), en su tarjeta, y un toque la repite')
controlPositivo('un encastre propio', logo.replace('<EncajeDelLogo', '<OtroEncaje'), esElDelFormulario)
afirmar(/<LogoQueNoEncaja \/>/.test(leer(`${V3}/not-found.tsx`)) && /notFound\(\)/.test(leer(`${V3}/[...resto]/page.tsx`)), 'la 404 de /v3 lo monta, y cualquier ruta desconocida llega a ella con estado 404')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Cada nota se arma estática')

const pagina = leer(`${BLOG}/[slug]/page.tsx`)
afirmar(/export const dynamicParams = false/.test(pagina) && /export function generateStaticParams/.test(pagina), 'generateStaticParams y dynamicParams = false')

cerrar('m2-blog')
