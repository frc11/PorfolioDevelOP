# L7-INT · resultado — el carril A y el carril B juntos

Rama `l7/a` con el merge de `l7/b` (`aa6be5b0`, lo commiteó Valentino). Dev :3002. Sin commits ni operaciones de git de esta sesión salvo el `git add` de los dos conflictos y un worktree temporal de la base (creado y borrado).

## Lo que chocó

1. **El merge paró en dos archivos — resuelto antes del commit del merge.** `scripts-retoque/fuentes-3d.py` (`TEXTOS_DE_PAGINA`) y `_componentes/titulos3d/presets.ts` (`TITULOS_CON_LETRAS`): A sumó «Integraciones con IA», B sumó «Nosotros», «Portfolio», «Blog». Las dos listas quedaron como la unión, iguales entre sí, sin repetidos. En el script, `INSTANCIAS_DE_PAGINA` quedó con las 3 de B (125-800, 125-300, 125-400): las otras 5 las había borrado L6-4b y sus archivos no existen en ninguna de las dos ramas (L7b-2).
2. **Fuentes 3D: hecho, sin cambios en el árbol.** Bajé el TTF de Archivo de la URL de `subsetear-fuentes.py` a `scripts-titular/_upstream/` (ignorado) y corrí `fuentes-3d.py` sólo con los tres destinos de página. Resultado idéntico a lo que trajo B: los mismos 28 glifos, avances, kerning (53/40/40 pares), cmap y contornos; sólo cambiaban la fecha del WOFF y un salto final. Repuse los bytes commiteados para no meter un diff vacío. Cada título 3D real (los tres servicios, Nosotros, Portfolio, Blog —el índice y cada nota llevan «Blog», L7c-1—, «Prueba de la intro») tiene todas sus letras en las tres instancias, en el JSON del 3D y en el WOFF del DOM: ningún glifo falta. La 404 no tiene título 3D (su `h1` es DOM).
3. **`IdDePagina`: coherente.** A no lo tocó (sus páginas usan `IdDeServicio`); B sumó `nosotros | portfolio | blog | no-encontrada`. Cada id tiene un solo preset; los tres de servicio salen de un `Record` tipado (`_servicios/escena/presets.ts`, el mismo del viaje), así que ninguno puede faltar; las legales no montan preset (L7d-1).
4. **La intro de 1,8 en las páginas de B: está bien, no hubo que tocar nada.** A 1440, en Nosotros, Portfolio, el blog y una nota: la intro mide 1,80 pantallas, el cuerpo toma el centro a las 1,5 pantallas (lo mismo que en las tres de servicio, que A verificó), el `h1` entra entero y no se recorta, y en la tira de cuadros cada media pantalla el título cae a la media y el papel entra a la pantalla y media, igual que en Desarrollo web. «Blog» sale más grande que «Nosotros» porque el tamaño va por el ancho (L6 T1) y no por la intro: no cambió con el 2,5 → 1,8. Privacidad y Términos no tienen intro de la base; la 404 tampoco (es una pantalla `min-h-svh` sin scroll que usa sólo la pista de la cámara en su comienzo): el 1,8 no las alcanza. Tiras en `C:\nocturno\cola3-fotos\L7\<página>\1440-intro-tira.png`.

## Lo que ninguno de los dos carriles vio (y se arregló)

