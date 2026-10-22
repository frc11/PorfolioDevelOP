# B4 + B12b · La sección Servicios del home y el viaje a las páginas

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B4 · **La sección Servicios del home** (craneado el 2026-10-21). Es más corta que la actual y reemplaza al hub (`/servicios` redirige acá en D8).
  - **La entrada:** sobre papel blanco, con los nanobots grises flotando en el medio desde el arranque.
    - Entra el título «Nuestros servicios», con el subtítulo «Los trabajos de calidad que ofrecemos en develOP.», con el efecto de los títulos que vienen desde abajo (el de los módulos del Panel).
    - El título queda delante de los nanobots.
  - **Gatillos:** la sección se ancla y, desde ahí, cada gesto avanza un servicio, obligado y sin saltear (la misma máquina de estados del Portfolio). Al subir, cada servicio sale por donde entró y los nanobots vuelven.
  - **1 · Desarrollo web**, entra desde la izquierda y se desliza hacia la derecha con una desaceleración final:
    - **antes de que termine de entrar**, los nanobots salen de atrás de «Nuestros servicios», se mueven hacia la derecha, toman el acento oscuro de web y forman un globo (una red de meridianos) debajo del título «Desarrollo web»;
    - **el panel cierra por debajo de los nanobots**, que quedan delante de todo: es el truco de profundidad;
    - **técnica:** el cambio de capa del WebGL de los nanobots (de detrás del título a delante del panel) se hace cuando el enjambre ya salió del contorno del título, para que no se vea el salto;
    - **distribución:** el video a la izquierda, reproduciéndose desde la entrada; el texto en una franja diagonal al medio, con cada renglón arrancando donde lo corta la diagonal; y a la derecha el título, los nanobots y el CTA;
    - **el texto se levanta en 2D**, renglón por renglón, después de que el panel termina de cerrar.
  - **2 · Desarrollo de software**, entra desde la derecha. Es el espejo: el título con los nanobots formando dos engranajes encastrados que giran (acento violeta) y el CTA a la izquierda; el texto en diagonal invertida; el video a la derecha. Los nanobots pasan por delante de todo y se acomodan antes de que cierre.
  - **3 · IA y automatizaciones**, entra desde arriba: el video a la izquierda; al centro el título, los nanobots formando **una red neuronal** (nodos que se encienden y se pasan pulsos; nada de robot) y el CTA; el texto a la derecha, con las líneas verticales.
  - **El ángulo de las diagonales:** 3 opciones detrás de una bandera (por ejemplo 30°, 20° y 12° desde la vertical), para que Valentino elija.
  - **El CTA de cada servicio** dispara el viaje a su página (B12b): el papel se levanta, aparece la escena y los nanobots se apagan.
  - **Sin precio "desde"** en el home: va solo en las páginas de servicio. P-H8 queda sin efecto.
  - **Los videos:**
    - web: el montaje que hizo servicios (sitios y demos);
    - software: por ahora, el mismo montaje. Valentino va a preparar el acceso para grabar el software propio;
    - IA: por ahora, el mismo montaje. Después, una pieza animada sobre las ventajas de la IA, con un par de conceptos (placeholder, a producir).
  - **Después, sin gatillo, el recomendador**, con scroll normal:
    - a la izquierda, «¿No sabés qué servicio elegir?» y un texto corto, del estilo «No te preocupes: preparamos un formulario que, a partir de tus problemas, nos deja ofrecerte la mejor solución.»;
    - a la derecha, el recomendador: preguntas sobre los problemas del cliente → el servicio recomendado, con el CTA a su página (el viaje) o el contacto con `data-precarga`;
    - las preguntas, a redactar (placeholders por ahora).
  - **Después, el Panel.**
  - **En el teléfono:** dos variantes para comparar. `?servicios-movil=deslizar` (cada servicio es una pantalla y se baja con scroll normal) y `?servicios-movil=gatillo` (de a uno, como en escritorio). Cada servicio lleva el video arriba, el título con los nanobots (más chicos), el texto y el CTA.
  - **El largo:** la sección anclada durante los tres gatillos y el recomendador con scroll normal, con la REGLA DE ALTURAS.

