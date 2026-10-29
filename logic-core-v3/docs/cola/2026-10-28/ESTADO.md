# ESTADO · cola 3 (2026-10-28)

Rama `cola3/2026-10-28`, worktree `C:\nocturno\cola3`, nacida de `rediseno/home` con la cola 2 mergeada. Un lote por sesión, en orden: L1 → L2 → L3 → L4 → L5 → L6. Cada lote agrega su línea acá al cerrar.

| Lote | Modelo | Estado | Commits | Resultado |
|---|---|---|---|---|
| L1 | Sonnet medio | cerrado | 2da961f0..452e5ef8 | L1-resultado.md |
| L2 | Opus alto | cerrado | 88756153..5d050269 | L2-resultado.md |
| L3 | Opus alto | cerrado | 0372a9e7 | L3-resultado.md |
| L4 | Sonnet medio | cerrado | 2084d961..b2205e74 | L4-resultado.md |
| L5 | Opus alto | cerrado (carril b) | d3cafeb8..6d9c38ad | L5-resultado.md |
| L6 | Sonnet medio | cerrado (carril b) | 8732d787..ce589d21 | L6-resultado.md |
| INT | Opus alto | cerrado | 4b8eac5c..HEAD | INT-resultado.md |

## No planificado, a propósito
- Las grietas del cristal (Valentino: «el cristal roto quedará para después»). L1 las saca.
- El movimiento del teléfono completo: queda el botón, en beta.
- El cuadro largo «la página → el home»: se mide en la pasada técnica final.

## Notas

## L1 (cerrado)
Barra de escritorio desde 769, contacto del teléfono sin desborde, ≠ de una pieza, loma del piso de vuelta, grietas sacadas, esquinas de la placa cerradas. Resultado: `L1-resultado.md`. Pendiente: s4-cobertura/s17/s8-montaje fallan sin relación con el lote (sin base).

## L2 (cerrado)
Portfolio del teléfono en una pantalla (sin testimonio, el video cede), «la tuya» pegada y sin desborde, Demos una pantalla con scroll y el velo del Portfolio, Servicios sin gatillo en el cruce con Demos (salida de arriba libre en la máquina común, sólo teléfono), la sección mide su contenido con el tramo hasta el final (la escena no se corre) y Demos de escritorio entero (27 % + tope por alto). Resultado: `L2-resultado.md`. Pendiente: abanico no centrado en el aire libre a 1440; ráfaga no corrida; sin teléfono real.

## L3 (cerrado)
Servicios: entrada en un renglón con el aro que llena su caja (3:1 en escritorio, vertical en el teléfono, sin tocar el aviso) y `?aro-color=` (ola por defecto, color por el ángulo actual); títulos en dos renglones (display + cursiva `?titulo-cursiva=`) subrayados y por la diagonal; cuerpo en la letra de los cuerpos (más corto y grande en el teléfono); título, video y «Leer más…» a la página (sin CTA); pasar rápido con gatillo sin teletransporte (`candadoMs`, `retomarHacia`, `dioPaso`); diagonal 7. Resultado: `L3-resultado.md`. Pendiente: 320 px roza el aviso; la pausa de ~370 ms del primer paso en dev (precarga) sin medir en build; el renombre fuera de la sección (barra, recomendador) a confirmar.

## L4 (cerrado)
Recomendador a 1/3 + 2/3, contacto en el lugar de las tarjetas con vuelta a resultados (`volver`), indicador del teléfono de un solo paso; palabras de fondo del Panel legibles con el tope del título a su mitad; muestra sin pausa y sin tarjetas que se pisan; CTA con newsletter y flecha nuevas y títulos grandes en el teléfono. Resultado: `L4-resultado.md`. Pendiente: el salto al Portfolio al enviar no se reprodujo (ratón); el envío por Enter y 768/1024 sin verificar.

## L5 y L6 (carril b, `cola3b/2026-10-28`)
Ver `ESTADO-b.md`, `L5-resultado.md` y `L6-resultado.md`. Entraron a esta rama con el merge de INT (`4b8eac5c`).

## INT (cerrado)
Merge del carril b (un conflicto: sin grietas y la página base fija). Alturas medidas contra la base construida en los ocho anchos: la escena igual al milésimo afuera de Trabajos; en el teléfono y la tablet el carrusel acelera y frena en rampa (antes, de golpe a ~4,5×). El aro de Servicios no toca el aviso a 320; el recomendador a 768 y 1024 y el envío con Enter; bancos de banderas borradas fuera; s8-montaje (lo de la cola 3). `verificar` sin fallas nuevas contra la base (cuatro suites a la spec de L3, L4, L6 e INT). Resultado: `INT-resultado.md`. Pendiente: la pausa del primer paso de Servicios sigue en el build (~0,5 s); la falla «la página → el home» de la píldora es la de la base; una falla de la matriz de escritorio sin repetir; las decisiones D1–D3 de L6.
- L8a (29/10): etiquetas, Demos, recomendador, FAQ; resultado en L8a-resultado.md
