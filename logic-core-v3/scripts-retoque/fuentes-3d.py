"""
SPRINT RETOQUE 3D — las fuentes de los títulos de volumen, como geometría: python scripts-retoque/fuentes-3d.py

La versión general de `scripts-escena10/t3-fuente.py` (que sólo armaba la Chivo 400): lee cada fuente del sitio
(`src/app/v3/_fuentes/*.woff2`, variables), la instancia en el peso con que el DOM pinta su título y escribe sus glifos en
el formato «typeface» que lee el `FontLoader` de three: `m`, `l` y `q` (el punto final primero y el de control después),
en unidades de la fuente, y sólo los caracteres de sus títulos (más el espacio). Las tres son OFL (`_fuentes/OFL-*.txt`):
la licencia permite convertirlas y redistribuirlas con la fuente.

  chivo-400-titulos.json           Portfolio, la frase de Por qué develOP (ESCENA 10), «El equipo» (3C), el título de
                                   Demos (CIERRE RETOQUE 3D, D3), el titular de Quiénes somos (RETOQUE PANEL, T4) y
                                   «Nosotros», el título de la foto (NOCTURNO FINAL, D1)
  chivo-700-titulos.json           [RETOQUE PANEL] T4 · lo subrayado del titular de Quiénes somos: «algo distinto,»
  chivo-300-titulos.json           [RETOQUE PANEL] T4 · lo tachado: «lo mismo de siempre»
  archivo-700-titulos.json         el registro 1 del hero, en mayúsculas (`uppercase` del DOM): «TU NEGOCIO VENDIENDO»;
                                   [PULIDO 2] 5 · y el CTA del final: «HABLANOS»
  archivo-normal-cta.json
                                   [PULIDO 5] D1 · la frase del CTA del final en Archivo, con su copy (minúsculas, acentos):
                                   «Este sitio empezó con una charla.», en 600 (un peso de título). El woff2 del sitio es un
                                   subconjunto de mayúsculas (`scripts-titular/subsetear-fuentes.py`): ésta sale del TTF
                                   VARIABLE de Archivo (OFL, `scripts-titular/_upstream/Archivo[wdth,wght].ttf`; si no está, lo
                                   baja ese script) en wdth 100 ([PULIDO 6] E1 · `?ancho=expandido`, 120, se borró; el sitio
                                   pincha 62, que en minúsculas se veía estirado), sólo con las letras que pide y con su
                                   kerning (`kerning`: los pares del GPOS, en unidades de la fuente)
  archivo-normal-cta-fuerte.json
                                   [PULIDO 5] D1 · el destacado y el CTA, del mismo TTF en 900 (el más pesado): «El tuyo
                                   también.» y «HABLANOS»
  chivo-400-valores.json           [PULIDO 4] C1 · los seis valores de Por qué develOP (título y línea, los dos en 400 en el
                                   DOM): la escena los arma para la metamorfosis al CTA
  chivo-300-italica-titulos.json   el registro 2 del hero: «LAS 24 HS»
  chivo-{400,500,600}-pie.json     [RETOQUE DEL PIE] P2 · los textos del pie en 3D, cada uno con su peso
  archivo-*-pagina.json            [B12a.4] el título de las páginas: cuatro instancias del TTF variable (125/800, 125/300, 75/800
                                   y 112,5/300), con las letras de los tres nombres de servicio y de la ruta de prueba

Sin instalar nada: fontTools necesita brotli para abrir WOFF2 y, si no está, se usa el zlib de Node (que lo trae).
Si cambian los títulos, se vuelve a correr (los invariantes afirman que cada carácter está en su JSON).
"""
import json
import os
import subprocess
import sys
import types

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
FUENTES = os.path.join(RAIZ, 'src', 'app', 'v3', '_fuentes')
# [PULIDO 5] D1 · Archivo entera y variable (wdth y wght; la baja `scripts-titular/subsetear-fuentes.py`; no se versiona).
ARCHIVO_VARIABLE = os.path.join(RAIZ, 'scripts-titular', '_upstream', 'Archivo[wdth,wght].ttf')
# [PULIDO 5] D1 · el ancho de la frase del CTA: el eje wdth de Archivo va de 62 a 125. [PULIDO 6] E1 · sólo wdth 100.
ANCHOS_DEL_CTA = {'normal': 100}
VALORES = [
    'Hecho a medida', 'Sin plantillas: cada sitio se diseña para tu negocio.',
    'Diseño que se destaca', 'Tu sitio no se parece al de tu competencia.',
    'Rápido, sin atajos', 'Entregamos rápido sin recortar calidad.',
    'Calidad que se nota', 'Carga rápido, se ve bien en cualquier pantalla y está bien construido por dentro.',
    'Tu panel, tu control', 'Ves cómo va tu proyecto y pedís cambios sin esperar un mail.',
    'Hablás con quien lo hace', 'Sin intermediarios: te atienden las personas que construyen tu sitio.',
]

