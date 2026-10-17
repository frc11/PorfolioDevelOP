# SPRINT B1 · PORTFOLIO — selector lateral

Rama `rediseno/home`. Base: `52d38204` (cierre de A-ter). Fuente de verdad del sprint: este archivo (el plan arriba, el log de
cada sprint al final).

**Objetivo.** Reemplazar el túnel del Portfolio de `/v3` por un selector lateral de proyectos: un acordeón de tiras verticales en
escritorio y tablet, historias tipo Instagram en el teléfono. Videos reales de los sitios, una ficha por proyecto, deep links y la
escena oscurecida, **sin cambiar lo que se ve en el resto de la página**.

**Estado: APROBADO CON AJUSTES (2026-10-17).** Las decisiones de la §9 están resueltas en su lugar y los ajustes de la
aprobación van en la §11, que **manda sobre el resto del plan** donde lo contradiga (el paso de 0,75 pantallas, los datos dictados,
la llave para lo que falta, el oscurecido medido por capa). En curso: B1.1a → B1.1b → B1.2, sin frenar hasta el FRENO del final de
B1.2. El build de medición (`.next-probe`, ignorado por git, BUILD_ID `lcERRvtvbJDOVlh4Me-6P`, el mismo árbol que HEAD: `lente.ts`
difiere sólo en finales de línea) queda en disco para las capturas «antes» de B1.1b.

---

## 0. El plan en diez líneas

1. **Lo que hay hoy en la sección no es sólo el túnel**: Trabajos lleva la aproximación, el cartel «Portfolio», el túnel, la
   espera del CTA, la salida por el vacío y **las Demos** (la biblioteca viva), todo en un pin de 757svh (888,56 con el túnel estirado).
2. **El selector reemplaza el tramo del medio** (cartel + túnel + espera); **la aproximación y la cola (salida + Demos) quedan, al
   píxel**: la salida pasa a ser «el panel se retrae», y las Demos llegan con el mismo reloj de hoy.
3. **Siete pasos de una pantalla**: portada y ficha de los tres proyectos, más «la próxima es la tuya». La sección pasa de
   888,56svh a **1125,67svh** en todo ancho.
4. **REGLA DE ALTURAS sin tocar la tabla**: `secciones.ts` sigue declarando 717svh + 40 de solape y el selector se anota a la
   escena como un **tramo estirado** (el mecanismo que hoy usa el túnel, `TRAMO_ESTIRADO`), con un `k` por ancho que hace que la
   escena vea, en cada ancho, exactamente los píxeles que ve hoy. Fuera del selector el progreso de la escena es el de hoy, bit a bit.
5. **La cámara nueva no toca la coreografía**: una pose del Portfolio que se mezcla sobre la del scroll con un peso por tiempo
   (0 afuera, 1 con el panel adentro), en el mismo lugar del rig donde hoy se aplica la cámara de entonces.
6. **El «?» se dibuja en el lienzo de la escena** con un pase con scissor después del render (`addAfterEffect` de r3f 9.6.1), sobre
   el rectángulo de su tira. Cero contextos nuevos.
7. **Videos con cuadros deterministas y ffmpeg** (ffmpeg 8.1.2 está instalado, con libx264 y libwebp): ~1,2–2,2 MB por video de
   escritorio y ~0,8–1,6 MB por el de teléfono, estimado; se mide de verdad en B1.1.
8. **Las URL de los tres sitios están en el repo** (verificadas por el humano en su momento): no hace falta frenar.
9. **Faltan casi todos los campos de la ficha** (fecha, servicio, problemas, reseña): van `null` y a «DATOS QUE FALTAN» (§3).
10. **Dos choques con la spec, reportados** (§6): «un solo contexto WebGL en la página» ya es falso hoy (Servicios abre el suyo), y
    los invariantes nuevos empiezan en **s76** (s74 y s75 están tomados).

---

## 1. Lo que hay hoy (lectura)

### 1.1 La sección y sus tramos

`src/app/v3/_secciones/trabajos/` (48 archivos, ~9.000 líneas). `Trabajos.tsx` envuelve todo en `CoreografiaEnTodoAncho` (es la
única sección que corre su coreografía en todo ancho) y monta, adentro de un `<Bloque patron="P7" anclaje="seccion">`:

- `PortadaDeTrabajos` (`piezas.tsx`): el cartel «Portfolio» + su bajada. El titular es un `TituloDeVolumen id="portfolio"` (el
  título impreso en 3D, con `queda`) adentro de P2 con la ventana que recorta; la bajada va por `CanalDeTexto` y es
  «acompañante» del título (`useAcompananteDelTitulo('portfolio')`). Huye en z con histéresis.
- `CapaDelTunel`: el túnel (la tabla medida en heatbureau: capas anidadas que escalan), con su **regulador** (`regulador.ts`,
  resortes y dos rieles), su **estiramiento** por ancho (`ritmo.ts`, `estiramiento.ts`: ×1,8 desde 1024, ×1,5 tablet, ×2 teléfono)
  y el **vacío** de la salida (un `clip-path` con agujero que crece desde el centro). Publica `mostrado`, el progreso regulado.
- `CapaDeDemos` (`demos/`): la biblioteca viva, detrás del túnel; su llegada es función de la fracción del vacío, calculada desde
  `mostrado` (`demos/entrada.ts`).
- Fuera del bloque, `CapaDeLaGota`: el disparo de la noche (lo que invierte la sala al terminar Quiénes somos).
- `progreso === null` (sin coreografía: SSR, movimiento reducido, antes de instalarse) → `RamaQuieta`: la misma sección como lista.

Los tramos, en **px de la regla** (contados contra un alto de 900, `geometria.ts`):

| Tramo | px | Desde → hasta (progreso de P7) |
|---|---:|---|
| Aproximación (el panel sube; entra el título) | 900 | 0 → 900 |
| Cartel hasta la huida | 950 | 900 → 1.850 |
| Túnel (la tabla; ×1,8 en escritorio, descontado por la escena) | 1.480 | 1.850 → 3.330 |
| Espera del CTA | 552 | 3.330 → 3.882 |
| Salida (el vacío llena en 969) | 1.131 | 3.882 → 5.013 |
| Demos | 1.800 | 5.013 → 6.813 |
| **Total** (717svh + 40 de solape = 7,57 pantallas) | **6.813** | |

El pin: el hijo pegado mide una pantalla; desde 1024 lo pone `Seccion` (`pinneada: 'desde-escritorio'`), abajo lo pone la rama
animada sobre el bloque. El solape (0,4 pantallas) monta la sección sobre el final de Números, sólo desde escritorio en el margen;
el alto lo suma en todo ancho (`Panel.tsx`).

### 1.2 Lo que vive afuera y depende de la sección

- **El menú y el contacto** consumen piezas de `trabajos/demos/` (`dialogo`, `genie`, `apertura`, `catalogo`) y
  `contacto/placa.ts` importa `FOCO_DE_LA_ESCENA_PX` de `trabajos/tunel.ts`.
- **Los viajes**: `_componentes/destinosDelViaje.ts` tiene el nudo de `trabajos` (el fin de la máscara del título del cartel, por
  `[data-pieza="cartel"]`) y el subnudo `demos` (el final del pin).
- **La escena**: `tunelEnLaEscena.ts` (estrellas, fugaces y la formación no se dibujan en p 0,51143 → 0,625, derivado del arranque
  del túnel); `camaraDeEntonces.ts` (la cámara de ESCENA 10 en el tramo, pares medidos a 1440 hasta p 0,53852);
  `tramoEstirado.ts` (el descuento del túnel estirado); `entorno/encendido.ts` (`noPasoDePortfolio`: p < 0,625).
- **El diagnóstico** de A-ter: `fallas.ts` tiene `tunel-desfasado`; `publicar.ts` usa `lineaDeLaNoche` y la gota.

### 1.3 Sonidos

`_lib/sonido/`: howler con UN sprite (`public/v3/sonido/sonidos.{webm,m4a}`). El bus (`sonar`, `callar`) no hace nada si el motor no
está instalado, que es el producto con el parlante apagado: **el mute se respeta por construcción**. Hoy la sección no suena (el
sonido del túnel se fue en RETOQUE 3D). **Los dos que pide la spec existen**: `tic` («el hover de la barra y de los CTA: un tic muy
suave», 0,1) y `pestillo` («el clic de la barra y de los CTA», 0,15). No hace falta sustituir nada.

### 1.4 Los tests que la cubren

- Adentro de la carpeta: `trabajos.invariant.tsx` (`test:s5-trabajos`) con sus partes (`trabajos-tipeo`, `-rotulo`, `-ventanas`,
  `-nacimiento`, `-regulador`, `-piezas`), `capturas-invariante`, `movil-invariante`, `ritmo-invariante` y `demos/demos-invariante`.
- Afuera, **32 archivos** leen módulos de la sección. Por lo que leen:
  - sólo Demos, la gota o el contenido (no cambian): s25, s8-chrome, s24, s38, s52, s64, s6-tu-panel, s5-codigo, s5-originales;
  - el túnel, el cartel o la geometría (se re-apuntan al archivo o se dan vuelta, §5.11): s19-lente, s27, s30, s35, s36, s37, s39,
    s40, s41, s42, s45, s47, s48, s49, s50, s51, s61, s62;
  - el marcado de la sección (cambian con el sentido nuevo, sin aflojar): s10-acceso (paradas, encabezados, texto anunciado igual en
    las dos ramas), s5-archivos (el padrón), s5-modulos, s75-carga (`tunel-desfasado`).

---

## 2. Las URL

