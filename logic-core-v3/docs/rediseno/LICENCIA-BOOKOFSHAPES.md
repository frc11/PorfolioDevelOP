# Licencia — `bookofshapes.com`

> Nota de licencia para los patterns SVG de Book of Shapes, que se van a usar en
> el sitio de develOP. **El sitio es comercial**, así que esto no es trámite.
> Autor: **Nikolaj Sokolowski**. Medido en H2 (ver
> [`outputs/H1-HERRAMIENTAS.md`](outputs/H1-HERRAMIENTAS.md) §4).

---

## 1 · Dónde está la licencia

**https://bookofshapes.com/license** — última revisión declarada por el sitio:
**septiembre de 2026**.

Está publicada y es específica. No aplica «no publicados». Se llega desde el pie
del home, que enlaza exactamente dos páginas legales: «Licence» → `/license` y
«Privacy» → `/privacy`. Las otras ocho rutas plausibles (`/licence`, `/terms`,
`/terms-of-use`, `/tos`, `/legal`, `/faq`, `/about`, `/usage`) **dan 404**.

## 2 · Uso comercial: permitido de forma expresa

Textual, bajo «Use it for anything»:

> *«Whatever you generate on this site is yours to use. Commercial or not,
> modified or as it comes, in print, on screen, on products. No fee, no
> permission needed, no attribution required.»*

**Sin fee. Sin pedir permiso. Sin atribución requerida.** No es silencio ni
permiso inferido: está escrito. Si se quiere dar crédito igual, el propio sitio
sugiere la forma bajo «Credit»: *«"Pattern from bookofshapes.com" is plenty.»*

## 3 · Lo descargado sí, el código no

La licencia **distingue los dos permisos, en secciones separadas**. Es la
distinción que nos importa, porque el permiso que necesitamos es el primero:

- **Cubierto** — el SVG descargado. Es la cita de §2.
- **NO cubierto** — bajo «Not covered»:
  > *«The pattern definitions behind this site (the node graphs) and the source
  > code of the site itself are not covered by this licence.»*

**Operativamente: se usa el SVG que baja del sitio. No se copia una línea de su
código ni se reimplementan sus node graphs.** Esa regla es también la de ellos,
no sólo la nuestra.

## 4 · 🔴 TRES PATRONES EXCLUIDOS, sin excepción

Bajo «Three exceptions»:

> *«Three patterns recreate existing works and are not mine to hand over. Joy
> Division and Joy Division Mesh follow the Unknown Pleasures cover, and
> Brockmann Beethoven Arcs follows a Müller-Brockmann poster.»*
> *«They are here to show how the originals were built. Study them, take them
> apart, learn from them. Do not publish or sell them, least of all on a record
> sleeve or a poster, where the resemblance is the whole point.»*

Los tres, por nombre:

| patrón | estado |
|---|---|
| `Joy Division` | **EXCLUIDO** — no se publica |
| `Joy Division Mesh` | **EXCLUIDO** — no se publica |
| `Brockmann Beethoven Arcs` | **EXCLUIDO** — no se publica |

**El riesgo concreto, y hay que decirlo porque no es teórico.**
`Joy Division Mesh` es una **grilla deformada con relieve topográfico** — la
misma propiedad que se busca para enriquecer la sala geométrica. Es el patrón con
más chance de que alguien lo elija, y es uno de los tres que no se pueden
publicar. Quien vaya a elegir el patrón tiene que leer este punto **antes** de
mirar el catálogo, no después.

Que «estudiarlo y desarmarlo» esté permitido **no alcanza**: lo que está
prohibido es *publicarlo*, y un fondo en un sitio en producción es publicarlo.

## 5 · Parte de lo que se vende, nunca lo que se vende

Bajo «One limit»:

> *«Do not redistribute the patterns as patterns. Selling or giving away an SVG
> pack, a clipart set, a template library or a generator built from them is the
> one thing this licence does not cover.»*
> *«The short version: a pattern can be part of what you sell. It cannot be the
> thing you sell.»*

| uso | veredicto |
|---|---|
| Fondo decorativo de una sección del sitio | **OK** |
| Asset descargable desde el sitio | **NO** |
| Librería de plantillas, pack de SVG, generador derivado | **NO** |

Para lo que queremos —un fondo— el límite no molesta. Queda del otro lado si
alguna vez el patrón se ofrece como archivo o entra en una librería.

---

## 6 · Qué patrón se eligió

**PENDIENTE.** Se escribe acá cuando se decida, con el nombre exacto tal como lo
llama el sitio.

Antes de escribirlo, el chequeo es de una línea: **si el nombre es uno de los
tres de §4, no se puede usar.** Cualquier otro está cubierto por §2.

*(H1 midió que `bookofshapes` no tenía ninguna mención en el repo ni en toda la
historia de git: 0 hits. Este archivo es el primer registro del tema, y el §6 es
el lugar donde queda asentada la decisión.)*

---

## 7 · Dos cosas que el sitio afirma y no se verificaron

Se anotan para que nadie las dé por medidas. En H2 **no se descargó ningún
asset**, por regla del sprint:

1. Que *«Every download carries this text as `LICENSE.txt`»* — plausible, no
   comprobado. Cuando se baje el patrón elegido, **conviene confirmar que el
   `LICENSE.txt` viene adentro y guardarlo junto al asset**.
2. Que la licencia cambió por última vez en septiembre de 2026. Es la fecha que
   declara el sitio. Si alguien la consultó antes y no la encontró, esa fecha lo
   explica.

## 8 · Contacto, si hiciera falta preguntar

- X: https://x.com/Threeaio *(el «say hello» de la propia licencia apunta acá; no es un mail)*
- `nikolaj@creasurf.net` — en https://bookofshapes.com/privacy
- `moin@nikolaj-sokolowski.de` — en https://nikolaj-sokolowski.de/
- LinkedIn: https://www.linkedin.com/in/nikolaj-sokolowski-8661a2300/

**No hay repositorio público del proyecto** (el perfil https://github.com/threeaio
existe, con 6 repos, y ninguno es Book of Shapes). Así que no hay archivo
`LICENSE` de repo que invocar: la única fuente es la página de §1. Formulario de
contacto: no encontrado.
