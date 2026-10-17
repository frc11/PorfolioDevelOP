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
  **A4c** (cierre): Valentino comparó y prefiere la red de A-bis: la densidad por defecto vuelve a 1; la bandera queda para comparar.
- **A10b** · el rebote al caer, prendido por defecto; `?rebote=no` lo apaga.
- **A13b** (cierre) · el detector de «texto doble» compara cada rótulo impreso del formulario del pie contra su propio DOM.

**Cerrado:** A13 y A10b, aprobados por Valentino. A4, con la densidad 1 por defecto.

## Estado

| Punto | Estado | Commit |
|---|---|---|
| A10b · rebote por defecto | HECHO (tests con el sentido nuevo: s74, s52, s71) | bf8baf4b |
| A4b · más rayos | HECHO y VISTO EN EL SITIO (1,5 era la default de A-ter: 47-51 rayos contra 33-34 de A-bis; 75 cps los dos); medido otra vez tras el reinicio | 8adabba2 |
| A13 · el diagnóstico, el arnés y las causas | HECHO; build medido antes y después (133 corridas cada uno) | 2dd42d76 y 5599092d |
| A13 · dev | MEDIDO tras el reinicio (107 corridas, en tramos): ver «Dev» abajo | — |
| A4c · la red de A-bis por defecto | HECHO: `DENSIDAD_DE_LA_RED.producto` = 1; la bandera queda (`1`, `1.25`, `1.5`, `1.75`) | aef428df |
| A13b · «texto doble» del formulario del pie | HECHO: cada rótulo impreso contra su propio DOM | ea9bedfc |

**Memoria.** Al empezar, 1,6 a 2,9 GB disponibles con el pool no paginado en 1,65 GB (la fuga de contextos WebGL de los bancos anteriores:
sólo la limpia un reinicio): los arreglos se escribieron desde el código. Cuando el humano liberó memoria (4,6 GB) se midió todo el build.
Tras el reinicio (pool no paginado en ~0,6 GB, 5 a 8 GB libres) se midieron dev y el banco de A4b.

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
| H6 · sólo dev | **MEDIDO tras el reinicio** (ver «Dev»): con la condición normal, la CPU ×4 y la pestaña oculta, 0 a los 5,5 s. Lo que falla en dev es la red lenta (el peso de dev) y una regla del detector (A13b). |

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

## Dev (`next dev --webpack`, medido tras el reinicio)

`MODO=dev` con el mismo arnés (107 corridas, NVIDIA RTX 5050, 1440×900), con el servidor de desarrollo solo (sin build en paralelo). La
página de dev crece ~300 MB por corrida en el Chrome del arnés, así que se corrió en **tramos de 5 corridas con un Chrome nuevo por tramo**
(esperando 2,2 GB libres antes de cada uno); cuatro corridas que cortó la memoria se repitieron aparte (todas bien). Dev baja **73 MB de
JS** sin minificar contra el build: a los 2 Mbps de la condición «red lenta» son ~5 minutos.

| condición | corridas | a 1,5 s con la escena | a 5,5 s | tras scrollear |
|---|---|---|---|---|
| normal | 26 | 0 | **0** | **0** |
| CPU ×4 | 26 | 1 | **0** | 1 |
| red lenta | 26 | 22 | 11 | 10 |
| pestaña oculta (emulada) | 26 | 0 | **0** | **0** |
| contexto perdido y repuesto | 3 | 0 | **0** | **0** |
| **total** | 107 | 23 (21 %) | 11 (10 %) | 11 (10 %) |

Perro guardián: **0 avisos**. Errores de la consola: **0**.

**Lo que se queda de las 11 (todo «sólo dev» o del detector, nada de la página):**
- **8 corridas con la red lenta, sin diagnóstico** (`SIN DIAG`): a los 2 Mbps el módulo de diagnóstico (que se descarga sólo con `?diag=carga`, entre
  los 73 MB de dev) no llegó en el tiempo del arnés, y 24 de las 26 de esa condición no «llegaron» a los 15 s. No hay falla medible: el
  arnés no tiene con qué mirar. **Sólo dev**: en el build esa condición da 0 de 26.
- **1 con la red lenta** (`sin-imprimir` de las piezas del pie, una recarga en Contacto): la página tardó más de 20 s en armarse en dev; el pie se
  imprimió después (el estado se tomó antes). Mismo origen: el peso de dev.
- **3 `dom-visible` del formulario del pie** (2 con la red lenta, 1 con la CPU ×4, tras scrollear): era una regla del detector, no texto doble (una
  captura del formulario al fondo lo confirma): el formulario en volumen deja su DOM vivo a propósito. **Corregido en A13b** (abajo).

Otros hechos de dev:
- **4 saltos nativos del ancla** (todos con la CPU ×4): el clic llegó antes de que la barra terminara de montar (6 a 9 s en dev), así que el
  enlace anduvo como un ancla común y llegó bien, sin dejar fallas. En el build: 0.
- **El primer cuadro de la escena en dev tardó más de lo que el arnés espera (30 s)** en 8 corridas (5 con la CPU ×4, 2 con la condición normal,
  1 con la red lenta): el «a 1,5 s con la escena» de esas se tomó al tope. A los 5,5 s, cero.
- La condición normal en dev, con la pestaña oculta y con el contexto perdido: 0 en todo.

## A4c · Densidad 1 por defecto

