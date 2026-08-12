# 08 · Publicar el borrador

> El momento: la demo está construida. Hay que ponerla online para que se pueda
> abrir con un link.

La pantalla se llama **BORRADOR** y el título es **«Publicá y registrá el link
del borrador»**.

Es la única pantalla del recorrido cuya herramienta **sí se abre desde el panel**.

---

## Cuándo estás acá

Terminaste de construir y refinar (capítulo 07). El panel te trae solo.

---

## Qué estás viendo

📸 [`21-m13-borrador-vacio.png`](galeria/png/21-m13-borrador-vacio.png)

### CONTEXTO DEL LEAD

Un recordatorio de contra qué se compara: *«Esto es lo que la demo tenía que
entregar — publicá el borrador de eso»*, con el título del plano, el concepto y
las secciones, y un desplegable **Ver respuesta completa del Gem**.

### MUNICIÓN

Primero, el aviso que define este momento:

> Publicás un **borrador** para que Franco lo revise. Publicar acá **NO es
> enviárselo al negocio**: la versión permanente la publica Franco cuando
> aprueba.

Después, **Netlify Drop** con un botón que sí funciona —**Abrir Netlify
Drop**— y los cuatro pasos, numerados:

1. En Claude Design: Export → HTML standalone (o el .zip si lo ofrece).
2. Asegurate de que el archivo se llame **index.html** (si bajó un .zip, que lo
   tenga adentro).
3. Abrí Netlify Drop (el botón de acá arriba) y arrastrá el archivo (o la
   carpeta) ahí.
4. Copiá la URL que te da Netlify y pegala acá abajo.

### REGISTRO

| | |
|---|---|
| **URL del borrador** *(obligatorio)* | *«La que te dio Netlify Drop, completa y con https://»* |
| Un interruptor | **Confirmo que abrí el link y carga** |
| El botón | **Guardar borrador** |

Y entre medio, la instrucción: *«Abrí el link en otra pestaña y confirmá que la
demo carga bien antes de guardar.»*

---

## Qué hacés, paso a paso

1. Exportá la demo desde Claude Design como **index.html**.
2. Tocá **Abrir Netlify Drop**.
3. Arrastrá el archivo ahí.
4. Copiá la dirección que te devuelve (termina en `.netlify.app`).
5. **Abrila en otra pestaña y mirá que la demo cargue.** Este paso no te lo saltees:
   es el primer punto del chequeo del capítulo siguiente.
6. Volvé al panel, pegá la dirección en **URL del borrador**.
7. Tildá **Confirmo que abrí el link y carga**.
8. Tocá **Guardar borrador**.

---

## Qué puede salir mal

**Pegaste algo que no es una dirección.**

📸 [`24a-error-borrador-url-invalida.png`](galeria/png/24a-error-borrador-url-invalida.png)

Verificado en vivo: el campo se pone en rojo y debajo aparece

> Eso no parece una URL — copiala completa desde la barra del navegador

**y el mensaje se queda ahí.** No es un cartelito que aparece y se va: queda
puesto hasta que lo arregles. Copiá la dirección desde la barra del navegador,
entera, con el `https://` adelante.

**Publicaste, pero el link no abre nada.**
Suele ser que el archivo no se llamaba `index.html`. Volvé a exportar,
verificá el nombre, y arrastralo de nuevo a Netlify Drop. Vas a obtener una
dirección nueva: pegá esa.

**Rehiciste la demo después de guardar el link.**
Cuando el borrador ya está guardado, la pantalla se colapsa en un resumen:

> **BORRADOR PUBLICADO**
> https://…
> Si rehiciste la demo, volvé a publicar en Netlify Drop y actualizá el link acá
> — el chequeo final se hace siempre sobre el **borrador vigente**.
>
> [ **Cambiar el link del borrador** ]

Ese botón vuelve a abrir el formulario. **Acordate de actualizarlo cada vez que
republiques**: si no, Franco va a revisar una versión vieja.

---

## Cuándo NO es tu turno

Acá no esperás a nadie. Es un trámite corto — pero es el que convierte tu trabajo
en algo que otra persona puede abrir, así que conviene hacerlo con cuidado.

---

**Anterior:** [07 · Construir la demo](07-construir-la-demo.md) ·
**Siguiente:** [09 · El chequeo final y mandarla a revisión](09-el-chequeo-final.md)
