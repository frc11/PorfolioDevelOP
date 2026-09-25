'use client'

import { cn } from '@/lib/utils'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { TextoBase } from '../../_componentes/tipografia/Textos'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza } from '../_contrato/canales'
import { Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO } from './contenido'
import {
  GEOMETRIA,
  TIPOGRAFIA_DEL_TITULAR,
  TIPOGRAFIA_DEL_REGISTRO_2,
} from './geometria'

/**
 * 01 · HERO — una pantalla, la escena a la vista, y el aire del pie reservado.
 *
 * ── El lugar que ocupa en el recorrido, y por qué es la única así ──────────
 *
 * `secciones.ts` le da `papel-transparente`, **100svh** y ningún pinneo. Las
 * tres cosas se leen con `seccionDeA('hero')` y ninguna se declara acá: el
 * alto, la superficie y el pinneo son del recorrido, no de la sección.
 *
 * Es la primera de las dos pantallas del sitio que dejan ver el canvas —Hero y
 * Por qué develOP— y por eso **esta sección no pinta fondo**. No hay un `bg-` en
 * toda la composición, y no es un olvido: el panel es transparente y la sala se ve
 * a través suyo. Un fondo puesto acá para que el texto se lea mejor apagaría lo
 * único que esta pantalla tiene y ninguna otra tiene.
 *
 * ── El texto va sobre la escena: qué se midió y qué NO ─────────────────────
 *
 * `hero.invariant.tsx` calcula la razón de contraste de `--color-tinta` contra
 * los dos tokens que pinta el marcador de posición del canvas y reporta el peor
 * caso. Sale muy por arriba de AA, así que el texto no necesita ninguna capa
 * abajo — y ésa es la razón por la que no la tiene.
 *
 * ⚠ **Esa cifra vale para el MARCADOR DE POSICIÓN, no para la escena real.** El
 * marcador son dos tokens planos; la sala 3D es un gradiente con luces y no hereda
 * el número. El día que la escena exista hay que volver a medir sobre la pose real,
 * y si ahí no diera AA la salida NO es una capa de fondo acá: es la escena, que es
 * de otro sprint. Queda reportado.
 *
 * ── Los últimos 72 px de esta pantalla no son míos ─────────────────────────
 *
 * La pastilla de navegación —que monta la RUTA, no esta sección— nace a
 * `100svh − 24px − 48px` y mide 48 de alto, centrada. O sea que **el pie de la
 * primera pantalla, en el centro, está ocupado**. Por eso el contenedor lleva
 * `pb-20` (80 px, `--spacing-20`): es el escalón declarado más chico que cubre
 * los 72 px de `DESCUENTO_NACIMIENTO_PX`, y el invariante compara los dos
 * números en vez de confiar en que alguien se acuerde.
 *
 * El `pt-20` de arriba NO es la simetría del de abajo: son dos decisiones que hoy
 * dan el mismo valor. El de abajo está atado a la geometría de la pastilla y el
 * invariante lo afirma contra ella; el de arriba es aire.
 *
 * ── La coreografía: un P1, un P2, y una cosa que no se mueve ───────────────
 *
 * P1 para el titular y P2 para el bloque de bajada y CTA, cada uno resolviendo su
 * ancla contra su propia caja — no hay un `stagger` coordinándolos, y no hace
 * falta.
 *
 * ⚠️ **EL TITULAR DEJÓ DE SALIR POR `TextoPorLineas`, Y NO ES UNA PREFERENCIA.**
 * Ese componente reparte UNA cadena en líneas MIDIENDO dónde cortan, con UNA
 * tipografía heredada. Desde el rehecho los dos registros del titular son dos
 * caras distintas —Archivo condensado 700 en mayúsculas arriba, Chivo Light
 * itálica abajo— y **dos caras no pueden salir de un divisor que reparte una
 * sola cadena con una sola métrica**. Así que el corte pasa a ser declarado y
 * el registro 2 es la única pieza de P1: el gesto del patrón es el mismo, cambia
 * quién decide dónde termina cada línea.
 *
 * ⚠ **COMPO-1 agrega el MISMO argumento un piso más abajo.** El registro 1
 * también cortaba por medición —a 320 envolvía y a 375 no—, así que el titular
 * tenía una forma en un teléfono y otra en el de al lado. Ahora corta siempre en
 * el mismo lugar, y quién lo decide está escrito en `contenido.ts`.
 *
 * Lo que se gana además: el `h1` vuelve a ser un encabezado con contenido de
 * frase y se cae el par `sr-only` + `aria-hidden` que `TextoPorLineas` necesita
 * —su docblock lo declara como desviación— porque `LineasDeTexto` emite un
 * `<div>`. `quienes-somos` sigue usándolo y la desviación sigue reportada ahí.
 *
 * ⚠️ **B2 · LOS DOS LLEGAN A DESTINO ANTES DE `scrollY` 0, Y ESO NO ES UN
 * DEFECTO ARREGLABLE ACÁ: ES LA ARITMÉTICA DE UNA PANTALLA.** El rango de P2
 * cierra en `fondo del bloque − alto de ventana` y el de P1 en eso más 240 px;
 * en una sección de UNA pantalla el fondo de cualquier bloque es ≤ la ventana,
 * así que los dos cierran en negativo. Medido a 1920×1080: el titular en −295 y
 * la bajada en −360, y el censo de acontecimientos no ve UN SOLO elemento del
 * hero cambiando en todo el documento. B2 pedía dos aterrizajes acá y se frenó:
 * la aritmética, las tres salidas y su costo están en `hero.invariant.tsx` §13.
 *
 * ⚠️ **EL SLOGAN SE FUE, Y CON ÉL LA ÚNICA PIEZA QUIETA DE LA PANTALLA.** Hasta
 * este ajuste la línea de marca iba arriba del titular y NO se animaba, con un
 * motivo escrito: era «lo único que sostiene la pantalla mientras el preloader
 * todavía está saliendo», y animar las tres cosas dejaba el primer cuadro
 * vacío. El pedido del humano la elimina como elemento propio, así que la
 * columna arranca ahora en el titular y **las cuatro piezas de la columna se
 * animan**. El primer cuadro del hero queda sin nada quieto: es una consecuencia
 * de la resta, está medida en `hero.invariant.tsx` §6, y no se compensa acá.
 *
 * ⚠ **El logo que el preloader deja acá NO lo monta esta sección.** El traspaso
 * es chrome —vive entre el preloader y el layout— y componerlo es del sprint
 * del home. Esta sección no lo dibuja y no le reserva caja. Queda reportado.
 *
 * ── ⚠️ COMPO-1 · LA COLUMNA CAMBIA DE FORMA EN 1025, Y AHORA SON TRES COSAS ─
 *
 * Abajo del breakpoint esta sección compone **tres filas de titular y dos de
 * bajada**; arriba, dos renglones y uno. Lo que conmuta no es el contenido: es
 * el ENVOLTORIO de cada pieza partida, que pasa de columna flex a `block` y deja
 * que las filas vuelvan a salir inline. Las tres cosas que cambian en el mismo
 * píxel, con su porqué en `geometria.ts`:
 *
 *   · **las filas del registro 1 se juntan** en un renglón (`escritorio:block`);
 *   · **la columna lateral de 140 px vuelve a existir** — abajo de 1025 esa celda
 *     está VACÍA y sus 152 px empujaban el texto adentro del logo centrado;
 *   · **el margen del pie se apaga** — el aire de la banda 860–1024 no puede
 *     llegar a escritorio, donde el bloque va centrado.
 *
 * ⚠️ **Y una consecuencia que NO se compensa acá, medida y reportada:** el
 * quiebre declarado AGREGA filas, el bloque se apoya abajo, y crecer es subir. A
 * 375×667 —el viewport más corto del set— eso mete el titular adentro de la masa
 * del logo: de 16,2 % a 40,6 % de tinta encima. La aritmética, y por qué ninguna
 * palanca de este sprint lo cierra, están en `outputs/COMPO-1.md` §0 y en
 * `DIRECCION-ESCENA.md` §7.65.
 *
 * ── Abajo de 1025 y con `prefers-reduced-motion` ──────────────────────────
 *
 * `BloqueDeSeccion` entrega `progreso: null` y esta sección renderiza su
 * variante quieta: **el mismo contenido, completo y legible, sin una sola
 * transformada ni un `will-change`**. No es una degradación; es la otra mitad.
 * La grilla de cinco columnas colapsa a una —es la firma estructural medida del
 * breakpoint— así que el titular usa el ancho entero, que a 36 px es la medida
 * que corresponde.
 *
 * ── Dónde están los números ───────────────────────────────────────────────
 *
 * En `geometria.ts`, junto con las dos constantes de tipografía del titular.
 * Salieron de acá cuando este archivo cruzó las 300 líneas del repo al
 * rehacerse el titular; el corte, y por qué las tipografías van con la
 * geometría y no con el marcado, están escritos allá.
 */

