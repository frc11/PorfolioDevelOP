"""
SPRINT RETOQUE 3D — las fuentes de los títulos de volumen, como geometría: python scripts-retoque/fuentes-3d.py

La versión general de `scripts-escena10/t3-fuente.py` (que sólo armaba la Chivo 400): lee cada fuente del sitio
(`src/app/v3/_fuentes/*.woff2`, variables), la instancia en el peso con que el DOM pinta su título y escribe sus glifos en
el formato «typeface» que lee el `FontLoader` de three: `m`, `l` y `q` (el punto final primero y el de control después),
en unidades de la fuente, y sólo los caracteres de sus títulos (más el espacio). Las tres son OFL (`_fuentes/OFL-*.txt`):
la licencia permite convertirlas y redistribuirlas con la fuente.

  chivo-400-titulos.json           Portfolio, la frase de Por qué develOP (ESCENA 10), «El equipo» (3C) y el título de
                                   Demos (CIERRE RETOQUE 3D, D3)
  archivo-700-titulos.json         el registro 1 del hero, en mayúsculas (`uppercase` del DOM): «TU NEGOCIO VENDIENDO»
  chivo-300-italica-titulos.json   el registro 2 del hero: «LAS 24 HS»
  chivo-{400,500,600}-pie.json     [RETOQUE DEL PIE] P2 · los textos del pie en 3D, cada uno con su peso

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

PEDIDOS = [
    {'origen': 'chivo-latin.woff2', 'peso': 400, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': ['Portfolio', 'Seis razones', 'para elegirnos', 'El equipo', 'Demos para abrir', 'acá mismo'], 'destino': 'chivo-400-titulos.json'},
    {'origen': 'archivo-display-latin.woff2', 'peso': 700, 'familia': 'Archivo', 'licencia': 'OFL-archivo.txt',
     'textos': ['TU NEGOCIO VENDIENDO'], 'destino': 'archivo-700-titulos.json'},
    {'origen': 'chivo-italic-latin.woff2', 'peso': 300, 'familia': 'Chivo Italic', 'licencia': 'OFL-chivo.txt',
     'textos': ['LAS 24 HS'], 'destino': 'chivo-300-italica-titulos.json'},
    # [RETOQUE DEL PIE] P2 · el pie en 3D, con el peso con que el DOM pinta cada texto (los de `_secciones/cierre/contenido.ts`
    # y `contacto.ts`, y el logotipo): 400 el titular y la línea legal (con los dígitos, por el año); 500 los rótulos, en
    # mayúsculas (`uppercase` del DOM); 600 el logotipo, los enlaces, el mail, WhatsApp y Enviar.
    {'origen': 'chivo-latin.woff2', 'peso': 400, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': ['Lo que sigue lo armamos con vos', '© 2026 develOP. Todos los derechos reservados.', '0123456789'], 'destino': 'chivo-400-pie.json'},
    {'origen': 'chivo-latin.woff2', 'peso': 500, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': ['EL RECORRIDO', 'CONTACTO', 'NOMBRE', 'MAIL', 'MENSAJE'], 'destino': 'chivo-500-pie.json'},
    {'origen': 'chivo-latin.woff2', 'peso': 600, 'familia': 'Chivo', 'licencia': 'OFL-chivo.txt',
     'textos': ['develOP', 'Inicio', 'Quiénes somos', 'Trabajos', 'Servicios', 'Tu panel', 'Por qué develOP', 'contacto@develop.com.ar', 'Escribinos por WhatsApp', 'Enviar', 'Enviando…'], 'destino': 'chivo-600-pie.json'},
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


def armar(pedido):
    fuente = TTFont(os.path.join(FUENTES, pedido['origen']))
    if 'fvar' in fuente:
        fuente = instancer.instantiateVariableFont(fuente, {'wght': pedido['peso']})
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
        glifos[nombre].draw(pen)
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
        'original_font_information': {'fontFamily': pedido['familia'], 'fontSubfamily': f"wght {pedido['peso']}", 'license': f"SIL Open Font License 1.1 ({pedido['licencia']})", 'source': pedido['origen']},
    }
    destino = os.path.join(FUENTES, pedido['destino'])
    with open(destino, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(typeface, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print(destino, len(datos), 'glifos,', os.path.getsize(destino), 'bytes')


for p in PEDIDOS:
    armar(p)
