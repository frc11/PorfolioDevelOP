/**
 * LO QUE MIDIÓ OTRO INSTRUMENTO — el contraste del texto sobre la escena.
 *
 * No se vuelve a calcular acá y no se puede: el fondo de una sección
 * transparente es la escena, que es un cuadro dibujado y no un token. Cada
 * cifra la midió el instrumento que la firma y acá se CITA, con la atribución
 * adentro del dato para que no se pueda copiar sin ella.
 *
 * ── B6-A · POR QUÉ ES UN MÓDULO APARTE ───────────────────────────────────────
 *
 * Hasta B6-A esta tabla vivía al pie de `s10-acceso-color.ts`, con dos filas.
 * La cuarta superficie (`oscuro-transparente`, ver `_lib/superficies.ts`) le
 * agregó a ese modelo la derivación «¿deja ver la escena?» leída de la tabla de
 * superficies —antes comparaba contra el literal `papel-transparente`—, y con
 * eso el archivo cruzó las 300 líneas del repo. El corte es por tema: todo lo
 * demás de `s10-acceso-color.ts` CALCULA una razón a partir de tokens; esta
 * tabla es lo único que CITA una razón medida en el navegador.
 *
 * Y es, además, lo que B6-A extiende: las secciones que dejan ver la escena
 * dejan de ser dos. Cada fila nueva entra con el instrumento que la midió
 * (`scripts-b6/`, sobre `Page.captureScreenshot`), nunca con un número escrito
 * a mano. Una sección que se abre sin fila acá es una sección sin medir.
 */
export const CONTRASTE_CONTRA_LA_ESCENA: readonly {
  readonly seccion: string
  /**
   * La tinta que la fila mide, como `token@alfa`, o nada si vale para toda la
   * sección. B6-A: sobre el velo, la tinta primaria se afirma contra el piso
   * de los tokens y las OTRAS se citan por tinta, medidas sobre la escena real.
   */
  readonly tinta?: string
  readonly razon: number
  readonly instrumento: string
}[] = [
  { seccion: 'hero', razon: 9.73, instrumento: 'SITIO-S9 — la tinta sobre la escena en el Hero' },
  { seccion: 'por-que-develop', razon: 6.07, instrumento: 'SITIO-S9 — el diferencial, el peor punto del recorrido' },
  /**
   * ⚠ B6-A — las dos secciones que abrió, medidas con la escena real detrás
   * del velo en gradiente: `scripts-b6/c-las-seis.ts`, etiqueta «final»,
   * 1440×900, cada bloque de texto en cuadro en cada media pantalla de la
   * sección, contraste bajo el glifo con el PEOR píxel
   * (`docs/rediseno/outputs/b6/c-las-seis-final.json`).
   */
  {
    seccion: 'trabajos',
    razon: 5.91,
    instrumento: 'B6-A — c-las-seis final: el peor de los nueve bloques es «[MÉTRICA]» sobre el acento, en tránsito (opacidad 0,87); a tinta plena 7,20. Los ocho restantes, de 8,03 a 10,28',
  },
  {
    seccion: 'cierre',
    razon: 6.44,
    instrumento: 'B6-A — c-las-seis final, y=15300: el peor de los 25 bloques del pie es la ayuda del formulario; el resto, de 6,85 a 18,00',
  },
  {
    seccion: 'cierre',
    tinta: '--color-tinta-tenue@1',
    razon: 6.44,
    instrumento: 'B6-A — c-las-seis final: la ayuda y el placeholder del formulario, en tinta tenue sobre la escena en penumbra detrás del velo denso (2.989 y 807 píxeles de glifo, ninguno bajo AA)',
  },
]
