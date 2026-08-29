# Fixtures de los instrumentos de S4

Invariantes de mentira. **No verifican nada del sitio** y no tienen script en
`package.json` a propósito: existen para que los instrumentos de S4 puedan
medirse a sí mismos sin romper un invariante de verdad, que sería cambiar el
sujeto en vez de arreglar el instrumento.

| fixture | para qué |
|---|---|
| `falla-a` · `falla-b` | Las dos fallas del Problema 0. `falla-b` va **último** en el padrón: si el agregado cortara en la primera falla, no aparecería. |
| `pasa` | Sin él, un agregado que dijera "falla" a todo también daría verde. Trae un control positivo para que el contador tenga qué contar. |
| `fuera-de-ventana` | Una comprobación que corre y otra que no: prueba que `noCorre` imprime, cuenta aparte y **no hace fallar**. |
| `todo-fuera-de-ventana` | El caso límite del Problema 3: cero afirmaciones, todo fuera de ventana. Sale en cero y **lo dice**. |
| `vacio` | El control del anterior: cero afirmaciones y cero huecos **sigue siendo falla**. La ventana no es una excusa para el verde por vacío. |

Se corren en un proceso hijo, no importándolos: `cerrar()` termina con
`process.exit()`, y además los contadores de `afirmar.ts` son del módulo — una
llamada de prueba en el mismo proceso ensuciaría la cifra del invariante que
mide.