Están en `trabajos/contenido.ts` («no estaban en el repo, se buscaron en todo el árbol y en todo el historial, y los trajo el
humano»). Se usan tal cual:

| Proyecto | URL |
|---|---|
| El Garage | `https://elgarageautomoviles.com.ar` |
| Esquina Estudio | `https://esquinaestudio.com.ar` |
| Banú Scents | `https://banuscents.com.ar` |

Los nombres reales los fija `_contrato/escaneo.ts` (`NOMBRES_REALES`). El nombre visible es «Banú Scents», con tilde; el slug
y el deep link van sin tilde (`banu-scents`).

---

## 3. Los datos de la ficha, y DATOS QUE FALTAN

Lo único que el repo tiene, además de nombre y URL, son los **rubros dictados por el dueño** (`contenido.ts`), una frase por
proyecto que mezcla el rubro con lo que se hizo. Propuesta de reparto **con las palabras dictadas y nada más** (a confirmar):

| Proyecto | Frase dictada | rubro (propuesto) | quéHicimos (propuesto) |
|---|---|---|---|
| El Garage | «Concesionaria con un catálogo de muchos filtros.» | «Concesionaria» | «Un catálogo de muchos filtros.» |
| Esquina Estudio | «Equipo de branding. Le hicimos una página acorde a su estética y su marca.» | «Equipo de branding» | «Una página acorde a su estética y su marca.» |
| Banú Scents | «Vende perfumes árabes. Le hicimos una página simple pero bonita.» | «Perfumes árabes» | «Una página simple pero bonita.» |

Todo lo demás no existe en el repo y queda `null`. El repo además dice, en dos lugares, que **no hay nada medible en estos tres
trabajos y no lo va a haber** (`[MÉTRICA]` se cerró por la puerta de adelante): `resultado` queda `null` y, por la spec, no se muestra.

### DATOS QUE FALTAN (para Valentino)

| Campo | El Garage | Esquina Estudio | Banú Scents | Cómo se ve mientras falta |
|---|---|---|---|---|
| rubro y quéHicimos | confirmar el reparto de arriba | ídem | ídem | el reparto propuesto |
| fecha | falta | falta | falta | `[FECHA]` visible |
| servicio | falta | falta | falta | `[TEXTO]` visible |
| problemaCliente | falta | falta | falta | `[TEXTO]` visible |
| problemaResuelto | falta | falta | falta | `[TEXTO]` visible |
| resultado | no hay (y el repo dice que no va a haber) | ídem | ídem | el campo no se muestra |
| reseña (texto y autor) | falta | falta | falta | `[TESTIMONIO] · pendiente`, nunca una reseña inventada |
| copy de la descripción del Portfolio | lo reescribe C2 | | | la bajada de hoy, anotada en el pedido |
| copy de «la próxima es la tuya» | lo reescribe C2 | | | placeholder anotado en el pedido |

Cada `null` entra al `PEDIDO` de la sección (`_contrato/pedido.ts`: ruta, clase, marcador, dueño, qué y formato), así que
`CONTENIDO-PENDIENTE.md` (`s7-documento`) los lista solo y desaparecen cuando se llenan. Ojo para cuando llegue la fecha:
`s5-contenido` prohíbe dígitos en el contenido; una fecha con números va a pedir su excepción en `NUMEROS_PERMITIDOS`, con motivo.

---

## 4. La altura, medida, y la REGLA DE ALTURAS

### 4.1 Medición (build de medición, Chrome del sistema, un ancho por proceso, espera única de 12 s, pestaña visible)

| Ancho × alto | Trabajos (px) | Pantallas | Qué lo compone | Margen de solape | Documento |
|---|---:|---:|---|---:|---:|
| 1440 × 900 | 7.997 | 8,8856 | 717 + 40 + 131,56svh (túnel ×1,8, la escena lo descuenta) | −360 px | 33.770 |
| 1024 × 768 | 6.824 | 8,8854 | ídem | −307 px | 29.902 |
| 820 × 1180 | 9.903 | 8,3924 | 717 + 40 + 82,22svh (×1,5, sin descontar) | 0 | 33.297 |
| 390 × 844 | 7.777 | 9,2145 | 717 + 40 + 164,44svh (×2, sin descontar) | 0 | 23.955 |
| 360 × 780 | 7.187 | 9,2141 | ídem | 0 | 22.505 |

Coincide al centésimo con las fórmulas del CSS (`Panel.tsx`, la clase de la rama animada y `estirarElPanel`). La escena ve hoy
**6.813 px de la regla en escritorio** (lo estirado lo descuenta) y, abajo de 1024, la sección entera sin descontar (7.553 en
tablet, 8.293 en teléfono, contados contra 900).

Dos derivas ajenas, medidas de paso y fuera de alcance (las anoto, no las toco): Quiénes somos mide 3,0367 pantallas a 1440 contra
las 3 que declara (+33 px), y Tu panel mide 8,4492 a 1024 × 768 contra 7.

### 4.2 Qué depende de esa altura

La escena mapea el scroll a su progreso con nudos por tramo, **proporcionales a la extensión de las secciones**
(`anclaje.ts`, `recorrido.ts`). El tramo `trabajos` (p 0,5 → 0,625) corre sobre la pantalla 6 → 13,17 de la tabla. Todo lo que está
expresado en progreso adentro de ese tramo se mueve si la sección cambia de alto sin que la escena lo sepa:

| Qué | Dónde | Cae hoy (progreso de P7, px de la regla) |
|---|---|---|
| **Ciclo día/noche** — el atardecer | `lightArc.ts` `ATARDECER` 0,4375 → 0,5 | 360 → 1.260 (en la aproximación y 360 px de pin) |
| — la noche y la vuelta | `NOCHE` 0,5 → 0,5833; `VUELTA` → 0,625 | la vuelta empieza en 5.562, adentro de Demos |
| — la noche disparada | la gota (`CapaDeLaGota`, `nocheDisparada.ts`) | **no depende**: la dispara un IO con la línea de `PANTALLAS_DE_NUMEROS` sobre la caja sin solape |
| — el día del final | `nocheDisparada.ts` (el bloque opaco Servicios + Tu panel) | **no depende**: se mide en vivo |
| **Keyframes de cámara** — `números` (p 0,5) | `choreography.ts` | 1.260 (0,4 pantallas después del pin) |
| — `trabajos` (p 0,625) | ídem | una pantalla después del despineado |
| — la cámara de entonces | `camaraDeEntonces.ts` (pares hasta p 0,53852) | hasta ~3.249, y alcanza a la de hoy en 0,625 |
| — el techo de velocidad | `s13b` (alturas de cuadro por pantalla) | el tramo mide 7,17 pantallas |
| **Tramo de plasma** — la energía y la red | `energia/` | **no depende de la altura**: sigue a la noche (`uNoche`) |
| — lo que no se dibuja en el túnel | `tunelEnLaEscena.ts` (estrellas, fugaces, formación) | p 0,51143 = 1.850 (arranque del túnel) |
| **El pie** | `finalDelRecorrido.ts`, `ANCLA_DE_POR_QUE_DEVELOP`, el final por reloj | anclado a sus secciones: se corre si Trabajos mide más de lo que la escena cree |
| Lo demás | el estirado (`TRAMO_ESTIRADO`), los rieles del regulador, el reloj de Demos, los nudos de los viajes, `lineaDeLaNoche` del diagnóstico, `noPasoDePortfolio` | |

---

## 5. El diseño

### 5.1 El árbol de componentes

```
src/app/v3/_secciones/trabajos/
  Trabajos.tsx                 TOCADO   monta el escenario del Portfolio + Demos + la gota (sin túnel)
  contenido.ts                 TOCADO   titular y bajada quedan; proyectos ← proyectos.ts; cta → la tuya; PEDIDO con lo que falta
  proyectos.ts                 NUEVO    los datos tipados (§5.2)
  geometria.ts                 REESCRITO los pasos, la cola de Demos, la noche (DISPARO_DE_LA_NOCHE, lineaDeLaNoche quedan)
  gota.ts, CapaDeLaGota.tsx    sin cambios
  portfolio/                   NUEVO
    pasos.ts                   puro: el mapa de pasos, pasoEn(px), las anclas, el reloj de Demos (cola), los k por ancho
    estado.ts                  puro: la máquina de estados (afuera, entrando, portada, ficha, saliendo) y el teclado
    usePortfolio.ts            el scroll medido en el layout, los gatillos, el hover con intención, el teclado, el hash
    saltar.ts                  el salto a un paso (Lenis scrollTo; sin Lenis, el viaje sin Lenis; reducido, instantáneo)
    tramoDelSelector.ts        la anotación a la escena (REGLA DE ALTURAS, §5.3)
    banderas.ts                ?portfolio-lado, -dim, -panel (y -camara, sólo para calibrar)
    EscenarioDelPortfolio.tsx  el escenario pegado: texto arriba a la izquierda, hueco del logo, panel
    EncabezadoDelPortfolio.tsx «Portfolio» (el TituloDeVolumen de hoy) y su bajada, sin la huida
    Acordeon.tsx               las tiras y los lomos (tablist)
    Tira.tsx, Ficha.tsx        una tira (video o póster, nombre y rubro) y su ficha
    VideoDeLaTira.tsx          un video: carga diferida, sólo el activo, póster gris en los inactivos
    LaTuya.tsx                 la tira final: el hueco del «?», el copy y el botón a contacto
    Historias.tsx, BarrasDeLasHistorias.tsx, HojaDeLaFicha.tsx   (B1.3)
  demos/relojDeDemos.ts        NUEVO    el reloj del vacío, sacado del túnel con los mismos valores
  demos/entrada.ts, CapaDeDemos.tsx  TOCADOS  importan el reloj nuevo; `mostrado` sale de la cola
src/app/v3/_archivo/tunel-portfolio/   NUEVO  README de una línea + los archivos del túnel (§5.11)
src/app/v3/_lib/escena/
  portfolioEnLaEscena.ts       NUEVO    puro: el peso y el oscurecido (objeto mutable, como NOCHE_DISPARADA), la pose y la mezcla
  SignoDeLaTuya.tsx            NUEVO    el «?»: escena chica, cámara, luces y el pase con scissor
  OscurecidoDelPortfolio.tsx   NUEVO    la exposición del render principal, por tiempo
  OrbitRig.tsx                 TOCADO   una línea: la mezcla de la pose después de `sampleTrack`
  EscenaDelHome.tsx            TOCADO   monta las dos piezas nuevas
  tunelEnLaEscena.ts           TOCADO   la ventana re-derivada de la geometría nueva
src/app/v3/_componentes/
  ScrollSuaveDeV3.tsx          TOCADO   anota la instancia de Lenis en un registro (cambia CÓMO se comparte, no qué renderiza)
  destinosDelViaje.ts          TOCADO   el nudo de Trabajos y cuatro subnudos (las anclas)
src/app/v3/_lib/lenisDelSitio.ts      NUEVO  el registro de la instancia
src/app/v3/_chrome/contacto/placa.ts  TOCADO  importa FOCO_DE_LA_ESCENA_PX de su lugar nuevo
src/app/v3/_lib/diagnostico/   TOCADOS fallas.ts (tunel-desfasado → portfolio-desfasado, portfolio-video, portfolio-ancla), publicar.ts
public/portfolio/<slug>/       escritorio.mp4, escritorio.webp, movil.mp4, movil.webp
scripts-portfolio/             grabar.ts y codificar.ts
src/app/v3/_lib/__tests__/s76-portfolio.invariant.tsx  (+ partes por la regla de las 300 líneas)
```

