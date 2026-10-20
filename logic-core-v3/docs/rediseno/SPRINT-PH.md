# SPRINT P-H — los pedidos de servicios al home

Rama `rediseno/home`, sobre B1.2d A (`36881065`). Cola desatendida del 18 de octubre de 2026, TAREA 1. Los pedidos P-H vienen del carril de servicios (`docs/servicios/SPRINT-M1.md` §pedidos y la verificación del merge de B1.2c). Un commit por punto, o agrupados cuando tienen sentido juntos, y los archivos van por nombre.

## 1. Qué se hizo, punto por punto

| Punto | Commit | Qué |
|---|---|---|
| P-H24 (1/2) | `91413a5b` | `CONTRATO.md` de la skill `pagina-home-based` es el que copió Valentino (sha256 `F90110149AC349BA…`). El de `875e9d53` era otro archivo. |
| P-H24 (2/2) | `8bf0bfdc` | Las rutas y los símbolos de los cinco archivos de la skill, verificados contra el código, sin cambiar el criterio. La línea de O-10 entra al gate. |
| P-H10 + P-H12 | `54766fc1` | El modal de contacto: el foco vuelve al control real que lo abrió, y las caras de la placa no tapan la X. |
| Finales de línea | `f1cd4b4e` | s38, s44 y s74 normalizan CRLF a LF antes de buscar. |
| P-H21 | `eb4a3bbc` | `BotonPausa`, la pausa común de un video en bucle. Es sólo el componente, sin integrar. |
| P-H23 | `97e5c667` | La llave gana un punto de registro (`registrarInventos`) para los textos genéricos de otras carpetas. |
| P-H18 + P-H25 | `6fbf7cd6` | El gatillo común sube a `_secciones/_contrato/`, con la guarda en reposo. El remate de Tu panel la trae y su marcado queda idéntico. |
| s77 | `6fbf7cd6` | La suite del sprint: 35 afirmaciones, 14 controles positivos. |

### 1.1 P-H24, la skill

- **El sha.** El commit `91413a5b` deja `CONTRATO.md` exactamente como lo copió Valentino (`F90110149AC349BA…`). Después, `8bf0bfdc` le corrige siete citas contra el código, así que el archivo de hoy tiene otro sha (`01C992127457075F…`). La copia exacta queda en `91413a5b`, y el diff de `8bf0bfdc` es sólo de rutas y nombres.
- **Lo corregido:**
  - en los congelados, la ruta completa de `auth.ts` (`src/auth.ts`, no los otros dos `auth.ts` del repo);
  - las rutas de `lente.ts`, de `TRAMO_ESTIRADO` y de `secciones.ts`;
  - `Textos` es el módulo `Textos.tsx` (exporta `Cuerpo`, `Caption` y `Micro`);
  - el modal abre con `data-abre-contacto="panel"` (sin valor, lleva al formulario del pie);
  - la calidad es «plena o compacta» (`NivelDeCalidad`);
  - las rutas de `theme-develop.css` y de `acento.ts`, y los tokens claros por nombre;
  - `data-signo-de-la-tuya` se fue (se sacó en B1.2b);
  - `chrome/`, que no existe, pasa a `src/components/layout/` (el chrome del sitio vivo).
- **El gate de la skill** suma «No corras `next build` salvo que el prompt lo pida (O-10)».
- **`git check-ignore`:** la skill no está ignorada. `.claude/settings.local.json` sí lo está, por el ignore global.

### 1.2 P-H10 + P-H12, el modal de contacto

- **P-H10, el foco.** Los CTA de Servicios ponen `data-abre-contacto` en un `div`, que no recibe el foco, así que al cerrar el foco quedaba en `body`. Ahora la delegación guarda el control tocado adentro del disparador (`origenDelClic`). Al cerrar, el foco vuelve a ese control (`focoDelOrigen`). Si el origen es un envoltorio, va a su primer focalizable, y si el control ya no está en el documento, no va a ninguno.
- **P-H12, la X.** Las caras de la placa 3D iban después de la hoja y tapaban la X cuando se pedía el elemento del punto. Ahora no reciben el puntero.
- **Probado en el sitio con el teclado** (foco, Enter, Esc; sonda `scratchpad/b12d/ph-contacto.ts`, a 1440):
  - la barra, el CTA del hero y el CTA de un servicio: el foco vuelve a su control;
  - la X: el elemento de su punto es la X y el clic la cierra;
  - «la tuya» no abre el modal (su formulario es propio, en la tira): 0 disparadores.
