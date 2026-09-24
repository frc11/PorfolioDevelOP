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
  pantalla contra 3,413 del arranque; **D va a 15,91, 4,66 veces el arranque**, en 0,25
  pantallas. El techo global no se aflojó. Control: unos valores que llegan de golpe
  ponen el chequeo en rojo.
- [x] **Ida y vuelta sin saltos**: en las cinco fronteras la pose coincide a los dos lados
  (≤ 5,7e−4 de mundo con ε = 1e−7) y subiendo se deshace al revés.
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
    rodea al logo: el hueco sale de la pose (30,6 svh en A) y del ancho medido del logo.
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