Componentes de menos de 300 líneas, la lógica en los `.ts` puros (testeables con `npx tsx`), ningún `.css` importado desde un
componente (las hojas entran por `layout.tsx` y van al padrón de `s3-tokens`), cada archivo nuevo de sección al padrón de
`s5-archivos`.

### 5.2 El tipo del archivo de datos

Convención del repo: el contenido de cada sección vive en su carpeta, como dato, separado del componente. El archivo nuevo es
`trabajos/proyectos.ts`; `contenido.ts` lo incluye en `CONTENIDO` para que los instrumentos de contenido (`textosDe`, el escáner, el
pedido) lo sigan viendo. Identificadores sin tilde, como el resto del repo.

```ts
export type SlugDelProyecto = 'el-garage' | 'esquina-estudio' | 'banu-scents'

export interface ResenaDelProyecto {
  readonly texto: string
  readonly autor: string
}

/** Un medio por dispositivo: el video del recorrido y su póster (el primer cuadro). */
export interface MediosDelProyecto {
  readonly video: { readonly escritorio: string; readonly movil: string }
  readonly poster: { readonly escritorio: string; readonly movil: string }
}

export interface ProyectoDelPortfolio {
  readonly slug: SlugDelProyecto
  readonly nombre: string
  readonly url: string
  readonly rubro: string | null
  readonly fecha: string | null
  readonly servicio: string | null
  readonly queHicimos: string | null
  readonly problemaCliente: string | null
  readonly problemaResuelto: string | null
  /** Sólo si es real. `null` → el campo no se muestra. */
  readonly resultado: string | null
  /** `null` → `[TESTIMONIO] · pendiente`, visible. */
  readonly resena: ResenaDelProyecto | null
  readonly medios: MediosDelProyecto
  readonly alt: string
}

export const PROYECTOS: readonly ProyectoDelPortfolio[] = [/* El Garage, Esquina Estudio, Banú Scents: en ese orden */]
```

Sin colores: el panel usa el tema. Las medidas de los medios (ancho y alto) van en la geometría y no acá: `s5-contenido` prohíbe
números en el contenido.

### 5.3 El mapa de pasos, la altura nueva y el reescalado

**Siete pasos de una pantalla** (`PANTALLAS_POR_PASO = 1`, una constante): una ráfaga de rueda o un deslizamiento de trackpad
(~1.000 px) es un paso, y una transición de ~400 ms termina antes del siguiente borde a ritmo de lectura. Los pasos son gatillos:
cruzar un borde dispara la transición al estado de ese paso, con 30 px de histéresis; un scroll rápido que cruza varios va derecho al
último (un solo `tic`).

| Progreso de P7 (px de la regla) | Qué pasa |
|---|---|
| 0 → 900 | **Aproximación, igual que hoy.** Entra el título «Portfolio» con su gesto (P2 en la ventana de la máscara). |
| 900 | **Pin.** Gatillo: el panel entra desde la derecha con El Garage en portada; la escena se oscurece; la cámara va a la pose del Portfolio. |
| 900 → 1.800 | El Garage · portada (el video) |
| 1.800 → 2.700 | El Garage · ficha (el video se achica arriba; `pestillo`) |
| 2.700 → 3.600 · 3.600 → 4.500 | Esquina Estudio · portada · ficha (`tic` al cambiar de proyecto) |
| 4.500 → 5.400 · 5.400 → 6.300 | Banú Scents · portada · ficha |
| 6.300 → 7.200 | La próxima es la tuya |
| 7.200 | Gatillo de salida: el panel se retrae a la derecha, el título se va, el oscurecido y la cámara vuelven. Subiendo, al revés: el panel entra con «la tuya» activa. |
| 7.200 → 10.131 | **La cola de hoy, al píxel**: la salida (1.131) y Demos (1.800). |

**Altura nueva: 1125,67svh en todo ancho** (100 de aproximación + 700 de pasos + 325,67 de cola; 11,2567 pantallas). En escritorio
son +237,11svh contra hoy; en tablet +286,44; en teléfono +204,22. Las pantallas en `svh` hacen que la barra del navegador no
corra los pasos.

**Cómo se reescala el mapeo (REGLA DE ALTURAS).** Dos formas posibles:

- (A) declarar el alto real en `secciones.ts`. **Descartada**: el tramo `trabajos` se estiraría entero, así que cambiarían la
  aproximación y Demos (la cámara, la vuelta del arco, la ventana de las estrellas), habría que volver a medir los pares de la
  cámara de entonces y el techo de velocidad del tramo cambiaría.
- (B) **la elegida: la tabla no se toca** (717svh + 40 de solape, que es lo que la escena lee para sus nudos) y el selector se anota
  a la escena como un tramo estirado, el mecanismo que hoy usa el túnel (`TRAMO_ESTIRADO` en `tramoEstirado.ts`, aplicado por
  `ataduraAlScroll.ts`). La escena mide el scroll **como si el selector midiera lo que medía el tramo del medio de hoy**: antes,
  igual; adentro, a 1/k; después, sin lo agregado.

  La cuenta cierra sola: aproximación 900 + el medio de hoy 2.982 + la cola 2.931 = **6.813**, los mismos 7,57 pantallas de la tabla.

  El `k` depende del ancho porque hoy, abajo de 1024, la escena ve el túnel estirado sin descontar:

  | Ancho | Lo que la escena ve hoy del tramo del medio | k = 6.300 / eso |
  |---|---:|---:|
  | desde 1024 | 950 + 1.480 + 552 = 2.982 | 2,1127 |
  | 768–1023 | 950 + 1,5 × 1.480 + 552 = 3.722 | 1,6926 |
  | menos de 768 | 950 + 2 × 1.480 + 552 = 4.462 | 1,4119 |

  Con eso, **en los tres anchos la escena ve exactamente los mismos píxeles que hoy fuera del selector** (7.553 en tablet y 8.293 en
  teléfono, como mide §4.1). El ancho lo decide el CSS (una variable que escriben las variantes de ancho, como hoy
  `--estiramiento-en-uso`): la sección no consulta el ancho en JS (`s7-contrato` §5). Los tres «lo que veía» van declarados como
  constantes con su derivación, y el invariante los compara contra la fórmula del túnel archivado.

**Lo que esto deja, punto por punto (§4.2):**

- Antes del pin y en toda la cola, el progreso de la escena es el de hoy (s49 1C ya afirma lo mismo para el túnel; s76 lo afirma
  para el selector en los tres anchos, con control positivo: sin el descuento, se corre).
- Adentro del selector la escena recorre p 0,475 → 0,5508 (de mitad del tramo `números` a 2/5 de `trabajos`), a 1/k. La cámara de
  ese recorrido no se ve: la tapa la mezcla de la pose del Portfolio (§5.4).
- **La noche**: la gota dispara al terminar Quiénes somos (no cambia) y `nivelConLaNocheDisparada` acota el arco a 0,04 mientras
  dura; adentro del selector el arco además ya está en noche desde p 0,5. La vuelta del arco (p 0,5833) cae donde cae hoy, adentro
  de Demos, tapada por la noche disparada. **Todo el tramo del Portfolio es de noche**, y s76 lo afirma muestreando el nivel en cada
  10 px de la sección con la gota disparada (control: sin la gota, la aproximación no es de noche).
- **El pie y todo lo que viene después**: los nudos salen de la tabla, que no cambia; el documento crece (a 1440 × 900, de 33.770 a
  ~35.904 px) y la escena lo descuenta. Bit a bit.