- **INT-1 · El pie decía los nombres viejos de los servicios.** `PAGINAS_DEL_PIE` (B, `_secciones/cierre/contacto.ts`) tenía escritos «Páginas web» e «IA y automatizaciones», y A los había renombrado a «Desarrollo web» e «Integraciones con IA» en todo lo demás: después del merge, el pie de cada página contradecía al `h1` de la página a la que lleva. Ahora los tres servicios salen de `PAGINAS_DE_SERVICIO` (`_chrome/paginas.ts`, la misma lista del desplegable de la navbar: rótulo = `h1`, ruta = `hrefDe`). Un primer intento con `SERVICIOS` + `HREF_DEL_SERVICIO` lo marcó s6-lane (el import pasaba por `_servicios/`, y la regla compara por subcadena): se cambió por la lista del chrome, que las secciones ya importan.
- **INT-2 · El grupo «Páginas» del pie era un `nav` adentro del `main` del home.** s10-acceso (13 landmarks contra 12; un `navigation` anidado en el `main`, lo que SITIO-S12 había cerrado: «saltar al contenido» dejaba de saltear la navegación). Ahora es un grupo con nombre (`role="group"`, `aria-label="Páginas"`), como el otro listado del pie (`destinos-del-cierre`), que tampoco es landmark. `PiezasDeContacto.tsx`.
- **INT-3 · Dos tests que L7d cambió de spec y no corrió.** Estaban escondidos dentro de agregados que ya fallaban en la base (s8 y s10), así que el «mismo rojo de siempre» los tapaba:
  - s10-acceso: 82 → 90 paradas de teclado = las 6 páginas + las 2 legales del pie plano. Nuevo `DELTA_DE_LAS_PAGINAS`, derivado de `PAGINAS_DEL_PIE` y `PAGINAS_LEGALES`, con su control positivo (como el del FAQ).
  - s8-chrome: «los enlaces internos del pie apuntan a un ancla» veía las 8 rutas nuevas como enlaces a la nada. Ahora las anclas se chequean como antes y las rutas aparte: tienen que ser exactamente las páginas y las legales, en orden, y cada una tiene que existir (su `page.tsx` o un slug de `PUBLICADOS`), con control positivo (`/v3/inventada`). No se aflojó: se agregó un chequeo que antes no había.

## El gate sobre el árbol junto

- `tsc --noEmit`: 0 errores (dentro de `verificar`, con los arreglos).
- ESLint: 0 errores en los 42 archivos de `src` que trajo el merge y en los 5 de esta sesión; 2 avisos viejos (imports sin usar en la línea 50 de `s10-acceso.invariant.ts`, iguales en `HEAD`).
- `npm run verificar`: 95 pasos, 11 grupos con falla (s2, s3, s4, s5, s6, s7, s8, s10, s17, s76, s77), **comparados afirmación por afirmación contra la base construida** (`rediseno/home` = la base de L7 + docs: worktree temporal, `npm run build` y los agregados que fallan).
  - **s6, s76 y s77 ya estaban rojos antes de L7.** En `rediseno/home`: s6-tokens y s6-servicios con las mismas fallas (`pt-[7rem]` de `Cierre.tsx`, el `rootMargin` de `TituloQueSePintaAlLlegar.tsx`), s76-portfolio con la misma (la huella del modal de contacto) y s77-ph con la misma y con los MISMOS dos hashes (`f8deb37f755a · 64083f6736c4`). L7 no los rompió. s6-lane pasa en la base y pasa en lo junto.
  - Las demás fallas son las mismas afirmaciones que en la base (los nombres de chunk cambian porque webpack los numera por build). Cambian sólo números: lo que /v3 baja de entrada pasa de 405,6 a 408,4 KiB gzip (+2,8; ya estaba arriba del techo de 300), y lo que /v3 escribe de 921,2 a 927,0 KiB (las páginas nuevas).
  - **Una afirmación nueva, de L7: s7-compuerta «y la diferencia está pesada».** En la base, `/v3` heredaba de `/` un chunk más que las otras rutas de `/v3` (el del preloader, 5,8 KiB crudo); en lo junto el reparto de chunks cambió y las otras rutas de `/v3` heredan lo mismo que `/v3` (1121,7 KiB): la diferencia es 0 y la afirmación pide que sea > 0. No rompe ninguna página; quiere decir que esas rutas bajan ahora ese chunk también. No lo arreglé (es contabilidad de peso adentro de un agregado rojo; no es daño visible del merge): queda para quien toque el peso.
- **Build de producción: pasa, 0 errores, 0 avisos.** Todas las rutas nuevas prerenderizadas (Nosotros, Portfolio, blog y sus seis notas, Privacidad, Términos, los tres servicios) y `[...resto]` dinámica. El de la base también pasa. Nada que clasificar. (El build se hizo antes de INT-1/INT-2; los dos cambios no tocan el peso de forma medible.)

