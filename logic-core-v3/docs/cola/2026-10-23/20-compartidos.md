# 20 · Las piezas compartidas de la cola 2

Va PRIMERO. Las demás tareas las usan. Modelo: **opus**.

## Qué construir

### 1. `EstadoDeEnvio` (el estándar de envío de los formularios, ítem 9)
Hoy el form del Portfolio, al enviar, cambia de pantalla de golpe y pone «Recibido.». Valentino: «como en todos los forms, esto ya es estándar acá».
- Al apretar enviar, **el form entero se desvanece y se transforma en el loader de develOP** (el logo girando), centrado en el lugar del form, que **aparece ya girando** con un fundido. El loader ya existe en el repo (se ve en el login al cargar después de Google): buscalo e importalo, no lo copies.
- **Si sale bien:** el loader se desvanece y aparece **la animación de "recibido" de develOP** con el mensaje de éxito. **Si falla:** la de error. Buscá en el repo las animaciones de éxito y error que ya usa el sitio (contacto, soporte, formularios del sitio vivo). Si existen, importalas; si no existen, creá dos sobrias, en blanco y negro, con el estilo del home (un trazo que se dibuja: un tilde y una cruz).
- Pasados ~3 s, el mensaje se desvanece y **vuelve el form** con un fundido (limpio después del éxito; con los datos cargados después del error).
- Si la respuesta tarda menos que la animación de entrada del loader, igual se ve el loader un mínimo (~600 ms), para que no parpadee.
- API: un componente que envuelve al form y recibe el estado (`reposo | enviando | exito | error`) y los textos. Con `prefers-reduced-motion`: fundidos cortos, el loader sin girar.
- Textos: `05-TEXTOS.md`, «Estado de envío».
- **NO se aplica al form del pie** (decisión de Valentino: el del pie queda como está).

### 2. `AvisoDeScroll` (ítems 12, 15 y 22)
- Un aviso discreto, centrado debajo del contenido: **dos chevrones `>` girados hacia abajo, sin mango** (uno arriba del otro), y un texto corto en gris, todo **titilando** suave (opacidad, ~1,6 s por ciclo). Grande pero disimulado.
- Props: el texto, si es clickeable (en el FAQ sí: hace lo mismo que un gesto de scroll) y el tono (sobre papel o sobre la escena).
- Accesible: si es clickeable, es un `<button>` con foco visible; si no, `aria-hidden`.

### 3. `Reluciente` (ítems 15 y 17)
- Un brillo que barre el elemento cada tanto (un reflejo diagonal que pasa, ~1 vez cada 3–4 s) y que se intensifica al hacer hover. Sirve para decir "esto se toca".
- Para texto (HABLANOS) y para botones (el «Probar ahora» del Panel). Solo `transform`/`opacity`/`background-position` (nada que fuerce layout). Con movimiento reducido, sin barrido.

### 4. El autocompletado (ítem 7)
- Cuando el navegador autocompleta, hoy se ve el fondo celeste de Chrome (capturas `lote1/07`, `08`, `09` y `lote2/15`). El pie ya tiene un arreglo que lo resuelve: buscalo y **llevalo a un estilo compartido** (por ejemplo, una clase o un estilo global para los inputs de `/v3`) que respete el fondo y el color de letra de cada form, claro u oscuro.
- Si se puede, que sea **global para los inputs de `/v3`**, así todos los forms lo toman solos (Portfolio, contacto general, newsletter del Panel, recomendador, login) y las otras tareas solo lo confirman. El pie ya lo tiene: no lo cambies.

## Criterios
- `EstadoDeEnvio` con una prueba: enviando → loader visible y girando; éxito → mensaje → vuelve el form vacío; error → mensaje → vuelve el form con los datos. **La respuesta se intercepta con `page.route`: nunca se llama a `/api/` real.**
- Una página de prueba interna (por ejemplo `/v3/pagina-base?piezas=si`, o la que ya use el arnés) que muestre las cuatro piezas, para que el orquestador las mire.
- El autocompletado: probado con un input autocompletado a mano (`:autofill`) en los fondos claro y oscuro.

## Archivos (pistas)
- Las piezas nuevas, en `src/app/v3/_componentes/` (por ejemplo `formularios/EstadoDeEnvio.tsx`, `avisos/AvisoDeScroll.tsx`, `efectos/Reluciente.tsx`).
- El arreglo del autocompletado del pie: buscalo en `_componentes/pagina/cierre/` o en el pie.
