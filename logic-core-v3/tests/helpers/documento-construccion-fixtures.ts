/**
 * P40 — Textos de ejemplo de las cuatro vueltas con el Gem de diseño.
 *
 * Un negocio inventado (Barbería El Faro) escrito con el largo y la forma que el
 * contrato le pide al Gem: la vuelta 1 en quince líneas, la 2 con las seis
 * decisiones, y el documento de la vuelta 4 empezando por el encabezado de seis
 * etiquetas. Lo usan las pruebas del lector del encabezado, la suite del setter
 * (se pegan en la pantalla) y la medición de peso del brief.
 *
 * Son DATOS de prueba: no los lee ninguna pantalla del producto.
 */

export const VUELTA_LECTURA = `FASE 1 — LECTURA ESTÉTICA · Barbería El Faro

MUNDO VISUAL      Negro mate y madera clara; el logo es un faro blanco sobre negro (#111111 / #F4EFE6). Fotos de cortes reales, con la luz cálida del local.
NIVEL             Prolijo pero casero: buenas fotos de cortes y flyers de Canva con tres tipografías distintas.
ENERGÍA           De barrio y cercana, con oficio: "acá te conocen por el nombre".
CÓMO HABLA        Tutea, frases cortas, algún emoji de tijera. Frase real: "Martes y miércoles 2x1 padre e hijo ✂️".
QUÉ LE QUEDA BIEN Oficio de barrio con aire náutico: fondos oscuros, madera y letra de cartel pintado.
QUÉ NO            Lo "premium" de spa (blanco, dorado, minimalismo frío): lo aleja de su cliente de siempre.

Terminé la fase 1. Espero tu revisión.`

export const VUELTA_DECISIONES = `FASE 2 — DECISIONES DE LA DEMO

ÁNGULO WOW   Turno sin esperar en la vereda: las reseñas se quejan de "venir y encontrarlo lleno".
SECCIONES
  1. Hero — "Tu corte, sin esperar en la vereda" + botón de turno
  2. Cortes y precios — los seis servicios con su precio real
  3. El local — fotos reales del sillón y la vidriera
  4. Lo que dicen los clientes — tres reseñas reales de Google
  5. Cómo llegar — dirección, horario y WhatsApp
CTA          "Reservá tu turno" → https://wa.me/5493815550000
TONO         Cercano y de barrio, tuteo, frases cortas, sin emojis de más.
PALETA       Neutro #F4EFE6 (arena) · acento #C2410C (naranja faro, solo en el botón) · apoyo #111111 (negro mate)
TIPOGRAFÍA   Títulos: Bebas Neue · cuerpo: Inter. Bebas remite al cartel pintado de la vidriera; Inter se lee bien en el celular.

Terminé la fase 2. Espero tu revisión.`

/** El cuerpo del documento, sin encabezado: lo que sigue a las seis etiquetas. */
export const CUERPO_DOCUMENTO = `EL NEGOCIO
Barbería El Faro es una barbería de barrio en Yerba Buena, Tucumán, abierta desde 2016 por Marcos Díaz. Le corta el pelo a hombres de 25 a 60 años del barrio y a sus hijos: el 2x1 de padre e hijo de martes y miércoles es su promo más conocida. Lo que la hace distinta es el oficio y el trato: los clientes vuelven porque Marcos se acuerda de cómo les gusta el corte. El problema que se repite en las reseñas es otro: "venís y está lleno, esperás media hora en la vereda".

CONTACTO REAL
El botón principal lleva a WhatsApp: https://wa.me/5493815550000?text=Hola%20Marcos%2C%20quiero%20reservar%20un%20turno
El número es el que figura en el Instagram del negocio. No hay formulario ni sistema de reservas: el turno se confirma por WhatsApp.

LO PRIMERO QUE SE VE
En la primera pantalla de un celular, sin scrollear:
- Título: "Tu corte, sin esperar en la vereda."
- La línea que va debajo del título: "Reservá por WhatsApp y te esperamos con el sillón libre."
- El botón "Reservá tu turno", grande, en naranja faro.
- De fondo, la foto real de la vidriera con el faro pintado, oscurecida para que el texto se lea.

SECCIÓN POR SECCIÓN

1. Hero
Muestra la vidriera real y el título. Texto: "Tu corte, sin esperar en la vereda." / "Reservá por WhatsApp y te esperamos con el sillón libre." Imagen: la foto de la vidriera del perfil de Instagram (publicación del 12 de marzo). Tiene que sentir: "esta es mi barbería, pero más fácil".

2. Cortes y precios
Muestra los seis servicios con su precio real, en dos columnas en escritorio y una en celular.
- Corte clásico — $9.000
- Corte y barba — $12.500
- Barba — $5.000
- Corte infantil — $7.000
- Padre e hijo (martes y miércoles) — $14.000
- Diseño con navaja — $3.000 extra
Texto de apertura: "Precios claros, sin sorpresas." Tiene que sentir que no hay letra chica.

3. El local
Muestra tres fotos reales: el sillón de cuero, la pared de madera con el faro y Marcos cortando. Texto: "Desde 2016 en la misma esquina de Yerba Buena. El mismo sillón, el mismo oficio." Tiene que sentir confianza de barrio.

4. Lo que dicen los clientes
Tres reseñas reales de Google, textuales, con nombre y estrellas:
- "Marcos es un crack, te deja el corte como te gusta sin que se lo expliques dos veces." — Julián R. ★★★★★
- "El mejor degradé de Yerba Buena. Lo único: reservá antes porque se llena." — Santiago M. ★★★★★
- "Llevo a mi hijo desde los 4 años, ya es parte de la familia." — Pablo G. ★★★★★
Tiene que sentir que otros como él ya confían.

5. Cómo llegar
Dirección, horario y el botón de WhatsApp repetido. Texto: "Av. Aconquija 1450, Yerba Buena. Martes a sábados de 10 a 20 h." Mapa: el link de Google Maps del negocio. Botón final: "Reservá tu turno".

DIRECCIÓN VISUAL
Fondo arena (#F4EFE6) en toda la página, con el hero y el pie en negro mate (#111111). El naranja faro (#C2410C) va solamente en los botones de reservar: en ningún título, ningún ícono, ningún borde. Títulos en Bebas Neue, grandes y en mayúsculas, como el cartel pintado de la vidriera. Todo el cuerpo en Inter, 16 px en celular, con buen interlineado. Mucho aire entre secciones. En cada sección manda una sola cosa: en precios, la lista; en el local, las fotos.

LO QUE NO VA
- Fotos de stock de barberías con tatuajes y barbas enormes: no es su cliente. Van las fotos reales del perfil.
- Barra de navegación con efecto vidrio: la barra es sólida, negra.
- Un logo inventado: el negocio tiene logo (el faro blanco) y se usa ese.
- "Contactanos" o "Más información": el botón dice "Reservá tu turno".

LO QUE SE DEJA AFUERA A PROPÓSITO
- No hay sistema de turnos online: el turno se confirma por WhatsApp, como hoy.
- No hay galería de treinta cortes: tres fotos del local alcanzan para la demo.
- No hay tienda: Marcos vende pomadas en el local, pero no es lo que la demo tiene que mostrar.`