Valentino comparó las dos redes de noche en el sitio y prefiere la de A-bis. `DENSIDAD_DE_LA_RED.producto` vuelve a **1** (la grilla de 9 por
lado); `?red-densidad=1.25|1.5|1.75` (y `1`) queda para comparar. Tests (sin debilitarlos, con el sentido nuevo):
- **s74 A4b**: el producto es 1 y la escena lee 1 sin la bandera; con la bandera, cada variante (1,25 / 1,5 / 1,75) da más rayos que la de A-bis
  (razón entre 1 + 0,6·(d − 1) y 1,25·d) en el mismo tiempo (la red entera a ±0,35 s y a menos de 7,5 s), ninguna pasa el tope del brillo de noche
  (140 enlaces: la 1,75 llega a 133), el canal y el golpe son los de A-bis, y la URL llega (`?red-densidad=` y sin ella). Controles: la default
  de A-ter (1,5), las variantes sin más rayos, el canal más grueso, un tercio más lento, dos topes más bajos y una URL que no lee la bandera.
- **s72** (reparto): se mide con la default y con cada densidad (reparto parejo y focos con la grilla de su densidad); control: una red de la
  1,75 medida con la grilla de la 1. **s70**: la grilla es la de la densidad de la red (la default, 1).
- **s52** lista `red-densidad` entre las sueltas, igual.

## A13b · «Texto doble» del formulario del pie

El detector (`fallas.ts`) medía la opacidad del DOM de la **pieza entera**; el formulario del pie en volumen deja vivo su DOM (los campos, el
foco, el lector) y sólo apaga lo que la placa imprime: los rótulos, la tecla Enviar y el relieve de la tarjeta (`color` transparente). Con la
página quieta al fondo la regla lo marcaba `dom-visible` sin que hubiera texto doble. Ahora el diagnóstico mide cada texto que imprime la placa
(`rotulos` en `TextoDelDiag`, de `publicar.ts`) con la opacidad de su propio DOM y el detector compara cada rótulo contra el suyo; el detalle dice
cuál (`rótulo «Mail» DOM 1.00`). Las demás piezas y los títulos siguen con la regla de la pieza entera. s75: el formulario con el DOM vivo y los
rótulos apagados no es falla; controles: un rótulo con su DOM a la vista, la tecla Enviar con el suyo, la regla de antes (el formulario entero) y
otra pieza del pie con su DOM a la vista, todos se siguen marcando. **Sin medir en el sitio** (sin dev ni banco en este cierre): la regla se
probó en s75 con estados armados; el recibo del build (`carga.json`) no cambia.

## A4b · Más rayos

La red de noche es un árbol que une una brasa por celda de una grilla del cuadro (`energia/arbol.ts`): los rayos son las celdas con brasa
menos uno. La densidad agranda la grilla con su raíz (9 × √densidad: 1,25 → 10, 1,5 → 11, 1,75 → 12 por lado), sin tocar el canal, el golpe
ni la estabilidad; cada rayo nace por su distancia por el árbol a un foco en la misma parte de la formación, así que la red sigue entera a
los ~7,15 s. Variantes: `?red-densidad=1.25|1.5|1.75` (y `1`, la de A-bis, para comparar). Por defecto fue 1,5 en A-ter; **[A4c] el producto
es 1** (ver arriba).

Visto en el sitio (`scripts-carga/red.ts`, el build de medición, NVIDIA, 1440, Portfolio de noche con la red armada y entera, dos vueltas):
- A-bis (`?red-densidad=1`): 33 y 34 rayos, 75 cps (p95 13,5 y 13,7 ms).
- Producto (1,5): 47 y 51 rayos, **75 cps** (p95 13,7 y 13,8 ms): los cuadros por segundo no bajan (el monitor va a 75 Hz).
- La hoja (5 cuadros a 1440 y a 390 con la del producto, y una de cada variante): `~/.cache/b4-medicion/cierre-a-ter/red/hoja-a4b.png`. La
  1,75 amontona rayos arriba a la derecha y se acerca al tope del brillo de noche (140 enlaces; da hasta 133 en Node).

**Medido otra vez tras el reinicio** (el build de medición, NVIDIA, 1440; con 1,5 como producto, que era la default de A-ter):
- Con vsync (`scripts-carga/red.ts`, dos vueltas por densidad): **75 cps los dos** (p95 13,7-13,8 ms), el tope del monitor; no distingue nada.
  Rayos: 24-38 con la 1 y 42-48 con la 1,5.
- **Sin vsync** (`--disable-gpu-vsync --disable-frame-rate-limit`, cuatro vueltas por densidad alternadas, 8 s de red armada y entera): la 1,5
  da ~378 cps (363 a 405; mediana 2,5-2,8 ms; p95 3,2-3,7) contra ~361 cps de la 1 (331 a 388; mediana 2,6-3,0 ms; p95 3,3-4,4): la red con
  más rayos no cuesta cuadros por segundo (la diferencia es ruido). Rayos: 45-47 con la 1,5 contra 33-42 con la 1.
- La hoja (los cinco cuadros a 1440 y a 390 con 1,5, y las variantes 1, 1,25 y 1,75): red entera y estable en todos los cuadros.
- La decisión de producto no fue por costo: Valentino comparó y prefiere la 1 (A4c). Con la 1 por defecto, el costo es el de A-bis.

## Lo que no quedó bien

- Dev: con la red lenta, el peso de dev (73 MB de JS) impide medir (8 corridas sin diagnóstico, 1 con el pie aún sin imprimir); no es una falla de
  la página, pero no se puede decir que dev cargue bien a 2 Mbps. Con una red normal, la CPU ×4, la pestaña oculta y el contexto perdido: 0.
- Con la CPU ×4 o la red lenta en frío, durante el primer cuadro de la escena el DOM del título ya impreso todavía se ve entero ~1-2 s (4 de
  133 corridas a 1,5 s en el build; cero a 5,5 s). Y la pestaña oculta se midió emulada (Playwright no deja ocultar una página).
- `scripts-carga/red.ts` compara `?red-densidad=1` contra la del producto: con A4c las dos son la misma (1); para comparar hay que pedir `1.5`.