- **Estrellas, fugaces y la formación** (`tunelEnLaEscena.ts`): hoy se apagan en el arranque del túnel (p 0,51143), que con el
  selector caería en mitad de Esquina. Propuesta: que la ventana arranque en el pin (p 0,475): no se dibujan detrás del panel ni en
  Demos (como hoy). Es interno del Portfolio; ver §9.
- **Demos**: su reloj (la fracción del vacío, sin el vacío) se cuenta desde el arranque de la salida, que en la sección nueva es
  7.200 (hoy 3.882): `mostrado` para Demos = (px − 3.318) / 6.813 en la cola, saturado antes. Lo único que cambia es que Demos deja de
  ir detrás del resorte del túnel (el regulador existía por el túnel): llega con el scroll y con su propia persecución de 1,8 s.
- **Los viajes**: el subnudo de Demos (el final del pin) no cambia; el nudo de Trabajos pasa a ser El Garage en portada (§5.8).

### 5.4 El ángulo de cámara nuevo para el logo

No se toca `choreography.ts` (los keyframes, el techo de velocidad y la vuelta de 360°). En `OrbitRig.tsx`, después de
`sampleTrack(…, progresoDeLaCamara(progress), target)` y antes de la inercia, la pose objetivo se mezcla con la **pose del
Portfolio** con un peso que escribe la sección y el rig persigue por tiempo (≈700 ms, con la misma inercia de siempre encima):

    objetivo = mezcla(pose del scroll, pose del Portfolio, peso)      peso: 0 afuera · 1 con el panel adentro

Es la regla de B5 («un desplazamiento sobre la pose, nunca un cambio del progreso»): el progreso no se toca, así que el anclaje, el
arco y los 4.751 invariantes que descansan en él no se enteran. El mouse sigue encima, como en todo el recorrido.

La pose (calibrar en B1.2, con `aimWithFraming` y la caja del logo proyectada, como `scene-framing`): el logo abajo a la izquierda,
su caja adentro de x 0,04–0,25 e y 0,55–0,92 del cuadro. Punto de partida, cerca del azimut de Trabajos para que la entrada sea corta:

| Canal | Trabajos hoy | Portfolio (a calibrar) |
|---|---:|---:|
| angleDeg | 195 | ~200 |
| height | 4,5 | ~6 |
| distance | 20 | ~28 (el logo más chico: ~25 % del ancho) |
| frameX | −0,85 | ~−0,72 (a la izquierda) |
| frameY | 0 | ~−0,65 (abajo; con −1 el CTA del final deja el logo abajo) |

`?portfolio-lado=izq` espeja el `frameX`. Hasta tres variantes atrás de `?portfolio-camara=a|b|c` para que Valentino elija.

### 5.5 El «?» 3D sin un segundo contexto

**Elegida: un pase con scissor sobre el rectángulo de la tira, en el mismo renderer.** Con `addAfterEffect` (r3f 9.6.1 lo exporta)
el «?» se dibuja **después** del render de la escena, sin tomarle el lazo de render a r3f: escena chica propia (el «?» extruido de la
fuente 3D de los títulos, con material satinado —`MeshPhysicalMaterial` con `sheen`, rugosidad media— y un mapa de entorno de
PMREM), cámara propia apuntada al centro del rectángulo, dos luces propias. El rectángulo es el de un elemento de la tira
(`[data-signo-de-la-tuya]`), medido en cada cuadro con `getBoundingClientRect` (la tira puede estar animando su ancho: se quiere lo
pintado), pasado a píxeles del búfer con el `dpr` del lienzo y la `y` dada vuelta. Sólo corre con la tira a la vista y ancha.

Por qué así y no un objeto de la escena alineado al DOM (el patrón de los títulos 3D y del pie):

- el lienzo está **detrás** del DOM, así que el cuerpo de la tira tiene que dejarlo ver en los dos casos;
- a la noche la sala tiene nivel 0,04: un objeto de la escena necesitaría luz propia, y en three una luz alumbra todo;
- el oscurecido (§5.7) lo apagaría también; el pase va después, con su exposición;
- con el scissor la tira «tinta» se limpia a su color exacto (sin tono, en sRGB), sin un cuadrado de fondo que empatar.

Costo: un render de pocos cientos de triángulos en un rectángulo, sólo con la tira activa. La alternativa (objeto de escena + quad de
fondo + luz por capas) queda como plan B si el pase choca con algo del lazo (el pase compartido, `Precompilar`).

Chequear en B1.2: que la fuente 3D subconjunto tenga el glifo «?» (si no, sumarlo al subconjunto).

### 5.6 Videos: grabación, codificación y peso

**Método (calidad primero): cuadros con scroll determinista y reloj virtual, y ffmpeg.** `recordVideo` de Playwright graba VP8 con
bitrate bajo y en tiempo real; se usa sólo si el método de cuadros falla.

1. Chrome del sistema con `--force_high_performance_gpu`, un Chrome y una página por video.
   - Escritorio: 1440 × 900, `deviceScaleFactor` 1 (16:10 exacto, el formato de la tira).
   - Teléfono: 390 × 844, `deviceScaleFactor` 2, `isMobile` y `hasTouch` → cuadros de 780 × 1688.
2. Carga, espera de red y una pasada lenta por la página para que carguen las imágenes diferidas; arriba otra vez.
3. CSS inyectado que esconde banners de cookies, popups y widgets de chat (selectores genéricos más los del sitio, decididos al
   mirarlo). Ningún clic, ningún formulario, nada enviado: sólo GET.
4. Tiempo virtual por CDP (`Emulation.setVirtualTimePolicy`): cada cuadro de salida avanza 1/15 s de la página (a 30 cuadros por
   segundo de salida, eso es 2×; el borrador decía 1/60, que es 0,5×) y un tramo
   del recorrido guionado (`window.scrollTo` con su curva). Así las animaciones por tiempo de cada sitio también van a 2×, sin
   tirones. 30 cuadros por segundo de salida, 10–12 s: 300–360 cuadros por video. Después de cada captura se re-emula el dispositivo
   (la lección de `Page.captureScreenshot` congelando los pasos de render).
5. Recorrido por sitio (se define mirándolo): la portada sostenida ~1 s, las dos o tres secciones que muestran el trabajo (el
   catálogo con filtros de El Garage, la estética de Esquina, los productos de Banú) y vuelta corta.
6. ffmpeg: H.264 (`libx264`, `-preset slow`, `-crf` buscado de 27 para arriba hasta entrar en 1–2 MB), `yuv420p`, `-movflags
   +faststart`, `-an`. Si para entrar hay que pasar de CRF ~30, se baja la resolución (1280 × 800) en vez de la calidad. Póster: el
   primer cuadro en WebP (`libwebp`, calidad ~80).
7. Salida en `public/portfolio/<slug>/`. Los cuadros crudos van a `~/.cache/b4-medicion/b1-portfolio/` (tope de 5 GB, ~100 MB por
   video) y se borran al codificar cada uno.

**Peso estimado** (se mide de verdad en B1.1):

| Medio | Por proyecto | Los tres |
|---|---:|---:|
| Video de escritorio (1440 × 900 o 1280 × 800, 11 s) | 1,2–2,2 MB | 3,6–6,6 MB |
| Video de teléfono (780 × 1688, 11 s) | 0,8–1,6 MB | 2,4–4,8 MB |
| Póster de escritorio / de teléfono (WebP) | 60–120 KB / 40–80 KB | ~0,3–0,6 MB |

Por visita se baja a lo sumo un video a la vez (el de la tira activa) y los pósters cuando el Portfolio está cerca.

**En pantalla**: el activo `muted playsInline loop`, `preload="auto"`; los inactivos sin `src` y `preload="none"`, con su póster
en escala de grises (la activa a color); nada se pide hasta que un IntersectionObserver con una pantalla de margen dice que la
sección está cerca; con `prefers-reduced-motion` no hay autoplay y queda el póster. Se pausa fuera de cuadro y con la pestaña oculta.
Los pósters van con dirección de arte (`<picture>` con `getImageProps`, el patrón de `Captura.tsx`): cada ancho baja sólo el suyo.
Elegir video de escritorio o de teléfono **no consulta el ancho en JS**: hay dos `<video>` y el CSS esconde uno; el código lee cuál
está a la vista.

### 5.7 Escena: noche, oscurecido, material, sonidos

- **Noche**: §5.3 (la gota + el arco; s76 lo afirma).
- **Oscurecido** (`?portfolio-dim=`, de 0 a 0,8; default propuesto 0,35, a calibrar con hasta tres valores): **en el lienzo**, sobre
  la exposición del render principal (`toneMappingExposure × (1 − dim · peso)`), perseguida por tiempo (~500 ms). Nadie más escribe la
  exposición en `/v3` (verificado). Un velo de DOM no sirve: taparía también el «?», que vive en el lienzo. Lo que se apaga con la
  exposición también apaga un poco el título 3D «Portfolio»: se mide su contraste con el default.
- **Material del panel** (`?portfolio-panel=tinta|vidrio`): `tinta` (default) es un panel sólido; `vidrio` es el vidrio del sistema
  (el `bg-white` al 4 %, desenfoque de 20 px, saturación 180 % y borde blanco al 8 % de `CLAUDE.md`). Se mide si `vidrio` le cuesta
  cuadros al lienzo con el banco (sin vsync, la lección de A4b: con vsync todo da 75); si cuesta, queda sólo atrás de la bandera. La
  tira de «la tuya» no lleva desenfoque en ninguna de las dos (taparía el «?»). Qué color es «tinta»: §9.
- **Sonidos**: `sonar('tic')` al cambiar de proyecto (por scroll, hover, clic o teclado; uno por cambio) y `sonar('pestillo')` al
  abrir la ficha. Mute respetado por el bus.
