/**
 * [B7] LA SALA TAPADA — lo que cubre la pantalla ENTERA avisa acá, y la escena duerme detrás.
 *
 * El login que se despliega como una demo (`_chrome/ingreso/`) termina en un fondo negro de pantalla completa: mientras está
 * desplegado no se ve un píxel de la sala, y dibujarla es gastar la placa por nada. Cuando termina de cubrir, anota que la tapa;
 * cuando empieza a irse, la suelta. La atadura al scroll (`ataduraAlScroll.ts`) lo lee en la misma lectura de cada cuadro: con la
 * sala tapada la da por FUERA DE CUADRO (`frameloop` en `'never'`, nada desmontado), y al soltarla pasa por `reanudando` como
 * siempre (la pose exacta del progreso, sin latigazo: `visibilidad.ts`).
 *
 * Varios dueños (un conjunto, no un booleano): mañana la prueba del panel (C1) se despliega igual y no se pisan.
 * Sin React ni three: los dueños y sus oyentes. La escena duerme recién después de su primer cuadro (lo decide la atadura: la
 * carga de la página espera ese cuadro y no puede quedar esperándolo detrás del negro).
 */

const tapan = new Set<string>()
const oyentes = new Set<() => void>()

/** `quien` tapa (o deja de tapar) la sala entera. Sólo se avisa cuando cambia si está tapada. */
export function taparLaEscena(quien: string, tapada: boolean): void {
  const antes = tapan.size > 0
  if (tapada) tapan.add(quien)
  else tapan.delete(quien)
  if (antes !== tapan.size > 0) oyentes.forEach((f) => f())
}

/** ¿Algo cubre la pantalla entera? */
export const escenaTapada = (): boolean => tapan.size > 0

export function suscribirALaTapa(f: () => void): () => void {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
