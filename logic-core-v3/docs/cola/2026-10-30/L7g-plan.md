# L7g · plan (escrito con el lote ya en marcha: la lectura del código y el banco base se hicieron antes)

Rama `l7/a`, dev :3002, candado tomado en todo el lote. Sonnet 5.5, esfuerzo alto. Sin commits ni push (Valentino commitea a mano).

| # | Ítem | Hecho cuando | Cómo se verifica |
|---|------|--------------|------------------|
| 1 | Logo del pie arriba y al centro en 1440/1024/768 (y que no se corra entre anchos) | las páginas de L7 lo ponen arriba con el contenido abajo | foto del pie a 4 anchos; ver «Presupuesto» |
| 2 | Enlaces discretos al final de Quiénes somos y de Portfolio del home | un `EnlaceDeRuta` con el velo en cada sección, legible de día y de noche, sin tocar alturas | foto a 390/768/1440, clic hasta `/v3/nosotros` y `/v3/portfolio`, `s5` y `s10-acceso` a su spec nueva |
| 3 | Privacidad y Términos en el pie 3D (≥1025) sin cambiar su geometría | los dos enlaces visibles y las demás piezas del pie en el MISMO lugar que en la base | medir los rects del pie con y sin los enlaces (misma espera) a 1440 y 1025 |
| 4 | Sitemap de `/v3` | decidido y anotado | el único sitemap es el del sitio en vivo: no se toca |
| 5 | Foto de la facultad | webp en `public/v3/nosotros/`, a ≤ 500 px (su tamaño real), con el epígrafe | foto de Nosotros a 390/768/1440 |
| 6 | Verificación real a 320, 390, 768, 1024 y 1440 de las 10 páginas | el banco (`l7-int-humo.ts`, ya con el ancho real de la página afirmado) en verde; lo que falle, arreglado si es chico o anotado | 50 corridas, una línea cada una |
| 7 | Una foto por página y ancho | `C:\nocturno\cola3-fotos\L7\<página>\<ancho>-{1-intro,2-cuerpo,3-cierre}.png` | el banco las escribe |
| 8 | Ondas del sonido en el navegador | sólo con el preloader en pantalla; ninguna en carga normal sin preloader, recarga dura ni navegación interna | `scripts-carga/l7g-ondas.ts` (observa el DOM) |
| 9 | Nanobots de la primera pantalla de servicio | `C:\nocturno\l7-assets\nanobots-slide1.*` no existe: queda pendiente | `ls` |

**Implicaciones:** el censo de paradas de teclado (`s10-acceso`) y los conteos de Quiénes somos (`s5`) cambian de spec con los enlaces nuevos (se actualizan, no se aflojan); un `.css` nuevo está prohibido (la regla del halo se amplió a `a`); la 404 y el cierre de las páginas tocan sólo una clase cada uno.

**Premortem:** «la semana que viene falló porque…» (a) los enlaces nuevos desacomodaron una sección pinneada → por eso van sin sumar alto y el pie 3D se midió contra la base; (b) el verde de 390 era de una ventana de 500 px → por eso el banco falla si `innerWidth` no es el pedido; (c) el pie 3D se corrió → medido idéntico, con una celda libre de la grilla del recorrido.

**Presupuesto:** el ítem 1 recompone la cámara del cierre de cada página (`poseDelPortfolio` + `encuadreArribaAlCentro`) y el DOM del pie (tres columnas con una banda arriba), con el FAQ que hunde esas columnas: más de una hora con fotos a 4 anchos. Se hace al final sólo si quedan margen y las demás compuertas están verdes; si no, se anota con su plan en `L7g-resultado.md`.