- **Banderas** (todas por la URL, leídas después de montar, como las de la escena): `?portfolio-lado=der` (default) | `izq`;
  `?portfolio-dim=`; `?portfolio-panel=tinta` (default) | `vidrio`; `?portfolio-camara=a|b|c` (sólo para calibrar).

### 5.8 Deep links y saltos

- **Las anclas**: `#portfolio-el-garage`, `#portfolio-esquina-estudio`, `#portfolio-banu-scents`, `#portfolio-la-tuya` (no chocan
  con ningún `id` de hoy). Cuatro elementos posicionados en la sección, en el medio del paso de portada de cada proyecto (sin JS, el
  salto nativo cae en ese paso).
- **El destino exacto** lo calcula una función pura (`pasos.ts`): scroll = tope de la sección en el layout − una pantalla + el
  centro del paso en pantallas. Se mide en el layout (`motion/enReposo.ts`, la lección de A-ter: nada de `getBoundingClientRect`
  con sticky y transformadas).
- **Al cargar con hash** el navegador salta al elemento y el Portfolio corrige al píxel. **Un enlace interno** a una de las anclas:
  los de la barra, el menú y el pie viajan con el sistema de viajes (cuatro subnudos nuevos en `destinosDelViaje.ts`, como el de
  Demos); los demás (B2) los toma el Portfolio con un escucha delegado. El nudo de Trabajos (el ítem «Portfolio» del menú) pasa a
  ser El Garage en portada (ver §9).
- **El salto** (hover con intención de 150 ms quieto sobre un lomo, clic en un lomo, tap en las historias): `lenis.scrollTo` al
  centro del paso, con duración por distancia y tope. La instancia no se publica hoy (`ScrollSuaveDeV3` la guarda en una `ref`):
  se anota en `_lib/lenisDelSitio.ts`. Sin Lenis (abajo de 1025) va por el viaje sin Lenis; con movimiento reducido, instantáneo.
  Mientras un salto vuela, los bordes que cruza no disparan nada: el estado va derecho al destino. Nada de `router.push`.
- **El hover** sólo con puntero fino (`(hover: hover) and (pointer: fine)`): en táctil, el clic.

### 5.9 Teclado y accesibilidad — y las dos ramas

- El patrón de pestañas: los lomos son `role="tab"` con `aria-selected` y `aria-controls`, el acordeón `role="tablist"`, cada tira
  `role="tabpanel"`; foco itinerante (una sola parada de Tab en la lista). ←/→ y ↑/↓ (sólo con el foco adentro) cambian de proyecto
  y saltan a su portada; Enter abre y cierra la ficha; Esc vuelve a la portada. Foco visible con los tokens del sitio.
- En la tira activa: «Visitar sitio ↗» (`target="_blank" rel="noopener noreferrer"`, con «se abre en una pestaña nueva» en el nombre
  accesible; la flecha es decoración) es la parada de teclado; el video lleva el mismo enlace sólo para el mouse (fuera del orden de
  Tab, para no duplicar paradas). En «la tuya», el botón con `data-abre-contacto="panel"`: abre la hoja de contacto de siempre
  (`_chrome/contacto/apertura.ts`), no otra.
- Un foco que entra al acordeón con la sección fuera de su paso trae la página al paso (como hace hoy Demos).
- **Las dos ramas**: `s10-acceso` exige el mismo texto anunciado y el mismo árbol de encabezados en la rama animada y en la quieta,
  y lleva el censo de paradas de cada una (con un delta por sección). El escenario del Portfolio **es el mismo componente en las dos**: su estado lo maneja el scroll medido, no
  el progreso de P7, así que funciona sin coreografía (con movimiento reducido las transiciones son instantáneas y no hay autoplay). La
  rama quieta sólo cambia Demos (`DemosQuietos`, como hoy). El pin del escenario, en todo ancho y en las dos ramas (en el
  componente; `secciones.ts` no cambia).
- Contraste: los nombres de los lomos no van sobre el póster sin placa (banda sólida o velo), AA medido.

### 5.10 Mobile (<768): historias

El mismo mapa de pasos, el mismo estado, otro marcado: el escenario pegado es una historia a pantalla completa (el video de teléfono,
`object-fit: cover` porque se grabó a la proporción del teléfono), con cuatro barras arriba (una por proyecto y la final: llena hasta
la mitad en portada y entera en ficha). Tap en el tercio izquierdo → anterior; en el resto → siguiente (los dos son saltos de §5.8).
Deslizar hacia arriba es el scroll de la página: portada → ficha (una hoja que sube desde abajo) → siguiente. Ningún gesto propio que
pelee con el scroll. La última es «la tuya», con el «?» y el botón. El título «Portfolio» llega en la aproximación, como hoy, y queda
chico en la cabecera de la historia. Pruebas a 390 y 360. Tablet (768–1023): el layout de escritorio con el panel al 60 %.

### 5.11 El túnel al archivo

`src/app/v3/_archivo/tunel-portfolio/` (afuera de `_secciones`, así el padrón de `s5-archivos` no lo recorre), con un README de una
línea. Se mueven: `tunel.ts`, `CapaDelTunel.tsx`, `piezas.tsx`, `Proyecto.tsx`, `Captura.tsx`, `capturas.ts`, `soporte.ts`,
`asentamiento.ts`, `angosto.ts`, `ventana.ts`, `encimaDelCta.ts`, `regulador.ts`, `ritmo.ts`, `estiramiento.ts`, la mitad del túnel de
`geometria.ts`, y sus invariantes (`trabajos-*.ts`, `capturas-`, `movil-` y `ritmo-invariante`), con los imports relativos
reescritos para que compile (`tsc` lo incluye). Nadie de la página lo importa; los tests sí pueden.

Antes de mover, se sacan las cuatro cosas que siguen vivas: `FOCO_DE_LA_ESCENA_PX` (lo usa el contacto), el reloj del vacío (Demos),
`opacidadDeLaLlegada` y `recorteDeLaLlegada` (el título nuevo hace lo mismo en la llegada de un viaje) y lo de la noche de
`geometria.ts`.

Los tests: los que afirman cosas del CÓDIGO del túnel se mudan con él y siguen corriendo (un `test:archivo-tunel` en `verificar`);
los que afirman que la PÁGINA lo muestra se dan vuelta (la página ya no lo monta, con su control); los que miden la geometría con
el sentido nuevo, con el sentido nuevo. Ninguno se borra ni se afloja. Las clases arbitrarias del túnel siguen emitiéndose (Tailwind
escanea el archivo): sacarlas del escaneo es tocar `globals.css`, y queda para D7.

---

## 6. Choques con el código y desvíos de la spec

1. **«Hay un solo contexto WebGL en la página» ya es falso hoy.** `GraficoDeServicios` monta el enjambre de Servicios con su propio
   `WebGLRenderer` (`_lib/nanobots/enjambre.ts`) al montarse, o sea desde la carga. Propuesta del invariante: **el Portfolio no crea
   ningún contexto** (en el fuente: ni `<Canvas>`, ni `WebGLRenderer`, ni `getContext('webgl…')` en sus archivos; el «?» usa el
   renderer de la escena) y, en el navegador, la cantidad de contextos es la misma con y sin el Portfolio nuevo.
2. **Los invariantes nuevos empiezan en s76**: s74 (A-bis) y s75 (A-ter) existen.
3. **Demos vive adentro de Trabajos** (no es la sección siguiente). «Al terminar, la página sigue a Demos» se cumple dejando la cola
   de la sección al píxel (§5.3). Lo que cambia en Demos: llega con el scroll y no detrás del resorte del túnel.
4. **`test:s75-carga` es el invariante del detector**; el arnés del navegador es `scripts-carga/estres.ts`. Se extienden los dos.
5. **El copy «placeholder marcado»**: ver §9.
6. **Los sprints de ~2 h**: B1.1 (datos + 6 videos + archivo + alturas + capturas) y B1.2 no entran en dos horas cada uno. Propuesta
   en §8.

---

## 7. Riesgos

| Riesgo | Qué se hace |
|---|---|
| La migración de tests (32 archivos afuera + los de la carpeta) es el grueso de B1.1 y es donde se puede aflojar algo sin querer | Inventario por archivo antes de mover; cada afirmación se clasifica (se muda / se da vuelta / sentido nuevo); al final, la cuenta de afirmaciones por suite antes y después en el log |
| Un archivo movido con un import roto o un `leer('…')` viejo deja una suite «sin resumen» (se cayó, no pasó) | `verificar` completo al final de B1.1 y lectura de cada suite que no imprime su línea de «N afirmaciones» |
| El descuento por ancho con `innerHeight`: en el teléfono la barra hace que `innerHeight` no sea `100svh` | La escena ya mide así hoy; el descuento nuevo usa la sonda de 100svh de la época si la deriva se ve (medir a 390 con la barra) |
| `addAfterEffect` corre una vez por cuadro de todos los roots; el pase compartido (`PaseDeLaEscena`) copia el color dentro del render | El «?» va después de todo y no toca los objetivos de render; plan B: objeto de escena (§5.5) |
| El ancho de las tiras animado es layout por cuadro | Transiciones cortas, `will-change` en lo que se mueve, medir en el banco; si cuesta, `flex-grow` o transformada con contenido contra-escalado |
| `backdrop-filter` sobre el lienzo (`vidrio`) le puede costar cuadros a la escena | Banco sin vsync; si cuesta, queda sólo atrás de la bandera |
| Sitios de terceros: banners, popups, imágenes diferidas, animaciones por tiempo | CSS inyectado por sitio, pasada previa, tiempo virtual; si un sitio no deja grabar limpio, se reporta y se graba lo que se pueda con `recordVideo` |
| El salto por hover mueve la página sin que el visitante lo pida | Sólo con puntero fino, 150 ms quieto, y nunca durante un salto en vuelo |
| Memoria: build ~2 GB de heap (el primero falló sin `--max-old-space-size=4096`), dev ~3 GB | Un proceso pesado a la vez; menos de 3 GB libres → «VERIFICAR TRAS REINICIO» |
| Tailwind escanea todo (docs incluidos): una clase arbitraria deletreada en prosa rompe el build | Este plan las describe, no las escribe; lo mismo en los docblocks nuevos |

