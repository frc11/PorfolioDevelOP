/**
 * J · LAS CIFRAS EN PANTALLA — las cuatro de Números, compuestas y sin el panel.
 *
 *     npx tsx scripts-b13/j-cifras.ts --perfil=1920
 *     npx tsx scripts-b13/j-cifras.ts --perfil=1920 --llave=apagada
 *
 * ── Qué mide ──────────────────────────────────────────────────────────────
 *
 * Por cada una de las cuatro pantallas declaradas de la sección: la captura
 * COMPUESTA, la caja de cada cifra y de cada rótulo leídas del DOM, y **cuánto
 * de la pantalla ocupa la composición contra cuánto queda de sala** — que es la
 * forma medible de *«integradas, con la escena visible entre ellas»*.
 *
 * ⚠️ **Y con la llave APAGADA también.** `[CIFRA]` es más largo que `23`: la
 * composición tiene que aguantar los dos. Con `--llave=apagada` el instrumento
 * reemplaza el texto de cada marcador por una cifra corta **en el DOM y sólo
 * para medir** —no toca el contenido ni la llave— y vuelve a medir las cajas.
 * Es el mismo truco de `APAGAR_LA_TINTA` de `scripts-b8/lectores.ts`: se altera
 * la página, se mide, y se restaura antes de la captura siguiente.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { conLaPagina, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b8/b8-comun'
import { LECTOR_DE_PANELES } from '../scripts-b8/lectores'

import { ORIGEN, argumento, asegurarCarpetas, asentarElHome, escribirJson, perfilDeB13, red } from './b13-comun'

interface Panel {
  readonly id: string
  readonly top: number
  readonly alto: number
}

interface Caja {
  readonly clave: string
  readonly valor: string
  readonly rotulo: string
  readonly nivelPx: number
  readonly rotuloPx: number
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly marcaAncho: number
  readonly marcaAlto: number
  readonly desborda: boolean
  readonly pantalla: string
}

/** Lee las cinco cifras del DOM: su caja, su tamaño y el de su rótulo. */
const LECTOR_DE_CIFRAS = `[...document.querySelectorAll('[data-cifra]')].map((el) => {
  const r = el.getBoundingClientRect()
  const valor = el.firstElementChild
  const rotulo = el.lastElementChild
  const caja = el.closest('[data-pantalla]')
  return {
    clave: el.dataset.cifra,
    valor: (valor && valor.textContent || '').trim(),
    rotulo: (rotulo && rotulo.textContent || '').trim(),
    nivelPx: valor ? parseFloat(getComputedStyle(valor).fontSize) : 0,
    rotuloPx: rotulo ? parseFloat(getComputedStyle(rotulo).fontSize) : 0,
    x: r.x, y: r.y + window.scrollY, ancho: r.width, alto: r.height,
    marcaAncho: valor ? valor.getBoundingClientRect().width : 0,
    marcaAlto: valor ? valor.getBoundingClientRect().height : 0,
    desborda: valor ? valor.getBoundingClientRect().width > r.width + 0.5 : false,
    pantalla: caja ? (caja.dataset.pantalla || '') : '',
  }
})`

/**
 * Pone el MARCADOR (`[CIFRA]`) donde la llave prendida puso la mentira, sólo en
 * el DOM y sólo para medir. Es la llave APAGADA simulada: `inventado.ts` declara
 * `pedido: '[CIFRA]'` y `mentira: '23'` para las cinco casillas de esta sección,
 * así que reemplazar el texto por el marcador reproduce exactamente lo que se
 * vería con `CONTENIDO_INVENTADO = false`. **`[CIFRA]` es MÁS LARGO que `23`**:
 * ésa es la pregunta que §3 de la instrucción manda contestar.
 */
const CON_MARCADORES = (poner: boolean): string => `(() => {
  // ⚠ Sólo la CIFRA, no su rótulo: \`Micro\` también emite \`data-nivel\`, así que
  // un selector de descendiente le cambiaría el texto a los dos.
  const nodos = [...document.querySelectorAll('[data-cifra]')].map((p) => p.firstElementChild).filter(Boolean)
  nodos.forEach((n) => {
    if (poner_) {
      if (n.dataset.textoOriginal === undefined) n.dataset.textoOriginal = n.textContent
      n.textContent = '[CIFRA]'
    } else if (n.dataset.textoOriginal !== undefined) {
      n.textContent = n.dataset.textoOriginal
      delete n.dataset.textoOriginal
    }
  })
  return nodos.length
})()`.replace(/poner_/g, String(poner))

