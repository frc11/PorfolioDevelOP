/**
 * [L7e] Un texto legal de prototipo (privacidad), con lo que ESTRUCTURA-PAGINAS permite decir: develOP como nombre comercial, Franco y
 * Valentino como responsables, el mail de contacto y la jurisdicción de Tucumán. Sin CUIT, marca ni contratos. No es el texto final: es
 * el largo y la forma que el índice necesita para probarse.
 */
export interface SeccionLegal {
  readonly id: string
  readonly titulo: string
  readonly parrafos: readonly string[]
}

export const ACTUALIZADO = '30 de octubre de 2026'

export const SECCIONES: readonly SeccionLegal[] = [
  {
    id: 'quienes',
    titulo: 'Quiénes somos',
    parrafos: [
      'develOP es el nombre comercial con el que Franco y Valentino ofrecen desarrollo web, software a medida e integraciones con inteligencia artificial. Ellos son los responsables de los datos que se reciben por este sitio.',
      'Para cualquier consulta sobre esta política podés escribir a contacto@develop.com.ar.',
    ],
  },
  {
    id: 'datos',
    titulo: 'Qué datos recibimos',
    parrafos: [
      'Recibimos sólo lo que vos nos mandás: tu nombre, tu mail o tu teléfono y el mensaje que escribís en los formularios de contacto, del recomendador o de las novedades.',
      'Además, el sitio puede registrar datos técnicos generales de la visita, como el tipo de dispositivo o las páginas vistas, para saber si anda bien.',
    ],
  },
  {
    id: 'para-que',
    titulo: 'Para qué los usamos',
    parrafos: [
      'Para contestarte, para preparar la propuesta que nos pediste y, si te suscribiste, para avisarte cuando sumemos algo nuevo.',
      'No vendemos tus datos ni los usamos para nada que no tenga que ver con lo que nos pediste.',
    ],
  },
  {
    id: 'cuanto',
    titulo: 'Cuánto tiempo los guardamos',
    parrafos: [
      'Los guardamos mientras haga falta para atender tu consulta o mientras sigas suscripto a las novedades. Si nos pedís que los borremos, los borramos.',
    ],
  },
  {
    id: 'derechos',
    titulo: 'Tus derechos',
    parrafos: [
      'Podés pedirnos ver, corregir o borrar los datos que tenemos tuyos, y darte de baja de las novedades cuando quieras, escribiendo a contacto@develop.com.ar.',
    ],
  },
  {
    id: 'jurisdiccion',
    titulo: 'Jurisdicción',
    parrafos: [
      'Esta política se rige por las leyes de la República Argentina. Cualquier diferencia se resuelve ante los tribunales de la provincia de Tucumán.',
      'La vamos a actualizar cuando develOP se formalice como empresa; la fecha de arriba dice cuándo fue el último cambio.',
    ],
  },
]
