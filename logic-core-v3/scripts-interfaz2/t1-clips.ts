/**
 * SPRINT INTERFAZ 2 · T1 — los clips: el mismo gesto sin la bandera y con ella (`responde=si`), lado a lado.
 *
 *   · `cta-hero`: el puntero entra a «Mirá los trabajos», se queda, pasa a «Hablemos» y se queda;
 *   · `valores`: en Por qué develOP, el puntero sobre un valor de la izquierda y después uno de la derecha;
 *   · `menu-390`: en el teléfono, se abre el menú, se queda y se cierra.
 *
 * Uso: `npx tsx scripts-interfaz2/t1-clips.ts [cta-hero|valores|menu-390]` (sin argumento, los tres).
 */
import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, centroDe, correr, esperar, grabar, hastaLosValores, ladoALado, raton, viajar, type Banco } from './banco'

type Gesto = (b: Banco) => Promise<{ preparar: () => Promise<void>; gesto: () => Promise<void> }>

const GESTOS: Record<string, { ancho: number; alto: number; gesto: Gesto }> = {
  'cta-hero': {
    ancho: 1440,
    alto: 900,
    gesto: async (b) => {
      const reposo: [number, number] = [720, 840]
      return {
        preparar: async () => {
          await raton(b, [700, 860], reposo, 4, 30)
          await esperar(2500)
        },
        gesto: async () => {
          await esperar(600)
          const a = await centroDe(b, '[data-panel="hero"] a[data-pieza="cta"]', 0)
          const h = await centroDe(b, '[data-panel="hero"] a[data-pieza="cta"]', 1)
          if (a === null || h === null) throw new Error('no están los CTA del hero')
          await raton(b, reposo, a, 14, 16)
          await esperar(3200)
          await raton(b, a, h, 12, 16)
          await esperar(3400)
        },
      }
    },
  },
  valores: {
    ancho: 1440,
    alto: 900,
    gesto: async (b) => {
      const arriba: [number, number] = [720, 130]
      return {
        preparar: async () => {
          await raton(b, [700, 400], arriba, 4, 30)
          await viajar(b, 'por-que-develop')
          if (!(await hastaLosValores(b))) throw new Error('los valores no llegaron a verse')
          await esperar(2500)
        },
        gesto: async () => {
          await esperar(600)
          const izq = await centroDe(b, '[data-pieza="valor"]', 0)
          const der = await centroDe(b, '[data-pieza="valor"]', 4)
          if (izq === null || der === null) throw new Error('no están los valores')
          await raton(b, arriba, izq, 14, 16)
          await esperar(3200)
          await raton(b, izq, der, 18, 16)
          await esperar(3400)
        },
      }
    },
  },
  'menu-390': {
    ancho: 390,
    alto: 844,
    gesto: async (b) => ({
      preparar: async () => {
        await esperar(2500)
      },
      gesto: async () => {
        await esperar(700)
        await medir(b.p, `document.querySelector('[data-parte="boton-del-menu"]').click()`)
        await esperar(2200)
        await medir(b.p, `document.querySelector('[data-parte="boton-del-menu"]').click()`)
        await esperar(1600)
      },
    }),
  },
}

correr(async () => {
  const dir = carpeta('t1-escena-responde')
  const pedidos = process.argv[2] === undefined ? Object.keys(GESTOS) : [process.argv[2]]
  for (const nombre of pedidos) {
    const g = GESTOS[nombre]
    const clips: string[] = []
    for (const [pedido, rotulo] of [['producto', 'sin la bandera'], ['producto,responde=si', 'con responde=si']] as const) {
      const b = await abrir(g.ancho, g.alto, { pedido })
      try {
        const { preparar, gesto } = await g.gesto(b)
        await preparar()
        const cuadros = await grabar(b, `${dir}/_cuadros-${nombre}`, gesto, g.ancho >= 1024 ? 1200 : g.ancho)
        const destino = `${dir}/${nombre}-${pedido === 'producto' ? 'sin' : 'con'}.mp4`
        armarClip(`${dir}/_cuadros-${nombre}`, cuadros, destino, `${nombre} - ${rotulo} - ${b.placa.includes('NVIDIA') ? 'NVIDIA' : b.placa}`)
        clips.push(destino)
      } finally {
        await b.cerrar()
      }
    }
    ladoALado(clips[0], clips[1], `${dir}/${nombre}-sin-y-con.mp4`, g.ancho >= 1024 ? 540 : 720)
    console.log(`${nombre}: listo`)
  }
})
