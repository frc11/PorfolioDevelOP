# SPRINT CIERRE A-ter — La carga a prueba de todo, y dos retoques

Rama `rediseno/home`. Invariante nuevo: `npm run test:s75-carga` (`src/app/v3/_lib/__tests__/s75-carga.invariant.tsx`); A4b y A10b en
`test:s74-cierre-a-bis`. Arnés: `scripts-carga/estres.ts` (Playwright con el Chrome del sistema y la placa de alto rendimiento),
`scripts-carga/resumen.ts` (las tasas y el recibo) y `scripts-carga/red.ts` (la red de A4b). Diagnóstico: `?diag=carga` → `window.__v3diag`
(`src/app/v3/_lib/diagnostico/`). Corridas crudas en `~/.cache/b4-medicion/cierre-a-ter/carga/`; recibo en
`docs/rediseno/entregas/cierre-a-ter/carga.json` (lo lee s75).

Lo pedido (resumen):
- **A13** · `/v3` carga y anda siempre: en frío, con caché, saltando desde el menú en cualquier momento, recargando, con red o CPU lentas,
  con la pestaña al fondo y con el contexto WebGL perdido. Primero REPRODUCIR (arnés de estrés + diagnóstico), después arreglar las causas
  (el estado se deriva, no se acumula; todo idempotente), con un perro guardián de respaldo. Aceptación: 0 fallas en el build de medición;
  en dev, 0 fuera de lo documentado como «sólo dev»; `test:s75-carga` con su control positivo (sin la reimpresión por fuente y con las
  fuentes demoradas, falla).
- **A4b** · más rayos en la red de noche (no más grosor ni brillo), igual de estable y entera a los ~7,3 s; variantes con `?red-densidad=`.
- **A10b** · el rebote al caer, prendido por defecto; `?rebote=no` lo apaga.

## Estado

| Punto | Estado | Commit |
|---|---|---|
| A10b · rebote por defecto | HECHO (tests con el sentido nuevo: s74, s52, s71) | bf8baf4b |
| A4b · más rayos | HECHO y VISTO EN EL SITIO (1,5 por defecto: 47-51 rayos contra 33-34 de A-bis; 75 cps los dos) | 8adabba2 |
| A13 · el diagnóstico, el arnés y las causas | HECHO; build medido antes y después (133 corridas cada uno) | 2dd42d76 y el cierre de A13 |
| A13 · dev | SIN MEDIR: el servidor de desarrollo ocupa ~3 GB y con el Chrome del arnés la máquina queda bajo 1,5 GB. **VERIFICAR TRAS REINICIO** | — |

**Memoria.** Al empezar, 1,6 a 2,9 GB disponibles con el pool no paginado en 1,65 GB (la fuga de contextos WebGL de los bancos anteriores:
sólo la limpia un reinicio): los arreglos se escribieron desde el código. Cuando el humano liberó memoria (4,6 GB) se midió todo el build.

## A13 · Fase 1: reproducir

### El diagnóstico (`?diag=carga`)

`window.__v3diag` (sólo con la bandera; el código que lo arma se descarga sólo entonces):
- `estado(referencia?)`: cada texto impreso (los títulos de volumen, las piezas del pie, la tarjeta de gracias o error) con su estado
  (pendiente / listo y hace cuánto), con qué fuente se imprimió y si estaba cargada, su versión, lo que se corrieron sus letras, la opacidad
  efectiva de su DOM de respaldo y si su pieza se dibuja; `document.fonts` (cada cara); el montaje de la escena (el lienzo, su contexto, el
  primer cuadro, la caída, la carga abierta); el Lenis; la época de medición; cada bloque animado (su rango medido, el del layout y el
  progreso contra el de una carga limpia); la noche (puesta y la que deja el scroll); el remate de Tu panel.
