# ORDEN-2 · LA SEXTA LISTA, Y LA RECONCILIACIÓN CON LAS CINCO

Partición del working tree de `C:\rediseno-home` (rama `rediseno/home`, commit
`4009d327`) en **seis** commits. **241 archivos en el árbol · 239 asignados · 2
sin asignar** (los mismos dos de PESO-1 que ORDEN-1 ya había dejado afuera).

Orden: **MOVIL-1 · TEXTO-2 · TEXTO-3 · COMPO-1 · PAPEL-2 · COMPO-2**. Un archivo
que dos informes reclaman va en el PRIMERO de esa lista — la regla es de ORDEN-1
y acá no se cambia.

⚠️ Estas listas se corren desde `C:\rediseno-home`, que es donde están los
cambios.

---

## 0 · DÓNDE ESTÁ ORDEN-1, Y POR QUÉ HAY QUE DECIRLO

**`ORDEN-1-LISTAS.md` NO está en este worktree.** El único ejemplar del disco
vive en

```
C:\deslizar\logic-core-v3\docs\rediseno\outputs\ORDEN-1-LISTAS.md
```

—24.530 B, 2026-09-17 08:29, worktree `rediseno/deslizar`— y describe el árbol
de `C:\rediseno-home`, que es otro. Las cinco listas de este documento se
leyeron de ahí y se extrajeron **programáticamente**, no a mano: 56 + 54 + 23 +
34 + 46 = **213**, los mismos totales que ORDEN-1 declara en cada encabezado.

⚠️ **Consecuencia operativa: ORDEN-1 se quedó viejo el mismo día que se
escribió.** COMPO-2 corrió a partir de las 08:35 y el documento es de las 08:29,
así que la partición de 215 archivos que publica ya no describe el árbol. Este
documento la reemplaza; el de `deslizar` queda como el «antes».

**Las dos mudanzas que el dueño ya aprobó están aplicadas acá**:
`s5-peso.invariant.ts` y `hero/hero.invariant.tsx` salen de TEXTO-2 y entran en
PAPEL-2. Por eso TEXTO-2 figura con 52 y PAPEL-2 con 48, y no con 54 y 46.

---

## 1 · LA LISTA DE COMPO-2 — 26 archivos

**COMPO-2 tocó 44 archivos. 26 son suyos y 18 ya los reclama una lista
anterior**, así que esta lista tiene 26 renglones. Los 18 están en el §2.

```bash
git add logic-core-v3/scripts-compo2/a-medir.ts
git add logic-core-v3/scripts-compo2/b-derivacion.ts
git add logic-core-v3/scripts-compo2/c-antes.mjs
git add logic-core-v3/scripts-compo2/compo2-comun.ts
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-presupuesto-recibos-de-compo2.ts
git add logic-core-v3/src/app/v3/_secciones/hero/ajuste.ts
git add logic-core-v3/docs/rediseno/outputs/COMPO-2.md
git add logic-core-v3/docs/rediseno/outputs/compo2/a-hoy.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-regla0.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-b768.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-b768sub.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-b768fino.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-b1024.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-b1024fino.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-pastilla.json
git add logic-core-v3/docs/rediseno/outputs/compo2/a-despues.json
git add logic-core-v3/docs/rediseno/outputs/compo2/b-derivacion.json
git add logic-core-v3/docs/rediseno/outputs/compo2/b-derivacion.txt
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-320x568.png
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-375x667.png
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-390x844.png
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-425x844.png
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-768x1024.png
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-1024x768.png
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-1440x900.png
git add logic-core-v3/docs/rediseno/capturas/compo2/despues-1920x1080.png
```

**Los 26, por clase**: 4 instrumentos (`scripts-compo2/`), 2 de código del lane
(el invariante §16 del Hero y el recibo de peso), 1 informe, 11 salidas de
medición y 8 capturas.

⚠️ **Ningún archivo de PRODUCTO está en esta lista.** Los seis que COMPO-2 cambia
en pantalla —`Hero.tsx`, `contenido.ts`, `geometria.ts`, `theme-develop.css`,
`contrato.ts` y `ChromeDelHome.tsx`— los reclama todos una lista anterior. El
commit de COMPO-2 es, en producto, **vacío**: lo suyo ya viajó.

---

## 2 · LA RECONCILIACIÓN — 18 archivos que COMPO-2 comparte

Cada uno queda en la lista que lo reclama PRIMERO, que es la decisión ya tomada.
**Un commit de git es una foto del archivo entero**, así que el commit que se lo
lleva se lleva TAMBIÉN el cambio de COMPO-2 sobre ese archivo. No se
redistribuye nada.

