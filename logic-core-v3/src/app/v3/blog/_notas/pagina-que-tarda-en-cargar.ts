import type { Nota } from './tipos'

export const NOTA: Nota = {
  slug: 'por-que-tu-pagina-tarda-en-cargar-y-cuanto-te-cuesta',
  titulo: 'Por qué tu página tarda en cargar y cuánto te cuesta',
  resumen: 'Una página lenta hace que la gente se vaya antes de ver lo que ofrecés. Las causas más comunes y qué se puede hacer para arreglarlas.',
  fecha: '2026-10-14',
  foto: '/v3/blog/por-que-tu-pagina-tarda-en-cargar-y-cuanto-te-cuesta.webp',
  destacado: 'Es una puerta que se cierra antes de que alguien vea lo que ofrecés.',
  introduccion: [
    'Entrás a una página, esperás, no pasa nada, y volvés atrás. Seguro te pasó. Ahora imaginá que le pasa lo mismo a quien quería contratarte o comprarte: se va, y vos ni te enterás.',
    'Una página lenta no es solo una molestia. Es una puerta que se cierra antes de que alguien vea lo que ofrecés. Acá te contamos por qué pasa y qué se puede hacer.',
  ],
  secciones: [
    {
      subtitulo: 'Por qué importa tanto',
      parrafos: [
        'Quien llega a tu página lo hace con una intención: averiguar algo, comprar, contactarte. Si tarda, esa intención se enfría. Muchas personas no esperan: cierran y prueban con otra opción.',
        'Además, la velocidad cuenta para los buscadores. Una página lenta suele posicionarse peor, por lo que te ven menos desde el principio.',
      ],
    },
    {
      subtitulo: 'Las causas más comunes',
      parrafos: [
        'La primera suelen ser las imágenes demasiado pesadas. Una foto sacada con el celular puede ocupar muchos megas, y si se sube tal cual, la página tiene que descargarla entera aunque se muestre en un tamaño chico.',
        'La segunda es el exceso de cosas instaladas: complementos, scripts, animaciones y herramientas que se fueron sumando con los años y que nadie revisó. Cada una agrega peso y trabajo para el navegador.',
        'La tercera es un alojamiento flojo. Si el servidor donde vive la página es lento o está muy cargado, todo tarda, por más cuidada que esté la página.',
        'Y la cuarta es una página construida sin cuidado por dentro: código desordenado, que carga cosas que no necesita o todo junto en lugar de lo necesario primero.',
      ],
    },
    {
      subtitulo: 'Cómo darte cuenta',
      parrafos: [
        'Lo más simple: abrí tu página desde el celular, con datos móviles y no con wifi, y fijate cuánto tarda en mostrarte algo útil. Pedile lo mismo a alguien que no la conozca.',
        'También hay herramientas gratuitas que miden la velocidad y te dicen qué la frena. No hace falta entender todos los detalles: alcanza con ver si la nota es baja y cuáles son las causas principales.',
      ],
    },
    {
      subtitulo: 'Qué se puede hacer',
      parrafos: [
        'Optimizar las imágenes es lo que más rinde: comprimirlas y subirlas en el tamaño y formato adecuados reduce mucho el peso sin que se note a la vista.',
        'Revisar lo instalado y sacar lo que no se usa también ayuda. Muchas veces hay complementos que quedaron olvidados y siguen cargando.',
        'Si el problema es el alojamiento, cambiar a uno mejor puede marcar la diferencia. Y si la página está armada de forma ineficiente por dentro, a veces lo más sensato es reconstruir las partes críticas con una base moderna, pensada para cargar rápido.',
      ],
    },
    {
      subtitulo: 'Cuánto te cuesta no hacerlo',
      parrafos: [
        'Es difícil ponerle un número exacto, y no vamos a inventarlo. Lo que sí podés pensar es en las visitas que llegan y se van sin que lo sepas: personas que ya tenían interés en lo que hacés.',
        'Mejorar la velocidad suele ser una de las inversiones más rentables en una página, porque no cambia lo que ofrecés: simplemente deja de poner obstáculos entre tu cliente y tu negocio.',
      ],
    },
    {
      subtitulo: 'Un ejemplo para pensarlo con tu negocio',
      parrafos: [
        'Imaginá que tenés un local a la calle y que la puerta tarda veinte segundos en abrirse. Algunos clientes esperarían, pero la mayoría seguiría caminando hacia el local de al lado. Con una página lenta pasa lo mismo, solo que no ves a quien se fue.',
        'Por eso conviene mirar la velocidad como parte de la atención al cliente y no como un tema técnico. No cambia lo que ofrecés, pero decide si la persona llega a verlo.',
        'Una buena práctica es revisar la página cada tanto, sobre todo después de sumar fotos, videos o herramientas nuevas. Muchas veces la página arranca rápida y se va volviendo lenta de a poco, con cada cosa que se agrega sin cuidado.',
        'Si la construyen con criterio desde el principio, la velocidad no es un problema que haya que arreglar después: ya viene incluida. Preguntale a quien te la haga cómo se ocupa de eso y qué hace para que cargue rápido también en celulares con conexión lenta.',
        'Un detalle más: no te midas solo desde tu computadora. Tus clientes usan celulares de todo tipo, con señal que a veces es floja. Si tu página anda bien en esas condiciones, anda bien para casi todos.',
      ],
    },
  ],
  cierre: 'Si sospechás que tu página es lenta, escribinos. La revisamos y te contamos qué la frena y cómo arreglarlo.',
}
