/**
 * ¿QUIÉN PINTA NEGRO EN EL CIERRE? — el diagnóstico que destapó el pie.
 *
 *     npx tsx scripts-b8/h-cierre-negro.ts
 *
 * El barrido de B8 midió el Cierre en 18:1 con la sala iluminada a 0,643
 * detrás, y la captura completa (C) salía negra mientras la sala sola (S) y el
 * panel solo sobre la sala (V) salían claras: algo FUERA del cuadro del panel
 * pintaba. En dos posiciones —a mitad del diferencial y en el Cierre— lee, en
 * cuatro puntos del viewport, la pila de `elementsFromPoint` con el fondo
 * computado de cada elemento, más el estado del elemento de la escena (máscara,
 * opacidad, visibilidad) y los fondos de `body` y `html`. La respuesta:
 * `<footer data-pieza="pie">` pinta `rgb(14, 14, 14)` —`var(--color-fondo)`
 * dentro de la invertida— y envuelve la sección entera. Reporte: `B8-LUZ.md` §11.1.
 */
import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { MARCA_DE_INTRO, PERFIL, PUENTE_DE_AUTOMATIZACION, asentarElHome, conLaPagina } from './b8-comun'

const LECTOR = `(() => {
  const puntos = [[720, 300], [100, 150], [1300, 800], [720, 450]]
  const desc = (el) => {
    if (!el) return null
    const cs = getComputedStyle(el)
    return { tag: el.tagName, id: el.id, cls: (el.className || '').toString().slice(0, 90), attrs: [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name + '=' + a.value.slice(0, 20)).join(' '), panel: el.closest('[data-panel]') ? el.closest('[data-panel]').dataset.panel : null, bg: cs.backgroundColor, bgImg: cs.backgroundImage.slice(0, 60), opacity: cs.opacity, z: cs.zIndex, pos: cs.position }
  }
  const pila = (x, y) => document.elementsFromPoint(x, y).slice(0, 7).map(desc)
  const escena = document.querySelector('[data-escena]')
  const cs = escena ? getComputedStyle(escena) : null
  return {
    scrollY: window.scrollY,
    pilas: puntos.map(([x, y]) => ({ x, y, pila: pila(x, y) })),
    escena: cs ? { mask: (cs.maskImage || cs.webkitMaskImage || '').slice(0, 120), opacity: cs.opacity, visibility: cs.visibility, display: cs.display, z: cs.zIndex, inlineMask: (escena.style.maskImage || escena.style.webkitMaskImage || '').slice(0, 120), bg: cs.backgroundColor } : null,
    body: getComputedStyle(document.body).backgroundColor,
    html: getComputedStyle(document.documentElement).backgroundColor,
  }
})()`

async function principal(): Promise<void> {
  const salida = await conLaPagina(
    PERFIL,
    '/v3',
    async (s) => {
      await asentarElHome(s)
      const lecturas: unknown[] = []
      for (const y of [14850, 15300]) {
        await scrollA(s.pagina, y)
        await esperarElPrimerCuadro(s.pagina)
        await new Promise((r) => setTimeout(r, 1500))
        lecturas.push(await medir<unknown>(s.pagina, LECTOR))
      }
      return lecturas
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO] },
  )
  console.log(JSON.stringify(salida, null, 1))
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
