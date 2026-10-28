# C2-31m · El moiré: `mouse` por defecto, sin líneas negras, con la entrada para el teléfono

Cola 2 (2026-10-23), tarea 31, punto 2 (`docs/cola/2026-10-23/31-cristal.md`). Las grietas (punto 1) las hace 31g en paralelo.

## Plan

1. `?moire=mouse` pasa a ser el moiré, y `0`, `1` y `2` se borran con su código: la capa fina, su desajuste (el slider del
   store), la disposición por variante y la bandera (`?moire=` ya no pide nada).
2. Las líneas negras horizontales en el piso cerca del cursor (captura `lote3/01`): encontrar de dónde salen y arreglarlo de raíz.
3. La entrada del moiré preparada para la inclinación del teléfono (la conecta la 81): una función con el mismo rango que el mouse.
4. Que el costo por cuadro no suba.
5. Pruebas sin navegador (`s78-c2-31m`, y las suites del área sin fallas nuevas) y el banco `scripts-carga/moire.ts` con
   `CONTROL=con-lineas`.

## Log

**De dónde salían las líneas.** No era la trama. Con la captura ampliada, las rayas están en el frente de una meseta de bloques
levantada alrededor del cursor: son los costados de los bloques que la simulación del piso vivo levanta en una loma bajo el puntero
(`PISO_VIVO.cursor`: 0,6 u en un radio de 2 u; ESCENA 6/7). En el escenario de la formación (radio 45) el bloque mide 1,06 u y la
loma ocupa unas cuatro filas. El estado quieto de la simulación (calculado en `s78-c2-31m`): la loma sube 0,32 u y cada fila queda
entre 0,083 y 0,098 u sobre la de adelante. Con eso el costado se sombrea entero como costado (`luz.escalon` llega a 0,1) y al pie
queda entre 0,61 y 0,64 de la tapa (`luz.costado` × la rendija). En la captura las rayas están a ~0,59 del piso blanco: es eso.
Valentino las vio con `?moire=mouse` porque con esa variante movía el mouse sobre el piso. Salen igual con cualquier moiré y sin
trama (el banco lo mide: el diagnóstico con y sin la trama).

**El arreglo.** El cursor ya no empuja el piso (`piso/PisoVivo.tsx`, `LOMA_DEL_CURSOR`): la presencia queda en cero y el rayo al
piso no se tira. El piso sigue con el mar, el pulso y la onda de la interfaz. La loma de antes queda sólo como el defecto del banco
(`window.__defectosDeLaIntro = 'con-lineas'`, nunca la URL), para el control positivo. Sin loma no hay escalón que dibujar: suavizarla
hasta que no se vean los costados (escalón ≤ 0,03 u) la deja en ~0,1 u de alto, que tampoco se ve, así que no tenía sentido conservarla.

**El moiré.** `moire/fijo.ts` queda con el tope y el corrimiento. `MoireScreen.tsx` dibuja una capa (la gruesa en la pared) y el
zócalo, sin el store. `MoireDelMouse.tsx` siempre montado: con movimiento reducido el mouse no lo mueve, pero una entrada de afuera
sí. `estrellas/trama.ts` lee una sola capa (el lugar de la fina en el shader compartido queda apagado: `uCapasDeLaTrama.x` en 0).
`entorno.ts` pierde la variante y `?moire=`.

**La entrada** (`moire/entrada.ts`): `fijarLaEntradaDelMoire({ x, y } | null)`, `laEntradaDelMoire(mouse)` y `hayEntradaDeAfuera()`.
Usa el rango del mouse: x de −1 (izquierda) a 1 (derecha), y de −1 (abajo) a 1 (arriba), igual que `state.pointer` e
`INCLINACION_DEL_TELEFONO`. Acota lo que se pasa del rango; NaN vale 0. Pasa por el mismo amortiguador y el mismo tope que el mouse.
Para la 81: en `giroscopio.ts`, después de escribir la inclinación, `fijarLaEntradaDelMoire(INCLINACION_DEL_TELEFONO)`; al callar,
`fijarLaEntradaDelMoire(null)`. Con el banco, `__moireDelBanco.fijarLaEntrada` la fija desde la página.

**El costo.** La trama dibuja una malla menos que el defecto de B8 (`2`: la gruesa y la fina, ~0,05 + ~0,06 ms) y lo mismo que
`mouse`. La rendija no reserva nada por cuadro. El piso se ahorra el rayo del cursor por cuadro. La simulación no cambia (con
presencia 0 la fuerza del cursor da cero).

**Las pruebas.** `s78-c2-31m` (nueva, 32 afirmaciones con sus controles). `s78-b8` reescrita para la que quedó: de 42 a 26
afirmaciones porque se fueron las de las variantes borradas, el batido de `2` incluido. `s30`, `s31`, `s35` y `s40` dejaron de
afirmar la variante del moiré en el entorno y en la URL. `s34` cambió el nombre del objeto (`trama gruesa`). `s69` ahora pide el
pliegue sobre una sola capa. Verdes: s78-c2-31m, s78-b8, s30 a s35, s38, s40, s48, s49, s69 a s72, s3-codigo, s5-codigo,
s8-escena, s9, s10-lectura; tsc 0; eslint limpio en lo tocado. No nuevas: `s4-cobertura` (pide los agregados de s23 a s39, que
no toqué), `s36` (una regex de Portfolio y Por qué develOP, archivos que no toqué) y `s8-tres`, que necesita un `.next` armado.

## Qué mirar

- Banco: `BASE=http://localhost:3000 npx tsx scripts-carga/moire.ts`, después `CONTROL=con-lineas` (tiene que fallar SIN LÍNEAS)
  y, contra la integración sin la 31m, `ANTES=1 ROTULO=antes` para las fotos de antes. Las fotos (`recien`, `quieto`, el recorte
  ampliado) se guardan en `~/.cache/b4-medicion/moire-<rótulo>/`, o en `BANCO_FOTOS`.
- A ojo, `http://localhost:3000/v3` a 1440 en Quiénes somos: mover el mouse sobre el piso a la izquierda del logo. La trama de la
  pared se corre apenas con el mouse y el piso no levanta bloques ni muestra rayas junto al cursor. `?moire=0` (o cualquier valor)
  ya no cambia nada.
