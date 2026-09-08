/**
 * LAS DEUDAS DECLARADAS DE B8 — una sola lista, con número y con cierre.
 *
 * B8 saca el velo, abre seis de las ocho secciones sobre la sala y pone la
 * noche en Trabajos. Eso ROMPE contraste a propósito, y la regla del bloque es
 * que ninguna afirmación se afloja ni se borra: la que falla corre con su
 * condición intacta como `deudaDeclarada()` (`afirmar.ts`), cuenta aparte y
 * el agregado la publica. Acá viven los números y los cierres, para que dos
 * instrumentos que miden la misma deuda —el modelo de CPU de `s8-tinta` (el
 * peor píxel del cuadro SIN el logo) y la captura real de `s10-acceso` (el peor
 * píxel bajo cada glifo, logo incluido)— la nombren igual.
 *
 * Cada entrada dice QUÉ está roto y en qué bloque se cierra. El cómo no se
 * decide acá: se anota la salida más barata que se midió, no una promesa.
 * Las cifras están en `docs/rediseno/outputs/B8-LUZ.md` §6.
 */

export interface DeudaDeclarada {
  readonly numero: string
  readonly que: string
  readonly cierre: string
}

export const DEUDAS_DE_B8 = {
  numeros: {
    numero: 'D-B8.1',
    que: 'Números — el logo queda detrás del titular y de las cifras (10 de 13 bloques bajo AA en la captura, peor 1,00:1) y su última pantalla cae adentro del atardecer: la sala se apaga con la sección todavía en cuadro y la tinta oscura pierde AA',
    cierre: 'B9 (el bloque siguiente): mover el texto de donde está el logo y correr el atardecer al pie de Números, o mover el texto de esa pantalla — se mide, no se elige acá',
  },
  trabajos: {
    numero: 'D-B8.2',
    que: 'Trabajos — tinta clara sobre la sala: asoma con la sala todavía a pleno sol (modelo) y en la noche las partículas que brillan quedan debajo de los glifos (captura: 3 de 9 bloques bajo AA, peor 2,53:1)',
    cierre: 'B9 (el bloque siguiente): arrancar el atardecer una fracción de pantalla antes de que Trabajos asome, y decidir si las partículas se apartan del texto o el texto se aparta de ellas — se mide, no se elige acá',
  },
  diferencial: {
    numero: 'D-B8.3',
    que: 'Por qué develOP — dos mitades: asoma (p=0,7411) con el amanecer a nivel 0,504 y la tinta oscura no llega a AA hasta p=0,816, mientras el panel entra (modelo); y donde llena el cuadro (el ancla, 0,8525, a 0,643) el logo queda detrás del titular: 5 de 7 bajo AA, peor 1,11:1 (captura; B6-A ya medía 6 de 7)',
    cierre: 'B9 (el bloque siguiente): mover el titular de donde está el logo, que es lo que la captura ve. La salida barata para la entrada —terminar el amanecer en 0,643 antes de la reanudación— está medida y NO aplicada en B8-LUZ.md §6.4: acorta la entrada bajo AA de 0,075 a 0,028 de progreso, no toca la captura, y esconde el amanecer entero. La decide el humano con el número',
  },
  cierre: {
    numero: 'D-B8.4',
    que: 'Cierre — queda como está (PARADA 2 de B8): el pie pinta #0E0E0E, tapa la sala y da 0 de 25 bajo AA (peor 6,44). Las cuatro variantes, medidas sobre la sala a 0,643 con el pie sin relleno: oscuro-transparente de verdad 25 de 25 bajo AA (peor 1,00), papel-transparente 13 de 25 (peor 1,01), papel-opaco 0 de 25 (peor 4,83). En las dos que abren, el peor es 1,00–1,01 por EL LOGO detrás del texto, no por la luz: abrir el Cierre es un problema de acomodar el texto, no de superficie',
    cierre: 'B9 (el bloque siguiente), junto con las otras cinco: el texto se acomoda donde el logo no queda detrás, y recién ahí se decide qué superficie lleva el pie — no antes',
  },
  hero: {
    numero: 'D-B8.5',
    que: 'Hero — el logo queda detrás de «piloto automático.» y del cuerpo (captura: 3 de 7 bloques bajo AA, peor 2,94:1). No es de B8: B6-A ya lo medía (2–4 de 7) y la cita de S9 (9,73:1) era el modelo sin el logo',
    cierre: 'B9 (el bloque siguiente): el texto se mueve de donde está el logo — el humano fijó el orden: primero la luz, después la información',
  },
  quienesSomos: {
    numero: 'D-B8.6',
    que: 'Quiénes somos — el logo queda detrás del cuerpo y del rótulo (captura: 14 de 17 bloques bajo AA, peor 1,00:1). B6-A lo había medido (12 de 17) y por eso no la abría; B8 la abre por decisión',
    cierre: 'B9 (el bloque siguiente): el texto se mueve de donde está el logo',
  },
} as const satisfies Record<string, DeudaDeclarada>

export const LISTA_DE_DEUDAS_DE_B8: readonly DeudaDeclarada[] = Object.values(DEUDAS_DE_B8)