- `fallas(referencia?)`: lo que el arnés cuenta como falla (`fallas.ts`, puro, probado en s75).
- `eventos()`: la línea de tiempo (cada impresión con su fuente, cada «listo», las épocas, los viajes, cada clic en un ancla —si lo tomó el
  viaje o fue el salto NATIVO—, las fuentes cargadas, la visibilidad, el contexto perdido y repuesto).
- `pulso()`: lo liviano para esperar una llegada sin medir el layout (el scroll, el viaje, el Lenis, la escena lista).

### El arnés (`scripts-carga/estres.ts`)

107 corridas por tanda: cada condición (normal / CPU ×4 / red lenta —300 ms y 2 Mbps, las fuentes 2,5 s tarde— / la pestaña al fondo 4 s)
con cada carga (fría / con caché / recarga en medio de la página / entrada con un ancla) y cada ítem del menú (los cinco de la barra y
Contacto), con el momento del clic rotando entre 0,3 / 1 / 2 / 5 s; además dos ítems en menos de 500 ms y el contexto WebGL perdido y
repuesto en medio de la página. Mira 1,5 s después de llegar (con la escena dibujando su primer cuadro; si no lo estaba al terminar el
viaje, también lo literal: 1,5 s del fin del viaje), 5,5 s después y 1,5 s después de scrollear 500 px. Referencia de los bloques: una
carga limpia desde arriba con una época forzada (todo medido en reposo; medido también en el layout: los 45 bloques, a menos de 2 px).

**La pestaña al fondo, emulada.** Playwright mantiene sus páginas visibles aunque la ventana se minimice o se abra otra pestaña (medido:
`document.visibilityState` sigue `visible`); la primera tanda de cada build la midió así sin querer. Se repitió esa condición emulando la
señal que lee el código (`visibilityState`, `hidden` y su evento) con un guion de arranque: los cuadros y los relojes siguen andando.

### Las tasas (build de medición, NVIDIA RTX 5050, 1440×900)

| | corridas | a 1,5 s del viaje | a 1,5 s con la escena | a 5,5 s | tras scrollear |
|---|---|---|---|---|---|
| **antes** (el diagnóstico sin los arreglos) | 107 | 80 (75 %) | 83 (78 %) | 82 (77 %) | 78 (73 %) |
| antes · la pestaña oculta al cargar | 26 | 26 (100 %) | 26 (100 %) | 26 (100 %) | 26 (100 %) |
| **después** | 107 | 8 (7 %) | 4 (4 %) | **0** | **0** |
| después · la pestaña oculta al cargar | 26 | 0 | 0 | **0** | **0** |
| control positivo (`?reimpresion=no`, red lenta, las fuentes 5 s tarde) | 26 | 18 (69 %) | 18 (69 %) | 19 (73 %) | 19 (73 %) |

Por escenario, a los 5,5 s (antes → después): normal 19/26 → 0; CPU ×4 21/26 → 0; red lenta 21/26 → 0; contexto perdido 3/3 → 0; pestaña
oculta 26/26 → 0; carga fría 6/24 → 0, con caché 27/27 → 0, recarga 24/24 → 0, con ancla 17/24 → 0; dos clics seguidos 8/8 → 0 (con 6 saltos
nativos → 0). Por momento del clic: 0,3 s 19/24, 1 s 17/24, 2 s 17/27, 5 s 21/24 → 0 en todos.

Lo que queda del después (4 corridas a 1,5 s con la escena, ninguna a 5,5 s): `dom-visible` con la CPU ×4 o la red lenta en frío o recargando,
el título listo hace más de 1 s y su DOM todavía entero. Visto con una sonda: la clase que lo apaga llega a tiempo, pero el primer cuadro de
la escena (que compila todo lo que dibuja) tiene el hilo ocupado y el fundido del DOM no avanza hasta que termina. Es un transitorio de
arranque lento: a los 5,5 s, cero.

Perro guardián: **0 avisos** en las 133 corridas del después. Errores de la consola: 0.