| archivo | queda en | qué adelanta de COMPO-2 |
|---|---|---|
| `docs/rediseno/CONTENIDO-PENDIENTE.md` | **TEXTO-2** | el pedido del Hero pasa de tres entradas a dos (la bajada deja de estar partida) |
| `src/app/v3/_secciones/hero/Hero.tsx` | **TEXTO-2** | la bajada sin quiebre, las dos clases del §1 y el `className` de la celda lateral |
| `src/app/v3/_secciones/hero/contenido.ts` | **TEXTO-2** | `bajadaFila1` + `bajadaFila2` → `bajada`, y `PEDIDO` de 3 a 2 |
| `src/app/v3/_secciones/hero/geometria.ts` | **TEXTO-2** | el factor `2.63219`, las tres clases nuevas y la banda portátil del registro 1 |
| `src/app/v3/_lib/__tests__/s5-presupuesto.ts` | **TEXTO-2** | `MONTAJE_DE_COMPO2_KIB` (0,19) y su docblock |
| `src/app/theme-develop.css` | **TEXTO-3** | el token `--text-display-r1-portatil` |
| `src/app/v3/_lib/__tests__/tokens.invariant.ts` | **TEXTO-3** | ese token en `ESPERADO_DENTRO` |
| `src/app/v3/_lib/__tests__/padron-de-tokens.ts` | **TEXTO-3** | la entrada del token en `AGREGADOS` |
| `src/lib/utils.ts` | **COMPO-1** | `text-display-r1-portatil` en la lista de tamaños de `cn()` |
| `src/app/v3/_lib/__tests__/s5-archivos.ts` | **COMPO-1** | el registro de `hero/ajuste.ts` en el padrón |
| `src/app/v3/_lib/__tests__/s5-peso-lineas.ts` | **COMPO-1** | el bloque de afirmaciones de la línea de COMPO-2 |
| `.gitignore` | **PAPEL-2** | `/.next-compo2/` y `/.next-compo2-antes/` |
| `tsconfig.json` | **PAPEL-2** | los cuatro `include` de esos dos `distDir` |
| `src/app/v3/_chrome/contrato.ts` | **PAPEL-2** | el renombre de las dos constantes y la banda `max-medio:hidden` |
| `src/app/v3/_chrome/ChromeDelHome.tsx` | **PAPEL-2** | la referencia renombrada |
| `src/app/v3/_secciones/hero/papel.ts` | **PAPEL-2** | §15c y §15d con los términos nuevos del presupuesto y de la banda |
| `src/app/v3/_lib/__tests__/s10-acceso-landmarks.ts` | **PAPEL-2** | la banda de los dos landmarks reescrita de 390 a 860 |
| `src/app/v3/_secciones/hero/hero.invariant.tsx` | **PAPEL-2** | el §16 cableado y las afirmaciones de la bajada rehechas |

**El caso más cargado sigue siendo `s5-presupuesto.ts`**: su diff ya llevaba las
cuatro líneas de presupuesto de TEXTO-2, TEXTO-3, COMPO-1 y PAPEL-2, y ahora
lleva la quinta, la de COMPO-2. Se va entero en el commit 2.

⚠️ **Y `geometria.ts` queda igual de cargado**: el commit de TEXTO-2 se lleva el
archivo con los diez ajustes de COMPO-1, las dos clases de PAPEL-2 y las cuatro
de COMPO-2 adentro.

---

## 3 · EL RECUENTO DEL ÁRBOL

| | ORDEN-1 (08:29) | ORDEN-2 (hoy) |
|---|---|---|
| archivos en el árbol | 215 | **241** |
| asignados a exactamente una lista | 213 | **239** |
| sin asignar | 2 | **2** |
| archivos en más de una lista | 0 | **0** |
| archivos en una lista que no están en el árbol | 0 | **0** |

Los **26 archivos nuevos** son exactamente los de la lista del §1: 215 + 26 =
241, sin residuo.

### Lo que queda afuera — los mismos dos de PESO-1

```
logic-core-v3/docs/rediseno/outputs/peso/a-atribuir.json
logic-core-v3/docs/rediseno/outputs/peso/b-contaminacion.json
```

Son la evidencia de **PESO-1**, que ya está commiteado (`040d8800`) y dejó sus
dos salidas afuera. **No son de COMPO-2 y este documento no las adopta**:
siguen siendo el sexto commit —ahora séptimo— que ORDEN-1 propuso, o un
`git add` suelto. Ninguno de los seis commits las necesita para compilar.

