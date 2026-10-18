# M2a — El precio en diagonales, desde 768

2026-10-18 · Autor: CC, en la corrida desatendida (tarea 3) · Viene de: `docs/servicios/SPRINT-M0.md` §3 (el plan) y el prompt de la corrida, que manda donde chocan.
Rama `paginas/servicios`, sobre `f2631309` (el M3). **Commit «M2a: precio en diagonales (sin ver)».** Valentino lo revisa al volver.

**Estado en una línea:**
- **Desde 768,** el precio de Páginas web es una sección anclada a pantalla completa con tres paneles cortados en diagonal, cada corte con su zigzag: la Simple arriba a la izquierda, la Mediana al centro en el acento con «Recomendada» y su línea, y la Premium abajo a la derecha.
- **El revelado** es progresivo, con el contrato del home.
- **Por debajo de 768 nada cambia** (D15).
- **Gate:** lint 0, `tsc` 0; siete tests en verde (463 afirmaciones, 191 controles positivos); los seis barridos iguales.
- **Navegador:**
  - a 1440, 1024 y 768, el texto entra en su panel con 16 px de margen;
  - contraste mínimo 6,65:1, sin desborde;
  - el anclaje no rompe el scroll del resto y el final llega;
  - con movimiento reducido, todo a la vista y quieto.
- **Detrás de una bandera:** las variantes `b` y `c` de la coreografía, solo en desarrollo.
- **Cortado por memoria:** nada.

---

## 1. Las variantes (bandera de desarrollo `?precio=a|b|c`)

Producción ve solo `a`. En producción la bandera no existe: `coreografiaDe` ignora la consulta y el reparto lee la url solo detrás de `NODE_ENV`.

| Bandera | Qué hace (una línea) |
|---|---|
| `a` (la fiel, la de producción) | En orden, un tercio del recorrido por panel: la Simple mientras la sección sube, la Mediana y la Premium durante el anclaje. Cada uno llega al 70 % de su tercio y queda quieto. |
| `b` | La Mediana primero, sola, en la primera mitad; la Simple y la Premium juntas, desde los dos lados, en la segunda. |
| `c` | En cascada: los tres se solapan, cada uno arranca un quinto después del anterior y tarda tres quintos. |

**Cómo se ven** (con `npm run dev -- -p 3001`):
- http://localhost:3001/v3/paginas-web (es `a`);
- http://localhost:3001/v3/paginas-web?precio=b;
- http://localhost:3001/v3/paginas-web?precio=c.

---

## 2. Lo hecho

### 2.1 La geometría (`bloques/precio/geometriaDelPrecio.ts`, pura)

- **Dos cortes paralelos, con un quiebre en zigzag cada uno.** Los tres polígonos salen de los mismos puntos, así llenan la caja sin huecos ni encimados.
- **En unidades del contenedor.** La caja anclada es un contenedor de tamaño (`container-type: size`) y los polígonos van en `cqw` y `cqh`. Así la pendiente queda en px por px y el ángulo es el mismo en cualquier caja de una orientación (16,7° en apaisado). Es lo que el M0 pedía con `svh`, pero también vale para el ancho.
- **Dos orientaciones:**
  - **Apaisado:** los cortes «/» del M0 (30 % y 70 % del ancho, pendiente 0,3), con el quiebre bajo la mitad (62 % del alto), para dejar arriba el lugar del texto.
  - **Retrato:** los mismos cortes transpuestos, casi horizontales y subiendo hacia la derecha (36 % y 71 % del alto, pendiente 0,15). Las regiones son tres bandas.
  - Las elige el CSS por la orientación de la pantalla (`landscape:` y `portrait:`), sin JavaScript.
- **Las cajas del texto** salen de la misma función:
  - cada una se ancla a la parte ancha de su región;
  - su ancho sale del corte que la limita, con 1rem de margen al corte, medido en perpendicular (de ahí el 1 + pendiente) y 2rem al borde;
  - arriba queda un 16 % libre para la barra fija del sitio.
- **El recorte y el corrimiento** de cada panel van en custom properties del `style`, y las clases los leen con `var()`: ninguna clase arbitraria sin token y ningún polígono en una clase.

