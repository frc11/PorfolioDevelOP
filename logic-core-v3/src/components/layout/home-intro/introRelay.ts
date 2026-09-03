/**
 * EL RELEVO 2D→3D, COMO REGLA PURA — quién dibuja el logo en cada instante.
 *
 * Módulo puro a propósito: sin React, sin `motion`, sin DOM. Corre en node, y
 * por eso la regla se puede comprobar **sin navegador y sin canvas**, que es
 * exactamente lo que faltaba — ver abajo.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * 🔴 POR QUÉ ESTE ARCHIVO EXISTE: EL LOGO DESAPARECÍA, Y ÉSTA ERA LA CAUSA
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Hasta V3-A la regla vivía adentro de `useIntroChannels.ts` y era ésta:
 *
 *     meshOpacity = latch ? swap : 0
 *     svgOpacity  = 1 − meshOpacity
 *
 * con `latch` respondido **una sola vez**, en el primer cuadro del cruce, a la
 * pregunta *«¿existe el mesh?»*. Y esa pregunta no es la que importa.
 *
 * **La medición.** `swap` vale 1 desde `swapEndS` = 3,076 s hasta el final, así
 * que con el latch en `true` el SVG queda en **0,0000 exacto durante 4,274 s —
 * el 58,1% de la secuencia, y el acomodamiento entero**. En toda esa ventana lo
 * único que puede dibujar el logo es el mesh. Si el mesh no pinta —contexto de
 * WebGL perdido, el root de r3f sin configurar, el árbol del canvas tirando— no
 * queda **nadie**: el logo se apaga justo cuando termina la transformación de
 * color y ya no vuelve, porque el latch es de una sola vía y sólo se resetea
 * yendo hacia atrás. El fallback que el docblock de `IntroLogo3D.tsx` promete
 * —*«si no llegó, el SVG hace la transformación entera»*— cubre *«el chunk no
 * bajó»* y **no cubre** *«el chunk bajó y el canvas no dibuja»*.
 *
 * ── LA REGLA NUEVA, en una línea ───────────────────────────────────────────
 *
 * **El mesh dibuja mientras esté PINTANDO; si deja de pintar, vuelve el SVG.**
 * La pregunta pasa de *«¿existe?»* a *«¿se está viendo?»*, y la respuesta deja
 * de ser definitiva. `mesh + svg === 1` en todo instante, y **`svg === 1` en
 * todo instante en que el mesh no pinta** — o sea que no existe una lectura de
 * esta función en la que el logo no lo dibuje nadie. Eso es lo que se comprueba
 * en `introRelay.invariant.ts`, con su control positivo: la regla vieja, con la
 * misma entrada, deja las dos capas en cero y el control la pone en rojo.
 *
 * ── Lo que NO cambia, y por qué el latch sigue existiendo ──────────────────
 *
 * El latch protege el borde de SUBIDA y esa razón sigue en pie: si el chunk
 * termina de bajar a mitad del cruce, el mesh **no aparece de golpe**. Lo que se
 * agrega es el borde de BAJADA. Los dos juntos dicen: *«el mesh entra sólo si
 * ya estaba pintando cuando el cruce arrancó, y se va apenas deja de pintar»*.
 *
 * ── Lo que esta regla NO puede saber, y queda declarado ────────────────────
 *
 * `painted` es lo que el canvas reporta (`IntroLogoCanvas.tsx`: el primer cuadro
 * de `useFrame`, `webglcontextlost`/`restored`, el desmontaje y el escudo). Que
 * el `useFrame` corra prueba que el root está configurado, que el tamaño es real
 * y que el lazo vive — no prueba que los píxeles lleguen a la pantalla. Para eso
 * está el escucha de contexto perdido, que es el único modo de falla silencioso
 * que el navegador sí avisa.
 *
 *     npx tsx src/components/layout/home-intro/introRelay.invariant.ts
 */

export type IntroRelay = {
  /** Cuánto del logo dibuja el mesh 3D. */
  readonly mesh: number
  /** Cuánto lo dibuja el SVG. **`mesh + svg` es 1 siempre.** */
  readonly svg: number
  /** El latch que queda después de esta lectura. `null` = todavía no se preguntó. */
  readonly latch: boolean | null
}

/**
 * Quién dibuja el logo, dado el cruce, el latch anterior y si el mesh pinta.
 *
 * Función pura de sus tres argumentos: **el latch entra y sale**, no se guarda
 * acá. Es lo que permite que la comprobación estática la corra sobre una
 * secuencia entera de cuadros —incluida una en la que el mesh se cae a mitad del
 * vuelo— sin montar React.
 */
export function sampleRelay(
  swap: number,
  latch: boolean | null,
  painted: boolean
): IntroRelay {
  // Antes del cruce el mesh no se dibuja y la pregunta se rearma. Es lo que le
  // permite al controlador repetir el momento yendo hacia atrás con el scrub.
  if (swap <= 0) return { mesh: 0, svg: 1, latch: null }

  // El borde de SUBIDA: se pregunta UNA vez, en el primer cuadro del cruce.
  const decided = latch === null ? painted : latch

  // Y el borde de BAJADA, que es lo que V3-A agregó: el mesh sólo dibuja
  // mientras sigue pintando. Sin esta conjunción, el logo se queda sin nadie.
  const mesh = decided && painted ? swap : 0
  return { mesh, svg: 1 - mesh, latch: decided }
}
