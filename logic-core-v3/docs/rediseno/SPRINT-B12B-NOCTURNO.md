# SPRINT B12b · NOCTURNO 2026-10-22 · El viaje desde el CTA de un servicio hasta su página

Tarea: `docs/cola/2026-10-22/50-B4-servicios-y-viaje.md`, la entrega B12b (B4 ya estaba integrado). Worktree `C:\nocturno\2026-10-22\b12b`,
rama `nocturno/2026-10-22-b12b`. El criterio, en la skill (`CONTRATO.md` §Navegación): «el papel de la sección se levanta, aparece la escena,
anochece y la cámara llega a la composición inicial de la página»; un sonido suave al salir y otro al llegar (respetan el mute); 0 cuadros en
blanco y la llegada en la composición inicial.

## Plan

**La idea:** el viaje es un velo que cubre con la ESCENA en vez de la banda. Todo lo de B12a (la navegación cliente con `EnlaceDeRuta`, la
salida de la variante, la reposición de la ruta, la espera al primer cuadro estable, la píldora que se desliza, el «quieto» para las obras
pesadas) sigue igual; cambia sólo qué tapa el cuadro mientras se navega.

1. **La escena se entera de adónde va** (`_lib/escena/ruta/viajeDelServicio.ts`, puro): al clic, el home apila el preset de la página de
   destino (su pista, su noche, su acento y su variante; `PRESET_DEL_DESTINO`). Un reloj del viaje que leen tres lugares, con un cambio
   mínimo en cada uno (fuera de un viaje valen exactamente lo de antes):
   - el rig, por `poseDeLaIntro` (`composicionEnLaEscena.ts`, una línea): la cámara baja de `POSE_DE_PARTIDA` (de frente, más alta y más
     lejos) a la composición inicial, ANTES del encuadre del hueco (el logo va en su hueco todo el descenso);
   - la luz de la intro, `luzDeLaPagina` (`pistaDeLaIntro.ts`, una línea): la noche del preset entra de a poco;
   - la atadura al scroll (`ataduraAlScroll.ts`, dos líneas y la suscripción): la escena dibuja aunque Servicios (papel opaco) la tape.
2. **El hueco del logo de la página, medido en el home** (`_componentes/navegacion/HuecoDelViaje.tsx`): durante el viaje, el mismo marco de
   la intro (`MarcoDeLaIntro`), invisible y fijo, mide el hueco y se lo da a la escena: la cámara baja directo a la composición de la página.
3. **El DOM del viaje** (`_componentes/navegacion/viajeAlServicio.ts`): el CTA pide el viaje en su `onClick` (que `EnlaceDeRuta` corre antes
   de cubrir: `pedirElViaje` + `cubrirConElVelo`, sin tocar `EnlaceDeRuta`). Espera a la escena despierta con la variante del destino
   dibujada (≤ 1,5 s; si no, la banda), y con su reloj: suena la salida, el `<main>` del home recortado a lo que se ve sube una pantalla, los
   nanobots se apagan, anochece (0,16–1,16 s) y la cámara llega (1,5 s). Recién ahí se navega, con la escena quieta.
4. **El velo atiende el pedido con la escena** (`_chrome/velo/VeloDeNavegacion.tsx`, `paginaTapada.ts`): sin banda (`data-modo="viaje"`);
   antes de navegar observa el documento y el `<main>` nuevo entra transparente y con su scroll en la microtarea del commit (el `<Link>` va
   con `scroll={false}`: sin esto el primer cuadro sería el papel del fondo de la página); con su primer cuadro estable, aparece encima de la
   escena (420 ms) con el sonido de la llegada. Con el velo quieto, el preset del viaje se va (queda el de la página, el mismo objeto).
5. **Pruebas:** s78-b12b (nueva, en la suite s78) y el banco `scripts-carga/viaje.ts` (sin correr) con tres controles.

**Banderas:** `?viaje=escena|velo` (sin la bandera, `escena`: `VIAJE_POR_DEFECTO`). Los defectos del banco van por
`window.__defectosDelViaje` (`sin-tapar`, `sin-hueco`), nunca la URL.

## Log