### 2.2 La firma del slot (`bloques/precio/tresOpciones.ts`, pura)

- `OpcionDeTres`: nombre, rótulo del precio, precio y líneas. `VistaDeTresOpciones`: tres opciones, por tipo, y la destacada, que va siempre al medio.
- `tresOpcionesDeLosCalibres` es el adaptador de web. Tira si no son tres o si la destacada no es la del medio.
- **IA** entra con la misma firma desde sus planes («Por mes», conversaciones, soporte y cambios web). No se aplicó, como pide la corrida: el adaptador de los planes se escribe en la réplica.
- `«Autogestionable»` pasó a `rotulos.ts` y lo comparten las dos versiones.

### 2.3 La sección (`bloques/Precio.tsx`, `bloques/precio/Diagonales.tsx`, `movimiento/RepartoDelPrecio.tsx`)

- **Una sola `<section data-bloque="precio">`** con dos versiones, como los planes de IA del S2c. El CSS elige: `md:hidden` para la chica y `max-md:hidden` para las diagonales. La que no toca va con `display: none`.
  - **Por debajo de 768**, el contenido de siempre, byte por byte. Para eso `Bloque` expone `ContenidoDelBloque`, que es su interior.
  - **Desde 768**, el `h2` «Precio» solo para lectores de pantalla (D11) y una lista (`role="list"`) con las tres opciones, cada una con su `h3`, en el orden en que se leen.
- **La Mediana:** en el acento (`bg-acento` con `text-fondo`), con la marca «Recomendada» y la línea, literal:

  > Todo lo de la Simple, en varias páginas y con catálogo o buscador para mostrar lo que vendés.

  Las dos van en `datos/paginas-web.ts` como `destacada`, con la marca `// M2a (dictado)`. Ningún otro texto de venta.
- **El revelado** (`RepartoDelPrecio`, cliente):
  - **La sección:** mide tres pantallas solo con `motion-safe`, por CSS. El HTML servido ya tiene el alto que va a tener, y con movimiento reducido mide una.
  - **El progreso:** el `Bloque` del contrato con P2 y `del-patron` sobre la sección alta, en todo ancho (`CoreografiaEnTodoAncho`, como Trabajos del home). El `div` que se mide no se transforma.
  - **La entrada:** de cada panel (`coreografiaDelPrecio.ts`, pura, con `tramoDeSecuencia` y `saturarEn` del contrato) llega a los paneles como `--entrada-0`, `--entrada-1` y `--entrada-2`.
  - **El movimiento:** cada panel se desliza 10 % a lo largo de su corte y se funde, solo con `translate` y `opacity`. El recorte se mueve con el panel y nunca se anima por cuadro.
  - **Sin progreso** (el HTML servido, el movimiento reducido o el chunk en camino), las variables no existen y los paneles las leen con su reserva, 1: todo en su lugar, sin corrimiento ni transparencia.

---

## 3. Decidido por CC, revisar

1. **La geometría en retrato está transpuesta.** El M0 ya marcaba que a 768 × 1024 un corte casi vertical deja 46 px para la Premium. En retrato los cortes van casi horizontales, y las tres opciones quedan en tres bandas: la Simple arriba a la izquierda, la Mediana al centro y la Premium abajo a la derecha. Si se prefiere el mismo dibujo que en apaisado, hay que bajar la pendiente o mover las historias a 1023 (D10).
2. **Los números de la geometría** salieron de medir el texto en las tres cajas, en lugar del 30/70/0,36/8/5 del M0:
   - apaisado: pendiente 0,3 y quiebre al 62 % del alto, con 8 % de largo y 5 % de corrida;
   - retrato: cortes en 36 % y 71 % del alto, pendiente 0,15 y quiebre al 30 % del ancho.

   Están todos en `PARAMETROS`.
3. **Las superficies:** la Simple y la Premium en papel, y la Mediana en el acento. Los cortes se ven porque la Mediana los separa. No hay líneas de corte propias.
4. **Dentro del anclaje, en reposo, los paneles que el recorrido todavía no alcanzó siguen afuera.**
   - Es el scrub del revelado progresivo: «subiendo, deshace el camino».
   - Fuera del precio no queda nada escondido en reposo, y cada panel queda quieto y entero al 70 % de su tercio.
   - Si Valentino quiere que el reposo los complete, como la guarda del gatillo, es un cambio de concepto y no de calibración.
