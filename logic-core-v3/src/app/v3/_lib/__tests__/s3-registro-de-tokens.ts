/**
 * EL REGISTRO DE PROPIEDADES DE COMPONENTE.
 *
 * ── Qué problema resuelve ─────────────────────────────────────────────────
 *
 * La regla del sprint es cero color, tamaño, radio, duración o curva fuera de
 * los tokens. Pero la coreografía del CTA tiene ángulos de 6° y traslaciones
 * de −33,75px que **no son tokens del sistema y no pueden serlo**: son la
 * forma de un movimiento medido, no una escala. Y `theme-develop.css` no se
 * toca: un token nuevo ahí es una decisión, no un detalle de implementación.
 *
 * La salida es la que el propio sistema ya usa: esos valores viven en
 * propiedades personalizadas de ALCANCE DE COMPONENTE, declaradas en un solo
 * bloque por pieza, y **en el punto de uso no aparece ni un literal**. Todo lo
 * que una declaración normal escribe es `var()` o `calc()` sobre `var()`.
 *
 * Este archivo es el padrón de esas propiedades. `s3-tokens.invariant.ts`
 * afirma que el conjunto declarado en las hojas es EXACTAMENTE éste, con estos
 * valores. Agregar una propiedad de componente sin registrarla acá falla; y
 * registrarla obliga a escribir de dónde sale.
 *
 * ── Las tres etiquetas ────────────────────────────────────────────────────
 *
 * Son las del proyecto, no unas nuevas. `[medido]` sale de un volcado.
 * `[derivado]` es aritmética sobre valores medidos o sobre tokens del sistema,
 * con la cuenta a la vista. `[decidido]` es nuestro, y por eso lleva razón.
 */

export type Evidencia = 'medido' | 'derivado' | 'decidido'

export interface PropiedadDeComponente {
  readonly nombre: string
  /** El valor literal, tal cual está escrito en la hoja. */
  readonly valor: string
  readonly evidencia: Evidencia
  /** De dónde sale. Una línea, obligatoria. */
  readonly procedencia: string
}

