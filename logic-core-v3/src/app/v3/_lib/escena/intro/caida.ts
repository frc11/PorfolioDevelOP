/**
 * [NOCTURNO FINAL] B1 · LA CAÍDA DEL LOGO AL CARGAR — el logo baja desde arriba y llega a su lugar justo cuando termina de
 * armarse el titular del hero («TU NEGOCIO VENDIENDO LAS 24 HS»): los dos con el mismo reloj, desde que se abre la carga
 * (`cargaLista`) y durante lo mismo que tarda el titular en armarse (`LLEGADA_DEL_TITULAR_S` de `Hero.tsx`; la escena no
 * importa las secciones: s52 afirma que los dos números son el mismo). Primero espera arriba, fuera del cuadro; después cae
 * con gravedad (cada vez más rápido) y al llegar hace la SÚPER ONDA en el piso (el golpe: `final/enElPiso.ts`), la misma
 * que sale cuando el logo termina de encastrarse en el final. Sólo si la página carga arriba (el hero a la vista) y con
 * movimiento: con movimiento reducido, ni caída ni onda (no se monta).
 */
export const CAIDA_DEL_LOGO = {
  /** Lo que dura (s): lo mismo que el titular del hero en armarse. */
  duracionS: 2.4,
  /** Hasta qué fracción espera arriba (fuera del cuadro) y desde qué altura cae (u sobre su lugar). */
  espera: 0.4,
  alto: 14,
  /** La página cargó «arriba» si su scroll es menos que esta fracción de la ventana: si no, el logo ya está en su lugar. */
  arriba: 0.5,
} as const

/** La altura del logo sobre su lugar (u) a la fracción `u` (0 a 1) del armado del titular: arriba, y después cae con gravedad. */
export function alturaDeLaCaida(u: number): number {
  const { espera, alto } = CAIDA_DEL_LOGO
  if (u <= espera) return alto
  if (u >= 1) return 0
  const c = (u - espera) / (1 - espera)
  return alto * (1 - c * c)
}
