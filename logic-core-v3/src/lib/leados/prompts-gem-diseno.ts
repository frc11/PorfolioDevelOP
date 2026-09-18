/**
 * LeadOS · P40 — Los cuatro mensajes que el setter le pasa al Gem de diseño, uno
 * por vuelta.
 *
 * Los textos salen del paquete del Gem de diseño que redactó Franco
 * (`docs/decisiones-oslead-vii/gem-de-diseno-paquete.md`, §4), con tres ajustes y
 * nada más:
 *   1. el encabezado de la vuelta 3 quedó con las etiquetas EXACTAS del contrato
 *      que lee el producto (`encabezado-documento.ts`);
 *   2. la vuelta 4 pide que el documento definitivo empiece con ese mismo
 *      encabezado — sin eso, el documento que viaja a la construcción no lo trae;
 *   3. «la línea de abajo» pasó a «la línea que va debajo del título»: una frase
 *      que ata el texto a una posición no puede vivir en el código del setter
 *      (`copy-sin-ubicacion.invariant.ts`), y acá además no hablaba de la pantalla.
 * Siguen siendo hipótesis redactadas, no procedimiento validado: se ajustan
 * cuando Franco corra el flujo.
 *
 * «El setter pega de vuelta la fase aprobada»: el mensaje de cada vuelta TRAE lo
 * que el setter pegó en la anterior, con su corrección. Para pegarla tuvo que
 * leerla, y si corrigió algo, la corrección viaja sola.
 *
 * ORTOGONAL a `copy-blocks.ts` (arma los bloques con los datos del lead) y a
 * `prompts-disenio.ts` (los prompts de refinamiento de la construcción).
 */
import type { ValoresVueltas, VueltaId } from '@/lib/leados/brief-vueltas'

const PROMPT_LECTURA = `FASE 1 — LECTURA ESTÉTICA

Te paso el material visual de un negocio y su ficha de observación.

Quiero que me digas cómo se ve ESTE negocio hoy, no cómo debería verse.
Miralo como si fueras un cliente que lo encuentra por primera vez.

Devolveme, en no más de 15 líneas:

  MUNDO VISUAL      Qué colores usa de verdad (nombralos, y el hex si lo
                    podés estimar del logo o las fotos). Qué tipo de
                    imágenes tiene. Qué sensación transmite hoy.

  NIVEL             ¿Se ve prolijo o improvisado? ¿Cuidado o descuidado?
                    ¿Formal o de barrio? Sé específico, no diplomático.

  ENERGÍA           ¿Cómo se siente el negocio? Tranquilo, activo,
                    familiar, técnico, premium, popular.

  CÓMO HABLA        Tuteo o usted. Formal o cercano. Con emojis o sin.
                    Largo o cortito. Citá una frase real de ejemplo.

  QUÉ LE QUEDA BIEN Una dirección estética concreta para la demo, que
                    salga de lo anterior y no de una plantilla de rubro.

  QUÉ NO            Qué dirección estética sería un error para ESTE
                    negocio, y por qué.

Regla: si tu lectura le serviría igual a cualquier otro negocio del mismo
rubro, no la mandes — volvé a mirar el material y buscá lo que lo hace
distinto.

Si el material no alcanza para leer la estética, decilo con el formato
FALTA y no inventes.

Terminá y esperá. No pases a la fase 2.`

const PROMPT_DECISIONES = (lecturaAprobada: string) => `FASE 2 — DECISIONES DE LA DEMO

Esta es la lectura estética, ya revisada por mí:

${lecturaAprobada}

Con eso más la ficha y la evaluación, decidí la demo. Devolveme:

  ÁNGULO WOW        Qué le mostramos para que piense "esto es exactamente
                    lo que necesito". Una o dos oraciones. Tiene que salir
                    de un dolor concreto de la ficha o de las reseñas, no
                    de una idea general del rubro.

  SECCIONES         Una por línea, en el orden en que van. Entre cuatro y
                    seis. Cada una con una línea de qué va adentro.

  CTA               El texto exacto del botón principal. Fricción de
                    Prestigio: "Reservá tu lugar", "Pedí tu turno",
                    "Solicitá tu presupuesto". Nunca "Contactanos" ni
                    "Más información".
                    Y decime a dónde lleva (WhatsApp, teléfono, el link real).

  TONO              Cómo escribe la demo, en una línea, coherente con
                    cómo habla el negocio.

  PALETA            Un neutro dominante, un acento, y a lo sumo un apoyo.
                    Con los hex. El acento se reserva para el botón.
                    Que salgan de los colores reales del negocio.

  TIPOGRAFÍA        Una para títulos, con carácter, nombre concreto de
                    Google Fonts. Una para cuerpo, legible y neutra.
                    Y una línea de por qué esas y no otras, atada a la
                    lectura de la fase 1.

Antes de mandar, chequeate: ¿esto menciona el negocio real y sus dolores
concretos, o serviría para cualquiera del rubro? Si es lo segundo, no
está listo.

Terminá y esperá. No pases a la fase 3.`