5. **El quiebre de los cortes en apaisado no va a la mitad sino al 62 % del alto**, para que el texto de la Simple y de la Mediana quede entero arriba del quiebre.
6. **Los títulos de las opciones** van en `titulo-s` y el precio en `titulo-m`, como en los calibres. «Desde» va en la misma línea que el monto, para ahorrar alto.

---

## 4. Tests

**`diagonales.invariant.tsx`, nuevo: 36 afirmaciones y 19 controles positivos.**

| Afirmación | Control |
|---|---|
| Los tres paneles llenan la caja: 2.560 puntos, cada uno en un solo panel, a 1440×900, 1024×768, 768×1024 y 1024×1366 | los cortes cruzados |
| Un quiebre en zigzag por corte, y uno solo, en las dos orientaciones | un corte recto |
| El mismo ángulo en cualquier caja apaisada (±0,1°) | una pendiente en % del ancho |
| Los recortes van en `cqw`/`cqh` | un recorte en % |
| La vista: Simple, Mediana y Premium con la destacada; tira si la destacada no es la del medio o si son cuatro | una vista que acepta cuatro |
| **La Mediana:** la única en el acento, con «Recomendada» y **su línea literal** | un carácter cambiado; el acento en la Simple |
| **Ninguna palabra prohibida** («más elegida», «popular», «más vendida», «favorita», «oferta»…) | un texto con «popular» |
| Mundo cerrado: todo texto sale de los datos o del título | un «¡Oferta!» suelto |
| **El orden del DOM:** el `h2` sr-only, la lista con `role="list"` y Simple, Mediana y Premium | dos cambiadas de lugar; un `h2` a la vista |
| **Debajo de 768 no cambia:** el bloque de antes, byte por byte, oculto desde 768, y las diagonales ocultas abajo | la versión chica con la línea; las clases de ocultar cruzadas |
| **Sin movimiento, todo visible:** la reserva 1 en opacidad y corrimiento, y nada fija la entrada en el HTML | un panel sin reserva; uno con `opacity:0` |
| Tres pantallas solo con `motion-safe`; con reducido, una | el alto sin la variante |
| **La bandera no existe en producción** (con cualquier consulta sale `a`), y el reparto lee la url solo detrás de `NODE_ENV` | un resolvedor que la lee en producción; un reparto que lee la url siempre |
| Las tres coreografías: de 0 a 1, sin retroceder | una que deja la Premium afuera |

**Cambian en `pagina`:**
- el marcador y «Autogestionable» se cuentan por versión del precio: 1 y 1, y [3, 2] en cada una;
- el código de cliente suma `movimiento/RepartoDelPrecio.tsx`;
- el precio de web tiene 3 marcas del árbol quieto (título y panel abajo, más el `Bloque` del reparto).

**Cambia en `precios`:** su calibre de prueba lleva `destacada: null`.

---

## 5. Gate (sobre el estado final)

| Paso | Resultado |
|---|---|
| Lint de los 14 archivos tocados | 0 problemas (un aviso de una función sin usar, sacada) |
| `tsc --noEmit` | 0 errores (dos de tipos, arreglados: las variables CSS de motion y un `as const`) |
| `datos` · `precios` · `slots` · `seo` | 55/0 · 22/0 · 44/0 · 56/0 |
| `pagina` · `medios` · `diagonales` | 224/0 (115) · 26/0 (12) · **36/0 (19)** |

