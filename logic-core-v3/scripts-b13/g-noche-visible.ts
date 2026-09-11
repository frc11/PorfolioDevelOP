/**
 * G · ¿EL LOGO QUE EMITE SE VE DE VERDAD? — la sala destapada en la noche.
 *
 *     npx tsx scripts-b13/g-noche-visible.ts --perfil=1920
 *
 * ── Por qué hace falta ────────────────────────────────────────────────────
 *
 * `c-escena.ts` mide la ESCENA con todo lo demás oculto, y ahí el logo que
 * emite se ve perfecto. Pero en el pin de Trabajos la tarjeta del proyecto tapa
 * el centro del cuadro, y la caja del logo cae adentro de ella: **medir la
 * escena desnuda no dice si el visitante lo ve.** Acá se barre la ventana de
 * Trabajos y en cada parada se compara la captura COMPUESTA con la de la escena
 * sola: qué fracción de la silueta del logo sobrevive a lo que hay encima.
 *
 * La silueta sale de S (la escena sola, el logo es lo claro sobre la noche) y se
 * la cruza contra C (lo compuesto): un píxel de la silueta «se ve» si en C sigue
 * siendo claro. Es el mismo criterio de `fraccionSobreLaSilueta`, al revés.
 */

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { conLaPagina, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from '../scripts-b8/b8-comun'
import { leerImagen } from '../scripts-b8/glifo-alfa'
import { LECTOR_DE_PANELES } from '../scripts-b8/lectores'
import { ESCENA_NUESTRA, OCULTAR_TODO_MENOS } from '../scripts-b8/ocultar'
import { SALTO_SOBRE_EL_FONDO } from '../scripts-b8/particulas'

import { ORIGEN, argumento, asegurarCarpetas, asentarElHome, escribirJson, perfilDeB13, red } from './b13-comun'

interface Panel {
  readonly id: string
  readonly top: number
  readonly alto: number
}

async function principal(): Promise<void> {
  asegurarCarpetas()
  const perfil = perfilDeB13(argumento('perfil', '1920'))
  const filas = await conLaPagina(
    perfil,
    '/v3',
    async (s) => {
      await asentarElHome(s)
      const paneles = await medir<Panel[]>(s.pagina, LECTOR_DE_PANELES)
      const panel = paneles.find((p) => p.id === 'trabajos')
      if (panel === undefined) throw new Error('no está el panel de Trabajos')
      const salida: unknown[] = []
      const desde = Math.round(panel.top - perfil.alto / 2)
      const hasta = Math.round(panel.top + panel.alto)
      const paso = Math.round(perfil.alto / 2)
      for (let y = desde; y <= hasta; y += paso) {
        await scrollA(s.pagina, y)
        await esperarElPrimerCuadro(s.pagina, 700)
        const real = await medir<number>(s.pagina, 'window.scrollY')
        if (Math.abs(real - y) > 2) throw new Error(`se pidió y=${y} y el scroll quedó en ${real}`)
        const base = `.b13-capturas/noche-${y}`
        await capturar(s.pagina, `${base}-C.png`)
        if (!(await medir<boolean>(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, true)))) throw new Error('la escena no quedó sola')
        await esperarElPrimerCuadro(s.pagina, 500)
        await capturar(s.pagina, `${base}-S.png`)
        if (!(await medir<boolean>(s.pagina, OCULTAR_TODO_MENOS('[]', ESCENA_NUESTRA, false)))) throw new Error('no se restauró lo oculto')

        const S = leerImagen(`${base}-S.png`)
        const C = leerImagen(`${base}-C.png`)
        const total = S.ancho * S.alto
        // La mediana de S: el fondo de la sala en esta parada.
        const bins = new Uint32Array(256)
        const gris = new Float32Array(total)
        for (let i = 0; i < total; i += 1) {
          const k = i * 4
          gris[i] = 0.2126 * S.datos[k] + 0.7152 * S.datos[k + 1] + 0.0722 * S.datos[k + 2]
          bins[Math.round(gris[i])] += 1
        }
        let acumulado = 0
        let mediana = 0
        for (let v = 0; v < 256; v += 1) {
          acumulado += bins[v]
          if (acumulado * 2 >= total) {
            mediana = v
            break
          }
        }
        let silueta = 0
        let sobrevive = 0
        for (let i = 0; i < total; i += 1) {
          if (gris[i] <= mediana + SALTO_SOBRE_EL_FONDO) continue
          silueta += 1
          const k = i * 4
          const gc = 0.2126 * C.datos[k] + 0.7152 * C.datos[k + 1] + 0.0722 * C.datos[k + 2]
          if (Math.abs(gc - gris[i]) <= 8) sobrevive += 1
        }
        const fila = {
          scrollY: y,
          medianaDeLaSala: mediana,
          siluetaClaraPx: silueta,
          visiblePx: sobrevive,
          fraccionVisible: silueta === 0 ? 0 : red((100 * sobrevive) / silueta, 1),
          fraccionDelCuadro: red((100 * silueta) / total, 2),
        }
        salida.push(fila)
        console.log(
          `  y=${String(y).padStart(6)} · mediana ${String(mediana).padStart(3)} · lo claro de la escena ${fila.fraccionDelCuadro.toFixed(2)} % del cuadro · ` +
            `sobrevive a lo compuesto ${fila.fraccionVisible.toFixed(1)} % (${sobrevive} de ${silueta} px)`,
        )
      }
      return salida
    },
    { antesDelPintado: [PUENTE_DE_AUTOMATIZACION, MARCA_DE_INTRO], origen: ORIGEN, perfilDeChrome: `b13-noche-${perfil.id}` },
  )
  console.log(`\nescrito: ${escribirJson(`noche-visible-${perfil.id}`, { perfil: perfil.id, filas })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
