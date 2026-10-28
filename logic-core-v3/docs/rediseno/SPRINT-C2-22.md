# SPRINT C2-22 · El contacto general

Rama `nocturno/2026-10-23-22`. Tarea: `docs/cola/2026-10-23/22-contacto-general.md` (pedido 7 de la revisión: «en mobil … que venga desde el fondo y sea parecido o el mismo al que tenemos, no 3d»).

## Plan

1. **Teléfono y tablet (abajo de 1024) y el menú del teléfono: el PANEL.** Hoy el contacto sale desde abajo y ocupa la pantalla. Pasa a ser el mismo formulario en una hoja centrada de ~70 % del ancho y del alto visibles, con todo alrededor difuminado como en escritorio (el velo es el mismo: 24 px, primero, y al cerrar se va después). Llega del fondo con una ESCALA y un FUNDIDO (de un punto a su tamaño, con la curva de tamaño de la placa de escritorio: `curvaDelPanel` = `escalaDelViaje` vista como avance de una escala) y se va igual (vuelve al fondo, se desvanece al final). Sin 3D, sin giro. Con movimiento reducido: sólo un fundido de 0,2 s.
2. **El envío con `EstadoDeEnvio`** (importado, el de la tarea 20) en todos los anchos. El éxito cierra el panel solo a los 3 s (`ENVIO.mensajeMs`, lo mismo que cerraba antes); el error vuelve al formulario con todo lo escrito. Vacío responde al toque (sin la carga). Salen la carga y la tarjeta de resultado de antes (con su volteo, su alto guardado y su precalentado).
3. **El autocompletado**: ya lo toma, sin tocar código. La regla global de `piezas.css` (bloque 1) cubre todo input de `[data-v3]` salvo los del pie (`data-foco="campo"`), y los campos del contacto son los `CampoDePildora` / `CampoDeTextoLargo` comunes, sin esa marca. El banco lo mide con Chrome de verdad.
4. **Errores de validación**: ya van en el formato de siempre del sitio (la píldora con borde punteado, `aria-invalid`, el texto debajo con `ErrorDelCampo`, un aviso vivo único). Sin cambios; s25 §5 lo ata.
5. **Escritorio**: sin cambios de diseño (la placa 3D, la hoja de arriba con movimiento reducido), salvo el envío y el autocompletado.

### Estructura

- `_chrome/contacto/panel.ts` (nuevo, puro): `PANEL` (fracciones 0,7 / 0,7 / tope 0,9), `CLASES_DEL_PANEL` y `CLASES_DEL_ESCENARIO_DEL_PANEL` (las clases, escritas enteras para Tailwind), `curvaDelPanel`, `animacionDelPanel(reducido)` y `esElPanel(modo, escritorio)`.
- `_chrome/contacto/EscenarioDelPanel.tsx` (nuevo): el cuadro que centra la hoja; apagado es transparente, como `PlacaDelContacto`.
- `_chrome/contacto/FormularioDeContacto.tsx`: elige la forma (`data-forma`: `panel | placa | hoja`), monta `EstadoDeEnvio`, el velo con desenfoque para la placa y para el panel (`viaja = !reducido`). Baja de 320 a ~245 líneas.
- Invariantes: s25 sección 5 (nueva, con controles) y las afirmaciones de s37, s39, s49, s60, s61, s62, s63 y s64 que fijaban el envío de antes o la hoja del teléfono, actualizadas a la spec nueva con sus controles (listadas abajo).
- Banco: `scripts-carga/contacto-general.ts` (sin correr).

### Decisiones

- **1024 es el panel (corregido por el orquestador tras medir).** La hoja decide con `esElPanel(modo, escritorio)`: el panel con el menú del teléfono o abajo de `CONSULTA_ESCENARIO` (1024). A 1024×768 la barra no entra con Contacto y Login, el chrome cae en modo menú y el contacto sale como panel a 70,0 % × 70,0 %, centrado y con el fondo desenfocado: es lo que pide la spec. Arriba de 1024 (1440) sigue la placa 3D sin cambios de diseño. El banco trata 1024 como panel (`ESCRITORIO` = 1025).
- **El alto es un mínimo.** Ancho 70 %; alto mínimo 70 % y, si el contenido pide más (el teléfono angosto: a 390 el panel mide 273 px de ancho), crece hasta 90 % y recién ahí scrollea por adentro («o lo que permita el contenido sin scroll interno feo»). El banco acepta 68–72 % o, si pasa de 72 %, hasta 90,5 % sin scroll por adentro.
- **Éxito = el panel se cierra.** Antes cerraba a los 3 s del texto; ahora a los 3 s del aterrizaje del encastre (`EstadoDeEnvio`), y los datos se vacían.
- **Tablet con barra (628 a 1023)**: antes tenía la placa 3D; ahora el panel (tablet hace lo mismo que el teléfono).
- `PrecalentarElResultado`, `TarjetaDeResultado` y `useAltoGuardado` ya no los usa el contacto (el pie sigue con los suyos).

## Log

- Código: panel.ts, EscenarioDelPanel.tsx, FormularioDeContacto.tsx.
- Invariantes actualizados a la spec nueva (cada uno con su control positivo): s37 (la región de estado la pone `EstadoDeEnvio`), s39 (el panel es el compacto; el pie con `flex-wrap`; `estado === 'enviando'`), s49 (el fondo se va después de la hoja con `viaja`), s60 H3 (el envío por `EstadoDeEnvio` y el cierre del éxito; sale `CIERRE_MS`), s61 C/A/E (el panel monta el estado de envío; el volteo es del pie), s62 «Reintentar» / B4 / B6 (el error vuelve por `alVolver`; el éxito vacía y cierra), s63 3 (el panel ya no guarda alto), s64 K2 d e (el panel ya no precalienta una tarjeta que no muestra; el recibo es el de la tarjeta de antes).
- s61 J7 (el titular de Portfolio arranca invisible) falla en esta rama desde antes de este sprint (la tarea 40 cambió el titular de Portfolio); no lo lee nada de lo tocado acá.
- Gate: eslint de lo tocado limpio; `tsc --noEmit` 0; s25 58/0, s37, s39, s42, s43, s47, s49, s50, s60, s62, s63, s64, s65, s74, s77, s85, s87 sin fallas; s61 con la única de J7.

## Qué mirar (lo corre el orquestador)

`BASE=http://localhost:3000 ANCHOS=390,768,1024,1440 npx tsx scripts-carga/contacto-general.ts` y sus controles (`CONTROL=sin-escala | sin-desenfoque | ancho-completo | sin-mensaje | sin-arreglo`, cada uno tiene que FALLAR lo suyo). A ojo: `/v3`, a 390 y 768, tocar «Contacto» del menú o un CTA: el panel crece desde el fondo con el resto borroso, queda centrado a ~70 %, y al cerrar (Esc, la X o un clic afuera) vuelve al fondo; enviar de verdad no (el banco intercepta `/api/`): con el servidor interceptado se ve la carga, el encastre con «¡Recibido!» y el panel que se cierra solo.