async function principal(): Promise<void> {
  asegurarCarpetas()
  const perfil = perfilDeB13(argumento('perfil', '1920'))
  const llave = argumento('llave', 'prendida')
  const etiqueta = `cifras-${llave}-${perfil.id}`
  const salida = await conLaPagina(
    perfil,
    '/v3',
    async (s) => {
      await asentarElHome(s)
      const paneles = await medir<Panel[]>(s.pagina, LECTOR_DE_PANELES)
      const panel = paneles.find((p) => p.id === 'numeros')
      if (panel === undefined) throw new Error('no está el panel de Números')
      if (llave === 'apagada') {
        const n = await medir<number>(s.pagina, CON_MARCADORES(true))
        if (n === 0) throw new Error('no se encontró ninguna cifra para reemplazar por su marcador')
        console.log(`  (llave APAGADA simulada: ${n} nodos con \`[CIFRA]\` en vez de la mentira)`)
      }
      const cajas = await medir<Caja[]>(s.pagina, LECTOR_DE_CIFRAS)
      const pantallas: unknown[] = []
      const cuantas = Math.max(1, Math.round(panel.alto / perfil.alto))
      for (let k = 0; k < cuantas; k += 1) {
        const y = Math.round(panel.top + k * perfil.alto)
        await scrollA(s.pagina, y)
        await esperarElPrimerCuadro(s.pagina, 700)
        const real = await medir<number>(s.pagina, 'window.scrollY')
        if (Math.abs(real - y) > 2) throw new Error(`se pidió y=${y} y el scroll quedó en ${real}`)
        await capturar(s.pagina, `.b13-capturas/${etiqueta}-p${k + 1}.png`)
        const enPantalla = cajas.filter((c) => c.y + c.alto > y && c.y < y + perfil.alto)
        const area = enPantalla.reduce((n, c) => n + c.ancho * c.alto, 0)
        const fila = {
          pantalla: k + 1,
          scrollY: y,
          cifras: enPantalla.map((c) => ({
            clave: c.clave,
            valor: c.valor,
            rotulo: c.rotulo,
            nivelPx: red(c.nivelPx, 1),
            rotuloPx: red(c.rotuloPx, 1),
            razon: red(c.nivelPx / Math.max(1, c.rotuloPx), 2),
            x: red(c.x, 1),
            anchoPx: red(c.ancho, 1),
            altoPx: red(c.alto, 1),
            marcaAnchoPx: red(c.marcaAncho, 1),
            desborda: c.desborda,
          })),
          areaDeLasCifrasPct: red((100 * area) / (perfil.ancho * perfil.alto), 2),
        }
        pantallas.push(fila)
        console.log(
          `  pantalla ${k + 1} (y=${y}) · ${enPantalla.length} cifras · ocupan ${fila.areaDeLasCifrasPct} % del cuadro · ` +
            enPantalla.map((c) => `${c.clave} «${c.valor}» ${red(c.nivelPx, 0)}px/${red(c.rotuloPx, 0)}px · marca ${Math.round(c.marcaAncho)} de celda ${Math.round(c.ancho)}${c.desborda ? ' ⚠️ DESBORDA' : ''}`).join(' · '),
        )
      }
      if (llave === 'apagada') await medir(s.pagina, CON_MARCADORES(false))
      const niveles = [...new Set(cajas.map((c) => red(c.nivelPx, 1)))].sort((a, b) => a - b)
      const razones = [...new Set(cajas.map((c) => red(c.nivelPx / Math.max(1, c.rotuloPx), 2)))].sort((a, b) => a - b)
      console.log(
        `\n  TAMAÑOS de las cifras: ${niveles.map((n) => `${n}px`).join(' · ')} — ${niveles.length} distintos, razón ${red(niveles[niveles.length - 1] / niveles[0], 2)}:1 entre la mayor y la menor` +
          `\n  RAZÓN cifra/rótulo: ${razones.map((r) => `${r}:1`).join(' · ')} (la referencia usa 4,67:1 en las siete)`,
      )
      return { perfil: perfil.id, llave, panel, niveles, razones, pantallas }
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], origen: ORIGEN, perfilDeChrome: `b13-cifras-${perfil.id}` },
  )
  console.log(`\nescrito: ${escribirJson(etiqueta, salida)}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
