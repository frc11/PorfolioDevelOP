# Estado de la interfaz — después de INTERFAZ 1

> Qué hay en la capa de interfaz de /v3 (el texto en movimiento, el rollover, el cursor, los estados), las variantes en
> la URL, los invariantes y lo que quedó abierto. La escena tiene su propio estado (`ESTADO-ESCENA.md`). Las entregas de
> INTERFAZ 1 están en `~/.cache/b4-medicion/interfaz1/<ticket>/` (con un `mirar.txt` por carpeta). Rama `rediseno/home`,
> un commit por ticket. Todo banco con la NVIDIA (`BANCO_GPU=alta`, leída en la página).
>
> **Insumo que no existe:** la instrucción mandaba leer `OBSERVACION.md`; no está en el disco. La medición de nk de la que
> sale «la sensación de caro viene de completitud, no de espectáculo» es `docs/rediseno/sprints/SITIO-S2-motion.md`.

## 1 · Qué hay

| Pieza | Qué hace | Dónde |
|---|---|---|
| **T1 · el canal del texto** | Un sistema único: `titulo` y `parrafo` por línea, `etiqueta` por palabra, todos con máscara, con UNA curva (`principal`) y una escala de duraciones (1 · 0,8 · 0,6 de P1). El elemento tipográfico es el mismo en la rama quieta y en la animada (sin saltos de layout); el texto entero en un `sr-only`, las piezas `aria-hidden`; con menos movimiento y abajo de 1024, quieto | `_lib/motion/texto.ts`, `_secciones/_contrato/canales.tsx` (`CanalDeTexto`), `motion/_componentes/TextoQueEntra.tsx`, `PalabrasDeTexto.tsx`, `LineasDeTexto.tsx` (raíz `span`) |
| T1 · dónde | Quiénes somos (el equipo, los nombres, la bajada, las descripciones), Trabajos (la bajada), Tu panel (la descripción), Cierre (el titular y las etiquetas de las columnas). **Excepciones declaradas:** el hero (LCP), Servicios (el párrafo que se pinta y el rodillo, gestos aprobados), el párrafo de las demos (cambia con el ancho) | las secciones |
| **T1 · el texto con inercia** | Con el scroll rápido los títulos se inclinan (`skewY`) y vuelven con un resorte exacto (ζ ≈ 0,55). Lenis publica su velocidad una vez por cuadro en px/s; un bucle, un resorte, un `MotionValue` para todos; cero `setState` y cero reservas por cuadro. Nada hasta 600 px/s, 2,5° de tope a 4.500 px/s; un salto de más de 400 px en un cuadro no cuenta | `_lib/velocidadDelScroll.ts`, `_lib/motion/inercia.ts`, `_componentes/ScrollSuaveDeV3.tsx`, `ConInercia` / `Inclinado` |
| **T2 · el rollover de dos copias** | El gesto medido del CTA (6° / 10°, el barrido de clip-path, 1,3 s) en `em`, para links y botones del home: el mail y WhatsApp del Cierre, los nombres de los proyectos. Hover sólo con puntero fino; el foco siempre; la copia B `aria-hidden` | `_componentes/rollover/DosCopias.tsx`, `_estilos/rollover.css` |
| **T2 · el cursor de la sala** | Punto + halo con la persecución medida en nk, en segundos; el tono del fondo opaco de abajo o de la noche de la escena; estados `texto`, `enlace`, `boton`, `demo` («Abrir»), `logo` (lo publica la escena: `LOGO_BAJO_EL_PUNTERO`), `oculto`. Desde 1024, puntero fino, sin movimiento reducido. El nativo nunca se oculta. Reemplaza en el home al de S3 (que sigue en la galería) | `_chrome/cursor/`, `_estilos/cursor-sala.css`, `_lib/escena/entorno/hoverDelLogo.ts` |
| **T3 · el foco de dos tonos** | El contorno con la tinta del elemento + un borde de papel (C40): se ve sobre claro, sobre oscuro (Trabajos) y adentro de `difference` (abajo de 1025). Los recortes de la cinta y del carrusel dejan 6 px | `_estilos/foco.css`, `_estilos/demos.css` |
| T3 · los estados | Apretado (opacidad 0,6, sin transición) en todo lo que se toca; el revelado de las fotos con el teclado; el «Hablanos» del final que lleva la página adonde llega si toma el foco antes; el contacto con un aviso de error, `aria-invalid` en los intereses y borde de error punteado; la demo que dice que carga; los CTA de Servicios en escritorio con menos movimiento; hover en las redes del pie | `foco.css`, `quienes-somos/marco.tsx`, `por-que-develop/PorQueDevelop.tsx`, `_chrome/contacto/`, `trabajos/demos/VentanaDeDemo.tsx`, `servicios/CtaDelServicio.tsx`, `cierre/PiezasDeContacto.tsx` |

