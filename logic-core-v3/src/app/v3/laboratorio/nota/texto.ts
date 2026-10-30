/**
 * [L7e] El texto de prototipo de la primera nota del blog. Genérico: sin cifras, sin estudios, sin clientes; sólo lo que develOP ya dice
 * en el home (que la página trabaja de vidriera, que se maneja desde el panel). Lo reescribe la IA y lo moldea Valentino (ESTRUCTURA).
 */
export type BloqueDeLaNota =
  | { readonly tipo: 'parrafo'; readonly texto: string }
  | { readonly tipo: 'subtitulo'; readonly texto: string }
  | { readonly tipo: 'destacado'; readonly texto: string }

export const NOTA = {
  numero: '01',
  titulo: '¿Necesito página web o me alcanza con Instagram?',
  bajada: 'Qué te da cada una, qué no, y cómo saber cuál le sirve hoy a tu negocio.',
  bloques: [
    { tipo: 'parrafo', texto: 'Si tu negocio ya tiene Instagram y te escriben por ahí, la pregunta es lógica: ¿para qué sumar una página? La respuesta corta es que hacen cosas distintas, y que muchas veces conviene tener las dos.' },
    { tipo: 'subtitulo', texto: 'Lo que Instagram hace bien' },
    { tipo: 'parrafo', texto: 'Instagram es una vidriera que se mueve: mostrás lo nuevo, contás el día a día y la gente que ya te sigue se entera. Es rápido, es gratis y está donde tus clientes pasan el rato.' },
    { tipo: 'parrafo', texto: 'Pero la vidriera no es tuya. El orden de lo que se ve lo decide la aplicación, lo viejo se pierde para abajo y quien no te sigue difícilmente te encuentre buscando lo que vendés.' },
    { tipo: 'subtitulo', texto: 'Lo que una página hace distinto' },
    { tipo: 'parrafo', texto: 'Una página es tu lugar: vos decidís qué se ve primero, cómo se ordena tu catálogo y qué tiene que hacer alguien para escribirte. Cuando alguien busca lo que vendés en Google, la página es lo que puede aparecer.' },
    { tipo: 'destacado', texto: 'Instagram te muestra a los que ya te conocen. Una página te muestra a los que te están buscando.' },
    { tipo: 'parrafo', texto: 'Y no tiene por qué ser algo que te dé trabajo: si la manejás desde un panel, cambiás precios, fotos y textos vos, sin depender de nadie.' },
    { tipo: 'subtitulo', texto: 'Cómo saber qué te conviene hoy' },
    { tipo: 'parrafo', texto: 'Si vendés poco catálogo y todo pasa por mensajes con gente que ya te conoce, Instagram puede alcanzarte por ahora. Si querés que te encuentren personas nuevas, que tu catálogo esté ordenado o que tu negocio se vea más profesional, ahí la página empieza a hacer la diferencia.' },
    { tipo: 'parrafo', texto: 'Lo mejor suele ser usarlas juntas: Instagram para mostrar el movimiento y la página para que quien llega encuentre todo en un solo lugar.' },
  ] satisfies readonly BloqueDeLaNota[],
} as const