- **Una corrida que no se repitió.** Una corrida anterior de la sonda dejó el foco en `body` con el CTA de un servicio. La causa no quedó establecida: esa corrida eligió un botón escondido (otra tira). La sonda se corrigió para elegir un botón a la vista y arriba de todo en su punto, y con eso pasa. Está en la lista del FRENO.
- **s25** suma las afirmaciones con su control (35).

### 1.3 Finales de línea

- **El defecto.** En el worktree de servicios, que está en CRLF, s38, s44 y s74 buscaban textos de varias líneas y no encontraban nada, y dos controles positivos no reemplazaban.
- **El arreglo.** Ahora leen normalizado a LF.
- **Los controles.** Cada uno suma dos: el archivo pasado a CRLF y leído normalizado pasa, y su defecto real escrito en CRLF sigue fallando.
- **Resultado:** s38 57, s44 45 y s74 34 afirmaciones.

### 1.4 P-H21, la pausa

- **Qué es.** `_componentes/medios/BotonPausa.tsx` es un `<button>` con nombre accesible fijo («Pausar …») y el estado en `aria-pressed` (apretado = en pausa). El lector anuncia el mismo control en los dos estados.
- **Cómo se ve.** Es el disco de vidrio del botón de sonido del home, con los íconos de lucide (`Play` y `Pause`, trazo 1,5). El anillo de foco es el de la casa.
- **Dónde iría** (anotado en su docblock y no integrado):
  - el video de la tira activa del Portfolio (`trabajos/portfolio/MedioDeLaTira.tsx`, en la tira del escritorio y en la historia del teléfono);
  - el video de cada servicio (`servicios/VideoDeServicio.tsx`).
  - Las demos de Tu panel ya tienen la suya.
- **Padrones.** Entra a `s3-archivos` y a `s3-piezas`: s3-foco lo cuenta como pieza interactiva.

### 1.5 P-H23, el punto de registro de la llave

- **Cómo se usa.** `registrarInventos(origen, casillas)`, en `_contrato/inventado.ts`, deja que otra carpeta (las páginas de servicios) declare sus textos genéricos sin editar `inventado.ts` ni `llave.ts`. `llave.ts` sigue siendo una sola constante, la que lee el guardián del build.
- **Las reglas de cada casilla registrada:**
  - cumple lo mismo que las del home: su pedido lleva su marcador y la mentira no está vacía; si no, el registro tira;
  - pasa por la misma puerta (`conLlave`): con la llave apagada se lee el marcador;
  - la restauración del escáner la conoce: `sinLoInventado` y sus dos variantes usan `todosLosInventos()` por defecto.
- **Lo que no cambia.** `INVENTOS` y `LISTA_DE_INVENTOS` siguen siendo sólo los del home (s21 los cuenta contra las secciones, 83/0).
- **El escáner de producción sigue bloqueando:**
  - los detectores no le dan excepción a lo registrado: la mentira, escrita suelta, los dispara;
  - el escáner del contenido real sólo resta los literales exactos registrados: una cifra escrita a mano llega entera y lo pone en rojo (control positivo en s77).

### 1.6 P-H18 + P-H25, el gatillo común

En `_secciones/_contrato/`:

- `disparo.ts` es la máquina pura de cuatro estados (`quieto`, `espera`, `puesto`, `ido`), con las reglas del remate. Trae además:
  - la guarda en reposo (`siguienteEstado` con el evento `reposo`);
  - `aLaVistaEn`, que con alto 0 (la pestaña oculta) no ve nada;
  - la línea (`LINEA_DEL_DISPARO`, 6 %) y `margenDelDisparo`.
  - Es la de servicios (`_servicios/movimiento/disparo.ts`), que desde acá se reemplaza por el import.
- `reposo.ts` (`vigilarElReposo`) es la guarda en el tiempo. Funciona así:
  - usa el escucha compartido del scroll (`_lib/scrollEnMovimiento.ts`) y el quieto del asiento (`ASIENTO.quietoMs`);
  - el primer reposo llega aunque la página no se mueva;
  - quien la usa la arranca con el primer aviso de su observador.
- `Gatillo.tsx` es el componente común: el de servicios, con la guarda adentro.

En Tu panel, la sección del home que lo usa:

