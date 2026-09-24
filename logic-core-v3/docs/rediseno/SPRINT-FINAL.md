# SPRINT FINAL — «Por qué develOP» y el pie, con la escena extendida

Rama `rediseno/home` · dev 3000 · punto de retorno: tag `movil-cerrado` (e7472a17).
Referencia: https://www.nk.studio, a 1440 × 900, medida por CDP con el candado.

## Fase 0 — Medir nk y leer lo nuestro

- [x] **Tira de contacto de nk**, cada 50 px de 17.000 a 20.200 (65 cuadros, rueda real:
  con saltos de scroll su escena no pinta y la toma sale negra). Cuadros en
  `~/.cache/b4-medicion/final/nk-tira/`; la barra «/» medida píxel por píxel en `barra.csv`.
- [x] **Lo que hace nk, tramo por tramo** (scroll de su página; la barra mide 900 px de cuadro):

  | tramo | scroll | la barra | qué pasa |
  |---|---|---|---|
  | corte | 17.550 | — | el panel blanco se va con un **borde recto**, sin fundido |
  | frase | 17.550 → 18.250 | 343 → 262 px (38 → 29 % del alto), centrada (717, 432) | «5 things / to remember» partida a los dos lados; llega de la profundidad (escala 0,8 → 1,0 con opacidad 0 → 1, medido en el DOM) |
  | valores | 18.550 → 19.000 | 580 px (64 %), abajo del centro, **en contrapicado** | la cámara se acerca y baja; los cinco valores suben como filas |
  | sube | 19.000 → 19.650 | 545 → 665 px (74 %), el pie de la barra se nivela | la cámara sube hasta quedar derecha |
  | **alejamiento** | 19.650 → 19.700 | **665 → 172 px en 50 px de scroll** (×3,9 en 0,056 pantallas) | de golpe; llega «The future is waiting — let's create it» con LET'S TALK |
  | pie | 20.000 → 20.242 | 172 px (19 %), centrada (719, 405) | el pie se arma alrededor: identidad a la izquierda, columnas a la derecha, redes y legales abajo |

- [x] **Lo nuestro, leído:**
  - «Por qué develOP» (`por-que-develop/`): titular P1 + bajada + cuatro diferenciales y un
    testimonio en P5, sobre `papel-transparente`, 100svh. Consume cinco entradas de INVENTOS
    (`diferencialClientes`, `diferencialEntrega`, `testimonioCita`, `testimonioCuerpo`,
    `testimonioFirma`). El pie (`cierre/`): titular + CTA + columnas del pie + línea de cierre.
  - El recorrido: seis tramos; el último (`cierre`, 0,75 → 1) corre sobre `por-que-develop`
    con el ancla declarada 0,8525, y termina en la pose `cierre` (d 27) con su sostén en 1.
  - La transición panel → escena: **la máscara del revelado** (`revelado.ts`), una rampa de
    0,125 de pantalla — el desvanecimiento que se pide sacar.
  - El logo claro de noche: el nivel del arco (`logoEmision.ts`) — con `NOCHE_DISPARADA` en 1
    desde Trabajos la sala ya está de noche en el final, pero el arco dice mañana (0,643):
    el estado claro depende hoy de que la gota haya corrido.
  - Medido hoy a 1440: el texto de las dos secciones es tinta OSCURA sobre la sala de noche,
    y no se lee.

### PLAN DE CÁMARA (nuestra escena)

El logo mide 4,78 de tinta; con 35° de campo, de frente ocupa `7,58 / d` del alto del cuadro.
Las medidas de nk traducidas a distancia:

| tiempo | pose (ángulo · altura · distancia) | logo | de nk |
|---|---|---|---|
| A · frase | 360 · 1,6 · 20, frontal y centrado | 38 % | 343 px de 900 |
| B · valores | 360 · −3,2 · 12, contrapicado de 15° | 63 % | 580 px, desde abajo |
| C · CTA | 360 · 0 · 12, derecha y frontal | 63 % | la cámara sube hasta nivelarse |
| D · alejamiento | de C a E en 0,25 pantallas | 63 → 19 % | ×3,9 en 0,056 pantallas |
| E · pie | 360 · 5 · 40, abierto y centrado | 19 % | 172 px de 900 |

