# SPRINT C2-50 · La sección Servicios del home (cola 2, 2026-10-23)

Tarea: `docs/cola/2026-10-23/50-servicios.md` (ítems 12, 13, 20 y mobile). Worktree `C:\nocturno\2026-10-23\50`.

## Plan

1. Entrada: «Nuestros servicios» en la letra del título del Panel, que se pinta por tiempo al terminar de llegar
   (`escenario/TituloQueSePintaAlLlegar.tsx`); subtítulo nuevo, más grande y en tinta; `AvisoDeScroll` debajo; los nanobots en una
   ÓRBITA alrededor del título con los tres acentos mezclándose (`simbolos.ts: orbita`, el sombreador).
2. Cada servicio (`escenario/PanelDeServicio.tsx`): el título centrado sobre el lugar de los nanobots, ajustado a su columna, con
   `?titulo-servicio=1|2|3` y subrayado al terminar de llegar; el video de arriba a abajo con velo; la diagonal numérica (6,5°); el
   texto nuevo de techo a pie en serif cursiva con `?fuente-servicio=1|2|3|4` (`ajuste.ts`); el cuerpo desde la mitad de la entrada
   del panel (`tiempos.ts`); IA con columnas simétricas.
3. La nube entre servicios: más lenta (0,05 a 0,9 de la transición), una bola 3D grande con borde claro (el sombreador).
4. Teléfono: gatillo siempre (se borró `deslizar`), el orden nuevo, el aviso del gesto, y el bug de la rueda a 390
   (`_componentes/gatillos/`: la cuenta de lo pedido sin Lenis y el asiento al llegar).
5. Las letras de Google llegan perezosas (`escenario/fuentes/*.ts` por `import()`): por defecto baja una sola.

## Log

- Todo en un commit de la sección y uno de la máquina de gatillos (compartida con la parada de Demos: sólo cambia el camino sin Lenis).
- s81 actualizada a la spec (banderas, tiempos, la órbita en la réplica de la CPU, escenarios de prueba estimados de nuevo) con
  controles nuevos: el cuerpo temprano, el subrayado rápido primero, la entrada sin Lenis, el ajuste del texto, el orden del teléfono
  y los textos de 05-TEXTOS. s6-servicios: el párrafo pasó al texto del medio nuevo.
- Banco nuevo, sin correr: `scripts-carga/servicios-c2.ts` (CONTROL `eje-corrido` y `sin-objetivo-nativo`).

## Qué mirar

1. `/v3#servicios` a 1440 y 1024: la órbita de colores, el título que se pinta, el aviso; cada servicio (título sobre los nanobots,
   subrayado, video lleno con velo, texto de techo a pie); la nube entre web y software.
2. `?titulo-servicio=1|2|3` × `?fuente-servicio=1|2|3|4`; `?diagonal=` con otros grados.
3. 390 y 768: el orden, el aviso del gesto, la rueda desde arriba.