- **La línea y el margen.** `tu-panel/entrada.ts` toma los dos del contrato: `DISPARO_DEL_REMATE` es `LINEA_DEL_DISPARO`, y `margenDelDisparo` se reexporta. Queda una sola definición en las secciones.
- **La guarda.** `Remate.tsx` la arma con el primer aviso de su observador y la suelta al desmontarse. Con el scroll quieto, si la fila asoma y el remate no entró (o se fue), entra con su gesto. Su observador, su cronograma y sus animaciones no cambian.
- **Un arreglo que la guarda hace necesario.** `reproducir` ya no toca una animación que llegó al lado pedido. Antes, `play()` la rebobinaba y repetía el gesto. Pasaba al cruzar la línea bajando después de que la guarda la había puesto, y también en una vuelta repetida.
- **El marcado servido** de Tu panel (quieto y animado) y el del remate solo dan las mismas huellas sha256 que en `f1cd4b4e`, antes del cambio. s77 las fija.
- **Los invariantes que leen el remate** pasan sin tocarse: s6-tu-panel 167, s41 59, s42 49, s75 55 y s7-contrato 31.

## 2. La verificación

- lint de los 11 archivos tocados: limpio.
- `tsc --noEmit` (con 4 GB): 0 errores.
- `npm run verificar`: los 8 grupos rojos de la base y ninguna falla nueva (§2.1).
- s77: 35 afirmaciones, 14 controles positivos, 0 fallas.
- s74 34 (32 en la base: los dos controles de finales de línea de `f1cd4b4e`), s75 55 y s76 622, sin fallas, como en la base.
- No se corrió `next build` (O-10).

### 2.1 `verificar` contra la base

- **La corrida:** sobre el árbol que después quedó en los tres commits (`eb4a3bbc`, `97e5c667` y `6fbf7cd6`), con 4,9 GB libres. Dio 84 pasos y 8 con falla: s1, s2, s3, s4, s5, s7, s8 y s17. Son los de la base.
- **La comparación:** la lista de fallas (127 líneas) contra la de B1.2d A (`scratchpad/b12d/fallas-b12d.txt`, 127 líneas). Difieren sólo en dos cuentas de una misma línea del agregado s3:
  - de 254 a 256 afirmaciones: `BotonPausa` entra a s3-foco;
  - de «81 suites» a «82 suites»: s77 es nueva.
  - La falla de esa línea es la misma de la base: las 15 suites s23 a s39 sin corredor.
- **Los agregados que tocó el sprint**, en verde: s6 630, s21 111, s25 35, s38 57, s44 45, s74 34, s75 55, s76 622 y s77 35.

## 3. Lo que tiene que mirar Valentino (FRENO P-H)

1. **P-H25, la guarda del remate** (`/v3`, Tu panel, a 1440 y a 390). Bajá hasta que «Y más…» quede apenas asomado abajo, en la franja de debajo de la línea, y soltá la rueda. Tiene que entrar con su gesto unos 180 ms después. Subí hasta que se vaya y pará con la fila asomando abajo: tiene que volver a entrar. Bajá cruzando la línea: no se tiene que repetir el gesto.
2. **P-H10, el foco** (`/v3`, a 1440, con el teclado). Tabulá hasta Contacto en la barra, Enter, Esc: el anillo vuelve a Contacto. Lo mismo con el CTA del hero y con el CTA de un servicio. El caso a mirar es el del servicio: una corrida de la sonda lo dejó en `body`.
3. **P-H12, la X** (`/v3`, a 1440). Abrí el contacto desde la barra y cerrá con un clic en la X.
4. **P-H24.** `CONTRATO.md` ya no tiene el sha de tu copia: tiene siete citas corregidas (§1.1). Si preferís la copia exacta, está en `91413a5b`.

## 4. Commits

En orden: `91413a5b`, `8bf0bfdc`, `54766fc1`, `f1cd4b4e`, `eb4a3bbc`, `97e5c667` y `6fbf7cd6`. Después, este log. Todo por nombre de archivo y sin push: `lente.ts` y `.gitignore` quedan afuera.

## 5. Fuera de scope (anotado, no hecho)

