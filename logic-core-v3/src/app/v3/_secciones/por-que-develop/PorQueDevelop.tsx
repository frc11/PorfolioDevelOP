'use client'

import { Grilla } from '../../_componentes/layout/Grilla'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza, CanalDeTitular } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { ContenidoDeSeccion, EncabezadoDeSeccion, Seccion } from '../_contrato/Seccion'
import { BloqueDeTestimonio, TarjetaDeDiferencial } from './Diferenciales'
import {
  ALTO_MINIMO_DEL_BLOQUE,
  DIFERENCIALES,
  ENTRADA,
  INDICE_DEL_TESTIMONIO,
  NOMBRE_DE_SECCION,
  PIEZAS_DE_P5,
  TESTIMONIO,
  TITULAR,
} from './contenido'

/**
 * SECCIÓN 07 — POR QUÉ DEVELOP. El diferencial, sobre la escena.
 *
 * ── Lo que la hace distinta de las otras tres ─────────────────────────────
 *
 * Es el segundo de los tres momentos de escena del recorrido y el único en
 * medio de la página: su superficie de contrato es `papel-transparente`, o sea
 * que el panel **no pinta fondo** y deja ver lo que hay detrás.
 *
 * ⚠️ **LA DIVERGENCIA QUE ESTE DOCBLOCK REPORTABA YA NO EXISTE, y se dice en
 * vez de borrarse.** Decía que `_lib/secciones.ts` declaraba `papel-opaco` para
 * esta sección; leída hoy, la fila 07 declara **`papel-transparente`**, que es
 * lo que el contrato acordó. O sea que la escena SÍ vuelve acá, y por eso B2
 * puede llamar a esa vuelta un momento. **Esta sección sigue siendo correcta
 * con las dos y no hay que tocarle una línea si cambia**, porque no pinta un
 * color: consume `text-tinta` heredado del panel, `--color-borde` para las
 * separaciones y nada más.
 *
 * Y por la misma razón, lo que este archivo **no** hace: no agrega una capa, ni
 * un velo, ni un gradiente, ni un fondo para "asegurar" la lectura sobre el
 * escenario. Si el contraste no da, se reporta. Inventar una capa acá sería
 * tomar por cuenta propia una decisión de dirección de arte que no es de este
 * sprint. El invariante afirma la ausencia, archivo por archivo.
 *
 * ── Dos bloques medidos, dos patrones ─────────────────────────────────────
 *
 *   · **P1** sobre el titular, línea por línea. Es el 58 % del corpus de la
 *     referencia y el ancla no puede degenerar: su rango es `alto + 160px`.
 *   · **P5** sobre las cinco piezas que aparecen —los cuatro diferenciales y
 *     el testimonio—. Es el único patrón LINEAL del sitio, uno de sus pocos
 *     usos, y `_contrato/motion.ts` ya lo declara para esta sección en
 *     `USOS_DECLARADOS`. Su escalonado medido es 0: las cinco arrancan juntas.
 *
 * ═══ B9 · LOS DOS BLOQUES DISPARAN POR SU VENTANA VISIBLE ═════════════════
 *
 * **El defecto, fotografiado.** En el `scrollY` donde esta sección llena el
 * cuadro exacto —17.280 a 1920×1080— los cuatro diferenciales y el testimonio
 * estaban en opacidad **0**, y el 60 % inferior de la pantalla vacío. Llegaban
 * a opacidad 1 recién en 17.755, con la sección **44 % fuera por arriba**. La
 * primera tarjeta pasaba **el 10 % de su ventana visible** a opacidad 1.
 *
 * **La causa, aislada midiendo** (`scripts-b9/b9-desfases.ts`, y las tres
 * alternativas refutadas con número en el reporte de B9):
 *
 *     ventana visible del bloque   [16.708 · 18.328]   1.620 px
 *       864 px (53,3 %)  en cuadro y sin que pase nada
 *       108 px ( 6,7 %)  toda la animación
 *       648 px (40,0 %)  quieto hasta que sale
 *
 * No era el anclaje a la sección —el motor medía la caja del bloque, y su
 * predicción reproduce la ventana observada con 132 px de error sobre una
 * grilla de 120—, no era el escalonado —las cinco piezas arrancan y terminan en
 * el mismo `scrollY`, desparramo **0 px**— y no era un alto declarado que no
 * coincidiera con lo renderizado —el bloque mide **540,0 px** a 1080 y
 * **450,0** a 900, exactamente su piso—. Era **el ancla de P5**:
 * `top top+=20%` pide que el borde superior del bloque haya bajado al 20 % del
 * cuadro, y para un bloque que vive al pie de una sección de una pantalla eso
 * ocurre 864 px después de que entró.
 *
 * **Los dos bloques declaran `rango="ventana-visible"`.** Para el titular (P1)
 * es un no-op comprobable: el ancla de la regla ES `ANCLAS.P1`. Para el bloque
 * de P5 el arranque pasa de 864 px a **80** después de entrar en cuadro.
 *
 * ⚠️ **Lo que NO cambia: ni una línea de contenido ni de composición.** El
 * `min-height` de `ALTO_MINIMO_DEL_BLOQUE` se queda donde estaba; lo que
 * cambió es POR QUÉ está, y eso se reescribió en `contenido.ts` — ya no lo
 * sostiene la aritmética de P5 (el rango de la regla es `alto + 160` y no puede
 * degenerar) sino el reparto del `<ul>` con `content-between`.
 *
 * ── `anima` entra como propiedad y no se consulta acá ─────────────────────
 *
 * Es lo que permite que el invariante renderice las dos ramas sin inventar un
 * atributo de forzado en el producto. Quien consulta la compuerta es el
 * envoltorio de abajo, y lo usa la ruta.
 *
 * ═══ B1 · LA RESTA — LO QUE SE MIDIÓ ACÁ Y QUÉ CAMBIÓ POR ESO ═════════════
 *
 * Sobre el píxel, con la sección apoyada en el tope del viewport, tres capturas
 * (dos del fondo con el contenido ocultado en runtime y una con el texto) y el
 * contraste calculado **bajo el glifo**, no bajo la caja de línea:
 *
 * | pieza | 1920 | 1440 |
 * |---|---|---|
 * | titular | peor **4,14:1** · 8 px bajo AA de 47.544 (0,02 %) · sin masa oscura en su banda (`bordeSeguroX = 1920`) | peor **1,07:1** · 55 px bajo AA de 32.153 · masa oscura desde **x = 716** y la tercera línea llega a x 916,6 |
 * | bajada | peor **1,10:1** · 87 px bajo AA · masa desde x 1007, la bajada llega a x 1190 | peor 1,63:1 · 10 px bajo AA |
 * | tarjetas, 2ª columna | peor **1,09:1** · 142 px bajo AA (**26,69 %**) | — |
 * | tarjetas, 1ª columna | peor 13,08:1 · 0 bajo AA | — |
 * | testimonio | peor 16,08:1 · 0 bajo AA | — |
 *
 * **La afirmación de que "el titular ya está limpio" se sostiene a 1920 y NO a
 * 1440**, y la causa está medida y no es la caja del titular: a 1440 la sección
 * mide **1009,72 px contra los 900 de una pantalla**, así que llena el cuadro en
 * la pantalla 11,888 en vez de la 12 — **101,5 px antes de la pose para la que
 * se eligió el ancla 0,8525**. Repetida la medición en la pantalla 12 exacta, el
 * mismo titular, con la misma caja, da **1 píxel bajo AA de 40.161 y peor
 * 2,90:1, y su banda vuelve a no tener masa oscura**. El defecto es de ALTO.
 *
 * Tres cambios, ninguno de contenido y ninguno de tipografía:
 *
 *   1. **La sección se acorta.** `min-h-svh` con `justify-between` y costuras en
 *      tokens chicos: a 1920 el sobrante se reparte entre las costuras y a 1440
 *      se saca del alto. El `pt` del titular es el despeje de la pastilla
 *      —nace en `100svh − 24 − 48` y mide 48 de alto, o sea que los primeros
 *      72 px del cuadro no son de esta sección.
 *   2. **La bajada se acota a 2 de 3 de la medida**, que es el mismo constructo
 *      con el que B1 arregló el hero. Termina en x 848 (1920) y x 634,7 (1440),
 *      por dentro del borde seguro de 915 y 676.
 *   3. **Las tarjetas se van a la primera columna** y se reparten sobre el alto
 *      del bloque; el testimonio pasa a la segunda, apoyado abajo. Saca los
 *      diferenciales de arriba del logo —era el 26,69 % de sus píxeles bajo AA—
 *      y de paso reparte los **443,06 px de banda vacía** que el bloque de P5
 *      tenía adentro (301,3 a 1440). ⚠️ Ese `min-height` era de 55svh cuando se
 *      midió; hoy vale 50 (`contenido.ts:184`), así que las cifras de esta
 *      viñeta describen el estado de entonces y no el de hoy.
 *
 * ⚠️ **ESTE PÁRRAFO DESCRIBÍA UN MUNDO QUE YA NO EXISTE, Y SE REESCRIBE CONTRA
 * LA PROPIEDAD NUEVA (B7).** Decía que a 1440 la sección «sigue sin entrar en
 * una pantalla», con una cuenta que sumaba 920 de los 900 apoyada en **«495 del
 * piso de 55svh del bloque de P5»**. Las dos mitades caducaron: el piso vale
 * **50** (`contenido.ts:184`), no 55; y **B4-A cerró el desborde** bajando la
 * sangría de la tarjeta del diferencial de `--spacing-4` a `--spacing-2`, con lo
 * que la sección pasó de **923,70 a 898,52 px** de alto intrínseco a 1440×900
 * —**1,48 px de aire**, y renderiza sus 900 declarados—. El modelo que lo
 * arbitra vive en `soporte.ts` §8 y publica esa cuenta pieza por pieza,
 * declarando cuál es medida y cuál sale de un token.
 *
 * ═══ B7 · `D-B5.1` — EL CUERPO DE 15 px SOBRE LA PARED ════════════
 *
 * El defecto medido, las tres palancas que no alcanzan, la que sí existe —la
 * POSICIÓN del testimonio, aplicada abajo— y por qué esto NO reabre `D-B5.4`:
 * **todo en `soporte.ts`**, que es donde vive el modelo de esta sección. Va ahí
 * y no acá por la regla de las 300 líneas del repo, y el corte es el mismo que
 * B4-A ya había usado: el componente compone, el soporte mide y publica.
 */

