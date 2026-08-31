/**
 * LA MARCA DE LA ESCENA REAL — cómo se reconoce su chunk en la salida del build.
 *
 * ⚠ ESTE MÓDULO LO IMPORTA UN SOLO ARCHIVO DE LA APLICACIÓN:
 * `_lib/escena/EscenaDelHome.tsx`, que es el módulo perezoso que la compuerta
 * pide con `import()`. Si lo importara además cualquier módulo de la carga
 * inicial de `/v3` —`EscenarioCompuerta`, por ejemplo, que es lo natural y lo
 * equivocado— la marca viajaría con él y el instrumento reportaría,
 * correctamente, que la compuerta gotea.
 *
 * Es el tercer módulo de marca del árbol, y los tres tienen la misma forma por
 * la misma razón: `marcaEscenario.ts` (el marcador de posición de S1),
 * `marcaCursor.ts` (S3) y éste. Los nombres de archivo que emite webpack llevan
 * hash y cambian en cada build, así que encadenar una comprobación a uno sería
 * encadenarla a un accidente. La marca viaja adentro del código, se escribe en
 * un atributo del DOM —o sea que se USA en tiempo de ejecución— y por eso
 * ningún minificador la puede plegar ni ningún tree-shaking la puede podar.
 *
 * ── Por qué es una marca NUEVA y no la de S1 ───────────────────────────────
 *
 * Porque las dos tienen que poder buscarse por separado en el MISMO build.
 * `MARCA_ESCENARIO` sigue viva en `_componentes/EscenarioDePrueba.tsx`, que es
 * lo que `/v3/control-estatico` importa de forma estática: ése es el control
 * positivo del MECANISMO de la compuerta —demuestra que el buscador sabe
 * encontrar un módulo cuando está en la carga inicial— y sigue valiendo aunque
 * el marcador de posición ya no sea lo que la compuerta monta. Reusar la misma
 * cadena para las dos cosas dejaría un chequeo que no puede distinguir cuál de
 * los dos módulos encontró.
 */
export const MARCA_ESCENA = 'v3-escena-3d-del-home-s8'
