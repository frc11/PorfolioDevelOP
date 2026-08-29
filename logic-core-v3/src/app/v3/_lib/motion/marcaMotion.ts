/**
 * LA MARCA DE LA COREOGRAFÍA — cómo se reconoce su chunk en la salida del build.
 *
 * ⚠ ESTE MÓDULO LO IMPORTA UN SOLO ARCHIVO DE LA APLICACIÓN:
 * `v3/motion/_componentes/Coreografia.tsx`, que es el módulo perezoso que cuelga
 * de la compuerta de 1025. Si además lo importara cualquier módulo que esté en la
 * carga inicial de `/v3/motion`, la marca viajaría con él y
 * `motion-bundle.invariant.ts` reportaría —correctamente— que la compuerta gotea.
 *
 * Es el mismo mecanismo que S1 construyó para el escenario
 * (`_lib/marcaEscenario.ts`), con una marca propia: son dos chunks distintos
 * detrás de la misma compuerta, y hay que poder pesarlos por separado.
 *
 * La marca viaja como valor de un atributo del DOM, o sea que se USA en tiempo de
 * ejecución: ningún minificador la pliega y ningún tree-shaking la poda.
 */
export const MARCA_MOTION = 'v3-motion-coreografia-s2'