⚠️ Están **staged** en el índice desde antes de esta sesión (`git status` las
muestra con `A `), o sea que un `git commit` sin `git add` se las llevaría con
el primer commit que se haga. Si no se quieren ahí, hay que sacarlas del índice
antes de empezar.

---

## 4 · LA SIMULACIÓN DE LOS SEIS COMMITS

Método: para cada commit `k` se arma el checkout que quedaría —la versión del
**working tree** para todo lo que ya entró, la de **HEAD** para lo que no, y nada
para lo nuevo que todavía no llegó— y se resuelven los importes relativos y del
alias `@/` de los **2.396 archivos de código** del proyecto contra ese árbol.

⚠️ **El ruido de la expresión regular se resta con un control, no a ojo.** El
estado final (los seis commits aplicados) es el working tree de hoy, que
`tsc --noEmit` deja en cero; todo lo que «cuelga» ahí es una cadena `import ...`
adentro de un docblock, de un control positivo o de la tabla de parche de
`scripts-papel/b-antes.mjs`. Son **18** y se restan de cada commit.

### 4.1 · Con las listas como están — TRES importes colgando

| después del commit | archivos | acumulado | colgando |
|---|---|---|---|
| 1 · MOVIL-1 | 56 | 56 | **0** ✅ |
| 2 · TEXTO-2 | 52 | 108 | **0** ✅ |
| 3 · TEXTO-3 | 23 | 131 | **0** ✅ |
| 4 · COMPO-1 | 34 | 165 | **1** ❌ |
| 5 · PAPEL-2 | 48 | 213 | **2** ❌ |
| 6 · COMPO-2 | 26 | 239 | **0** ✅ |

Los tres cuelgan de **dos archivos**:

- `s5-peso-lineas.ts` (COMPO-1, commit 4) → `./s5-presupuesto-recibos-de-compo2`,
  que llega en el commit **6**. Cuelga en 4 y en 5.
- `hero/hero.invariant.tsx` (PAPEL-2, commit 5) → `./ajuste`, que llega en el
  commit **6**. Cuelga en 5.

**Las dos mudanzas que el dueño ya aprobó siguen siendo necesarias y no
alcanzan**: resolvieron los cinco importes que ORDEN-1 midió, y COMPO-2 abre
tres nuevos por el mismo mecanismo —un archivo que viaja temprano importando uno
que llega tarde—.

### 4.2 · Qué hay que mover para que los seis queden en cero

Se probaron las tres variantes con el mismo simulador:

| variante | MOVIL-1 | TEXTO-2 | TEXTO-3 | COMPO-1 | PAPEL-2 | COMPO-2 |
|---|---|---|---|---|---|---|
| **A** · sin mover nada | 0 | 0 | 0 | **1** | **2** | 0 |
| **B** · mover DOS a COMPO-2 | 0 | 0 | 0 | 0 | **1** | 0 |
| **C** · mover **TRES** a COMPO-2 | 0 | 0 | 0 | **0** | **0** | **0** ✅ |

**La variante B no alcanza, y el simulador dice por qué**: al sacar
`s5-peso-lineas.ts` del commit 4, el `s5-peso.invariant.ts` del commit 5 —que ya
se había mudado una vez, de TEXTO-2 a PAPEL-2— se queda importando un archivo
que todavía no llegó. **Arrastra.**

**La variante C son estos tres `git add`, movidos a la lista de COMPO-2:**

```bash
# de COMPO-1 (commit 4) a COMPO-2 (commit 6)
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-peso-lineas.ts
# de PAPEL-2 (commit 5) a COMPO-2 (commit 6)
git add logic-core-v3/src/app/v3/_lib/__tests__/s5-peso.invariant.ts
git add logic-core-v3/src/app/v3/_secciones/hero/hero.invariant.tsx
```

Con eso las seis listas quedan: MOVIL-1 56 · TEXTO-2 52 · TEXTO-3 23 ·
**COMPO-1 33** · **PAPEL-2 46** · **COMPO-2 29** = 239.

**Es una desviación de la regla «va en el primero», así que la decide el dueño** —
la misma decisión que ya tomó para los dos primeros. Lo que cuesta: los tres son
INVARIANTES, no producto, y el commit que los reciba se lleva las cinco líneas de
recibo de peso y las tres tandas de cuentas del Hero. Lo que compra: que cada uno
de los seis commits sea un punto en el que el repo type-checkea.

### 4.3 · ⚠️ UN SEGUNDO ORDEN QUE NINGUNA LISTA PUEDE ARREGLAR

