/**
 * [PULIDO 19] Q4.2 (2) · LA ANISOTROPÍA de las texturas finas que se miran de canto (la trama del moiré en la cúpula y el zócalo, las
 * siluetas de las copias de la formación): se piden 16 y three las acota al máximo de la placa al subir la textura (`WebGLTextures`:
 * `min( texture.anisotropy, capabilities.getMaxAnisotropy() )`; 16 en casi todas las placas). Eran 4 (ESCENA 2): con 4, las líneas
 * de la trama en ángulo rasante (el horizonte de la cúpula, el pie del zócalo) se emborronan a gris antes de lo necesario; con el
 * máximo, el filtro toma hasta 16 muestras a lo largo del rasante y la línea sigue siendo línea más lejos. Lo paga la GPU en los
 * texels rasantes nada más; en la NVIDIA no asoma (VERIFICAR TRAS REINICIO con el banco del sitio).
 */
export const ANISOTROPIA_DE_LAS_TRAMAS = 16