---

## 8. Sprints, verificación e invariantes nuevos

### Partición propuesta (las reglas de velocidad, iguales)

- **B1.1a · Datos y videos** (sin cambiar la página): `proyectos.ts`, el pedido y `CONTENIDO-PENDIENTE.md`; `scripts-portfolio/`;
  los 6 videos y los 6 pósters con su peso real. Commit `B1.1a: …`.
- **B1.1b · La base**: las capturas «antes» (con este build de medición); el túnel al archivo; la geometría nueva y el escenario
  provisorio (el título, la bajada y los cuatro nombres, sin acordeón); el descuento por ancho; el reloj de Demos; la ventana de las
  estrellas; los tests migrados; s76 (mapeo, noche, pasos, anclas); las capturas «después». Commit `B1.1b: …`.
- **B1.2 · Escritorio y tablet**, tal cual la spec (si no entra en dos horas, se parte en el acordeón y los pasos / la escena, el
  «?» y las banderas) y **FRENO al final**: Valentino lo mira en :3000.
- **B1.3 · Mobile**, tal cual la spec.

Si se prefieren los tres sprints como están, se respeta el tope de 60 min por punto y lo que no converja va atrás de una bandera.

### Verificación al final de cada sprint (dev server apagado)

- Lint en los tocados; `.\node_modules\.bin\tsc.cmd --noEmit` (con `NODE_OPTIONS=--max-old-space-size=4096` si hace falta).
- `npm run verificar`: rojos sólo los 8 grupos de la base (s1, s2, s3, s4, s5, s7, s8, s17), ni uno más.
- Los invariantes del sprint, cada uno con su control positivo.
- visual-qa desktop + mobile del estado de reposo. La coreografía (entradas, transiciones, salida) la verifica Valentino con una
  grabación: no se da por buena.
- Banco con las reglas de siempre (Chrome con `--force_high_performance_gpu`, uno por tanda, cuadros crudos borrados, 5 GB de
  caché, disco y memoria).

### Invariantes nuevos (s76-portfolio y sus partes)

| Afirma | Cómo | Control positivo |
|---|---|---|
| El mapeo de la escena fuera del selector no cambió | puro, en los tres anchos, cada 10 px fuera de [pin, salida]: progreso nuevo = el de hoy (< 1e-9); y las capturas de B1.1 | sin el descuento (o con la tabla al alto real), se corre |
| El tramo del Portfolio es de noche | puro: el nivel con la gota disparada ≤ 0,04 en cada 10 px | sin la gota, la aproximación no es de noche |
| Cada deep link cae en su proyecto | puro (destino ∈ paso de portada, tres anchos) + arnés (carga con hash → proyecto y paso) | un mapa corrido en uno se ve |
| El teclado (←/→/↑/↓/Enter/Esc) | el reductor puro + los roles y `aria` del marcado | una tecla mal mapeada se ve |
| Sólo el video activo se reproduce | el marcado en cada estado: un solo `<video>` con `src` y autoplay | dos activos se ven |
| Los inactivos no se descargan antes de tiempo | marcado: sin `src`, `preload="none"`, nada antes de «cerca»; arnés: ningún pedido a `/portfolio/` antes de la sección | `preload="auto"` en un inactivo se ve |
| Con movimiento reducido no hay autoplay | el marcado con `reducido` | sin la condición, autoplay |
| El Portfolio no crea contextos WebGL | fuente + navegador (§6.1) | un archivo con un renderer se ve |
| Las dos ramas dicen lo mismo | s10-acceso con el delta del Portfolio (paradas, encabezados, texto anunciado) | el de siempre |
| La carga a prueba de todo, también acá | s75: `portfolio-desfasado` (el paso mostrado no es el del scroll), `portfolio-video` (más de uno o fuera de cuadro), `portfolio-ancla` (otro proyecto); el arnés con los cuatro hashes, el salto del menú a mitad de las historias a 390 y los textos del panel; 0 fallas | cada falla por su nombre y sola, como hoy |

---

## 9. Las decisiones de la aprobación (resueltas)

1. **«Tinta» = el negro de la marca**: el `bg-fondo` de la sección. `?portfolio-panel=tinta` (default) es ese panel sólido.
2. **El copy placeholder va en el pedido, sin marcador visible** (`prosa`, dueño Valentino, para C2): la descripción del Portfolio y
   el copy de «la próxima es la tuya». Lo que falta de los DATOS sí se ve (§11.2: con la llave apagada, su marcador).
3. **El reparto rubro / quéHicimos de §3, como está.**
4. **Estrellas, fugaces y la formación se apagan desde que entra el panel**: la ventana de `tunelEnLaEscena.ts` arranca en el pin.
5. **El ítem «Portfolio» del menú aterriza en El Garage en portada, con el panel adentro.**
6. **La partición: B1.1a / B1.1b / B1.2 (si no entra, se parte como dice §8) / B1.3.**

Y sobre los choques de §6: el invariante de contextos queda como se propuso, **«el Portfolio no agrega ninguno»**, y los
invariantes nuevos arrancan en **s76**.

---

## 10. Log de sprints

### Fase 0 · el plan (2026-10-17)

- Leído: la sección entera (componentes, túnel, geometría, ritmo, regulador, demos, gota), el contrato de la coreografía, el anclaje
  y el mapeo de la escena (`anclaje.ts`, `anclajeDerivacion.ts`, `recorrido.ts`, `tramoEstirado.ts`, `ataduraAlScroll.ts`), el arco y
  la noche disparada, la cámara de entonces, el rig, el sonido, el contacto, los viajes, el diagnóstico y el arnés de A-ter, y el
  mapa de tests (32 archivos afuera).
- Medido: la altura de cada sección en cinco anchos (§4.1) con el build de medición.
- Encontrado de paso (fuera de alcance, sin tocar): Servicios abre su propio contexto WebGL; Quiénes somos mide +33 px a 1440 y Tu
  panel 8,45 pantallas a 1024 × 768.
- Sin código. Frenado para la aprobación.

### B1.1a · datos y videos (2026-10-17)

**Hecho.**

- `src/app/v3/_secciones/trabajos/proyectos.ts`: el tipo estricto (`ProyectoDelPortfolio`, cero `any`) y los tres proyectos en el orden
  de la spec, con lo que dictó Valentino (§11.1) y sus palabras: rubro y qué hicimos (el reparto de §3), fecha («Marzo 2026»,
  «Junio 2026», «Abril 2026»), servicio («Desarrollo web», en el dato y sin mostrarse mientras los tres digan lo mismo:
  `seMuestraElServicio`, derivado y sin bandera), problemaCliente y el problemaResuelto de El Garage. `resultado: null` en los tres.
  Los medios salen del slug (`mediosDe`). Lo que falta (las tres reseñas y el problemaResuelto de Esquina y de Banú) queda `null`
  en B1.1a: entra por la llave en B1.1b (ver desvíos).
- `scripts-portfolio/`: `guiones.ts` (los recorridos de cada sitio en los dos dispositivos, en tiempo de página), `grabar.ts`
  (cuadros con tiempo virtual por CDP: Chrome del sistema con la placa de alto rendimiento, un Chrome por video y una página por
  tramo, CSS inyectado contra avisos de cookies y burbujas de chat, ningún clic ni formulario), `grabarEnVivo.ts` (el plan B con
  `recordVideo`, ajuste F) y `codificar.ts` (H.264 `libx264 -preset slow`, `yuv420p`, `+faststart`, sin audio, fundido de 0,3 s
  entre tramos, el CRF más bajo que entra en 2 MB y, si ni con 30 entra, la resolución reducida; póster WebP del primer cuadro;
  borra los cuadros crudos y escribe el recibo `docs/rediseno/entregas/b1-portfolio/medios.json`).
- Los seis videos y los seis pósters, en `public/portfolio/<slug>/{escritorio,movil}.{mp4,webp}`, a 2× (cada cuadro de salida,
  1/15 s de página):

| Medio | Método | Resolución | CRF | Duración | Video | Póster |
|---|---|---|---:|---:|---:|---:|
| El Garage · escritorio | tiempo virtual | 1280 × 800 (a 1440 no entraba: 2,96 MB con CRF 30) | 30 | 9,83 s | 1,94 MB | 30 KB |
| El Garage · teléfono | **`recordVideo`** | 780 × 1688 | 28 | 9,77 s | 1,73 MB | 17 KB |
| Esquina Estudio · escritorio | tiempo virtual | 1440 × 900 | 26 | 9,70 s | 1,91 MB | 25 KB |
| Esquina Estudio · teléfono | tiempo virtual | 690 × 1494 (a 780 no entraba: 2,13 MB con CRF 30) | 28 | 9,60 s | 1,97 MB | 21 KB |
| Banú Scents · escritorio | tiempo virtual | 1440 × 900 | 24 | 10,10 s | 1,97 MB | 41 KB |
| Banú Scents · teléfono | tiempo virtual | 780 × 1688 | 30 | 10,27 s | 1,84 MB | 51 KB |
| **Total** | | | | | **11,36 MB** | **185 KB** |

  Por visita se baja a lo sumo un video a la vez (el de la tira activa, B1.2).