## 2 · Las variantes en la URL (sin banco; `_lib/interfaz.ts`)

| Pedido | Efecto |
|---|---|
| `?interfaz=inercia=no` | el texto sin inercia |
| `?interfaz=inercia=marcada` | la inercia al doble (tope 5°): la inclinación se ve según el ANCHO del título |
| `?interfaz=cursor=nk` | el cursor de la referencia: sobre cualquier control se apaga y queda el nativo; el logo sin estado |

Ganchos del banco (sólo con `__entornoDeLaEscena`): `__inerciaDelBanco.estado()` (la velocidad en px/s y los grados).

## 3 · Los invariantes y los bancos

`npm run test:s37-interfaz1` (una sección por ticket con sus controles positivos; 106 afirmaciones). Ajustados por este
sprint, con su porqué en el fuente: `quienes-somos` (7 piezas y 6 divisores), `s6-tu-panel` (+1 transformada: la
inclinación), `s8-cierre` y `s5-trabajos` (el texto anunciado y el nombre accesible sin lo que cuelga de `aria-hidden`),
`s8-chrome` (la compuerta del cursor nuevo), `angosto-invariante` (el CTA por servicio con `enEscritorio`).

Los bancos (`scripts-interfaz1/`, contra el servidor de desarrollo): `recorrido` (el recorrido con la rueda y el vigía:
corrimientos del layout, el divisor rehecho a la vista, las fuentes), `frenada` (la ráfaga y la frenada sobre un título,
a tiempo real y lento, con la inclinación de cada cuadro), `raton` (el mouse sobre los controles, el estado del cursor),
`foco` + `foco-hoja.py` (Tab real, una captura entera por paso y el contraste del anillo en píxeles, por franjas y en la
escala de la pantalla), `estados` (apretado con el botón sostenido, el revelado, el CTA del final, el contacto, la demo,
Servicios con menos movimiento), `chequeo` y `sonda`.

## 4 · Lo que quedó abierto

- **🛑 El rollover del menú y de los links del pie (propuesto, no hecho).** `chrome/Navegacion.tsx` y
  `chrome/PiePiezas.tsx` son compartidos: una prop opcional `rotulo?: (texto) => ReactNode` en cada uno y el home pasa
  `DosCopias`. Esperando la decisión de Valentino (detalle en `interfaz1/t2-rollover-cursor/mirar.txt`).
- **El corrimiento de la carga** (0,067): el cambio de la fuente de respaldo a la Chivo (`layout.tsx`, compartido).
  Medirlo con un build de producción; si sigue, `display: 'optional'` o un respaldo con métricas ajustadas.
- **El túnel recorta a 4 px** (`CapaDelTunel.tsx`, atado a los tokens y a `s5-trabajos`): en el teléfono el borde del
  anillo de dos tonos queda afuera y el contorno solo da 2,6:1. Subirlo a 6.
- Compartidos: el `:hover` pegado en táctil (`cta.css`, `pie.css`, `navegacion.css`), los abridores del contacto sin
  `aria-haspopup` (`Cta`), el input del newsletter que acepta texto con el envío deshabilitado (`Novedades`).
- Diseño: una pausa para el video de Servicios y para el carrusel del teléfono (WCAG 2.2.2); flechas en el carrusel.
- El CTA que rota de Servicios se desmonta fuera de su tramo (con Tab no se llega en escritorio).
- Los títulos de volumen (ESCENA 10 T3) siguen pendientes para la etapa de 3D: no entraron al canal del texto.