Sobre el scroll (1 pantalla = 100svh; «Por qué develOP» pasa a medir 4 pantallas con el
escenario clavado y el pie es la última): la escena aparece con A ya puesto (la pose se
alcanza escondida detrás de Tu Panel); A se sostiene 0,5 pantallas del pin; B llega en 1;
se sostiene 0,3; C llega en 0,9 y se sostiene 0,3; D ocupa las primeras 0,25 pantallas en que
el pie sube; E se sostiene hasta el final.

## Fase 1 — La escena se extiende (≥1024)

- [x] **Cinco tiempos sobre la coreografía de siempre** (`_lib/escena/finalDelRecorrido.ts`):
  el tramo `demos` corre escondido y cierra en la pose de la frase; del ancla (0,8525) en
  adelante los keyframes caen sobre la recta del tramo `cierre`: frase → sostén 0,8709 ·
  valores 0,9078 → sostén 0,9189 · cta 0,9521 → sostén 0,9631 · pie 0,9723 → sostén 1.
  «Por qué develOP» pasa a 4 pantallas (la entrada y tres de pin). Sin tocar
  `scene-camera.ts` ni `HeroArtifact.tsx` (el sitio vivo sólo lee el primer keyframe).
- [x] **El corte es recto**: la costura donde la sala ENTRA no tiene rampa
  (`RAMPA_DE_LA_ENTRADA_PX = 0`, `revelado.ts`); la de salida de Trabajos conserva la suya.
- [x] **El logo ya está claro**: el arco vuelve a la noche escondido (0,7375, con Servicios y
  Tu Panel tapando la sala) y se queda ahí hasta el final. Afirmado: en la reanudación
  (p 0,8110) y al asomar (p 0,8156) el nivel es 0,040 y la emisión 0,160 de 0,16.
- [x] **La excepción D, con nombre**: fuera de D el pico es 2,786 alturas de cuadro por
  pantalla contra 3,413 del arranque; **D va a 12,06, 3,53 veces el arranque**, en 0,25
  pantallas (con las distancias finales de B y C, 16; con las de esta fase, 12, eran 15,91 y
  4,66). El techo global no se aflojó. Control: unos valores que llegan de golpe ponen el
  chequeo en rojo.
- [x] **Ida y vuelta sin saltos**: en las cinco fronteras la pose coincide a los dos lados
  (≤ 4,9e−4 de mundo con ε = 1e−7) y subiendo se deshace al revés.
- [x] Invariantes: `s23-final` nuevo (11 afirmaciones, 4 controles); `s9e-recorrido` y
  `s17-revelado` reescritos para el final; `s8-escena`, `s16-arnes`, `s20-brillo`,
  `s22-emision`, `s18-modulacion`, `s8e-encuadre`, `s13e-camara`, `s19-lente`, `s7-mezcla`
  en verde.
- Medido en el navegador a 1440: el corte recto, A frontal al asomar, B en contrapicado y
  E con el logo chico al centro sobre la sala de noche.

## Fase 2 — «Por qué develOP» (≥1024)

- [x] **Escenario clavado de cuatro pantallas** (`por-que-develop/PorQueDevelop.tsx`) sobre el
  pin de la sección, con las ventanas derivadas de los mismos tiempos que la cámara
  (`por-que-develop/geometria.ts`):
  - **A · la frase** «Seis razones» · «para elegirnos» llega desde atrás con P5 —escala 0,8 → 1
    con la opacidad, el gesto que nk hace con «5 things / to remember», medido en su DOM— y
    rodea al logo: el hueco sale de la pose (34,0 svh en A, 41,8 en B) y del ancho medido del logo.
  - **B · los seis valores**, tres a cada lado, entran de a pares con P5 escalonado mientras la
    cámara baja; la frase se queda y sube 30 svh para no pisarlos.
  - La sección sigue siendo «Por qué develOP»: `h2` en `sr-only` en las dos ramas, id y menú.