- [c] B12 · **Escena por ruta: páginas "home-based".** **Plan de B12a hecho** (`d51d95fc`, `docs/rediseno/SPRINT-B12a.md`), con siete subsprints. Medido en una subruta: la escena gasta ~600 ms/s del hilo principal en reposo; D8 la hace dormir detrás del papel. Craneado (2026-10-17, tres rondas). El detalle vive en `ESCENA-CONTRATO.md` §0.
  - **Estructura de cada página:**
    1. **intro con escena:** el logo en el centro, de noche, con el acento y la variante; la cámara se mueve con el scroll durante **1,5 pantallas**; un **título 3D impreso** de calidad;
    2. **el cuerpo en papel**, opaco;
    3. **el pie genérico** (B13).
  - **El `h1`** (P-H13): un solo texto, dos versiones. En las páginas de servicio es **el nombre del servicio**. El `h1` del DOM dice lo mismo que el título 3D, se oculta solo visualmente mientras el 3D está a la vista y es el visible cuando no hay 3D.
  - **El título de las páginas** (P-H14): un preset propio de `TituloDeVolumen`, el mismo en todas, con **dos variantes de la familia del hero del home, distintas de las dos del home** (decisión de Valentino). Cada variante nueva se mide en peso y primera carga.
  - **La composición inicial compartida:** todas las páginas arrancan desde la misma composición de escena, o una muy parecida.
  - **Las transiciones:**
    - **el viaje,** desde el CTA de Servicios del home: el papel se levanta, aparece la escena, anochece y la cámara llega a la composición inicial;
    - **el velo,** para todo lo demás:
      1. la escena actual vuelve a su composición inicial;
      2. pasa el velo, el mismo del día y la noche, que lleva el anochecer o el amanecer;
      3. la página nueva aparece en su composición inicial.
      - Si la escena no se ve (estás en el papel), va directo al velo;
    - **la entrada directa:** un preloader corto (B12c).
  - **La vuelta:** la flecha del navegador lleva al lugar del home donde estabas; "Home" en el menú lleva al principio. En los dos casos amanece.
  - **La navbar:** la misma píldora en todas las páginas, con un desplegable de servicios. En el celular, el desplegable es un acordeón dentro del menú.
  - **El sonido:** uno suave al salir y otro al llegar, respetando el mute.
  - **Las variantes:** la base (noche y acento) la pone el home. El cambio mínimo de cada página lo diseña y lo construye servicios, en la ranura de B12 (P-S6). Las ideas de partida:
    - web: el piso brilloso;
    - software: el logo con grietas;
    - IA: un laboratorio liviano.
  - **Por debajo de 1024:** como el home. **Otras páginas:** variaciones más tranquilas.
  - **Técnica:** el `<Canvas>` ya vive en el layout. La escena se hace consciente de la ruta con un preset por página. Navegación cliente con `<Link>`, sin `router.push` ni `TransitionContext.tsx`. P-H4 se descarta.
  - **Partes:**
    - **B12a:**
      - la escena por ruta y la noche con el acento;
      - la intro con el título 3D, la API de P-H13 y el preset de páginas (P-H14);
      - la composición inicial y el velo;
      - la navbar con el desplegable;
      - la ranura.
      - **Requisito:** ninguna pista de escena de una página se calcula sobre su alto total; la intro y el pie se anclan a su propio bloque;
    - **B12b:** el viaje desde el CTA y los sonidos;
    - **B12c:** el preloader corto, a cranear como un elemento propio.

## Entregas
Son dos, y cada una se puede integrar por separado: **primero B4 entero** (commit y reporte), **después B12b**. Si se te acaba el tiempo, B4 tiene que haber quedado completo.

## Los videos (importante)
El montaje de servicios vive en `paginas/servicios` (`public/servicios/`) y NO está en esta rama. Hasta que Valentino mergee servicios en el home, usá como placeholder un video que ya exista en `public/portfolio/` (el mismo en los tres servicios). Dejá la ruta en una sola constante por servicio, para cambiarla después sin tocar nada más, y anotalo en el reporte.

## Qué se construye
- **B4:** la sección completa como está decidida arriba.
- **B12b (del bloque B12):** el viaje desde el CTA de cada servicio de B4 hasta su página (el papel de la sección se levanta, aparece la escena, anochece y la cámara llega a la composición inicial de la página), más un sonido suave al salir y otro al llegar (respetan el mute). El viaje usa la navegación cliente y el velo de B12a donde corresponda, y pide la salida de la variante según `B12a-API.md`. Las páginas de servicio no existen en esta rama: probalo contra `/v3/pagina-base` y dejá el destino por `IdDeServicio`.

## Archivos (a confirmar)
- La sección Servicios del home (`_secciones/**`) y los nanobots (`_lib/nanobots/enjambre.ts`, su propio contexto WebGL).
- El recomendador (nuevo, en la sección), con el contacto con `data-precarga`.
- El viaje: en la capa de navegación y de escena de B12a (`_lib/escena/ruta/**`). Coordiná con el orquestador si choca con otra tarea.
- **REGLA DE ALTURAS:** esta tarea cambia el alto de un tramo del home. Compensá con `TRAMO_ESTIRADO` (una k por ancho, `secciones.ts` sin tocar) y medí la deriva antes y después. El orquestador integra estas tareas de a una y vuelve a medir después de cada merge.

## Criterios
- La máquina de gatillos es la del Portfolio (obligado, de a uno), con su matriz en el arnés.
- El truco de profundidad: el cambio de capa de los nanobots ocurre sin ningún nanobot sobre el contorno del título (verificalo cuadro a cuadro), y el panel cierra por debajo de ellos.
- `?diagonal=` con 3 ángulos y `?servicios-movil=deslizar|gatillo`.
- El viaje: 0 cuadros en blanco y la llegada en la composición inicial de la página.

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
