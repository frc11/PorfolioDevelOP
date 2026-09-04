# MEDICIÓN EN EL NAVEGADOR — la receta de este equipo

**Qué es esto.** El procedimiento canónico para medir y capturar `/v3` sobre el
píxel real, en esta máquina, con `chrome-devtools-mcp`. Se escribió en la Fase 0
de **B1 — La resta** y **toda medición del navegador la usa**. Escrito antes de
la primera medición del bloque, a propósito: una medición hecha sin la receta no
es comparable con las demás y no entra en ningún reporte.

**Lo que la receta protege.** Con la pestaña oculta, minimizada o en una ventana
de fondo el navegador **saltea los rendering steps**: no despacha `scroll`, no
corre `requestAnimationFrame` y `window.innerWidth` devuelve 0. Es una lección ya
pagada en este repo —`CLAUDE.md`, «Pestaña oculta»— y el costo fue un sprint
entero de mediciones que describían una página que no existía. Los pasos 3 y 4 de
abajo son el antídoto y no son opcionales.

---

## 0. Precondiciones

| condición | cómo se verifica |
|---|---|
| `npm run dev` corriendo | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/v3` → `200` |
| La ventana de Chrome **al frente** | paso 4: `document.hasFocus() === true` |
| Sin `auto mode`, sin fast mode | fuera de esta receta |

⚠️ **El puerto es 3000.** Si `next dev` levantó en otro puerto porque 3000 estaba
tomado, la página que se mide **no es la de este worktree**. Se verifica con el
`curl` de arriba antes de abrir el navegador, no después.

---

## 1. La receta, en cinco pasos

### Paso 1 — abrir la página

```
new_page          url: http://localhost:3000/v3
```

Devuelve el `pageId`. Todos los pasos siguientes lo llevan.

### Paso 2 — emular el viewport

```
emulate           pageId: <id>   viewport: "1920x1080x1"
```

Esto es `Emulation.setDeviceMetricsOverride` por debajo. **No es
`resize_page`**, y la diferencia importa: `resize_page` mueve la ventana del
sistema operativo y queda a merced del alto de la barra de título, de la barra de
tareas y del escalado de Windows; el override fija el viewport de layout en el
número exacto que se pide, reproducible entre corridas y entre máquinas.

Los tres anchos del bloque, con su alto y su `devicePixelRatio`:

```
1440x900x1     el ancho donde el proyecto define el ritmo
1920x1080x1    el ancho de las capturas del reporte
2560x1440x1    el ancho del peor caso del hero
375x667x1      mobile, sólo donde la instrucción lo pide
```

⚠️ **`devicePixelRatio` va en 1 y no se sube.** Con `x2` la captura pesa cuatro
veces y —lo que importa— el canvas 3D cambia de resolución de render, así que
cualquier cifra tomada del canvas deja de ser comparable con las de `x1`.

### Paso 3 — recargar con la marca del intro

```
navigate_page     pageId: <id>   type: reload
                  initScript: try { sessionStorage.setItem('home:intro','1') } catch (e) {}
```

**Dos cosas pasan acá y las dos hacen falta.**

1. **La recarga**, porque el override del paso 2 se aplica sobre una página ya
   pintada: sin recargar quedan medidas tomadas con el layout viejo y
   `svh` resuelto contra el alto anterior.
2. **`home:intro = '1'` como `initScript`**, que apaga el preloader. La clave la
   emite `src/components/layout/home-intro/introHandoff.ts` (`INTRO_SESSION_KEY`)
   y la lee el `<script>` pre-paint del layout raíz **antes del primer pintado**;
   por eso va como `initScript` —corre antes que cualquier script del documento—
   y no como un `evaluate_script` posterior, que llegaría tarde y dejaría el
   overlay de 4,275 s encima de la primera medición.

⚠️ **No se apaga el intro borrando su componente ni tocando `introRutas.ts`.** La
marca de sesión es el mecanismo que el propio preloader publica para esto.

### Paso 4 — verificar que la página EXISTE antes de creerle

```
evaluate_script   pageId: <id>   waitForStableDom: false
  () => ({
    visibilityState: document.visibilityState,
    hasFocus: document.hasFocus(),
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    dpr: window.devicePixelRatio,
  })
