# SPRINT B1 · PORTFOLIO — selector lateral

Rama `rediseno/home`. Base: `52d38204` (cierre de A-ter). Fuente de verdad del sprint: este archivo (el plan arriba, el log de
cada sprint al final).

**Objetivo.** Reemplazar el túnel del Portfolio de `/v3` por un selector lateral de proyectos: un acordeón de tiras verticales en
escritorio y tablet, historias tipo Instagram en el teléfono. Videos reales de los sitios, una ficha por proyecto, deep links y la
escena oscurecida, **sin cambiar lo que se ve en el resto de la página**.

**Estado: B1.1a, B1.1b, B1.2, B1.2b (§12), B1.2c y B1.3 (§13) y B1.2d A (el scroll, la secuencia y la barra, §14) hechos; FRENADO al
final de B1.2d A para que Valentino lo mire en :3000 (2026-10-18); B1.2d B espera su «seguí».** El plan fue
aprobado con ajustes: las decisiones de la §9 están escritas en su lugar y los ajustes van en la §11, que **manda sobre el resto del
plan** donde lo contradiga (el paso de 0,75 pantallas, los datos dictados, la llave para lo que falta, el oscurecido medido por capa).
El log de cada sprint, en la §10 (el de B1.2d, en la §14.3); la lista del FRENO, al final del log de B1.2d A. Lo que no pudo correr por memoria está marcado
«VERIFICAR TRAS REINICIO». El build de medición «antes» (`.next-probe`, ignorado por git, BUILD_ID `lcERRvtvbJDOVlh4Me-6P`) sigue en
disco para las capturas de control.

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

**Logo de Banú (la marca de agua de su tira)**: faltaba (el único del sitio trae un degradé pegado) y Banú llevaba su nombre como marca de
agua hasta tenerlo. **Resuelto el 2026-10-17**: Valentino pasó `scripts-portfolio/fuentes/banu-logo-oscuro.png`; sus letras, recortadas y
vectorizadas, son `public/portfolio/banu-scents/logo.svg` (B1.2b, aprobado por él).

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

### B1.2 · escritorio y tablet (2026-10-17) — FRENADO para que Valentino lo mire en :3000

**Hecho.**

- **El acordeón vivo** (`portfolio/Acordeon.tsx`): el clic en un lomo, el hover con intención (150 ms quieto, sólo con puntero fino:
  en táctil, el clic), el teclado (←/→ y ↑/↓ cambian de tira y mueven el foco, Enter abre y cierra la ficha de la activa, Esc vuelve
  a la portada) y un foco de teclado que entra al panel con el panel afuera: todo es un SALTO de la página al centro del paso
  (`saltar.ts`: `lenis.scrollTo` con duración por distancia; sin Lenis, el viaje sin Lenis; con movimiento reducido, instantáneo) y
  el estado lo sigue; mientras vuela, los bordes del camino no disparan nada. Suena `tic` al cambiar de proyecto y `pestillo` al
  abrir la ficha (el bus respeta el mute; no suena al cargar).
- **Los videos** (`MedioDeLaTira.tsx`): `muted playsInline loop`; sólo el de la tira activa tiene `src` y `preload="auto"`, y sólo
  con la sección a una pantalla o menos (`cerca`, un IntersectionObserver; una vez cerca queda); los demás nada y `preload="none"`;
  los lomos muestran el póster del teléfono en grises (también sólo cerca); se pausa fuera de cuadro y con la pestaña oculta; con
  movimiento reducido no hay autoplay (el póster). En el servidor no sale un solo póster del Portfolio.
- **La escena** (`_lib/escena/portfolioEnLaEscena.ts`, un objeto que escribe la sección y lee el lazo): **la pose del logo** se
  mezcla en el rig (`OrbitRig`, una línea después de muestrear la del scroll y antes de la inercia) con un peso que persigue al panel
  en 0,7 s: un desplazamiento sobre la pose, el progreso no se toca (la regla de B5). Las poses se calibraron puras con el arnés de la
  caja del logo (`conPose` + `cajaDelLogo`): `a` (producto) deja el logo en x 0,10–0,35 e y 0,60–0,90 del cuadro a 1440 × 900; `b`
  con el azimut de Trabajos (la entrada más corta); `c` con el logo más chico; y con el cuadro vertical (la tablet parada) una pose
  propia, porque la apaisada lo metía debajo del panel. **El oscurecido** (ajuste B): la exposición del render NO llega a todas las
  capas (estrellas, haces, cielo, filo, plano de la luz y tarjeta van con `toneMapped: false`; el plasma hace su propio tono), así
  que va como un cuadro a pantalla completa que multiplica el color por `1 − dim · peso`, último del cuadro (`OscurecidoDelPortfolio`).
  **El «?»** (`SignoDeLaTuya`): un tubo a lo largo del trazo del signo y el punto, satinado (`MeshPhysicalMaterial` con `sheen`),
  girando despacio, con escena, cámara y luces propias, dibujado DESPUÉS del render (`addAfterEffect`) con scissor en el rectángulo
  del hueco de la tira (sin oscurecer, sin un contexto nuevo). El hueco deja ver el lienzo: el fondo va por tira y la de «la tuya»
  pinta todo lo demás con una sombra del color de fondo alrededor del hueco transparente.
- **El diagnóstico de la carga**: la falla del túnel (`tunel-desfasado`) pasó a tres del Portfolio —`portfolio-desfasado` (el paso
  mostrado no es el que pide el scroll, sin un salto en vuelo), `portfolio-video` (más de uno, o alguno fuera de cuadro) y
  `portfolio-ancla` (cargó con un deep link y muestra otra tira)— que publica `publicar.ts`; el arnés de estrés entra también por los
  cuatro deep links.
- **s76** (101 afirmaciones): los videos (uno solo, nada antes de estar cerca, sin autoplay con movimiento reducido), cero contextos
  propios, la pose (con el peso en 0 la del scroll bit a bit, en 1 la del Portfolio por el camino corto, el espejo, la vertical, el
  peso en 0,7 s y de una con movimiento reducido), el oscurecido (las capas sin tono, el multiplicador, el montaje antes del pase que
  sigue último), el hover, los sonidos y las banderas. **s75-carga** 53 (las tres fallas nuevas, cada una con su control).

**Las banderas y sus defaults.** `?portfolio-lado=der` (default) | `izq` · `?portfolio-panel=tinta` (default: el negro de la marca)
| `vidrio` · `?portfolio-dim=` de 0 a 0,8 (default **0,35**) · `?portfolio-paso=1` | `0.75` (default) | `0.6` · `?portfolio-camara=a`
(default) | `b` | `c`.

**Desvíos y por qué.**

- **El oscurecido no es la exposición** (ajuste B, verificado en el código): con la exposición no se habrían oscurecido las estrellas,
  los haces, el cielo ni el filo. Va como multiplicador del cuadro y el «?» después. La medición de la luminancia por capa en el
  navegador (dim 0 contra 0,35) quedó para el banco (memoria).
- **El «?» no sale de la fuente de los títulos**: es un tubo a lo largo de su trazo y una esfera. Evita depender de que el subconjunto
  de la fuente 3D tenga el glifo, y se lee como un objeto satinado.
- **Con `vidrio`, la tira de «la tuya» va opaca** (el negro de la marca): sin desenfoque en esa tira (la spec) y es el color con el que
  la escena limpia el hueco.
- **El contenido de las tiras cerradas va oculto (`hidden`) y no es `region`**: así el documento no suma cuatro puntos de referencia
  y un lector de pantalla recorre las tiras por sus cabeceras.
- **Abajo de 768 el escenario todavía es el de escritorio** (el panel al 60 %): las historias son B1.3.
- **Sin banco en todo B1.2**: con el dev server de Valentino en :3000 la máquina quedó entre 1,9 y 2,6 GB libres (las reglas piden 3).
  No corrieron: visual-qa, las capturas de control antes/después, el costo del vidrio en cuadros, el antes/después de la llegada de
  Demos, la luminancia por capa ni el arnés de la carga. Lo único que se miró del sitio fue un pedido HTTP a `/v3` en el servidor de
  Valentino (200, el escenario del Portfolio y sus anclas en el marcado del servidor). **VERIFICAR TRAS REINICIO.**

**Verificación.** Lint de los tocados limpio; `tsc --noEmit` sin errores; `npm run verificar`: rojos sólo los 8 grupos de la base (s1, s2, s3,
s4, s5, s7, s8, s17). Adentro salió una falla nueva en `s5-codigo`, un falso positivo del detector de `hover:` sin `focus-visible:`
(leía la consulta de medios del puntero fino del acordeón): la constante pasó al módulo puro (`estado.ts`) y el agregado s5 quedó con
sus dos rojos de la base y la misma cuenta (s5-compacto 1, s5-peso 8). El resto de los invariantes con falla, idénticos a la base.
s76 en verde (101 del Portfolio y 320 del archivo), s75-carga 53. Banco y visual-qa: no (memoria, ver arriba).

**FRENO — lo que Valentino mira en :3000** (el dev server que ya está corriendo; si no tomó los cambios, recargar):

1. `http://localhost:3000/v3` y bajar hasta Portfolio: el título llega como siempre; con el pin entra el panel desde la derecha con El
   Garage; el video arranca solo; el logo va abajo a la izquierda y la sala se oscurece. Scroll: El Garage portada → ficha (el video se
   achica arriba, la ficha abajo, `pestillo`) → Esquina (`tic`) → … → Banú → «la próxima es la tuya» (el «?» girando, el botón abre la
   hoja de contacto de siempre). Al seguir bajando el panel se retrae y llegan las Demos.
2. **Demos sin el resorte del túnel** (ajuste C, cambio visible): antes Demos llegaba detrás del resorte del túnel; ahora con el
   scroll y su propia persecución de 1,8 s. Comparar con la memoria del túnel (el antes/después grabado queda para el banco).
3. Subir desde Demos: el panel vuelve con «la tuya» activa.
4. Hover sobre un lomo (150 ms) y clic: salta a su portada. Teclado: Tab hasta una cabecera, ←/→, Enter (ficha), Esc.
5. Deep links (recargar con cada uno): `/v3#portfolio-el-garage`, `#portfolio-esquina-estudio`, `#portfolio-banu-scents`,
   `#portfolio-la-tuya`. Y el ítem «Portfolio» del menú: tiene que aterrizar en El Garage en portada.
6. Banderas: `?portfolio-lado=izq`, `?portfolio-panel=vidrio`, `?portfolio-dim=0` / `0.35` / `0.6`, `?portfolio-camara=b` / `c`,
   `?portfolio-paso=1` / `0.6`.
7. Tablet (820 × 1180 o la ventana angosta): el panel al 60 % y el logo con la pose vertical.
8. La ficha con la llave apagada muestra `[TEXTO]`, `[TESTIMONIO] · pendiente` y `[NOMBRE]`; para ver el relleno, prender a mano
   `CONTENIDO_INVENTADO` en `src/app/v3/_secciones/_contrato/llave.ts` (sin commitear: el build falla con la llave prendida).

### B1.2b · los ajustes del FRENO de B1.2 (2026-10-17) — FRENADO para que Valentino lo mire en :3000

El pedido y cómo se resolvió cada punto, en la §12. Acá lo hecho, lo medido y lo que hay que mirar. Commits: `41f91e58` (1/2: el código
y los tests), `92a01b2c` (2/3: el logo de Banú, el gancho del oscurecido y la entrada del panel en el arnés) y el 3/3 (los tres
arreglos que encontró el banco, este log). Tres y no dos: el 1/2 no estaba hecho al volver del reinicio y la memoria cortó en el medio.

**Hecho.**

- **Sin banderas** (punto 0): `banderas.ts` se borró con sus lectores; el oscurecido es `DIM_DEL_PORTFOLIO` (0,35), el panel es de vidrio
  y del lado derecho, y hay una sola pose. Los tests que afirmaban las banderas afirman ahora que nadie lee la consulta y que las
  constantes valen lo pedido (s76 §11, con su control).
- **La cámara y la composición** (punto 1): `_lib/escena/poseDelPortfolio.ts`. La cámara del pin (la viva: 177,4°, que el rig
  muestrea como la de entonces), alejada y con el encuadre corrido, resuelta por cuadro (el encuadre depende del aspecto y del campo
  de la banda): ni gira ni cambia la dirección de la mirada. El título 3D se coloca con ESA pose (`LECTURA.portfolio`). La columna de
  la izquierda se parte en dos: el encabezado centrado arriba, el logo centrado abajo, en el mismo eje.
- **El vidrio con la estructura de la tinta** (punto 2): una sola estructura; el vidrio del sistema va en el panel y las tiras no
  llevan fondo propio.
- **El título** (punto 3): la presencia del encabezado va por tiempo con el panel adentro (ya pegado); el título 3D llega en su lugar
  y se va con la caída de `levanta` (`saleCayendo`); la bajada sube y cae por sus líneas.
- **«La tuya»** (punto 4): `SignoDeLaTuya` y su pase se borraron; el «?» es un SVG propio con la cinta del logo, de marca de agua; el
  título en `titulo-xl` (aprobado por Valentino) y el CTA, un botón grande con el mismo `data-abre-contacto="panel"`.
- **Un gatillo por proyecto** (punto 5): un paso de 1,5 pantallas por proyecto y uno para «la tuya» (la sección, 1025,67svh); la
  secuencia por tiempo (`secuencia.ts`); las marcas de agua (`MarcaDeAgua.tsx`): los logos de El Garage y Esquina bajados de sus sitios
  y el de **Banú, el que pasó Valentino** (`scripts-portfolio/fuentes/banu-logo-oscuro.png`: las letras sacadas con un umbral de
  luminancia 50 —la letra vive en 0–45, el halo y el degradé de 55 para arriba—, vectorizadas con potrace en el scratchpad, sin
  dependencias nuevas; `public/portfolio/banu-scents/logo.svg`, 8 contornos, 35 KB; Valentino aprobó el recorte); ←/→, Enter, Esc;
  `tic` sí, `pestillo` no.
- **Hover instantáneo** (punto 6): `flushSync` en el `pointerover`/`pointermove`, sin espera; las guardas (4 px, la ráfaga de
  250 ms, para cualquier cambio de tira).
- **Estrellas, fugaces y formación** (punto 7): `tunelEnLaEscena.ts` se borró; nada se apaga en el Portfolio.
- **Tablet: Demos como en escritorio** (punto 8): la capa rígida queda sólo abajo de 768; en tablet llegan el título, el párrafo y los
  renglones del carrusel con el gesto de los libros.
- **El panel en horizontal** (punto 9): el paso que lo mete espera al pin (`pasoConElPin`) y el panel existe sólo con el escenario
  pegado (`cortarElPanel`). Afirmado en s76 y en el arnés (`scripts-carga/panel.ts`: la entrada y la salida, cuadro a cuadro).
- **Para el banco** (punto 10): `__oscurecidoDelBanco` (la luz con el dim en 0 contra 0,35 en el mismo cuadro, sólo con el entorno del
  banco).

**Lo que encontró el banco y se arregló en el sprint** (cada uno con su afirmación y su control en s76):

