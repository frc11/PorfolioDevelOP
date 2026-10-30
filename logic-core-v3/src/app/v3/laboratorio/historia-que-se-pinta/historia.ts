/**
 * [L7e] La historia de develOP, en palabras de Valentino (`docs/cola/2026-10-30/ESTRUCTURA-PAGINAS.md`, «La historia»): el texto tal
 * cual, con la ortografía arreglada y partido en párrafos. Sin agregar ningún hecho. Los tramos `destacado` van en el otro registro.
 */
export interface Tramo {
  readonly texto: string
  readonly destacado?: boolean
}

export const HISTORIA: readonly (readonly Tramo[])[] = [
  [
    { texto: 'Somos dos amigos que nos conocemos de toda la vida.' },
    { texto: 'Fuimos al mismo colegio y decidimos estudiar la misma carrera.' },
    { texto: 'Ya estamos en el último año, con hambre de trabajar y de salir al mundo laboral.' },
  ],
  [
    { texto: 'Queremos emprender con esto: ser dueños de nuestro propio negocio y entregar un trabajo de' },
    { texto: 'calidad excepcional.', destacado: true },
    { texto: 'Somos muy perfeccionistas y trabajadores; no paramos hasta terminar todo.' },
  ],
  [
    { texto: 'Más allá de lo económico, develOP es para nosotros crecimiento personal y una marca que va a guiar nuestras vidas.' },
    { texto: 'Esto no es un proyecto aislado:', destacado: true },
    { texto: 'es nuestra historia, y lo que queremos dejar como nuestra huella.' },
  ],
  [
    { texto: 'Estudiamos en la Universidad Nacional de Tucumán, en la Facultad de Ciencias Exactas, y somos de Yerba Buena.' },
    { texto: 'Queremos ofrecer soluciones tecnológicas a las empresas que las necesiten, acá y en el resto del mundo.' },
    { texto: 'No tenemos límites.', destacado: true },
  ],
]
