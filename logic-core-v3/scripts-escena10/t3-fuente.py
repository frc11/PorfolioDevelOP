"""
SPRINT ESCENA 10 — T3 · la Chivo de los títulos de volumen, como geometría: python scripts-escena10/t3-fuente.py

Lee la Chivo del sitio (`src/app/v3/_fuentes/chivo-latin.woff2`, variable), la instancia en el peso de los títulos (400,
`font-normal`) y escribe sus glifos en el formato «typeface» que lee el `FontLoader` de three
(`src/app/v3/_fuentes/chivo-400-titulos.json`): `m`, `l` y `q` (el punto final primero y el de control después), en
unidades de la fuente, y sólo los caracteres de los títulos (los de `TEXTOS`, más el espacio). La Chivo es OFL
(`_fuentes/OFL-chivo.txt`): la licencia permite convertirla y redistribuirla con la fuente.

Sin instalar nada: fontTools necesita brotli para abrir WOFF2 y, si no está, se usa el zlib de Node (que lo trae).
Si cambian los títulos, se vuelve a correr (el invariante s36 afirma que cada carácter de los títulos está en el JSON).
"""
import json
import os
import subprocess
import sys
import types

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ORIGEN = os.path.join(RAIZ, 'src', 'app', 'v3', '_fuentes', 'chivo-latin.woff2')
DESTINO = os.path.join(RAIZ, 'src', 'app', 'v3', '_fuentes', 'chivo-400-titulos.json')
TEXTOS = ['Portfolio', 'Seis razones', 'para elegirnos']
PESO = 400

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


def principal():
    fuente = TTFont(ORIGEN)
    if 'fvar' in fuente:
        fuente = instancer.instantiateVariableFont(fuente, {'wght': PESO})
    mapa = fuente.getBestCmap()
    glifos = fuente.getGlyphSet()
    anchos = fuente['hmtx'].metrics
    cabeza, hhea, post = fuente['head'], fuente['hhea'], fuente['post']
    datos = {}
    for ch in sorted(set(''.join(TEXTOS))):
        nombre = mapa.get(ord(ch))
        if nombre is None:
            raise SystemExit(f'la fuente no tiene «{ch}»')
        pen = PenDeTypeface(glifos)
        glifos[nombre].draw(pen)
        xs = [int(v) for parte in pen.partes for v in parte.split()[1::2] if v.lstrip('-').isdigit()]
        datos[ch] = {'ha': anchos[nombre][0], 'x_min': min(xs) if xs else 0, 'x_max': max(xs) if xs else 0, 'o': ' '.join(pen.partes)}
    typeface = {
        'glyphs': datos,
        'familyName': 'Chivo',
        'ascender': hhea.ascent,
        'descender': hhea.descent,
        'underlinePosition': post.underlinePosition,
        'underlineThickness': post.underlineThickness,
        'boundingBox': {'xMin': cabeza.xMin, 'yMin': cabeza.yMin, 'xMax': cabeza.xMax, 'yMax': cabeza.yMax},
        'resolution': cabeza.unitsPerEm,
        'original_font_information': {'fontFamily': 'Chivo', 'fontSubfamily': f'wght {PESO}', 'license': 'SIL Open Font License 1.1 (OFL-chivo.txt)', 'source': 'chivo-latin.woff2'},
    }
    with open(DESTINO, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(typeface, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print(DESTINO, len(datos), 'glifos,', os.path.getsize(DESTINO), 'bytes')


principal()
