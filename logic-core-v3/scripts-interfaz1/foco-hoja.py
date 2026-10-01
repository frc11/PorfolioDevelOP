"""
SPRINT INTERFAZ 1 · T3 — la hoja del foco: foco-hoja.py <carpeta de foco.ts>

Para cada paso de `pasos.json`: recorta la captura alrededor del control con foco (con margen) y mide el contraste del
anillo contra lo que lo rodea, en píxeles de verdad: la mediana de luminancia en la franja donde se pinta el contorno
(entre el desplazamiento y el desplazamiento más el grosor, por fuera de la caja) contra la de la franja de afuera (3 a
6 px más allá). Es el contraste WCAG entre esas dos medianas (un anillo que no se ve da cerca de 1). Sin `outline` (o
con estilo `none`) no hay franja: «sin anillo». Arma `hoja.png` (los recortes en grilla, con el número de paso, el
nombre y el contraste) y `contraste.json`. Borra las capturas enteras al terminar.
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

DIR = sys.argv[1]
pasos = json.load(open(os.path.join(DIR, 'pasos.json'), encoding='utf8'))['pasos']
FUENTE = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)


def lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def franja(img, caja, d1, d2):
    """Los píxeles a una distancia entre d1 y d2 por fuera de la caja (un marco)."""
    x, y, w, h = caja['x'], caja['y'], caja['w'], caja['h']
    H, W = img.shape[:2]
    y0, y1, x0, x1 = max(0, y - d2), min(H, y + h + d2), max(0, x - d2), min(W, x + w + d2)
    if y1 <= y0 or x1 <= x0:
        return np.zeros((0, 3))
    a = img[y0:y1, x0:x1]
    yy, xx = np.mgrid[max(0, y - d2):min(H, y + h + d2), max(0, x - d2):min(W, x + w + d2)]
    dx = np.maximum(np.maximum(x - xx, xx - (x + w - 1)), 0)
    dy = np.maximum(np.maximum(y - yy, yy - (y + h - 1)), 0)
    d = np.maximum(dx, dy)
    m = (d >= d1) & (d < d2)
    return a[m]


def px(valor):
    try:
        return float(str(valor).replace('px', ''))
    except ValueError:
        return 0.0


resultados = []
recortes = []
for p in pasos:
    ruta = os.path.join(DIR, p['png'])
    if p.get('nada') or not os.path.exists(ruta):
        resultados.append({'paso': p['paso'], 'nada': True})
        continue
    img = np.asarray(Image.open(ruta).convert('RGB')).astype(np.float64)
    caja = p['caja']
    a = p['anillo']
    contraste = None
    franja_que_se_ve = None
    dos_tonos = None
    if a['estilo'] != 'none' and px(a['grosor']) > 0:
        # En pantalla: un control adentro de una capa escalada (el túnel) dibuja su anillo escalado.
        k = p.get('escala', 1) or 1
        off, g = px(a['desplazamiento']) * k, px(a['grosor']) * k
        con_borde = a.get('sombra', 'none') not in ('none', '')
        franjas = {'contorno': (int(round(off)) + 1, max(int(round(off)) + 2, int(round(off + g))))}
        if con_borde:
            franjas['borde de adentro'] = (1, max(2, int(round(off))))
            franjas['borde de afuera'] = (int(round(off + g)) + 1, max(int(round(off + g)) + 2, int(round(off + 2 * g))))
        lejos = int(round(off + (2 if con_borde else 1) * g)) + 2
        afuera = franja(img, caja, lejos, lejos + 3)
        mejor = None
        for nombre, (d1, d2) in franjas.items():
            banda = franja(img, caja, d1, d2)
            if len(banda) and len(afuera):
                la, lb = float(np.median(lum(banda))), float(np.median(lum(afuera)))
                c = (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
                if mejor is None or c > mejor:
                    mejor, franja_que_se_ve = c, nombre
        contraste = None if mejor is None else round(mejor, 2)
        # [INTERFAZ 1] Cierre · el anillo de dos tonos ENTERO (técnica C40): el contorno contra SU borde, de los dos lados.
        # Si el recorte o algo encima se come una franja, esto baja; si están las dos, da el contraste de los dos tonos.
        if con_borde:
            med = {}
            for nombre, (d1, d2) in franjas.items():
                banda = franja(img, caja, d1, d2)
                if len(banda):
                    med[nombre] = float(np.median(lum(banda)))
            if len(med) == 3:
                c = lambda a, b: (max(a, b) + 0.05) / (min(a, b) + 0.05)
                dos_tonos = round(min(c(med['contorno'], med['borde de adentro']), c(med['contorno'], med['borde de afuera'])), 2)
    fuera = caja['y'] + caja['h'] < 0 or caja['y'] > img.shape[0] or caja['w'] == 0 or caja['h'] == 0
    resultados.append({'paso': p['paso'], 'tag': p['tag'], 'panel': p['panel'], 'nombre': p['nombre'], 'focoVisible': p['focoVisible'], 'franja': franja_que_se_ve, 'dosTonos': dos_tonos,
                       'anillo': a, 'contraste': contraste, 'fueraDelCuadro': fuera, 'mezcla': p['mezcla'], 'recorta': p['recorta'],
                       'seccion': p['seccion'], 'fondo': p['fondo']})
    M = 28
    x0, y0 = max(0, caja['x'] - M), max(0, caja['y'] - M)
    x1, y1 = min(img.shape[1], caja['x'] + caja['w'] + M), min(img.shape[0], caja['y'] + caja['h'] + M)
    if x1 - x0 < 8 or y1 - y0 < 8:
        x0, y0, x1, y1 = 0, 0, min(img.shape[1], 320), min(img.shape[0], 120)
    rec = Image.fromarray(img[y0:y1, x0:x1].astype(np.uint8))
    rec.thumbnail((300, 150))
    rotulo = f"{p['paso']} · {p['panel'] or '-'} · {p['nombre'][:28]}"
    nota = 'sin anillo' if contraste is None else f'anillo {contraste}:1'
    if fuera:
        nota += ' · FUERA'
    if p['mezcla']:
        nota += ' · mezcla'
    recortes.append((rec, rotulo, nota, contraste))

C, ANCHO_C, ALTO_C = 6, 310, 190
filas = (len(recortes) + C - 1) // C
hoja = Image.new('RGB', (C * ANCHO_C, max(1, filas) * ALTO_C), (40, 40, 40))
d = ImageDraw.Draw(hoja)
for i, (rec, rotulo, nota, contraste) in enumerate(recortes):
    x, y = (i % C) * ANCHO_C + 5, (i // C) * ALTO_C + 4
    hoja.paste(rec, (x, y))
    color = (255, 90, 90) if contraste is None or contraste < 3 else (140, 230, 140)
    d.text((x, y + 152), rotulo, fill=(235, 235, 235), font=FUENTE)
    d.text((x, y + 168), nota, fill=color, font=FUENTE)
hoja.save(os.path.join(DIR, 'hoja.png'))
json.dump(resultados, open(os.path.join(DIR, 'contraste.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for p in pasos if not os.environ.get('GUARDAR') else []:
    ruta = os.path.join(DIR, p['png'])
    if os.path.exists(ruta):
        os.remove(ruta)
bajos = [r for r in resultados if not r.get('nada') and (r['contraste'] is None or r['contraste'] < 3)]
print(json.dumps({'pasos': len(resultados), 'bajoTres': len(bajos)}))
