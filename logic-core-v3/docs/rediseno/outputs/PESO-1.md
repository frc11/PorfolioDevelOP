# PESO-1 — la línea del titular aplicada, y los 2,2 B que no son suyos

*2026-09-16 · worktree `rediseno-home`, rama `rediseno/home`. No commiteado.*

---

## 0 · EL RESUMEN, ARRIBA DE TODO

La instrucción pedía tres cosas: aplicar la subida de `MONTAJE_DEL_TITULAR_KIB`
de 0,69 a 0,70, dejar el gate en **30 pasos · 0 fallas · 16 deudas**, y numerar
en §7 el episodio del `.next` contaminado.

**La primera está hecha. La segunda no se alcanza con la primera, y está
medido por qué. La tercera cambió de contenido, porque la causa que la
instrucción daba por buena no se reproduce.**

| lo pedido | estado |
|---|---|
| `MONTAJE_DEL_TITULAR_KIB` 0,69 → 0,70 | ✅ aplicado. El techo de 60 no se movió. |
| `s5-peso` en verde | 🔴 **no**. Quedan **2,2 B** que no son de esta línea. |
| §7 numerado | ✅ **§7.61** — con la causa medida, que **no** es el dev server. |
| commit | 🛑 no |

### El gate, reconstruido con `MEDIR_CON_LA_LLAVE_PRENDIDA=1 npm run build` antes de correr

```
verificar: 30 pasos, 1 con falla — 3 · agregado s5
```

**30 pasos · 1 con falla · 16 deudas** — 27 agregados, **135 invariantes**,
**5.542 afirmaciones**, **944 controles positivos**. `tsc --noEmit` limpio.

**Las 16 deudas son exactamente las que la instrucción esperaba** (s10: 12 ·
s8: 3 · s22: 1). Lo único que no coincide es el único paso rojo:

```
FALLA  test:s5-peso   26 afirm · 3 ctrl+ · 2 fallas  (exit 1)
│  FALLA lo que ESCRIBE el lane … −2,2 B de aire
│  FALLA   y el techo VIEJO sigue vigilando … 60,002 KiB
```

⚠️ `npm run test:frontera` queda fuera del agregado y va **antes** del commit.

---

## 1 · LA LÍNEA DEL TITULAR — APLICADA, Y LO QUE ARREGLA

`MONTAJE_DEL_TITULAR_KIB` pasa de **0,69 a 0,70**. El aire de su propio redondeo
pasa de **0,6 B a 10,8 B**, el orden de B11 (8,6) y B12 (8,2) y por encima del
umbral de aire útil de 8 B que su recibo declara.

**Y dejó de imprimirse para pasar a afirmarse.** Mientras la propuesta estaba
pendiente vivía en dos `console.log`, porque una propuesta que nadie ve no es una
propuesta. Aplicada, un `console.log` sería peor que nada: diría que algo está
bien sin que nada lo vigile. Quedan **dos afirmaciones y un control positivo**
—que la línea sea la que el recibo propuso, y que su aire esté arriba del
umbral—, así que el día que alguien la devuelva a 0,69 el gate lo dice con el
número.

**El techo de 60 no se movió ni un centésimo.** Lo que subió es una línea con
nombre que se le suma, revocable sola, y `afirmarIgual(PRESUPUESTO_DEL_LANE_KIB,
60, …)` lo sigue vigilando.

---

## 2 · POR QUÉ NO ALCANZA, CON EL NÚMERO

Subir esa línea un centésimo da **+10,24 B de techo**. El lane estaba **12,4 B
arriba**. Aplicado y medido:

```
FALLA  lo que ESCRIBE el lane, sin el andamio de la llave, entra en 64.5 KiB crudo
       — 64.5 KiB — -2.2 B de aire
```

**Faltan 2,2 B.** Eso **no es un defecto de la propuesta del titular**: esa línea
hablaba del aire de SU redondeo —0,6 B, la convención del centésimo de arriba
cayendo dos veces del lado malo— y lo arregla. El excedente del lane es otra
cuenta, y el A/B dice de quién es.