- **Integrar `BotonPausa`** en `MedioDeLaTira.tsx` y `VideoDeServicio.tsx` va cuando se toquen esas piezas.
- **Servicios** reemplaza su `disparo.ts` y su `Gatillo.tsx` por el import del contrato en su carril. Sus pruebas los citan por la ruta de ellos.
- **El `Gatillo` común no suma CSS.** La duración y la curva de los tokens que usa ya están en el home (el Portfolio, Quiénes somos y los títulos 3D). No lo usa ninguna sección del home todavía: el remate sigue con sus animaciones propias.
- **Para liberar memoria** se bajó el servidor de desarrollo de :3000: el gate no lo necesita. El de servicios (:3001) no se tocó.

## 6. P-H26 y P-H27 (cola P-H28, 2026-10-19)

P-H28 cambió la prioridad: B12a va antes que el subsprint B de B1.2d. A2, B y B12a.1 ya estaban commiteados. B12a.2 estaba en curso: se llevó a un punto estable y se commiteó (`edd64c7c`). Después vinieron estos dos.

### 6.1 P-H26, el foco al cerrar el contacto

**La causa** la midió servicios (`docs/servicios/SPRINT-R1.md` §5.1):
- `devolverElFoco` pedía un solo `requestAnimationFrame`, pero `onExitComplete` corre ANTES del desmontaje de la hoja.
- Si el cuadro caía en esos ~4 ms, el foco iba al botón, la trampa del diálogo lo devolvía a la hoja, y la hoja, al irse, lo dejaba en `body`: 30 de 108 cierres.

**El arreglo** (`_chrome/contacto/apertura.ts`):
- `devolverElFoco` espera cuadro a cuadro a que la hoja (`[data-pieza="contacto"]`) ya no esté en el documento, hasta 30 cuadros, y recién ahí enfoca.
- Si el contacto se reabre mientras espera, no hace nada.
- Si el foco no quedó en el que abrió (ya no está o no lo recibe), va al respaldo, `destinoDeRespaldo`: el primer disparador del contacto a la vista, el «Contacto» de la barra antes que los CTA. Si no hay ninguno, nadie.
- `onExitComplete={devolverElFoco}` no cambió: s25 y s60 lo fijan.
- `?devolucion=un-cuadro` vuelve a la devolución de antes. Es sólo para el control positivo de la sonda.

**La prueba:** s77 §4 simula la carrera en cuadros, con la trampa y el desmontaje.
- El foco vuelve al que abrió con la hoja desmontada antes del primer cuadro, o 1, 2 y 4 cuadros después, y se enfoca una sola vez.
- **El control positivo:** con un solo cuadro y la hoja desmontándose después, el foco cae en `body`.
- Con la reapertura, el foco no se toca.
- Con el origen suelto o que no lo recibe, va al respaldo.

**La sonda en el sitio:** `scripts-carga/foco-del-contacto.ts`. Es la de servicios llevada a `/v3`, con los mismos pasos por cierre y los tres disparadores del panel: la barra, el CTA de un servicio y el CTA del final.
- 108 cierres: 1440 y 1024 con 3 × 12, y 390 con 2 × 18 (sin la barra).
- El control es la misma corrida con `?devolucion=un-cuadro`.
- **No corrió por memoria.** El dev del home (:3002) compiló `/v3` y, con el dev de servicios de otra sesión en :3001, quedaron 1,1 GB libres: menos de los 3 GB para abrir el Chromium. Mientras esperaba, el reaper de Claude Code cortó el dev por memoria. Sus hijos (el CLI de next y el servidor, 3 GB) quedaron vivos y se terminaron con `taskkill /T`. El aviso del reaper dice que no se vuelva a levantar sin pedirlo, así que el criterio de 0 en 108 queda sin medir. Se corre así:
  ```
  npm run dev -- -p 3002
  npx tsx scripts-carga/foco-del-contacto.ts 1440 12
  npx tsx scripts-carga/foco-del-contacto.ts 1024 12
  npx tsx scripts-carga/foco-del-contacto.ts 390 18
  npx tsx scripts-carga/foco-del-contacto.ts 1440 12 "?devolucion=un-cuadro"
  ```
  El último es el control: tiene que volver a fallar.

### 6.2 P-H27, quién puede importar `BotonPausa`

- s77 §1 exigía que los que importan la pausa fueran EXACTAMENTE el panel del Portfolio. Con el merge de servicios (`_servicios/movimiento/VideoDeFondo.tsx` la importa, como pide P-H21) quedaba en rojo.
- **Ahora es una lista explícita:** `PUEDEN_IMPORTAR_LA_PAUSA` tiene `MedioDeLaTira.tsx`, que es obligatorio, y `_servicios/movimiento/VideoDeFondo.tsx`.
  - Pasa: el video de fondo de servicios importándola.
  - Controles: otro archivo que la importa, y el home sin su integración.