- `s76-portfolio.invariant.tsx` (`test:s76-portfolio`, `test:s76`), 32 afirmaciones: los datos (orden, nombres reales, las URL del
  repo, el formato de la fecha, el servicio derivado con su control) y los medios (cada video y su póster existen, pesan lo que dice
  el recibo y entran en el techo; H.264 con `+faststart`, sin pista de audio, póster WebP, duración de 9,5 a 12,5 s; controles: un
  MP4 sin faststart y uno con audio se ven). `proyectos.ts` al padrón de `s5-archivos`.

**Desvíos y por qué.**

- **El Garage en el teléfono va con `recordVideo`** (ajuste F): con el tiempo virtual la captura del catálogo no volvía (tres
  corridas, cuadros 128, 72 y otra vez; con tope, reintento y avance de 16 ms tampoco). ~35 min, y se pasó al plan B: el mismo
  guion en tiempo real, recortado y acelerado a 2× con ffmpeg. Se ve bien en la hoja de cuadros; es el único de los seis.
- **Dos videos con la resolución reducida** para entrar en ~2 MB sin pasar de CRF 30: El Garage en escritorio (el grano fijo y
  el video de fondo de su portada) y Esquina en el teléfono (la grilla de colores de `/work`; además su recorrido es más corto que
  la grilla entera).
- **Duraciones de 9,6 a 10,3 s**: el borde de abajo de los «~10–12 s».
- **El contenido no entra a la página en B1.1a**: el PEDIDO, la llave para lo que falta, la excepción de la fecha y la tabla de
  contenido se suman en B1.1b, cuando la ficha se muestra. `s21-llave` exige que cada casilla de la llave llegue a la pantalla y
  el invariante de la sección que cada texto del contenido aparezca en el marcado: meterlos antes de que algo los muestre era
  sumar rojos.
- Errores del camino, arreglados: el `scroll-behavior: smooth` de El Garage (Lenis) se comía el `scrollTo` en tiempo virtual (829
  px de desvío; ahora `behavior: 'instant'`, desvío 0); la sesión CDP nueva no heredaba la escala 2 del teléfono (el primer cuadro
  de cada tramo salía a 390 × 844; ahora se emula antes del primer cuadro); el borrador del plan decía 1/60 s por cuadro (0,5×),
  corregido a 1/15.

**Verificación.** Lint de los tocados limpio; `tsc --noEmit` sin errores; `test:s76-portfolio` 32 afirmaciones, 0 fallas;
`npm run verificar`: 83 pasos, rojos sólo los 8 grupos de la base (s1, s2, s3, s4, s5, s7, s8, s17), ni uno más;
adentro de s5 fallan `s5-compacto` (Quiénes somos, de antes) y `s5-peso` (pide el build), los de siempre, y `s5-codigo` (el
padrón que se tocó) está en verde; s76 en verde. Sin dev server propio (el de Valentino en :3000 no se tocó).

### B1.1b · la base (2026-10-17)

**Hecho.**

- **El túnel al archivo** (`src/app/v3/_archivo/tunel-portfolio/`, con un README de una línea): `tunel.ts`, `CapaDelTunel.tsx`,
  `piezas.tsx`, `Proyecto.tsx`, `Captura.tsx`, `capturas.ts`, `soporte.ts`, `asentamiento.ts`, `angosto.ts`, `ventana.ts`,
  `encimaDelCta.ts`, `regulador.ts`, `ritmo.ts`, `estiramiento.ts`, `trabajos-tipeo.ts` y las partes de su invariante, más copias
  congeladas de lo que la sección reescribió (`Trabajos.tsx`, `geometria.ts`, `contenido.ts`) para que el archivo compile y se pruebe
  solo, y `entradaDelTunel.ts` (`escalaDeDemos`, la fracción del vacío que el túnel dibujaba). Nadie de la página lo importa; sus
  tests sí. El invariante de Trabajos de antes se mudó entero (`tunel.invariant.tsx`, `test:s76-archivo-tunel`) y sigue afirmando
  el código archivado: 320 afirmaciones (las 399 de antes menos §25 Demos y §27 el carrusel, que siguen vivos en la sección).
- **La sección nueva** (`Trabajos.tsx`): la tabla no cambia; la sección suma los pasos del selector en CSS y desde el servidor
  (`--pantallas-extra-del-portfolio`); el escenario del Portfolio se pega en todo ancho y en las dos ramas; las cuatro anclas
  (`#portfolio-el-garage`, `-esquina-estudio`, `-banu-scents`, `-la-tuya`) en su lugar derivado; con coreografía Demos llega adentro
  del escenario con el reloj de la cola; sin ella, después y quieto.
- **`portfolio/`**: `pasos.ts` (todo derivado de `PANTALLAS_POR_PASO` = 0,75: el alto, los `k` por ancho, las anclas, la
  histéresis de 30 px, el reloj de Demos), `estado.ts` (la vista de cada paso y el teclado), `usePortfolio.ts` (el scroll medido,
  el paso, las banderas por `useSyncExternalStore`, la anotación a la escena, el salto y el ancla al cargar), `tramoDelSelector.ts`
  (la REGLA DE ALTURAS), `banderas.ts`, `saltar.ts`, `anclas.ts`, `medios.ts`, `tipografia.ts`, y los componentes: el escenario,
  el encabezado (el cartel sin la huida, con los mismos nombres), el acordeón (el patrón de la WAI: cabecera con `aria-expanded` en
  un `h3` y región nombrada; la activa ancha, las otras lomos con el nombre girado sobre el póster en grises), la tira, la ficha,
  el medio (en B1.1b, el póster) y «la tuya» (el hueco del «?» y el botón a la hoja de contacto de siempre).
- **El contenido**: `CONTENIDO.proyectos` sale de `proyectos.ts`; los rótulos de la ficha; «la tuya» con la frase y el botón que
  dictó el dueño para el CTA del túnel; `cta.direccion` y las capturas se fueron (el archivo guarda su copia). **Lo que falta va
  por la llave** (8 casillas en `INVENTOS`: los dos `problemaResuelto` y las tres reseñas con su firma; relleno que se lee como
  relleno con la llave prendida, `[TEXTO]`, `[TESTIMONIO] · pendiente` y `[NOMBRE]` apagada) y **al `PEDIDO`** (10 entradas, todas de
  Valentino: las 8 y las dos de prosa sin marcador para C2). La llave sigue apagada. **La fecha**: el año ya estaba en
  `NUMEROS_PERMITIDOS` (el pie), se le sumó el motivo del Portfolio; y el detector de dígitos del contenido (`LISTA_BLANCA_DE_CIFRAS`)
  recibió las tres fechas exactas, cada una con su motivo, con `s5-contenido` atándolas a las de `proyectos.ts`.
- **La escena**: el selector se le anota como tramo estirado con el `k` de su ancho (la sección no consulta el ancho: lo escribe el
  CSS en `--ancho-del-portfolio`); `sinElEstiramiento` vale también para comprimir (`k < 1`, el paso de 0,6 en el teléfono); la
  ventana donde no se dibujan estrellas, fugaces ni la formación arranca en el pin (p 0,475; era 0,51143, el arranque del túnel).
- **Demos sin el túnel**: el reloj del vacío en `demos/relojDeDemos.ts` (los mismos números), lo que heredó del túnel en
  `demos/herencia.ts` (el velo de la ventana y las dos clases de su texto), el foco que la trae al cuadro contado en la sección nueva.
- **Los viajes**: el ítem «Portfolio» del menú aterriza en El Garage en portada (el ancla de su paso) y cada deep link tiene su
  subnudo (`destinosDelViaje.ts`). La instancia de Lenis se anota en `_lib/lenisDelSitio.ts` (una línea en `ScrollSuaveDeV3`).
- **La placa del contacto** importa el foco de la escena de la geometría viva.

**Los tests, contados (ajuste E).** Afirmaciones por invariante, antes (el `verificar` de B1.1a) y después:

| Invariante | Antes | Después | Δ |
|---|---:|---:|---:|
| `test:s21-llave` | 73 | 83 | +10 |
| `test:s27-viajes` | 54 | 55 | +1 |
| `test:s47-pasada-final` | 157 | 158 | +1 |
| `test:s5-contenido` | 59 | 63 | +4 |
| `test:s5-trabajos` | 399 | 214 | -185 |
| `test:s7-arboles` | 48 | 50 | +2 |
| `test:s7-pedido` | 47 | 57 | +10 |
| `test:s76-archivo-tunel` | — | 320 |  |
| `test:s76-portfolio` | 32 | 74 | +42 |
| `test:s8-chrome` | 36 (FALLA) | 37 (FALLA) | +1 |

Total: 6.721 → 6.927 afirmaciones (+206); 158 → 159 invariantes (las suites que no cambiaron de cuenta no figuran).

- **La única que baja es `s5-trabajos` (399 → 214), y no pierde nada**: 320 se mudaron tal cual a `test:s76-archivo-tunel` (el
  invariante de antes contra el código archivado), las 79 de §25 (Demos, 44) y §27 (abajo de 1024, 35) siguen en `s5-trabajos`, y
  la sección nueva suma 135 (§1–§17: el puente y la noche, el alto, el contenido y su pedido, los nombres, la ficha completa en el
  marcado, cero three y cero contextos, el acento, la higiene, los encabezados, las paradas y el selector).
