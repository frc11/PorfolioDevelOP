/**
 * CIERRE DEL RETOQUE 3D — el invariante: npm run test:s42-cierre-retoque
 *
 * Una sección por ticket, con sus controles positivos (cada detector ve el defecto que vigila):
 *   D6 · el túnel lento se borró (código y bandera); la tabla medida de heatbureau sigue igual.
 *   P1 · el polvo en facetas (la variante b) pasó al producto; la a y la c se borraron, con su bandera.
 *   B2 · una muesca levanta el polvo posado en toda la página: también después del último nudo (el progreso en 1).
 *   B3 · el encendido del haz: en los intentos parpadea la luz entera (la columna y el charco), no el cono de polvo solo.
 *   B4 · «Y más…» y el newsletter entran ni bien asoman y se van recién cuando están por salir, bien abajo.
 *   B6 · la frase de Por qué develOP («Seis razones / para elegirnos») sin salida, como Portfolio.
 *   D4 · las fotos del equipo sin el marco 3D: vuelven a como estaban antes del RETOQUE 3D (la llegada en curva y el hover).
 *   N1 · «Contacto» (la esquina de la barra y el menú del teléfono) abre el panel de contacto de SPRINT CONTACTO, sin
 *        WhatsApp (el envío arma un mail); lo demás que lleva a contacto sigue viajando al pie.
 *   D1 · todo el 3D fijo en el mundo: los títulos que van con la página se colocan con la cámara SIN el mouse, y los
 *        bloques de CSS 3D giran al revés de lo que el mouse le suma (se les ve la perspectiva y los costados).
 *   D2 · el hero, fijo después de armarse (sin salida): con D1 se le ven los costados.
 *   D5 · el pie: cada enlace, campo y botón es un bloque sólido que flota (CSS 3D, el elemento de verdad en su cara de
 *        adelante); ya no una sala alrededor del logo. Abajo de 1025 y con movimiento reducido, plano.
 *   D3 · el título de Demos en volumen, con el gesto de «El equipo» (se levanta y se acuesta al volver).
 *   S1 · el clic de la barra y el de los CTA son el mismo, el pestillo; los demás candidatos de clic se borraron.
 *   S2 · el ambiente: tres generativos (Web Audio en tiempo real, sin archivo), espaciados y al azar en su escala; los
 *        bucles de antes se borraron. Siguen las reglas: apagado por defecto, nada antes de una acción, sin él con
 *        movimiento reducido.
 * Lo que se mira en vivo: `~/.cache/b4-medicion/retoque-3d/cierre/` (el `mirar.txt` y el `LEEME.txt`).
 */
import { existsSync, readFileSync } from 'node:fs'

import { CAPAS_DEL_TUNEL } from '../../_secciones/trabajos/tunel'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../escena/entorno'
import { FACETAS_DEL_POLVO, FACETAS_VERTEX_GLSL } from '../escena/polvo/facetas'
import { FIRME, GUION, repartoDelEncendido } from '../escena/entorno/encendido'
import { DISPARO_DEL_REMATE, margenDelDisparo } from '../../_secciones/tu-panel/entrada'
import { EXAGERACION_DEL_CSS, giroDeLaPieza } from '../escena/miradaDeLaCamara'
import { renderToStaticMarkup } from 'react-dom/server'
import { ConEspesor } from '../../_componentes/volumen/ConEspesor'
import { BloqueSolido } from '../../_componentes/volumen/BloqueSolido'
import { TEXTO_DE_DEMOS } from '../../_secciones/trabajos/demos/catalogo'
import datosDeLaChivo from '../../_fuentes/chivo-400-titulos.json'
import { SONIDOS } from '../sonido/catalogo'
import { BRUMA } from '../sonido/ambienteGenerativo'
import { CORTES_DEL_SPRITE } from '../sonido/sprite'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8')
const sinComentarios = (s: string): string => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('D6 · El túnel lento, borrado')

