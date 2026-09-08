/**
 * §1-bis y §7 DEL INVARIANTE DE ACCESIBILIDAD — el censo de marcadores.
 *
 * Salió de `s10-acceso.invariant.ts` cuando el arreglo de B7 lo cruzó las 300
 * líneas del repo, con el mismo corte que ya habían hecho §5 (`-landmarks`), §10
 * (`-contraste`) y §11 (`-tablas`): **una sección del invariante es una función
 * que afirma**, y vive con las demás de su tema.
 *
 * Son dos funciones y no una porque las dos mitades caen en secciones distintas
 * del invariante y ese orden importa: primero se prueba que el detector no está
 * ciego (§1, contra entradas fabricadas), y recién después se le cree lo que
 * dice del documento (§7). Juntarlas invertiría el orden de lectura.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import {
  FORMAS_DEL_CENSO,
  marcadoresAnunciados,
  marcadoresAnunciadosSoloHojas,
  type MarcadorAnunciado,
} from './s10-acceso'
import { imprimirMarcadores, publicar } from './s10-acceso-tablas'
import { MARCADORES } from '../../_secciones/_contrato/marcadores'

/**
 * ⚠️ **EL PUNTO CIEGO DEL CENSO — encontrado por B4-A, arreglado en B7, y con el
 * control que lo demuestra.**
 *
 * El censo de antes se salteaba todo nodo cuyo subárbol tuviera otra etiqueta
 * (`includes('<')`), así que **un nodo con un hijo etiquetado Y texto propio
 * perdía su texto**. Lo destapó el montaje del pie: el censo cayó de 40 a 37 con
 * el texto entero en pantalla. B4-A lo sorteó mudando la continuación del pie a
 * su propia hoja y dejó el detector sin tocar.
 *
 * Las dos formas van juntas porque el arreglo tiene dos maneras de estar mal, y
 * un control solo taparía la otra: contar **cero** (lo que hacía el viejo) y
 * contar **dos** (lo que haría un arreglo que contara por nodo en vez de por
 * dueño del carácter). La vara de las dos es la misma: **exactamente 1**.
 *
 * Y la segunda afirmación de cada par es la que convierte al control en control:
 * corre el censo VIEJO sobre la MISMA entrada. Sin eso, «el detector nuevo
 * cuenta 1» no se distinguiría de «el viejo también contaba 1», y el arreglo no
 * quedaría demostrado por ningún lado.
 */
export function afirmarQueElCensoNoEstaCiego(): void {
  controlPositivo(
    've un marcador en el texto propio de un nodo que ADEMÁS tiene un hijo etiquetado',
    FORMAS_DEL_CENSO.conHijoEtiquetado,
    (h) => marcadoresAnunciados(h).length !== 1,
  )
  afirmarIgual(
    marcadoresAnunciadosSoloHojas(FORMAS_DEL_CENSO.conHijoEtiquetado).length, 0,
    '  y el censo de ANTES devuelve 0 sobre esa misma entrada: el control FALLA con el detector viejo, que es lo que lo hace un control',
  )
  controlPositivo(
    'y NO cuenta dos veces el que vive en una hoja anidada',
    FORMAS_DEL_CENSO.enHojaAnidada,
    (h) => marcadoresAnunciados(h).length !== 1,
  )
  afirmarIgual(
    marcadoresAnunciadosSoloHojas(FORMAS_DEL_CENSO.enHojaAnidada).length, 1,
    '  y ahí el viejo ya acertaba: lo que el punto ciego producía era pérdida, no duplicación',
  )
}

/**
 * §7 — LOS MARCADORES, cómo suena el recorrido.
 *
 * ⚠️ **ERAN 43 Y AHORA SON 40 (V3-D), Y LA BAJA ES LO QUE SE BUSCABA.** Los tres
 * que se fueron son los `[CAPTURA]` de Trabajos: las capturas de los tres sitios
 * llegaron y el hueco dejó de existir. Un marcador menos en este censo es un
 * pedido cerrado —el único sentido en el que este número tiene que bajar—, y por
 * eso se afirma la CIFRA y no un «al menos».
 *
 * ⚠️ **B7 REESCRIBIÓ EL CENSO POR DENTRO Y LA CIFRA NO SE MOVIÓ, y eso es un
 * resultado y no una casualidad que convenga.** El detector pasó de «sólo hojas»
 * a «dueño por carácter» (ver `s10-acceso-anunciado.ts`), o sea que ya no puede
 * perder el texto propio de un nodo con hijos. Sobre el home de HOY las dos
 * versiones dan lo mismo, y eso se afirma en vez de suponerse: **el sorteo de
 * B4-A —poner la continuación del pie en su propia hoja— sigue en pie, así que
 * el marcado actual no tiene ni un caso de la forma que el punto ciego rompía.**
 * Por eso el control positivo va contra una entrada fabricada y no contra el
 * documento: el documento no lo puede probar.
 *
 * La consecuencia práctica es la que importa: si mañana alguien mete un marcador
 * en el texto propio de un nodo con hijos, ANTES desaparecía del censo en
 * silencio y AHORA se cuenta. **La cifra 40 dejó de depender de la forma del
 * marcado.**
 */
export function afirmarElCenso(quieta: string, animada: string): readonly MarcadorAnunciado[] {
  titulo('7 · LOS MARCADORES — cómo suena el recorrido')
  const marcas = marcadoresAnunciados(quieta)
  imprimirMarcadores(marcas)
  afirmarIgual(marcas.length, 40, 'son 40 marcadores ANUNCIADOS en la rama quieta — eran 43 hasta que V3-D cerró las tres capturas')
  afirmarIgual(
    marcadoresAnunciadosSoloHojas(quieta).length, marcas.length,
    '  y el censo de ANTES da hoy la MISMA cifra sobre el home real: el arreglo de B7 no mueve el número, le saca la dependencia de la forma del marcado',
  )
  afirmarIgual(
    marcadoresAnunciados(animada).map((m) => m.marcador).sort(), marcas.map((m) => m.marcador).sort(),
    'y los MISMOS 40 en la animada, marcador por marcador: no falta ninguno',
  )
  afirmarIgual(
    marcas.map((m) => m.marcador).filter((m) => !(MARCADORES as readonly string[]).includes(m)), [],
    'ninguno queda fuera del vocabulario cerrado de `marcadores.ts`',
  )
  afirmar(marcas.every((m) => m.contexto !== ''), 'los 40 caen adentro de una frase anunciada: ninguno vive en un subárbol oculto')
  publicar({
    n: 9, gravedad: 'media', clase: 'decisión',
    dueño: 'el contenido de relleno — `_contrato/marcadores.ts` declara la forma como deliberada',
    que: 'los 43 se LEEN EN VOZ ALTA. Números anuncia cinco veces seguidas «CIFRA · Proyectos entregados / CIFRA · Clientes activos / …» y Trabajos tres «Lo que cambió · MÉTRICA». NO SE ARREGLA: la regla del sprint es que el contenido inventado parezca inventado',
  })
  return marcas
}