1. **La salida del panel con scroll rápido.** Con la rueda fuerte, la cola se cruzaba más rápido que la transición de 700 ms: el
   escenario se despegaba con el panel a mitad de camino y se lo llevaba para arriba (13 cuadros, hasta 1858 px). Primero, la
   transición sólo pegado con un estado de React: quedaba un cuadro de atraso (38 px). Ahora el corte es imperativo y en el mismo
   cuadro en que se mueve el scroll (sincrónico con el `scroll` nativo y con el de Lenis): despegado, el panel queda afuera y sin
   transición. Medido: 0 px.
2. **El título de «la tuya» debajo de la barra.** Más grande y arriba de todo, la pastilla de la barra lo tapaba a 1024 (contraste
   2,1:1 en el p10). La tira activa deja libre lo que ocupa la barra en reposo, con la misma expresión que el despeje de las anclas
   (`scroll-padding-top` de `navegacion.css`; s76 compara las dos). Medido: 7,45:1.
3. **«Demos» asomando en tablet durante todo el Portfolio.** Sin la capa rígida (punto 8), el título DOM de Demos (su P2 nace corrido
   sólo el 60 % de su alto) dejaba ver la parte de arriba de las letras en la capa pegada. Entra ahora también en opacidad con su
   progreso, como el párrafo (`CapaDeDemos.tsx`). Desde 1024 no cambia nada a la vista: ahí lo reemplaza el título 3D.
4. **«Portfolio» con las letras corridas cuando la página carga con la pestaña al fondo** (el arnés: 18 de 26 corridas, 0,121 em, también
   después de scrollear). Con la pestaña oculta, el texto del título se quedaba con la métrica de respaldo aunque su cara ya hubiera
   cargado (medido: el contenedor del `h2`, 492 px oculta y 467 a la vista); el título 3D se imprimía con esa x, el relevo del DOM (las
   dos copias) lo creaba de nuevo con la cara real y no venía otra tanda de fuentes que lo rehiciera. El guardián de los títulos
   (`titulos3d/sincronia.ts`) verifica ahora una vez cada armado ya relevado: si sus letras no están donde las midió, lo vuelve a armar con
   lo mostrado donde iba, a lo sumo una vez por título y por carga (un plano en perspectiva no entra en un bucle). Avisa en la consola
   (`[v3-carga]`): es la red de seguridad; la causa (el texto que no cambia de métrica con la pestaña oculta) queda medida acá.
5. **`portfolio-ancla` después de un clic en el menú** (el arnés: cargar con el ancla de un proyecto y hacer clic en otra sección). La marca
   del ancla con que cargó la página la soltaban la rueda, el tacto y el teclado, no un clic: el diagnóstico la daba por desfasada. Ahora
   también `pointerdown`. Era del diagnóstico de B1.2, no del sitio.

**P-H11 · los medios** (pedido de Valentino antes del FRENO). El póster del teléfono de El Garage tenía la captura en el cuarto de arriba a
la izquierda y el resto gris, y **el video también**: `grabarEnVivo.ts` le pedía al `recordVideo` un tamaño de `ancho × escala` (780 × 1688)
y Playwright graba en píxeles CSS (390 × 844). Rehecho desde el mismo video: recortado al cuarto con contenido y codificado a su resolución
real, 390 × 844 (escalado a 780 × 1688 no entraba en el techo de 2 MB ni reducido con CRF 30: 2,68 MB; y escalar no agrega detalle), CRF 24,
1,95 MB; el póster, su primer cuadro (WebP calidad 80). El recibo (`docs/rediseno/entregas/b1-portfolio/medios.json`) y
`MEDIDAS_DE_LOS_MEDIOS` dicen 390 × 844; `grabarEnVivo.ts` graba ahora al tamaño del viewport (la extracción ya escalaba). Los otros cinco
medios, revisados (el primer cuadro, uno del medio y el póster): proporción correcta (16:10 y 390:844), sin bandas ni recortes de la
exportación; las franjas lisas que hay son del diseño de cada sitio (los márgenes blancos de Esquina, la barra de arriba de Banú, el
degradé oscuro del pie de la portada de El Garage). s76 lo afirma: cada póster mide lo de su video y lo cubre (ninguna banda lisa pegada a
un borde pasa del 25 % y el contenido ocupa el 70 % o más: los seis, entre el 81 y el 100 %), con el control de uno recortado (el de antes
da 25 %). Queda más blando que los otros dos del teléfono (es la resolución que se grabó); para igualarlos hay que volver a grabarlo.

**Medido.** Build de medición `.next-b7` (final: BUILD_ID `F_wdR_GxBlk7RAote3wqT`), `next start` en :3101, Chrome del sistema con
la placa de alto rendimiento: **NVIDIA GeForce RTX 5050** (`WEBGL_debug_renderer_info` en la página medida). Scripts del banco en el
scratchpad (`b12b/banco.ts`, `analisis.ts`, `revisar.py`), entregas en `~/.cache/b4-medicion/b12b/`.

- **Composición** (hojas a 1440 × 900, 1024 × 768, 820 × 1180 y 1023 × 768): el centro x del título y de la bajada, a 0,14 % del ancho o
  menos del eje de su columna (1440: título 0,00 %, bajada 0,14 %; 1024 y 820: 0,00 %; 1023: 0,05 %). El logo proyectado, a 0,25 % del
  ancho o menos (s76 §9b, por rayos contra la pose de cada cuadro) y entero en su mitad; la perspectiva del título 3D, 0,00 %. Hojas:
  `hoja-<ancho>x<alto>-paso<n>.png`.
- **AA sobre el vidrio**, con la escena y la marca de agua detrás (1440 y 1024, las cuatro tiras, p10 de cada caja de texto): los 94 textos
  pasan; el más bajo, el título de «la tuya» a 1024 con el «?» detrás, 7,57:1 (piso 4,5); los demás, 11,4:1 o más (el peor margen sobre
  el piso, ×1,68). El botón del CTA se mide sobre su propio relleno: 18:1. La opacidad del vidrio queda en 4 %.
- **El costo del vidrio**, sin vsync (1440, panel adentro, 6 s por caso): con el vidrio, mediana 2,0 ms, p95 3,4, p99 5,0; sin el
  desenfoque 1,6 / 2,9 / 19,4; con el panel opaco 1,7 / 2,9 / 18,9. El desenfoque cuesta ~0,4 ms por cuadro en la mediana y ~0,5 en el p95.
- **La luz con el oscurecido (0,35) y sin él (0)**, en el mismo cuadro (el gancho del banco): sobre el lienzo, píxel a píxel, el valor
  codificado baja a 0,649–0,658 de mediana en las cuatro zonas (logo, piso, cielo, escena; p10–p90 0,62–0,70): exactamente 1 − 0,35, o sea
  0,46–0,51 en luz lineal. Parejo para todas las capas de la escena; el DOM (la bajada, la barra, el panel) no se oscurece.
- **El panel con scroll rápido** (1440; la caja cuadro a cuadro desde 2,2 pantallas antes de Trabajos): la rueda (14 golpes de 900 px),
  la barra (saltos de 420 px por cuadro), el menú y un ancla. Entrada: 0 px de desvío del tope en las cuatro (34, 43, 49 y 14 cuadros
  a mitad de camino). Salida (la rueda cruza la cola): 21 cuadros a mitad de camino, todos con el tope en 0.
- **Estrellas** durante el Portfolio a 1440, 1024 y 820 × 1180: a la vista (160 000), sin apagarse (`estrellas-<ancho>-producto.png`).
- **Demos, antes y después**, grabados con scroll constante desde la salida del panel hasta el fondo: antes (`.next-probe`, el túnel) en
  escritorio y tablet; después en escritorio y tablet; y la tablet de B1.2 (la capa rígida). `demos-<rótulo>.webm`.
- **El teléfono** (390 × 844): sin desborde horizontal (el documento mide 390). La sección todavía es el selector de escritorio
  apretado, como en B1.2: lo reemplazan las historias de B1.3.
- **El arnés de carga** (`scripts-carga/estres.ts`, 1440). Entero (107 corridas y el panel) contra el build de los tres arreglos del banco
  (`F_wdR_GxBlk7RAote3wqT`): a los 5,5 s, fallas sólo en dos cosas, las dos arregladas después (puntos 4 y 5 de arriba): «Portfolio» con
  las letras corridas en 18 de las 26 corridas con la pestaña al fondo, y `portfolio-ancla` en las 9 cargas con ancla seguidas de un clic
  en el menú; más una corrida (`recarga`, clic en «Contacto») con `ninguno-visible` en Quiénes somos que no se repitió. El panel, de las
  cuatro maneras: la entrada a ±0,0 px y la salida (la rueda) a ±0,0 px. Contra el build final (`UkExpcjrJGPC1oqEod6hI`): «normal» y
  «cpu» enteras y 3 de «red» (55 corridas) con 0 fallas a 1,5 s, a 5,5 s y después de scrollear, 0 avisos del guardián y 0 errores de la
  consola (al llegar, 9 con `sin-imprimir` hasta el primer cuadro de la escena; A-ter tenía 8). **El resto —«red», las 26 de «fondo», las
  de «contexto» y el panel— no se midió contra el build final**: lo cortó la memoria dos veces (el sistema con el dev server de Servicios
  en 4,1 GB, y en el reintento el portero del propio arnés, con 1,36 GB libres). Lo de «fondo» sí se vio en el sitio con una sonda (una
  carga con la pestaña al fondo, como el arnés): «Portfolio» se imprime corrido 0,121 em, el guardián lo rearma antes de 1,5 s y queda en
  0 em. El archivo: `~/.cache/b4-medicion/cierre-a-ter/carga/build-b12b*.jsonl`.

**Desvíos y por qué.**

- La secuencia de la tira es sólo de opacidad (el video y el nombre; a los 400 ms la ficha, escalonada de a 80 ms): la rama quieta de
  la sección no puede escribir `transform` (`trabajos.invariant`), así que la ficha aparece en su lugar en vez de subir.