afirmarIgual(CAPAS_DEL_TUNEL, { escenario: { de: 1, a: 1.3, arranca: 199, topa: 1420 }, proyectos: [{ de: 0, a: 0.9, arranca: 810, topa: 1720 }, { de: 0, a: 1.2, arranca: 1303, topa: 1983 }, { de: 0, a: 1.05, arranca: 1636, topa: 2236 }], cta: { de: 0, a: 0.4, arranca: 1873, topa: 2290 } }, 'la tabla medida de heatbureau, la de siempre')
const sinLento = (fuentes: string): boolean => !/LENTO|lento|pruebas\.tunel/.test(fuentes)
const delTunel = ['_secciones/trabajos/Trabajos.tsx', '_secciones/trabajos/ritmo.ts'].map((r) => sinComentarios(leer(r))).join('\n')
afirmar(sinLento(delTunel) && !('tunel' in PRUEBAS_APAGADAS) && !('tunel' in entornoPedido('producto,tunel=lento').pruebas), 'ni el estiramiento ni la clase ni la bandera: `?pruebas=tunel=lento` no pide nada')
controlPositivo('el detector VE el túnel lento', `${delTunel}\nconst lento = useTunelLento()`, sinLento)

// ═══════════════════════════════════════════════════════════════════════════
titulo('P1 · El polvo en facetas, al producto')

const parche = sinComentarios(leer('_lib/escena/polvo/parche.ts'))
const enElProducto = (c: string): boolean => /campo === 'polvo' && e\.nitidez && e\.facetas \? '#define POLVO_FACETAS' : ''/.test(c)
afirmar(ENTORNO.facetas && !BASE_LIMPIA.facetas && !entornoPedido('producto,facetas=no').facetas && enElProducto(parche), 'la variante b es el polvo del producto (con el nítido); el banco la apaga con `facetas=no` (queda el perfil nítido de antes)')
controlPositivo('el detector VE la variante con bandera', parche.replace("e.facetas ? '#define POLVO_FACETAS'", "e.pruebas.polvo === 'b' ? '#define POLVO_FACETAS'"), enElProducto)
afirmar(FACETAS_DEL_POLVO.quedan === 0.6 && FACETAS_DEL_POLVO.tam[0] === 2.4 && FACETAS_DEL_POLVO.tam[1] === 4.4, '  la b tal cual se aprobó: el 60 % de las motas, de 2,4 a 4,4 px, cada una girando a su ritmo')
const soloAspecto = (glsl: string): boolean => !/transformed\s*=/.test(glsl) && /vParejo \*=/.test(glsl) && /gl_PointSize = /.test(glsl)
afirmar(soloAspecto(FACETAS_VERTEX_GLSL), '  cambia cuántas se ven, su tamaño, su brillo y su forma, nunca su lugar: la física aprobada anda igual')
controlPositivo('el detector VE una variante que mueve las motas', `${FACETAS_VERTEX_GLSL}\ntransformed = vec3( 0.0 );`, soloAspecto)
afirmar(!existsSync(`${V3}/_lib/escena/polvo/variantes.ts`) && !('polvo' in PRUEBAS_APAGADAS) && !/POLVO_VARIANTE|VARIANTE_/.test(parche), '  la a y la c se borraron, con la bandera `polvo=`: no queda ninguna prueba')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · Una muesca levanta el polvo, en toda la página')