- **Con el sentido nuevo y la misma cuenta**: `s10-acceso` (los deltas del Portfolio: paradas +1, encabezados +1, marcadores +8, las
  ocho casillas de la llave; las tiras no son `region`, así que los puntos de referencia siguen en 12), `s30-escena4` (la ventana de la
  escena desde el pin), `s36`, `s41`, `s48`, `s51` (el título del encabezado y el destino del menú: El Garage en portada), `s49`,
  `s50` (Demos con su reloj, contra el túnel archivado), `s61`, `s62`, `s42` (re-apuntados al archivo o al encabezado), `s5-compacto` y
  `s5-tokens` (los componentes nuevos con los tokens del tema), `s47` (el recorte, del escenario) y `movil-invariante` (el pin, del
  escenario). Ninguna se aflojó: donde un literal cambió de archivo se afirma el mismo literal; donde cambió el sentido, se afirma el
  nuevo con su control.

**Desvíos y por qué.**

- **El invariante de antes se mudó ENTERO al archivo** en vez de repartir afirmación por afirmación: sigue afirmando lo mismo sobre
  el código archivado (que es lo que el plan pedía para «lo que afirma el código del túnel»), y la sección nueva tiene el suyo. Las
  afirmaciones que el inventario de tests clasificó como «la página lo muestra» quedaron como afirmaciones del archivo (el túnel se
  sigue montando ahí, en su `Trabajos.tsx` congelado) y, donde el sentido seguía vivo, con el sentido nuevo en el test de afuera.
- **Dos escáneres de cifras, no uno**: la excepción de la fecha va en `NUMEROS_PERMITIDOS` (el texto renderizado; el año ya estaba)
  y en `LISTA_BLANCA_DE_CIFRAS` (el contenido, por texto exacto). `s5-contenido` tenía un tope de una excepción: pasa a «la del hero
  y las fechas del Portfolio», y afirma que las de Trabajos son exactamente las de `proyectos.ts`.
- **Las capturas de control «antes» y «después» quedan para cuando haya memoria**: con el dev server de Valentino en :3000 (1,8 GB)
  quedaban 2,6 GB libres, debajo de los 3 GB que piden las reglas para el banco. El build «antes» (`.next-probe`) sigue en disco y no
  se pisa: las capturas se pueden sacar después. En su lugar, el mapeo de la escena afuera del selector está afirmado puro en los tres
  anchos, con los tres pasos y dos altos de ventana (desvío 0).

**Verificación.** Lint de los tocados limpio (los cuatro avisos de variables sin usar de s10, s47 y s48 ya estaban); `tsc --noEmit` sin errores;
`npm run verificar` completo: además de los 8 grupos de la base salió rojo `s10-acceso` (los deltas del Portfolio), y adentro de s5,
s7 y s8 salieron `s5-tokens`, `s7-arboles`, `s5-compacto` (el servicio y el resultado no llegaban al marcado) y `s8-chrome` (los
subdestinos nuevos). Se arreglaron (los tokens del tema, el §4 de s7-arboles con su sentido nuevo, las filas ocultas, los subdestinos
en el marcado renderizado de Trabajos) y se volvieron a correr los agregados s5, s7, s8, s10, s21, s47 y s76: rojos sólo los de la
base y con la misma cuenta (s5-compacto 1, s5-peso 8, s7-compuerta 18, s8-montaje 2, s8-tres 11, s8-chrome 2, s8-peso 14); s10, s21,
s47 y s76 (394 afirmaciones: el Portfolio y el archivo) en verde. La llave se probó prendida en un render aparte (cinco rellenos y tres
firmas de relleno, cero marcadores) y quedó apagada. Sin dev server propio (el de Valentino en :3000 no se tocó). **Pendientes para el
banco** (memoria: 2,6 GB libres): las capturas de control «antes/después» y visual-qa del reposo; van al cierre de B1.2 si hay
memoria, si no «VERIFICAR TRAS REINICIO».

---

## 11. Ajustes de la aprobación (2026-10-17)

Mandan sobre el resto del plan donde lo contradigan. Las decisiones de la §9 ya están escritas en su lugar.

### 11.1 Los datos de la ficha (dictados por Valentino; sus palabras, sin adornar)

| Campo | El Garage | Esquina Estudio | Banú Scents |
|---|---|---|---|
| rubro / quéHicimos | el reparto de §3 | ídem | ídem |
| servicio | «Desarrollo web» | «Desarrollo web» | «Desarrollo web» |
| fecha | «Marzo 2026» | «Junio 2026» | «Abril 2026» |
| problemaCliente | «No tenía catálogo: los autos se le perdían entre las publicaciones de Facebook.» | «No tenían presencia digital.» | «No tenían presencia digital.» |
| problemaResuelto | «Con la página tienen todo ordenado.» | **falta** (llave) | **falta** (llave) |
| resultado | `null`, no se muestra | ídem | ídem |
| reseña | **falta** (llave; Valentino las pide) | ídem | ídem |

- **El servicio va en el dato y la ficha no lo muestra mientras los tres digan lo mismo.** Se deriva, sin bandera: cuando haya
  variedad, aparece (una función pura en `pasos.ts` o en la ficha: «el campo se muestra si hay más de un valor distinto»).
- **La fecha** con el formato «Marzo 2026». El año ya está en `NUMEROS_PERMITIDOS` (por la línea legal del pie): se le suma el
  motivo del Portfolio a esa entrada, y el detector de dígitos del contenido (`LISTA_BLANCA_DE_CIFRAS`, `marcadores.ts`) recibe las
  tres fechas exactas, cada una con su motivo.
- **Lo que falta** (las tres reseñas y el `problemaResuelto` de Esquina y de Banú) **va por la llave `CONTENIDO_INVENTADO`**: una
  casilla de `INVENTOS` por hueco, con la llave prendida un texto de relleno (para que el diseño se vea completo) y apagada su
  marcador visible (`[TEXTO]`, `[TESTIMONIO] · pendiente`). El relleno se escribe **como relleno** («Texto de relleno: …»), nunca
  como una reseña verosímil atribuida a un cliente real: la llave lo esconde del build, pero no lo vuelve verdad. Cada hueco entra al
  `PEDIDO` con su dueño (Valentino). `s21-llave` y el censo de casillas (`s10-acceso-censo`) se ajustan sin aflojarlos: §5 de s21
  hoy afirma que cada casilla llega a la pantalla **con su mentira**, lo que con la llave apagada no puede pasar; pasa a afirmar que
  llega con **la cara de la llave que está puesta** (prendida: la mentira; apagada: el pedido, contado por ocurrencias, una por
  casilla), con control positivo; el censo suma su delta del Portfolio con la cifra exacta.
- La llave sigue **apagada** en el árbol (el build falla con ella prendida). Para ver el diseño completo se prende a mano en
  `llave.ts`, sin commitear.

### 11.2 A · El paso: 0,75 pantallas por defecto, calibrable

`PANTALLAS_POR_PASO` pasa a **0,75** por defecto, con `?portfolio-paso=1|0.75|0.6` para calibrar en B1.2. **Todo se deriva de esa
constante**: la altura de la sección, los `k` por ancho y las anclas. s76 lo afirma con los tres valores.

| Paso | Los siete pasos (px de la regla) | Alto de la sección | k desde 1024 | k tablet | k teléfono |
|---:|---:|---:|---:|---:|---:|
| 1 | 6.300 | 1125,67svh | 2,11268 | 1,69264 | 1,41192 |
| **0,75** | **4.725** | **950,67svh** | **1,58451** | **1,26948** | **1,05894** |
| 0,6 | 3.780 | 845,67svh | 1,26761 | 1,01558 | 0,84715 |

Con 0,75 la sección crece +62,11svh desde 1024, +111,45 en tablet y +29,23 en el teléfono. Con 0,6 en el teléfono `k` queda **por
debajo de 1** (el selector mide menos de lo que la escena veía): el descuento tiene que valer para comprimir, no sólo para estirar, y
s76 lo afirma con ese caso. El mapa de pasos de §5.3 se lee con 675 px de la regla por paso en lugar de 900 (pin en 900, El Garage
900 → 2.250, …, la tuya 4.950 → 5.625, la cola 5.625 → 8.556).

### 11.3 B · El oscurecido, medido capa por capa antes de elegir

Antes de elegir la exposición, verificar que llega a **todas** las capas: con `NoToneMapping`, o con un `ShaderMaterial` sin el
tramo de tone mapping, la exposición no le hace nada (al domo, al plasma, al cristal). Se mide la luminancia media por capa (domo,
piso, cristal, plasma, logo, título), apagando las demás, con dim 0 y con 0,35. **Si alguna no baja, el oscurecido va como
multiplicador en el pase final compartido** y el «?» se dibuja después, sin oscurecer.

### 11.4 C · Demos sin el resorte del túnel

Que Demos llegue con el scroll y no detrás del resorte del túnel es un **cambio visible**. Va en la lista del FRENO de B1.2, con un
antes y un después (grabación o tira de cuadros de la llegada).

### 11.5 D · Las derivas ajenas

Quiénes somos (+33 px a 1440) y Tu panel (8,45 pantallas a 1024 × 768) **no se tocan**: quedan anotadas como pendientes para **D6**.

### 11.6 E · Los tests, contados

En el log de B1.1b va la **tabla de afirmaciones por suite, antes y después**. Cada suite que baje se explica afirmación por
afirmación.

### 11.7 F · Los videos, con tope

Si el tiempo virtual por CDP no graba limpio en algún sitio en ~30 min, se usa `recordVideo` y se sigue. El sprint no se gasta ahí.
