# M1 · resultado — Nosotros, Portfolio, el ancho y la intro de día

Rama `m/1` (desde `3d89b628`). Dev :3003, Chrome del sistema (uno por vez, cerrado al terminar cada tanda). Fotos en `C:\nocturno\cola3-fotos\M1\`.

## Para los otros carriles: el ancho (ítem 0)
**El contenedor no cambió, y no había que cambiarlo.** Medido a 1440 (`scripts-carga/m1-ancestros.ts`): la cadena de ancestros es la MISMA en el home y en las páginas (`main` 1440 → `envoltorio` con 32 px por lado, `--container-dominante` 100 % → contenido 1376, tope `--container-tope` 1920). Ningún ancestro de una sección de página es más angosto; al revés, el home suma una columna lateral y su texto arranca en x 188, el de las páginas en x 32. Por sección (`m1-anchos.ts`): Nosotros, Portfolio y el blog van del 2 % al 98 % del ancho a 1440; a 2560 el home y las páginas cortan igual en 1920 (13 %–88 %). Lo angosto a propósito: la nota (27–73 %, columna de lectura) y las legales (índice + texto). **La columna al centro que vio Valentino era el LABORATORIO:** 18 archivos de prototipos de `l7/lab` envuelven todo en `mx-auto max-w-6xl/5xl/4xl/3xl` (1152 → 768 px centrados). Las secciones reales de M1 no copiaron esos envoltorios. M2 y M3: construyan con `SeccionDePapel`/`Envoltorio` como hasta ahora y no copien el `max-w-*xl` de los prototipos.

## Por ítem
- **0 · El ancho — hecho (diagnóstico, sin cambio de contenedor).** Arriba. Fotos `anchos\<página>\{1440,2560}-*.png`.
- **1 · La intro de día — hecho.** Una página de día con pista Y con su bloque («de qué se trata») lleva 3,4 pantallas: el tramo del título (1,4) y el giro del home hacia Quiénes somos (2; pose 130° / −3,6 / 14, vuelta literal), con el bloque fijo del lado contrario al logo y el logo pasando de un hueco al otro; después, el papel. Medido: Nosotros, Portfolio y el blog miden 3,40 pantallas a 1440 y 390; las de servicio 1,80 (sin cambios); una nota (sin bloque) 1,80. En un cuadro vertical la cámara no se acerca en el giro (si no, el logo tapaba el bloque: visto en la tira de 390 y arreglado). Tiras: `nosotros|portfolio|blog\{1440,390}-intro-tira.png`. **Título 3D vs DOM:** ninguna página cae al DOM: «Nosotros», «Portfolio» y «Blog» ya estaban en las fuentes 3D (L7-INT).
- **2 · El equipo — hecho.** A 390 la segunda toma de Franco: abajo `false` · cruzando la mitad `true` · de vuelta `false`; a 1440 no se abre sola. Facultad en `public/v3/nosotros/facultad.webp` (500×298), a 500 px como mucho, se abre desde una rendija, con «FACET · Universidad Nacional de Tucumán».
- **3 · La historia — hecho.** Sube por párrafo; sólo se pintan las tres frases. Foto `anchos\nosotros\1440-2.png`.
- **4 · Cómo trabajamos — hecho.** La línea que baja y subraya cada paso (prototipo 7), cinco pasos.
- **5 · Los casos — hecho.** Lados medidos: 1440 izquierda/derecha/izquierda; 390 apilados (el medio arriba). Textos de 162/153/154 palabras. «Visitar sitio» pasado a AA sobre el papel (El Garage 5,38:1, Banú 8,22:1, Esquina la tinta).
- **6 · Las demos — hecho.** Banco cuadro a cuadro con el candado (`m1-banco.ts`, `PASOS=tapas`): 1440 → 752 cuadros, 436 tapa-cuadro movidas, **cero cruces**, apilado fijo; 1024 → 754 / 441 / cero / fijo. La ventana del home abre en la página y cierra con Esc (1440 y 1024, una sola pestaña). Abajo de 1024, pestaña nueva como el home.

## Verificación
- `npx tsc --noEmit`: 0 errores. ESLint en los archivos tocados: limpio.
- `s92-m1` (nuevo): 47 afirmaciones, 0 fallas, cada una con su control. `s78-b12a`: 162 / 0 (una afirmación actualizada a la spec nueva: el avance pasa el largo de la intro de la página; se endureció, no se aflojó).
- Humo (`l7-int-humo.ts` contra :3003) a 1440, 1024, 768 y 390, **390 real (innerWidth 390, pestaña visible)**: las tres de servicio, Nosotros, Portfolio y la 404 en verde en los cuatro anchos. Privacidad y Términos «FALLA» sólo por el criterio de orden del banco (conocido desde L7-INT; desborde 0, `h1`, pie y consola bien). Blog y nota en 1440/1024/768 en verde; **a 390 el blog desborda 32 px y la nota 3 px** (ver propuestas).
- No corrió: `npm run verificar` completo ni el build de producción (el build va con candado y no hizo falta para cerrar M1; queda para el merge).

## Revisión independiente (Sonnet, sobre el diff)
Nueve hallazgos, los nueve arreglados: el texto de los casos y la facultad invisibles sin JS; el Genie de cierre volvía a una caja vieja (la tapa se soltaba con la ventana abierta); las notas del blog quedaban con dos pantallas de giro vacías (la intro larga ahora exige su bloque); la variable de color circular de Esquina; la tapa que titilaba en el borde (se suelta al salir del estante); dos frases que afirmaban de más; una clase arbitraria entera en el invariante; dos `span` como hijos de un `ol`.

## Decisiones tomadas solo
- **M1-1** La intro larga la decide el DOM (día + pista + bloque) y la escena la toma mientras el marco del giro está montado (un contador: con la navegación cliente hay dos un instante). Así el blog la hereda en el merge sin tocar archivos de M2, y una nota sin bloque queda corta.
- **M1-2** Colores de marca sobre el papel en `portfolio/contenido.ts`; los tokens no se tocaron.
- **M1-3** Abajo de 1024 la demo abre en otra pestaña (la rama del teléfono del home).
- **M1-4** En un cuadro vertical el giro no acerca la cámara (el logo a distancia 14 tapaba el bloque).
- **M1-5** El `main` de Nosotros y Portfolio recorta el desborde de costado como el del home (a 390 algo que entra de costado sumaba 32 px).
- **M1-6** `s92-m1` no se sumó a `package.json` para no chocar en el merge.

## Propuestas fuera de mi borde
- **M2:** `overflow-x-clip` en el `<main>` de `blog/page.tsx` y `blog/[slug]/page.tsx`, como el home y M1 (a 390: +32 px y +3 px). El bloque del giro del índice del blog es su «de qué se trata» actual: conviene escribirle uno pensado para ese lugar.
- **M3:** lo mismo en `_servicios/PaginaDeServicio.tsx` si su humo a 390 lo pide (hoy da 0).
- **package.json:** `"test:s92-m1": "npx tsx src/app/v3/_lib/__tests__/s92-m1.invariant.tsx"`.

## Qué tiene que mirar Valentino
1. `/v3/nosotros` a 1440: bajar despacio la intro — el título, el giro del home y el bloque a la derecha; después el papel.
2. `/v3/portfolio` a 1440: pasar el mouse por las tapas de las demos (ninguna atraviesa a otra) y hacer clic en una (la ventana del home).
3. `/v3/nosotros` en el teléfono: las fotos del equipo se abren solas al pasar la mitad.
4. `/v3/portfolio`: los tres casos alternados con su texto (para reescribir).