const fisica = sinComentarios(leer('_lib/escena/polvo/Fisica.tsx'))
const atadura = sinComentarios(leer('_lib/escena/ataduraAlScroll.ts'))
const despiertaConLaPagina = (c: string): boolean => /const scroll = \(!Number\.isNaN\(m\.progreso\) && Math\.abs\(progreso - m\.progreso\) > 1e-6\) \|\| pagina !== m\.pagina/.test(c)
afirmar(despiertaConLaPagina(fisica) && /const alDesplazar = \(\): void => \{\s*avisarQueSeMovioLaPagina\(\)/.test(atadura), 'el despertar es cualquier scroll de la página, no sólo el del recorrido: después del último nudo (el pie) el progreso queda en 1 y una muesca no lo despertaba', 'medido al final de la página: una muesca, 13.987 posadas → 13.889 levantadas en 2 s')
controlPositivo('el detector VE el despertar sólo por el progreso', fisica.replace(' || pagina !== m.pagina', ''), despiertaConLaPagina)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B3 · El encendido: parpadea la luz entera, no el embudo de polvo')

const intentos = GUION.slice(0, -1).map(([, , k]) => k)
const luzEntera = (reparto: typeof repartoDelEncendido): boolean =>
  intentos.every((k) => reparto(k).luz > k && reparto(k).cono < 1 && reparto(k).motas < k) && reparto(0).cono === 0 && [FIRME, 2.4].every((k) => reparto(k).luz === k && reparto(k).cono === 1 && reparto(k).motas === k)
afirmar(luzEntera(repartoDelEncendido), 'en los intentos la lámpara (columna y charco) pesa más y el cono de polvo y las motas menos; apagado, el cono no existe; prendido, igual que antes', intentos.map((k) => `k ${k.toFixed(2)}: luz ${repartoDelEncendido(k).luz.toFixed(2)}, cono ${repartoDelEncendido(k).cono.toFixed(2)}, motas ${repartoDelEncendido(k).motas.toFixed(2)}`).join(' · '))
controlPositivo('el detector VE el reparto de antes (todo con k)', ((k: number) => ({ luz: k, cono: 1, motas: k })) as typeof repartoDelEncendido, luzEntera)
const polvoVivo = sinComentarios(leer('_lib/escena/entorno/polvoVivo.ts'))
const entornoTsx = sinComentarios(leer('_lib/escena/entorno/Entorno.tsx'))
afirmar(/vEnElHaz = uHaz \* uConoDelHaz \* uNocheDelLogo \* \(/.test(polvoVivo) && /VIVO\.uConoDelHaz\.value = reparto\.cono/.test(entornoTsx) && /nivel\.noche\[0\] \* reparto\.luz, nivel\.noche\[1\] \* reparto\.luz, nivel\.noche\[2\] \* k/.test(entornoTsx), '  el polvo del cono (el que dibujaba el embudo: pesa 0,30 contra 0,05 de la columna) crece y pesa con el encendido, ya no con el haz apagado')

// ═══════════════════════════════════════════════════════════════════════════
titulo('B4 · «Y más…»: entra ni bien asoma, se va bien abajo')

const bienAbajo = (desdeAbajo: number): boolean => desdeAbajo > 0 && desdeAbajo <= 8
afirmar(bienAbajo(DISPARO_DEL_REMATE) && margenDelDisparo(DISPARO_DEL_REMATE) === `0% 0% -${String(DISPARO_DEL_REMATE)}% 0%`, `la línea de disparo del remate a ${String(DISPARO_DEL_REMATE)} % del cuadro desde abajo: la misma línea para entrar (ni bien asoma) y para irse subiendo (cuando está por salir)`)
controlPositivo('el detector VE la línea de antes (35 %: se iba en la mitad de abajo)', 35, bienAbajo)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B6 · La frase de Por qué develOP, sin salida')

const porQue = sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))
// [RONDA 2] F2: la frase vuelve a irse con la levantada, función del scroll (s43 · F2).
// [PULIDO 2] 5 · sin bandera `relevada` es falsa (con `?cta=`, salvo `capas`, la frase la toma la transformación).
const sinSalida = (c: string): boolean => /<TituloDeVolumen [^>]*salida=\{volumen\.salida\}[^>]*llegadaDe="por-que-develop" \/>/.test(c) && (c.match(/salida: relevada \? null : levantada/g) ?? []).length === 2
afirmar(sinSalida(porQue), 'las dos mitades se van con la levantada otra vez (sin `queda`), con la llegada y la salida función del scroll')
controlPositivo('el detector VE la frase que se queda', porQue.replace(/salida: relevada \? null : levantada, /g, ''), sinSalida)

// ═══════════════════════════════════════════════════════════════════════════
titulo('D4 · Las fotos del equipo, como antes')