/** Los valores del encabezado de ejemplo, uno por etiqueta del contrato. */
export const VALORES_ENCABEZADO = {
  ANGULO: 'Turno sin esperar en la vereda: la agenda del día a la vista y el botón para reservar por WhatsApp.',
  SECCIONES: ['Hero', 'Cortes y precios', 'El local', 'Lo que dicen los clientes', 'Cómo llegar'],
  CTA: 'Reservá tu turno',
  TONO: 'Cercano y de barrio, tuteo, frases cortas y directas, sin emojis de más.',
  PALETA: 'neutro #F4EFE6 (arena) / acento #C2410C (naranja faro, solo en el botón) / apoyo #111111 (negro mate)',
  TIPOGRAFIA: 'títulos Bebas Neue / cuerpo Inter',
} as const

/** El encabezado exacto del contrato, con los valores de ejemplo. */
export const ENCABEZADO_EXACTO = [
  `ANGULO: ${VALORES_ENCABEZADO.ANGULO}`,
  `SECCIONES: ${VALORES_ENCABEZADO.SECCIONES.join(' · ')}`,
  `CTA: ${VALORES_ENCABEZADO.CTA}`,
  `TONO: ${VALORES_ENCABEZADO.TONO}`,
  `PALETA: ${VALORES_ENCABEZADO.PALETA}`,
  `TIPOGRAFIA: ${VALORES_ENCABEZADO.TIPOGRAFIA}`,
].join('\n')

/** Vuelta 4 completa: el documento definitivo, con el encabezado del contrato. */
export const DOCUMENTO_COMPLETO = `${ENCABEZADO_EXACTO}\n\n${CUERPO_DOCUMENTO}`

/** El borrador de la vuelta 3: mismo encabezado, cuerpo sin la caza de huecos. */
export const VUELTA_ESPECIFICACION = `${ENCABEZADO_EXACTO}\n\n${CUERPO_DOCUMENTO.split('LO QUE NO VA')[0]!.trim()}\n\nEsto es un BORRADOR. Terminé la fase 3. Espero tu revisión.`

/** Un documento que no trae encabezado: arranca directo en el cuerpo (como los briefs viejos). */
export const DOCUMENTO_SIN_ENCABEZADO = CUERPO_DOCUMENTO

/** Un documento al que le falta una obligatoria (PALETA). */
export const DOCUMENTO_SIN_PALETA = DOCUMENTO_COMPLETO.replace(/^PALETA: .*\n/m, '')

/**
 * Lo que devuelve la vuelta 4 si el setter pega la respuesta ENTERA: la caza de
 * huecos primero y el documento definitivo después. El encabezado no está en la
 * primera línea.
 */
export const DOCUMENTO_CON_HUECOS_ANTES = `HUECO    Qué dice el pie de página.
DEFAULT  Un pie con redes sociales genéricas.
RIESGO   El negocio solo tiene Instagram: aparecerían íconos de redes que no existen.
ARREGLO  "Pie: nombre del negocio, dirección y el link real del Instagram."

DOCUMENTO DEFINITIVO

${DOCUMENTO_COMPLETO}`
