# SPRINT B2 (y B3) · nocturno del 2026-10-22 — Seis razones → reseñas: el aro 3D (y reseñas → CTA)

Rama `nocturno/2026-10-22-b2`. Tarea: `docs/cola/2026-10-22/60-B2B3-resenas-cta.md`. Sin navegador: lo que se ve lo mide el orquestador
(abajo, «Qué mirar»). Las pruebas sin navegador: `s83-resenas` (`npm run test:s83-resenas`), cada una con su control positivo.

## Plan

### La forma (lectura del código)

- «Por qué develOP» es un pin de 7 pantallas (`secciones.ts:340`, `PANTALLAS_DE_POR_QUE_DEVELOP`). Los tiempos de la cámara son de la escena
  (`finalDelRecorrido.ts`, `TIEMPOS_DEL_FINAL`): A frase (-1 a 1,6), B valores (2,4 a 2,6, el sostén), C CTA (3,6), D, E pie. Las ventanas del
  DOM salen de ahí (`geometria.ts`, `progresoDelPin`).
- **El tramo de las reseñas se INSERTA en el sostén de B (pantalla 2,5 del pin viejo, con los seis valores ya llegados) y dura 4 pantallas.**
  - El DOM: el pin crece 4 pantallas (un espaciador después del escenario clavado; `secciones.ts` no se toca) y el pin del bloque se traduce al
    pin de siempre (`pinSinLasResenas`): antes del tramo igual, adentro quieto en 2,5, después corrido 4. Todo lo que ya existía (la frase, los
    valores, la levantada, la transformación al CTA) ve el mismo pin de antes.
  - La escena: el tramo se anota con `anotarTramo` (REGLA DE ALTURAS) con un largo sin estirar de una centésima de pantalla: la sala ve 4
    pantallas como 9 px de la regla (la cámara queda en el sostén de B). La `k` = 3600 / 9 = 400, igual en todo ancho de escritorio.
  - El viaje del menú a «Por qué develOP» (`destinosDelViaje.ts`) cae donde caía: descuenta las pantallas del tramo (un atributo del pin).
- Adentro del tramo (avance `r` de 0 a 1, cuatro pantallas): el título se da vuelta (0 a 0,125), los valores se desvanecen (0,125 a 0,25), el
  aro entra (0,25 a 0,5), se lee (0,5 a 0,875) y la última media pantalla es la del CTA (B3). Con `?resenas=gatillo`, el título, los valores y la
  entrada son UNA animación por tiempo que se dispara al entrar al tramo y vuelve al salir por arriba.
- **El título:** «Seis razones | para elegirnos» → «Lo que dicen | nuestros clientes», con la misma letra (los títulos de volumen, Chivo 400; la
  fuente se regeneró con la L y la d) y el gesto del CTA: el giro sobre Y (de canto en la mitad). Cada mitad gira en su lugar (`titulos3d/giro.ts`:
  la malla gira sobre el eje vertical de su centro; desde 90° no se dibuja). Sin WebGL, el DOM cruza los dos textos.
- **Los valores:** se van en el aire, de a uno, de abajo hacia arriba como llegaron: suben un poco, se desenfocan y se apagan (sin partículas).
- **El aro (la escena, `_lib/escena/resenas/`):** 10 placas de papel con espesor (redondeadas, como la del contacto pero más chicas) en un aro
  centrado en el logo, mirando hacia afuera, con el pie a la altura del pie del logo. La entrada: dos cadenas, la de adelante desde la izquierda
  (por la recta tangente al frente) y la de atrás desde la derecha (por la tangente de atrás); se unen alrededor del logo. Gira solo (una vuelta
  en ~72 s) y sólo con el aro armado. El texto es del DOM (se lee, se enfoca y se toca) llevado al frente de su placa con una homografía en cada
  cuadro (como el enlace del CTA). Se leen las de adelante (|ángulo| < 40°, se apaga hasta 62°); de 95° a 150° la placa se mete en la niebla y
  desde 150° no se dibuja: el cambio a la reseña siguiente es en la nuca del aro (180°), donde no se ve.
- **La interacción:** hover (mouse) → el aro frena, la placa sube, suena el `tic` de la barra y aparece «Ver trabajo →» (la pastilla de Demos);
  clic → el `clic` de siempre (el escucha global) y el ancla del proyecto (`#portfolio-<slug>`, el escucha de B1). Con `?resenas-arrastre=si`,
  arrastrar gira el aro con inercia.
- **Abajo de 1024 y con movimiento reducido:** la lista (la rama sin escenario): el título y un carrusel plano con flechas (una de frente en el
  teléfono y la tablet; tres quietas en escritorio con movimiento reducido). Su bloque se anota como tramo (la escena no lo ve).
- **Las reseñas:** ficticias con aspecto final (decisión de Valentino), sin la llave; nombres y negocios ficticios; retratos ilustrados neutros
  (`public/v3/resenas/*.svg`, la ruta en los datos para reemplazarlos antes de D8).

### Archivos

- Nuevos: `_secciones/por-que-develop/resenas/` (contenido, tramo, banderas, disolución, el escenario y la lista), `_lib/escena/resenas/` (el aro
  puro, las placas, la escena y lo que se cruzan el DOM y la escena), `_lib/escena/titulos3d/giro.ts`, `public/v3/resenas/*.svg`,
  `scripts-carga/aro-*.ts` (los bancos, sin correr), `s83-resenas.invariant.tsx`.