- `s78-b12b` (nueva): el reloj (fuera del viaje no toca un número; adentro, sin saltos por cuadro; todo antes de navegar), la partida, la
  máquina, la pose y la luz con el preset apilado, la atadura, el pedido (viaja con ESE `cubrirConElVelo` y se olvida al terminar el clic),
  el velo, la página tapada, el destino y los sonidos; cada una con su control.
- `s78-b12a`: la ruta de la base lee también `pagina-base/preset.ts` (el preset se mudó ahí por la spec: lo lee el viaje); el regex y su
  control, iguales.
- El gate (04:38–04:41, en el turno): ESLint de los 17 archivos tocados, limpio. tsc: 2 errores, los dos en la prueba nueva (tipos
  literales de `TIEMPOS_DEL_VIAJE` y `SONIDOS_DEL_VIAJE` en los controles), corregidos ensanchando el tipo del detector; tsc otra vez en
  una segunda pasada. Suites: s78 237 de 0 (s78-b12b 35 afirmaciones, 17 controles; s78-b12a y s78-t0 sin fallas), s81 43 de 0, s49,
  s74, s75, s76 (747), s77, s27, s10 (241), s19, s34, s42, s52, s6 (431), s79, s5-codigo y s11-frontera sin fallas. Fallan, ajenas a
  B12b: s17 (las familias de fuentes: 11 contra 7, de la base) y s47 (el control del recorte del escenario del Portfolio: su `className`
  cambió con el carrusel B1.2e; no lee nada de lo tocado acá).
- Sin navegador (regla de la noche): el viaje no se vio. El banco `scripts-carga/viaje.ts` queda sin correr.

## Riesgos (a mirar en el navegador)

- Durante el viaje se ve la sala del home con el progreso de Servicios (la cámara y la luz son las del destino, pero lo que el home pone
  en la sala según el progreso, títulos de volumen o piezas, sigue): si algo de eso asoma en la composición, se ve. Servicios cae en el
  tramo que la escena nunca dibujaba (0,625–0,7375).
- La noche: en la primera mitad de Servicios la noche disparada de Trabajos sigue (la sala ya está de noche: el «anochece» no se nota);
  en la segunda, el día del final: ahí anochece de verdad.
- Si la escena NO estaba suspendida al clic (no debería: Servicios es papel opaco), la cámara persigue la partida desde la pose del home
  con su inercia (puede girar) detrás del papel durante la espera.
- Una rueda o un dedo durante el viaje: la capa del velo lleva `data-lenis-prevent` (Lenis y los gatillos lo ignoran) y los gestos se
  retienen; las teclas las retiene `retenerLosGestos` después de los gatillos (que podrían avanzar un servicio con una flecha).
- El `<main>` del home lleva `transform` y `clip-path` mientras sube: abajo de 1025 corta la cadena de mezcla de «Quiénes somos», que no
  está a la vista (y el home se desmonta al navegar).

## Qué mirar (en el navegador)

1. `http://localhost:3000/v3` a 1440×900: «Servicios» en la píldora, una muesca (Desarrollo web), clic en su CTA. El papel sube entero
   (sin dejar ver el resto del home), aparece la sala de día con la cámara alta y de frente, anochece y la cámara baja hasta la composición
   de la página base (el logo a la derecha, en su hueco); recién ahí aparece el texto de la página y el título 3D llega. Sin un cuadro de
   papel ni en blanco, sin la banda diagonal.
2. Lo mismo con software (dos muescas) y con IA (tres), y desde el recomendador: van a la misma página.
3. 1024×768 y 768×1024 y 390×844 (`?servicios-movil=deslizar`, el defecto): el CTA de una pantalla suelta. Abajo de 1024 el hueco va debajo
   del título: al llegar puede verse un reencuadre corto del logo (declarado).
4. Con el sonido prendido (el parlante): un sonido suave al salir (cuando el papel empieza a subir) y otro al llegar; apagado, nada.
5. `?viaje=velo`: el CTA pasa el velo de siempre (para comparar). Con menos movimiento: el velo (un corte).
6. La flecha del navegador desde la página: vuelve al home donde estaba (en Servicios), de día o de noche como estaba.
7. El banco: `BASE=… ANCHOS=1440,390 npx tsx scripts-carga/viaje.ts`, y sus controles `CONTROL=velo`, `CONTROL=sin-tapar` y
   `CONTROL=sin-hueco` (los tres tienen que dar FALLA).
