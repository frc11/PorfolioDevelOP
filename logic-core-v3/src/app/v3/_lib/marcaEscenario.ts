/**
 * LA MARCA DEL ESCENARIO — cómo se reconoce su chunk en la salida del build.
 *
 * ⚠ ESTE MÓDULO LO IMPORTA UN SOLO ARCHIVO DE LA APLICACIÓN:
 * `_componentes/EscenarioDePrueba.tsx`, que es el módulo perezoso.
 * Si lo importa además cualquier módulo que esté en la carga inicial de `/v3`,
 * la marca viaja con él y `bundle.invariant.ts` reporta —correctamente— que la
 * compuerta gotea. No es un detalle de estilo: es la condición que hace que la
 * comprobación signifique algo.
 *
 * ── Por qué una cadena y no el nombre del chunk ────────────────────────────
 *
 * Los nombres de archivo que emite webpack llevan hash y cambian en cada
 * build; encadenar la comprobación a uno sería encadenarla a un accidente.
 * La marca, en cambio, viaja adentro del código: se escribe en un atributo del
 * DOM, o sea que se USA en tiempo de ejecución, y por eso ningún minificador
 * la puede plegar ni ningún tree-shaking la puede podar. Buscarla adentro de
 * los archivos del conjunto inicial responde la pregunta directamente —¿el
 * código del escenario está o no está acá?— sin pasar por cómo se llamó el
 * archivo.
 */
export const MARCA_ESCENARIO = 'v3-escenario-marcador-de-posicion-s1'