export const REGISTRO: readonly PropiedadDeComponente[] = [
  // ── CTA ────────────────────────────────────────────────────────────────
  { nombre: '--cta-giro-salida', valor: '6deg', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.3 — matrix(0.994522, 0.104528, …) es exactamente sen 6°' },
  { nombre: '--cta-salida-x', valor: '20px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia A, traslación en x' },
  { nombre: '--cta-salida-y', valor: '-33.75px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia A, traslación en y' },
  { nombre: '--cta-giro-entrada', valor: '10deg', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.3 — matrix(0.984808, 0.173648, …) es sen 10°' },
  { nombre: '--cta-entrada-x', valor: '-30px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia B, traslación en x' },
  { nombre: '--cta-entrada-y', valor: '24.75px', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — copia B, traslación en y' },
  { nombre: '--cta-recorte-inicial', valor: 'inset(80% 0 0)', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — clip-path de reposo de la copia B' },
  { nombre: '--cta-recorte-final', valor: 'inset(0)', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2 — clip-path de hover de la copia B' },
  {
    nombre: '--cta-intercambio',
    valor: 'calc(var(--duracion-muy-lenta) + 2 * var(--duracion-rapida))',
    evidencia: 'derivado',
    procedencia: '1,3s medidos = 700 + 2×300, las dos duraciones del sistema. El invariante resuelve la cuenta.',
  },
  {
    nombre: '--cta-subrayado-duracion',
    valor: 'var(--duracion-muy-lenta)',
    evidencia: 'medido',
    procedencia:
      'BOTON-1.md §2.3 — 0,7s por capa en la serie por cuadro de la referencia, con desvío máximo 0,0251 contra la curva declarada. Cae EXACTO sobre --duracion-muy-lenta (700ms), así que no hay cuenta. Antes valía 0,6s por la fila mal atribuida de COMPONENTS.md §3.2, que describía el brillo.',
  },
  {
    nombre: '--cta-subrayado-desfase',
    valor: 'calc(var(--duracion-media) - var(--duracion-rapida))',
    evidencia: 'derivado',
    procedencia:
      'BOTON-1.md §2.3 — 0,1s de desfase entre las dos capas = 400 − 300, las dos duraciones del sistema. NO es un retardo del gesto: es lo único que produce el hueco.',
  },
  {
    nombre: '--cta-ventana-reposo',
    valor: 'calc(var(--text-cuerpo) * var(--leading-texto))',
    evidencia: 'derivado',
    procedencia: 'la caja de línea del rollover: 15px × 1,6. Los 24,5 medidos son de SU familia.',
  },
  {
    nombre: '--cta-ventana-hover',
    valor: 'calc(var(--text-cuerpo) * var(--leading-texto) + var(--spacing-1))',
    evidencia: 'derivado',
    procedencia: 'lo que transfiere es la resta: 28,5 − 24,5 = 4,0px exactos = --spacing-1',
  },
  {
    nombre: '--cta-subrayado-alto',
    valor: 'calc(var(--border-hairline) * 3)',
    evidencia: 'derivado',
    procedencia: '3px medidos = tres filetes de --border-hairline',
  },

  // ── Respiro de la foto ─────────────────────────────────────────────────
  // ── Navegación ─────────────────────────────────────────────────────────
  { nombre: '--nav-reposo', valor: 'var(--spacing-6)', evidencia: 'derivado', procedencia: '24px, igual que el reposo medido de la referencia, y token exacto del sistema' },
  {
    nombre: '--nav-alto',
    valor: 'calc(var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto))',
    evidencia: 'derivado',
    procedencia: 'relleno vertical más caja de línea: 12×2 + 15×1,6 = 48px. La suya mide 56.',
  },
  {
    nombre: '--nav-margen-al-pie',
    valor: 'var(--spacing-6)',
    evidencia: 'decidido',
    procedencia: 'LA SIMETRÍA: se separa del borde inferior lo mismo que después se separa del superior. No está medida.',
  },
  {
    nombre: '--nav-nacimiento',
    valor: 'calc(100svh - var(--nav-margen-al-pie) - var(--nav-alto))',
    evidencia: 'derivado',
    procedencia: 'nuestro equivalente de su top: 816, que es de SU héroe a 1440×900',
  },
  {
    nombre: '--nav-umbral',
    valor: 'calc(var(--nav-nacimiento) - var(--nav-reposo))',
    evidencia: 'derivado',
    procedencia: 'nuestro equivalente de su 792. A 900px de viewport da 804.',
  },
  // [NAVBAR] Retoque · `--nav-retardo-reposo`, `--nav-marcador-escala` y `--nav-marcador-desplazamiento` salieron del
  // registro: el marcador y su retardo ya no están en `navegacion.css` (s3-tokens §4 las daba como registradas que no existen).

  // ── [NAVBAR] La barra propia del home (`barra.css`): la geometría de la pastilla, con nombres propios ──
  { nombre: '--barra-reposo', valor: 'var(--spacing-6)', evidencia: 'derivado', procedencia: 'el mismo de `--nav-reposo`: la barra del home es la pastilla de siempre' },
  { nombre: '--barra-alto', valor: 'calc(var(--spacing-3) * 2 + var(--text-cuerpo) * var(--leading-texto))', evidencia: 'derivado', procedencia: 'el mismo de `--nav-alto` (48 px)' },
  { nombre: '--barra-margen-al-pie', valor: 'var(--spacing-6)', evidencia: 'derivado', procedencia: 'el mismo de `--nav-margen-al-pie`' },
  { nombre: '--barra-nacimiento', valor: 'calc(100svh - var(--barra-margen-al-pie) - var(--barra-alto))', evidencia: 'derivado', procedencia: 'el mismo de `--nav-nacimiento`, con los nombres propios' },
  { nombre: '--barra-umbral', valor: 'calc(var(--barra-nacimiento) - var(--barra-reposo))', evidencia: 'derivado', procedencia: 'el mismo de `--nav-umbral`, con los nombres propios' },
  { nombre: '--barra-resaltado', valor: '8%', evidencia: 'decidido', procedencia: '[NAVBAR] el resaltado del hover de la barra (la variante b, la que quedó): la tinta al 8 %, el mismo de los ítems del menú del teléfono' },
  // ── [NAVBAR] T3 · El vidrio líquido del menú del teléfono (`vidrio.css`) ──
  { nombre: '--halo-sobre-la-escena', valor: '0 0 0.1em var(--color-fondo), 0 0 0.1em var(--color-fondo), 0 0 0.1em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.45em color-mix(in srgb, var(--color-fondo) 80%, transparent), 0 0 0.9em color-mix(in srgb, var(--color-fondo) 50%, transparent)', evidencia: 'medido', procedencia: '[NOCTURNO FINAL] C1 · abajo de 1024, el texto de Trabajos sobre el logo de noche: la mezcla no llega a través del pin (un sticky). [PULIDO 1] P12 · denso (la misma sombra corta apilada, la receta de D2): el fino de C1 dejaba la bajada en 3,2–4,4:1 sobre el logo (medido en pulido-1/p12)' },
  { nombre: '--vidrio-tinte-del-formulario', valor: '66%', evidencia: 'medido', procedencia: '[PULIDO 1] P18 · el tinte del vidrio del formulario del pie (abajo de 1024), un poco más denso que el del menú (56 %): sus rótulos son chicos y con el logo negro detrás quedaban justos en AA (medido en pulido-1/p18)' },
  { nombre: '--vidrio-reflejo-del-formulario', valor: '10%', evidencia: 'medido', procedencia: '[PULIDO 2] 6 · el especular del vidrio oscuro del formulario (el del menú es `--vidrio-reflejo`): aclaraba el fondo del rótulo «CONTACTO», arriba de la caja; con el oscuro forzado sobre la sala de día a 768, de 3,8:1 a 4,98:1 (medido en pulido-2/p6)' },
  { nombre: '--vidrio-tinte-de-la-tablet', valor: '46%', evidencia: 'medido', procedencia: '[PULIDO 3] A2 · el tinte del vidrio claro del formulario en la tablet (768 a 1023; el de siempre es `--vidrio-tinte-del-formulario`, 66 %): con el contacto alto, el piso claro detrás se leía como una tarjeta opaca; los rótulos de día en 16,8–17,3:1 (medido en pulido-2/p6, a2-actual)' },
  { nombre: '--campo-del-vidrio-en-la-tablet', valor: '56%', evidencia: 'medido', procedencia: '[PULIDO 3] A2 · el relleno de los campos del vidrio claro en la tablet (el de siempre, 72 %): el texto escrito 17,4:1 y el de ejemplo 7,4:1 (medido en pulido-2/p6, a2-actual)' },
  { nombre: '--ejemplo-del-campo', valor: 'color-mix(in srgb, currentColor 72%, transparent)', evidencia: 'medido', procedencia: '[PULIDO 1] P18 · el texto de ejemplo de los campos del formulario de vidrio: el de base (la tinta a la mitad por el preflight, y la opacidad del campo encima) caía a ~2:1 (medido en pulido-1/p18)' },
  // [PULIDO 4] C4 · las filas de la tablet del pie (PULIDO 3 · A2), que `s6-tokens` T5 marcaba como arbitrarios sin token.
  { nombre: '--filas-del-cierre', valor: '1fr auto', evidencia: 'decidido', procedencia: '[PULIDO 3] A2 · en la tablet la primera fila del pie toma lo que sobra: el contacto llega hasta las redes' },
  { nombre: '--filas-de-la-navegacion-del-pie', valor: 'auto 1fr', evidencia: 'decidido', procedencia: '[PULIDO 3] A2 · en la tablet la columna del contacto: el rótulo arriba y el formulario estirado' },
  { nombre: '--filas-del-mensaje-del-pie', valor: 'auto 1fr auto', evidencia: 'decidido', procedencia: '[PULIDO 3] A2 · en la tablet el campo del mensaje: el rótulo, el área que crece y su pie' },
  { nombre: '--campo-del-vidrio', valor: 'color-mix(in srgb, var(--color-fondo) 72%, transparent)', evidencia: 'medido', procedencia: '[PULIDO 1] P18 · el relleno de los campos del formulario de vidrio del pie (abajo de 1024): con el logo negro detrás el vidrio queda gris medio; con el relleno y el ejemplo al 78 %, los campos quedan en AA (medido en pulido-1/p18)' },
  { nombre: '--velo-sobre-la-escena', valor: 'color-mix(in srgb, var(--color-fondo) 76%, transparent)', evidencia: 'medido', procedencia: '[PULIDO 1] P12 · el velo del color de la noche detrás de la bajada de Trabajos, abajo de 1024: con 76 % la bajada sobre el logo da lo mismo que sobre la noche (mediana 10–12:1; con 62 %, 9–11; medido en pulido-1/p12)' },
  { nombre: '--degrade-del-velo', valor: 'radial-gradient(closest-side, var(--velo-sobre-la-escena) 55%, transparent)', evidencia: 'medido', procedencia: '[PULIDO 2] 3 · el velo elíptico: entero hasta el 55 % de su radio y desvanecido hasta el borde de su caja (sin bordes rectos ni sombra de caja)' },
  { nombre: '--alcance-del-velo', valor: '-90% -45%', evidencia: 'medido', procedencia: '[PULIDO 2] 3 · la caja del velo elíptico detrás del texto de Trabajos (abajo de 1024): 1,9 veces el ancho del texto y 2,8 veces su alto, así el degradé radial se desvanece muy por fuera del bloque (sin bordes rectos; la bajada sigue en AA, medido en pulido-2/p3)' },
  { nombre: '--alcance-del-velo-de-noche', valor: '-60% -20%', evidencia: 'medido', procedencia: '[PULIDO 11] A4 · J9 b · la caja del velo de noche detrás de los textos de Quiénes somos (abajo de 1024): 2,2 veces el alto del bloque y 1,4 su ancho (los bloques son anchos y bajos), así el degradé se desvanece por fuera del texto' },
  { nombre: '--velo-de-noche', valor: 'color-mix(in srgb, var(--color-tinta) calc(var(--noche-de-la-sala, 0) * 92%), transparent)', evidencia: 'medido', procedencia: '[PULIDO 11] A4 · J9 b · la tinta del velo de Quiénes somos crece con la noche que se ve (la escribe la sección): de día no hay velo; de noche oscurece el logo detrás del texto que mezcla. Con 92 %: Valentino 5,65:1, Nosotros 5,51, Franco 5,19 (sin velo, 4,04 y 3,52; con 80 %, 4,91 y 4,82): entregas/pulido-11/velo-de-noche.json' },
  { nombre: '--degrade-del-velo-de-noche', valor: 'radial-gradient(closest-side, var(--velo-de-noche) 55%, transparent)', evidencia: 'medido', procedencia: '[PULIDO 11] A4 · J9 b · el mismo degradé del velo de Portfolio (`--degrade-del-velo`), con la tinta de la noche' },
  { nombre: '--vidrio-tinte', valor: '56%', evidencia: 'decidido', procedencia: 'el tinte que sostiene el contraste del texto contra cualquier fondo (con el velo del menú): AA sobre el negro (claro, 5,5:1) y el blanco (oscuro, 5,8:1); medido en navbar/t3-menu' },
  { nombre: '--vidrio-tinte-plano', valor: '64%', evidencia: 'decidido', procedencia: 'el respaldo sin `backdrop-filter`: el papel con el 36 % de tinta (o al revés), opaco, el tono que el vidrio suele dar sobre su zona ([NAVBAR] retoque 1: ya no hay copia plana en el Genie)' },
  { nombre: '--vidrio-desenfoque', valor: 'var(--blur-panel)', evidencia: 'decidido', procedencia: '12 px, el del panel del sistema: con 24 la curva del canto no tiene qué curvar (la sala ya llega desenfocada); con 6 el titular del hero se lee detrás de los ítems' },
  { nombre: '--vidrio-saturacion', valor: '1.8', evidencia: 'decidido', procedencia: 'la saturación del fondo del vidrio de iOS (180 %), la misma del glassmorphism de CLAUDE.md' },
  { nombre: '--vidrio-brillo', valor: '70%', evidencia: 'decidido', procedencia: 'la línea de luz del borde de arriba (el especular)' },
  { nombre: '--vidrio-filo', valor: '40%', evidencia: 'decidido', procedencia: 'el filo de luz de un filete alrededor' },
  { nombre: '--vidrio-reflejo', valor: '28%', evidencia: 'decidido', procedencia: 'la luz que baja desde arriba, detrás del texto' },
  { nombre: '--vidrio-reflejo-hasta', valor: '24%', evidencia: 'decidido', procedencia: 'hasta dónde baja: el primer cuarto, arriba de los ítems' },
  // ── [NOCTURNO FINAL] D2 · El halo del papel del final (`banda.css`) ──
  { nombre: '--halo-del-final', valor: '0 0 0.1em var(--color-fondo), 0 0 0.1em var(--color-fondo), 0 0 0.1em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.45em color-mix(in srgb, var(--color-fondo) 80%, transparent), 0 0 0.9em color-mix(in srgb, var(--color-fondo) 50%, transparent)', evidencia: 'medido', procedencia: '[NOCTURNO FINAL] D2 · el halo denso del papel: abajo de 1024, la tinta de la lista de «Por qué develOP» con la pared ya iluminada y el piso todavía no (la misma sombra corta apilada; una sola larga se diluía, medido en d2/)' },
  { nombre: '--halo-del-pie', valor: '0 0 0.1em var(--color-fondo), 0 0 0.1em var(--color-fondo), 0 0 0.1em var(--color-fondo), 0 0 0.15em var(--color-fondo), 0 0 0.15em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.2em var(--color-fondo), 0 0 0.45em color-mix(in srgb, var(--color-fondo) 80%, transparent), 0 0 0.9em color-mix(in srgb, var(--color-fondo) 50%, transparent)', evidencia: 'medido', procedencia: '[PULIDO 2] 1 · el halo denso del papel para la tinta del pie mientras el final corre detrás (abajo de 1024): la mezcla daba gris sobre los grises de la cinemática (los enlaces hasta 1,1:1, medido en pulido-2/p1/contraste)' },
  { nombre: '--halo-del-amanecer', valor: '0 0 0.1em var(--color-tinta), 0 0 0.1em var(--color-tinta), 0 0 0.1em var(--color-tinta), 0 0 0.2em var(--color-tinta), 0 0 0.2em var(--color-tinta), 0 0 0.2em var(--color-tinta), 0 0 0.45em color-mix(in srgb, var(--color-tinta) 80%, transparent), 0 0 0.9em color-mix(in srgb, var(--color-tinta) 50%, transparent)', evidencia: 'medido', procedencia: '[NOCTURNO FINAL] D2 · el halo denso de la tinta: abajo de 1024, el papel de la lista de «Por qué develOP» mientras la pared sigue oscura, sin la mezcla (que daba gris sobre los grises del amanecer)' },
  // ── [NOCTURNO FINAL] C5 · La franja de cerrar del menú del teléfono (`vidrio.css`) ──
  { nombre: '--franja-tinte', valor: '78%', evidencia: 'decidido', procedencia: 'el tinte de la franja, más denso que el del vidrio (56 %): sostiene el gris de «Click para cerrar» en AA sobre cualquier fondo (sobre el negro, el vidrio claro solo deja ~4:1 al gris)' },
  { nombre: '--franja-ancho', valor: '10%', evidencia: 'decidido', procedencia: 'la mitad del ancho de la banda del brillo, sobre el recorrido del degradado' },
  { nombre: '--franja-recorrido', valor: '300%', evidencia: 'decidido', procedencia: 'el degradado mide tres franjas: la banda entra por la izquierda y sale por la derecha' },
  { nombre: '--vidrio-radio', valor: 'calc(var(--radius-fuerte) * 3)', evidencia: 'decidido', procedencia: '30 px: el radio grande de los paneles de iOS a pantalla casi completa' },

  // ── Cursor ─────────────────────────────────────────────────────────────
  { nombre: '--cursor-nucleo-lado', valor: 'var(--spacing-1)', evidencia: 'medido', procedencia: 'COMPONENTS.md §4.1 — núcleo de 4×4, que es --spacing-1 exacto' },
  {
    nombre: '--cursor-halo-lado',
    valor: 'calc(var(--spacing-8) + var(--spacing-1))',
    evidencia: 'medido',
    procedencia: 'COMPONENTS.md §4.1 — halo de 36×36 = 32 + 4',
  },
  {
    nombre: '--cursor-halo-desenfoque',
    valor: 'calc(var(--blur-panel) / 3)',
    evidencia: 'medido',
    procedencia: 'COMPONENTS.md §4.1 — blur(4px), que es un tercio de la única escala de desenfoque del sistema',
  },

  // ── SPRINT DEMOS · el estante de la biblioteca (`demos.css`) ───────────
  { nombre: '--demos-bajada', valor: 'calc(var(--duracion-media) - var(--duracion-rapida))', evidencia: 'derivado', procedencia: 'la bajada casi instantánea del pedido (≤ 120 ms): 400 − 300 = 100 ms, el mismo desfase del subrayado del CTA' },
  { nombre: '--demos-resorte', valor: 'linear(0, 0.264 10%, 0.594 20%, 0.801 30%, 0.908 40%, 0.96 50%, 0.983 60%, 0.993 70%, 0.997 80%, 1)', evidencia: 'derivado', procedencia: 'resorte crítico sin rebote: x(t) = 1 − (1 + 10t)·e^(−10t), muestreado cada 10 %' },
  { nombre: '--libro-ancho', valor: 'calc(var(--spacing-8) * 5)', evidencia: 'decidido', procedencia: 'seis piezas de 160 px con su solape entran en la columna derecha a 1440' },
  { nombre: '--libro-giro', valor: '30deg', evidencia: 'decidido', procedencia: 'el ángulo de un libro en el estante: la cara se lee y la vecina la tapa en parte' },
  { nombre: '--libro-alza', valor: 'var(--spacing-6)', evidencia: 'decidido', procedencia: 'cuánto sube la pieza levantada: un paso de 24 px del espaciado' },
  { nombre: '--libro-apertura', valor: 'var(--spacing-4)', evidencia: 'decidido', procedencia: 'cuánto se abren las vecinas para darle aire: un paso de 16 px' },

  // ── MÓVIL-TRABAJOS · el carrusel de abajo de 1024 (`demos.css`) ───────
  { nombre: '--carrusel-margen-del-recorte', valor: '6px', evidencia: 'derivado', procedencia: '[INTERFAZ 1] T3 · el anillo de foco de dos tonos (desplazamiento + dos grosores: el contorno y su borde de papel); `overflow-clip-margin` no acepta calc()' },
  { nombre: '--cinta-margen-del-recorte', valor: '6px', evidencia: 'derivado', procedencia: '[INTERFAZ 1] T3 · el mismo margen que el carrusel: el anillo de dos tonos entero, en px porque no acepta calc()' },

  { nombre: '--cursor-velo-oscuro', valor: 'color-mix(in srgb, var(--color-fondo) 18%, transparent)', evidencia: 'decidido', procedencia: '[INTERFAZ 1] T2 · el halo del cursor sobre lo oscuro: el papel apenas, el par del gris claro del halo (nk: 0,1 de alfa)' },

  // ── INTERFAZ 1 · T2 · el rollover de dos copias (`rollover.css`): lo medido en el CTA (ROLLOVER_MEDIDO) ÷ sus 15 px ──
  { nombre: '--rollover-giro-salida', valor: '6deg', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.3: matrix(0.994522, 0.104528…) = sin 6°, la copia A al salir' },
  { nombre: '--rollover-salida-x', valor: '1.3333em', evidencia: 'derivado', procedencia: 'los +20 px medidos de la salida ÷ los 15 px del CTA: el mismo gesto a cualquier tamaño' },
  { nombre: '--rollover-salida-y', valor: '-2.25em', evidencia: 'derivado', procedencia: 'los −33,75 px medidos de la salida ÷ los 15 px del CTA' },
  { nombre: '--rollover-giro-entrada', valor: '10deg', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.3: matrix(0.984808, 0.173648…) = sin 10°, la copia B al entrar' },
  { nombre: '--rollover-entrada-x', valor: '-2em', evidencia: 'derivado', procedencia: 'los −30 px medidos de la entrada ÷ los 15 px del CTA' },
  { nombre: '--rollover-entrada-y', valor: '1.65em', evidencia: 'derivado', procedencia: 'los +24,75 px medidos de la entrada ÷ los 15 px del CTA' },
  { nombre: '--rollover-recorte-inicial', valor: 'inset(80% 0 0)', evidencia: 'medido', procedencia: 'COMPONENTS.md §3.2: el clip-path de la copia B en reposo' },
  { nombre: '--rollover-intercambio', valor: 'calc(var(--duracion-muy-lenta) + 2 * var(--duracion-rapida))', evidencia: 'derivado', procedencia: 'los 1,3 s medidos del intercambio, compuestos con los tokens como en `cta.css`' },
  // [PASADA FINAL] A1 · el titular del hero sin parpadeo 2D.
  { nombre: '--respaldo-2d', valor: '2500ms', evidencia: 'decidido', procedencia: 'el plazo en que el 3D del titular tiene que llegar antes de que aparezca el 2D; el mismo RESPALDO_2D_MS de `titular2d.ts` (s47 los ata)' },
  // [AJUSTES FINALES] A4 · el velo de carga.
  { nombre: '--velo-fundido', valor: '800ms', evidencia: 'decidido', procedencia: 'el fundido con que todo aparece junto (~0,8 s, pedido); el mismo CARGA.fundidoMs de `_lib/carga.ts` (s48 los ata)' },
  { nombre: '--velo-espera', valor: '4000ms', evidencia: 'decidido', procedencia: 'el plazo desde el arranque en que el fundido arranca igual aunque no esté todo (~4 s, pedido); el mismo CARGA.plazoMs de `_lib/carga.ts` (s48 los ata)' },
]

/** Índice por nombre, para que el invariante compare sin recorrer. */
export const REGISTRO_POR_NOMBRE = new Map(REGISTRO.map((p) => [p.nombre, p]))
