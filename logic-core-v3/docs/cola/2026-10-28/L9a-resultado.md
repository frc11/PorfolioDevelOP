# L9a — resultado

Hecho (8/8), visto en el navegador (dev :3002, fotos en `C:\nocturno\cola3-fotos\L9a\`). Lint limpio, `tsc` 0 errores.
1. Avatar del chat: blanco con ojos negros sobre lo oscuro, negro con ojos blancos sobre el papel (filtro `invert` con transición, tono por `useTonoDebajo`). Fotos `1-avatar-noche/dia`. En Portfolio y Servicios el chat cerrado sigue desvanecido (C2-21): ahí no se ve.
2. Placa del contacto: cada esquina es un degradé del tono del costado donde empieza al del costado donde termina (antes un 90 % parejo). `2-placa-contacto`.
3. Título del recomendador: se despinta al subir (medido 1 → 0 al bajar de la línea del 70 % de la pantalla; antes solo al salir). Cambio en `usePintadoAlLlegar` (lo usa también el análisis del resultado). `3-titulo-despintado`.
4. CTA del Panel: ambos títulos en `titulo-l`, dos renglones reservados y alineados abajo: misma línea de base y mismo arranque del texto (medido 424/439 en las dos). `4-cta-1440`.
5. HABLANOS: capa `Reluciente como="letras"` recortada a los glifos (`background-clip:text`, degradé transparente). `5-hablanos-1440`.
6–7. Panel < 1024: sin «Lo que nos distingue»; respiro título→módulo de 16 a 22 svh. `6-7-panel-390`.
8. Pie < 768: reserva de 7 rem arriba y logo centrado arriba entre la barra y el primer elemento (`encuadreArribaAlCentro`). `8-pie-390`.

Decisiones: L9a-1 «≤768» se tomó como `max-tablet` (< 768; la tablet a 768 queda como estaba); L9a-2 ítems 6–7 valen hasta 1023 (el panel usa un solo corte, 1024); L9a-3 se actualizaron s88-l5 (forma nueva del reflejo) y el registro de tokens (1 propiedad nueva).
Tests verdes: s3-tokens, s6-tu-panel(-c2), s6-cta-del-panel, s85, s87, s88-l5, s90, s78-c2-51, s53, s25, s8-cierre. No se escribieron tests nuevos ni controles para los 8 ítems. Pie a 390: sólo verificado a 390×844 (no a otros alturas); la esquina de la placa, a un solo ángulo.