- El resto de s77 no cambió.

### 6.3 La verificación

- lint limpio en los cuatro archivos tocados y `tsc` con 0 errores (la sonda nueva incluida: `scripts-carga` entra en el `tsconfig`).
- `verificar`, en mitades en primer plano, y los 17 scripts sin agregado: los 8 grupos rojos de la base con las mismas suites y cuentas, y todo lo demás en verde. s25 da 35, s60 28 y s77 44.
- Sin `next build`.

### 6.4 Qué mirar (P-H26)

1. `/v3`, a 1440, con el teclado: Tab hasta Contacto en la barra, Enter, Esc. El anillo vuelve a Contacto. **Repetilo 10 veces**: antes, una de cada cuatro caía en `body`.
2. Lo mismo con el CTA de un servicio (en Servicios) y con el CTA del final, a 1440 y a 390.
3. Con `/v3?devolucion=un-cuadro`, lo mismo tiene que fallar a veces: es la devolución de antes.

## 7. P-H26 medido en el sitio y lo que encontraron las mediciones (2026-10-20)

**La sonda del foco** (`scripts-carga/foco-del-contacto.ts`):
- **Cambios en la sonda:**
  - corre en el Chrome del sistema a la vista (el Chromium sin cabeza y sin GPU se caía a 390);
  - suma el «Hablemos» del hero (desde 1024 el CTA de cada servicio está escondido y el que rota no existe);
  - tiene `SOLO=` y `PRIMERA_MS=`, porque la primera llegada al final tarda.
- **1440:** barra 12 de 12, hero 12 de 12, final 11 de 12 (más una vez que no abrió).
- **1024:** lo mismo.
- **390:** el CTA de un servicio 18 de 18 (el caso que caía en `body`) y el hero 18 de 18.
- **106 cierres, 0 en `body`.**
- **El control (`?devolucion=un-cuadro`, la devolución de antes) tampoco falla en el home:** 24 de 24 a 1440 y 18 de 18 a 390 con el CTA de un servicio. La carrera (30 de 108 en las páginas de servicios) no se reproduce acá. El control que discrimina es el modelo de s77 §4, con la trampa y el desmontaje simulados. **Queda medirlo en servicios después del merge.**

**Lo que encontraron las mediciones (para P-H, sin arreglar esta noche):**
1. **La primera llegada al final no abre el contacto con Enter.** A 1440 y 1024, la primera vez que se lleva el foco al CTA en volumen del final y se aprieta Enter, el contacto no se abre (4 de 4 corridas largas; en una corrida corta, con 6 s de espera, sí abrió). Las siguientes, sí. Parece la llegada del final: el CTA no responde hasta que termina.
2. **A 390, el ancla del CTA del final (`a[data-pieza="cta-en-volumen"]`) no es el que se ve:** su caja queda en y = 18.933, fuera del cuadro aun después de `scrollIntoView`. Ni un toque ni Enter la abren.
3. **A 390, la página se cae («Page crashed») después de unas 21 aperturas seguidas del contacto,** en tres de tres corridas y en los dos navegadores. Los nodos del DOM crecen unos 166 por apertura (3.693 → 8.212 en 21) y el heap no. Puede ser que la hoja no se libere, o que lo pague otro proceso. A 1440 y 1024 aguanta 36.

## 8. P-H30 · Los tres hallazgos de las mediciones (2026-10-20)

Todo con el Chrome del sistema a la vista contra el dev del home (:3002), con `/api/` bloqueado y con el movimiento reducido apagado por emulación (TeamViewer apaga las animaciones de Windows y Chrome pide movimiento reducido).

### 8.1 La «fuga» del contacto: era la sonda, no el sitio

**El arnés:** `scripts-carga/fuga-del-contacto.ts`.
- Abre y cierra el contacto N veces seguidas: el CTA del hero, Enter y Esc.
- Después de cada cierre fuerza dos recolecciones de basura y mide los nodos, los oyentes, el heap y lo que queda suelto, agrupado por pieza.
- El criterio es el de P-H30: 50 aperturas a 390 y a 1440, los nodos estables (±5 %) y la página sin caerse.