const equipo = sinComentarios(leer('_secciones/quienes-somos/equipo.tsx'))
const comoAntes = (c: string): boolean => /<LlegadaEnCurva\s+progreso=\{perseguido\}\s+sentido=\{aLaDerecha \? 'desde-la-derecha' : 'desde-la-izquierda'\}/.test(c) && !/FotoEnVolumen/.test(c) && (c.match(/<MarcoDeDosTomas/g) ?? []).length === 2
afirmar(comoAntes(equipo) && !existsSync(`${V3}/_secciones/quienes-somos/fotoEnVolumen.tsx`), 'los retratos llegan en curva como antes del RETOQUE 3D y la foto del equipo con su bloque; el marco 3D se borró; el hover desde el punto (`MarcoDeDosTomas`) sigue')
controlPositivo('el detector VE el marco 3D', `${equipo}\n<FotoEnVolumen progreso={progreso} lado="derecha">`, comoAntes)

// ═══════════════════════════════════════════════════════════════════════════
titulo('N1 · «Contacto» abre el panel de contacto')

const contactoTsx = sinComentarios(leer('_chrome/contacto/Contacto.tsx'))
const apertura = sinComentarios(leer('_chrome/contacto/apertura.ts'))
const barra = sinComentarios(leer('_chrome/barra/BarraDelHome.tsx'))
const abreElPanel = (c: string, a: string, b: string): boolean => /return <FormularioDeContacto \/>/.test(c) && /=== ABRE_EL_PANEL\) abrirContacto\(/.test(a) && /addEventListener\('click', alTocar, \{ capture: true \}\)/.test(a) && /href=\{ENLACE_DE_CONTACTO\.destino\}\s*data-abre-contacto=\{ABRE_EL_PANEL\}/.test(b)
afirmar(abreElPanel(contactoTsx, apertura, barra), 'el panel (la hoja de SPRINT CONTACTO) vuelve a montarse; el Contacto de la esquina lo abre (en la captura: antes que el viaje, que deja pasar lo ya atendido) y el del menú del teléfono también, al cerrarse el menú')
controlPositivo('el detector VE el Contacto que viaja al pie', [contactoTsx, apertura, barra.replace(' data-abre-contacto={ABRE_EL_PANEL}', '')], ([c, a, b]: string[]) => abreElPanel(c, a, b))
const delPanel = ['_chrome/contacto/contenido.ts', '_chrome/contacto/enviarContacto.ts', '_chrome/contacto/FormularioDeContacto.tsx'].map((r) => sinComentarios(leer(r))).join('\n')
// [RONDA 2] F1: el panel envía al endpoint propio (no arma un mail); WhatsApp, fuera del formulario.
afirmar(!/whatsapp|wa\.me|WHATSAPP/i.test(delPanel) && /enviarAlServidor/.test(delPanel) && !/mailto:\$\{MAIL\}\?subject=/.test(delPanel), '  sin WhatsApp en el panel; el envío va al endpoint propio (`/api/contacto`) y dice «enviado» sólo con la respuesta')

// ═══════════════════════════════════════════════════════════════════════════
titulo('D1 · Todo el 3D fijo en el mundo')

const orbita = sinComentarios(leer('_lib/escena/OrbitRig.tsx'))
const titulosDeLaEscena = sinComentarios((leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx') + leer('_lib/escena/titulos3d/armado.ts')))
const fijosEnElMundo = (o: string, t: string): boolean =>
  /sinElMouse\.angleDeg = angleDeg \+ giroDeLaVista\s*sinElMouse\.height = height\s*angleDeg \+= desplazamiento\.angleDeg \+ giroDeLaVista/.test(o) &&
  /posarLaCamaraSinElMouse\(state\.camera, sinElMouse,/.test(o) &&
  /publicarLaMirada\(desplazamiento\.angleDeg,/.test(o) &&
  /Math\.min\(delta, 0\.1\), CAMARA_SIN_EL_MOUSE\)/.test(t)
afirmar(fijosEnElMundo(orbita, titulosDeLaEscena), 'los títulos que van con la página (el hero, «El equipo», las demos) se colocan con la cámara SIN el mouse; Portfolio y la frase ya estaban fijos (su cámara de lectura): el paralaje les deja ver la perspectiva y los costados')
controlPositivo('el detector VE los títulos pegados a la cámara viva', [orbita, titulosDeLaEscena.replace('Math.min(delta, 0.1), CAMARA_SIN_EL_MOUSE)', 'Math.min(delta, 0.1), camara)')], ([o, t]: string[]) => fijosEnElMundo(o, t))
const alReves = (f: typeof giroDeLaPieza): boolean => f({ giro: 10, inclinacion: 4 }) === `rotateX(${(4 * EXAGERACION_DEL_CSS).toFixed(3)}deg) rotateY(${(-10 * EXAGERACION_DEL_CSS).toFixed(3)}deg)` && f({ giro: 0, inclinacion: 0 }) === 'rotateX(0.000deg) rotateY(0.000deg)'
afirmar(alReves(giroDeLaPieza), '  los bloques de CSS 3D giran AL REVÉS de la cámara (la cámara se corre a la derecha: se ve su costado derecho; sube: su cara de arriba); quieto el mouse, de frente')
controlPositivo('el detector VE el bloque que acompaña a la cámara', ((m: { giro: number; inclinacion: number }) => `rotateX(${(-m.inclinacion).toFixed(3)}deg) rotateY(${m.giro.toFixed(3)}deg)`) as typeof giroDeLaPieza, alReves)
const valor = sinComentarios(leer('_secciones/por-que-develop/valorEnVolumen.tsx'))
afirmar(/useGiroDeLaMirada\(mirada\)/.test(valor) && /<div ref=\{mirada\} className="transform-3d">/.test(valor) && /espesor \/>/.test(sinComentarios(leer('_secciones/por-que-develop/PorQueDevelop.tsx'))), '  los valores giran con la mirada y su ícono y su título tienen espesor (se les ven los costados)')
const espesor = renderToStaticMarkup(<ConEspesor copia={<p>copia</p>}><h3>titulo</h3></ConEspesor>)
const capasMudas = (h: string): boolean => (h.match(/<h3/g) ?? []).length === 1 && (h.match(/aria-hidden="true"[^>]*data-parte="espesor"|data-parte="espesor"[^>]*aria-hidden="true"/g) ?? []).length === (h.match(/data-parte="espesor"/g) ?? []).length && (h.match(/data-parte="espesor"/g) ?? []).length > 0
afirmar(capasMudas(espesor), '  las capas del espesor son `aria-hidden` y sin encabezados: el lector y el índice ven una sola vez el título')
controlPositivo('el detector VE una capa que se anuncia', espesor.replace('aria-hidden="true" ', ''), capasMudas)

// ═══════════════════════════════════════════════════════════════════════════
titulo('D2 · El hero, fijo después de armarse')

const hero = sinComentarios(leer('_secciones/hero/Hero.tsx'))
afirmar(/gesto: 'azar', llegada: null, queda: true, rearma: false/.test(hero) && /colocacion: 'pantalla'/.test(sinComentarios(leer('_componentes/titulos3d/useTextoDeVolumen.ts'))), 'el titular del hero llega una vez por carga y se queda (sin salida); va con la página con la cámara sin el mouse (D1): se le ven los costados')

// ═══════════════════════════════════════════════════════════════════════════
titulo('D5 · El pie: bloques sólidos que flotan')

const delPie = ['_secciones/cierre/FormularioDelPie.tsx', '_secciones/cierre/PiezasDeContacto.tsx', '_secciones/cierre/ColumnasDelPie.tsx'].map((r) => sinComentarios(leer(r))).join('\n')
const cuantos = (c: string, re: RegExp): number => (c.match(re) ?? []).length
// [RONDA 2] F1: los campos van en un `map` y volvió WhatsApp; el aviso y su mail se fueron. F5: los campos, en ranura; Enviar, la principal.
const todoEsUnBloque = (c: string): boolean => cuantos(c, /<BloqueSolido/g) >= 6 && /<BloqueSolido forma="ranura" className="block w-full">\s*\{k === 'mensaje' \? \(/.test(c) && /<BloqueSolido forma="principal" className="self-start[^"]*">\s*<button type="submit"/.test(c) && /<BloqueSolido>\s*<a\s+href=\{WHATSAPP\.href\}/.test(c) && /<BloqueSolido>\s*<EnlaceDelPieConIcono/.test(c)
afirmar(todoEsUnBloque(delPie), 'cada enlace (el mail, WhatsApp, el recorrido, las redes), cada campo (nombre, mail, mensaje) y el botón son un bloque sólido, con el elemento de verdad adentro (se enfoca, se escribe)')
controlPositivo('el detector VE un campo sin su bloque', delPie.replace('<BloqueSolido forma="ranura" className="block w-full">', '<div>'), todoEsUnBloque)
const cierreTsx = sinComentarios(leer('_secciones/cierre/Cierre.tsx'))
afirmar(!/PlanoDelPie/.test(cierreTsx) && !existsSync(`${V3}/_secciones/cierre/planoDelPie.tsx`), '  ya no es una sala alrededor del logo: las paredes y el piso se borraron')
const quieto = renderToStaticMarkup(<BloqueSolido><a href="#x">x</a></BloqueSolido>)
const plano = (h: string): boolean => !/data-parte="(canto|tapa)"/.test(h) && !/transform:|perspective/.test(h) && /<a href="#x">x<\/a>/.test(h)
afirmar(plano(quieto), '  en el servidor (y abajo de 1025, y con movimiento reducido) el bloque es plano: ni cantos ni tapa ni transformadas; el elemento, tal cual')
controlPositivo('el detector VE un bloque con sus cantos', quieto.replace('<a href', '<span data-parte="canto" style="transform:rotateX(90deg)"></span><a href'), plano)
const solido = sinComentarios(leer('_componentes/volumen/BloqueSolido.tsx'))
// [RONDA 2] F5: la pose de su lugar más el paralaje. [RETOQUE DEL PIE] P2: desde 1025 la pieza es de WebGL (s44); el bloque de CSS 3D, con `pie=antes`.
afirmar(/if \(modo === 'antes'\) return <BloqueDeAntes/.test(solido) && /useGiroDeLaMirada\(giro, !reducido\)/.test(solido) && (solido.match(/aria-hidden="true"/g) ?? []).length === 2, '  el bloque de CSS 3D de antes (tapa y cantos `aria-hidden`, gira al revés de la cámara) queda para `?pruebas=pie=antes`')

// ═══════════════════════════════════════════════════════════════════════════
titulo('D3 · El título de Demos, en volumen')

const textoDeDemos = sinComentarios(leer('_secciones/trabajos/demos/TextoDeDemos.tsx'))
// [EL ENCASTRE] 1B · lo que D3 afirmaba («Demos para abrir acá mismo», dos renglones que se levantan) cambió por pedido:
// sólo «Demos», en volumen, con el tamaño y la llegada de Portfolio (las letras desde la profundidad, con su mínimo).
const comoPortfolio = (c: string): boolean =>
  /const \{ lugar, listo \} = useTextoDeVolumen<HTMLSpanElement>\(\{ id: 'demos', texto: TEXTO_DE_DEMOS\.titulo, fuente: 'chivo-400', gesto: 'letras', llegada: progreso, queda: false, minimoS: LENTOS\.llegadaDePortfolioS \}\)/.test(c) &&
  /<Titular nivel="display-xl" como="h3" className=\{CLASE_DEL_TITULAR_DEL_CARTEL\}>/.test(c)
afirmar(comoPortfolio(textoDeDemos) && TEXTO_DE_DEMOS.titulo === 'Demos', '«Demos» (EL ENCASTRE 1B): en volumen, con el nivel y las clases del titular de Portfolio y su llegada (las letras desde la profundidad, girando, en no menos de su mínimo); al volver se va igual')
controlPositivo('el detector VE el título de D3 (se levantaba de acostado, como «El equipo»)', textoDeDemos.replace("gesto: 'letras'", "gesto: 'levanta'"), comoPortfolio)
const glifos = new Set(Object.keys((datosDeLaChivo as { glyphs: Record<string, unknown> }).glyphs))
const faltan = [...TEXTO_DE_DEMOS.titulo].filter((ch) => ch !== ' ' && !glifos.has(ch))
afirmar(faltan.length === 0, '  cada letra está en la Chivo 400 de los títulos', faltan.join(''))
afirmar(/\{TEXTO_DE_DEMOS\.titulo\}/.test(textoDeDemos), '  y el lector anuncia el título entero: el DOM lo sigue teniendo (las dos ramas, el mismo texto)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('S1 · El clic de la barra y de los CTA: el pestillo')

const enElSprite = Object.keys(CORTES_DEL_SPRITE)
const unSoloClic = (claves: readonly string[]): boolean => claves.includes('pestillo') && !claves.some((k) => /^(barra|cta)-/.test(k))
afirmar(unSoloClic(enElSprite) && unSoloClic(Object.keys(SONIDOS)), 'el pestillo (el candidato d) es el clic de la barra y el de los CTA; los otros siete candidatos se borraron del sprite y del catálogo', enElSprite.join(', '))
controlPositivo('el detector VE un candidato que quedó', [...enElSprite, 'cta-a'], unSoloClic)
const controlDelSonido = sinComentarios(leer('_chrome/sonido/ControlDelSonido.tsx'))
afirmar(/if \(blanco\.closest\(DE_LA_BARRA\) !== null \|\| blanco\.closest\(DE_LOS_CTA\) !== null\) sonar\('pestillo'\)/.test(controlDelSonido) && /if \(cta !== null && cta !== ctaSenalado\) sonar\('tic'\)/.test(controlDelSonido), '  el clic de la barra y el de los CTA suenan el pestillo (el de siempre para lo demás); el hover de los CTA, el tic de la barra')
const finales = (c: typeof SONIDOS): boolean => c.tic.volumen === 0.1 && c.foto.volumen === 0.1 && c.abre.volumen === 0.1 && c.cierra.volumen === 0.1 && c.pulso.volumen === 1 && c.encendido.volumen === 0.2
afirmar(finales(SONIDOS), '  los volúmenes finales de siempre: el tic 0,1; el roce 0,1; abrir y cerrar 0,1; el pulso 1; el encendido 0,2')

// ═══════════════════════════════════════════════════════════════════════════
titulo('S2 · El ambiente, generativo')

const generativo = sinComentarios(leer('_lib/sonido/ambienteGenerativo.ts'))
const sinBucle = (c: string): boolean => /createOscillator\(\)/.test(c) && /window\.setTimeout\(/.test(c) && /Math\.random\(\)/.test(c) && !/loop\s*[:=]\s*true|\.loop\b|new Howl/.test(c)
afirmar(sinBucle(generativo) && !existsSync('public/v3/sonido/ambiente-a.webm') && !existsSync('public/v3/sonido/ambiente-a.m4a'), 'sin archivo ni bucle: Web Audio en tiempo real, eventos sueltos programados al azar (los tres bucles de antes se borraron, código y archivos)')
controlPositivo('el detector VE un bucle', `${generativo}\nconst b = new Howl({ src: [], loop: true })`, sinBucle)
const espaciado = [BRUMA].every((c) => c.huecoS[0] >= 3 && c.silencio.probabilidad > 0 && c.silencio.s[0] >= 15 && c.escala.length >= 7)
afirmar(espaciado, '  tranquilo y espaciado: al menos 3 s entre eventos, silencios largos (15 s o más) de vez en cuando y notas al azar en una escala de siete o más: nunca se repite igual')
// [RONDA 2] F6: queda Bruma sola, al 0,5 (los tres para elegir pasaron a uno): s43 · F6.
const motorDelSonido = sinComentarios(leer('_lib/sonido/motor.ts'))
afirmar(/crearElAmbiente\(Howler\.ctx, Howler\.masterGain, volumenes\.ambiente\)/.test(motorDelSonido) && /motor\.current\?\.ambiente\(!reducido && document\.visibilityState === 'visible'\)/.test(controlDelSonido), '  las reglas siguen: se arma sobre el contexto de howler (que habilitó la acción: apagado por defecto, nada antes de una acción) y sin él con movimiento reducido o con la pestaña oculta')

cerrar('s42-cierre-retoque')