`test:s5-codigo` **no puede estar en verde en los commits intermedios**, y no es
culpa de cómo se repartan los archivos. El padrón de `s5-archivos.ts` afirma las
DOS direcciones:

- `archivosDeclaradosQueFaltan()` — lo que está registrado y no en disco;
- `archivosSinRegistrar()` — lo que está en disco y no registrado.

Medido: la versión de **HEAD** de `s5-archivos.ts` no registra ninguno de
`hero/composicion.ts`, `hero/papel.ts` ni `hero/ajuste.ts`; la del **working
tree** registra los tres. O sea:

- si `s5-archivos.ts` viaja temprano (commit 4, donde está), en 4 y 5 registra
  archivos que todavía no llegaron → rojo por la primera dirección;
- si viajara tarde, en 4 y 5 habría archivos en disco sin registrar → rojo por la
  segunda.

**No hay colocación que lo salve**: haría falta que el padrón viajara en el mismo
commit que cada archivo que registra, y son tres commits distintos. Es una
propiedad de partir un árbol en seis, **no afecta la compilación** —`tsc` no mira
el padrón— y ORDEN-1 no lo vio porque sólo contó importes. Se declara y no se
arregla: el único commit en el que el gate cierra entero es el último.

---

## 5 · EL MENSAJE DE COMPO-2

Sin acentos, como los otros cinco.

```
COMPO-2: la bajada en un renglon, la marca grande y el titular crecido en portatil

- regla global: la bajada va en UN renglon en los ocho anchos. Medido, 243,34 px
  contra la caja mas chica de 256 (a 320). El quiebre de COMPO-1 queda revocado
  en el DATO: bajadaFila1 + bajadaFila2 vuelven a ser un campo
- la marca del hero x2,63219 en los anchos de papel, y el factor es una RAZON:
  avance(TU NEGOCIO) / (leading-titulo x razon del viewBox), o sea que el isotipo
  mide de ancho lo que mide la tinta del titular. Constante en los dos anchos
- el bloque centrado de verdad: justify-center centra en la caja de contenido, y
  hacen falta dos cosas mas para que sea el viewport — el aire de arriba igualado
  al del pie y la celda lateral vacia apagada, que se llevaba 12 px de canaleta
- el registro 1 crece en la banda portatil: 67 px a 768 y 95 a 1024, los dos
  TECHOS medidos sobre el pixel (el mayor tamaño con el que la tinta del titular
  sobre la masa del logo no sube de lo que ya es)
- la pastilla apagada hasta 860 (max-medio:hidden). Las constantes se renombran
  porque la banda dejo de ser la del papel
- HALLAZGO: el bloque NO cae al sacar la pastilla — lo reserva pb-20, medido en
  0,00 px. Lo que si lo mueve es la regla global, y a 768 lo mete en la SEGUNDA
  masa de la escena (3,35 -> 8,53 %) hasta que se le devuelve el renglon exacto
- +186 B, linea 0,19 KiB con recibo. Techo de 60 intacto. La primera linea que
  DEVUELVE parte de lo que cuesta: 70 B de marcado
```

### La línea para el ÚLTIMO commit

El último commit de la tanda **es** el de COMPO-2, así que la línea va en ese
mismo mensaje, al final:

```
- ⚠ 18 de los 44 archivos que este sprint toco NO estan en este commit: los
  reclamo una lista anterior y viajaron ahi, con los cambios de COMPO-2 adentro.
  Los seis que cambian la pantalla (Hero.tsx, contenido.ts, geometria.ts,
  theme-develop.css, contrato.ts y ChromeDelHome.tsx) estan entre esos 18, asi
  que en producto este commit es vacio. El reparto, archivo por archivo, en
  docs/rediseno/outputs/ORDEN-2-LISTAS.md
```

---

## 6 · VERIFICACIÓN DEL ÁRBOL FINAL

Con las seis listas aplicadas —o sea, el working tree de `C:\rediseno-home` tal
como está hoy—:

```
MEDIR_CON_LA_LLAVE_PRENDIDA=1 NODE_OPTIONS=--max-old-space-size=6144 npm run build
  -> EXIT=0

npx tsc --noEmit
  -> cero errores, exit 0

gate por grupos: 27 de 27 en verde
  135 invariantes · 5.737 afirmaciones · 977 controles positivos
  13 fuera de ventana · 0 con falla · 19 deudas declaradas
```

⚠️ **Y `next build` SI corre el typecheck en esta version (Next 16.2.9)**, contra
lo que el repo tenia anotado. Un build rojo puede ser un error de tipos, no solo
de bundling.