- [x] **Íconos: Lucide** (el repo ya la tenía; no se sumó Phosphor), trazo 1,5 en los seis y
  el color de la tinta. Hecho a medida → `Ruler` · Diseño que se destaca → `PenTool` · Rápido,
  sin atajos → `Timer` · Calidad que se nota → `BadgeCheck` · Tu panel, tu control →
  `LayoutDashboard` · Hablás con quien lo hace → `MessagesSquare`.
- [x] **Contraste AA sobre la escena, medido a 1440** (fondo sin el texto, percentil 90 bajo
  cada caja): títulos 13,7–17,9:1, líneas 6,1–7,3:1, la frase 13,8 / 17,0:1. El 0,6–4,8 % de
  los píxeles de cada caja que queda bajo AA son las motas blancas de la sala.
- [x] **El contenido viejo se fue**: titular, bajada, cuatro diferenciales y el testimonio, con
  sus **cinco entradas de INVENTOS** (las dos puntas). **Quedan 5 en INVENTOS, todas de
  Números** (desconectada), así que la lista no llega a cero y la franja sigue por la llave.
- [x] **Sin el punto azul**: la sección ya no monta `CabeceraDeSeccion` (no se borró).
- [x] La superficie pasa a `oscuro-transparente` (tinta clara sobre la sala de noche).
- [x] Invariantes: `s6-por-que-develop` reescrito (26 afirmaciones); `s10-acceso` (+1 parada,
  +2 encabezados, −5 marcadores), la lista de quién pide coreografía en todo ancho, y la tabla
  de superficies acordadas, actualizados. En verde: s7-arboles, s7-contrato, s10-acceso,
  s21-llave, s5-codigo, s5-tokens, s3-tokens, s5-trabajos, s6-render, s7-mezcla.

## Fase 3 — El CTA (≥1024)

- [x] El código entró con el commit de la fase 2: el CTA vive en el mismo escenario clavado y
  sale de la misma geometría (`por-que-develop/geometria.ts`); este commit trae su registro.
- [x] **La frase y los valores se levantan juntos**: suben 12 svh y se apagan entre las pantallas
  1,8 y 2,2 del pin, antes de que llegue el CTA.
- [x] **El CTA llega centrado con el gesto de la casa** (P5, escala 0,8 → 1 con la opacidad): la
  frase entre 2,0 y 2,55, el destacado y el botón entre 2,15 y 2,7 —que es cuando la cámara
  termina de subir a frontal (C)—. Mientras no llegó, el botón no se puede tocar.
- [x] **Se queda mientras la cámara sube** y hasta el final del pin; se va hacia arriba con la
  sección mientras la cámara se aleja (D) y el pie sube.
- [x] **Copy (PROPUESTA, construida)**: «Este sitio empezó con una charla.» · destacado por el
  peso «El tuyo también.» · botón «Hablanos» con el CTA por defecto (`CtaEnlace`), a `#contacto`.
- [x] **Contraste AA sobre el logo gris, medido a 1440 en C**: la frase y el destacado 5,77:1
  (percentil 90), el botón 5,77:1 en el peor píxel (0 % bajo AA).

## Fase 4 — El alejamiento y el pie (≥1024)

- [x] **El alejamiento D** ocupa el primer cuarto de la pantalla en que el pie sube (de la
  pantalla 3 a la 3,25): la cámara pasa de frontal a 16 a la pose E (arriba, a 40), con el logo
  chico en el centro. Es la excepción declarada del techo de velocidad (fase 1).
