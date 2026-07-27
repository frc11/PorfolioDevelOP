# 06 · Publicar y mandar a revisión

> **El momento:** la demo está construida. Falta subirla a algún lado, revisarla
> vos, y recién ahí mandársela a Franco.

Tres pantallas: **Borrador**, **Chequeo final** y la espera de la **revisión**.
Este es el tramo donde **más se puede arruinar el trabajo hecho**, porque un
chequeo mentiroso vuelve como rechazo.

Fotos: [`21-m13-borrador-vacio.png`](galeria/png/21-m13-borrador-vacio.png) ·
[`22-m14-chequeo.png`](galeria/png/22-m14-chequeo.png) ·
[`23-revision-franco.png`](galeria/png/23-revision-franco.png) ·
[`24a-error-borrador-url-invalida.png`](galeria/png/24a-error-borrador-url-invalida.png) ·
[`24b-error-persistente-chequeo.png`](galeria/png/24b-error-persistente-chequeo.png)

---

# Paso 7 · Publicá y registrá el link del borrador

**BORRADOR — PASO 1 DE 1**

## Cuándo estás acá

Terminaste las seis fases y exportaste la demo desde Claude Design.

## Qué estás viendo

[`21-m13-borrador-vacio.png`](galeria/png/21-m13-borrador-vacio.png)

*«Subí la demo a Netlify Drop y guardá el link del borrador — se valida que sea un
link real.»*

Arriba, **EL BRIEF PEDÍA**, para que lo tengas a la vista.

En **MUNICIÓN**, lo más importante de esta pantalla:

> **Publicás un borrador para que Franco lo revise.** Publicar acá **NO** es
> enviárselo al negocio: la versión permanente la publica Franco cuando aprueba.

Y **Netlify Drop** — **la única herramienta del recorrido que sí se abre desde el
panel**. El botón dice **Abrir Netlify Drop**.

Los cuatro pasos, escritos en la pantalla:

1. En Claude Design: Export → HTML standalone (o el `.zip` si lo ofrece).
2. Asegurate de que el archivo se llame **`index.html`** (si bajó un `.zip`, que
   lo tenga adentro).
3. Abrí Netlify Drop (el botón de arriba) y arrastrá el archivo (o la carpeta).
4. Copiá la URL que te da Netlify y pegala abajo.

En **REGISTRO**: el campo **URL del borrador** (obligatorio, *«La que te dio
Netlify Drop, completa y con `https://`»*), un interruptor **Confirmo que abrí el
link y carga**, y el botón **Guardar borrador**.

## Qué hacés, paso a paso

1. Exportá desde Claude Design como `index.html`.
2. Tocá **Abrir Netlify Drop** y arrastrá el archivo.
3. Copiá la URL que te devuelve Netlify.
4. **Abrila en otra pestaña y mirá que cargue.** Esto no es un trámite.
5. Pegá la URL en **URL del borrador**.
6. Prendé **Confirmo que abrí el link y carga**.
7. Tocá **Guardar borrador**.

**Lo que pasa después** (verificado): el panel te lleva al **Chequeo final**.

## Qué puede salir mal

**Pegaste algo que no es un link.**
[`24a-error-borrador-url-invalida.png`](galeria/png/24a-error-borrador-url-invalida.png)

Debajo del campo aparece, en rojo:

> Eso no parece una URL — copiala completa desde la barra del navegador

**El error se queda ahí**, no desaparece solo. Corregí el campo y volvé a guardar.
La causa casi siempre es que copiaste el nombre del sitio en vez de la dirección
completa: tiene que empezar con `https://`.

**El panel dice *«El borrador se carga con la construcción arrancada — arrancala
primero y volvé».*** No tocaste **Arrancar construcción** en su momento. Volvé a
**Estructura** (fase 1) y arrancala.

## Cuándo NO es tu turno

Sigue siendo tuyo. Netlify Drop no pide cuenta para empezar y la publicación es
inmediata.

---

# Paso 8 · Pasá los checks duros

**CHEQUEO FINAL — PASO 1 DE 1**

## Cuándo estás acá

Ya hay un borrador publicado con su link guardado.

## Qué estás viendo

[`22-m14-chequeo.png`](galeria/png/22-m14-chequeo.png)

Arriba, **TU BORRADOR** con el link, y la instrucción:

> Abrilo en otra pestaña —**mejor en incógnito y en tu celular**— y chequealo
> punto por punto contra la lista de abajo.

Y al lado, **EL BRIEF PEDÍA**, con las secciones. Los vas a comparar.

En **REGISTRO**, dos listas separadas:

### OBLIGATORIOS — BLOQUEAN EL ENVÍO

Seis interruptores. Cada uno trae **qué verificar** y, debajo, **cómo arreglarlo
si falla**:

| Check | Cómo lo verificás | Si falla |
|---|---|---|
| **La demo carga** | Abrí la URL en otra pestaña, mejor en incógnito | Volvé a Borrador y re-publicá el `index.html` |
| **Se ve bien en tu celular** | Abrila en **TU** celular y recorrela entera | Volvé a la fase **Mobile**, ajustá y re-publicá |
| **No hay lorem ipsum ni textos de relleno** | Leé toda la página buscando texto inventado o genérico | Reemplazá con datos reales (fase **Personalización**) |
| **Los links y el botón de WhatsApp funcionan** | Tocá cada link y el botón: tiene que abrir el chat correcto | Corregí en la fase **CTA** y re-publicá |
| **Usa los datos y assets reales del negocio** | Logo, fotos, nombre y dirección reales | Insertá los assets (fase **Assets reales**) y re-publicá |
| **La demo dice lo que el brief pedía** | Compará sección por sección contra el brief | Volvé a Construcción y completá lo que falta |

