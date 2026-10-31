# P · La pasada de estética: que las páginas se vean como el home

Valentino recorrió las diez páginas el 2026-10-31 y la devolución fue dura y consistente: **la base, la información y la estructura están bien; lo que está mal es la estética, los espacios, los tiempos y la distribución.** Sus palabras: *«en terminos generales, la base esta bien, la info, como se estructura, le falta mejorar estetica, espacios, tiempos, distribuciones, etc, que se base en el home para mejorar eso»*. Sobre páginas concretas fue más directo: *«ta una verga»*, *«el nosotros es un asco»*, *«esta todo un asco»*.

**Esto no es un lote de features. Es un lote de oficio.** Casi nada hay que inventar: hay que mirar cómo está resuelto el home y resolver la página igual.

## El estándar: el home es la especificación
Antes de tocar nada, cada carril hace esto y lo escribe en su `P<n>-plan.md`:

1. **Leé `docs/ideas/VOZ-DEL-SITIO.md`** (está en la rama `l7/lab`: `git show l7/lab:logic-core-v3/docs/ideas/VOZ-DEL-SITIO.md`). Es el inventario de lo que hace el home, con sus tiempos y curvas reales medidos. Es tu especificación, no una sugerencia.
2. **Medí el ritmo del home** en el navegador, a 1440, y anotá los números: dónde empieza el texto de una sección en el eje x, cuánto aire hay arriba y abajo de cada sección, cuánto entre un título y su cuerpo, la escala tipográfica, y cuánto tarda y con qué curva entra cada cosa.
3. **Compará con tu página** y listá cada diferencia. Después cerrá cada diferencia, salvo donde haya una razón escrita para que difiera.

**El hallazgo que ya tenemos medido** (de `M1-resultado.md`): a 1440 las secciones del home empiezan en **x=188** porque el home tiene una columna lateral; las secciones de las páginas empiezan en **x=32**. Las páginas no heredaron la grilla del home. Esa sola diferencia explica buena parte de «no es la estructura que venimos trabajando». **El carril P0 la arregla para todos**; los demás construyen sabiendo que la grilla va a estar.

## Reglas de estética que valen para todos
- **Fuera el cuadradito de color para marcar títulos.** Valentino: *«lo que yo quiero que saques es el formato de usar el puntito de color para remarcar titulos y eso»*. Sacalo de todas las páginas; el home no lo usa.
- **Nada pegado al borde.** Ningún bloque, CTA ni texto toca el borde de la pantalla ni el del pie. Siempre hay aire antes del pie.
- **Separación legible entre secciones.** Valentino: *«no esta todo bien separadito»*. Si dos bloques se leen como uno solo, falta aire.
- **Los tiempos también son estética.** Nada aparece ya hecho al entrar, nada se mueve antes que lo que tiene que moverse primero. Si un efecto no se nota, no está.
- **Reusá las piezas del home**, no las copies. Si una pieza del home no se puede reusar desde una página, escribilo como propuesta en tu resultado en vez de duplicarla.

## Carriles

| carril | worktree | rama | puerto | lote | modelo |
|---|---|---|---|---|---|
| P0 | `C:\nocturno\cola3` | `p/0` | 3002 | el esqueleto compartido y el home | Opus high |
| P1 | `C:\nocturno\cola3b` | `p/1` | 3003 | Nosotros y Portfolio | Opus high |
| P2 | `C:\nocturno\cola3c` | `p/2` | 3004 | el blog, la nota y la 404 | Opus high |
| P3 | `C:\nocturno\cola3d` | `p/3` | 3005 | las tres de servicio | Opus high |

Los cuatro salen de `l7/a` con M-INT adentro.

## Fronteras de escritura
- **P0 es el único** que toca la grilla compartida, la intro de la página base, el cierre de las páginas y el home. Los otros tres **no tocan nada de eso** y construyen asumiendo que P0 ya lo arregló: la grilla del home puesta, la intro corta otra vez y el cierre con la coreografía del home.
- **P1:** `src/app/v3/nosotros/**` y `src/app/v3/portfolio/**`.
- **P2:** `src/app/v3/blog/**`, `public/v3/blog/**` y la 404 de `/v3`.
- **P3:** las tres páginas de servicio y `src/app/v3/_servicios/**`.
- Si necesitás algo fuera de tu frontera, escribilo como propuesta en tu resultado y construí alrededor. Cuatro carriles están editando el mismo repo.

## Reglas
- Candado `C:\nocturno\.turno-cola3` solo para lo que mide cuadros, tiempos de animación o el build. El resto corre en paralelo. Un solo Chrome por carril, cerrado al terminar cada tanda.
- Nadie está mirando. **Nunca preguntes**: tomá la lectura más razonable, anotá la decisión en tu resultado y seguí.
- Nunca merge, reset, rebase, push --force, stash ni checkout que descarte. Nunca `git add .`. Commiteá seguido y pusheá solo tu rama.
- Estado en `ESTADO-p<n>.md`, un `P<n>-plan.md` corto antes de construir y un `P<n>-resultado.md` al final.
- Verificación a 1440, 1024, 768 y 390, con una foto por página por ancho. Si tu herramienta no llega a 390 de verdad, decilo en vez de darlo por verde.
- Revisión independiente al final de cada carril, sobre tu propio diff.