- [x] **El pie se arma alrededor del logo** (`cierre/Cierre.tsx`), con el hueco sacado de la pose
  E (18,5 svh a cada lado del centro):
  - izquierda: develOP, la línea de identidad «Lo que sigue lo armamos con vos» (el `h2` de la
    sección) y debajo el contacto;
  - derecha: las columnas «El recorrido» (las secciones de la página) y «Contacto» («Hablanos»);
  - abajo: las redes, y la línea de develOP con el año, la razón social y los legales.
- [x] **El contenido es el del pie de hoy, reacomodado**: lo que no existe sigue PEDIDO con su
  marcador —la dirección, las redes y los legales ([ENLACE] × 3), el año ([FECHA]) y la razón
  social ([NOMBRE])—. Nada inventado y sin newsletter (vive en Tu Panel).
- [x] **Llega con el gesto de la casa, escalonado, después del alejamiento**: P5 sobre la última
  pantalla, izquierda 0,3–0,6 · derecha 0,4–0,75 (las columnas con su escalonado de P2) · abajo
  0,55–0,9.
- [x] **Sin scroll vacío al final**: la caja de contenido le sumaba su propio alto y su padding al
  del `<footer>` (que ya trae 80 px arriba y abajo del estilo del pie) y la sección medía 1060 px
  en vez de 900. Sin eso mide 100svh, y el último píxel de scroll es el pie terminado y centrado
  en el logo (medido: scroll máximo 26.805, sección de 900 con el tope en 0).
- [x] **Sin el punto azul** también en el pie (la marca de sección no se monta; no se borró).
- [x] El destino del CTA del pie viejo pasó a `CONTACTO_DEL_PIE` («Hablanos», `#contacto`);
  `asentamiento.ts` y `soporte.ts` del pie viejo, sin consumidores, se borraron.
- [x] **Contraste AA sobre la escena, medido a 1440 en el último píxel**: 16,5–18,2:1 en el
  percentil 90 en las 19 hojas de texto; lo que queda bajo AA (≤ 1,3 % de cada caja) son motas.
- [x] Invariantes: `s6-cierre` reescrito (20 afirmaciones, 2 controles: una llegada que se pasa
  del final y la caja que estiraba la sección); `s8-chrome` y la lista de quién pide
  coreografía en todo ancho, actualizados.

## Fase 5 — Abajo de 1024

- [x] **La adaptación normal** (la rama de lista, que también es la de menos movimiento en
  cualquier ancho): la frase en dos renglones, los valores en lista —una columna a 375, dos
  desde 426, así que a 768 van de a dos—, el CTA y el pie apilado con el logo arriba y sus
  columnas de a dos desde 768.
- [x] **Sin coreografía de cámara nueva**: la escena recorre la misma, reescalada por el mapeo
  proporcional de siempre. Las piezas llegan con el gesto de la casa (P5 sobre su ventana
  visible), sin parallax.
