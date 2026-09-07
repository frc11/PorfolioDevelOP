/**
 * LA MARCA DEL SCROLL SUAVE — cómo se reconoce su chunk en la salida del build.
 *
 * ⚠ ESTE MÓDULO LO IMPORTA UN SOLO ARCHIVO DE LA APLICACIÓN:
 * `_componentes/ScrollSuaveDeV3.tsx`, que es el módulo perezoso. Si lo
 * importara además cualquier módulo de la carga inicial —`CompuertaDelScrollSuave`,
 * por ejemplo, que es lo natural y lo equivocado— la marca viajaría con él y la
 * comprobación de peso reportaría, correctamente, que la compuerta gotea.
 *
 * Mismo mecanismo que `marcaEscena.ts` y `marcaCursor.ts`, y por la misma
 * razón: los nombres que emite webpack llevan hash y cambian en cada build. La
 * marca viaja adentro del código, se USA en tiempo de ejecución —se escribe
 * como atributo en el `<html>`— y por eso ningún minificador la puede plegar ni
 * ningún tree-shaking la puede podar.
 *
 * ⚠️ **LO QUE ESTA MARCA NO PUEDE AFIRMAR, Y HAY QUE DECIRLO.** Que este chunk
 * no viaje abajo de 1025 **no significa que Lenis no viaje**. La librería entra
 * en la carga inicial de toda ruta por el layout RAÍZ, que importa
 * `SmoothScroll` de forma estática — está medido y publicado como hallazgo de
 * peso con dueño ajeno en `s10-mobile-peso.ts`. Lo que la compuerta de /v3
 * decide es si se CONSTRUYE una instancia, no si los bytes bajan.
 */
export const MARCA_SCROLL_SUAVE = 'v3-scroll-suave-b5'
