/**
 * s7 · POR QUÉ develOP — la frase, los seis valores y el CTA del final. **[FINAL]**
 *
 * Reescrito entero con la sección: la vieja (titular, bajada, cuatro diferenciales y un
 * testimonio) se fue con sus cinco entradas de INVENTOS. Lo que se afirma acá es lo que el
 * sprint pidió: el contenido textual, una sola librería de íconos con un solo trazo, las
 * dos ramas anunciando lo mismo, la rama quieta sin una transformada, el punto azul que ya
 * no se monta y el reparto de las piezas sobre los mismos tiempos que la cámara.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { POSES_DEL_FINAL, TIEMPOS_DEL_FINAL, progresoDelPin } from '../../_lib/escena/finalDelRecorrido'
import { seccionDe } from '../_contrato/forma'
import { LISTA_DE_INVENTOS } from '../_contrato/inventado'
import { escanearLoReal, marcadoresRealesEn, textoVisible } from '../_contrato/escaneo'
import { marcar } from '../_invariantes/render'
import { codigoDeLaSeccion, leer } from '../_invariantes/soporte'
import { PorQueDevelop } from './PorQueDevelop'
import { CTA, FRASE, NOMBRE_DE_SECCION, PEDIDO, VALORES } from './contenido'
import {
  VENTANA_DEL_CTA,
  VENTANA_DEL_DESTACADO,
  VENTANA_DE_LA_FRASE,
  VENTANA_DE_LA_LEVANTADA,
  huecoDelLogo,
  ventanaDelValor,
} from './geometria'
import { ICONOS, PiezaDeValor } from './Valores'

const ID = 'por-que-develop'
const montada = <PorQueDevelop seccion={seccionDe(ID)} />
const [quieto, movido] = [false, true].map((anima) => marcar(montada, { anima }))
// El código de la sección sin este archivo y sin comentarios: la prosa nombra lo que se sacó.
const FUENTE = codigoDeLaSeccion(ID)
  .filter((a) => !a.includes('invariant'))
  .map((a) => quitarComentarios(leer(a)))
  .join('\n')
const anunciado = (html: string): string => textoVisible(html.replace(/<[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg>/g, ' ')).replace(/\s+/g, ' ').trim()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El copy, textual, y ni una cifra')

afirmarIgual([FRASE.izquierda, FRASE.derecha], ['Seis razones', 'para elegirnos'], 'la frase es la propuesta: «Seis razones» · «para elegirnos»')
afirmarIgual(
  VALORES.map((v) => `${v.titulo} — ${v.linea}`),
  [
    'Hecho a medida — Sin plantillas: cada sitio se diseña para tu negocio.',
    'Diseño que se destaca — Tu sitio no se parece al de tu competencia.',
    'Rápido, sin atajos — Entregamos rápido sin recortar calidad.',
    'Calidad que se nota — Carga rápido, se ve bien en cualquier pantalla y está bien construido por dentro.',
    'Tu panel, tu control — Ves cómo va tu proyecto y pedís cambios sin esperar un mail.',
    'Hablás con quien lo hace — Sin intermediarios: te atienden las personas que construyen tu sitio.',
  ],
  'los seis valores, en orden y con su línea',
)
afirmarIgual([CTA.frase, CTA.destacado, CTA.rotulo, CTA.destino], ['Este sitio empezó con una charla.', 'El tuyo también.', 'Hablanos', '#contacto'], 'el CTA: la frase, el destacado y «Hablanos» a #contacto')
afirmarIgual(escanearLoReal(textoVisible(quieto)), [], 'el texto de la sección no tiene una sola cifra')
afirmarIgual(marcadoresRealesEn(textoVisible(quieto)), [], '  ni un marcador: no queda nada pedido')
afirmarIgual(PEDIDO.length, 0, '  y la tabla del pedido está vacía')
afirmar(!/INVENTOS|conLlave/.test(FUENTE), 'la sección no consume INVENTOS', `quedan ${String(LISTA_DE_INVENTOS.length)} en la lista, todas de Números`)
controlPositivo('  el detector vería un consumo de INVENTOS', 'conLlave(INVENTOS.diferencialClientes)', (f: string) => !/INVENTOS|conLlave/.test(f))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los íconos: una librería, un trazo, decoración')

const pieza = renderToStaticMarkup(<PiezaDeValor valor={VALORES[0]} />)
afirmar(/<svg[^>]*aria-hidden="true"/.test(pieza) && /stroke-width="1.5"/.test(pieza), 'cada ícono es un svg `aria-hidden` de trazo 1,5')
afirmarIgual(Object.keys(ICONOS).length, VALORES.length, '  uno por valor')
const librerias = [...FUENTE.matchAll(/from '(lucide-react|@phosphor-icons\/[^']+|react-icons[^']*)'/g)].map((m) => m[1])
afirmarIgual([...new Set(librerias)], ['lucide-react'], '  de UNA librería, la que el repo ya usaba')
const trazos = [...FUENTE.matchAll(/strokeWidth=\{([\d.]+)\}/g)].map((m) => m[1])
afirmarIgual([...new Set(trazos)], ['1.5'], '  con UN solo trazo')
controlPositivo('  el detector de librerías vería dos mezcladas', "from 'lucide-react'\nfrom '@phosphor-icons/react'", (f: string) => [...new Set([...f.matchAll(/from '(lucide-react|@phosphor-icons\/[^']+)'/g)].map((m) => m[1]))].length === 1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Las dos ramas anuncian lo mismo, y la quieta no mueve nada')

afirmarIgual(anunciado(movido), anunciado(quieto), 'el escenario y la lista anuncian el mismo texto, en el mismo orden')
afirmar(anunciado(quieto).startsWith(NOMBRE_DE_SECCION), '  y arranca por el `h2` «Por qué develOP», para el lector y para el menú', anunciado(quieto).slice(0, 60))
afirmarIgual((quieto.match(/<h2\b/g) ?? []).length, 1, '  un solo `h2` por rama')
afirmarIgual([...quieto.matchAll(/style="[^"]*transform:[^"]*"/g)].length, 0, 'la rama quieta no escribe una sola transformada')
afirmar([...movido.matchAll(/style="[^"]*transform:[^"]*"/g)].length > 0, '  (control: la del escenario sí, así que el detector no está ciego)')
afirmar(!/MarcaDeSeccion|CabeceraDeSeccion/.test(FUENTE) && !/data-pieza="marca-de-seccion"/.test(quieto + movido), 'sin el punto azul: la sección ya no monta la marca (la pieza compartida no se borró)')
afirmar(/href="#contacto"/.test(quieto) && /data-pieza="cta"/.test(quieto), 'el botón es el CTA del sitio, a #contacto')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las piezas, sobre los mismos tiempos que la cámara')

const adentro = [VENTANA_DE_LA_FRASE, ...VALORES.map((_, i) => ventanaDelValor(i)), VENTANA_DE_LA_LEVANTADA, VENTANA_DEL_CTA, VENTANA_DEL_DESTACADO]
afirmar(adentro.every((v) => v.desde >= 0 && v.hasta <= 1 && v.hasta > v.desde), 'todas las ventanas caen adentro del pin')
afirmar(VENTANA_DE_LA_FRASE.hasta <= progresoDelPin(TIEMPOS_DEL_FINAL.frase.hasta), 'la frase termina de llegar con la cámara quieta en A')
afirmar(
  VALORES.every((_, i) => ventanaDelValor(i).desde >= progresoDelPin(TIEMPOS_DEL_FINAL.frase.hasta)) &&
    VALORES.every((_, i) => ventanaDelValor(i).hasta <= progresoDelPin(TIEMPOS_DEL_FINAL.valores.hasta)),
  '  los valores entran mientras la cámara baja a B y están puestos cuando llega',
)
afirmar(ventanaDelValor(1).desde > ventanaDelValor(0).desde && ventanaDelValor(3).desde === ventanaDelValor(0).desde, '  de a pares —izquierda y derecha juntas—, escalonados de arriba abajo')
afirmar(
  VENTANA_DE_LA_LEVANTADA.desde === progresoDelPin(TIEMPOS_DEL_FINAL.valores.hasta) && VENTANA_DEL_DESTACADO.hasta <= progresoDelPin(TIEMPOS_DEL_FINAL.cta.llega),
  '  la frase y los valores se levantan cuando la cámara empieza a subir, y el CTA queda armado cuando termina',
)
const huecoA = huecoDelLogo(POSES_DEL_FINAL.frase.distance)
const huecoB = huecoDelLogo(POSES_DEL_FINAL.valores.distance)
afirmar(huecoB > huecoA && huecoA > 25, `el hueco que el logo deja sale de la pose: ${huecoA.toFixed(1)} svh en A y ${huecoB.toFixed(1)} svh en B, más cerca`)
afirmarIgual((FUENTE.match(/className="@container[" ]/g) ?? []).length, 2, '  cada columna de valores es un contenedor: en una angosta (159 px a 1024×768) el aire se achica y la columna no se desborda')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · [FINAL 2] De día: tinta oscura heredada, y abajo de 1024 la mezcla de la casa')

// Ninguna pieza fija su color: hereda la tinta de la sección (oscura y plena) o, bajo la mezcla, la del papel.
const sinColorPropio = (html: string): boolean => !/text-tinta(-media|-tenue)?\b/.test(html)
afirmar(sinColorPropio(pieza), 'la pieza de valor no fija color: ni el ícono ni la línea (la línea en tinta media no pasaba AA sobre las sombras de la celosía)')
controlPositivo('  el chequeo vería una línea en tinta media', '<p class="text-tinta-media">Sin plantillas</p>', sinColorPropio)
const mezclados = (html: string): number => (html.match(/max-escritorio:mix-blend-difference/g) ?? []).length
afirmar(mezclados(quieto) >= 9, `la lista (la rama de abajo de 1024) mezcla ${String(mezclados(quieto))} piezas: la frase, los seis valores, el CTA y su botón`)
afirmar(/data-pieza="cta"[^>]*data-mezcla/.test(quieto) || /data-mezcla[^>]*data-pieza="cta"/.test(quieto), '  y el botón pide la tinta del papel (`data-mezcla`), como el del hero')
afirmarIgual(mezclados(movido), 0, 'el escenario (desde 1024) no mezcla: ahí el texto va al costado del logo, sobre la sala clara')
controlPositivo('  el conteo vería una lista sin mezcla', '<div class="flex">Seis razones</div>', (html: string) => mezclados(html) >= 9)

cerrar('s7-por-que-develop.invariant')
