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