### Las hipótesis

| Hipótesis | Resultado |
|---|---|
| H1 · fuentes tardías | **CONFIRMADA**: en el antes, 75 de 107 corridas con títulos impresos con la fuente de respaldo y nunca rehechos (con caché y recargando, todas: `fonts.ready` resolvía sin nada cargando; muchas caras ni siquiera estaban pedidas). Después: 0. El control positivo la reproduce (19 de 26). |
| H2 · salto antes de montar | **CONFIRMADA** en dos formas: el segundo clic en vuelo era el salto nativo encima del viaje (8 de 8 corridas, 6 saltos nativos); y el salto nativo (antes de que monte el viaje) deja Quiénes somos «entrando» con el titular encima del logo, que lo esquivaba para siempre con su DOM apagado (`ninguno-visible`: 10 corridas). Después: 0. |
| H3 · medidas viejas | **CONFIRMADA y agravada por el primer arreglo**: una época a mitad de la página medía los bloques con lo que corren los `sticky` y las transformadas; al sumar las épocas por cada tanda de fuentes, Tu panel falló el 100 % (el paralaje de la galería corría un bloque hasta 226 px). Con la medición en el layout: 0. |
| H4 · lo que depende del recorrido | **CONFIRMADA**: con la pestaña oculta al cargar, la época se cableaba con el alto en 0 y nunca medía: todos los bloques quietos (26 de 26, también después de scrollear: «las fotos quedan quietas»); la noche quedaba en otra sección después de un salto (6). Después: 0. |
| H5 · contexto WebGL | **No dio fallas de texto**: con el contexto perdido y repuesto sólo aparecieron las de H1 (three repone la geometría y las texturas); el estudio de los reflejos vacío no lo mide el detector. El arreglo igual suelta lo impreso al perderse y lo rehace al reponerse. |
| H6 · sólo dev | **SIN MEDIR** (memoria): una corrida de calentamiento contra `next dev --webpack` salió bien a los 5,5 s. VERIFICAR TRAS REINICIO. |

## A13 · Fase 2: las causas y los arreglos

| Causa | Arreglo | Dónde |
|---|---|---|
| H1 · `fonts.ready` resuelve con nada cargando | Cada título espera la cara exacta de su DOM (`document.fonts.load`); cada tanda que termina (`loadingdone`) pide otra sincronía y lo armado con otra métrica (con una fuente nueva desde que se armó) se rearma con lo mostrado donde iba; el pie se rearma (compara su firma), la tarjeta se vuelve a imprimir, el CTA del final se rearma y la época mide de nuevo | `_lib/fuentes.ts` (nuevo), `titulos3d/sincronia.ts`, `titulos3d/registro.ts`, `pie3d/PieDeVolumen.tsx`, `pie3d/tarjetaImpresa.ts`, `ctaDelFinal/enVivo.ts`, `motion/epoca.ts` |
| H2 · el segundo clic en vuelo | Se ignora de verdad (primero el `preventDefault`); el vuelo empieza con el destino calculado | `_componentes/useDeslizamientoDelCta.ts` |
| H2 · el titular que esquiva el logo, quieto | Con la página quieta 1 s llega igual (en una pausa corta del scroll sigue esquivando) | `titulos3d/esquivaDelLogo.ts` |
| H2 · con la CPU lenta el reloj de seguridad abortaba viajes válidos (el viaje avanza a lo sumo 34 ms por cuadro) y la escena asentaba la noche en otra sección | Mientras Lenis siga yendo con la pestaña a la vista, el reloj espera otro margen; con la pestaña tapada sale como siempre | `_componentes/useDeslizamientoDelCta.ts` |
| H3 · medidas con lo pegado y lo transformado | El tope de cada bloque en el layout (la cadena de `offsetTop`, sin transformadas) menos lo que corren los `sticky`, y su alto del layout; la época también avanza cuando el cuerpo cambia de alto | `motion/enReposo.ts` (nuevo), `motion/useProgresoDePatron.ts`, `motion/epoca.ts` |
| H4 · la pestaña oculta al cablearse la época | La medición queda debida y se toma al volver | `motion/epoca.ts` |
| H4 · la noche y el remate después de un salto | La noche, la que deja el scroll; el remate de Tu panel, posado sin gesto | `trabajos/CapaDeLaGota.tsx`, `tu-panel/Remate.tsx` |
| H5 · el contexto perdido | Perdido, los títulos y el pie se sueltan (el DOM a la vista); repuesto, se rehacen el estudio y lo armado | `escena/contextoDelLienzo.ts` (nuevo), `titulos3d/sincronia.ts`, `TitulosDeVolumen.tsx`, `pie3d/PieDeVolumen.tsx` |
| Con la CPU lenta, la sección adonde se llegó esperaba el ocio para armarse | Los títulos a la vista se arman sin esperar el ocio, como el hero | `titulos3d/sincronia.ts` |
| Red de seguridad | El perro guardián: un título a la vista, con su fuente, sin armar y sin nada en curso más de 2 s se rearma y avisa (`console.warn('[v3-carga] …')`); lo que espera su fuente o compila no se toca | `titulos3d/sincronia.ts` |

