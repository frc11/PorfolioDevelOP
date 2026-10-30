import type { TextoLegal } from '../_componentes/pagina/PaginaLegal'
import { MAIL_LEGAL } from '../privacidad/contenido'

/**
 * [L7d · 1] TÉRMINOS DE USO — texto genérico: develOP como nombre comercial, Franco y Valentino como responsables, jurisdicción de Tucumán,
 * Argentina. Sin CUIT, marca registrada ni contratos: todavía no existen. Se actualiza cuando se formalice la empresa.
 *
 * ⚠️ TIENE QUE REVISARLO UN ABOGADO O UNA ABOGADA ANTES DEL LANZAMIENTO.
 */
export const TEXTO_DE_TERMINOS: TextoLegal = {
  titulo: 'Términos',
  bajada: 'Las reglas simples para usar este sitio y lo que podés esperar de nosotros.',
  actualizacion: '30 de octubre de 2026',
  secciones: [
    {
      id: 'quienes-somos',
      titulo: 'Quiénes somos',
      parrafos: ['develOP es el nombre comercial con el que Franco y Valentino ofrecemos sitios web, integraciones con inteligencia artificial, automatizaciones y software a medida desde Tucumán, Argentina. Estos términos se aplican al uso de este sitio.'],
    },
    {
      id: 'uso-del-sitio',
      titulo: 'Uso del sitio',
      parrafos: ['Podés navegar el sitio, usar los formularios y el chat para consultarnos y, si sos cliente, ingresar a tu panel. Te pedimos usarlo de buena fe: sin intentar dañarlo, acceder a lo que no te corresponde ni enviar información falsa o de terceros sin permiso.'],
    },
    {
      id: 'contenido',
      titulo: 'Contenido y propiedad intelectual',
      parrafos: ['Los textos, diseños, imágenes, código y demás contenidos de este sitio son de develOP o se usan con permiso. Las demos y los trabajos del portfolio son ejemplos de lo que hacemos; los sitios de nuestros clientes pertenecen a sus dueños. No podés copiar ni reutilizar nuestros contenidos sin avisarnos antes.'],
    },
    {
      id: 'servicios',
      titulo: 'Servicios y propuestas',
      parrafos: ['La información del sitio es orientativa. El alcance, los plazos y el precio de cada trabajo se conversan con vos y se dejan por escrito en una propuesta antes de empezar. Los precios «desde» que ves en el sitio son de referencia.'],
    },
    {
      id: 'cuentas',
      titulo: 'Cuentas y panel',
      parrafos: ['Si tenés una cuenta, cuidá tu contraseña y avisanos si creés que alguien más accedió. Sos responsable de lo que se haga desde tu cuenta.'],
    },
    {
      id: 'terceros',
      titulo: 'Enlaces y sitios de terceros',
      parrafos: ['El sitio enlaza a páginas que no son nuestras, como los sitios de nuestros clientes o las redes sociales. No controlamos su contenido ni sus políticas, y te recomendamos leerlas.'],
    },
    {
      id: 'responsabilidad',
      titulo: 'Limitación de responsabilidad',
      parrafos: ['Hacemos lo posible para que el sitio funcione bien y la información sea correcta, pero puede haber errores o interrupciones. En la medida que la ley lo permita, no somos responsables por daños derivados del uso del sitio o de no poder acceder a él.'],
    },
    {
      id: 'privacidad',
      titulo: 'Privacidad',
      parrafos: ['Cómo usamos tus datos está explicado en nuestra página de Privacidad.'],
    },
    {
      id: 'cambios',
      titulo: 'Cambios en estos términos',
      parrafos: ['Podemos actualizar estos términos. Cuando lo hagamos, cambiamos la fecha de arriba.'],
    },
    {
      id: 'ley-aplicable',
      titulo: 'Ley aplicable y jurisdicción',
      parrafos: ['Estos términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto, intervienen los tribunales ordinarios de la provincia de Tucumán, Argentina.'],
    },
    {
      id: 'contacto',
      titulo: 'Contacto',
      parrafos: [`Si tenés preguntas sobre estos términos, escribinos a ${MAIL_LEGAL}.`],
    },
  ],
}