**El rojo:** a 390, los nodos crecían 182 por apertura aun recolectando (4.400 → 12.590 en 50) y los oyentes 15. Lo que quedaba suelto era el `div[data-pieza="contacto"]` entero, uno por apertura.

**Quién lo retenía, en una foto del heap:**
- Cada contacto suelto se marcó con un objeto de una clase propia antes de la foto, y se recorrió el camino más corto desde la raíz.
- El camino es `(GC roots) → (Global handles) → «DevTools console» → <div role="dialog">`.
- Es un `ElementHandle`: `page.waitForSelector()` devuelve uno del diálogo y la sesión del protocolo lo retiene hasta liberarlo. La sonda de P-H26 (`foco-del-contacto.ts`) y la de anoche esperaban así.
- Ningún oyente quedaba colgado de `window` ni de `document`, y en la página no se loguea nada al abrir ni al cerrar.

**Con esperas que no retienen** (`locator.waitFor`):
- **390:** 50 de 50 aperturas, nodos 3.490 → 3.490 (0,0 %), oyentes 1.119 estables, nada suelto y la página entera.
- **1440:** 50 de 50 aperturas, nodos 3.958 → 3.958 (0,0 %).

**El control** (`CONTROL=handles`, la espera de anoche): rojo, 4.400 → 6.220 en 15 aperturas.

**Lo que cambió:** en el sitio, nada. En las sondas, `fuga-del-contacto.ts` (nueva) y `foco-del-contacto.ts`, que pasa a `locator.waitFor`. **La caída a las ~21 aperturas a 390 no se reprodujo en 50.** La retención de la sonda es la explicación probable: no se pudo cargar a otra cosa.

### 8.2 El CTA del final no abría con Enter en la primera llegada

**El rojo** (`foco-del-contacto.ts 1440`, `SOLO=final`): la primera vuelta da «NO ABRIÓ» y la segunda abre.

**La causa:**
- Antes de que la cara se lea, Enter se tragaba con un `preventDefault` sin nada más (PULIDO 8 G2).
- La transformación llega con retraso, porque la sigue el pin y el pin sigue al scroll suave. Un Enter en ese tramo se perdía en silencio.

**El arreglo** (`CtaDelFinal.tsx`, `DestinoDelCta`):
- El Enter de antes de poder tocarlo no abre en el acto, pero queda pendiente y abre apenas se puede (`ENTER_PENDIENTE_MS`, 3 s).
- Pide la llegada (`alPedirLaLlegada`): el escenario usa la de siempre (`llevarAlCta`) y la lista, la suya (abajo).
- Se cancela si el foco se va.
- El defecto, para el control: `window.__defectosDelCta = 'enter-perdido'`.

**En verde:** 4 de 4 a 1440 y 4 de 4 a 1024.

**El control** (`DEFECTO=enter-perdido`): rojo, «NO ABRIÓ» en la primera vuelta.

### 8.3 A 390, el ancla del CTA del final no era la que se ve

**El rojo:**
- A 390 la sonda nunca abría (0 de 2).
- Antes de su llegada, la caja del ancla medía 3 × 53 px y estaba a ~18.000 px de su bloque.
- `scrollIntoView` llevaba la página a 2.897 px y el ancla quedaba a 18.942, fuera del cuadro. El foco del teclado iba al mismo lugar.

**La causa:** la escena lleva el enlace al plano de «HABLANOS» con una `matrix3d`, para que el toque caiga donde se ven las letras. En la lista ese plano entra deslizándose desde afuera, y antes de llegar se llevaba la caja del enlace con él.

**El arreglo:**
- **`EscenaDelCta.tsx`:** en la lista, el enlace sigue al plano recién cuando se puede tocar. Antes queda en su lugar del DOM. El defecto, para el control: `enlace-corrido`.
- **`CtaTransformado.tsx`, la lista:** el foco del teclado y un Enter antes de poder tocarlo llevan al final de su bloque, donde el CTA ya llegó, como en el escenario.

**En verde:**
- La sonda: 3 de 3 a 390.
- `scrollIntoView` lleva la página a su bloque (21.418) y el ancla queda en el cuadro (top 461 de 844).

**El control** (`enlace-corrido`): la página a 2.897 y el ancla a 18.942, el síntoma de antes.

**Las afirmaciones reemplazadas por la spec:**
- **s59 §1:** el Enter de antes de leerse pasa de «no abre» a «no abre en el acto y queda pendiente».
- **s62 A4e:** el enlace de la lista suma su llegada pedida.

