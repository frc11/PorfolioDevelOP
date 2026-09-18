/**
 * LeadOS · P42 — Las dos capas FIJAS del bloque que el setter le pega a Claude
 * Design en «Construir».
 *
 * El bloque son tres capas y el setter copia una sola cosa:
 *
 *   1 · INSTRUCCIONES    fijo — lo pone el producto (`PROMPT_BASE`, este archivo)
 *   2 · EL DOCUMENTO     variable — lo produjo el brief (`buildConstruccionBlock`)
 *   3 · PISO DE CALIDAD  fijo — lo pone el producto (`PISO_DE_CALIDAD`, este archivo)
 *
 * Lo arma `armarBloqueConstruccion` (`bloque-construccion.ts`). Este archivo es
 * CONTENIDO, sin lógica: Franco corrige una instrucción editando solo acá.
 *
 * ── De dónde sale el prompt base ─────────────────────────────────────────────
 * Del diseño cerrado de mc1 (`docs/decisiones-oslead-vii/decisiones-por-pantalla.md`,
 * «El prompt base»), con cuatro ajustes y nada más:
 *   1. «de una sola pantalla (one-page)» → «de una sola página (one-page)»: una
 *      herramienta puede leer «una sola pantalla» como «que entre en el alto de la
 *      ventana»;
 *   2. «el documento que va abajo» → «el documento que viene a continuación»;
 *   3. se suma UN párrafo: el documento trae primero las decisiones de la demo que
 *      el setter confirmó en el brief y, si la sección con el texto del Gem dice
 *      otra cosa sobre una de ellas, manda la decisión. Sin esa regla las dos
 *      versiones viajan juntas (el setter puede corregir a mano un campo que el
 *      lector del encabezado llenó) y la herramienta, que no puede preguntar,
 *      elegiría una al azar;
 *   4. las viñetas de la lista de cierre con guion simple;
 *   5. se suma UNA frase: «Construí las secciones que pide el documento, en ese
 *      orden, y ninguna más.» Es uno de los nueve puntos que «Construir» mostraba
 *      («No agregues secciones que el brief no pide») y el texto de Franco no lo
 *      decía explícito. El censo de P42 ató cada uno de los nueve a la línea del
 *      bloque que lo lleva: `bloque-construccion.spec.ts` §1f.
 * La prohibición de preguntar y la lista de cierre son el corazón: la primera
 * destraba al setter sin pedirle criterio de diseñador; la segunda convierte su
 * verificación en una comparación (la lista de secciones que devuelve contra las
 * que pidió).
 *
 * ── De dónde sale el piso ────────────────────────────────────────────────────
 * Del piso anti-slop del paquete del Gem de diseño
 * (`docs/decisiones-oslead-vii/gem-de-diseno-paquete.md` §6), que traduce el
 * módulo «Ojo de diseño» a instrucción de agente, y de los criterios de rechazo
 * que el chequeo final ya aplica (`HARD_CHECKS`/`SOFT_CHECKS` de
 * `flow-content.ts`): jerarquía, aire, tipografía con carácter, tres colores como
 * máximo, el botón que invita y que no se note que salió de un prompt. Reescrito
 * de criterio para una persona («que tenga jerarquía») a instrucción ejecutable
 * («un solo tamaño dominante por sección»), con números donde el criterio los
 * admite, y siempre como PISO: mínimos y máximos, nunca un estilo.
 *
 * Suma una regla propia del sprint: el menú, si hay, funciona y lleva a secciones
 * de la misma página. Un menú muerto es el delator número uno. Y una línea que
 * venía de los nueve puntos de «Construir» («Nombre, rubro y zona reales en el
 * hero y el pie»), en CONTENIDO.
 *
 * ── Dos restricciones de redacción, y por qué ────────────────────────────────
 * Estos textos viven en el ámbito que vigilan `copy-sin-ubicacion` y
 * `copy-sin-jerga`: ninguna frase dice «más abajo» / «de arriba» (se habla del
 * orden del mensaje, no de la pantalla) y ninguna usa un rótulo con forma de
 * código interno (letra más número).
 */

/** Separador entre capas dentro del bloque: una línea en blanco. */
export const SEPARADOR_DE_CAPAS = '\n\n'

/**
 * Los rótulos de las tres capas. Van ADENTRO del texto que se copia: el setter
 * ve qué está mandando, y la herramienta sabe dónde empieza cada parte (el
 * prompt base nombra «el documento» y el «PISO DE CALIDAD»).
 */
export const ROTULOS_DE_CAPAS = {
  promptBase: '═══ 1 de 3 · INSTRUCCIONES ═══',
  documento: '═══ 2 de 3 · EL DOCUMENTO ═══',
  piso: '═══ 3 de 3 · PISO DE CALIDAD ═══',
} as const

export const PROMPT_BASE = `Construí una página web de una sola página (one-page) siguiendo el documento que viene a continuación. El documento es la especificación completa: tiene todo lo que necesitás.

CÓMO TRABAJAR

Construí la página entera de una sola vez, completa y funcionando. No la armes por partes ni me vayas mostrando avances parciales.

Construí las secciones que pide el documento, en ese orden, y ninguna más.

No me hagas preguntas. Quien te está pegando esto no es diseñador ni programador y no va a poder contestarlas. Si algo del documento te queda ambiguo, tomá la decisión más conservadora, seguí adelante y anotala al final.

Todo va en una sola página. El menú lleva a secciones de esta misma página y funciona; nunca lleva a otra página.

No inventes datos. Si el documento no trae un dato, no lo completes: dejalo afuera y anotalo al final. Un precio, un horario o una reseña inventada es lo primero que el dueño detecta.

El documento trae primero las decisiones de la demo que ya se confirmaron (secciones, llamado a la acción, tono, paleta y tipografía) y después el material real del negocio. Si la sección BRIEF COMPLETO DEL GEM DE DISEÑO dice otra cosa sobre una de esas decisiones, manda la decisión.

Al final de este mensaje hay un PISO DE CALIDAD no negociable. Leelo antes de escribir una línea. Si algo del documento lo contradice, gana el piso.

CUANDO TERMINES

Devolveme, en una lista corta:
- Las secciones que construiste, en orden.
- Lo que el documento pedía y no pudiste hacer, con el motivo.
- Los datos que te faltaron.
- Las decisiones que tomaste vos porque el documento no las definía.`

