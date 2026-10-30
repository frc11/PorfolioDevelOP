import type { TextoLegal } from '../_componentes/pagina/PaginaLegal'

/**
 * [L7d · 1] POLÍTICA DE PRIVACIDAD — texto genérico, armado con lo que el sitio recolecta hoy (los formularios de contacto y de novedades, el
 * chat, el ingreso a la cuenta, el almacenamiento del navegador y el monitoreo de errores). develOP como nombre comercial; Franco y Valentino como
 * responsables. Sin CUIT, marca registrada ni contratos: todavía no existen. Se actualiza cuando se formalice la empresa.
 *
 * ⚠️ TIENE QUE REVISARLO UN ABOGADO O UNA ABOGADA ANTES DEL LANZAMIENTO. Describe lo que el sitio hace y menciona la Ley 25.326 de forma general;
 * no afirma obligaciones ni registros que no verificamos.
 */
export const MAIL_LEGAL = 'contacto@develop.com.ar'

export const TEXTO_DE_PRIVACIDAD: TextoLegal = {
  titulo: 'Privacidad',
  bajada: 'Qué datos tuyos usamos, para qué y cómo podés pedirnos verlos, corregirlos o borrarlos.',
  actualizacion: '30 de octubre de 2026',
  secciones: [
    {
      id: 'quienes-somos',
      titulo: 'Quiénes somos',
      parrafos: [
        'develOP es el nombre comercial con el que Franco y Valentino ofrecemos sitios web, integraciones con inteligencia artificial, automatizaciones y software a medida. Somos de Tucumán, Argentina, y somos los responsables de los datos que nos dejás en este sitio.',
        `Para cualquier consulta sobre esta política podés escribirnos a ${MAIL_LEGAL}.`,
      ],
    },
    {
      id: 'que-datos',
      titulo: 'Qué datos recolectamos',
      parrafos: ['Solo recolectamos lo que nos das o lo que el sitio necesita para funcionar:'],
      lista: [
        'Formularios de contacto (en el pie, en el panel de contacto y en el recomendador de servicios): tu nombre, tu email o teléfono, tu empresa, los servicios que te interesan, el presupuesto que tenés en mente y el mensaje que escribas.',
        'Formulario de novedades: tu email.',
        'Chat del sitio: los mensajes que escribís y las respuestas que recibís.',
        'Cuenta de cliente (ingreso): tu email y los datos de tu cuenta y de tu proyecto, para que puedas usar tu panel.',
        'Datos técnicos mínimos: informes de errores del sitio, que pueden incluir el tipo de navegador y de dispositivo, para poder corregirlos.',
      ],
    },
    {
      id: 'para-que',
      titulo: 'Para qué los usamos',
      parrafos: ['Usamos tus datos para responderte, armar propuestas, darte acceso a tu panel y trabajar en tu proyecto, para enviarte las novedades que pediste, y para mejorar el sitio y corregir errores. No vendemos tus datos ni los usamos para otra cosa que lo que te contamos acá.'],
    },
    {
      id: 'con-quien',
      titulo: 'Con quién los compartimos',
      parrafos: ['Para que el sitio funcione usamos proveedores técnicos, por ejemplo de alojamiento, base de datos, envío de correos y monitoreo de errores. Esos proveedores acceden a los datos solo para prestarnos su servicio. Fuera de eso, no compartimos tus datos con terceros, salvo que una norma o una autoridad competente nos lo exija.'],
    },
    {
      id: 'cuanto-tiempo',
      titulo: 'Cuánto tiempo los guardamos',
      parrafos: ['Guardamos tus datos el tiempo necesario para responderte y para trabajar juntos. Si ya no son necesarios, o si nos pedís que los borremos, los eliminamos o los anonimizamos, salvo que tengamos que conservarlos por una obligación legal.'],
    },
    {
      id: 'cookies',
      titulo: 'Cookies y almacenamiento del navegador',
      parrafos: [
        'El sitio usa el almacenamiento de tu navegador para cosas simples, como recordar que ya viste la introducción durante la visita o mantener el estado del chat. Si ingresás a tu cuenta, usamos una cookie de sesión para reconocerte.',
        'No usamos cookies de publicidad. Podés borrar estos datos desde la configuración de tu navegador; el sitio sigue funcionando.',
      ],
    },
    {
      id: 'tus-derechos',
      titulo: 'Tus derechos',
      parrafos: [
        'De acuerdo con la Ley 25.326 de Protección de los Datos Personales de la República Argentina, podés pedirnos acceder a tus datos, corregirlos, actualizarlos o eliminarlos.',
        `Para hacerlo, escribinos a ${MAIL_LEGAL} desde el email que nos dejaste y contanos qué querés pedir. Te respondemos lo antes posible.`,
      ],
    },
    {
      id: 'seguridad',
      titulo: 'Seguridad',
      parrafos: ['Cuidamos tus datos con medidas técnicas razonables, como conexiones cifradas y accesos con usuario y contraseña. Ningún sistema es infalible, pero trabajamos para proteger lo que nos confiás.'],
    },
    {
      id: 'cambios',
      titulo: 'Cambios en esta política',
      parrafos: ['Cuando cambie algo importante, actualizamos esta página y la fecha de arriba. Esta política se va a actualizar cuando formalicemos la empresa.'],
    },
  ],
}
