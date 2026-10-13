/**
 * PULIDO 14 — el invariante: npm run test:s65-pulido-14
 *
 * El sprint nocturno, cada cosa con su control positivo (el detector ve el estado de antes). Los recibos medidos, en
 * `docs/rediseno/entregas/pulido-14/`; el log, `docs/rediseno/SPRINT-PULIDO-14.md`.
 *   L2 a · la cámara del pie, UN movimiento: desde que el logo empieza a volcar hasta el golpe no se detiene a mitad de camino ni
 *          salta (su velocidad angular es continua); el desvío del arranque se corrige de a poco hasta los 20° y al golpe es < 1°.
 *   L2 b · el form del pie, con temporizador: el éxito cuenta (una línea) y a los 4 s vuelve solo al form vacío; «Enviar otro
 *          mensaje» sigue antes.
 *   L2 c · los campos del pie no se despegan de la placa: el DOM se enciende con la placa ya en su lugar (lo escrito a mano y el
 *          foco se veían volando aparte) y, al irse del pie, el campo con el foco lo suelta. Lo escrito a mano se conserva.
 *   L1 · Quiénes somos: el cuerpo SIEMPRE delante y entero (se borró el recorte de K1, que lo cortaba al medio). [PULIDO 15] M1 ·
 *        el velo elíptico y el cuerpo a la derecha se borraron: el cuerpo a la izquierda con su halo (s66).
 *   L3 · los destellos de energía. [PULIDO 15] M2 · se borraron con su código (no gustó ninguna): la energía nueva, en s66.
 */
import { existsSync, readFileSync } from 'node:fs'