- Las marcas de agua se piden y se dibujan recién con la sección cerca (no salen en el HTML del servidor).
- El «blanco» del vidrio es la tinta de la sala de noche (`--color-tinta`, #F7F7F5) por `color-mix`: `s5-tokens` no admite colores
  literales en el lane.
- El título 3D llega con su gesto de siempre (las letras) y sale con la caída de `levanta`.
- Teclado: ←/→ cambian de proyecto y ↑/↓ quedan para la página; Esc devuelve el foco a la cabecera activa desde cualquier lugar del panel.
- `visual-qa` no pudo abrir la página: en este entorno no están sus herramientas de captura («VERIFICACIÓN PENDIENTE»). La verificación
  visual la hizo el banco (las hojas en escritorio y tablet, el teléfono).
- El candado de los procesos pesados (`C:\develop-pesado.lock`) fue una carpeta con `candado.txt` adentro (Windows no deja a un usuario
  sin elevar crear archivos en la raíz de `C:\`); Servicios usó el mismo formato. Valentino lo levantó antes del final.
- El caché de imágenes optimizadas sobrevive al rebuild: el lomo de El Garage siguió mostrando el póster viejo en el build de medición
  hasta borrar `.next-b7/cache/images` (en el `.next` de :3000 no había). En el navegador, Ctrl+Shift+R.

**Verificación.** `verificar` completo sobre `41f91e58`: los 8 grupos rojos de la base (s1, s2, s3, s4, s5, s7, s8, s17) y ninguna
falla nueva, comparando la lista entera (127 líneas contra 129 de B1.2: se va la de `hover:` sin `focus-visible:` de s5-codigo, que era
de B1.2; la de las 300 líneas sigue con los mismos 6 archivos). Y otra vez sobre el árbol final (con los arreglos del banco, los del
arnés y P-H11): las mismas 127 líneas, ninguna falla nueva, `tsc` limpio. Lint de lo tocado, limpio. s76: 478 afirmaciones y 101
controles positivos (con s76-archivo-tunel), cada afirmación nueva con su control; s75 53.
**s38, s44 y s74** (los tres grupos de más en la base que midió Servicios): no dependen del build ni son de B1. Sus sondas llevan `\n`
literal y fallan en una copia con CRLF (la de Servicios: `core.autocrlf=true` en un checkout nuevo; la de este worktree está casi toda
en LF). Corridos sueltos sobre copias sin build: con LF pasan y con CRLF falla la misma afirmación de cada uno, igual en `52d38204`
(antes de B1), en `54655181` (B1.2) y en `41f91e58`. Se arreglan normalizando a `\n` antes de buscar; queda para otro sprint (no es de
este).

**FRENO — lo que Valentino mira en :3000** (con el dev server suyo prendido). B1.3 arranca recién con su aprobación.

1. **La llegada** — http://localhost:3000/v3 y bajar de Quiénes somos a Trabajos con la rueda: el panel de vidrio entra por la derecha
   sólo en horizontal; «Portfolio» aparece en su lugar, derecho, por tiempo, y la bajada sube; el logo va a la mitad de abajo, en el mismo
   eje; el oscurecido. Repetirlo con la rueda fuerte, arrastrando la barra de scroll y con el menú → Portfolio: siempre en horizontal.
2. **La composición y el vidrio** — http://localhost:3000/v3#portfolio-el-garage: arriba «Portfolio» y su bajada, abajo el logo, centrados en
   la mitad izquierda; el vidrio con la estructura de la tinta; la secuencia de la tira (el video y el nombre; a los 400 ms la ficha); la
   marca de agua de El Garage detrás de la ficha.
3. **Las otras marcas** — http://localhost:3000/v3#portfolio-esquina-estudio y http://localhost:3000/v3#portfolio-banu-scents (el logo de
   Banú que pasaste, en SVG).
4. **«La tuya»** — http://localhost:3000/v3#portfolio-la-tuya: el «?» de marca de agua pegado a la izquierda, el título en `titulo-xl`
   debajo de la barra, el CTA grande (abre la hoja de contacto de siempre).
5. **Hover, teclado y sonido** — en http://localhost:3000/v3#portfolio-el-garage: pasar el mouse por los lomos cambia en el acto; cruzando
   varios gana el último y suena un solo `tic`; ←/→ cambian de proyecto, Enter sobre un lomo lo activa, Esc vuelve a la cabecera activa.
6. **La salida** — desde http://localhost:3000/v3#portfolio-la-tuya seguir bajando: el panel se va por la derecha, «Portfolio» se va con la
   caída y llegan las Demos. Con la rueda fuerte, el panel desaparece de una (sin subir con la página).
7. **El cielo** — en http://localhost:3000/v3#portfolio-el-garage las estrellas, las fugaces y la formación siguen prendidas.
8. **Tablet** (DevTools, 820 × 1180 y 1023 × 768) — http://localhost:3000/v3#portfolio-el-garage: la composición sobre el 40 % de la
   izquierda; y bajando hasta Demos, la llegada como en escritorio, sin el «Demos» asomando durante el Portfolio. **Una pregunta:** en la
   tablet parada el «?» de «la tuya» (al 80 % del alto) desborda la tira angosta y se corta —http://localhost:3000/v3#portfolio-la-tuya a
   820—: ¿lo achico al ancho de la tira?
9. **El teléfono de El Garage** (P-H11) — el lomo de El Garage en http://localhost:3000/v3#portfolio-esquina-estudio (su póster, entero) y,
   a 390 de ancho, http://localhost:3000/v3#trabajos (el video). Queda más blando que los otros dos: es la resolución que se grabó.
10. **El teléfono** (390) — http://localhost:3000/v3#trabajos: la sección sigue con el selector de escritorio apretado, como en B1.2; la
    reemplazan las historias de B1.3.
11. **Las grabaciones de Demos, antes y después** — `~/.cache/b4-medicion/b12b/demos-antes-escritorio.webm`, `demos-despues-escritorio.webm`,
    `demos-antes-tablet.webm`, `demos-b12-tablet-rigida.webm` (la tablet de B1.2) y `demos-despues-tablet.webm`.

### B1.2c + B1.3 · los ajustes del FRENO de B1.2b y el teléfono (2026-10-17/18) — FRENADO para que Valentino lo mire en :3000

El pedido y cómo se resolvió cada punto, en la §13. Una corrida y un solo FRENO, con dos commits: `233fd262` (B1.2c: el código y los tests
de los puntos 1 a 7) y el de B1.3 (el teléfono, lo que encontró el banco, el arnés y este log).

**Hecho (B1.2c).**

- **La cámara de frente y el título en el plano del logo** (punto 1): `poseDelPortfolio.ts` resuelve la pose de cinco números para que la
  mirada quede en +z: la órbita pone la cámara en su lugar y los dos números del encuadre la dejan mirando derecho (un plano paralelo al
  cuadro se proyecta sin perspectiva en cualquier lugar del cuadro). El título 3D se coloca con esa pose a la profundidad del logo: queda en
  su plano. La columna es un bloque centrado en el alto: «Portfolio» ×1,15 con tope en el ancho de la columna (en `cqw`: 119,6 px a 1440,
  103 a 1024, 62,1 a 820, 64,4 a 1023 y en el teléfono), la bajada y debajo el hueco del logo (`hueco.ts`: lo mide la sección en el DOM y
  la escena encaja el logo adentro).
- **El orden** (punto 2): `orden.ts` y `useOrdenDeLaEscena`; el panel, la cámara y el oscurecido siguen a `vivo.escena`; el encabezado, a
  `vivo.encabezado` (el escenario los expone en `data-escena` y `data-encabezado`).
- **Los rótulos y P-H2** (punto 3): `Ficha.tsx` (`CLASE_DEL_ROTULO`); en `theme-develop.css` los tres acentos claros y su alias con los
  tres `[data-servicio]`; `AGREGADOS` y `tokens.invariant`; `acento.ts` (`FORMAS_PERMITIDAS_SOBRE_OSCURO`, `FORMAS_PROHIBIDAS_SOBRE_CLARO`);
  `s5-codigo` admite el acento claro sólo en la sección de noche y el instrumento de contraste de s10 lo reconoce.
- **La transición** (punto 4): `transicion.ts` y `useTransicionDeLasTiras`.
- **Hover y rueda** (punto 5): `rueda.ts` y `useRuedaDelPortfolio` (en la captura, antes de Lenis: `lenisStopPropagation` y
  `preventDefault`); `activaElHover` (el hover inerte); `saltarAlPaso(i, true)` (inmediato); la entrada que atrapa la inercia.
- **«La tuya»** (punto 6): `FormularioDeLaTuya.tsx` (WhatsApp entra por `_chrome/enlaces.ts`: una sección no importa de otra),
  `SignoDePregunta.tsx` y `signo.ts`.
- **Tablet** (punto 7): `BarrasDelPortfolio.tsx` (las barras y la pista).

**Hecho (B1.3, el teléfono).** Las historias son el MISMO marcado restilizado abajo de 768 (`max-tablet:`): la sección escribe
`--modo-del-portfolio: historias` y el JS lo lee del CSS. Los lomos no se ven; la tira activa ocupa la pantalla con el video del teléfono
(`MedioDeLaTira` lleva los dos videos y sólo el que está a la vista pide su archivo); la ficha es una hoja de vidrio que sube desde abajo
(`CLASE_DE_LA_HOJA`: `contents` desde 768) con los rótulos y la marca de agua; dos toques (`ToquesDeLaHistoria`: el tercio izquierdo, el
anterior; el resto, el siguiente, con el modelo de la rueda); el deslizamiento es el scroll de la página y, quieta, se asienta en el
centro de su proyecto, a lo sumo uno más allá (`deslizamiento.ts` y `useDeslizamientoDelPortfolio`); «la tuya» al final con el «?», el
formulario y WhatsApp; y el título llega en la aproximación y se va con la caída antes de que entre la historia (el orden con la regla del
teléfono). `useAnclaDeLaCarga` salió de `usePortfolio.ts` por las 300 líneas.

**Lo que encontraron el banco y `verificar` en el camino, y se arregló.**

1. **La parallax del mouse en el banco.** Un banco con la ventana a la vista recibe el cursor real de Windows: el logo vivo aparecía 46 px
   corrido y 8 % más grande que su hueco. Con el puntero de Playwright en el medio del cuadro cae en su hueco a ≤ 3 px. No era del sitio.
2. **La tablet acostada (1023 × 768)**: las barras le sacaron 82 px a la tira y la ficha de El Garage no entraba (la reseña y «Visitar
   sitio» quedaban afuera). Abajo de 1024 el medio va al 28 % del alto (`--alto-del-medio`) y la ficha con menos aire; la pista, sobre una
   pastilla. Medido: entera.
3. **La hoja del teléfono** medía el 60 % de la TIRA (no de la pantalla): a 375 y 360 «Visitar sitio» de El Garage quedaba debajo. Pasa a
   dos tercios. Medido: entera.
4. **`verificar`** (la primera vuelta): la transición de la hoja con la propiedad `translate` entre corchetes es un valor arbitrario que el lane no admite (→ `transition-transform`, que
   en Tailwind 4 ya cubre `translate`); la sección importaba WhatsApp de otra sección (→ por una puerta del chrome: primero el
   contenido del contacto, y la vuelta final de `verificar` mostró que s42 · N1 —«sin WhatsApp en el panel»— lee ese archivo entero, así
   que la puerta es `_chrome/enlaces.ts` y el contenido del contacto quedó como estaba); y los lectores de
   acentos de s1, s6 y del túnel archivado leían también los claros nuevos (→ los separan: `valoresDeAcentoClaroDelTema`; el buscador de
   «acentos concretos» del lane suma los valores claros, más estricto).
5. **Un bucle de `git add`** levantó lo que había dejado otro trabajo (`../.gitignore`, que ahora deja viajar `.claude/skills/`, y esa
   carpeta): se sacó del índice antes del commit de B1.2c (sin tocar el disco) y no va en ninguno de los dos.
6. **El arnés: un error de consola al abrir Contacto con «la tuya» activa** (`Cannot access 'l' before initialization`, la pila con
   `PILAS=1`). Un salto inmediato (el del clic, el de las teclas, el de la carga) llamaba al cierre del vuelo ANTES de que existiera la
   variable que lo guardaba: tiraba, y además `data-en-vuelo` quedaba puesto para siempre. El vuelo pasa a `volarAlPx` (`medida.ts`) con un
   id propio: se marca antes de saltar y el cierre suelta sólo su vuelo. s76 lo afirma con su control.
7. **El arnés: el caso «después de "la tuya", una muesca abajo» fallaba por el instrumento**: el puntero viajaba al medio de la columna en
   ocho pasos y cruzaba los lomos (el hover los activaba). Va de un paso cuando el caso no tiene hover (`steps: 1`).
8. **El arnés, otra vez en ese caso, y ésta era del sitio: cargar con el mouse quieto sobre el panel activaba lomos.** El puntero quedaba
   donde lo había dejado el caso anterior; al cargar `#portfolio-la-tuya`, los lomos que se acomodaban debajo recibían `pointerover`
   (Chrome los manda cuando el contenido cambia bajo un mouse quieto) y el paso iba de «la tuya» a El Garage y a Esquina sin un solo
   movimiento (la sonda `b12c/sonda-rueda5.ts`: ningún `pointermove` en 9 s). Ahora activa sólo un `pointermove` (`activaElHover`,
   `mueve`) y, recién cargada, el primer lugar del puntero es la base de los 4 px. s76 lo afirma con su control; el arnés carga cada caso
   con el mouse quieto sobre el panel y falla si la carga se mueve del paso de su ancla.

**Medido.** Build de medición `.next-b7` (BUILD_ID `eeL6_2G6-JCDSLx3LOJ7U`), `next start` en :3101, Chrome del sistema con la placa
**NVIDIA GeForce RTX 5050** (`WEBGL_debug_renderer_info`). Scripts en el scratchpad (`b12c/banco.ts`, `analisis.ts`, `sonda-dedo.ts`),
capturas en `~/.cache/b4-medicion/b12c/`.

- **La composición** (`hoja-<ancho>x<alto>-<caso>.png`, el puntero en el medio): el título y la bajada a 0,00 % del ancho del eje de la
  columna en los siete cuadros; el logo vivo (la malla proyectada, `__siluetaDelBanco`) a 0,25 % o menos y en su hueco a ≤ 3 px (de 0,991 a
  1,003 de su tamaño); nada se corta (el título, la bajada, el logo, el formulario y el «?» adentro de su tira y del cuadro) y sin desborde
  horizontal, a 1440, 1024, 820 × 1180, 1023 × 768, 390, 375 y 360. Las normales (s76 §9c, por la cuenta de la colocación): 0,0000° entre el
  título y el logo; 1,35° con la vira del logo en su punta.
- **El orden, en el sitio** (`orden.json`, 1440, cuadro a cuadro): saliendo, el encabezado se apaga a los 27 ms y la escena a los 1441 ms
  (la caída entera del título); entrando desde abajo, la escena a los 27 ms y el encabezado a los 733 ms (la cámara llegó).
- **El AA** (`aa.txt`, la escena, el vidrio, la hoja y las marcas de agua detrás; 1440, 1024, 820 y 390): los 134 textos pasan. Los rótulos
  nuevos, 5,11:1 o más (el peor, en la hoja del teléfono sobre el video de Banú; en escritorio, 6,93:1 o más); los campos del formulario,
  12,7:1 o más; «Enviar», 18:1 sobre su relleno; WhatsApp, 12,7:1 o más. El peor margen sobre el piso, ×1,14.
- **El deslizamiento en el teléfono** (`deslizar.txt`, 390 × 844, eventos táctiles de verdad: el gesto sintético de CDP no scrollea en
  este Chrome): corto y lento, vuelve al centro de El Garage; largo y rápido, el centro de Esquina; otro, el de Banú; hacia abajo, Esquina.
  Uno por deslizamiento, centrado.
- **El arnés de carga** (`scripts-carga/estres.ts`, 1440, el build final `20woPqqJMMEsG0XiPbrPx`, con el arreglo del punto 8): ENTERO
  y de una sola pasada, sin reintentos (7,9 GB libres al arrancar, 34 min): «normal», «cpu», «red», «fondo» y «contexto» —las tres
  últimas, las que en B1.2b cortó la memoria—, la entrada del panel y la rueda. Las **107 corridas** bien a 1,5 s, a 5,5 s y después de
  scrollear; **0 errores** de la consola; ningún bloque medido solo al cargar a más de 2 px de la referencia (los dos que difieren medidos
  en el layout son el título y la bajada del encabezado del Portfolio, que viven en lo pegado: los mismos de B1.2b); **26 avisos** del
  guardián de los títulos, uno por corrida de «fondo» (la red de seguridad con la pestaña al fondo, que B1.2b vio con la sonda; el arnés no
  guarda el texto) y las 26 bien. **El panel** entra en horizontal de las cuatro maneras (rueda, barra, menú y ancla) con el tope a ±0,0
  px y sin cuadros en la salida. **La rueda**, los cinco casos: Banú → la tuya; El Garage → Esquina; Esquina → El Garage; con el mouse
  quieto, Esquina → Banú → la tuya; la tuya → Demos; cada uno carga con el mouse quieto sobre el panel y no se mueve del paso de su
  ancla. Las dos pasadas anteriores (los builds `eeL6_2G6…` y `KOoy8…`) son las que encontraron los puntos 6 y 8. El archivo:
  `~/.cache/b4-medicion/cierre-a-ter/carga/build-b12c-final2.jsonl`.

**Desvíos y por qué.**

- **La cámara sigue del lado de atrás del logo** (el azimut ~194°, como en todo el tramo de Trabajos): «de frente» es la mirada
  perpendicular a su plano. Pasar al frente era una vuelta de 180° en la entrada.
- **«Portfolio» crece ×1,15 y no más** en escritorio (lo dice «un poco más grande»); en la tablet parada lo frena el ancho de la columna
  (62,1 px: ×1,11).
- **La salida por la rueda viaja lo que dura el orden** (la caída y el panel, ~2,1 s), así Demos llega después de que el título cayó; los
  saltos entre proyectos, 420–900 ms.
- **El hover activa también los lomos de la tablet con mouse** (una ventana de escritorio angosta): es el mismo modelo.
- **El formulario corto viaja como el del panel** (`origen: 'panel'`, con lo que no pregunta vacío): el servidor no distingue de dónde
  llegó. Si hace falta saberlo, es un cambio de la ruta (fuera de este sprint).
- **«La tuya» en el teléfono no lleva los toques** (taparían el formulario): se vuelve deslizando.
- **`visual-qa`** no pudo abrir la página: en este entorno no están sus herramientas de captura («VERIFICACIÓN PENDIENTE», como en
  B1.2b). La verificación visual la hizo el banco (las hojas en escritorio, tablet parada y acostada y el teléfono a 390, 375 y 360) y la
  hace Valentino en el FRENO.

**Verificación.** Con el dev server de Valentino apagado. `tsc --noEmit` del repo entero: 0 errores. Lint de los 31 archivos de
TypeScript tocados (el Portfolio, Trabajos, el chrome, los tests y el arnés): limpio. `verificar` completo sobre el árbol final: 83
pasos, los 8 grupos rojos de la base (s1, s2, s3, s4, s5, s7, s8, s17) y ninguna falla nueva contra la lista de B1.2b (127 líneas; sólo
cambian dos cuentas: el agregado de s5, de 629 a 651 afirmaciones, y s3-peso, de 111 a 115 tokens en el CSS servido, por los cuatro
acentos claros). s76: 253 afirmaciones (con `s76-portfolio-b12c` y `s76-portfolio-historias`, cada afirmación nueva con su control);
Trabajos 239; s75-carga 53; s10 240; s42 49, s43 27, s39 61 y s41 59; frontera 23. El build `qUGgP-9YS2PKcX7DGoXAb` sin errores y
`prisma migrate status` al día (86 migraciones). Ningún envío real: el banco y el arnés bloquean `/api/`.

**FRENO — lo que Valentino mira en :3000** (con su dev server prendido otra vez: lo apagué para el build, el banco y el arnés). B1.3 queda
hecho; lo que sigue, con su aprobación.

Escritorio (1440 y 1024):

1. **«Portfolio» y el logo, de frente y en bloque** — http://localhost:3000/v3#portfolio-el-garage: el logo derecho (sin la vista desde
   arriba), «Portfolio» más grande y más cerca, la bajada y el logo debajo, en el mismo eje de la mitad izquierda.
2. **La salida y la entrada** — desde http://localhost:3000/v3#portfolio-la-tuya, bajar con la barra de scroll (o PageDown) hasta Demos:
   primero cae el título entero y recién después vuelven la cámara y el oscurecido mientras el panel se va. Subir de nuevo: primero llega
   la cámara y después aparece el título.
3. **Los rótulos** — en El Garage, Esquina y Banú: «Fecha», «El problema», «Qué hicimos»… en Chivo Mono, mayúsculas y el celeste de web.
4. **La transición** — en http://localhost:3000/v3#portfolio-el-garage, pasar el mouse por los lomos: se va entero el que estaba, un
   respiro y entra el siguiente; cruzando varios rápido, una sola salida y una sola entrada.
5. **Hover y rueda** — mouse sobre el lomo de Banú y una muesca abajo: «la tuya» (no Demos); sobre El Garage y una muesca abajo: Esquina;
   sobre Esquina y una muesca arriba: El Garage; con el mouse quieto, la rueda nunca reactiva un lomo. Después de «la tuya», la rueda va a
   Demos; antes de El Garage, sale hacia arriba. Un golpe fuerte de rueda desde Quiénes somos se frena en El Garage.
6. **«La tuya»** — http://localhost:3000/v3#portfolio-la-tuya: el «?» centrado que se arma (el trazo, el relleno, el punto que cae y
   rebota) y queda tenue; al volver a entrar se rearma. El formulario corto y «o escribinos por WhatsApp». Para ver el gracias y el error
   sin enviar nada: http://localhost:3000/v3?envio=lento#portfolio-la-tuya y http://localhost:3000/v3?envio=error#portfolio-la-tuya (las
   simulaciones del desarrollo, las mismas del contacto).