/**
 * La bajada y el CTA, escritos una sola vez.
 *
 * `items-start` no es decoración: `CtaEnlace` en su variante `linea` es un
 * `inline-block` y en una columna flex se estiraría a todo el ancho, con lo
 * cual el subrayado del rollover —que mide el 100 % de la ventana de recorte—
 * dejaría de terminar donde termina la palabra.
 */
/**
 * ⚠️ **SE FUE LA MARCA DE ARRIBA DEL TITULAR, Y CON ELLA SU MOTIVO.**
 *
 * PAPEL-2 la puso porque abajo de 390 el Hero pintaba `papel-opaco`: la sala no
 * se veía y la pantalla se quedaba sin lo único que la distinguía de las otras
 * siete. La marca era ese reemplazo, y por eso vivía exactamente en los dos
 * anchos donde el papel estaba.
 *
 * Con la mezcla el papel opaco no existe más: la sala se ve en los tres anchos de
 * la banda y la pantalla vuelve a distinguirse por lo mismo que en los otros seis.
 * La pieza que la reemplazaba ya no reemplaza nada. `Logotipo` e `Isotipo` siguen
 * en `marca/Marca.tsx` con sus otros consumidores —el pie y la galería—; lo que se
 * fue es este uso y las dos clases que lo colocaban.
 */

