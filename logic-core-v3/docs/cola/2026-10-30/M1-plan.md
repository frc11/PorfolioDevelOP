# M1 · plan — Nosotros, Portfolio, el ancho y la intro de día

Rama `m/1` (desde `l7/a` en el L7-INT, `3d89b628`), worktree `C:\nocturno\cola3b`, dev :3003. Las palabras de Valentino del lote mandan.

## Ítems (qué, cuándo cuenta como hecho, cómo se verifica)

0. **El ancho.** Mirar a 1440 y a 2560 qué hace que las páginas se lean como una columna al centro y el home no; arreglarlo en la base compartida (`_componentes/pagina/**`, `_componentes/layout/Envoltorio.tsx` sólo si es el contenedor) y en las secciones de Nosotros y Portfolio que deben ir de punta a punta. La columna de lectura larga (la nota, las legales) no se ensancha. Hecho = a 1440 y 2560 el marco de cada página ocupa el ancho como el home; fotos de todas las páginas que existen. Un párrafo para los otros carriles en el resultado.
1. **La intro de día, más larga.** En la base: si el preset es de día, la intro es la del home hasta Quiénes somos: el título (como hoy), después el giro de cámara del home hacia Quiénes somos (su pose: 130°, −3,6, 14) con el bloque «de qué se trata» de la página en el lugar que el home le da a esa sección (del lado contrario al logo), y recién ahí el papel. Las de noche (servicios) quedan como están (1,8). Cada página escribe su bloque (Nosotros y Portfolio acá; el blog lo hereda en el merge con su texto actual: propuesta para M2). Hecho = la intro mide lo que dice la constante de día, el avance llega a 1 al final, la cámara termina en la pose de Quiénes somos, el bloque se lee entero sobre la escena; invariante + tira de cuadros a 1440 y 390.
2. **El equipo (dos tomas).** El prototipo 2 tal cual sobre el papel: párrafo largo por persona con su foto de dos tomas, hover en escritorio, y en el teléfono la segunda toma se abre sola al cruzar la mitad y se cierra al volver. Al final la foto de la facultad que se abre desde una rendija con el scroll, `public/v3/nosotros/facultad.webp`, a un tamaño que no la muestre borrosa (≤ su ancho nativo), con «FACET · Universidad Nacional de Tucumán». Hecho = en 390 la foto se abre al cruzar el medio (medido por `aria-pressed`) y se cierra al volver.
3. **La historia.** Todo el texto con la subida desde abajo del sitio (`Gatillo desde="abajo"`); sólo «Calidad excepcional», «Esto no es un proyecto aislado» y «No tenemos límites» se pintan (palabra por palabra con el scroll). Texto: los 4 párrafos del prototipo (palabras de Valentino). Hecho = invariante (exactamente esas tres frases pintables) + foto.
4. **Cómo trabajamos.** El prototipo 7 tal cual: la línea que baja con el scroll y subraya cada paso al llegar; los cinco pasos del prototipo. Hecho = foto a mitad del recorrido (línea parcial, pasos subrayados hasta ahí).
5. **Los casos.** Papel (sin franja de noche), lados alternados (1 foto izq., 2 der., 3 izq.), el medio clavado con su texto (desde 1024) y el ritmo de entrada de la ficha; título propio + texto largo (150–250 palabras) + dos detalles (rubro, fecha) + «Visitar sitio» en su color. Sin reseña falsa ni corchetes. Hecho = invariante (lados, conteo de palabras, sin `[`) + fotos 1440/390.
6. **Las demos.** El estante del prototipo 17 sin los tres pasos (un texto corrido), sin que una tapa atraviese a otra (las vecinas se corren antes de que la elegida se levante; el orden de apilado no cambia nunca) y, desde 1024, la ventana del home (`VentanaDeDemo`, el Genie) dentro de la página. Abajo de 1024, la rama del teléfono del home (pestaña nueva). Hecho = banco que muestrea cada cuadro del hover y comprueba que ninguna tapa de delante se superpone a la elegida mientras se mueve + la ventana abre y cierra a 1440.

## Implicancias
- `s78-b12a` clava `PANTALLAS_DE_LA_INTRO === 1.8` y el alto del bloque: sigue valiendo para la noche; se suma la de día con su control.
- El avance de la intro tiene que salir del largo de la intro de esa página (no de la constante global): lo lee `ataduraAlScroll`.
- El hueco del logo manda el encuadre en la intro; en el giro el logo tiene que pasar al otro lado: el encuadre del hueco se suelta hacia el de la pista a lo largo del giro.
- Tailwind 4 escanea todo: nada de clases arbitrarias deletreadas en comentarios ni en docs.

## Fuera de alcance
El blog, la nota, la 404 (M2), los servicios (M3), las seis propuestas de L7e, cualquier cosa del home.

## Gate
`npx tsc --noEmit` (0 nuevos), ESLint en los archivos tocados, `npm run test:s78-b12a`, el invariante nuevo `test:s92-m1` con controles, el humo de L7-INT a 1440/1024/768/390 contra :3003 (fotos en `C:\nocturno\cola3-fotos\M1\`), el banco de las tapas, revisión independiente al final.

## Premortem
«M1 falló porque: (a) el giro del home dejó el logo detrás del texto del bloque —se mide la caja del logo contra la del bloque en la tira—; (b) el avance de la intro siguió dividiendo por 1,8 y la cámara terminó el giro en la mitad de la intro —invariante del avance con el largo de día—; (c) el ancho rompió una legal o la nota —foto de todas las páginas antes de cerrar—; (d) las tapas no se atraviesan en el hover pero sí al pasar rápido de una a otra —el banco barre las cinco de corrido—; (e) el teléfono no llega a 390 en la herramienta —se dice y no se da por pasado—.»