# [B12a.4] Los títulos de las páginas (`TITULOS_CON_LETRAS`, `_componentes/titulos3d/presets.ts`): los nombres de las páginas de servicio
# (su `NOMBRE`, en `_servicios/datos/*.ts` de paginas/servicios), los tres de `acento.ts` (la ruta de prueba, `?nombre=`) y el de la
# prueba. Un nombre nuevo obliga a volver a correr (s78 exige cada letra en cada instancia).
TEXTOS_DE_PAGINA = ['Páginas web', 'Software a medida', 'IA y automatizaciones', 'Desarrollo web', 'Integraciones de IA y Automatizaciones', 'Integraciones con IA', 'Prueba de la intro']
# [B12a.4] Las instancias (nombre, wdth, wght). [B12a.8] Las de las cuatro familias que se comparan (`COMBINACIONES_DEL_TITULO`): 125/800 y
# 125/300 (la 1, la del «6»), 75/900 y 75/500 (la 2), 125/200 y 125/500 (la 3), 75/800 y 125/300 (la 4); la 112,5/300 salió con la 2 vieja.
# 125/400: la opción `?legibilidad=peso` (la parte liviana de la 1, un paso más pesada).
INSTANCIAS_DE_PAGINA = [('125-800', 125, 800), ('125-300', 125, 300), ('75-800', 75, 800), ('75-900', 75, 900), ('75-500', 75, 500), ('125-200', 125, 200), ('125-500', 125, 500), ('125-400', 125, 400)]