### El A/B — `scripts-peso/a-atribuir.ts`

Dos builds de producción del **mismo árbol en la misma máquina**, con una sola
variable: `Hero.tsx` devuelto a `cdd7ae03` —el commit anterior a TAPADO-1— con
`git show`, y restaurado desde una copia guardada **fuera** del árbol. Los dos
con `MEDIR_CON_LA_LLAVE_PRENDIDA=1`. El restore verificado por sha256:
`a0b73048…4896cd4`, **idéntico**.

| `Hero.tsx` | lo que ESCRIBE el lane | aire | veredicto |
|---|---|---|---|
| `cdd7ae03` (antes de TAPADO-1) | 66.027,2 B | **+20,8 B** | verde |
| el de hoy | 66.050,2 B | **−2,2 B** | rojo |

> ### 🔴 **TAPADO-1 le suma 23,0 B al lane, y no declaró su línea.**

Su único archivo de producto es `_secciones/hero/Hero.tsx`; lo que viaja del
cambio es la cadena `justify-end … escritorio:justify-center` y las utilidades
que Tailwind emite por ella. Sus bytes se los comió el techo de los demás.

### La propuesta, escrita y NO aplicada

`s5-presupuesto-recibos-de-tapado.ts` — **`MONTAJE_DE_TAPADO_KIB = 0,03`**. Es la
convención sin excepciones: 23,0 / 1024 = 0,0225 → 0,03 KiB, la misma cuenta de
B11 (25 B → 0,03) y MOVIL-1 (31,0 B → 0,04). Con ella el lane pasa de −2,2 B a
**+28,5 B** y `s5-peso` vuelve a verde. **El techo de 60 no se mueve.**

⚠️ **Y lo que la propuesta deja peor, dicho y no escondido:** 0,03 KiB son
30,72 B contra 23,0 medidos, o sea **7,7 B de aire — 0,3 B por debajo** del
umbral de 8 B. Nace siendo la línea más apretada del tablero. El centésimo
siguiente (0,04 → 17,96 B) lo arreglaría, pero redondear para comprar aire sería
inventar una regla nueva en una propuesta: ninguna de las ocho líneas vivas lo
hizo, y la del titular tardó tres paradas justamente por eso.

**Está sin aplicar porque la parada de PESO-1 aprobó UNA línea, la del titular.**
Subir un montaje es la decisión que este subsistema entero le reserva al humano.
Aplicarla por mi cuenta para que el número cierre sería exactamente la movida
contra la que el subsistema existe. Así que el rojo queda a la vista, con el
dueño de los bytes medido y la línea que los cubriría escrita al lado.

La propuesta **se publica en cada corrida de `s5-peso`**, a dos renglones del
número rojo.

---

## 3 · §7.61 — Y POR QUÉ NO DICE LO QUE LA INSTRUCCIÓN DECÍA

La instrucción pedía numerar *«el gate leyó `.next` contaminado por un dev server
y publicó verde con el peso en rojo»*. **El hecho es cierto y la familia también
—un número correcto sobre una entrada equivocada, igual que el instrumento de
TAPADO-1—. La causa no.**

Se midió con `scripts-peso/b-contaminacion.ts`: leer el lane contra el build de
producción, levantar un `next dev`, hacerlo servir `/v3`, matarlo, y **volver a
leer el lane sin reconstruir**.

| entrada | veredicto | aire | fallas |
|---|---|---|---|
| build de producción | ROJO | −2,2 B | 2 |
| el mismo `.next`, con `next dev` habiendo servido `/v3` (200 en ~4 s) | ROJO | −2,2 B | 2 |

**Ni un bit de diferencia.** `s5-peso` mide lo que sale de `htmlDe()`, que lee
`.next/server/app/v3.html` — y **`next dev` no prerenderiza a ese archivo**.
Después de servir `/v3`, `v3.html` conservaba el mtime del build de producción
(`08:11:32`) mientras el dev había corrido a las `08:16`.

