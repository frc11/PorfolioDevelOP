# C2-90v: cero fallas nuevas en `verificar` contra la base (el cierre tecnico de la cola 2)

## Plan
`verificar` en la integracion (7931926e) tenia 11 afirmaciones que fallaban y en la base (ae039793) no, todas traidas por tareas
de la cola. Por cada una: averiguar que tarea y que intencion (git log -S, los docs de la tarea) y decidir si se arregla el codigo
(sin cambiar lo que se ve) o si el invariante clavaba algo que cambio a proposito (se afloja a lo que protege, con su control).

## Log
1. **s6-lane / s7-contrato, ninguna seccion importa de otra (codigo).** La 50 (`TituloQueSePintaAlLlegar`) importaba de `tu-panel/`
   la letra y el pintado del titulo del Panel, y la 51 (`ContactoDelRecomendador`) la letra de los campos de `trabajos/portfolio/`.
   Lo compartido salio a `_componentes/`: `pintado/pintado.ts` (el `pintado.ts` de Tu panel entero, movido, mas
   `TIPOGRAFIA_QUE_SE_PINTA`) y `formularios/letraDelFormulario.ts` (`CLASE_DEL_TEXTO_DEL_FORMULARIO`). Las dos secciones importan
   de ahi. Los imports por ruta de s6-tu-panel y s6-tu-panel-c2, al dia. Mismas clases, mismo marcado.
2. **s6-lane, lista blanca (invariante).** Las cinco fuentes de Google de `?titulo-servicio` / `?fuente-servicio` (50) no tienen
   equivalente permitido sin bajar archivos (`next/font/local`). Excepcion ENUMERADA archivo por archivo, solo para
   `next/font/google`, con su motivo («provisorio hasta que se elija la fuente; se borra con la eleccion»); un renglon cuyo archivo
   ya no existe falla. Controles: la misma importacion en otro archivo se ve; otro modulo en un archivo exceptuado se ve.
   s17-marca no se toca (lee el layout; sus 2 fallas son las de la base).
3. **s6-tokens (codigo).** La familia `font-`: `ajuste.ts` quitaba el tamano con `removeProperty` y el nombre de CSS (el escaner lo leia como clase): ahora
   `style.fontSize = ''`, que es lo mismo. `tracking-tight` (la 50, `?titulo-servicio=3`): `tracking-titulo`, el interletrado de los
   titulos del sistema. Las variantes data con valor (visible igual a si, al-frente igual a si; la 70): atributos de presencia y la variante `data-*` sin
   valor (`data-visible:`, `group-data-al-frente:`; verificado con el compilador de Tailwind 4.3.1: `&[data-visible]` y
   `:where(.group)[data-al-frente] *`); el JS escribe/quita el atributo (`toggleAttribute`, `setAttribute(.., '')`). La transicion
   del cartel del arrastre (`opacity, scale`, sin el `transform` con que sigue al mouse) paso a `banda.css` (la hoja de las reglas de
   Por que develOP, en el padron de s3-tokens); la clase queda en `transition-opacity` para la curva y la duracion de siempre.
4. **s6-render (invariante).** (a) El contrapeso «hay marcadores en pantalla»: el ultimo marcador de las cuatro secciones (el
   `[TEXTO]` de las preguntas del recomendador) se fue con la 51, que trajo su texto. Ahora: el contador mira el texto del recorrido y
   VE un marcador cuando llega (control nuevo). (b) Los «Ver trabajo» del carrusel del telefono (70t) van todos adentro de un
   `aria-hidden` (las copias visuales; la parada del teclado de cada resena es su enlace del lector) y por eso con `tabindex=-1`.
   `inert` no sirve (mataria el dedo y el mouse). La regla se parte por subarbol: lo que se anuncia no sale del Tab, y lo que esta
   adentro de un `aria-hidden` SI tiene que salir (el foco no entra a lo que el lector no anuncia). Dos controles.
5. **s61 J7 (invariante).** La 40 puso el estilo del titular en una variable (`estiloDelTitular`, en el flujo ademas se levanta). Se
   afirma que en las dos ramas la opacidad es `opacidadDelTitular`; control nuevo: la rama que se levanta sin la opacidad se ve.
6. **s36 (invariante).** La presencia por tiempo del encabezado salio a `usePresencia` (`levantarse.tsx`, 41t): el mismo `animate`
   hacia 1/0 con `PRESENCIA_DEL_ENCABEZADO` (las dependencias nuevas, `s` y `curva`, son de una constante del modulo). Se afirma
   el pedido del encabezado y el `animate` en `levantarse.tsx` (lo mismo que ya hacia s76).
7. **s50 (invariante).** La 80 (ff89a892) apago a proposito el contorno de `[data-parte="carga"]` (la carga del login se enfoca por
   codigo para anunciarse; no es un control). Excepcion por selector exacto, y se afirma que la carga es un `div` con
   `tabIndex={-1}`; controles: la carga convertida en boton y otro selector con el contorno apagado se ven.

## Suites (sin build: las que piden `.next` no corren aca)
s6 486/0, s7 355/0 (s7-compuerta pide build), s61 72/0, s36 66/0, s50 61/0, s3-tokens 29/0, s37, s52, s53, s76, s78, s79,
s81, s83, s84, s85 sin fallas; s5/s8/s4/s17 igual que la integracion. tsc 0, eslint limpio en lo tocado.

## Que mirar
- `/v3` a 1440, Por que develOP: pasar el mouse sobre las tarjetas del aro: el cartel «arrastra» aparece con fundido y escala y
  sigue al mouse sin arrastrarse; la tarjeta de frente con sombra y el retrato con su aro de tinta.
- `/v3?titulo-servicio=3` a 1440: el titulo de cada servicio en Chivo 900 con el interletrado de los titulos (un pelo mas cerrado).
- Nada mas cambia a la vista.