const PROMPT_ESPECIFICACION = (decisionesAprobadas: string) => `FASE 3 — DOCUMENTO DE CONSTRUCCIÓN

Estas son las decisiones, ya revisadas por mí:

${decisionesAprobadas}

Armá el documento que le voy a pegar a Claude Design como primer y único
mensaje. Tiene que alcanzar para que construya la demo entera sin
preguntarme nada.

Empezá con este encabezado exacto, en este orden, una etiqueta por línea y
con estas etiquetas:

ANGULO: [una línea]
SECCIONES: [separadas por · en orden]
CTA: [texto exacto del botón]
TONO: [una línea]
PALETA: [neutro / acento / apoyo, con hex]
TIPOGRAFIA: [títulos / cuerpo]

Y después, en texto libre y todo lo detallado que haga falta:

  EL NEGOCIO        Nombre, rubro, zona, a quién le vende, qué lo hace
                    distinto. Con los datos REALES de la ficha.

  CONTACTO REAL     El link exacto al que lleva el botón. Si es WhatsApp,
                    el wa.me completo con el número real y el mensaje
                    pre-cargado. Si no tenés el número, va como FALTA.
                    Nunca un placeholder, nunca un número de ejemplo.

  LO PRIMERO QUE SE VE   Qué entra en la primera pantalla de un celular,
                    sin scrollear: qué dice el título, qué dice la línea
                    que va debajo del título, y que el botón esté ahí. Es
                    la decisión más importante de la página: si eso no
                    convence, no hay scroll.

  SECCIÓN POR SECCIÓN   Para cada una: qué muestra, qué texto va (escribilo
                    vos, no describas que "va un texto"), qué imagen va y
                    de dónde sale, y qué tiene que sentir el visitante.
                    Los textos que escribas usan los datos reales: nombres,
                    precios si los hay, frases de las reseñas.

  DIRECCIÓN VISUAL  Cómo se aplica la paleta y la tipografía. Dónde va el
                    acento y dónde no. Cuánto aire entre secciones.
                    Qué manda en cada sección.

  LO QUE NO VA      Lo que Claude Design pondría por default y en este
                    negocio sería un error. Sé concreto: si el default
                    sería una foto de stock genérica del rubro, decilo y
                    decí qué va en su lugar.

  LO QUE SE DEJA AFUERA A PROPÓSITO
                    Qué NO lleva esta demo y por qué. Es una demo, no el
                    sitio final: dejar cosas afuera es una decisión, no un
                    olvido. Sirve para que después nadie las "arregle".

Regla sobre las imágenes: no describas imágenes genéricas. Si el negocio
tiene fotos reales, indicá cuál va en cada lugar. Si no las tiene, decilo
con el formato FALTA en vez de proponer stock.

Largo: apuntá a entre 800 y 1.200 palabras. Más corto no alcanza para que
construya sin preguntar; mucho más largo hace que se pierdan instrucciones
en el medio.

Esto es un BORRADOR. El documento definitivo sale de la fase 4.

Terminá y esperá. No pases a la fase 4.`

const PROMPT_HUECOS = (correccionesAlBorrador: string | null) => `FASE 4 — CAZA DE HUECOS
${
  correccionesAlBorrador
    ? `
Antes de empezar, incorporá estas correcciones mías al borrador:

${correccionesAlBorrador}
`
    : ''
}
Leé el documento que acabás de escribir como si fueras Claude Design y
tuvieras que construir con eso y nada más.

Buscá todo lo que quedó sin definir y que vas a tener que resolver por
tu cuenta. Para cada hueco:

  HUECO       Qué no está dicho.
  DEFAULT     Qué harías vos si nadie te lo aclara.
  RIESGO      Por qué ese default sería un problema para ESTE negocio.
  ARREGLO     La línea exacta que hay que agregar al documento.

Buscá especialmente en: qué pasa cuando no hay una foto para un lugar;
qué dice el pie de página; qué pasa al tocar el menú; qué información va
en el hero además del título; qué pasa si un texto queda muy largo en
celular; qué hace un botón secundario si lo hubiera; y sobre todo, si el
link del botón principal es real y completo o quedó a medias.

Sé duro. Un hueco que no encontrás acá lo va a llenar Claude Design con
lo primero que se le ocurra, y eso es exactamente lo que hace que una
demo se note salida de un prompt.

Al final, devolveme el DOCUMENTO DEFINITIVO completo, con los arreglos ya
incorporados, empezando con el mismo encabezado de seis líneas (ANGULO,
SECCIONES, CTA, TONO, PALETA, TIPOGRAFIA), cada etiqueta en su línea y en
ese orden. Ese es el único que se usa — el borrador de la fase 3 se
descarta.`

/** Lo que el setter pegó de una vuelta, con su corrección si la hay. */
function aprobada(respuesta: string, correccion: string, queFalta: string): string {
  const texto = respuesta.trim()
  if (!texto) return `[${queFalta}]`
  const corregido = correccion.trim()
  return corregido ? `${texto}\n\nMis correcciones:\n${corregido}` : texto
}

/**
 * El mensaje de una vuelta, listo para copiar. La vuelta 1 lleva además el
 * bloque de la ficha y la evaluación (lo que el Gem tiene que leer); las otras
 * traen lo que el setter pegó en la vuelta anterior. Si esa vuelta todavía no
 * se pegó, el lugar queda marcado entre corchetes en vez de mandarse vacío.
 */
export function mensajeDeVuelta(
  vuelta: VueltaId,
  valores: ValoresVueltas,
  bloqueFicha: string | null,
): string {
  switch (vuelta) {
    case 'lectura':
      return bloqueFicha ? `${PROMPT_LECTURA}\n\n${bloqueFicha}` : PROMPT_LECTURA
    case 'decisiones':
      return PROMPT_DECISIONES(
        aprobada(
          valores.lecturaRespuesta,
          valores.lecturaCorreccion,
          'Todavía no pegaste la lectura de la vuelta 1 en el panel',
        ),
      )
    case 'especificacion':
      return PROMPT_ESPECIFICACION(
        aprobada(
          valores.decisionesRespuesta,
          valores.decisionesCorreccion,
          'Todavía no pegaste las decisiones de la vuelta 2 en el panel',
        ),
      )
    case 'huecos':
      return PROMPT_HUECOS(valores.especificacionCorreccion.trim() || null)
  }
}