**Los seis barridos, contra el M3:** la misma lista de fallas, con `s8-montaje` 56/2 y `stderr` idéntico. Solo cambian los conteos: `src/` sube de 2475 a 2481 (los seis nuevos) y el repo de 4069 a 4076. **Sin `next build`.** Las salidas están en `C:\paginas-servicios-datos\m2a\gate\`.

---

## 6. Navegador

En el dev de :3001, con Chromium. Los JSON y los logs están en `C:\paginas-servicios-datos\m2a\navegador\`. Cada parada espera 1,4 s.

| `/v3/paginas-web` | Alto de la sección | El texto en su panel (16 px) | Contraste mín. | Desborde | El recorrido (`a`) |
|---|---|---|---|---|---|
| 1440 × 900 | 2700 (3 pantallas) | los tres (0 puntos afuera) | 6,65 | no | Simple en p 0 a 0,23, Mediana en 0,33 a 0,57, Premium en 0,67 a 0,9; los tres puestos en 0,9 |
| 1024 × 768 | 2304 | los tres | 6,65 | no | ídem |
| 768 × 1024 (retrato) | 3072 | los tres | 6,65 | no | ídem |
| 1440, reducido | 900 (una) | los tres | 6,65 | no | los tres con opacidad 1 y sin corrimiento en todas las paradas |
| 390 | 0 (las diagonales con `display: none`) | — | 6,65 (la página) | no | se ve el bloque de siempre |

- **La caja anclada** queda en 0 durante todo el anclaje (`position: sticky`), y la suelta al final.
- **Quieto:** tres muestras a 250 ms con la rueda quieta, a la mitad del anclaje, dan valores idénticos. La doble suavidad no deja nada en movimiento (M0 §13.4).
- **Ida y vuelta:** subiendo, la Mediana vuelve a su entrada parcial y la Premium a 0.
- **El resto de la página:** pasado el anclaje, el CTA del precio llega a la vista. El final llega, con el cierre en 0 px y opacidad 1, a 1440, a 1024 y a 768.
  - **Escondido en reposo**, fuera del precio: nada. Los «sospechosos» son Incluye, Extra y Proceso a mitad de su revelado, con opacidad 1, como en el M1 y el M3.
  - **Dentro del anclaje**, los paneles no alcanzados están afuera (§3.4).
- **Las variantes a 1440:**
  - `b`: la Mediana entra en 0 a 0,35, y la Simple y la Premium juntas en 0,5 a 0,85;
  - `c`: la cascada, con la Premium completa recién en p = 1.
- **Software e IA a 1440:** sin cambios. Contraste mínimo 7,17 y 6,02, sin desborde.
- **Los errores de consola** son los de siempre del banco: WebGL en este Chromium. Ninguna llamada a `/api`.

---

## 7. Incidentes

- **El choque de nombres:** `Diagonales.tsx` y `diagonales.ts` en la misma carpeta. En Windows el import resolvía al `.ts` y el componente llegaba `undefined`. Es exactamente lo que vigila `pagina` §9. El módulo puro se llama `geometriaDelPrecio.ts`.
- **El margen de la Mediana:** la primera medición dio 3 puntos de la caja sobre el corte a 1440. El margen de 1rem no contaba la inclinación: se corrigió a 1rem·(1 + pendiente) más un cuarto de rem.
- **Dos controles del test nuevo estaban ciegos** y se arreglaron:
  - la cuenta del zigzag contaba un tramo quieto como vuelta;
  - un reemplazo no encontraba la clase.
- **La memoria:** nunca hubo que esperar. Lo más bajo durante el navegador fue 3,42 GB.

---

## 8. Fuera de alcance, anotado

- **M2b:** el precio en el teléfono (por debajo de 768: hoy, el bloque de siempre).
- **La réplica:**
  - IA entra al slot con su propio adaptador;
  - Software, con un precio único, necesita una variante de una opción (M0 §11).
- **Safari:** `clip-path` con `cq*` y `container-type: size`. El banco es Chromium, así que lo ve Valentino en su iPhone o iPad (M0 §13.3).
- **El teléfono acostado (844 × 390):** queda en retrato o apaisado según la orientación. No se capturó.

---

## 9. Qué mira Valentino

1. http://localhost:3001/v3/paginas-web en escritorio (1440) y en una tablet (1024 × 768 y 768 × 1024):
   - recorrer el precio bajando y subiendo;
   - la Mediana y su línea;
   - que el CTA llegue después.
2. **Las variantes:** http://localhost:3001/v3/paginas-web?precio=b y http://localhost:3001/v3/paginas-web?precio=c. Elegir una, o quedarse con la fiel.
3. **A 390:** que el precio sea el de siempre.
4. **Lo que hay que decidir:** §3.1 (el retrato transpuesto) y §3.4 (el reposo dentro del anclaje).

El dev se prende con `npm run dev -- -p 3001`.