function BajadaYCta(): React.JSX.Element {
  return (
    <>
      {/* ⚠️ **COMPO-1 · `TextoBase` Y NO `Cuerpo`, Y ES UN ESCALÓN DE LA ESCALA
          Y NO UN VALOR NUEVO.** Pedido del dueño: la bajada «un poco más
          grande» a 1440 y a 1920. Era `cuerpo` (15 px) y pasa a `base` (16 px),
          que es **el escalón inmediatamente arriba en la escala de tokens** y
          el único que hay entre los dos: el siguiente es `titulo-s`, que a 1440
          vale 20 px y a 1920 21,35 —un 33 % y un 42 % más, o sea otro registro
          y no «un poco»— y además trae el interlineado de TÍTULO (1,09), que en
          un párrafo es un defecto y no un tamaño.

          ⚠ Lo que eso compra, dicho con el número: **+1 px, +6,7 %**. El propio
          `_lib/tipografia.ts` §B7 declara que a estos cuerpos «una diferencia
          de un píxel no la ve nadie», así que este cambio está en el borde de
          lo perceptible y se reporta como tal. Lo que NO se hizo es inventar un
          valor intermedio: un token nuevo por una preferencia estética es
          exactamente lo que la puerta de control de cambios del tema existe
          para frenar.

          ⚠ `base` es «texto de interfaz heredado» por nombre, y acá se usa como
          tamaño. Es el mismo criterio con el que la escala se lee en el resto
          del lane: los diez niveles son TAMAÑOS y el nombre es su origen, no su
          permiso. */}
      {/* ⚠️ **COMPO-2 · UNA FRASE, UN RENGLÓN, EN LOS OCHO ANCHOS — Y ESTO ES
          UN QUIEBRE REVOCADO, NO UN QUIEBRE QUE FALTA.** COMPO-1 partía la
          bajada en dos filas declaradas con `claseDelEnvoltorioDeFilas`, y lo
          escribió en `contenido.ts` como decisión de composición del dueño
          justamente para que se pudiera dar vuelta. El dueño la dio vuelta.

          Lo que se fue con el quiebre: el envoltorio que conmutaba, los dos
          `<span>` y el separador de espacio entre ellos. **Ya no hacen falta
          ninguno de los tres**: el párrafo es un nodo de texto solo, así que el
          nombre accesible y lo que copia quien selecciona son la frase entera
          sin un mecanismo que los sostenga.

          ⚠ Que entre no es un supuesto: medido en el navegador en los ocho, el
          renglón mide 243,34 px y la caja más chica es 256 (a 320), o sea 12,66
          px de margen en el peor. La tabla entera está en `contenido.ts`. */}
      <TextoBase className={MEZCLA_SOBRE_LA_ESCENA}>{CONTENIDO.bajada}</TextoBase>
      {/* Un enlace nativo, nunca un div con manejador, y NUNCA adentro de otro
          interactivo: la referencia envuelve su botón en un enlace y eso son dos
          paradas de tabulación para un solo control. `Cta` (botón) y `CtaEnlace`
          (enlace) están separados justamente para que anidarlos haya que
          escribirlo a propósito. */}
      {/* `registro="rotulo"`: mayúsculas, `--tracking-micro` —el único
          interletrado positivo del sistema— y la regla horizontal en tinta
          puesta en reposo. El rótulo NO cambia. Las tres cosas salen de tokens
          que ya existían y el porqué de que sea un atributo aparte y no una
          tercera `VarianteCta` está en `Cta.tsx`: esa tabla son las dos formas
          MEDIDAS y no se le agrega una decisión nuestra. */}
      {/* ⚠️ **COMPO-1 · `-ml-2` CANCELA EL RELLENO DEL COMPONENTE, y no es
          compensación óptica.** Medido en los ocho anchos: las cuatro cajas de
          la columna arrancan en el MISMO x al píxel, y la tinta del CTA arranca
          8 px más a la derecha en los ocho — porque `_estilos/cta.css` le pone
          `padding: var(--spacing-2)`. Se reconoce que es layout y no glifo
          porque el número no se mueve un décimo entre 320 y 1920, mientras las
          sangrías de las dos filas del titular SÍ escalan con el cuerpo (+1 y
          +4 → +7). El detalle, con la tabla, está en
          `GEOMETRIA.claseDeLaSangriaDelCta`. */}
      {/* [CONTACTO] Los dos CTA en una fila que se parte si no entra; la sangría pasa a la fila para que los dos arranquen en la columna. */}
      <div className={cn('flex flex-wrap gap-x-4', GEOMETRIA.claseDeLaSangriaDelCta)}>
        <CtaEnlace href={CONTENIDO.cta.destino} rotulo={CONTENIDO.cta.rotulo} registro="rotulo" mezcla className={MEZCLA_SOBRE_LA_ESCENA} />
        <CtaEnlace href={CONTENIDO.ctaContacto.destino} rotulo={CONTENIDO.ctaContacto.rotulo} registro="rotulo" mezcla className={MEZCLA_SOBRE_LA_ESCENA} />
      </div>
    </>
  )
}

