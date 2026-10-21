import { registrarInventos } from '../_secciones/_contrato/inventado'

/**
 * [B12a.8] EL RELLENO DE LA PÁGINA BASE — detrás de la llave (P-H23, `registrarInventos`): con la llave prendida, un texto que se lee
 * como relleno y tiene el largo del real; apagada, su marcador. La página de un servicio pone su texto en el mismo lugar.
 */
export const RELLENO_DE_LA_BASE = registrarInventos('pagina-base', {
  bajada: {
    marcador: '[TEXTO]',
    pedido: '[TEXTO]',
    mentira: 'Texto de relleno de la bajada: una o dos frases que dicen qué hace este servicio y para quién, del largo de la real.',
  },
  deQueSeTrata: {
    marcador: '[TEXTO]',
    pedido: '[TEXTO]',
    mentira: 'Texto de relleno de «de qué se trata»: dos o tres renglones sobre la escena, entre el título y el papel, que cuentan lo que la página va a mostrar.',
  },
  progresivo: {
    marcador: '[TEXTO]',
    pedido: '[TEXTO]',
    mentira: 'Texto de relleno de una sección que entra con el scroll: el bloque sube y aparece a la par de la rueda, y vuelve si se sube.',
  },
  gatillo: {
    marcador: '[TEXTO]',
    pedido: '[TEXTO]',
    mentira: 'Texto de relleno de una sección que entra entera al cruzar la línea de disparo, con la corrida corta del home, y se va en espejo al subir.',
  },
  cierre: {
    marcador: '[TEXTO]',
    pedido: '[TEXTO]',
    mentira: 'Texto de relleno del cierre: una frase que invita a escribir, del largo de la real.',
  },
})
