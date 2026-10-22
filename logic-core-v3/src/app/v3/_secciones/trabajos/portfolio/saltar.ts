/**
 * [B1] EL SALTO A UN PASO DEL SELECTOR — el teclado, el clic, el hover, la rueda y el ancla al cargar (plan §5.8; [B1.2c] §13, punto 5).
 *
 * La página va al centro del paso y el estado la sigue (los bordes que cruza en el camino no disparan nada: `usePortfolio` mira
 * el destino mientras el salto vuela). Con Lenis, `lenis.scrollTo` con una duración; sin Lenis (abajo de 1025), el viaje sin Lenis.
 * [B1.2c] Con duración 0, INMEDIATO: el proyecto activo manda y el scroll se acomoda en silencio a su tramo (el hover, el clic, el
 * tap y las teclas; y todo con movimiento reducido). La rueda sí viaja (`duracionDelSalto`). Nunca `router.push`: es la misma página.
 *
 * [B4] El salto salió a la pieza común de los gatillos (`_componentes/gatillos/salto.ts`), el mismo para el Portfolio y Servicios; acá
 * se re-exporta para que el Portfolio lo siga leyendo de su carpeta. La marca del viaje (`CLAVE_DEL_VUELO`) la mira `vueloPisado`.
 */

export { CLAVE_DEL_VUELO, SALTO, curvaDelSalto, duracionDelSalto, saltarA } from '../../../_componentes/gatillos/salto'