- [x] **La regla del blend, y por qué acá no se aplica tal cual.** La premisa «el logo es oscuro»
  no se cumple en esta banda: de noche el logo es gris (≈ #616161) sobre la sala casi negra y la
  superficie es la invertida, de tinta clara. La mezcla de la página (tinta del fondo con
  `difference`, la de «Quiénes somos») pinta acá |sala − 14|, negro sobre negro, y ninguna
  `difference` pasa AA sobre ese gris (el máximo da 2,09:1, calculado). **Medido a 375:** las
  seis líneas en `tinta-media` daban 2,31:1 sobre el logo. **Arreglo:** la lista va entera a
  tinta plena —las líneas y la frase del CTA; el destacado se distingue por el peso, como en el
  escenario—; el peor texto queda en 5,12:1 a 375 y 5,19:1 a 768, todo AA. `s7-mezcla` sigue en
  verde (102/102): no se agregó ninguna mezcla ni ningún ancestro que la corte.
- [x] **1024×768**: la columna derecha de valores se desbordaba 41 px y quedaba a 2 px del borde
  de abajo (a 4:3 las columnas miden 159 px). Cada columna es ahora un contenedor y, cuando mide
  menos de 16rem, el aire entre valores y dentro de cada uno se achica a la mitad: entra en su
  caja (211–742 dentro de 207–745). Medido sin cambios a 1024×640, 1280×720, 1280×800,
  1440×900 y 1920×1080.
- [x] Invariantes: `s6-por-que-develop` suma la tinta plena de la lista (con control), la
  ausencia de mezcla y las columnas contenedor (31 afirmaciones). En verde: s6-render,
  s7-mezcla, s7-arboles, s5-codigo, s10-acceso; `tsc --noEmit` limpio.

## Fase 6 — Verificación

- [x] **Lint y tipos**: eslint sobre los archivos del sprint, 0 errores; los 3 avisos ya estaban
  en `movil-cerrado` (dos en `s10-acceso`, `LightStop` en `choreography.ts`). `tsc --noEmit`
  limpio. Sin build y sin prettier.
- [x] **En verde**: s7-arboles, s7-contrato, s7-mezcla, s6-cierre (s8-cierre reescrito), s10-acceso,
  s21-llave, s23-final; la escena y la cámara (s8-escena, s16-arnes, s20-brillo, s22-emision,
  s18-modulacion, s18-compuertas, s18-deslizamiento, s8e, s9e-recorrido, s13e-camara, s19-lente,
  s7e entero, s10e a s22, s17-revelado, s17-marca, s19-sincronia); y s6-*, s5-*, s3-tokens,
  s3-codigo, s3-frontera, s11-frontera, s7-pedido, s7-cn, s7-integracion, s8-montaje,
  s10-lectura y s10-medida.
- [x] **El túnel**: la superposición contra la referencia (`scripts-b4/ref-comparar.ts`) deja las
  cinco capas adentro del margen de 1 px; el peor caso es el 1,6 % del margen, como antes.
- [x] **Invariantes nuevas, con control positivo** (`s23-final`, 13 afirmaciones): el corte recto,
  el logo claro en el primer cuadro, la excepción D (12,06 alturas de cuadro por pantalla,
  3,53 veces el arranque, el único tramo arriba del techo), la ida y vuelta A → E sin saltos, y
  los literales del recorrido atados a `finalDelRecorrido.ts`.
- [x] **Lo que la verificación destapó, arreglado acá:**
  - `s7e-export-sprites` y `s7e-variantes` estaban en rojo desde la fase 1 (la batería de
    entonces no los corría): el editor de la escena exporta el bloque de keyframes en literales,
    byte por byte, con sus notas. El final pasó a literales —los emitió el propio editor— con sus
    notas en `choreographyNotes.ts`, y `s23-final` §5 afirma que coinciden con
    `finalDelRecorrido.ts` al redondeo del exportador (5e−5).
  - `s7e-recorridos`: el control de distancia del editor llegaba a 30 y la pose E está a 40; el
    rango sube a 40 (`probeStore.ts`).
  - `s18-deslizamiento`: el otro `CtaEnlace` de la página vive ahora en «Por qué develOP».
  - `s8-chrome`: «ningún enlace a la nada» sigue estricto; el único enlace al destino provisorio
    `#contacto` —el contacto del pie— se cuenta aparte.
  - `s7-pedido`: `CONTENIDO-PENDIENTE.md` regenerado (27 → 23 pendientes: se van los cuatro del
    «Por qué develOP» viejo).
- ⛔ **Bloqueante escrito — necesitan un build, prohibido en este sprint:** `s7-compuerta`,
  `s8-intro`, dos afirmaciones de `s8-chrome` (los chunks) y `s8-tres` leen `.next` de producción.
- [x] **Con el candado**, en `~/.cache/b4-medicion/final/`: la tira lado a lado con nk en los siete
  momentos (`tira/lado-a-lado.png`), la grabación a 1440 de Tu Panel al final y de vuelta
  (`grabacion-1440/grabacion-1440.mp4`, 48 s, y su hoja) y las capturas a 375, 768 y 1024 (`f6/`).

### El plan de cámara, final, contra nk

| tiempo | nk | develOP |
|---|---|---|
| A · frase | barra al 38 % | a 20: logo al 38 %, frontal |
| B · valores | 64 %, en contrapicado | a 16 (el plan decía 12): 47 %, contrapicado de 11°. A 12 el logo, que es ancho, no dejaba lugar a las columnas a 1024 |
| C · CTA | 74 %, sube a frontal | a 16: 47 %, sube a frontal |
| D · alejamiento | ×3,9 en 0,056 pantallas | ×2,5 en 0,25 pantallas: 12,06 alturas de cuadro por pantalla, 3,53 veces el arranque |
| E · pie | 19 %, centrada | a 40: 19 %, centrado |

## FINAL 2 — La escena vuelve a ser de día desde «Por qué develOP»

Corrección del planificador: el final no va de noche, va de DÍA, como el hero.

- [x] **La sala de día**: el arco termina en la luz del hero (nivel 1, 6500 K, azimut −42),
  puesta escondida entre 0,625 y 0,7375 (`lightArc.ts`); las dos secciones vuelven a
  `papel-transparente` (tinta oscura).
- [x] **El cambio no se ve**: la noche disparada de la gota (`NOCHE_DISPARADA.cantidad`) deja de
  regir con una compuerta sobre la MISMA cantidad (`DIA_DEL_FINAL`, `nocheDisparada.ts`): rige
  desde que el medio del bloque opaco Servicios + Tu panel pasa el medio del cuadro. Es función
  de la geometría, no de la historia, así que un salto cae del lado correcto. Tapada, en la
  mitad de arriba, la noche se repone a 1 si un salto pasó por encima de la gota: demos vuelve
  a verse de noche. Se escribe en el evento `scroll` (antes que los cuadros de animación) y en
  la lectura por cuadro. La banda de la gota no corre en esta frontera (sus entradas «por
  abajo» son `nada`).
- [x] **El revelado espera a que la escena corra**: al reanudar, el canvas guardaba el último
  cuadro de antes de suspenderse (con un salto, otra pose y otra luz); ahora la sala se descubre
  cuando la máquina de visibilidad vuelve a `corriendo`.
- [x] **C, de día**: el logo negro con la tinta negra encima no se leía. El CTA baja a los
  19 svh que quedan bajo el logo (el logo en C ocupa del 26 % al 74 % del alto, medido en cuatro
  ventanas), con el botón al lado del destacado —abajo está la sombra de contacto del piso— y la
  letra calculada contra ese lugar.
- [x] **Contraste AA de día, medido** (fondo desfavorable: percentil 10 para la tinta oscura, a
  1440, 1024, 1920 y 1280×720): la frase, los títulos, el CTA y el botón pasan; las líneas de los
  valores en `tinta-media` no pasaban sobre las sombras de la celosía (2,98–4,44:1) y ahora
  heredan la tinta plena.
- [x] **Abajo de 1024, la mezcla de la casa** en lugar de la tinta plena: en el canal de cada
  llegada de «Por qué develOP» (9 piezas) y del pie (isotipo, identidad y columnas; la fila de
  abajo no, porque lleva el acento de la marca y en reposo no pisa el logo). Los enlaces del pie
  toman la tinta del papel en `banda.css`. `s7-mezcla` suma las cadenas del final (116, verde).
- [x] Invariantes: `s24-dia` nuevo (26 afirmaciones, 5 controles: la compuerta en el borde, un
  cuadro tarde, sin reposición, la entrada que sí corre la banda, la compuerta con memoria);
  `s23-final` §2 reescrita (la sala de día al reanudar y al asomar); `s7-por-que-develop` §5,
  `s17-revelado`, `s11-frontera` (el recorte de `demos` se fue con su pose) y `s8-montaje`
  (`probeStore.ts` en su línea de base) al día.