Tablet (DevTools):

7. **Parada, 820 × 1180** — http://localhost:3000/v3#portfolio-el-garage: las barras arriba del panel, la pista «Seguí bajando» la primera
   vez (se va con el primer paso y no vuelve en la sesión), el tap en un lomo; en http://localhost:3000/v3#portfolio-la-tuya el «?» entra
   entero en la tira angosta (la pregunta del FRENO de B1.2b).
8. **Acostada, 1023 × 768** — http://localhost:3000/v3#portfolio-el-garage: la ficha entera, con «Visitar sitio».

Teléfono (DevTools, 390 de ancho, con el modo táctil):

9. **Las historias** — http://localhost:3000/v3#trabajos y bajar: «Portfolio» llega en la aproximación y se va con la caída; entra la
   historia de El Garage (el video a pantalla completa, las barras arriba, la hoja que sube con la ficha y la marca de agua). Tocar a la
   derecha o a la izquierda: el siguiente o el anterior. Deslizar hacia arriba: de a un proyecto (se asienta en el centro de cada uno). La
   última es «la tuya» con el «?», el formulario y WhatsApp. Probar también a 375 y 360. El selector de escritorio apretado ya no está.

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

---

## 12. Ajustes del FRENO de B1.2 (B1.2b, 2026-10-17)

Valentino miró B1.2 en :3000 y probó las banderas. Lo que no está acá quedó aprobado (los videos: «me gustan un montón, muy bien
hechos»). **Esta sección manda sobre todo lo anterior** donde lo contradiga. Al final, FRENO otra vez: B1.3 arranca con su aprobación.

### 12.1 Lo pedido, punto por punto, y cómo se hace

0. **Sin banderas.** Salen `?portfolio-dim`, `-paso`, `-panel`, `-lado` y `-camara`, con sus lectores (`banderas.ts` se borra).
   Quedan constantes: el oscurecido en 0,35, el panel de vidrio, del lado derecho, y una sola pose de cámara. Los tests que las
   afirmaban pasan a afirmar que no hay lector de ninguna y que las constantes valen eso, con su control.
1. **Una pose calma y frontal.** La de B1.2 giraba la cámara 15° a 27° (la `a`, 210°): se va. La nueva conserva el azimut y la altura
   de la cámara del pin (183,6°, 8,7) y sólo corre el encuadre (y la distancia, para que el logo entre): el logo cae centrado en el
   cuadrante de abajo de la mitad izquierda. El encuadre se calcula por aspecto (con un encuadre fijo el centro del logo se corre
   1,8 % del ancho entre 1440 y 1024). **El título 3D se coloca con ESA pose** (una lectura nueva, «la pose del Portfolio»): con el
   panel adentro queda exactamente en su lugar del DOM y de frente (sin perspectiva). Medido antes de elegir: corriendo sólo el
   encuadre con la lectura de hoy, la cámara rota ~7° y el título queda con ~4 % de diferencia de alto de punta a punta (pasa del
   3 %). La mitad izquierda se parte en dos: arriba «Portfolio» y la bajada, abajo el logo, centrados en el mismo eje (25 % del ancho;
   en tablet, 20 %: el centro del 40 % que deja el panel).
2. **El vidrio con la estructura de la tinta.** Una sola estructura: el vidrio del sistema va en el PANEL (blanco al 4 %, desenfoque
   de 20 px, saturación del 180 %, borde blanco al 8 %) y las tiras son las de la tinta (lomos, proporciones, animaciones), sin fondo
   propio. La tira de «la tuya», igual. AA del texto y costo en cuadros, medidos en el banco.
3. **El título entra en su lugar y se va cayendo.** La presencia del encabezado es un valor por TIEMPO, prendido con el panel
   adentro (ya pegado: no viaja con la sección). El título 3D llega con su llegada de siempre y se va con la caída de los otros
   títulos del sitio (la de `levanta`, al revés: se acuesta y su línea lo tapa); la bajada sube y se va por sus líneas. Reversible.
4. **«La tuya» sin el «?» 3D.** Se borran `SignoDeLaTuya` y su pase (no se archivan). Un «?» 2D quieto, en SVG propio, con el estilo
   del logo (la cinta de ancho constante, el relleno gris, el filo claro y la sombra corrida de la pieza de `EncajeDelLogo`), como
   marca de agua pegada al borde izquierdo de la tira. El título, el más grande de la escala que entre sin cortar palabras a 1024 y
   a 1440; el CTA, un botón grande con el mismo `data-abre-contacto="panel"`.
5. **Un solo gatillo por proyecto.** Cada proyecto ocupa 1,5 pantallas (lo que ocupaban sus dos pasos) y «la tuya» lo mismo: la
   constante es `PANTALLAS_POR_PROYECTO`, y la sección pasa de 950,67svh a 1025,67svh (todo derivado: el alto, el `k` por ancho, las
   anclas y el reloj de Demos). Al cruzar el borde de un proyecto arranca su secuencia por tiempo: la tira con el video y el nombre,
   y a los ~400 ms la ficha, escalonada. Sin portada ni ficha: la tira activa muestra siempre el video arriba y la ficha abajo.
   La marca de agua de cada cliente (su logo, monocromo, ~8 %) detrás de la ficha; los logos se bajaron de los sitios (sólo GET).
   Teclado: ←/→ cambian de proyecto, Enter en un lomo lo activa, Esc devuelve el foco al lomo activo. Sonido: `tic` al cambiar de
   proyecto; `pestillo` sale.
6. **Hover instantáneo.** El cambio de la tira pasa en el mismo cuadro del `pointerenter`; el salto de Lenis va después. Cruzando
   varios lomos gana el último y suena un solo `tic`; después de una activación, los lomos que se reacomodan debajo del puntero no
   activan nada hasta que el puntero se mueva 4 px o más.
7. **Estrellas, fugaces y la formación siguen durante el Portfolio.** La ventana que las apagaba (`tunelEnLaEscena.ts`) se borra.
8. **Tablet: Demos llega como en escritorio** (la misma persecución y el mismo gesto: la capa rígida que escalaba queda sólo abajo
   de 768, que es de B1.3). Antes y después, grabados.
9. **El panel entra y sale en horizontal.** El panel se anima en el escenario pegado; si se llega rápido, el gatillo espera al pin.
   Afirmado en s76 y en el arnés (con scroll rápido, el tope de la caja del panel constante ±1 px).
10. **Lo pendiente de B1.2**, al final, con el dev server de Valentino apagado.

### 12.2 Los logos de los clientes (GET a los sitios en vivo)

- **El Garage**: `ElGarageLogo-Modificado.png` (853 × 233, RGBA, fondo transparente): limpio.
- **Esquina Estudio**: `logo-header-negro.png` (1172 × 384, RGBA, fondo transparente): limpio.
- **Banú Scents**: NO sale limpio. El único logo del sitio (`logoC.png`, 1536 × 1024) trae un degradé de fondo pegado a la imagen
  (y el `icon.svg` es una «B» de favicon). Fue el nombre como marca de agua tipográfica hasta que Valentino pasó el archivo
  (`scripts-portfolio/fuentes/banu-logo-oscuro.png`): las letras, con un umbral de luminancia 50 y potrace, en
  `public/portfolio/banu-scents/logo.svg` (aprobado por él).

---

## 13. Ajustes del FRENO de B1.2b y el teléfono (B1.2c y B1.3, 2026-10-17)

Valentino miró B1.2b en :3000: «todo lo demás me encanta, muy buena sección». Lo que sigue va en una corrida, con un solo FRENO al final
y dos commits (B1.2c y B1.3). **Esta sección manda sobre todo lo anterior** donde lo contradiga.

### 13.1 Lo pedido, punto por punto, y cómo se hace

1. **«Portfolio» y el logo miran al mismo lado.** La cámara del Portfolio mira PERPENDICULAR al plano del logo y el logo se corre en el
   cuadro moviendo la cámara en un plano paralelo, no girándola (un plano paralelo al cuadro se proyecta sin perspectiva en cualquier
   lugar del cuadro). Es la misma pose de cinco números del rig: la órbita pone la cámara en su lugar y los dos números del encuadre
   se resuelven para que la mirada quede en +z (`poseDelPortfolio.ts`). El título 3D se coloca con esa pose a la profundidad del centro
   del logo sobre la mirada: queda EN el plano del logo y de frente. La columna es un bloque centrado en el alto —«Portfolio» un 15 %
   más grande (sin pasar del ancho de la columna), la bajada y debajo el hueco del logo medido en el DOM (`hueco.ts`)—, todo en el eje
   de la columna. Criterio: el ángulo entre las normales, menos de 3°; el eje, a menos del 1 %; nada se corta a 1440, 1024 y en tablet.
2. **La salida del título se tiene que ver.** El orden (`orden.ts`): primero se apaga lo que se apaga y después se prende lo que se
   prende; entre lo que se apaga, el encabezado antes que la escena; entre lo que se prende, la escena antes que el encabezado. Saliendo,
   el título y la bajada caen enteros (lo que tarda el título 3D: 1,4 s; sin el 3D, 0,6) y recién después vuelven la cámara y el
   oscurecido mientras el panel se retrae (0,7 s). Entrando (también al subir), primero llega la cámara y después aparece el título.