export function PorQueDevelop({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <ContenidoDeSeccion
        className="flex min-h-svh flex-col"
        claseDeContenido="flex flex-1 flex-col justify-between gap-[var(--spacing-4)] pt-[var(--spacing-4)] pb-[var(--spacing-8)]"
      >
        <EncabezadoDeSeccion seccion={seccion} nombre={NOMBRE_DE_SECCION} />

        {/* El `pt` es el despeje de la pastilla, no simetría: la pastilla nace a
            `24px` del tope y mide 48 de alto, así que lo que empiece antes de
            los 72 px queda debajo suyo. El rótulo no lo necesita —vive en la
            columna lateral, a la izquierda de la pastilla— y por eso el despeje
            va acá y no en el `pt` del contenido, donde costaría 64 px más. */}
        <Bloque patron="P1" rango="ventana-visible" className="pt-[var(--spacing-8)]">
          {(progreso) => (
            <Grilla columnas={3} canal="amplio">
              <div className="tablet:col-span-2">
                {/* ⚠ El envoltorio lleva el `id` con el que la `<section>` se
                    nombra (S11, defecto 10): el `h2` sale de `CanalDeTitular`, que no
                    tiene prop `id`, así que el id va en el elemento que lo contiene.
                    El nombre accesible se computa del contenido y el contenido de
                    este `div` es exactamente el titular. Es una caja de bloque más
                    adentro de la columna `flex`: la separación la sigue dando el
                    `gap` del padre y ninguna medida se mueve. */}
                <div id={idDelTitularDeSeccion(seccion.id)}>
                  <CanalDeTitular
                    progreso={progreso}
                    patron="P1"
                    texto={TITULAR}
                    nivel="titulo-xl"
                    como="h2"
                  />
                </div>
              </div>
            </Grilla>
          )}
        </Bloque>

        {/* LA BAJADA — 2 DE 3 DE LA MEDIDA. [medido]
            La medida es la caja del titular: 2 de las 3 columnas, o sea 1232 px
            a 1920 y 912 a 1440. Con esa caja entera la bajada terminaba en
            x 1190 (1920) y x 930 (1440), y ahí el fondo es el logo: peor
            contraste **1,10:1** con 87 píxeles de glifo bajo AA. El borde
            seguro de su banda —la primera columna en la que más del 10 % de la
            banda deja la tinta bajo AA— está en x 915 (1920) y x 676 (1440).
            Una sub-grilla de 3 sobre la medida reproduce EXACTO sus columnas
            —3 columnas más 2 canaletas, dividida en 3 con la misma canaleta— y
            2 de esas 3 dan 816 px (1920) y 602,7 (1440): la bajada termina en
            x 848 y x 634,7, por dentro en los dos anchos. No inventa una
            grilla: usa la que ya está. Es el mismo constructo con el que B1
            arregló el titular del hero. */}
        <Grilla columnas={3} canal="amplio">
          <div className="tablet:col-span-2">
            <Grilla columnas={3} canal="amplio">
              <div className="tablet:col-span-2">
                <Titular nivel="titulo-s" como="p">
                  {ENTRADA}
                </Titular>
              </div>
            </Grilla>
          </div>
        </Grilla>

        {/* El `min-height` va en estilo inline porque el valor viene del DATO y
            lleva unidad: una clase armada como `min-h-[${n}svh]` no la ve el
            escáner de Tailwind y su regla no se emitiría nunca. Es la misma
            excepción que `Panel` declara para el alto de la sección y
            `HuecoDeMedio` para su relación de aspecto, y es la ÚNICA de esta
            carpeta. Su derivación está en `contenido.ts`. */}
        <Bloque
          patron="P5"
          rango="ventana-visible"
          style={{ minHeight: ALTO_MINIMO_DEL_BLOQUE }}
          className="flex flex-col"
        >
          {(progreso) => (
            /* `flex-1` para que la grilla mida los 55svh del bloque: sin un alto
               contra el que repartir, `content-between` no tiene nada que dar y
               la lista se apila arriba, que es de donde salían los 443 px. */
            <Grilla columnas={3} canal="amplio" className="flex-1">
              {/* A escritorio las cuatro tarjetas bajan a UNA columna de las tres
                  —la primera— y se reparten el alto del bloque. Las dos razones
                  están medidas: en dos columnas la segunda caía sobre el logo
                  (peor 1,09:1, 26,69 % de sus píxeles de glifo bajo AA, contra
                  13,08:1 y cero de la primera), y cuatro filas repartidas dan
                  costuras de ~75 px donde dos filas dejaban una sola de 410. */}
              <ul className="grid grid-cols-1 content-between gap-[var(--grilla-canal-amplio)] tablet:col-span-2 tablet:grid-cols-2 escritorio:col-span-1 escritorio:grid-cols-1">
                {DIFERENCIALES.map((diferencial, indice) => (
                  <li key={diferencial.clave}>
                    <CanalDePieza
                      progreso={progreso}
                      patron="P5"
                      cantidad={PIEZAS_DE_P5}
                      indice={indice}
                    >
                      <TarjetaDeDiferencial diferencial={diferencial} />
                    </CanalDePieza>
                  </li>
                ))}
              </ul>
              {/* El testimonio se apoya ABAJO de su columna, y desde B7 arranca
                  en la TERCERA. Las dos mitades son la misma razón —caer donde la
                  escena deja el cuadro limpio— y la segunda es el arreglo de la
                  primera: B1 escribió que el borde seguro de las bandas de abajo
                  es x 1275 a 1920 px de ancho, y con auto-colocación el
                  testimonio caía en la columna 2, o sea x 715..1217 a 1920 y
                  x 513..917 a 1440 — ENTERO del lado malo de su propio número.
                  Medido hoy sobre el fondo, con el mismo instrumento que mide el
                  contraste: en la columna 2 a 1440 la escena pone el logo debajo
                  del texto y cuatro franjas de 40 px caen en 1,10 · 1,97 · 1,10 ·
                  4,22:1; la columna 3, que estaba vacía, no tiene ninguna. El
                  `col-start` no toca el alto: la fila del bloque la fija el `ul`,
                  que es más alto, y las tres columnas son `1fr` iguales — así que
                  el ancla 0,8525 de la escena no se entera. A `tablet` ya caía en
                  la tercera por auto-colocación (el `ul` ocupa dos), y abajo de
                  1025 no hay escena: la variante es de escritorio y nada más. */}
              <CanalDePieza
                progreso={progreso}
                patron="P5"
                cantidad={PIEZAS_DE_P5}
                indice={INDICE_DEL_TESTIMONIO}
                className="escritorio:col-start-3 escritorio:self-end"
              >
                <BloqueDeTestimonio testimonio={TESTIMONIO} />
              </CanalDePieza>
            </Grilla>
          )}
        </Bloque>
      </ContenidoDeSeccion>
    </Seccion>
  )
}

