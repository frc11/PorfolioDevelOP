# SPRINT C2-20 · las piezas compartidas de la cola 2 (2026-10-23)

Tarea: `docs/cola/2026-10-23/20-compartidos.md` (ítems 7, 9, 12, 15, 17 y 22 de la revisión). Textos: `05-TEXTOS.md`, «Estado de envío».

## Plan

Lo que ya existía y se importa (no se copia):
- la carga de develOP (el logo girando del login y del contacto): `_componentes/carga/Carga.tsx`;
- la animación del resultado (la pieza que encaja, o que choca en rojo y queda afuera, con su sonido): `_componentes/formularios/EncajeDelLogo.tsx`
  (la usa la tarjeta del resultado del pie y del panel de Contacto);
- el arreglo del autocompletado del pie: la utilidad del campo en `_secciones/cierre/FormularioDelPie.tsx` (PULIDO 10 J6) y la demora de
  `_estilos/foco.css` (PULIDO 13 K4). No se tocan.

Lo nuevo:
1. `_lib/formularios/estadoDeEnvio.ts` (puro: estados, vistas, tiempos, textos) y `_componentes/formularios/EstadoDeEnvio.tsx`.
2. `_componentes/avisos/AvisoDeScroll.tsx`.
3. `_componentes/efectos/Reluciente.tsx` (con `RELUCIENTE`, el ritmo, para un brillo 3D).
4. `_estilos/piezas.css` (entra por el layout; en el padrón y el registro de s3-tokens): el autocompletado global de /v3 (todos los
   campos menos los del pie), las tintas del encastre atadas a la sección, el titilar del aviso y el barrido del reluciente.
5. `/v3/piezas` (instrumento `noindex`, fuera del sitemap que no lista /v3; no toca la página base): las cuatro piezas sobre el papel y en
   una sección invertida.
6. Pruebas: `s85-piezas` (sin navegador, 54 afirmaciones con sus controles); bancos `scripts-carga/estado-de-envio.ts` y
   `scripts-carga/autocompletado.ts` (sin correr).
7. La API en `B12a-API.md` §9.

## Decisiones (sin preguntar)

- La animación de «recibido» y la de error son el encastre del logo del sitio (`EncajeDelLogo`), no una nueva: es la que ya usan el contacto
  y el pie. Sin la tarjeta oscura (`TarjetaDeResultado`): sus textos son los viejos («Recibido.») y trae «Reintentar»; acá el encastre va
  directo sobre el fondo del formulario, con las tintas de la sección (sobre el papel, una pieza de tinta en una ranura gris).
- El título del error va en la tinta (no en el rojo de la tarjeta: ese rosa es para fondos oscuros y no da AA sobre el papel); el rojo
  queda en el borde de la ranura, como en el sitio.
- La vuelta la pide el componente (`alVolver(despuesDe)`) y la hace quien lo monta (`setEstado('reposo')`): el estado vive en un solo
  lugar. Vaciar después del éxito también es de quien lo monta, en ese aviso (`despuesDe === 'exito'`): el formulario todavía no se ve
  (vaciarlo al llegar la respuesta se podía ver, con el formulario a medio desvanecer si la respuesta llegaba en menos de 400 ms).
- La etiqueta de la carga es «Enviando…» del contacto (`ROTULO_ENVIANDO`), importada.
- `AvisoDeScroll`: el texto arriba y los dos chevrones abajo (apuntan a lo que sigue); el segundo, más tenue. Gris = la tinta tenue de la
  sección (AA en las dos). `tono="escena"`: la sombra pegada del texto de la intro.
- `Reluciente`: dos formas (una capa para cajas, el degradé recortado a las letras para textos). El reflejo es blanco: sobre lo claro casi
  no se ve (anotado en la API).
- Suite `s85` (número libre en todas las ramas, para no chocar con las otras tareas de la cola).
- El envío de la página de prueba va a `/api/piezas-de-prueba`, que no existe: sin banco da el error y nunca toca la base. `?simular=` para
  mirarlo a mano.

## Log

- Leído: PREAMBULO, 06-COMUN, la tarea, 05-TEXTOS, la skill, B12a-API; `Carga`, `EncajeDelLogo`, `TarjetaDeResultado`, `resultado.css`,
  `foco.css`, `FormularioDelPie`, `FormularioDeLaTuya`, `Campos`, s3-tokens y su padrón, s61/s64 (los que fijan el arreglo del pie).
- Escrito lo de arriba. `s85-piezas`: 54 afirmaciones, 0 fallas (la primera corrida tuvo 2: un redondeo de coma flotante en la prueba y el
  lector de s3 que no levanta `-webkit-…`; se leyó el cuerpo crudo).

## Qué mirar

En `http://localhost:3000/v3/piezas?preloader=no` (1440, 1024, 768, 390): la sección 1 con `?simular=exito` y `?simular=error`; la 2 (el
titilar y el botón); la 3 (el barrido cada 3,5 s y el hover); la 4 autocompletando a mano (Chrome con una dirección guardada). Bancos:
`scripts-carga/estado-de-envio.ts` y `scripts-carga/autocompletado.ts` con sus `CONTROL`.