**Qué mirar (P-H30):**
1. **`/v3` a 1440, con el teclado:** Tab hasta el CTA del final («HABLANOS») y Enter apenas llega.
   - Debería verse la página ir al final y el contacto abrirse en cuanto el CTA se lee, sin un segundo Enter.
2. **`/v3` a 390, con el teclado** (o con el lector de pantalla), hasta el CTA del final.
   - Debería verse la página ir al bloque del CTA, con el CTA a la vista; Enter abre el contacto.
3. **El contacto abierto y cerrado muchas veces seguidas, a 390.** Ya no debería pasar nada: la caída era de la sonda.

## 9. P-H31 · Las historias para el precio de servicios (2026-10-20)

Lo pidió servicios para el precio en el teléfono, sobre el componente común de historias (P-H19). La firma está en `B12a-API.md` §6.

**Lo hecho:**
- **a · La transición propia entre pasos, por prop** (`transicion`): durante `ms`, el paso que entra va encima del que se va, envuelto en el `Envoltorio` de la página (con el avance en un valor de Motion y el sentido). Con movimiento reducido, el corte. El Portfolio no la pasa: el corte de siempre.
- **b · El freno del arrastre pasó al componente** (`_componentes/historias/frenoDelArrastre.ts`).
  - Frena mientras las historias están montadas y presentes (`useIsPresent`). Es el `historias && panel` con que frenaba el Portfolio: las monta con su panel, adentro de un `AnimatePresence`, y durante la salida ya no frenaba.
  - `useSinScrollEnLasHistorias` se borró, y sus padrones se actualizaron (s5-archivos y trabajos.invariant).
- **c · Las barras sobre un acento:** `colorDeLasBarras`, con `BARRAS_SOBRE_ACENTO`: el papel, y la pista el papel al 25 %. Las de la tinta daban 2,65:1 sobre el de web y 2,41:1 sobre el peor (el verde).
- **El uso de prueba, fuera del Portfolio:** `/v3/componentes`, la ficha «Historias · tres pasos sobre el acento» (`GaleriaHistorias.tsx`). Son tres pasos sobre el acento de web, con un corte diagonal de prueba (`corteDiagonal.ts`).

**Medido en el sitio** (`scripts-carga/historias-de-prueba.ts`, el Chrome del sistema a 390, táctil, contra el dev):
- **a · La transición:**
  - un toque a la derecha pasa al 2 y otro al 3, con el saliente debajo unos 590 ms y el que entra recortado desde abajo a la derecha;
  - uno a la izquierda vuelve, recortado desde arriba a la izquierda;
  - al terminar, sin recorte ni saliente.
- **b · El freno:** con las historias abiertas, un arrastre del dedo que empieza afuera de la caja mueve la página 0 px; cerradas, 245 px. El control (`CONTROL=sin-freno`), rojo: 245 px con las historias abiertas.
- **c · El contraste**, con los colores que calcula el navegador sobre el acento de web: el relleno 6,65:1 contra el acento y 3,81:1 contra la pista.
- **El Portfolio, idéntico:** la matriz de sus historias (`scripts-carga/historias.ts`) da 12 de 12 sin violaciones a 390, y todas en verde a 820×1180.

**Afirmaciones** (s76 da 698 de 0):
- **§43, nueva:**
  - la transición envuelve el ítem y no hay saliente en reposo; el marcado del Portfolio sin las props es el de antes (las clases de las barras, sin envoltorio);
  - el corte de prueba crece desde la punta de su sentido;
  - el contraste con los tokens del tema, en el peor de los tres acentos: 6,02:1 contra el acento y 3,57:1 contra la pista. Controles: las barras de la tinta, y una pista tan clara como el relleno.
- **Reemplazadas por la spec:**
  - §30: el freno lo trae el componente, con un control nuevo, el freno que sigue en la salida;
  - el padrón de trabajos.invariant: 37 archivos, porque el freno se fue al componente.

**Qué mirar (P-H31):**
1. **`/v3/componentes` a 390, la última ficha:** «Abrir las historias». Tocá a la derecha: el paso 2 entra en diagonal desde abajo a la derecha. A la izquierda, vuelve desde arriba a la izquierda.
2. **Con las historias abiertas,** arrastrá el dedo por el margen: la página no se mueve. Cerradas, sí.
3. **Las barras sobre el azul,** en el papel.
4. **El Portfolio a 390,** igual que antes.