El check *«Se ve bien en tu celular»* trae además el pedido **Adaptá a mobile**
listo para copiar y pegar en Claude Design.

Mientras falte alguno, el panel te dice cuántos quedan:

> Quedan 6 obligatorios en rojo — el arreglo concreto está debajo de cada punto.
> **No es un trámite: es tu último filtro antes de Franco.** Marcá cada
> obligatorio solo cuando lo verificaste en la demo publicada — **un check falso
> vuelve como rechazo y enfría al negocio que espera.**

Con los seis en verde cambia a: *«Todos los obligatorios en verde — podés enviar a
revisión.»*

### OJO DE DISEÑO — NO BLOQUEAN, LOS VE FRANCO

Cuatro más: **Tiene más de 3 colores** · **La fuente parece la default, sin
intención** · **Efecto vidrio (blur) en la navbar** · **Hay imágenes deformadas o
estiradas**.

> Marcá las que veas en la demo. **Ser honesto acá juega a favor: Franco las
> revisa igual.**

Éstos **no** bloquean nada. Marcarlos es decirle a Franco «ya sé, lo vi». No
marcarlos cuando están no te salva: se los va a encontrar él.

Abajo, dos botones: **Guardar el chequeo** y **Enviar a revisión**.

> ### ⚠ Los tildes del chequeo NO se guardan solos
>
> Esto es distinto de la ficha. **Verificado:** si marcás los seis obligatorios y
> te vas de la pantalla sin tocar **Guardar el chequeo**, al volver están **los
> seis de nuevo en rojo**. Se pierde todo.
>
> Y es justo el trabajo más caro de rehacer, porque cada tilde te costó abrir la
> demo en incógnito, en el celular, y tocar cada link.
>
> **Tocá «Guardar el chequeo» apenas termines de marcar.** Después, **Enviar a
> revisión**.

## Qué hacés, paso a paso

1. Abrí el link del borrador **en incógnito**, y también **en tu celular**.
2. Recorré la demo entera con la lista al lado.
3. Marcá cada obligatorio **sólo si lo verificaste de verdad**.
4. Si alguno falla, seguí el arreglo que dice debajo, re-publicá el borrador y
   volvé.
5. Marcá con honestidad los de **Ojo de diseño** que veas.
6. Tocá **Guardar el chequeo**.
7. Tocá **Enviar a revisión**.

**Lo que pasa después** (verificado): el negocio pasa a **EN REVISIÓN** y caés en
la pantalla de espera de Franco.

## Qué puede salir mal

**«Enviar a revisión» no responde.** Te falta algún obligatorio. Fijate el cartel:
te dice cuántos quedan en rojo.

**Marcaste los seis, te fuiste y volvieron a rojo.** No tocaste **Guardar el
chequeo**. Es lo que explica el recuadro de arriba.

**Mandás y vuelve un error en rojo que no se va.**
[`24b-error-persistente-chequeo.png`](galeria/png/24b-error-persistente-chequeo.png)

> El chequeo final se completa mientras la demo está en construcción.

Pasa cuando el negocio **se movió por detrás** mientras vos tenías la pantalla
abierta — por ejemplo, ya lo mandaste desde otra pestaña, o Franco lo tocó. El
mensaje **queda fijo** debajo de los botones. **Recargá la página** y mirá en qué
paso está el negocio ahora.

**Tenías el negocio abierto en dos pestañas.** Si aparece *«Esto ya se actualizó
en otra pestaña — recargá para ver el estado real»*, cerrá una y recargá.

## Cuándo NO es tu turno

Desde que tocás **Enviar a revisión**, **no es tu turno**.

---

# La espera · Franco está revisando tu demo

## Qué estás viendo

[`23-revision-franco.png`](galeria/png/23-revision-franco.png)

La pantalla más corta del recorrido:

> **EN REVISIÓN**
> **Franco está revisando tu demo**
> No hay nada que hacer ahora — te avisamos cuando la apruebe o pida cambios.

Y debajo, la tira de **COMPLETADAS** para releer lo que cargaste.

## Qué hacés

**Nada.** No hay botones, y no falta ninguno.

**No le escribas al negocio** para avisarle que «ya casi». La demo todavía no está
aprobada y el link permanente todavía no existe.

## Cuándo NO es tu turno

Toda esta pantalla. Estás esperando a **Franco**, no al negocio. Cuando decida, te
va a llegar como novedad en tu panel:

- **Si aprueba** → [capítulo 08 · Mandar el link](08-envio.md).
- **Si rechaza** → [capítulo 07 · Franco rechazó la demo](07-cuando-franco-dice-no.md).

Mientras tanto, en tu home el bloque **TUS DEMOS ESPERANDO A FRANCO** te lleva la
cuenta de cuántas tenés en esta situación.

---

**Seguí por:** [07 · Franco rechazó la demo](07-cuando-franco-dice-no.md) ·
Si aprobó: [08 · Mandar el link](08-envio.md)
