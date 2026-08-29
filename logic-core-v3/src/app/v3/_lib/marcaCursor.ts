/**
 * LA MARCA DEL CURSOR — cómo se reconoce su chunk en la salida del build.
 *
 * ⚠ ESTE MÓDULO LO IMPORTA UN SOLO ARCHIVO DE LA APLICACIÓN:
 * `_componentes/chrome/CursorPropio.tsx`, que es el módulo perezoso. Si lo
 * importara además cualquier módulo de la carga inicial —`CursorCompuerta`,
 * por ejemplo, que es lo natural y lo equivocado— la marca viajaría con él y
 * `s3-peso.invariant.ts` reportaría, correctamente, que la compuerta gotea.
 *
 * Es el mismo mecanismo que S1 usa para el escenario, y por la misma razón:
 * los nombres de archivo que emite webpack llevan hash y cambian en cada
 * build, así que encadenar la comprobación a uno sería encadenarla a un
 * accidente. La marca viaja adentro del código, se escribe en un atributo del
 * DOM —o sea que se USA en tiempo de ejecución— y por eso ningún minificador
 * la puede plegar ni ningún tree-shaking la puede podar.
 */
export const MARCA_CURSOR = 'v3-cursor-dos-capas-s3'