`?reimpresion=no` (la bandera del control positivo, con `?diag=carga`): la espera de antes (`fonts.ready`), sin rehacer nada y sin el guardián.

El «antes» para el arnés se compila sin git: `scratchpad/cierreAter/cambiar.sh antes|despues` pone y devuelve los archivos de antes de
los arreglos (con el diagnóstico). Sin el scratchpad (otra sesión): el «antes» es `2dd42d76` sin los arreglos de su cierre, en un árbol aparte.

## A4b · Más rayos

La red de noche es un árbol que une una brasa por celda de una grilla del cuadro (`energia/arbol.ts`): los rayos son las celdas con brasa
menos uno. La densidad agranda la grilla con su raíz (9 × √densidad: 1,25 → 10, 1,5 → 11, 1,75 → 12 por lado), sin tocar el canal, el golpe
ni la estabilidad; cada rayo nace por su distancia por el árbol a un foco en la misma parte de la formación, así que la red sigue entera a
los ~7,15 s. Variantes: `?red-densidad=1.25|1.5|1.75` (y `1`, la de A-bis, para comparar). **Por defecto 1,5.**

Visto en el sitio (`scripts-carga/red.ts`, el build de medición, NVIDIA, 1440, Portfolio de noche con la red armada y entera, dos vueltas):
- A-bis (`?red-densidad=1`): 33 y 34 rayos, 75 cps (p95 13,5 y 13,7 ms).
- Producto (1,5): 47 y 51 rayos, **75 cps** (p95 13,7 y 13,8 ms): los cuadros por segundo no bajan (el monitor va a 75 Hz).
- La hoja (5 cuadros a 1440 y a 390 con la del producto, y una de cada variante): `~/.cache/b4-medicion/cierre-a-ter/red/hoja-a4b.png`. La
  1,75 amontona rayos arriba a la derecha y pasaría el tope del brillo de noche (140 enlaces): la 1,5 es la elegida.

## Lo que no quedó bien

- Dev sin medir: el servidor de desarrollo ocupa ~3 GB y con el Chrome del arnés la máquina quedaba bajo 1,5 GB; «sólo dev» queda sin
  clasificar (VERIFICAR TRAS REINICIO: `MODO=dev` contra `next dev`).
- Con la CPU ×4 o la red lenta en frío, durante el primer cuadro de la escena el DOM del título ya impreso todavía se ve entero ~1-2 s (4 de
  133 corridas a 1,5 s; cero a 5,5 s). Y la pestaña oculta se midió emulada (Playwright no deja ocultar una página).