```

**La medición sólo vale si las cuatro dan:**

| campo | valor exigido |
|---|---|
| `visibilityState` | `"visible"` — con `"hidden"` no corre `rAF` y no hay eventos de scroll |
| `innerWidth` | el ancho pedido, **> 0** |
| `innerHeight` | el alto pedido |
| `dpr` | `1` |

`hasFocus` se registra y **no bloquea**: una pestaña visible sin foco sí despacha
rendering steps. Lo que invalida la medición es `visibilityState: "hidden"` o un
`innerWidth` de 0. Si alguno falla: **se trae la ventana al frente
(`select_page` con `bringToFront: true`) y se repite desde el paso 2.** No se
mide «igual, para ver».

### Paso 5 — medir o capturar

Recién acá. Las dos formas están abajo.

---

## 2. Medir

Todo con `evaluate_script` y `waitForStableDom: false` (sólo se lee).

**Las secciones se agarran por atributo, nunca por texto.** El texto es relleno y
va a cambiar; `data-panel="<id>"` lo emite `_componentes/Panel.tsx` y es estable:

```js
() => [...document.querySelectorAll('[data-panel]')].map((p) => {
  const r = p.getBoundingClientRect()
  return { id: p.dataset.panel, alto: r.height, top: r.top + window.scrollY }
})
```

⚠️ **`getBoundingClientRect()` miente con transformadas CSS activas.** Es otra
lección ya pagada (`CLAUDE.md`). Donde haya un `transform` de la coreografía en
el ancestro, se mide con el `transform` neutralizado o se mide un elemento que no
lo tenga colgando. Lo que **no** se hace es tomar el número y seguir.

**El scroll se verifica con scroll REAL**, no con geometría:

```js
() => { window.scrollTo(0, N); return null }
```

y se lee el resultado en otra llamada, después de un `requestAnimationFrame`. Un
pin «verificado» comparando alturas no está verificado: `position: sticky` se
apaga en silencio con cualquier ancestro de `overflow` distinto de `visible`, sin
un error en consola, y la geometría de la caja no cambia cuando eso pasa.

**El contraste se mide sobre el píxel real**, componiendo lo que hay detrás, no
sobre el token que el CSS declara. El token es lo que se pidió; el píxel es lo
que se ve.

⚠️ **Y se mide bajo el GLIFO, no bajo la caja del renglón.** La caja es casi todo
fondo, así que una partícula oscura de 3 px que cae entre dos letras hunde el
«peor píxel» sin volver ilegible nada: medido sobre el titular del hero a 1440,
la caja da **3,04:1** y el glifo **10,45:1**, con cero píxeles bajo AA de 40.143.
El procedimiento —tres capturas, el descarte de lo que se mueve entre cuadros, y
el recorte al borde derecho real del texto— está en `B1-DELTAS.md` §4-bis, con la
consecuencia sobre las cifras de contraste anteriores del proyecto.

⚠️ **El aire muerto sobre el píxel** se define en `B1-DELTAS.md` §3: una fila
tiene contenido si hay un borde de luminancia > 0,02. Es la única métrica de este
repo que corre igual sobre un sitio propio y sobre uno ajeno, porque no toca el
DOM de nadie.

---

## 3. Capturar

```
take_snapshot     pageId: <id>   filePath: <scratchpad>/snap-<ancho>.txt
take_screenshot   pageId: <id>   uid: <uid de la sección>   filePath: <destino>
```

**Por qué el `filePath` en el snapshot.** El árbol de accesibilidad completo no
entra en un reporte y no hace falta que entre: se guarda en el scratchpad, se
buscan ahí los `uid` de las ocho regiones y se capturan por `uid`. Cada sección
es una `region` con su nombre accesible, en el orden del recorrido.

**Por qué se captura el ELEMENTO y no el viewport.** Una captura de viewport
muestra una pantalla; una sección de este sitio mide dos o tres. El aire muerto
que este bloque viene a restar **está justamente abajo del primer viewport**, así
que capturar el viewport lo escondería. La captura por `uid` sale a la altura
real de la sección —verificado: Quiénes somos a 1920 sale 1920 × 2160 px, 208 KB—
y es la que deja ver el defecto y su arreglo.

### Dónde se guardan

```
docs/rediseno/capturas/<bloque>/<seccion>-<ancho>-<antes|despues>.png
```

`<bloque>` en minúsculas (`b1`), `<seccion>` es el `id` de `_lib/secciones.ts`
(`hero`, `quienes-somos`, `numeros`, `trabajos`, `servicios`, `tu-panel`,
`por-que-develop`, `cierre`), `<ancho>` el número pelado (`1440`, `1920`).

Ejemplo: `docs/rediseno/capturas/b1/servicios-1920-antes.png`.

⚠️ **`docs/` no está en `.gitignore`**: las capturas se commitean y son la
evidencia del reporte. Lo que **no** se commitea es el scratchpad.

---

## 4. Lo que esta receta NO habilita

**No habilita juzgar.** El navegador da números y capturas. «El aire muerto bajó
de 61 % a 12 %» es una medición. «Queda lindo» no lo es y no se escribe. Quien
juzga es el humano, mirando las capturas.

**No habilita martillar un sitio ajeno.** Cuando la medición es contra una
referencia en producción (nk.studio): **una navegación, una medición, y se
cierra la pestaña.** Se miden números y se escriben con nuestras palabras. No se
copia un selector, ni una clase, ni un valor de CSS, ni un asset.
