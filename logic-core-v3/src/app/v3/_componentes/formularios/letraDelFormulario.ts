/**
 * [C2-90v] LA LETRA GRANDE DE LOS CAMPOS — la de «la tuya» del Portfolio (C2 · 40) y la del contacto del recomendador de Servicios (C2-51):
 * el tamaño de la bajada del Portfolio (`titulo-s`; abajo de 1024, el de `cuerpo`), sin su interlineado de párrafo. Vivía en
 * `trabajos/portfolio/tipografia.ts`; es común porque la usan dos secciones (ninguna importa de la carpeta de otra).
 */

import { NIVELES_TIPOGRAFICOS } from '../../_lib/tipografia'

/** Los rótulos, los ejemplos y la letra de los campos (va en `claseDelTexto` de `Campos.tsx`). */
export const CLASE_DEL_TEXTO_DEL_FORMULARIO = [NIVELES_TIPOGRAFICOS['titulo-s'].claseFija, 'max-escritorio:text-[length:var(--text-cuerpo)]'].join(' ')