- Tocados: `PorQueDevelop.tsx` (el pin traducido, el tramo y la lista), `TitulosDeVolumen.tsx` (el giro), `PruebasDeLaEscena.tsx` (el módulo del
  aro), `destinosDelViaje.ts` (el viaje descuenta el tramo), `fuentes-3d.py` y `chivo-400-titulos.json` (L y d), `package.json` (la suite).

### Riesgos

- Sin navegador: el encuadre del aro (radio, altura, tamaño de la placa) es una cuenta con la pose B; lo mide el orquestador.
- El texto del DOM sobre la placa: la homografía es la del CTA (probada); la nitidez, con la transformada 2D cuando la cara está casi de frente.
- B2 solo (sin B3): la última media pantalla del tramo rebobina (el aro sale, los valores vuelven, el título se da vuelta al revés) y el CTA de
  siempre sigue igual. B3 reemplaza ese rebobinado.

## Log

### B2 · Seis razones → reseñas

- **La fuente.** `fuentes-3d.py` con «Lo que dicen» y «nuestros clientes» en la Chivo 400 de los títulos; regenerada sólo esa
  (`python scripts-retoque/fuentes-3d.py chivo-400-titulos.json`): entraron la L y la d, ningún glifo de antes cambió (comparado contra
  `HEAD`), 27 → 29 glifos.
- **El tramo** (`resenas/tramo.ts`): 4 pantallas en la 2,5 del pin. `pinSinLasResenas` le da a lo de siempre su pin; `avanceDeLasResenas`,
  el avance. La escena: `tramoDeLasResenas` con `k` = (4 × 900 + 9) / 9 = 401 (los 9 px de la regla estirados a 4 pantallas y 9 px: después
  del tramo, la escena ve el scroll de siempre, deriva 0; s83 §2 con su control).
- **El título** (`titulos3d/giro.ts`, `TitulosDeVolumen.tsx` una línea): la malla gira sobre el eje vertical de su centro; la frase de 0 a
  180° y las mitades de las reseñas de −180° a 0 (con la curva de la casa); de canto, ninguna. Las mitades nuevas son títulos de volumen
  anotados en el mismo lugar del DOM que la frase, con la misma lectura y la misma subida; arrancan de espaldas antes de anotarse.
- **Los valores** (`disolucion.ts`): suben 3 svh, se desenfocan hasta 9 px y se apagan, de a pares y de abajo hacia arriba; en 0 no queda
  nada escrito (la medida del CTA los lee planos).
- **El aro** (`_lib/escena/resenas/`): `aro.ts` puro (las cadenas, el texto, la niebla, la reseña de cada placa, el giro), `placas.ts`
  (papel con costados de la tinta del contacto, extruidas y redondeadas), `tarjetas.ts` (la homografía del texto del DOM al frente de cada
  placa, nítida de frente) y `EscenaDeLasResenas.tsx` (perezoso, desde 1024).
- **La lista** (`ResenasEnLista.tsx`): título con la mezcla de la lista, carrusel plano con encaje y flechas; su bloque se anota como tramo
  abajo de 1024 (`k` = (alto del bloque en px de la regla + 9) / 9).
- **El viaje del menú** (`destinosDelViaje.ts`): descuenta las 4 pantallas si el pin tiene el espaciador.
- **Los bancos** (sin correr): `scripts-carga/aro-costo.ts` (con la referencia sin aro en la inserción) y `scripts-carga/aro-legibilidad.ts`
  (el contraste de las tarjetas visibles con su control al 30 %; `MODO=interaccion`, el hover y el clic).

- **El gate (el commit que sigue a `4ad48208`):** el `<EscenaDelCta` había perdido su espacio en `PruebasDeLaEscena.tsx` (no parseaba:
  arreglado). Lo que pidieron las suites del lane, por diseño: (1) las dos ramas anuncian lo mismo y tienen las mismas paradas (s6-render,
  s6-por-que-develop, s10-acceso): las reseñas para el lector y el teclado van en las dos ramas, iguales y antes del CTA
  (`ResenasParaElLector.tsx`: el `h3`, cada reseña entera y su enlace, que aparece con el foco como la pastilla de la barra); las tarjetas
  que se ven (el aro y el carrusel plano) son del puntero (`aria-hidden`, sin enlaces ni botones fuera del orden del teclado en el marcado
  servido); s10-acceso suma `DELTA_DE_LAS_RESENAS` (12 paradas y un `h3`, en las dos ramas) con su control. (2) s6-tokens: sin
  `bg-cover`/`bg-center` (el retrato, en el estilo) ni `border-hairline` (`border`). (3) s7-contrato: el tipo de los trabajos es local (una
  sección no importa otra) y la lista no consulta la compuerta (decide el CSS: `--resenas-alargan`). (4) s52: el generador de la fuente
  sigue terminando en «Nosotros». (5) s83 §2: al final del tramo la sala vio sus 4 pantallas a 1/k (8,98 px a 1440), no 9.
- **Lo medido sin navegador (con B3 encima, en el mismo árbol):** lint limpio, tsc 0; s83, s10, s6, s18, s27, s37, s40, s41, s45, s47, s49,
  s52–s62, s74, s75, s76, s78 sin fallas; s3, s5, s7, s8, s4 con las fallas de la base (sin `.next` en el worktree: s3-peso, s5-peso,
  s7-compuerta, s8-tres, s8-peso, s4-heredado no cierran; s5-compacto y s8-montaje, las mismas listas que la base).