export function Hero({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        {/* `min-h-svh` y no `h-svh`: si el titular se parte en más líneas de las
            previstas —otro copy, otro idioma— la pantalla crece en vez de
            recortar el texto. El alto declarado de la sección es un MÍNIMO en
            `Panel`, así que las dos cajas dicen lo mismo.

            ⚠️ **`justify-end` ABAJO DEL BREAKPOINT, Y ES LA ÚNICA COSA QUE ESTE
            SPRINT MUEVE.** Decisión del dueño mirando la referencia: en vertical
            el logo va arriba y el texto abajo. El motivo medido: con el bloque
            centrado, el logo —que en esos anchos es MÁS ANCHO QUE EL CUADRO y
            cae en el medio de la pantalla— se come el titular. Medido sobre el
            píxel con `scripts-tapado/a-verdad.ts`, tinta del titular sobre la
            masa negra del logo: **56,2 % a 375 · 54,8 % a 390 · 48,1 % a 425 ·
            56,8 % a 768 · 20,6 % a 1024**, contra **0,6 % a 1440 y 0,1 % a
            1920**. Los dos anchos de escritorio están bien compuestos y por eso
            conservan `justify-center` — es lo que hace la variante.

            El bloque entero baja: titular, bajada y CTA. El orden interno no
            cambia, y ninguna otra clase se toca. `pb-20` sigue siendo el que
            reserva los 72 px de la pastilla (`soporte.ts` lo afirma contra
            `DESCUENTO_NACIMIENTO_PX`), así que `justify-end` apoya el bloque
            exactamente en ese borde y no debajo de la pastilla.

            ⚠ **A 320 esto NO alcanza, y está medido.** Ahí el bloque ocupa el
            66 % del viewport contra una masa de logo del 37 %: la suma pasa de
            100, así que **no existe ninguna posición en la que no se toquen**.
            El barrido de la mejor posición posible da 21,8 % pegado al borde de
            arriba; medido en pantalla, `justify-end` deja 31,5 % contra el
            30,7 % de antes. No es una regresión de este cambio: es que a ese
            ancho no existe una posición limpia. Los números están en
            `s10-logo-composicion.ts` y la salida no es de acá. */}
        {/* ⚠️ **PAPEL-2 · `max-chico:pb-2` — EL PIE SE ACHICA DONDE LA PASTILLA
            NO ESTÁ.** `pb-20` sigue siendo el que reserva los 72 px de la
            pastilla y `soporte.ts` §9 lo sigue afirmando contra
            `DESCUENTO_NACIMIENTO_PX`; lo que hace la clase nueva es apagar esa
            reserva en los dos anchos donde el §5 desmonta la pastilla, y el
            valor que queda es el SOBRANTE que COMPO-1 §6 ya había medido y
            nombrado: `80 − 72 = 8` px. Los 72 liberados son el presupuesto con
            el que entran las dos piezas de marca del §2 — la derivación, con la
            holgura de los dos anchos, está en
            `GEOMETRIA.claseDelPieSinPastilla`. */}
        {/* ⚠️ **COMPO-2 · §1 · UN TERCER RÉGIMEN VERTICAL, Y SON DOS CLASES
            PORQUE SON DOS COSAS.** `max-chico:justify-center` centra el bloque
            abajo de 390 —pedido del dueño: *«el conjunto entero pasa a estar
            CENTRADO VERTICALMENTE en el viewport, no apoyado abajo»*— y
            `max-chico:pt-2` es lo que hace que ese centrado sea CIERTO:
            `justify-content:center` centra en la caja de CONTENIDO, y con
            `pt-20` arriba y `pb-2` abajo la caja no está centrada en la
            pantalla, así que el bloque quedaría 36 px más abajo del centro. Las
            dos derivaciones, con los números, están en `geometria.ts`.

            ⚠ `pt-20` y `pb-20` siguen los dos en el marcado y siguen valiendo
            en los seis anchos restantes: lo que se agrega son CONDICIONES, no
            reemplazos, igual que hizo PAPEL-2 con el pie. */}
        <div
          data-pantalla="hero"
          /* ⚠️ **SE FUERON LAS TRES CONDICIONES DE LA BANDA DE PAPEL.** El
             centrado del bloque (`justify-center`) y el aire de arriba
             recortado (`pt-2`) existían porque abajo de 390 el hero tapaba la
             sala con papel y la composición era otra: bloque al medio, sin
             calle. Con la mezcla el texto se apoya sobre la escena y vuelve la
             composición grande — bloque ABAJO y a la izquierda, logo arriba, la
             misma relación que a 768 y a 1024 puesta a lo alto. `pb-2` se queda:
             su motivo es otro y está medido —abajo de 390 la pastilla de
             navegación no está y el pie no tiene que reservarle 72 px—. */
          className={cn(
            'flex min-h-svh w-full flex-col justify-end pt-20 pb-20 escritorio:justify-center',
            GEOMETRIA.claseDelPieSinPastilla,
          )}
        >
          {/* ⚠️ **COMPO-1 · DOS CLASES, DOS PEDIDOS, Y LAS DOS ACOTADAS.**
              `claseDeLaColumnaLateral` corre el colapso de la columna de 140 px
              de 768 a 1025 —§5: a 768 y a 1024 esa celda está VACÍA y sus 152 px
              empujaban el texto adentro del logo centrado—, y
              `claseDelAireDelPieEnPortatil` le agrega `--spacing-4` de margen
              abajo en la banda 860–1024 —§6: el CTA quedaba a 8 px de la
              pastilla—. Las dos derivaciones, con sus medidas, están en
              `geometria.ts`; acá sólo se aplican.

              ⚠️ **COMPO-2 le agrega a la segunda una TERCERA banda, 768–859, y
              no es el mismo pedido.** La regla global —la bajada en un renglón—
              le saca al bloque una caja de línea de `--text-base` y, como el
              bloque se apoya abajo, eso lo BAJA 25,6 px. En siete anchos no
              importa o mejora; a 768 mete el registro 2 adentro de la SEGUNDA
              masa de la escena (filas 800–838) y la superposición pasa de
              3,35 % a 8,53 % sin que nadie toque el titular. El margen le
              devuelve exactamente lo que la regla le sacó —de ahí que el valor
              sea `calc(var(--text-base) * var(--leading-texto))` y no un
              escalón— y la medición vuelve a dar 3,35 %.

              ⚠️ **ROCE-1 le resta 6 px a ese valor, y es la ÚNICA cosa que este
              sprint mueve.** Contra la silueta analítica del logo —no contra
              «lo que está oscuro»— la tinta del titular a 768 publica 0,62 %,
              toda del registro 1, porque su primera fila nace 103 px arriba del
              borde de abajo del lóbulo. Bajar el bloque 6 px lo lleva a 0,00 %
              y es el mínimo que lo hace (5 px publica 0,04 %). No hay clase
              nueva: cambia un término del `calc()` que ya existía, así que la
              banda sigue siendo 768–859 y los otros siete anchos no se enteran.
              El barrido y su control positivo están en `geometria.ts`, al lado
              del valor. */}
          <Grilla
            columnas="lateral"
            className={cn(GEOMETRIA.claseDeLaColumnaLateral, GEOMETRIA.claseDelAireDelPieEnPortatil)}
          >
            {/* ⚠️ LA COLUMNA LATERAL SE QUEDA VACÍA, Y NO ES UN `MarcaDeSeccion`
                MENOS: es un `<div>` que RESERVA la celda. La grilla `lateral`
                tiene dos celdas —140 px fijos y una fluida— y si el Hero pasara
                un solo hijo, la sub-grilla de 5 caería en la celda de 140 y la
                composición entera se correría. Es la misma forma que
                `CabeceraDeSeccion` ya usa cuando no le dan contenido.

                Lo que se fue es el CUADRADO de `--color-acento` que la marca
                pintaba ahí: pedido del humano, «muy afuera de la columna». La
                pieza no se toca —las otras tres secciones y el pie la siguen
                montando— y la columna de 140 px tampoco, porque es la que
                sostiene el cierre estructural de B11 (`Rotulo.tsx`).

                ⚠️ **COMPO-1 · ABAJO DE 1025 YA NO HAY CELDA QUE RESERVAR, Y EL
                `<div>` SE QUEDA IGUAL.** La grilla colapsa a una columna, así
                que este hijo pasa a ser una FILA de alto cero. Con `justify-end`
                esa fila cae ARRIBA del contenido y no mueve un píxel del bloque,
                que se apoya abajo — medido: el fondo del bloque es el mismo a la
                centésima en los seis anchos. Sacarlo con `hidden` habría sido un
                cambio de más para el mismo resultado, y lo que este `<div>`
                custodia sigue vivo de 1025 para arriba.

                ⚠️ **COMPO-2 · Y EN LA BANDA DE PAPEL DEJÓ DE SER PARA EL MISMO
                RESULTADO, MEDIDO.** «Una fila de alto cero» no cuesta cero: la
                grilla le pone su CANALETA igual (`--grilla-canal-compacto`, 12
                px), y con `justify-end` esos 12 px caían arriba del bloque, o
                sea en el aire que nadie mira. Con el bloque CENTRADO (§1) el
                mismo hueco corre la columna visible **6 px para abajo del
                centro**: medido a 320, 37,81 px de aire arriba contra 25,83
                abajo. `chico:` y no otra banda: de 390 para arriba el bloque
                vuelve a apoyarse abajo y ahí la fila fantasma sigue sin costar
                nada — medido, el fondo del bloque no se mueve una centésima. */}
            {/* La celda lateral vacía se queda: apagarla tenía sentido con el bloque centrado (corría la columna 6 px del centro) y con el bloque apoyado abajo no cuesta nada, medido. */}
            <div />
            <Grilla columnas={GEOMETRIA.columnasTotales}>
              {/* ⚠️ **LOS DOS HUECOS VALEN 8 px ABAJO DE 1025 Y NO SE TOCAN
                  ARRIBA.** `gap-8` (32) entre el titular y la bajada y `gap-6`
                  (24) entre la bajada y el CTA suman 56 px de aire en los
                  anchos donde el bloque ya no entra: a 375 valen más que
                  cualquiera de las cinco palancas tipográficas medidas —ninguna
                  de ellas pasa de 25,1 px a ese ancho— y bajarlos a 8/8 devuelve
                  40. Medido en `e-despues.json`, tinta del titular sobre la masa
                  del logo, contra `e-antes.json`.

                  ⚠ La variante es `escritorio:` y no otra cosa: de 1025 para
                  arriba la composición está cerrada (0,7 % a 1440 y 0,1 % a
                  1920) y este cambio tiene que dejarla IDÉNTICA al decimal. Es
                  el mismo píxel en el que conmutan la medida, la grilla de 5 y
                  la caja del titular. */}
              <div className={cn('flex flex-col gap-2 escritorio:gap-8', GEOMETRIA.claseDeLaMedida)}>
                {/* ⚠️ **PAPEL-2 · §2 · LA MARCA, PRIMERA DE LA COLUMNA.** El
                    orden vertical es el del pedido —palabra, dibujo, y después
                    el bloque de texto que ya existía— y el aire que la separa
                    del titular es el `gap-2` de esta misma columna, no una
                    medida propia. De 390 para arriba el envoltorio es
                    `display:none`, deja de ser ítem de flex y se lleva su hueco
                    con él: los seis anchos que el §6 declara intocables no ven
                    ni un píxel de esto. */}
                {/* La caja del titular: **2 de 3 de la medida de 1025 para
                    arriba, y las 3 enteras abajo**. El porqué —los tres bordes
                    seguros medidos sobre el píxel, todos en escritorio, y lo que
                    cuesta a 768 aplicarlos donde no valen— está en
                    `GEOMETRIA.claseDelTitular`. La clase del tramo va en el
                    Bloque, que es el elemento que se mide: un envoltorio de más
                    entre la celda y el bloque no agrega nada. */}
                <Grilla columnas={GEOMETRIA.columnasDeLaCajaDelTitular}>
                  <Bloque patron="P1" className={GEOMETRIA.claseDelTitular}>
                    {(progreso) => (
                      // El `h1` es el nombre accesible de la región del Hero (S11,
                      // defecto 10), y acá es además el que junta las tres filas
                      // en UN nombre: «Tu negocio vendiendo las 24 hs». Todas las
                      // piezas son `<span>` —contenido de frase, que es lo único
                      // que un encabezado admite, y por eso el envoltorio del
                      // registro 1 también lo es— así que no hace falta el par
                      // `sr-only` + `aria-hidden` que `TextoPorLineas` necesita
                      // para poder emitir un `<div>` adentro del `h1`.
                      <h1
                        id={idDelTitularDeSeccion(seccion.id)}
                        data-titular="dos-registros"
                        // La mezcla va en el `h1` y no por renglon: asi el titular
                        // entero compone como UN grupo y despues mezcla, que es lo
                        // que da el borde duro parejo en las dos filas.
                        className={cn('flex flex-col items-start', MEZCLA_SOBRE_LA_ESCENA)}
                      >
                        {/* ⚠️ **EL REGISTRO 1 ES LA PIEZA QUIETA, Y NO PASA POR
                            UN CANAL.** Sin coreografía de entrada, presente en
                            el primer cuadro. Devuelve lo que el hero perdió al
                            irse el cepillo, que era la única pieza sin entrada
                            y estaba ahí por un motivo escrito: **sostiene la
                            pantalla mientras el preloader todavía está
                            saliendo**. Sin nada quieto, el primer cuadro del
                            hero queda vacío, que es exactamente el defecto que
                            una coreografía de entrada existe para evitar.

                            No es «P1 con duración cero»: es OTRO árbol, sin
                            primitiva montada, sin suscripción al progreso y sin
                            una transformada por cuadro. El registro 2 se queda
                            con P1 y es su única pieza.

                            ⚠️ **COMPO-1 · ES UN ENVOLTORIO Y ADENTRO VAN DOS
                            FILAS.** Abajo de 1025 el registro 1 se parte en
                            «TU NEGOCIO» / «VENDIENDO» —quiebre declarado, no
                            envuelto— y de 1025 para arriba el envoltorio vuelve
                            a ser `block`, las dos filas salen inline y el
                            renglón es el mismo que el dueño aprobó a 1440 y a
                            1920. **La clase de tipografía va en el ENVOLTORIO y
                            no en las filas**, y eso no es una preferencia: el
                            espacio de en medio es un nodo de texto suyo, así que
                            con la clase adentro saldría en la familia y el
                            tamaño heredados —cuerpo, 15 px— y en escritorio las
                            dos palabras quedarían casi pegadas. */}
                        <span className={cn(TIPOGRAFIA_DEL_TITULAR, GEOMETRIA.claseDelEnvoltorioDeFilas)}>
                          <span>{CONTENIDO.titularFila1}</span>
                          {/* El mismo separador que el de abajo, y por el mismo
                              motivo: sin él el nombre accesible dice «Tu
                              negociovendiendo». Abajo de 1025 no se ve —las dos
                              filas son ítems de una columna flex y un ítem
                              anónimo de puro espacio no se renderiza— y arriba
                              ES el espacio entre las dos palabras. */}
                          {' '}
                          <span>{CONTENIDO.titularFila2}</span>
                        </span>
                        {/* ⚠️ ESTE ESPACIO NO ES FORMATO: es el separador del
                            NOMBRE ACCESIBLE. Las dos piezas son hermanas y sin
                            nada en medio el h1 se anuncia «Tu negocio
                            vendiendolas 24 hs» — el mismo defecto que
                            `_lib/cta.ts` documenta para las dos copias del
                            rollover de la referencia. Lo encontró
                            `hero.invariant.tsx` §7 y no se ve: las dos piezas
                            son ítems de un contenedor `flex-col`. */}
                        {' '}
                        <CanalDePieza
                          progreso={progreso}
                          patron="P1"
                          cantidad={GEOMETRIA.piezasAnimadasDelTitular}
                          indice={0}
                          como="span"
                          className={TIPOGRAFIA_DEL_REGISTRO_2}
                        >
                          {CONTENIDO.titularFila3}
                        </CanalDePieza>
                      </h1>
                    )}
                  </Bloque>
                </Grilla>

                {/* La bajada y el CTA en media medida. El CTA viaja adentro de la
                    misma caja a propósito: `items-start` lo deja en su ancho, así
                    que acotar la caja no lo estira ni lo corta. */}
                <Grilla columnas={GEOMETRIA.columnasDeLaCajaDeLaBajada}>
                  <Bloque patron="P2">
                    {(progreso) => (
                      <CanalDePieza
                        progreso={progreso}
                        patron="P2"
                        cantidad={GEOMETRIA.piezasDelBloqueDeEntrada}
                        indice={0}
                        // El segundo de los dos huecos: 8 px abajo de 1025, los
                        // 24 de siempre arriba. El porqué está en el `gap` de la
                        // columna, que es el otro.
                        className="flex flex-col items-start gap-2 escritorio:gap-6"
                      >
                        <BajadaYCta />
                      </CanalDePieza>
                    )}
                  </Bloque>
                </Grilla>
              </div>
            </Grilla>
          </Grilla>
        </div>
      </Envoltorio>
    </Seccion>
  )
}