## Humo a 1440 (`scripts-carga/l7-int-humo.ts`, Chrome del sistema contra el dev :3002, con los arreglos)

- Las tres de servicio, Nosotros, Portfolio, el blog y una nota (`cuanto-cuesta-una-pagina-web-en-argentina`): **7 de 7 bien.** Estado 200, un `h1` (el del título 3D), desborde 0, intro → cuerpo → cierre bajando y cierre → cuerpo → intro subiendo, el FAQ abre, el pie está, su grupo «Páginas» con los seis rótulos nuevos, consola limpia.
- 404 (`/v3/no-existe`): bien. Estado 404, su `h1`, «Volver al inicio» a `/v3`, consola limpia.
- Privacidad y Términos: el banco las marca «FALLA» sólo por el orden, y es el banco: su cabecera y su pie miden menos de media pantalla, así que la línea del centro nunca cae en ellos. Estado 200, un `h1`, desborde 0, pie con «Páginas» bien, consola limpia; en las fotos se ven la cabecera arriba y el pie abajo. Bien por foto.
- Fotos: `C:\nocturno\cola3-fotos\L7\<página>\1440-{1-intro,2-cuerpo,3-cierre}.png`.

## Hallazgos que dejo anotados (fuera de INT)

- **La 404 a 1440 roza el logo:** el final del `h1` y de la bajada queda a ~10 px del anillo izquierdo del logo (la caja de texto llega a `50vw − 17rem` + el margen). Es la composición propia de la 404 de L7d, no daño del merge: para L7g, que hace los anchos.
- **s7-compuerta** (arriba): el chunk del preloader ahora lo bajan todas las rutas de `/v3`.
- El banco nuevo sirve para la matriz de L7g: `ANCHOS=1440x900,1024x768,768x1024,390x844`. Para las legales falta un criterio de orden que no dependa de la línea del centro.

## Decisiones tomadas solo

- **INT-a** En el script de fuentes, la «unión» es de títulos, no de instancias: las 3 instancias de B son las que existen.
- **INT-b** Las fuentes regeneradas eran idénticas: se dejaron los bytes commiteados.
- **INT-c** La base de la comparación es un worktree temporal de `rediseno/home` (`C:\nocturno\cola3-base-int`, `node_modules` por junction al de `C:\rediseno-home`, `.env.local` copiado sin leerlo), construido; se borró al terminar (primero el junction, después el `.env.local`, después el worktree). No se usó ninguna carpeta de otro carril.
- **INT-d** Los tests de L7d se actualizaron a su spec (no se aflojaron), como hizo el INT anterior con L3.

## Candado

Tres tomas: 08:27–08:45 (verificar, eslint, s6/s76/s77 en la base, build), 09:05–09:27 (verificar otra vez, eslint, build y agregados de la base; esperó 20 min a que el carril C soltara), 09:28–09:36 (dev :3002 y Chrome). Cada una se soltó al terminar (trap / finally). No hubo que robarlo.

## Archivos de esta sesión

- `src/app/v3/_secciones/cierre/contacto.ts` (INT-1), `src/app/v3/_secciones/cierre/PiezasDeContacto.tsx` (INT-2)
- `src/app/v3/_lib/__tests__/s10-acceso.invariant.ts`, `src/app/v3/_chrome/__tests__/s8-chrome.invariant.ts` (INT-3)
- `scripts-carga/l7-int-humo.ts` (nuevo: el humo de todas las páginas)
- este archivo y una línea en `ESTADO-a.md`

## Qué tiene que mirar Valentino

1. El pie de cualquier página (o el pie plano del home): «Páginas» dice Desarrollo web, Software a medida, Integraciones con IA.
2. `/v3/nosotros` o `/v3/blog` a 1440: la intro de 1,8 (¿alcanza?, igual que en los servicios).
3. `/v3/no-existe` a 1440: el texto casi toca el logo.