**La causa real es más simple y peor: `.next` viejo.** `exigirBuild()` comprueba
**una sola cosa: que el directorio exista**. No comprueba que corresponda al
árbol, y `s5-peso` no lee nunca el código fuente. Un `.next` anterior al cambio
publica el número de antes — que es correcto, de otro árbol. El A/B de §2 lo
cuantifica: ese `.next` publica **+20,8 B y verde**.

**El dev server es el encubridor, no el autor:** hace que el árbol parezca
construido. La página contesta, `.next` tiene archivos recientes, todo se ve
vivo, y el artefacto del que depende el gate quedó intacto desde antes.

**La salida que este sprint no aplica porque no es suya:** que `exigirBuild()`
pueda decir *«este `.next` es de este árbol»* —una huella de los fuentes del lane
escrita en el build y comparada al leer—. Mientras no exista, la única defensa es
de procedimiento (reconstruir antes del gate) y una defensa de procedimiento no
es un invariante: **no puede fallar sola.**

---

## 4 · SOBRE QUÉ ÁRBOL SE MIDIÓ TODO ESTO

⚠️ El worktree **no está limpio al empezar este sprint**: arrastra MOVIL-1 sin
commitear (`EscenarioCompuerta.tsx`, `compuerta.ts`, `EscenaDelHome.tsx`,
`ProbeStage.tsx`, `configuracionDelCanvas.ts`, `ajustes.ts`, `calidad.ts`) y los
scripts de CAMARA-1/2. **Eso no ensucia la cuenta, y se puede decir por qué:**
MOVIL-1 declaró su línea —`MONTAJE_DE_MOVIL_KIB = 0,04`, con su recibo— así que
sus bytes ya están cubiertos por el techo.

La prueba es aritmética y cierra: el excedente de la instrucción era **12,4 B**,
la línea del titular aporta **+10,24 B**, y lo medido después de aplicarla es
**−2,2 B** (12,4 − 10,24 = 2,16). El residuo es exactamente lo que el A/B
atribuye a `Hero.tsx`, y el A/B movió **una sola variable** sobre este mismo
árbol, con los dos builds compartiendo todo lo demás.

---

## 5 · ARCHIVOS

**Modificados**
- `src/app/v3/_lib/__tests__/s5-presupuesto.ts` — `MONTAJE_DEL_TITULAR_KIB` 0,69 → 0,70, con el docblock reescrito.
- `src/app/v3/_lib/__tests__/s5-presupuesto-recibos-del-titular.ts` — la propuesta pasa a ✅ APLICADA, con su texto intacto.
- `src/app/v3/_lib/__tests__/s5-peso.invariant.ts` — los dos `console.log` de la propuesta del titular reemplazados por dos afirmaciones y un control positivo; publicación de la propuesta de TAPADO-1.
- `docs/rediseno/DIRECCION-ESCENA.md` — §7.61.

**Nuevos**
- `src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-tapado.ts` — el recibo de los 23,0 B y la propuesta 🟡 sin aplicar.
- `scripts-peso/a-atribuir.ts` · `scripts-peso/b-contaminacion.ts`
- `docs/rediseno/outputs/peso/a-atribuir.json` · `b-contaminacion.json`

---

## 6 · FUERA DE SCOPE, ANOTADO Y NO TOCADO

**`s10-logo-alto.ts:52` apunta a un archivo que no existe.** Su docblock cierra
diciendo que la prueba de que el modelo sirve *«es el contraste contra el
navegador, que vive en `s10-logo-recibos-de-tapado.ts` y se afirma con su
delta»*. Ese archivo **no está en el árbol**: el contraste contra el navegador
vive en `s10-logo-composicion.ts`, que sí existe y sí lo afirma.

Es un puntero equivocado en un archivo commiteado por TAPADO-1, y lo que señala
es justo la línea con la que ese instrumento se defiende de ser «verde por
vacío». No se tocó: es de `s10`, no de este sprint.
