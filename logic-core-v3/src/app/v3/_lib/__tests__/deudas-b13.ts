/**
 * LAS DEUDAS DECLARADAS DE B13 — las que el bloque abre a propósito, con su
 * número, su medición y la línea que las revoca.
 *
 * B13 le cambia el material al logo (emite en la noche) y aleja dos poses. Las
 * dos cosas cierran deudas viejas; lo que abren se declara acá, con la regla del
 * repo: la afirmación que falla corre con su condición intacta como
 * `deudaDeclarada()` y cuenta aparte.
 *
 * ⚠️ **Una deuda que no se puede deshacer no es una deuda: es un daño.** Cada
 * entrada dice exactamente qué línea la revoca y qué se pierde al revocarla.
 *
 * Las cifras completas: `docs/rediseno/outputs/B13-EMITE.md`.
 */

import type { DeudaDeclarada } from './deudas-b8'

export const DEUDAS_DE_B13 = {
  cruceDeLaVuelta: {
    numero: 'D-B13.1',
    que:
      'La VUELTA — el logo cruza el valor de la sala y se pierde por un instante. Entre p=0,5833 y p=0,625 (la pantalla en que Trabajos se va y Servicios, papel OPACO, entra desde el pie) la sala sube de 20 a 122 de gris mientras la emisión baja de 0,16 a 0, y los dos valores se cruzan: el contraste logo/sala cae a **1,08:1 en p≈0,599** (2,42 en 0,589 · 1,67 en 0,594 · 1,48 en 0,604 · 2,33 en 0,609 · 3,31 en 0,614). Queda por debajo de 2:1 durante ~0,014 de progreso, o sea **~0,34 pantallas de scroll**. ⚠️ Es TOPOLÓGICO y no de calibración: para pasar de oscuro-sobre-claro a claro-sobre-oscuro el valor del logo tiene que cruzar el de la sala, y en el cruce el contraste es 1 por definición. Lo único que se elige es DÓNDE cae y CUÁNTO dura, y hoy cae detrás del panel opaco que entra',
    cierre:
      '⚠️ **LA SOLUCIÓN YA EXISTE EN EL REPO Y ES DE OTRO LANE: `INK_FLIP_FRAC` en `introTimeline.ts` (S8d/S8e).** El preloader tiene EXACTAMENTE este problema —«el fondo va de oscuro a claro y el logo de blanco a negro, así que por el teorema del valor intermedio son iguales en algún instante; es inevitable con dos recorridos continuos de luminancia y lo único que se puede elegir es cuánto dura»— y lo resolvió sin tocar el recorrido del fondo: **la tinta no usa la ventana entera, invierte en una franja central con la misma curva**. El fondo se transforma despacio, que es lo que se ve, y la tinta lo cruza rápido por el medio; el cruce pasó a durar 0,038 s por debajo de 1,25:1, contra un tope declarado de 0,100 s que `introSampling.invariant.ts` mide en segundos por interpolación. Acá la traducción es directa: la emisión usa hoy la banda ENTERA de la noche (de `NIVEL_DE_LA_NOCHE` a `RIM_NIGHT_LEVEL`, la misma de `brilloDeLaNocheEn`, para que el logo y el polvo se enciendan juntos), y la franja central sería una banda más angosta adentro de ésa. El precio, y por eso no se aplicó sin decisión: el logo dejaría de encenderse con las motas, y el tope hay que medirlo en PANTALLAS DE SCROLL y no en segundos —lección de B2: el visitante no controla el tiempo, controla el scroll—. **Lo juzga el humano**',
  },
  haloQueNoIlumina: {
    numero: 'D-B13.2',
    que:
      'El logo BRILLA pero no ILUMINA, y la referencia sí. Medido en nk.studio a 1920 (`outputs/b13/referencia-emision-nk-1920.json`): la luminancia media de la sala en la corona de 1–5 px alrededor de su objeto es **×2,4 a ×23,8** la del fondo lejano, y baja monótona con la distancia en las cuatro coronas (1–5 / 6–15 / 16–40 / 41–100 px). O sea que su objeto le AGREGA luz al entorno. El `emissive` de three es radiancia de salida del fragmento: no entra en `RE_Direct` ni en el hemisférico, así que el piso, la pared y las motas alrededor del logo valen exactamente lo mismo con el logo emitiendo que sin él — verificado en la captura, la sala del hero da 186/227/248 antes y después',
    cierre:
      'dos salidas conocidas y las dos agregan objetos a la escena, que es más de lo que «cambia su material» autoriza: sprites aditivos alrededor del logo (el patrón de `CoreHalo.tsx`, que `CLAUDE.md` documenta como el reemplazo del composer en canvas chicos) o una luz de verdad atada a la pieza. **Se mide, se publica y lo decide el humano**',
  },
  pieSinBanda: {
    numero: 'D-B13.3',
    que:
      'Cierre — EL PIE SIN BANDA, que es lo que el humano pidió: *«el footer sigue siendo sólido, no transparente»*. B13 revirtió la banda que B12 había puesto debajo del texto chico y lo que quedó destapado está medido bloque por bloque (`outputs/b13/bloques-b13-cierre-{1440,1920}.json`, el instrumento de B11 con el recorte de la pastilla): **de 24 bloques a 1920 fallan 7 y de 23 a 1440 fallan 8, con el peor en 2,41–2,44:1**. Se parten en dos familias y ninguna es nueva del todo: (1) **los cuatro del titular** —«Lo que», «sigue lo», «armamos», «con vos», `titulo-xl` de 65 px— en 2,49–2,66:1 contra los 3:1 de texto grande, que es `D-B12.2` con la banda puesta y sigue siendo la misma causa: la varianza de la sala a nivel 0,643, piso brillante y barras de celosía oscuras; y (2) **tres de texto chico que la banda tapaba** — «las redes, una por red» (2,44:1, 21 px de 487), «la dirección de contacto, cuando exista» (2,49:1, 7 px de 895) y «[ENLACE]» (2,45:1, 3 px de 306). Lo que se pierde por bloque es **el 0,8 % al 4,3 % del glifo**: 78 px de 2.940, 79 de 3.872, 38 de 4.599 y 35 de 3.232 en los cuatro del titular; 21 de 487, 7 de 895 y 3 de 306 en los tres chicos. ⚠️ **Los 17 restantes pasan**: las siete anclas del recorrido (4,90–8,59), el logotipo (4,97), el legal (4,97), el CTA (5,77), la línea de cierre (5,98), los rótulos de columna (7,22–9,30) y **el formulario entero con su fondo propio** (6,43 · 6,43 · 7,22 · 17,60). ⚠️ **Y la emisión de §1 no podía cerrarlo**: en el Cierre el arco está en 0,643, muy por encima de `RIM_NIGHT_LEVEL`, así que `emisionDelLogoEn` devuelve CERO exacto — la sala del Cierre mide 0,3028 de luminancia media, el mismo número que B12 publicó, byte por byte',
    cierre:
      '⚠️ **NO con la banda: el humano lo prohibió explícitamente** («no vuelvas a poner la banda»). Las dos salidas que quedan, las dos medidas y las dos fuera de B13: **(a) la LUZ** —bajar el nivel del arco detrás de esa pantalla, que es `lightArc.ts` y es del humano: la sala a 0,643 es la que pone la varianza, y con la sala apagada la tinta clara del Cierre cierra sola—; **(b) la COMPOSICIÓN** —bajar el titular de `titulo-xl`, o moverlo a donde la sala no tiene la lonja brillante del piso—, que es lo que `D-B12.2` ya dejaba anotado. Lo que NO es salida es la tinta: B12 midió las dos variantes y las dos fallan, porque lo que falla no es el contraste medio sino el peor píxel',
  },
} as const satisfies Record<string, DeudaDeclarada>

export const LISTA_DE_DEUDAS_DE_B13: readonly DeudaDeclarada[] = Object.values(DEUDAS_DE_B13)
