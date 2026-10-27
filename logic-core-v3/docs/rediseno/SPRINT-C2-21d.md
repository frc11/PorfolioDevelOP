# C2-21d: el desplegable de Servicios cerrado no agranda el documento a lo ancho

## Plan
La 21 paso el desplegable de `left: 50%` + centrado a `left: var(--desplegable-x, 50%)`; la x solo se escribe al abrir. Cerrado y
nunca abierto cae en el respaldo y su caja (~199 px) pasa el borde derecho del telefono (scrollWidth 379 a 360, 394 a 390).
Arreglo minimo: respaldo en 0 en `barra.css`. Abierto no cambia (la x medida manda).

## Log
- `barra.css`: respaldo `0` (sin unidad: s3-tokens no admite un literal con unidad en el punto de uso).
- `s78-c21.invariant.ts`: afirmacion nueva del respaldo, con su control positivo (el de la mitad de antes).
- Suites: s78-c21 33/0, s78-b12a 162/0, s41-retoque-3d 61/0, s3-tokens 29/0.

## Que mirar
`scripts-carga/chrome-en-los-anchos.ts` a 360 y 390 en `/v3` y `/v3/pagina-base`: scrollWidth == ancho. `scripts-carga/desplegable.ts`: borde izquierdo a 0,00 px.