export const PISO_DE_CALIDAD = `No negociable. Aplica siempre, aunque el documento no lo mencione, y si el documento dice otra cosa, gana esto.

IDIOMA
- Todo el texto en español rioplatense, con voseo: «reservá», «escribinos», «vení». Nada de «tú» ni de español neutro: es un negocio argentino y su cliente también.

JERARQUÍA
- En cada sección manda una sola cosa: un único elemento con el tamaño más grande, su título. Nada más de la sección llega a ese tamaño.
- El título de la primera pantalla es el texto más grande de toda la página.
- Tres tamaños de texto bien separados: título, subtítulo y cuerpo. El título mide por lo menos el doble que el cuerpo.
- El botón principal resalta del resto: es lo único que lleva el color de acento, también donde se repite.
- Nunca todo centrado y del mismo tamaño: el cuerpo de texto va alineado a la izquierda.

AIRE
- La misma separación vertical entre todas las secciones: por lo menos 80 px en computadora y 56 px en el celular.
- Márgenes laterales de por lo menos 24 px en el celular. En computadora, el contenido en una columna de 1200 px como máximo, centrada.
- Ningún texto, botón o imagen pegado al borde de la pantalla ni a otro elemento.
- Si algo no entra con ese aire, sacá contenido: no achiques los espacios.

TIPOGRAFÍA
- Dos familias como máximo: una con carácter para los títulos y una neutra y legible para el cuerpo. Si el documento las nombra, usá esas.
- Cargalas de verdad (por ejemplo, desde Google Fonts). Nunca la fuente por defecto del sistema: si una fuente no carga, elegí otra que sí.
- Cuerpo de 16 px como mínimo, con interlineado de 1,5 y renglones de 75 caracteres como máximo.

COLOR
- Tres colores como máximo: un neutro dominante para los fondos, un acento y un apoyo. Si el documento trae la paleta, usá esos colores y ningún otro.
- El acento va solo en el botón principal y en sus repeticiones.
- Contraste alto entre texto y fondo: 4,5 a 1 como mínimo en el cuerpo. Nunca gris claro sobre blanco.

ALINEACIÓN Y CONSISTENCIA
- Todo alineado a una misma grilla, con los mismos márgenes en todas las secciones.
- Todos los botones con el mismo estilo, el mismo radio de esquina y la misma altura.

IMÁGENES
- Primero las fotos reales del negocio, de las direcciones que trae el documento. Nunca fotos de banco, ilustraciones genéricas ni imágenes generadas.
- Si no podés usar las fotos reales, no pongas otras: armá la sección sin foto y anotalo entre los datos que te faltaron.
- Nunca deformes ni estires una imagen: recortala manteniendo la proporción.
- Si el negocio no tiene logo, va el nombre del negocio escrito con la fuente de los títulos. Nunca un logo inventado.

CONTENIDO
- El nombre del negocio va en la primera pantalla y en el pie, con su rubro y su zona.
- Todo el texto habla de este negocio: su nombre, lo que vende, sus precios si están, frases de sus reseñas reales.
- Cero texto de relleno, cero lorem ipsum, cero frases que le servirían igual a cualquier otro negocio del rubro.

BOTÓN PRINCIPAL
- El texto nombra la acción y lo que la persona consigue: «Reservá tu turno», «Pedí tu presupuesto». Si el documento trae el texto del botón, usá ese.
- Nunca «Contactanos», «Más información», «Enviar» ni «Click acá».
- Visible sin bajar, en el celular y en la computadora, y repetido al final de la página.
- Si el documento trae el link de WhatsApp, el botón lo abre. Si no lo trae, no inventes un número: dejá el botón sin link y anotalo entre los datos que te faltaron.

MENÚ
- Si hay menú, cada link lleva a una sección de esta misma página, y esa sección existe. Ninguno lleva a otra página, a un «#» vacío ni a una dirección inventada.
- Tocar un link lleva a su sección; en el celular, además, cierra el menú.
- Sólido: sin efecto vidrio ni desenfoque detrás.
- Un menú que no funciona es lo primero que delata que la página salió de un prompt. Si la página no lo necesita, mejor sin menú.

CELULAR
- Diseñala primero para un celular de 390 px de ancho: nada cortado, nada que se salga de costado, textos legibles sin agrandar.
- El botón principal, alcanzable con el pulgar.

MOVIMIENTO
- Solo animaciones sutiles de entrada, de menos de medio segundo. Nada que maree, parpadee o haga esperar para leer.

PROHIBIDO — lo que delata que salió de un prompt
- Efecto vidrio o desenfoque en la barra de navegación.
- Sombras, degradados y brillos repartidos por toda la página.
- Todo centrado y del mismo tamaño.
- Más de dos fuentes, o la fuente por defecto del sistema.
- Cuatro o más colores fuertes.
- Imágenes pixeladas, deformadas o de banco.
- Muros de texto sin aire ni jerarquía.
- Un menú con links que no llevan a ningún lado.`