3. **Los rótulos de la ficha.** Chivo Mono (`font-codigo`), mayúsculas, el interletrado positivo del sistema (`micro`), un paso más
   grandes (`caption`) y el acento claro de web (#8FC0E8). **P-H2**: los tres acentos claros (los «on-dark» de la marca) y su alias
   `--color-acento-claro` entran al tema y a `AGREGADOS`; la regla de `acento.ts` deja el texto de acento claro sobre fondo invertido (y
   `s5-codigo` lo admite sólo en la sección de noche). AA medido con la marca de agua detrás.
4. **La transición entre proyectos** (`transicion.ts`): la salida completa del que se va (su contenido se apaga y las tiras se
   reacomodan), un respiro de 200 ms y la entrada del siguiente. Con un scroll rápido que cruza varios, va al último con una sola salida
   y una sola entrada.
5. **Hover y scroll, el modelo nuevo.** El proyecto activo manda: el hover (y el clic, el tap y las teclas) lo activan y el scroll se
   acomoda en silencio a su tramo (Lenis inmediato). La rueda avanza o retrocede de a un proyecto desde el activo (un gesto, un paso:
   `rueda.ts`); después de «la tuya» sigue a Demos y antes del primero sale hacia arriba. Mientras la rueda tiene el control el hover
   queda inerte hasta que el mouse se mueva 4 px. La entrada del panel atrapa la inercia de un golpe fuerte de rueda (se frena en el
   proyecto en que entra). Los cuatro casos, en s76 y en el arnés (`scripts-carga/rueda.ts`).
6. **«La próxima es la tuya».** El formulario corto (nombre, «WhatsApp o email», «¿Qué necesitás?», enviar) con la validación, el envío y
   los textos de gracias y de error del contacto (importados), y «o escribinos por WhatsApp» con el enlace del pie (el número ya estaba
   en `_secciones/cierre/contacto.ts`). El «?» centrado en la tira se arma: el trazo y el relleno del preloader (0,85 y 0,45 s) y el
   punto que cae y rebota con la física de las piezas del pie (restitución 0,45, tres saltos); después queda quieto con el brillo de las
   marcas de agua. Al volver a entrar se rearma; con movimiento reducido aparece armado. En la tablet parada se achica al ancho de la tira.
7. **Tablet**: las barras de progreso arriba del panel (una por proyecto y «la tuya»), la pista «Seguí bajando» la primera vez (se va con
   el primer paso y no vuelve en la sesión) y el tap en un lomo con el modelo del punto 5.
8. **B1.3 · el teléfono** (abajo de 768): las historias, por CSS sobre el MISMO marcado (las dos ramas dicen lo mismo y la sección no
   mide el ancho): la historia a pantalla completa con el video del teléfono, las barras arriba, la ficha como una hoja de vidrio que
   sube desde abajo (con los rótulos y la marca de agua), dos toques (izquierda: anterior; derecha: siguiente), el deslizamiento que es
   el scroll de la página y se asienta de a un proyecto, «la tuya» al final con el «?», el formulario y WhatsApp, y el título que llega
   en la aproximación y se va con la caída antes de que entre la historia.
9. **Verificación** con el dev server de Valentino apagado (§10, B1.2c + B1.3).

---

## 14. Ajustes del FRENO de B1.2c + B1.3 (B1.2d, 2026-10-18)

Valentino miró B1.2c + B1.3. Su feedback va en dos subsprints, cada uno con su commit y su FRENO: **A** (el scroll, la secuencia y la
barra) y **B** (el formulario de «la tuya» y las historias), que arranca recién cuando diga «seguí». Esta sección manda sobre todo lo
anterior donde lo contradiga. Sin `next build` (contrato O-10): el banco y el arnés corren contra el dev server.

### 14.1 Diagnóstico (escrito antes de tocar el scroll)

**Los estados.** El Portfolio tiene cinco piezas de estado, y la que decide qué se ve es el PASO:

| Pieza | Valores | Dónde |
|---|---|---|
| El paso | −1 antes del pin (la aproximación), 0…3 las tiras (la 3 es «la tuya»), 4 la cola (la salida y Demos) | `pasos.ts:81-84`; la fase, `estado.ts:44-48` |
| El vuelo | ninguno, o un salto en curso con su destino (`data-en-vuelo`) | `medida.ts:85-102` |
| El orden | la escena (el panel, la cámara y el oscurecido) y el encabezado, que se prenden y apagan de a uno, por tiempo | `orden.ts`, `useOrdenDeLaEscena.ts` |
| La transición de las tiras | quieta, saliendo, abriendo, respiro | `transicion.ts` |
| El gesto de la rueda | quieto, acumulando, disparado | `rueda.ts:39-46` |

Los estados de la experiencia salen de combinar el paso con el orden:

- **fuera:** paso −1 o 4, con el orden apagado;
- **entrando:** paso 0…3, con el orden todavía prendiéndose;
- **adentro:** paso 0…3, con el orden prendido;
- **saliendo:** paso −1 o 4, con el orden todavía apagándose;
- **«la tuya»:** adentro, en el paso 3.

**Qué los mueve.**

- **El scroll** (el `scroll` nativo y el de Lenis): `leer()` en el cuadro siguiente (`usePortfolio.ts:170-181`) publica el paso con su
  histéresis (`pasos.ts:108`) y con el pin (`estado.ts:54`). **Si hay un vuelo, publica el DESTINO del vuelo** (`usePortfolio.ts:177-178`).
- **La rueda,** en la fase de captura (`useRuedaDelPortfolio.ts:29-49`), sólo con el panel adentro (`manda()`, `usePortfolio.ts:225-228`):
  un gesto es un paso → `ir()` → un vuelo de 420 a 900 ms a la tira, o de ~2,1 s a Demos o arriba (`usePortfolio.ts:214-222`).
- **El hover, el clic, las teclas y el tap:** `saltarAlPaso(i, true)`, un vuelo inmediato (`saltar.ts:28-33`).
- **La carga con un ancla** (`useAnclaDeLaCarga.ts`), **la entrada que atrapa la inercia** (`usePortfolio.ts:243-253`) y **el
  deslizamiento** del teléfono.
- **El orden** sigue a la fase, por tiempo; **la transición**, a la tira, por tiempo.

**Por qué falla A8.1.** Un vuelo se suelta sólo en su llegada, con el `onComplete` del `lenis.scrollTo` (`saltar.ts:34`,
`medida.ts:94-98`); nada más lo suelta. Y Lenis no llama ese `onComplete` si otro movimiento le pisa la animación: un `scrollTo` nuevo y
la rueda rearman la suya y la de antes se pierde. La cadena, medida en el sitio con la sonda (`b12d/sonda-a8.ts`, el dev server, 1440):

1. En «la tuya», una muesca hacia abajo arma el vuelo a Demos (2,1 s) y publica YA su destino: el paso 4 (`medida.ts:101`).
2. Con el paso 4, `manda()` devuelve `null`: la rueda deja de ser del Portfolio, y las muescas siguientes (el visitante que sigue
   bajando, o la inercia del mismo gesto) van a Lenis, que reemplaza el viaje.
3. El `onComplete` no llega nunca: el vuelo queda colgado, con `data-en-vuelo` puesto.
4. Desde ahí `leer()` publica siempre el destino del vuelo, haga lo que haga el scroll. Subiendo con la rueda hasta y = 7843 (el paso 2),
   el escenario siguió en el paso 4, con el panel afuera y el título apagado: «el Portfolio no aparece más». Y como el paso nunca vuelve
   a 0…3, la rueda nunca vuelve a mandar: la página «pasa directo a Demos».
5. `/v3#trabajos` sin recargar no lo arregla: el vuelo colgado sigue ahí y la sección muestra sólo el logo.
6. El diagnóstico de la carga no lo veía: `portfolio-desfasado` no se evalúa con un vuelo en curso (`_lib/diagnostico/fallas.ts:144`), y
   un vuelo colgado lo esconde para siempre. Por eso el arnés de B1.3 (107 corridas) no lo encontró.

**A8.2** es la misma cadena con el vuelo hacia arriba: desde El Garage, una muesca arriba arma el vuelo de 2,1 s y publica el paso −1;
la rueda que vuelve a bajar en el medio se lo pisa y el paso queda en −1 (la sonda lo dejó colgado otra vez en la cola).

**Lo que encontró la sonda, además.** La base del hover sembrada con el primer `pointerover` (la última vuelta de B1.3) no deja activar un
lomo al que se entra desde la columna si el mouse se queda ahí: la base cae en el punto de entrada y el `pointermove` siguiente, en el
mismo lugar, no cuenta como movimiento. Va con A3.

### 14.2 El plan del subsprint A

- **A8 · un vuelo con dueño y con fin.**
  1. Mientras dure un vuelo del Portfolio, la rueda es suya (se traga, dé o no un paso): nadie se lo pisa con la rueda.
  2. Si igual se lo pisan (un viaje del menú, un ancla, la barra de scroll), se suelta: en cada cuadro de scroll, si el destino de Lenis
     ya no es el del vuelo, el vuelo se cancela y el paso vuelve a salir del scroll.
  3. Un vencimiento: lo que dura el vuelo más un margen; si no llegó, se suelta. Se borra al llegar o al cancelar: ningún temporizador
     huérfano.
  4. El invariante en el diagnóstico (un vuelo con la página quieta; en reposo, el panel adentro del tramo o afuera de él) y la matriz
     en el arnés, con el defecto de A8.1 reintroducible para el control positivo.
- **A3 · la rueda termina lo que empieza.** Durante la transición (el vuelo y la de las tiras) el hover no hace nada; cuando termina,
  recién un `pointermove` nuevo lo habilita. Y sin la base sembrada.
- **A10 · el orden, en cuatro piezas.** La cámara (con el oscurecido), el título, la barra y el panel:
  - la cámara primero: sin ella el título no queda de frente en el plano del logo (B1.2c);
  - después el título;
  - la barra durante el título, terminando justo antes del panel;
  - el panel, cuando el título va por el 80 % de su llegada.
  - Al salir, al revés: el panel, la barra, la caída del título y la cámara.
- **A1 · la barra se corre.** El Portfolio le pide el corrimiento a la barra con un almacén chico en `_chrome/barra/` (como el del
  contacto), con el eje del título y el borde del panel. La píldora va en dos tiempos (el borde izquierdo se estira; el derecho se
  comprime) con la API de animaciones del navegador: interrumpible y usable siempre. El destino es el eje del título si entra; si no, el
  margen después del botón de sonido.
- **A9 · Demos arranca mientras el Portfolio se va.** El reloj de Demos se corre para que su título empiece a subir donde la salida del
  Portfolio ya se disparó, en las dos direcciones (el borde de la cola menos la histéresis). Las alturas no cambian: la deriva es 0.
- **A11 · el clic afuera.** Desde 1024, un clic en la columna (fuera del panel, los lomos, la barra y el sonido) lleva el scroll justo
  antes del pin, con la salida normal.
- **A2 · «Visitar sitio»** con `CtaEnlace` (el botón simple del sitio), que suma el enlace externo y la etiqueta.

**Medido antes** (el dev server; 1440 × 900, 1280 × 800 y 1024 × 768):

- La píldora mide 538 px a todo ancho y nace centrada en la página. El botón de sonido ocupa de 32 a 80 px. La columna es la mitad, y el
  eje del título, la mitad de la columna.
- Centrada en el eje y con 16 px de aire a cada lado, entra recién desde ~1460 px:
  - a 1440, la píldora en el margen queda a 5 px del eje (0,35 %);
  - a 1280, su borde derecho queda a 6 px del panel (no a 16);
  - a 1024 es más ancha que la columna (538 contra 512).
- Lo de 1280 y 1024 va como decisión al FRENO A.

**Para el subsprint B (agregado de Valentino, P-H19, pedido de servicios).** El componente común de las historias recibe la cantidad de
pasos por parámetro (el precio de servicios tiene 3; el Portfolio, 4) y no depende de `PortfolioVivo` ni de `[data-panel]`. Hoy las de
B1.3 dependen de los dos y asumen 4 pasos fijos. Lo propio del Portfolio (los datos, el panel, «la tuya») entra por props o por el
render de cada ítem. Lleva una prueba que monta el componente con 3 pasos, fuera del Portfolio.
- El hueco de A9: el título de Demos empieza a subir en el px 6881 de la regla, y la salida del Portfolio se dispara en el 6330 (bajando)
  y vuelve en el 6270 (subiendo). Son 551 px de escena sola bajando y 611 subiendo.

### 14.3 Log: B1.2d A · el scroll, la secuencia y la barra (2026-10-18) — FRENADO para que Valentino lo mire en :3000

Sin `next build` (contrato O-10): la matriz, el banco y el AA corrieron contra el dev server de :3000.

**Hecho, punto por punto.**

- **A8 · los bugs de scroll, de raíz.** El vuelo tiene dueño y fin (`medida.ts`):
  - lleva su marca en el `userData` de Lenis (`saltar.ts`), y la lectura del scroll lo suelta si la marca ya no es la suya (la rueda, un
    viaje del menú o un ancla se lo pisaron);
  - vence a lo que dura más 1 s;
  - todo pasa por un `soltar` que también borra el vencimiento: ningún temporizador huérfano.
  - Mientras dura un vuelo, la rueda es del Portfolio aunque el panel ya no mande (`useRuedaDelPortfolio.ts`): la inercia y las muescas
    que siguen no se lo pisan.
  - El diagnóstico de la carga suma `portfolio-colgado` y `portfolio-panel` (s75).
  - Medido: la matriz entera, 90 de 90 combinaciones con tres idas y vueltas cada una; el control positivo (A8.1 con el defecto
    reintroducido) falla como tiene que fallar.
- **A3 · la rueda termina lo que empieza.** Durante la transición que pidió la rueda (su vuelo y el cambio de tiras) ningún
  `pointermove` activa un lomo; al terminar, la base del hover es el puntero de ese momento. El hover, el clic y los toques no la marcan
  (cruzar lomos sigue yendo al último). En el sitio: una muesca y 1 px, y una muesca y 8 px de mouse a mitad de la transición: llega a
  Esquina.
- **A10 · primero el título, después la barra, el panel al 80 %.** El orden tiene cuatro piezas (`orden.ts`): la cámara, el título, la
  barra y el panel. Cada pieza recuerda cuándo cambió y cada cambio espera lo suyo: una vuelta a mitad de camino nunca adelanta el panel.
  Al salir, al revés. Medido en el sitio: el panel arranca con el título al 82,1 % (1440), al 81,4 % (1280) y al 81,7 % (1024).
- **A1 · la barra se corre.** `_chrome/barra/corrimiento.ts` (el pedido y la cuenta) y `useCorrimientoDeLaPastilla.ts` (los dos tiempos
  con la API de animaciones del navegador, interrumpible); el Portfolio la pide en su orden (`useBarraDelPortfolio.ts`). Medido a los
  tres anchos:
  - 401 ms entre los dos tiempos (373 a 1024), primero el borde izquierdo, nunca más angosta que su ancho;
  - termina antes de que arranque el panel y los enlaces se pueden usar durante todo el movimiento;
  - cualquier camino de la matriz la deja en su lugar;
  - a 1440, a 0,36 % del eje del título (16 px del botón de sonido y 86 del panel); a 1280 y 1024, ver las decisiones.
- **A9 · Demos entra mientras el Portfolio se va.** El reloj de Demos se adelanta 611 px (`ADELANTO_DE_DEMOS`, `pasos.ts`): su título
  empieza a subir en el borde de la cola menos la histéresis (px 6270). Las alturas no cambiaron: la deriva de la escena es 0 (el mapeo
  de s76 sigue bit a bit). Medido en reposo, de a 25 px: 0 px de escena sola bajando y subiendo (antes, 551 y 611); se pisan entre 6270 y
  6330.
- **A11 · el clic afuera.** Desde 1024, un clic en la columna (la escena, el título, el logo) fuera del panel, los lomos, la barra y el
  sonido lleva la página 4 px antes del pin, con la salida normal y sin pista visual. Las 30 combinaciones de la matriz que salen así,
  bien.
- **A2 · «Visitar sitio».** Es el `CtaEnlace` del sitio (el rollover de dos copias y su subrayado), importado. Suma dos props opcionales,
  `externo` y `etiqueta`, que no cambian cómo renderizan los demás.
- **`#trabajos`** entra al Portfolio (El Garage, como el «Portfolio» de la barra), al cargar y cuando el hash cambia sin recargar
  (`useAnclaDeLaCarga.ts`): el salto nativo caía en la aproximación, con el logo solo.

**Lo que se encontró en el camino, y se arregló.**

1. **La base del hover de la última vuelta de B1.3 rompía el hover desde la columna** (la sonda de A8.2): sembrada con el primer
   `pointerover`, caía en el punto de entrada. Sale; activar pide un `pointermove`.
2. **`targetScroll` no sirve para saber si pisaron un vuelo:** en un viaje programado Lenis lo lleva con el valor animado. La marca va
   en `userData`, y s76 lo ata al Lenis instalado.
3. **El clic afuera no hacía nada** (la matriz, en su primera tanda): el oyente quedaba en el escenario del montaje, que se vuelve a
   montar cuando la sección pasa a la rama con coreografía. Va en la caja; y el pedido de la barra busca sus elementos en cada medición.
4. **El orden del teléfono:** la historia espera a que el título termine de caer, y el panel no espera a la cámara cuando no hay título.
5. **El atributo del escenario se llamaba `data-escena`**, el mismo nombre que el lienzo de la escena: ahora es `data-panel-adentro`
   (con `data-camara`, `data-barra` y `data-orden-quieto`).

**Medido.** El dev server de :3000 y el Chrome del sistema con la NVIDIA. Los archivos: `~/.cache/b4-medicion/b12d/` (la matriz por
tanda, el control, A3, A1, A9 y el AA con sus capturas).

- **La matriz** (`scripts-carga/matriz.ts`; la cuenta, en `a8.ts`): 90 de 90. Las nueve entradas (la rueda desde arriba y desde Demos,
  Página abajo y Página arriba, las flechas, el arrastre de la barra de scroll, `#trabajos`, `#portfolio-*` y el «Portfolio» de la barra)
  por las tres salidas (a Demos, hacia arriba y el clic afuera), con y sin hover, lentas y rápidas, cada una con tres idas y vueltas.
  Corrió en tandas de a 10 con la memoria medida antes de cada una (O-3), un Chrome por combinación y ningún proceso vivo entre tandas.
- **El control:** las tres primeras combinaciones, otra vez bien; A8.1 con el defecto, en falla (el vuelo colgado y el Portfolio que no
  vuelve a entrar).
- **A3:** 1 px y 8 px de mouse a mitad de la transición → Esquina. **A1 y A10:** los números de arriba. **A9:** 0 px.
- **El AA:** la píldora corrida, 6,37:1 o más a los tres anchos; «Visitar sitio», 14,83:1 o más (1440, 1024, 820 y 390); el peor margen
  sobre el piso, ×1,41.

**Decisiones que tomé sin preguntar.**

- **A1 a 1280 y a 1024.** La píldora mide 538 px y no entra entre el botón de sonido y el panel con 16 px de aire: a 1280 queda a 6 px
  del panel; a 1024 es más ancha que la columna (538 contra 512) y pisa el panel 122 px. Quedó lo más a la izquierda posible, después del
  sonido, que es lo que menos tapa. Opciones:
  - (a) así;
  - (b) a esos anchos no correrla;
  - (c) achicar su aire mientras está corrida (gana unos 30 px: alcanza a 1280, no a 1024);
  - (d) ensanchar la columna a esos anchos (cambia la composición aprobada).
- **La cámara sigue entrando antes que el título** (A10): sin ella el título no queda de frente en el plano del logo (B1.2c). Lo visible
  va en el orden pedido: el título, la barra y el panel.
- **Al salir, el título empieza a caer cuando al panel le falta el mismo 20 %** que se pisan al entrar; la barra vuelve con el panel
  afuera; la cámara, con el título caído entero.
- **«Visitar sitio» es el `CtaEnlace`**, el botón simple del sitio (el mismo de los CTA y del Enviar del contacto), y su hover también
  hace reaccionar la escena, como todo CTA.
- **El arrastre de la barra de scroll se reprodujo por lo que produce** (scroll nativo sin rueda ni teclas): el sitio la oculta
  (`globals.css`).
- **El defecto de A8.1 se reintroduce sólo desde el arnés** (`window.__defectosDelPortfolio`, como `__entornoDeLaEscena`): nunca la URL.
- **El dev server de :3000** llegó a 3,8 GB con las recompilaciones y lo reinicié en el mismo puerto: el proceso de hoy es otro.

**Los tests que cambiaron porque cambió la spec.** Cada uno se reemplazó por la afirmación nueva con su control; ninguno se debilitó.

1. s76 §19 (`s76-portfolio-b12c.tsx`): el orden de dos piezas de B1.2c (la escena y el encabezado) → el de cuatro de A10, con el 80 % y
   la vuelta a mitad de camino. Controles: el orden de B1.2c y una vuelta que adelanta el panel.
2. s76 §22: «recién cargada, el primer lugar del puntero es la base» → sin la base sembrada (control: la base de B1.3).
3. s76 §22: la entrada que atrapa la inercia, la rueda a Demos con su salida y el vuelo antes del salto, leídos ahora en
   `useMandosDelPortfolio.ts` y en `medida.ts` (con la marca).
4. s76 §25: la pista y las barras leen `vivo.panel` (antes, `vivo.escena`).
5. s76 §29 y §30 (`s76-portfolio-historias.tsx`): los toques y el deslizamiento, en los mandos; el orden del teléfono, en cuatro piezas
   (control nuevo: la historia que entra mientras el título cae).
6. s76 §6 (`s76-portfolio-mapeo.ts`): «la cola nueva es la de antes al píxel» → la cola corrida `ADELANTO_DE_DEMOS`, con el título de
   Demos en el borde de la cola menos la histéresis (control: el reloj de B1.2c).
7. s76 §13 y §14 (`s76-portfolio-escena.tsx`): `visibleLa` con `vivo.panel` y el hover con `deLaRueda`.

Nuevos: `s76-portfolio-b12d.tsx` (§32 a §38: el vuelo, A3, A1, A11, A2, `#trabajos` y la cuenta de la matriz) y, en s75, las dos fallas
del diagnóstico. s76: 302 afirmaciones; s75: 55.

**Verificación.**

- **Lint** de los 31 archivos de TypeScript tocados: limpio. **`tsc --noEmit`:** 0 errores.
- **`verificar` completo:** 83 pasos, los 8 grupos rojos de la base y ninguna falla nueva (127 líneas; sólo cambió la cuenta del padrón
  de las 300 líneas, de 366 a 368 archivos, y los que lo pasan son los mismos 6).
- **frontera:** 23 afirmaciones, sin fallas. **s76** 302, **s75** 55 y **Trabajos** 239; s5-codigo, s10, s39, s41, s47, s73, s27, s51 y
  s3-cta, en verde.
- Sin `next build` (O-10). **`visual-qa`:** sin sus herramientas en este entorno (VERIFICACIÓN PENDIENTE); la coreografía la mira
  Valentino.

**FRENO A — lo que Valentino mira en :3000** (Ctrl+Shift+R la primera vez).

1. **A8.1** — 1440, http://localhost:3000/v3#quienes-somos: bajar sólo con la rueda hasta entrar al Portfolio, seguir hasta Demos sin
   parar la rueda y volver a subir con la rueda. El Portfolio vuelve a aparecer (el título, la barra corrida y el panel) y sigue de a un
   proyecto. Ida y vuelta varias veces.
2. **A8.2** — 1440, http://localhost:3000/v3#portfolio-esquina-estudio: pasar el mouse por el lomo de El Garage, una muesca hacia
   arriba (sale) y volver a bajar: entra otra vez.
3. **`#trabajos`** — 1440, http://localhost:3000/v3#trabajos, y cambiar el hash a `#trabajos` sin recargar: entra a El Garage con el
   título y el panel, no el logo solo.
4. **A10** — 1440, entrando con una muesca desde la aproximación: primero el título, después la barra se corre, y el panel entra
   cuando el título casi terminó. Saliendo hacia arriba: el panel se va, la barra vuelve y el título cae.
5. **A1** — 1440, 1280 y 1024: la píldora se estira hacia la izquierda y después se comprime, ya en la columna; Contacto y Login no se
   mueven; los enlaces andan durante el movimiento. A 1280 y 1024, mirar la decisión de arriba.
6. **A3** — 1440, en El Garage con el mouse sobre los lomos: una muesca hacia abajo y mover un poco el mouse mientras cambia: llega a
   Esquina.
7. **A9** — 1440, desde «la tuya», bajar despacio: Demos empieza a entrar mientras el Portfolio se va, sin escena vacía.
8. **A11** — 1440 y 1024, con el panel adentro: un clic en la escena, el título o el logo de la columna lleva justo antes del
   Portfolio, con la salida normal; un clic en el panel, un lomo, la barra o el sonido, no.
9. **A2** — 1440: el hover y el pulsado de «Visitar sitio» en cada proyecto, como los botones del sitio.

**Lo que quedó afuera.** El subsprint B entero, que espera el «seguí» (con el agregado de P-H19 de la §14.2). El arnés de carga de 107
corridas no corrió: no lo pide el gate de A, y las dos fallas nuevas del diagnóstico entran ahí cuando corra.

### 14.4 Log: B1.2d A2 · los ajustes de A (2026-10-18)

Valentino miró el FRENO A y lo aprobó, con cuatro ajustes (A2): el medio, el tiempo de la píldora y el scroll rápido. «Visitar sitio», el cuarto, ya estaba.

**A2.1 · El medio baja cuando la píldora corrida se le mete al panel.**
- **El cálculo.** `despejeDelMedio` (`_chrome/barra/corrimiento.ts`) sale de la píldora en reposo y de la geometría del panel. A la píldora la publica la barra (`publicarLaPastilla`); a la geometría, el Portfolio (`publicarElPanel`, SIEMPRE y no sólo con la barra).
  - Si la píldora corrida no deja sus 16 px de aire contra el panel, el medio de cada tira arranca 16 px debajo de ella.
  - Es de la geometría del ancho y no del momento: con la píldora yendo o volviendo, el medio no salta.
  - A 1440 la píldora entra con su aire, así que nada.
- **El aire.** Sin el aire (sólo con la superposición estricta) a 1280 no cambiaba nada, porque la píldora queda a 6 px del panel. Lo tomé con el aire: decisión mía, anotada abajo.
- **Para no cambiar la altura**, el medio se achica en su proporción lo que baja (`anchoDelMedioConDespeje`, `medios.ts`). El relleno más el medio miden lo mismo que antes, así que la ficha queda en su lugar.
  - La primera corrida, sin achicar, mostró la ficha pasándose del panel: 861 de 800 a 1280, 851 de 800 a 1180 y 823 de 768 a 1024.
- **Medido** (`MODO=a2` de `scripts-carga/matriz.ts`; el fondo del medio, en el mismo lugar):

| Ancho | El medio | La ficha | ¿Se pasa del panel? |
|---|---|---|---|
| 1440 × 900 | 32 → 336, igual que antes | hasta 864 | no |
| 1280 × 800 | 88 → 286, 16 px debajo de la píldora; 254 → 198 px de alto | hasta 805 (ya estaba: un hijo recortado) | no |
| 1180 × 800 | 88 → 254; 223 → 166 px | hasta 795 | no |
| 1024 × 768 | 88 → 206; 174 → 118 px | hasta 767 | no |

**A2.2 · El tiempo de la píldora** (`orden.ts`):
- **Al abrir,** la barra se prende un tiempo antes del panel (`ORDEN.barraPrimerTiempoS`, 200 ms). El borde izquierdo se estira antes, y el panel entra cuando termina ese primer tiempo, A LA PAR de la contracción.
- **Al salir,** la barra se apaga con el panel: la expansión acompaña la salida del panel y la contracción final va después.
- **Medido** (el comienzo de la contracción contra la entrada del panel, y el de la expansión contra su salida):

| Ancho | Entrada | Salida |
|---|---|---|
| 1440 | 0 ms | 0 ms |
| 1280 | 0 ms | 0 ms |
| 1180 | −7 ms | 0 ms |
| 1024 | 0 ms | +11 ms |

- El criterio era ±50 ms.

**A2.3 · La ráfaga** (`rueda.ts`: `rafagaDeLaRueda`, `calibracionDeLaRafaga`, `entraConLaRafaga`):
- **Qué es una ráfaga:** 3 muescas o más en menos de 300 ms, o un trackpad a esa velocidad. Lo que cuenta son los px en un mismo sentido dentro de la ventana, a 100 por muesca. Se calibra con `?rafaga=` (`4`, `4-250`, `no`).
- **El orden:** la rueda del Portfolio la mira ANTES que el gesto de a un proyecto (`useRuedaDelPortfolio`), y la decide `useMandosDelPortfolio`:
  - con el panel adentro, sale (a Demos o hacia arriba, con la salida de siempre), sin recorrer lo que falta;
  - afuera, si la ráfaga entra al tramo (Lenis lleva la página más allá del pin, o más acá de la salida), lo saltea entero: el paso de destino es el de Demos (o el de arriba) desde el primer cuadro, así que ni la píldora se corre ni el panel entra;
  - lo que sigue de la ráfaga se traga mientras vuela.
- **Lo encontró el arnés:** el destino de Lenis se leía en la captura, antes de que Lenis sume el evento de ahora. Cinco muescas desde la aproximación daban 850 y no 950, y el Portfolio entraba. Ahora se suma el evento (`px * wheelMultiplier`); el control de s76 §40 lo cubre.
- **La matriz:** las 12 combinaciones de la rueda rápida de A8 (el trackpad con inercia ES una ráfaga: saltea en vez de entrar) pasan a 16 de ráfaga: entrar bajando o subiendo y adentro bajando o subiendo, con muescas o con trackpad, con y sin hover.
  - Corren con `MODO=rafaga`, y su control es `CONTROL=rafaga` (con `?rafaga=no`, las de entrar tienen que fallar).
  - Las violaciones nuevas son `entro-con-la-rafaga` y `recorrio-de-mas` (más de un proyecto además del de partida: la primera muesca ya dio su paso cuando se reconoce la ráfaga).

**Las afirmaciones de s76 reemplazadas (cambió la spec):**
1. **§19, la entrada:** la barra en 1,62 s, no en 1,42. «La barra termina cuando el panel empieza» pasa a «la contracción a ±50 ms del panel», con el control del orden de A.
2. **§19, la salida:** `CEbp@0.00` y `Cebp@0.42`, no `CeBp@0.42` y `Cebp@0.70`. La barra va con el panel, con el control de la salida de A y la afirmación de la expansión.
3. **§19, con el título recién llegado:** la barra en 0,92 s y no en 0,72 (y la referencia de su control).
4. **§19, sin el título 3D:** el mismo cambio que la 2.
5. **§34, «el Portfolio la suelta al salir»:** la forma nueva de `useBarraDelPortfolio` (`pedirElCorrimiento(barra ? geometria : null)` y `geometriaDelPanel`), con un control nuevo: pedir sin la barra.
6. **§38, la cuenta de la matriz:** 90 → 78. Las 12 de la rueda rápida pasan a la ráfaga (§41).

Nuevas: `s76-portfolio-a2.tsx`, §39 a §41. s76: 324 afirmaciones.

**Verificación:**
- lint de los 16 archivos tocados, limpio;
- `tsc --noEmit`, 0 errores;
- `verificar`, 84 pasos con los 8 grupos rojos de la base: la lista de fallas (127 líneas) es IDÉNTICA a la del sprint P-H;
- frontera, 23 afirmaciones sin fallas;
- s74 34, s75 55, s76 644 en el agregado y s77 35;
- sin `next build`.

**Lo que no corrió por memoria:**
- La matriz de la ráfaga en el sitio, después del arreglo: la tanda 0-3 frenó con 594 MB libres. Volvió el dev de servicios (2,5 GB), y con él y el dev del home arriba no quedan 3 GB para un Chrome.
- La matriz de A8 entera de nuevo (las 78), que tocan el orden y la rueda.
- Las dos corren con `bash scratchpad/cola2/tanda.sh <rango> MODO=rafaga` (y sin `MODO`, la de A8), contra el dev del home en :3002.
- **Un error mío:** la primera corrida de `MODO=a2` arrancó con 1,4 GB libres, debajo del piso, y no debió arrancar. Terminó bien.

**Decisiones que tomé sin preguntar:**
- **El despeje con el aire de 16 px**, no con la superposición estricta: a 1280 la píldora queda a 6 px del panel y el medio también baja.
- **El medio se achica lo que baja**, para no tocar la altura ni pasar la ficha. A 1024 queda en 118 px de alto.
- **La ráfaga con el trackpad** usa la misma velocidad (unos 1.000 px/s). Sospecho, sin haberlo medido con un trackpad de verdad, que un deslizamiento moderado ya la supera y saltea el Portfolio. Si saltea de más, se sube con `?rafaga=`.
- **El dev del home** corre en :3002, porque :3000 lo usa ahora el de servicios.

**Qué mirar (A2)**, en :3002 (`npm run dev -- -p 3002`, o el puerto libre):
1. **A2.1**, a 1280 × 800, 1180 × 800 y 1024 × 768, en `/v3#portfolio-el-garage`. El video de cada proyecto arranca debajo de la píldora corrida, con aire, y la ficha y «Visitar sitio» entran en el panel. El video queda más chico que antes: es el precio de no tocar la altura. A 1440, igual que antes.
2. **A2.2**, a 1440, entrando con una muesca desde la aproximación. Primero se estira la píldora y, cuando entra el panel, la píldora se contrae a la par, como si le dejara el lugar. Saliendo hacia arriba, la píldora vuelve a la par de la salida del panel y se contrae después.
3. **A2.3**, a 1440:
   - una ráfaga de rueda desde Quiénes somos: el Portfolio no aparece (ni la píldora ni el panel) y entra Demos;
   - desde Demos, una ráfaga hacia arriba, lo mismo;
   - adentro (en El Garage), una ráfaga hacia abajo sale a Demos sin pasar por los proyectos;
   - con muescas sueltas, de a un proyecto, como antes;
   - con el trackpad: decí si saltea de más.
### 14.5 El plan del subsprint B (el formulario de «la tuya» y las historias)

**P-H19 · las historias como pieza común** (`src/app/v3/_componentes/historias/`). La firma, para el contrato:

```ts
// maquinaDeLasHistorias.ts — la máquina, pura (sin React, sin el DOM, sin el Portfolio)
export const HISTORIAS: { duracionMs: 10_000; mantenerMs: 200; toqueMaxPx: 10; desliceMinPx: 40; tercioDeAtras: 1 / 3 }
export interface ItemDeHistoria { readonly id: string; readonly sinTiempo?: boolean }
export interface EstadoDeLasHistorias { indice; transcurridoMs; pausada; enfocada; reinicio }
export type EventoDeLasHistorias = tiempo(ms) | toque(fraccion) | deslice(dx, dy) | mantener | soltar | foco(adentro)
export type SalidaDeLasHistorias = 'adelante' | 'atras'
export function siguienteDeLasHistorias(e, ev, items, duracionMs?): { estado; salida: SalidaDeLasHistorias | null; porElUsuario: boolean }

// Historias.tsx — el componente
export interface PropsDeLasHistorias<T extends ItemDeHistoria> {
  readonly items: readonly T[]                        // la cantidad de pasos es la de la lista: el Portfolio 4, el precio 3
  readonly renderItem: (item: T, estado: { indice; pausada; reinicio }) => ReactNode
  readonly alSalir: (hacia: SalidaDeLasHistorias) => void   // deslizar arriba (o pasar el último): adelante; abajo: atrás
  readonly etiqueta: string
  readonly rotulos: { anterior: string; siguiente: string }  // los dos controles del teclado
  readonly duracionMs?: number
  readonly alCambiar?: (indice: number) => void
  readonly className?: string
}
export function Historias<T extends ItemDeHistoria>(p: PropsDeLasHistorias<T>): JSX.Element
```

- **Fuera del Portfolio:** no lee `PortfolioVivo` ni `[data-panel]`. Lo propio de cada uso entra por `items`, `renderItem` y `alSalir`.
- **Cómo se monta:** cuando las historias tienen que correr, y se desmonta al salir. Así cada entrada arranca del primero, y cada ítem, de cero: `reinicio` vuelve a montar su medio.

**Cómo queda el Portfolio debajo de 1024 (T2 a T8):**
- **T2:** `--modo-del-portfolio: historias` pasa de `max-tablet` a `max-escritorio`. Las historias van de 1023 a 768 inclusive y siguen debajo, y los lomos de la tablet salen.
- **El panel:** no se mueve. Adentro, en las historias, va `HistoriasDelPortfolio` en vez del acordeón, con cuatro ítems: los tres proyectos y «la tuya», sin tiempo.
- **La entrada (T3):** el título «Portfolio» sube desde abajo, por delante del logo, y termina arriba. Recién ahí entran las historias, con un fundido y una subida corta de 700 ms. Los dos se ven en el orden de cuatro piezas; en las historias, el título se pide en la aproximación y se queda.
- **Las salidas:** deslizar hacia arriba vuela a Demos. Deslizar hacia abajo vuelve al título (justo antes del pin).
- **T8, el scroll:** nunca avanza las historias.
  - Mientras corren, la página no se mueve con el dedo (`touch-action: none` y un `touchmove` que no la deja pasar).
  - La rueda no avanza: sale hacia adelante o hacia atrás.
  - Se va el asentamiento del scroll de B1.3 (`useDeslizamientoDelPortfolio`).
- **T4, la ficha:** el nombre y el rubro, el problema, qué hicimos y «Visitar sitio», abajo, en ≤ 25 % del alto. Si no entra, van las versiones cortas, sacadas de los textos reales.
- **T6 y T7:** «la tuya» con el mismo formulario que en PC (B4/B5). Los toques no cuentan sobre los campos, los botones ni los enlaces, y con un campo enfocado nada avanza.
- **T1, el sonido:** un solo tic por toque. Lo pone el componente cuando el cambio lo pidió un gesto; el acordeón no suena en las historias.

**B4/B5 · el formulario de «la tuya»:**
- **Los campos del modal**, la píldora y el texto largo, salen a `_componentes/chrome/Campos.tsx`, y los usan los dos. El modal queda idéntico: la huella sha256 de su marcado antes y después, y captura si hay memoria.
- **«¿Qué necesitás?»** pasa a ser un texto largo de 4 renglones como mínimo.
- **«Enviar»** es el `Cta` del sitio, y «o escribinos por WhatsApp» va a la derecha, en la misma fila.
- **El clic en el título activo** (no hace nada) se saca y no suena: la cabecera activa lleva `aria-disabled`, como pide el acordeón de la WAI cuando el panel no se cierra, y el sonido global no suena con lo deshabilitado.

**Lo demás:**
- **B6:** el aire de arriba y el de abajo de «la tuya» se reparte (la diferencia, menos del 10 % del alto del panel, a 1440 × 900 y a 1024 × 768).
- **B7:** el formulario en 3D, detrás de `?form=3d` (perspectiva de CSS sobre los campos reales; giro en reposo calibrable con `?form=3d-10`; con el mouse, ±6° suavizado; con movimiento reducido, plano).
- **P-H21:** `BotonPausa` en el video en bucle del panel de escritorio. En las historias, la pausa es mantener apretado.

### 14.6 Log: B1.2d B · el formulario de «la tuya» y las historias (2026-10-18)

**Lo hecho, punto por punto:**

**B4/B5 · el formulario de «la tuya»:**
- **Los campos son los del modal de contacto.** La píldora (`CampoDePildora`), el texto largo (`CampoDeTextoLargo`) y el error (`ErrorDelCampo`) salieron de `_chrome/contacto/CamposDelContacto.tsx` a `_componentes/formularios/Campos.tsx`, y los usan los dos formularios.
- **El modal quedó IDÉNTICO.** Las huellas sha256 de su marcado, tomadas antes del cambio en cinco casos, son las mismas: la hoja, la hoja con el interés precargado, los campos vacíos, los campos llenos con errores y el modo teléfono. s76 §32 las fija.
- **«¿Qué necesitás?»** es un texto largo de 4 renglones como mínimo, que crece hasta 8.
- **«Enviar»** es el `Cta` del sitio (el del modal), y «o escribinos por WhatsApp» va a su derecha, centrado, en la misma fila. En el error, WhatsApp queda como alternativa.
- **El clic en el título de la tira abierta** no hacía nada y sonaba. Ahora la cabecera abierta lleva `aria-disabled` (como pide el acordeón de la WAI cuando el panel no se cierra) y no tiene `onClick`, y el sonido global no suena con un control deshabilitado (`ControlDelSonido`).
- **Lo encontró la invariante de Trabajos:** el lector de s10 (`s10-recorrido.ts`) tomaba `aria-disabled` por `disabled`, porque `\b` corta en el guion, y sacaba la cabecera abierta del orden del teclado. Arreglado: el nombre entero.

**B6 · el espacio de «la tuya»:** el bloque entero queda centrado en el alto, con el mismo despeje arriba y abajo. El criterio (< 10 % del alto del panel a 1440 × 900 y 1024 × 768) lo mide el banco: no corrió por memoria.

**B7 · `?form=3d`** (`FormularioEnPerspectiva`): perspectiva de CSS sobre los campos reales.
- En reposo gira −10°, calibrable de −8° a −12° con `?form=3d-8` … `?form=3d-12`.
- Con el mouse adentro sigue al puntero, ±6° como mucho, suavizado con una transición de 300 ms, y vuelve al reposo al salir.
- Con movimiento reducido, en el servidor o sin la bandera: plano, sin una caja de más.

**T2 · debajo de 1024, todo es historias:** `--modo-del-portfolio: historias` pasa de `max-tablet` a `max-escritorio`, así que va de 1023 a 768 inclusive y más abajo.
- Los lomos, las barras y la pista de la tablet se fueron.
- La columna va a todo el ancho, con el título arriba.
- El panel no se desliza: queda transparente y sin puntero mientras está vacío.

**P-H19 · las historias como pieza común** (`_componentes/historias/`):
- `maquinaDeLasHistorias.ts` es la máquina pura. Se llama así porque `historias.ts` chocaba con `Historias.tsx` en Windows: el import resolvía al `.ts`.
- `Historias.tsx` es el componente. La firma está en la §14.5.
- La cantidad de pasos sale de `items`. No depende de `PortfolioVivo` ni de `[data-panel]`: lo propio entra por `items`, `renderItem` y `alSalir`.
- La prueba la monta con tres pasos fuera del Portfolio (s76 §29).

**T3 · la entrada:**
- El título «Portfolio» sube desde abajo (55 svh, por delante del logo: el DOM va sobre el lienzo) con su presencia, y se queda arriba.
- Recién ahí entran las historias: un fundido con una subida corta, de 24 px en 700 ms.
- En las historias, el título se pide en la aproximación y sigue pedido con ellas adentro, así que al volver (deslizar hacia abajo) está ahí.

**T4/T5 · las historias:**
- Arriba van las barras, y la de ahora se llena lineal en 10 s.
- El video del teléfono va a pantalla completa, en bucle mientras dura la historia, y cada una arranca de cero, porque se vuelve a montar.
- Mantener apretado 200 ms pausa la barra y el video.
- Un toque en el tercio izquierdo vuelve; en los dos tercios derechos, avanza.
- De costado, igual. Hacia arriba se va a Demos y hacia abajo, al título.
- **La ficha:** el nombre y el rubro con el problema a la derecha, y qué hicimos con «Visitar sitio» a la derecha. Va abajo, en el área segura, y nada más.
  - No agregué versiones cortas: falta medir la ficha (≤ 25 %) en el sitio, y se agregan sólo si la medida lo pide.

**T6/T7 · «la tuya» en las historias:**
- Sin tiempo: su barra queda llena y se queda hasta que el usuario sale.
- Tiene el mismo formulario que en PC, apoyado abajo.
- Los toques no cuentan sobre los campos, los botones ni los enlaces, y con un campo enfocado nada avanza.

**T8 y T1:**
- El scroll nunca avanza las historias: mientras corren, el dedo no mueve la página (`useSinScrollEnLasHistorias`; un diálogo, sí) y la rueda sale en vez de avanzar.
- El asentamiento del scroll de B1.3 se fue con sus dos archivos.
- Un solo sonido por toque: el toque es del puntero sobre la superficie (no un botón: el sonido global no suma su «clic»), y el tic suena sólo si el cambio lo pidió un gesto.

**P-H21:** `BotonPausa` va en el video en bucle del panel de escritorio, mientras corre solo. En las historias, la pausa es mantener apretado.

**Los archivos:**
- **Nuevos:**
  - `_componentes/historias/maquinaDeLasHistorias.ts` y `Historias.tsx`;
  - `_componentes/formularios/Campos.tsx`;
  - en `trabajos/portfolio/`: `HistoriasDelPortfolio.tsx`, `HistoriaDelProyecto.tsx`, `useSinScrollEnLasHistorias.ts` y `FormularioEnPerspectiva.tsx`.
- **Borrados:** `BarrasDelPortfolio.tsx`, `deslizamiento.ts` y `useDeslizamientoDelPortfolio.ts`.

**Las afirmaciones reemplazadas porque cambió la spec** (ninguna debilitada; cada una con su control):

| # | Dónde | Antes | Ahora |
|---|---|---|---|
| 1 | s76 B1.3 §27 a §31 (`s76-portfolio-historias.tsx`, entero) | las historias eran el acordeón restilizado debajo de 768, avanzadas por el scroll, con dos toques en botones y el título que caía | §27 a §31 nuevas: T2, la historia y su ficha, P-H19 con 3 y 4 pasos, T8 y T1, y T3 |
| 2 | s76 B1.2c §25 | las barras, la pista y el tap de la tablet | sin barras ni pista (el tap en un lomo queda: escritorio) |
| 3 | s76 B1.2c §26 | la tablet con la columna al 40 % | con la columna a todo el ancho; el control, con la columna angosta de antes |
| 4 | s76 B1.2c §19, cableado | la regla del título de B1.3 | la de T3 |
| 5 | s76 B1.2d §33, cableado de A3 | `ir: (d) => ir(d, true)` | con la salida de las historias |
| 6 | s76 B1.2b §11, «la columna es UN bloque» | las clases de la tablet | las de las historias |
| 7 | s76 B1.2b §11, «una sola estructura» | el vidrio siempre | el vidrio fuera de las historias |
| 8 | s76 B1.2b, el despeje de «la tuya» | sólo arriba | arriba y abajo (B6) |
| 9 | Trabajos §6, el contenido entero | sin excepciones | salvo los dos rótulos del teclado de las historias, que se montan en el cliente; la pista («Seguí bajando») salió del contenido |
| 10 | Trabajos, videos | dos por proyecto | uno (el del teléfono es de la historia) |
| 11 | Trabajos, archivos | 38 | 39 |
| 12 | Trabajos, botones | 7 | 5 |
| 13 | Trabajos, paradas | 14 | 12, y el texto largo es una parada válida |
| 14 | `portfolio-invariante`, los `hidden` | 12 | 11 (la pista) |
| 15 | `portfolio-invariante`, el formulario corto | tres campos de una línea | el texto largo, el `Cta` y la fila del envío, con un control nuevo |
| 16 | `s10-acceso-censo` | `DELTA_DEL_PORTFOLIO.paradas` 7 | 5 |
| 17 | s37 y s61 | leían `CamposDelContacto.tsx` | leen también `Campos.tsx` (los campos se mudaron); el control de s61 busca la clase donde está ahora |
| 18 | s5-compacto | el contenido entero en el marcado servido | con la misma excepción del cliente (las rutas tienen que existir) |
| 19 | s77 §1 | «la pausa no está integrada» | «está en el video en bucle del panel, y en ningún otro lado» |

- **El arreglo del lector de s10** (`atributo` y `tieneAtributo`, nombre entero) es una corrección del instrumento, con su control en s76 §32.

**Verificación:**
- lint de los 36 archivos, limpio;
- `tsc --noEmit`, 0 errores;
- `verificar` (con el índice de los borrados): 84 pasos y los 8 grupos de la base. La lista tenía dos líneas nuevas en s5, las dos de B: s5-compacto (los dos rótulos del teclado de las historias no llegan al marcado servido; se declaró la misma excepción que en Trabajos, con su razón) y s5-tokens (un `max-w` de porcentaje en la ficha de la historia: es una grilla de dos columnas). Arregladas y corridas sueltas, s5-compacto y s5-tokens vuelven a su base;
- s76, 350; Trabajos, 242; s10-acceso, 74; s37, 116; s61, 70; s39, 61; s25, 35; s77, 35; s3-foco, 65;
- el modal de contacto, idéntico por huella;
- sin `next build`.

**Lo que no corrió por memoria:**
- Todo lo del sitio de B. Con el dev de servicios arriba (2,5 GB) y el del home (de 3 a 4,6 GB), no quedan 3 GB para un Chrome.
- La sonda de las historias (`scratchpad/cola2/historias-sitio.ts`): el modo en 767, 768, 1023 y 1024; la ficha ≤ 25 % en 360, 375, 390, 820 × 1180 y 1023 × 768; el arranque en cero, mantener, los toques, los deslices, el scroll, «la tuya» y las salidas.
- B6 medido, el AA de lo nuevo (la ficha sobre el video, «Enviar», el disco de la pausa) y la captura del modal en el navegador (la huella del marcado sí corrió).

**Decisiones que tomé sin preguntar:**
- **La barra de «la tuya» llena y quieta.** «Sin tiempo» lo leí como llena: la otra lectura era vacía.
- **El último ítem con tiempo se queda lleno y no sale solo.** Salir es del que mira; un toque a la derecha después del último, sí sale.
- **Un toque a la izquierda en el primero lo reinicia**, como Instagram, sin sonar.
- **T7:** «más grande» lo resolví con el bloque de «la tuya» de la historia apoyado abajo, con el título en `titulo-xl`. El `Cta` del sitio mide lo mismo en todos lados y su tamaño no lo cambié.
- **Para el teclado de las historias** hay dos controles escondidos (anterior y siguiente). Mientras uno tiene el foco, el tiempo no corre (WCAG 2.2.2).
- **Los rótulos de «la tuya»** quedaron del tamaño de los del modal. Los dos usaban `text-caption`, así que no sé si «más grandes» pedía otra cosa: miralo (abajo).

**Qué mirar (FRENO B),** en el dev del home (`npm run dev -- -p 3002`):
1. **B4/B5**, a 1440 y 1024, en `/v3#portfolio-la-tuya`. Los campos son los del modal de contacto (abrilo desde «Contacto» de la barra y comparalos): la píldora, el padding, los rótulos, el foco (Tab), los errores (Enviar vacío) y el ejemplo.
   - «¿Qué necesitás?» tiene cuatro renglones.
   - «Enviar» es el botón simple, legible.
   - WhatsApp va en la misma fila, a la derecha.
   - Un clic en «La próxima es la tuya» no suena.
   - Decí si los rótulos tienen el tamaño que querías.
2. **El modal de contacto**, a 1440 y 390: igual que antes.
3. **B6**, a 1440 × 900 y 1024 × 768: «la tuya» centrada en el panel, sin el hueco de abajo.
4. **B7**, a 1440, en `/v3?form=3d#portfolio-la-tuya` (y `?form=3d-8`, `?form=3d-12`): el formulario inclinado, que sigue al mouse y vuelve. Se escribe y se tabula. Lo más probable es que no quede: decí si sí.
5. **P-H21**, a 1440, en `/v3#portfolio-el-garage`: el disco de pausa abajo a la derecha del video; pausa y sigue.
6. **T2**, a 1023, 820 y 768: historias (no lomos). A 1024, el acordeón.
7. **T3**, a 390 y 820, bajando hasta el Portfolio: «Portfolio» sube desde abajo, pasa por delante del logo y queda arriba, y después entran las historias, tranquilas.
8. **T4/T5**, a 390, 375 y 360, en el teléfono o con el táctil emulado:
   - la barra de arriba se llena en 10 s y pasa a la siguiente;
   - mantener apretado pausa la barra y el video;
   - toque a la izquierda o a la derecha, y deslizar de costado;
   - deslizar hacia arriba va a Demos y hacia abajo, al título;
   - un solo sonido por toque;
   - la ficha abajo, en el último cuarto.
9. **T6/T7**, «la tuya» en las historias: no pasa sola; los toques sobre los campos escriben (no cambian de historia); con un campo enfocado nada avanza.
10. **T8**, con la rueda (a 820 con mouse) y con el dedo: el scroll no avanza las historias.

## 15. Los arreglos F1–F7 (2026-10-20)

Valentino miró la Cola 2 y encontró bugs que un navegador hubiera agarrado: casi todo se había commiteado sin verlo andar en el sitio. Desde acá cambia el método:
1. Antes de arreglar, el bug se reproduce en el arnés (Playwright con el Chrome del sistema contra el dev, :3002) y la prueba da ROJO.
2. Con el arreglo da VERDE, y el control positivo (el defecto reintroducido) vuelve a dar rojo.
3. Nada se commitea sin verlo andar en el navegador.
4. Cada grupo de arreglos es un commit, con su lista de qué mirar.

### 15.1 F1 + F2 · La rueda: el Portfolio se ve siempre

**F1 · Reproducido en rojo** (`scripts-carga/entrada.ts`): desde `/v3#quienes-somos`, la rueda hasta pasar el Portfolio, grabando cuadro a cuadro el paso, el panel, la barra y el encabezado. Los cuatro casos dieron rojo:

| Ancho | Gesto | Pasos (`+`: con el panel adentro) | Violaciones |
|---|---|---|---|
| 1440 | muescas sueltas (cada 700 ms) | -1 → 0 → 1 → 2+ → 3+ → 4+ | no aterrizó en el primero, proyectos sin panel |
| 1440 | ráfagas (5 muescas en 200 ms) | -1 → 4 | no apareció |
| 1024 | muescas | -1 → 0 → 1 → 2+ → 3+ → 4+ | igual que a 1440 |
| 1024 | ráfagas | -1 → 4 | igual que a 1440 |

**Las causas, en los cuadros:** son dos.
- **Con muescas:** el paso 0 se publica en el pin y la muesca siguiente (455 ms después) ya avanza a Esquina, porque la rueda mandaba apenas el paso estaba adentro. Pero el panel entra recién a los ~1,9 s (la cámara, el título, la píldora y el panel, A10), así que El Garage y Esquina pasaban sin panel. La ráfaga no tenía que ver acá: la matriz de A8 no lo veía porque frenaba la rueda apenas el paso estaba adentro.
- **Con ráfagas:** la de A2.3 salteaba el Portfolio entero, como pedía la spec equivocada.

**F2 · El arreglo** (A2.3 sale entero):
- `rueda.ts`: sale la ráfaga (`rafagaDeLaRueda`, `?rafaga=`, `entraConLaRafaga`). Entra `tiraDeLaEntrada`, pura: afuera del tramo, el evento que lleva la página adentro (el destino de Lenis MÁS este evento) aterriza en El Garage bajando y en «la tuya» subiendo, por lejos que vaya.
- `useRuedaDelPortfolio.ts`: antes que nada, la entrada. El evento que entra se traga y vuela al primero del sentido. Mientras el panel no terminó de entrar, la rueda se traga entera y el gesto queda disparado: el resto del impulso se descarta.
- `useMandosDelPortfolio.ts`: `atrapa` y `entrando`. `manda` espera además a `entradaLista`.
- `usePortfolio.ts`: `entradaLista` pasa a `true` 700 ms después de que el orden prende el panel (su transición).
- Adentro no cambió nada: cada gesto es un paso (`gestoDeLaRueda`: una muesca, una ráfaga o la inercia del trackpad es UN gesto), y a Demos se pasa recién después de «la tuya».
- En las historias (debajo de 1024) la trampa no corre: la rueda sale, como en B (lo mira F5).
- **El control positivo:** `window.__defectosDelPortfolio = 'rueda-en-la-entrada'` lo pide el arnés antes de cargar (nunca la URL), y vuelve la rueda de antes: sin la trampa y con pasos mientras el panel entra.

**En verde** (Chrome del sistema, contra el dev):
- `entrada.ts`, 11 corridas:
  - bajando desde Quiénes somos: 1440 y 1024 × muescas, ráfagas y trackpad;
  - subiendo desde Demos: 1440 × muescas, ráfagas y trackpad, y 1024 × ráfagas.
  - Todas `-1 → 0+ → 1+ → 2+ → 3+ → 4+` (subiendo, al revés), con un paso por gesto y sin la píldora corrida sin panel.
- **El control:** `DEFECTO=rueda-en-la-entrada`, 1440 con muescas, vuelve a dar rojo (`-1 → 0 → 1 → 2+…`).
- **La ráfaga en la matriz** (`MODO=rafaga`, reemplaza a la de A2.3), 16 de 16:
  - entrar bajando y subiendo: una ráfaga y, con el paso ya en el de aterrizaje y el panel todavía afuera, otra; aterriza en El Garage o en «la tuya» y no pasa por otro;
  - adentro bajando y subiendo: una ráfaga da UN paso.
  - Las cuatro variantes van con muescas y con el trackpad, con y sin hover.
  - **Su control** (`CONTROL=rafaga`, la rueda de antes): las 4 de entrar con muescas fallan, 4 de 4 (aterrizan en Esquina o en Banú).
- **A8, las 24 de la rueda**, incluidas las 12 del trackpad que vuelven: 24 de 24, tres idas y vueltas cada una. El control de A8.1 sigue en rojo.
- **Lo que el arnés encontró del propio arnés:** cada evento de rueda de Playwright tarda ~64 ms, así que su «trackpad» dura ~2,9 s y su cola ya cubre la entrada entera.
  - La primera versión mandaba la segunda ráfaga después de la entrada, y avanzaba uno: eso es correcto por spec.
  - La segunda la mandaba 500 ms después, cuando el paso todavía era -1, así que el control no discriminaba.
  - Ahora la segunda va con el paso ya en el de aterrizaje y el panel afuera. Es el caso de F1.
- **Fotos** (`scripts-carga/fotos.ts`): ráfaga desde la aproximación, a 1440 y 1024. A los 3,5 s está El Garage con el panel adentro; otra ráfaga lleva a Esquina.

**Lo que se reemplazó por la spec**, cada uno con su control:
- s76 §40 «A2.3 · La ráfaga: el Portfolio no se recorre» → «F2 · La entrada atrapa la rueda» (la regla pura, el cableado y que A2.3 salió).
- s76 §41 «La ráfaga en la matriz» → «F2 · La ráfaga y la entrada con la rueda, en el arnés» (las dos cuentas).
- s76 §38: la matriz pasa de 78 a 90 (vuelve el trackpad).
- s76 de B1.2c: «manda sólo con el panel adentro…» suma la espera de `entradaLista`.

**Afuera, anotado:**
- Las teclas y el arrastre de la barra no pasan por la trampa (no son la rueda).
- Un `PageDown` rápido puede seguir pasando el Portfolio.
- Una tecla en los 200 ms entre la píldora y el panel puede correr la píldora sin panel.
- La matriz A8 entera (las 90) va en las mediciones del final.

**Qué mirar (F1 + F2):**
1. `/v3#quienes-somos`, a 1440 y a 1024: bajá con la rueda de a una muesca. El Portfolio entra entero (título, píldora y panel) en El Garage. Mientras entra, las muescas no hacen nada; después, cada muesca es un proyecto: Esquina, Banú y «la tuya». Recién después de «la tuya», Demos.
2. Lo mismo con un golpe fuerte de la rueda o con el trackpad: aterriza en El Garage y lo que sobra se pierde.
3. Desde Demos subiendo: entra en «la tuya» y sube de a uno hasta El Garage. Después, hacia arriba.
4. Que la espera de la entrada (unos 2,5 s con la rueda trabada) no se sienta como un cuelgue. Si se siente, se acorta el orden de la entrada (título, píldora y panel); la rueda la sigue igual.

### 15.2 F3 + F4 · La píldora que vuelve y el video del panel

**F3 · Reproducido en rojo** (`scripts-carga/pildora.ts`): cuadro a cuadro (rAF), el rectángulo de la píldora contra el del panel, entrando con una muesca y saliendo con otra hacia arriba, dos vueltas por ancho.
- **A 1440 y 1280:** la entrada da 0 cuadros, pero la salida da 10 a 13. A2.2 hacía volver la píldora a la par de la salida del panel: su borde derecho se expandía (a 1440, hasta 789) cuando el panel todavía estaba en 749. A 1440 se metía 9 cuadros sobre el video.
- **A 1024:** 247 de 420 cuadros. Ahí la píldora corrida (96–634) no entra en la columna (538 px contra 400 libres) y descansa sobre la franja de arriba del panel (desde 512), por diseño de A2.1: el medio arranca 16 px debajo de ella.

**F3 · El arreglo** (`orden.ts`): la barra se apaga con el panel ya afuera (`c.panel + ORDEN.panelS`), así la vuelta de la píldora (la expansión y después la contracción) nunca se cruza con él. La salida dura lo mismo (1,82 s): la cámara espera la caída del título, que es más larga. Es la vuelta que tenía B1.2d A antes de A2.2.
- **El defecto para el control:** `pildora-con-el-panel` (`medida.ts`, lo pide el arnés antes de cargar) es la salida de A2.2, tal cual.

**F3 · En verde:**
- 1440 y 1280: 0 cuadros cruzados, entrando y saliendo, en las dos vueltas.
- **El control:** con `DEFECTO=pildora-con-el-panel`, la salida vuelve a 10 a 15 cuadros (rojo).
- **A 1024:** el criterio literal sigue en rojo (248 cuadros entrando y 22 saliendo), todos por el reposo de diseño. Con el medio (el video), 0 cuadros. **Es una decisión visual, va al FRENO:**
  - (a) queda así: la píldora sobre la franja de arriba del panel, nunca sobre el video;
  - (b) la píldora se esconde mientras el panel está adentro, en los anchos donde no entra en la columna;
  - (c) el panel arranca debajo de la píldora en esos anchos.

**F4 · Reproducido en rojo** (`scripts-carga/medio.ts`): por ancho y por proyecto, el video contra su columna (lo que deja la tira entre sus rellenos).
- A 1440, el 100 %.
- A 1280, 1180 y 1024, el 77,9 %, 74,8 % y 67,8 %: A2.1 lo achicaba lo mismo que bajaba.

**F4 · El arreglo:**
- **El tamaño:** el video vuelve a su tamaño (`ANCHO_DEL_MEDIO`, como a 1440) y se corre 16 px debajo de la píldora.
- **El aire, solo con el despeje** (`AIRE_CON_DESPEJE`, `medios.ts`):
  - entre la ficha y «Visitar sitio», de 20 a 8 px;
  - el sobrante de abajo, de 48 a 16 px.
- **Si aun así la ficha no entra, el medio es lo único que cede alto:**
  - el medio va con `min-h-0`, la región no se encoge (`shrink-0`) y la figura lleva `maxHeight: 100%` con su proporción;
  - Chrome transfiere el tope de alto al ancho, y el video se achica lo justo y nada más;
  - con `flex-1 min-h-0` en la región, «Visitar sitio» quedaba cortado por el panel.

**F4 · Medido después:**

| Ancho | El Garage | Esquina | Banú | «Visitar sitio» |
|---|---|---|---|---|
| 1440 | 100 % | 100 % | 100 % | 852 de 900 |
| 1280 | 79,4 % | 98,3 % | 98,3 % | 784 de 800 |
| 1180 | 80,7 % | 100 % | 100 % | 784 de 800 |
| 1024 | 73,1 % | 100 % | 100 % | 752 de 768 |

- El video arranca 16 px debajo de la píldora en los tres anchos con despeje, y en ninguno la ficha desborda.
- **Lo que falta para que El Garage vaya al 100 %** (su ficha es la más larga: «El problema» ocupa 6 renglones a 1024):

| Ancho | Con los 16 px de sobrante abajo | Sin sobrante |
|---|---|---|
| 1024 | 47 px | 31 px |
| 1180 | 43 px | 27 px |
| 1280 | 52 px | 36 px |

- A 1280, a Esquina y Banú les faltan 5 px.
- **No achiqué el video a mano:** se achica solo lo que falta, y solo cuando falta. **Va al FRENO:** acortar la ficha de El Garage, sacar más aire, o aceptar el achique.
- **El control:** es la corrida de antes del arreglo, con el achique de A2.1 puesto: los tres proyectos dan rojo en los tres anchos.

**Las afirmaciones que se reemplazaron por la spec** (s76 §19 de B1.2c, el orden), con su control:
- la salida pasa a `CEBp@0.00`, `CeBp@0.42`, `Cebp@0.70` y `cebp@1.82` (con el título del DOM, 0,58, 0,70 y 1,18);
- «la expansión a ±50 ms de la salida del panel» pasa a «la vuelta arranca con el panel ya afuera». El control es la salida de A2.2;
- y el defecto que pide el arnés es la salida de A2.2, tal cual.

**Qué mirar (F3 + F4):**
1. `/v3#portfolio-el-garage` a 1440 y a 1280: salí del Portfolio con la rueda (hacia arriba o después de «la tuya»). La píldora vuelve a su lugar recién cuando el panel se fue; en ningún cuadro pasa por encima del panel ni del video. Fijate si la vuelta se siente tarde.
2. A 1024, el mismo recorrido: la píldora descansa sobre la franja de arriba del panel (nunca sobre el video). Elegí (a), (b) o (c).
3. A 1280, 1180 y 1024, Esquina y Banú: el video del mismo tamaño que a 1440 (toda su columna), 16 px debajo de la píldora; «Visitar sitio» entra con 16 px abajo.
4. El Garage a esos anchos: su video más chico (73 a 81 %). Decidí qué hacemos con los px que le faltan.