PEDIDOS = [
    {'origen': 'chivo-latin.woff2', 'peso': 400, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     # [NOCTURNO B2] y el título de las reseñas, en el que se da vuelta «Seis razones para elegirnos»: «Lo que dicen» | «nuestros clientes».
     'textos': ['Portfolio', 'Seis razones', 'para elegirnos', 'El equipo', 'Demos para abrir', 'acá mismo', 'Queremos hacer', 'no', 'Lo que dicen', 'nuestros clientes', 'Nosotros'], 'destino': 'chivo-400-titulos.json'},
    # [RETOQUE PANEL] T4 · el titular de Quiénes somos: lo marcado va en otro peso (`pesosDelTitular`: fuerte y liviano).
    {'origen': 'chivo-latin.woff2', 'peso': 700, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': ['algo distinto,'], 'destino': 'chivo-700-titulos.json'},
    {'origen': 'chivo-latin.woff2', 'peso': 300, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': ['lo mismo de siempre'], 'destino': 'chivo-300-titulos.json'},
    {'origen': 'archivo-display-latin.woff2', 'peso': 700, 'familia': 'Archivo', 'licencia': 'OFL-archivo.txt',
     # [PULIDO 9] H2 · y el título de la tarjeta de gracias del pie (`uppercase` del DOM).
     'textos': ['TU NEGOCIO VENDIENDO', 'HABLANOS', 'GRACIAS POR TU MENSAJE.'], 'destino': 'archivo-700-titulos.json'},
    # [PULIDO 5] D1 · la frase del CTA del final en Archivo con su copy (minúsculas, acentos), en wdth 100: la
    # frase en 600 y el destacado y el CTA en 900, del TTF variable entero, con su kerning.
    *[{'origen': ARCHIVO_VARIABLE, 'peso': peso, 'ancho': wdth, 'familia': 'Archivo', 'licencia': 'OFL-archivo.txt', 'kerning': True,
       'textos': textos, 'destino': f'archivo-{nombre}-cta{sufijo}.json'}
      for nombre, wdth in ANCHOS_DEL_CTA.items()
      # [PULIDO 10] J4 · el título de gracias en 3D se fue en [PULIDO 11] B (la tarjeta del resultado va en el DOM): sólo la frase.
      for peso, textos, sufijo in ((600, ['Este sitio empezó con una charla.'], ''), (900, ['El tuyo también.', 'HABLANOS'], '-fuerte'))],
    # [PULIDO 4] C1 · los seis valores (título y línea, `_secciones/por-que-develop/contenido.ts`), en el peso del DOM.
    {'origen': 'chivo-latin.woff2', 'peso': 400, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': VALORES, 'destino': 'chivo-400-valores.json'},
    {'origen': 'chivo-italic-latin.woff2', 'peso': 300, 'familia': 'Chivo Italic', 'licencia': 'OFL-chivo.txt',
     'textos': ['LAS 24 HS'], 'destino': 'chivo-300-italica-titulos.json'},
    # [RETOQUE DEL PIE] P2 · el pie en 3D, con el peso con que el DOM pinta cada texto (los de `_secciones/cierre/contenido.ts`
    # y `contacto.ts`, y el logotipo): 400 el titular y la línea legal (con los dígitos, por el año); 500 los rótulos, en
    # mayúsculas (`uppercase` del DOM); 600 el logotipo, los enlaces, el mail, WhatsApp y Enviar.
    {'origen': 'chivo-latin.woff2', 'peso': 400, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     # [PULIDO 9] H2 · y la bajada de la tarjeta de gracias.
     'textos': ['Lo que sigue lo armamos con vos', '© 2026 develOP. Todos los derechos reservados.', '0123456789', 'Te contestamos pronto.'], 'destino': 'chivo-400-pie.json'},
    {'origen': 'chivo-latin.woff2', 'peso': 500, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': ['EL RECORRIDO', 'CONTACTO', 'NOMBRE', 'MAIL', 'MENSAJE'], 'destino': 'chivo-500-pie.json'},
    {'origen': 'chivo-latin.woff2', 'peso': 600, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     # [PULIDO 10] J8 · «Portfolio» y «Demos» en el recorrido (era «Trabajos»).
     'textos': ['develOP', 'Inicio', 'Quiénes somos', 'Portfolio', 'Demos', 'Servicios', 'Tu panel', 'Por qué develOP', 'contacto@develop.com.ar', 'Escribinos por WhatsApp', 'Enviar', 'Enviando…', 'Enviar otro mensaje', 'Reintentar'], 'destino': 'chivo-600-pie.json'},  # [PULIDO 10] J5 · y Reintentar
    # [B12a.4] El título de las páginas (D3): cuatro instancias de Archivo, ninguna del home (62/700 del hero, 100/600 y 100/900 del CTA),
    # con las letras de los tres nombres de servicio (`_secciones/_contrato/acento.ts`) y la ruta de prueba. Se cargan sólo en una página
    # (`fuentesDePagina.ts`, import dinámico): el home no las baja. Cada instancia lleva todas las letras (las combinaciones cambian de parte).
    *[{'origen': ARCHIVO_VARIABLE, 'peso': peso, 'ancho': wdth, 'familia': 'Archivo', 'licencia': 'OFL-archivo.txt', 'kerning': True,
       'textos': TEXTOS_DE_PAGINA, 'destino': f'archivo-{nombre}-pagina.json', 'dom': f'archivo-{nombre}-pagina.woff', 'metricas': f'archivo-{nombre}'}
      for nombre, wdth, peso in INSTANCIAS_DE_PAGINA],
]

try:
    import brotli  # noqa: F401
except ImportError:
    _JS = "const z=require('zlib');const c=[];process.stdin.on('data',d=>c.push(d));process.stdin.on('end',()=>process.stdout.write(z.brotliDecompressSync(Buffer.concat(c))))"
    brotli = types.ModuleType('brotli')
    brotli.decompress = lambda data: subprocess.run(['node', '-e', _JS], input=data, capture_output=True, check=True).stdout
    brotli.error = Exception
    sys.modules['brotli'] = brotli

from fontTools.pens.basePen import BasePen  # noqa: E402
from fontTools.pens.recordingPen import RecordingPen  # noqa: E402
from fontTools.pens.reverseContourPen import ReverseContourPen  # noqa: E402
from fontTools.ttLib import TTFont  # noqa: E402
from fontTools.varLib import instancer  # noqa: E402


class PenDeTypeface(BasePen):
    def __init__(self, glifos):
        super().__init__(glifos)
        self.partes = []

    def _moveTo(self, p):
        self.partes.append(f"m {round(p[0])} {round(p[1])}")

    def _lineTo(self, p):
        self.partes.append(f"l {round(p[0])} {round(p[1])}")

    def _qCurveToOne(self, c, p):
        # three: `q` lleva el punto FINAL primero y el de control después.
        self.partes.append(f"q {round(p[0])} {round(p[1])} {round(c[0])} {round(c[1])}")

    def _curveToOne(self, c1, c2, p):
        self.partes.append(f"b {round(p[0])} {round(p[1])} {round(c1[0])} {round(c1[1])} {round(c2[0])} {round(c2[1])}")

    def _closePath(self):
        self.partes.append("z")


class PenAplanado(BasePen):
    """[PULIDO 5] D1 · los contornos de un glifo como polígonos (las curvas, en 4 tramos): para saber cuál está adentro de cuál."""

    def __init__(self, glifos):
        super().__init__(glifos)
        self.contornos = []

    def _moveTo(self, p):
        self.contornos.append([p])

    def _lineTo(self, p):
        self.contornos[-1].append(p)

    def _qCurveToOne(self, c, p):
        a = self.contornos[-1][-1]
        for t in (0.25, 0.5, 0.75, 1.0):
            u = 1 - t
            self.contornos[-1].append((u * u * a[0] + 2 * u * t * c[0] + t * t * p[0], u * u * a[1] + 2 * u * t * c[1] + t * t * p[1]))

    def _curveToOne(self, c1, c2, p):
        a = self.contornos[-1][-1]
        for t in (0.25, 0.5, 0.75, 1.0):
            u = 1 - t
            self.contornos[-1].append(tuple(u ** 3 * a[i] + 3 * u * u * t * c1[i] + 3 * u * t * t * c2[i] + t ** 3 * p[i] for i in (0, 1)))


def area(poligono):
    return sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(poligono, poligono[1:] + poligono[:1])) / 2


def adentro(punto, poligono):
    x, y = punto
    dentro = False
    for (x0, y0), (x1, y1) in zip(poligono, poligono[1:] + poligono[:1]):
        if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0):
            dentro = not dentro
    return dentro


def repetir(operaciones, pen):
    for nombre, argumentos in operaciones:
        getattr(pen, nombre)(*argumentos)


def contornos_en_su_sentido(glifo, glifos, pen):
    """
    [PULIDO 5] D1 · EL SENTIDO DE CADA CONTORNO, POR ANIDAMIENTO: three (`ShapePath.toShapes`) decide qué es agujero por el
    sentido (horario, lleno; antihorario, agujero, con la y para arriba), así que un contorno dado vuelta en la fuente pierde su
    agujero o tapa el de otro. Acá se decide por geometría: un contorno adentro de un número IMPAR de otros es un agujero (la
    regla par/impar) y se escribe en el sentido que three espera (el lleno, horario; el agujero, antihorario). Los que ya
    estaban bien no cambian. Devuelve cuántos dio vuelta.
    """
    grabado = RecordingPen()
    glifo.draw(grabado)
    partes, actual = [], []
    for op in grabado.value:
        actual.append(op)
        if op[0] in ('closePath', 'endPath'):
            partes.append(actual)
            actual = []
    if actual:
        partes.append(actual)
    poligonos = []
    for parte in partes:
        aplanado = PenAplanado(glifos)
        repetir(parte, aplanado)
        poligonos.append(aplanado.contornos[0] if aplanado.contornos else [])
    vueltos = 0
    for k, parte in enumerate(partes):
        poligono = poligonos[k]
        destino = pen
        if len(poligono) >= 3:
            profundidad = sum(1 for j, otro in enumerate(poligonos) if j != k and len(otro) >= 3 and adentro(poligono[0], otro))
            agujero = profundidad % 2 == 1
            horario = area(poligono) < 0
            if horario == agujero:
                destino = ReverseContourPen(pen)
                vueltos += 1
        repetir(parte, destino)
    return vueltos


def kerning(fuente, caracteres):
    """
    [PULIDO 5] D1 · el KERNING de los pares de `caracteres` (unidades de la fuente; sólo los que no son cero), del GPOS de la
    fuente ya instanciada (`kern`, PairPos de formato 1 y 2, con su extensión): para cada par, la primera subtabla que lo cubre.
    """
    if 'GPOS' not in fuente:
        return {}
    gpos = fuente['GPOS'].table
    mapa = fuente.getBestCmap()
    nombres = {ch: mapa[ord(ch)] for ch in caracteres if ord(ch) in mapa}
    indices = sorted({i for fr in gpos.FeatureList.FeatureRecord if fr.FeatureTag == 'kern' for i in fr.Feature.LookupListIndex})
    subtablas = []
    for i in indices:
        lk = gpos.LookupList.Lookup[i]
        for st in lk.SubTable:
            tipo = lk.LookupType
            if tipo == 9:
                tipo, st = st.ExtensionLookupType, st.ExtSubTable
            if tipo == 2:
                subtablas.append(st)
    salida = {}
    for a, ga in nombres.items():
        for b, gb in nombres.items():
            valor = None
            for st in subtablas:
                cubre = st.Coverage.glyphs
                if ga not in cubre:
                    continue
                if st.Format == 1:
                    registro = next((r for r in st.PairSet[cubre.index(ga)].PairValueRecord if r.SecondGlyph == gb), None)
                    if registro is None:
                        continue
                    valor = getattr(registro.Value1, 'XAdvance', 0) if registro.Value1 is not None else 0
                else:
                    c1 = st.ClassDef1.classDefs.get(ga, 0)
                    c2 = st.ClassDef2.classDefs.get(gb, 0)
                    v1 = st.Class1Record[c1].Class2Record[c2].Value1
                    valor = getattr(v1, 'XAdvance', 0) if v1 is not None else 0
                break
            if valor:
                salida[a + b] = int(valor)
    return salida


def armar(pedido):
    fuente = TTFont(os.path.join(FUENTES, pedido['origen']))  # os.path.join deja entera una ruta absoluta (ARCHIVO_VARIABLE)
    if 'fvar' in fuente:
        ejes = {'wght': pedido['peso']}
        if 'ancho' in pedido:
            ejes['wdth'] = pedido['ancho']
        fuente = instancer.instantiateVariableFont(fuente, ejes)
    mapa = fuente.getBestCmap()
    glifos = fuente.getGlyphSet()
    anchos = fuente['hmtx'].metrics
    cabeza, hhea, post = fuente['head'], fuente['hhea'], fuente['post']
    datos = {}
    for ch in sorted(set(''.join(pedido['textos']))):
        nombre = mapa.get(ord(ch))
        if nombre is None:
            raise SystemExit(f"{pedido['origen']} no tiene «{ch}»")
        pen = PenDeTypeface(glifos)
        vueltos = contornos_en_su_sentido(glifos[nombre], glifos, pen)
        if vueltos:
            print(f"  {pedido['destino']}: «{ch}» tenía {vueltos} contorno(s) en el sentido del otro rol (se dieron vuelta)")
        xs = [int(v) for parte in pen.partes for v in parte.split()[1::2] if v.lstrip('-').isdigit()]
        datos[ch] = {'ha': anchos[nombre][0], 'x_min': min(xs) if xs else 0, 'x_max': max(xs) if xs else 0, 'o': ' '.join(pen.partes)}
    typeface = {
        'glyphs': datos,
        'familyName': pedido['familia'],
        'ascender': hhea.ascent,
        'descender': hhea.descent,
        'underlinePosition': post.underlinePosition,
        'underlineThickness': post.underlineThickness,
        'boundingBox': {'xMin': cabeza.xMin, 'yMin': cabeza.yMin, 'xMax': cabeza.xMax, 'yMax': cabeza.yMax},
        'resolution': cabeza.unitsPerEm,
        'original_font_information': {'fontFamily': pedido['familia'], 'fontSubfamily': f"wght {pedido['peso']}" + (f" wdth {pedido['ancho']}" if 'ancho' in pedido else ''), 'license': f"SIL Open Font License 1.1 ({pedido['licencia']})", 'source': os.path.basename(pedido['origen'])},
    }
    if pedido.get('kerning'):
        typeface['kerning'] = kerning(fuente, sorted(set(''.join(pedido['textos']))))
    destino = os.path.join(FUENTES, pedido['destino'])
    with open(destino, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(typeface, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print(destino, len(datos), 'glifos,', os.path.getsize(destino), 'bytes')
    if 'dom' in pedido:
        cara_del_dom(fuente, pedido)
    if pedido.get('metricas'):
        METRICAS[pedido['metricas']] = metricas(typeface, pedido['textos'])


# [B12a.8] T1 · LAS MÉTRICAS DEL TÍTULO: el título de una página va en UNA línea y ocupa una parte fija del ancho (`anchoDelTitulo.ts`: su
# tamaño es esa parte dividida por su ancho en em). El ancho en em sale de acá: el avance de cada letra y el kerning de los pares que
# aparecen en los títulos, en em, por instancia (la misma que pintan el DOM y el 3D). Chico: lo importa la página, no el home.
METRICAS = {}


def metricas(typeface, textos):
    r = typeface['resolution']
    pares = {t[i:i + 2] for t in textos for i in range(len(t) - 1)}
    return {
        'avance': {ch: round(g['ha'] / r, 5) for ch, g in sorted(typeface['glyphs'].items())},
        'kerning': {p: round(v / r, 5) for p, v in sorted(typeface.get('kerning', {}).items()) if p in pares},
    }


def cara_del_dom(fuente, pedido):
    """
    [B12a.4] LA CARA DEL DOM de una instancia de página: la MISMA instancia estática (así `hmtx` es lo que se pinta y la escena mide las
    letras del DOM con la métrica del 3D), recortada a las letras de sus textos (más el espacio), con el kerning y sin hinting. En WOFF
    (zlib): el WOFF2 pide brotli, que no está y no se instala para esto; con ~25 glifos la diferencia es de cientos de bytes.
    """
    from fontTools import subset  # noqa: E402

    opciones = subset.Options()
    opciones.flavor = 'woff'
    opciones.layout_features = ['kern']
    opciones.hinting = False
    opciones.name_IDs = ['*']
    opciones.notdef_outline = True
    recorte = subset.Subsetter(opciones)
    recorte.populate(unicodes={ord(ch) for ch in ''.join(pedido['textos']) + ' '})
    recorte.subset(fuente)
    destino = os.path.join(FUENTES, pedido['dom'])
    subset.save_font(fuente, destino, opciones)
    print(destino, os.path.getsize(destino), 'bytes')


# Con nombres de destino como argumentos, sólo esos (sin argumentos, todos).
for p in PEDIDOS:
    if len(sys.argv) <= 1 or p['destino'] in sys.argv[1:]:
        armar(p)

# [B12a.8] Con todas las de página armadas, sus métricas en un archivo (el que lee `anchoDelTitulo.ts`).
if len(METRICAS) == len(INSTANCIAS_DE_PAGINA):
    destino = os.path.join(FUENTES, 'metricas-del-titulo.json')
    with open(destino, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(METRICAS, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print(destino, os.path.getsize(destino), 'bytes')