import { VUELTA_SOLA_MS } from '../../_secciones/cierre/FormularioDelPie'
import { DOM_CON_LA_PIEZA, opacidadDelDom } from '../escena/pie3d/armadas'
import { CAMARA_DE_LA_CAIDA, LOGO_DE_SIEMPRE, RELOJ_DEL_FINAL, acercamiento, alturaDeLaCaida, haciaElAzimutSinElMouse, subida, ventanaDelAcercamiento } from '../escena/final/recorridoDelFinal'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { pasoDeHoy, pasoDeK4, recorrerLaCaida, type PasoDeLaCamara } from './camaraDeLaCaida'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const recibo = <T,>(nombre: string): T => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-14/${nombre}`, 'utf8')) as T

// ═══════════════════════════════════════════════════════════════════════════
titulo('L2 a · La cámara del pie: un solo movimiento')
// El modelo (el cuadro del final, sin navegador): la cámara viva desde la pose E con el mouse en cinco lugares (al centro, a un
// costado y arriba, sólo arriba, sólo abajo, al otro costado y abajo), de a 1/240 s del reloj y de a 1/960. Una detención: la
// velocidad angular debajo de 0,5 °/s después de arrancar (hasta el logo a 85°: después llega arriba con el golpe). Un salto: el
// mayor cambio entre dos pasos no se achica al achicar el paso (una aceleración se achica a un cuarto).
const MOUSES = [{ azimut: 0, altura: 0 }, { azimut: 4, altura: 0.6 }, { azimut: 0, altura: 1.2 }, { azimut: 0, altura: -1.2 }, { azimut: -5, altura: -0.8 }] as const
const unMovimiento = (paso: PasoDeLaCamara): boolean =>
  MOUSES.every((m) => {
    const [r, fino] = [recorrerLaCaida(paso, m, 1 / 240), recorrerLaCaida(paso, m, 1 / 960)]
    return r.arranca > 0 && r.detenidos === 0 && fino.detenidos === 0 && fino.salto < 0.4 * r.salto && r.alGolpe < 1
  })
const HOY = pasoDeHoy({ acercamiento: (f) => acercamiento(f), altura: (f, e) => alturaDeLaCaida(f, LOGO_DE_SIEMPRE, e), haciaElAzimut: haciaElAzimutSinElMouse })
const DE_K4 = pasoDeK4((f, e) => subida(f, LOGO_DE_SIEMPRE, e))
const ejemplo = recorrerLaCaida(HOY, MOUSES[1], 1 / 240)
afirmar(unMovimiento(HOY), `L2 a · el modelo: desde que el logo vuelca hasta el golpe la cámara no se detiene ni salta (5 lugares del mouse); al golpe, ${ejemplo.alGolpe.toFixed(2)}° de frente`)
controlPositivo('L2 a · el detector VE la cámara de PULIDO 13 (se acomodaba, frenaba en seco con el logo en su equilibrio y después lo seguía)', DE_K4, unMovimiento)
// La ventana del acercamiento: del arranque del vuelco al logo a 20°; antes, la cámara quieta (antes de la caída no se mueve).
const v = ventanaDelAcercamiento()
const quietaAntes = (r: ReturnType<typeof recorrerLaCaida>): boolean => r.w.slice(1, Math.floor(v.desde * 240)).every((w) => w < 1e-6)
afirmar(CAMARA_DE_LA_CAIDA.manoGrados === 20 && v.hasta > v.desde && quietaAntes(ejemplo) && acercamiento(v.hasta / RELOJ_DEL_FINAL.duracionS) > 0.999, `  el desvío se corrige de a poco entre el vuelco (${v.desde.toFixed(2)} s) y los 20° (${v.hasta.toFixed(2)} s); antes de la caída, quieta`)
controlPositivo('  el detector VE una cámara que se mueve mientras el logo baja parado', recorrerLaCaida((f, viva, s) => { HOY(f, viva, s); viva.rotateY(f * 0.01) }, MOUSES[1], 1 / 240), quietaAntes)
// El código: el cuadro usa las dos (la viva y la de las piezas, cada una desde su elevación) y el rebobinado recorre lo mismo (todo
// función de `fin`).
const CUADRO = leer('_lib/escena/final/cuadroDelFinal.ts')
const cableado = (c: string): boolean =>
  c.includes('haciaElAzimutSinElMouse(state.camera, CAMARA_SIN_EL_MOUSE, acercamiento(fin, tamano))') && c.includes('camaraDelFinal(state.camera, alturaDeLaCaida(fin, tamano, elevacionDe(state.camera.position)),') &&
  c.includes('const sube = alturaDeLaCaida(fin, tamano, elevacion)') && c.includes('camaraDelFinal(CAMARA_SIN_EL_MOUSE, sube,') && !c.includes('sinElParalaje')
afirmar(cableado(CUADRO), '  el cuadro: la cámara viva y la de las piezas, con el acercamiento y la altura de la caída (funciones de `fin`: el rebobinado hace el mismo camino)')
controlPositivo('  el detector VE el cuadro de antes', CUADRO.replace('haciaElAzimutSinElMouse(state.camera, CAMARA_SIN_EL_MOUSE, acercamiento(fin, tamano))', 'const sinMouse = sinElParalaje(fin, tamano, elevacion)'), cableado)
// Medido (1440, NVIDIA; el mouse a un costado y al centro): desde que el logo vuelca hasta el golpe, ninguna detención; en la duda
// del logo (7,5°–8,5°) la cámara sigue andando; los saltos con el logo a menos de 20°, chicos; al golpe, de frente.
interface CaidaMedida { readonly detencionesEnLaCaida: readonly unknown[]; readonly velocidadEnLaDuda: readonly [number, number] | null; readonly saltoAntesDe20: number; readonly desvioEnElGolpe: number }
const CAMARA = recibo<{ antes: Record<string, CaidaMedida>; despues: Record<string, CaidaMedida> }>('l2-camara.json')
const medidaBien = (r: Record<string, CaidaMedida>): boolean =>
  ['mouse-costado', 'mouse-centro'].every((k) => r[k] !== undefined && r[k].detencionesEnLaCaida.length === 0 && (r[k].velocidadEnLaDuda?.[0] ?? 0) > 0.5 && r[k].saltoAntesDe20 < 5 && r[k].desvioEnElGolpe < 1)
afirmar(medidaBien(CAMARA.despues), `  medido: sin detenciones; en la duda del logo, ${String(CAMARA.despues['mouse-costado'].velocidadEnLaDuda?.[0])}–${String(CAMARA.despues['mouse-costado'].velocidadEnLaDuda?.[1])} °/s (antes ${String(CAMARA.antes['mouse-costado'].velocidadEnLaDuda?.[0])}); al golpe ${String(CAMARA.despues['mouse-costado'].desvioEnElGolpe)}°`)
controlPositivo('  el detector VE la cámara medida de antes (frenaba en seco a los 7,9°)', CAMARA.antes, medidaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('L2 b · El form del pie, con temporizador')
const PIE_TSX = leer('_secciones/cierre/FormularioDelPie.tsx')
const TARJETA = leer('_componentes/formularios/TarjetaDeResultado.tsx')
const temporizador = (p: string, t: string): boolean =>
  VUELTA_SOLA_MS >= 3500 && VUELTA_SOLA_MS <= 4500 && p.includes("if (fase !== 'exito' || !textoListo) return undefined") && p.includes('}, VUELTA_SOLA_MS)') && p.includes("setEstado({ fase: 'quieto' })") &&
  p.includes('alTerminar={() => setTextoListo(true)}') && p.includes("cuentaMs={estado.fase === 'exito' ? VUELTA_SOLA_MS : undefined}") && p.includes('alOtro={otroMensaje}') &&
  t.includes('{exito && cuentaMs !== undefined && (') && t.includes("animate={{ width: listo ? '0%' : '100%' }} transition={{ duration: listo ? cuentaMs / 1000 : 0, ease: 'linear' }}")
afirmar(temporizador(PIE_TSX, TARJETA), `L2 b · el éxito cuenta (una línea que se consume desde que el texto está) y a los ${String(VUELTA_SOLA_MS)} ms vuelve solo al form vacío con el volteo inverso; «Enviar otro mensaje», antes`)
controlPositivo('L2 b · el detector VE el éxito que se quedaba (sin la vuelta sola)', PIE_TSX.replace('}, VUELTA_SOLA_MS)', '}, Number.POSITIVE_INFINITY)'), (p: string) => temporizador(p, TARJETA))
controlPositivo('  y la tarjeta sin su línea', TARJETA.replace('{exito && cuentaMs !== undefined && (', '{false && ('), (t: string) => temporizador(PIE_TSX, t))
// Medido (1440 en volumen y 390 en el DOM; el banco contesta {ok:true} a los 2,5 s): vuelve sola al form vacío a los 4 s de que la
// cuenta arranca; con «Enviar otro mensaje» antes, vuelve ahí; el foco, en el form (no en un campo).
interface Envio { readonly envio: { readonly resultadoMs: number | null; readonly cuentaArrancaMs: number | null; readonly vueltaMs: number | null }; readonly camposDeVuelta: string | null; readonly foco: string }
const TEMPO = recibo<Record<string, Envio>>('l2-temporizador.json')
const vuelveSola = (r: Record<string, Envio>): boolean => {
  const [a, otro, chico] = [r['1440'], r['1440-otro'], r['390']]
  const tarda = (e: Envio): number => (e.envio.vueltaMs ?? Number.POSITIVE_INFINITY) - (e.envio.cuentaArrancaMs ?? 0)
  return a !== undefined && Math.abs(tarda(a) - VUELTA_SOLA_MS) < 250 && a.camposDeVuelta === '||' && a.foco === 'contacto' && otro !== undefined && tarda(otro) < VUELTA_SOLA_MS - 800 && chico !== undefined && chico.envio.vueltaMs !== null && chico.camposDeVuelta === '||'
}
afirmar(vuelveSola(TEMPO), `  medido: a 1440 vuelve sola ${String((TEMPO['1440'].envio.vueltaMs ?? 0) - (TEMPO['1440'].envio.cuentaArrancaMs ?? 0))} ms después de que la cuenta arranca, al form vacío; «Enviar otro mensaje», antes; a 390 también`)
controlPositivo('  el detector VE el éxito que se quedaba (sin vuelta)', { ...TEMPO, '1440': { ...TEMPO['1440'], envio: { ...TEMPO['1440'].envio, vueltaMs: null } } }, vuelveSola)

// ═══════════════════════════════════════════════════════════════════════════
titulo('L2 c · Los campos del pie, con su placa')
// La causa: el DOM va donde la pieza va a quedar y la placa llega volando (o se va): lo que el DOM muestra (lo escrito, el foco) se
// veía aparte. El DOM se enciende en el último tramo de la llegada; en su lugar no se toca (el volteo maneja el suyo).
const rampa = (f: (l: number) => string): boolean =>
  f(1) === '' && f(0.9995) === '' && f(0) === '0' && f(DOM_CON_LA_PIEZA.desde) === '0' && Number(f(0.95)) > 0.4 && Number(f(0.95)) < 0.6 && [0.2, 0.5, 0.92, 0.96, 0.99].every((l, i, a) => i === 0 || Number(f(l)) >= Number(f(a[i - 1])))
afirmar(rampa(opacidadDelDom), `L2 c · la causa: el DOM de la pieza, apagado mientras la placa vuela y encendido desde ${String(DOM_CON_LA_PIEZA.desde)} de su llegada`)
controlPositivo('L2 c · el detector VE el DOM de antes (siempre a la vista)', () => '', rampa)
const ARMADAS = leer('_lib/escena/pie3d/armadas.ts')
const conLaPlaca = (a: string, p: string): boolean =>
  a.includes('const opacidad = opacidadDelDom(e, final)') && a.includes('if (a.transformacion === null) {') && a.includes('a.pieza.elemento.style.opacity = opacidad') &&
  p.includes('if (e !== undefined && !e.isIntersecting && activo instanceof HTMLElement && el.contains(activo)) activo.blur()')
afirmar(conLaPlaca(ARMADAS, PIE_TSX), '  la llegada lo escribe (sin pisar el volteo) y, al irse del pie, el campo con el foco lo suelta')
controlPositivo('  el detector VE el foco que se quedaba', PIE_TSX.replace('activo.blur()', 'void activo'), (p: string) => conLaPlaca(ARMADAS, p))
// Medido (1440: al fondo, el caso; se va dos pantallas y vuelve): los cuadros con el DOM de un campo a la vista mientras la placa
// todavía vuela. Antes, todo el vuelo (77 y 84 cuadros, con la placa en 0); ahora, sólo en el último tramo de la llegada.
interface Caso { readonly despegados: number; readonly ejemplo: readonly (readonly number[])[]; readonly foco: string; readonly valores: readonly string[] }
const CAMPOS = recibo<{ antes: Record<string, Caso>; despues: Record<string, Caso> }>('l2-campos.json')
const pegados = (r: Record<string, Caso>): boolean =>
  ['mano', 'foco', 'auto'].every((k) => r[k] !== undefined && r[k].ejemplo.every((f) => f[1] >= DOM_CON_LA_PIEZA.desde)) &&
  r.mano.valores[0] === 'Ana Prueba' && r.foco.valores[0] === 'Ana Prueba' && r.foco.foco !== 'contacto-nombre' && r.auto.valores.every((v) => v === '')
afirmar(pegados(CAMPOS.despues), `  medido, los tres casos: el DOM sólo con la placa en el último tramo (antes ${String(CAMPOS.antes.mano.despegados)} y ${String(CAMPOS.antes.foco.despegados)} cuadros volando aparte); lo escrito a mano queda; el foco se soltó al irse; lo autocompletado, vacío`)
controlPositivo('  el detector VE los campos de antes (despegados con la placa en 0, el foco que se quedaba)', CAMPOS.antes, pegados)

// ═══════════════════════════════════════════════════════════════════════════
titulo('L1 · Quiénes somos: el texto siempre delante y legible')
// El recorte de K1 se fue con su código: el cuerpo no se recorta (ni su módulo, ni el gancho del banco que medía su rayo).
const QUIENES = leer('_secciones/quienes-somos/QuienesSomos.tsx')
const ACOMPANANTES = leer('_lib/escena/titulos3d/acompanantes.ts')
const SILUETA = leer('_lib/escena/SiluetaDelBanco.tsx')
const sinRecorte = (q: string, a: string, si: string): boolean =>
  q.includes('<div ref={enElPlano} data-halo-del-cuerpo="">') && !q.includes('data-detras-del-logo') && !/clipPath|recorteDetrasDelLogo|DETRAS_DEL_LOGO/.test(a) &&
  !si.includes('__delanteDelLogoDelBanco') && !existsSync(`${V3}/_lib/escena/titulos3d/detrasDelLogo.ts`)
afirmar(sinRecorte(QUIENES, ACOMPANANTES, SILUETA), 'L1 · el cuerpo no se recorta: el recorte de K1 (y su módulo) se borró ([PULIDO 15] M1 · el cuerpo pide su halo)')
controlPositivo('L1 · el detector VE el recorte de antes', ACOMPANANTES.replace('if (css === ac.css) continue', 'el.style.clipPath = recorteDetrasDelLogo()\n    if (css === ac.css) continue'), (a: string) => sinRecorte(QUIENES, a, SILUETA))
// [PULIDO 15] M1 · el velo elíptico, la composición a la derecha y `?cuerpo=izquierda` se borraron con su código: el cuerpo va a
// la izquierda con un halo corto pegado a las letras (s66). Las mediciones de L1 quedan en su recibo (`l1-cuerpo.json`).

// [PULIDO 15] M2 · los destellos (`?destellos=`, `?destellos-color=`) se borraron con su código (no gustó ninguna): los reemplaza
// la energía nueva, plasma + cargas (`?energia=plasma`, s66). Sus mediciones quedan en su recibo (`l3-destellos.json`).

cerrar('s65-pulido-14')
