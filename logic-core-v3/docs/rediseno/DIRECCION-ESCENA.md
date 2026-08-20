# Dirección de la escena · home develOP

- **Qué es esto:** el documento de decisiones consolidadas del rediseño del home. Hasta hoy estaban repartidas en seis reportes de sprint (`docs/rediseno/outputs/`) y en una conversación larga con el dueño del proyecto. Acá quedan en un solo lugar.
- **Qué NO es:** un reporte de sprint. No cuenta qué se construyó ni cómo; cuenta **qué se decidió**. El cómo vive en los reportes y en los docs de módulo de cada archivo.
- **Estado:** escrito en S7 (2026-08-20). Se actualiza cuando una decisión cambia — no cuando se implementa.

> **Regla de lectura.** Lo que está acá es decisión tomada. Lo que todavía no se decidió está en §7, marcado como pregunta abierta. Si algo no aparece en ninguna de las dos partes, no está decidido: se pregunta antes de construirlo.

---

## Índice

1. [El preloader](#1--el-preloader)
2. [La animación principal](#2--la-animación-principal)
3. [Las reglas de la escena](#3--las-reglas-de-la-escena)
4. [La paleta](#4--la-paleta)
5. [Decisiones registradas para sprints posteriores](#5--decisiones-registradas-para-sprints-posteriores)
6. [Dónde vive hoy cada decisión](#6--dónde-vive-hoy-cada-decisión)
7. [Lo que todavía no está decidido](#7--lo-que-todavía-no-está-decidido)

---

## 1 · El preloader

**No está construido. Se construye en un sprint posterior.** Acá queda registrado con precisión para que ese sprint no tenga que inventar nada.

### 1.1 · La secuencia acordada

1. **Pantalla oscura.**
2. El logo **se dibuja con un trazo**. Recupera el gesto del preloader clásico de `main` —las fases `drawing` → `filling` de `PreloaderContext`— pero **más corto y más limpio**.
3. **Antes de que el trazo se complete**, aparecen **"develOP"** arriba y **"Ingeniería para negocios reales"** abajo, con **efecto de aparición**. No de escritura. **No de máquina de escribir.**
4. **En el instante exacto en que el trazo cierra: corte seco de color.** Sin fundido. Fondo claro, logo negro, letras negras. El corte tiene que caer en el frame preciso del cierre del trazo — un cuadro antes o después se lee como error.
5. En ese mismo momento, **el logo y las letras se alejan levemente**. Es el gesto de "presentación de empresa".
6. Las letras **desaparecen con el mismo efecto con que aparecieron**.
7. La capa del preloader **se desvanece** y aparece la escena 3D detrás.
8. El **logo 3D** —el de extrusión gruesa— toma el lugar, va a su **pose inicial** de la coreografía, y de ahí **baja al hero**.

### 1.2 · Las reglas, y por qué

| Regla | Por qué |
|---|---|
| **Sin sonido** | Los navegadores bloquean el audio antes de la primera interacción. En la primera visita —que es la única en la que el preloader corre— no sonaría. Un efecto que no ocurre justo cuando importa no es un efecto. |
| **Sin bloqueo de scroll, en ningún momento** | Ya es la regla del intro actual (`HomeIntro.tsx`): `pointer-events-none`, no toca `overflow`, no llama `lenis.stop()`, no gatea el render. El contenido del hero existe detrás desde el primer paint. |
| **Solo en la primera visita de la sesión** | `sessionStorage`, igual que hoy. |
| **Honra `prefers-reduced-motion`** | Sin secuencia: se entra directo al home. |
| **Sin automatización** | El gate del intro actual ya incluye `navigator.webdriver !== true`, así que ninguna herramienta headless lo ve nunca. No es un descuido: es lo que impide que una corrida automatizada quede esperando la secuencia entera. |

### 1.3 · Dos precisiones que evitan volver a discutirlo

- **El texto del preloader NO es el del intro de marketing.** `IntroLockupText.tsx` escribe letra por letra (`WRITE_MS`, wipe de izquierda a derecha) y su slogan es *"Construimos lo que imaginas"*. El preloader del home usa **aparición** y el slogan **"Ingeniería para negocios reales"**. Son dos piezas distintas y la de marketing no se toca.
- **El preloader es un momento cerrado.** Tiene su propio logo (SVG 2D), sube con el resto de la secuencia y desaparece; **no le entrega nada a nadie**. El paso 8 no es una continuidad medida entre el logo 2D y el 3D: es la escena que aparece detrás y arranca su propia coreografía. Esta separación es la lección de S3b y no se revierte.

---

## 2 · La animación principal

### 2.1 · Qué es

Una **escena 3D persistente** con el logo en un **espacio arquitectónico abstracto**. La cámara lo orbita a lo largo de **ocho pantallas de scroll**.

No es un fondo. Es la pieza principal del home: el contenido de cada sección convive con ella, ocupando el lado del cuadro que el logo deja libre.

### 2.2 · Las ocho pantallas y los seis tramos

El progreso va de 0 a 1 y cubre 8 pantallas, así que **cada pantalla vale 0,125 exacto** y los bordes de tramo caen en múltiplos de esa fracción.

| # | Tramo | Pantallas | Progreso |
|---|---|---|---|
| 1 | Hero | 1 | 0,000 – 0,125 |
| 2 | Quiénes somos (dos personas) | 2 | 0,125 – 0,375 |
| 3 | Números | 1 | 0,375 – 0,500 |
| 4 | Portfolio | 1 | 0,500 – 0,625 |
| 5 | Demos | 1 | 0,625 – 0,750 |
| 6 | Movimiento final y cierre | 2 | 0,750 – 1,000 |

### 2.3 · Cómo se mueve la cámara

- **Scroll con inercia.** La cámara **persigue** la pose del progreso con amortiguación, no salta a ella: cuando el scroll se detiene, la cámara sigue asentándose un momento.
- **Offset de mouse.** El puntero modula azimut y altura. Es modulación, no pose: no entra en los keyframes, así que la pose que se copia del panel sigue siendo la del track.
- **Vira en reposo.** Un balanceo lento y continuo del logo (~1°), con dos períodos inconmensurables para que no se lea como un bucle. Es lo que impide que la escena parezca congelada cuando el scroll está quieto.
- **`prefers-reduced-motion`** apaga las tres.

### 2.4 · Dónde empieza y dónde termina

- **Empieza** en la pose inicial que el preloader entrega (§1.1, paso 8) y baja al hero.
- **Termina** en el cierre: el logo se aleja y la sala se apaga.
- **Después del cierre la escena SE APAGA.** No se tapa con un bloque y no queda una franja asomando. Entran las secciones de servicios y panel.
- **Vuelve para el diferencial.**

### 2.5 · La luz cuenta el recorrido

La iluminación no es una propiedad de la cámara: es del espacio. Vive en dos lugares y ninguno es el keyframe.

- **Un rig de tres puntos.** La principal y el relleno son **del espacio** (fijos al mundo, así que orbitar cambia la iluminación además del punto de vista). El contraluz es **del observador** (solidario a la cámara), porque el problema que resuelve —que el logo se despegue del fondo que le toque detrás— es un problema de vista.
- **Un arco ligado al progreso.** Meseta a luz plena hasta el final de Números —a una sección que alguien está leyendo no se le baja la luz—, un escalón chico en Portfolio y Demos, la caída real en el movimiento final, y el cierre en penumbra.
- **El apagado no es plano.** El ambiente muere antes que las fuentes y el contraluz se resiste: la sala **gana contraste** al apagarse en vez de volverse gris.
- **El sol ES la luz principal**, no una representación de ella. El mismo dato dice dónde está la fuente que se ve, de dónde viene la luz y desde dónde cae la sombra. Los tres se mueven juntos o no se mueve ninguno.
- **Y los dos recorren un arco: el paso del día.** El nivel de luz no es una perilla que baja — es el seno de la elevación del sol. La sala no se apaga porque bajamos un número: se apaga porque atardece. La sombra del logo se alarga y gira con él, que es lo que más comunica que el espacio es real.

---

## 3 · Las reglas de la escena

Son las que hacen que la escena sea de develOP y no de cualquiera. No son preferencias: son el filtro con el que se acepta o se rechaza cualquier elemento nuevo.

1. **Blanco y negro.** Sin luces de color. Base clara `#F7F7F5`, tinta `#111111`.
2. **Nada de iconografía de tecnología.** Ni nodos de red, ni circuitos, ni burbujas de chat, ni ventanas de navegador, ni pantallas, ni engranajes, ni cerebros. Es el imaginario por defecto de "tecnología" y es exactamente lo que este proyecto evita.
3. **Nada orgánico.** Sin rocas, terreno, agua ni vegetación.
4. **Nada brilla por sí mismo.** Todo responde a las mismas luces, así que la sala entera se apaga con el cierre. La única excepción es el sol, que es una fuente y por eso tiene permiso — y aun así se apaga con el arco.
5. **Nada compite en peso visual con el logo.** El logo es el único negro puro del cuadro.
6. **La cuña de adelante queda libre.** Ningún plano suspendido vive a menos de 40° del eje frontal: ahí es donde la cámara se para durante más de medio recorrido, y un plano ahí se metería entre la cámara y el logo.
7. **El fondo de una pose es el azimut opuesto al de su cámara.** Es el corolario de la regla anterior y es lo que hace que la escena se componga: la masa oscura del hero y la cuña libre son la misma decisión.
8. **Sin tipografía en la escena 3D.** Sumar una fuente es sumar un activo y una dependencia. La escala graduada del piso da la unidad de medida sin escribir un número.
9. **Los patrones del fondo salen del vocabulario propio.** Retículas, tramas de rendijas y campos de puntos: lo que el sitio ya usa. No se importan referencias de afuera.

---

## 4 · La paleta

| | valor | qué es |
|---|---|---|
| papel | `#F7F7F5` | el piso y el ciclorama. Es `--color-ds-light-bg` del sistema |
| tinta | `#0F0F0F` | el logo. El único negro puro |
| niebla y fondo | `#EFEFEC` | un escalón por debajo del papel, para que el fondo lejano CIERRE en vez de abrirse |
| masa oscura | `#191917` | los planos suspendidos. **Más claro que la tinta a propósito** |
| estructura aérea | `#3A3A35` / `#2A2A26` | la retícula y sus vigas |
| marcas de piso | `#D7D7D5` / `#E6E6E3` / `#CFCFCC` | registro, marco exterior, cintas |

Los acentos de servicio (cian, verde, ámbar, violeta) **no entran en la escena del home**. Su lugar está en las páginas internas — ver §5.2.

---

## 5 · Decisiones registradas para sprints posteriores

Ninguna de estas se construye todavía. Están acá para que cuando se construyan no haya que volver a decidirlas.

### 5.1 · Efecto "Star Wars" para la sección de trabajos

Espacio profundo con estrellas, y **los proyectos emergiendo desde el fondo hacia la cámara, uno por uno, cada uno con su nombre**.

**Reemplaza a una grilla de portfolio.** Es la decisión de fondo: una grilla muestra todo a la vez y ordena por posición; esto muestra de a uno y ordena por tiempo, que es lo que un recorrido con scroll ya está haciendo.

### 5.2 · El logo con el acento de cada servicio

En las páginas internas, el mismo objeto con distinta piel según dónde estás: **azul en web, verde en IA + automatización, violeta en software.**

**Por qué importa:** convierte el código de color en **estructura**, no en decoración. Hoy los acentos son un color por landing; así pasan a ser una propiedad del objeto que ya sostiene la marca.

Los valores son los que el `CLAUDE.md` ya congela: Web `#06b6d4` · IA `#10b981` · Automatización `#f59e0b` · Software `#8b5cf6`.

### 5.3 · Menú de posición variable

El menú cambia de lugar según la sección, **con una condición**: que el cambio **responda a la composición** —si el logo ocupa un lado, el menú va al otro— y **no sea arbitrario**.

Es una condición, no un detalle: un menú que se mueve sin regla es un menú que se perdió.

### 5.4 · Plan de lanzamiento

**Se lanza con el home solo.** Las páginas internas se desarrollan después, respetando el patrón pero **con movimientos y escenas propias**.

---

## 6 · Dónde vive hoy cada decisión

Todo lo construido vive en `/probe-escena`, una ruta interna con `noindex` y sin un solo link entrante. **El home no se tocó.**

| Decisión | Archivo |
|---|---|
| Los keyframes del recorrido y el arco de luz | `src/app/probe-escena/_components/choreography.ts` |
| Los comentarios de cada keyframe (se editan **ahí**, no en el array) | `choreographyNotes.ts` + `choreographyNotesFrontal.ts` + `choreographyNotesGiro.ts` |
| Las tres variantes de recorrido | `choreographyVariants.ts`, `variantIntima.ts`, `variantArquitectonica.ts`, `variantDramatica.ts` |
| Los comentarios de las variantes | `variantNotes.ts` |
| El rig de tres puntos y cómo se apaga cada luz | `probeLighting.ts` |
| El sol — que es la luz principal | `probeSun.ts`, `SunBody.tsx`, y su posición en `LIGHT_ARC` |
| Niebla, shadow map y oclusión de contacto | `probeAtmosphere.ts` |
| El moiré y sus dos tramas | `probeMoire.ts`, `MoireScreen.tsx` |
| El espacio: planos suspendidos, retícula aérea, pilares | `probeArchitecture.ts` |
| Las marcas de replanteo del piso | `floorMarks.ts` |
| La física: inercia, mouse, vira, deriva del aire | `choreographyPhysics.ts` |
| El editor de keyframes y el export | `choreographyEditor.ts`, `choreographyExport.ts` |
| El intro que hoy corre en el home | `src/components/layout/HomeIntro.tsx` |
| Las comprobaciones estáticas del recorrido | `src/app/probe-escena/__tests__/*.invariant.ts` |

| Reporte | Qué decidió |
|---|---|
| `outputs/PROBE-ESCENA.md` | Que el logo aguanta la órbita. El objeto mate contra el cromado del hero |
| `outputs/S4-RIG.md` | Los keyframes, la física, el ciclorama, la extrusión gruesa |
| `outputs/S5-EDITOR.md` | El editor y el espacio arquitectónico |
| `outputs/S6-LUZ.md` | La luz, la atmósfera y la coreografía calibrada |
| `outputs/S7-ESCENA.md` | El sol, el moiré, la curvatura de los tramos y las variantes |

> ⚠️ **Exportar no es guardar.** El botón del editor copia al portapapeles. La calibración solo existe cuando ese texto se **pega** en el archivo. Ya costó una sesión entera de trabajo.

---

## 7 · Lo que todavía no está decidido

Está acá para que nadie lo dé por resuelto.

1. **Cuál de los cuatro recorridos es EL recorrido.** La base calibrada a mano y las tres variantes (íntima, arquitectónica, dramática) existen para compararse en pantalla. La elección es del dueño del proyecto y no está hecha.
2. **Cómo se ata el recorrido al scroll real.** Hoy el progreso es un slider del probe. Falta el mapeo a las ocho pantallas del layout, con su comportamiento en mobile.
3. **La cola del cierre.** *"Después las letras se van, la cámara se mueve a otros ángulos y termina en el CTA final"* no tiene poses compuestas. El track termina en el cierre.
4. **Cómo entra y sale la escena** cuando se apaga después del cierre y vuelve para el diferencial: si es un fundido, un corte, o la propia luz que se va.
5. **Mobile.** No se midió un solo teléfono ni un solo frame time. Toda la contabilidad publicada es estática.
6. **El encuadre por relación de aspecto.** El recorrido está compuesto en horizontal; en vertical el logo no entra igual y falta decidir si se reencuadra o se recompone.
7. **Qué contenido va en cada una de las ocho pantallas**, más allá de los nombres de los tramos.
8. **La temperatura del cierre**: 7700 K (frío, lo que está hoy) contra los 2000 K (ámbar) que tenía la calibración a mano. Es un número y está argumentado en los dos sentidos.
