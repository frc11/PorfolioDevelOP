"""SPRINT INTERFAZ 2 · cierre — la hoja de la sombra de día: dos filas (antes, después) de cuatro celdas (Quiénes somos y
Por qué develOP, enteros y de cerca: el piso debajo del logo, con las dos sombras). Lee las capturas de
`cierre-sombra.ts` y escribe `interfaz2/cierre/sombra/hoja-1440.png`."""
from PIL import Image, ImageDraw, ImageFont

DIR = 'C:/Users/Valentino/.cache/b4-medicion/interfaz2/cierre/sombra'
CERCA = {'quienes-somos': (300, 560, 1440, 900), 'por-que-develop': (400, 600, 1400, 900)}
ANCHO, ALTO = 480, 300
fuente = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 18)
hoja = Image.new('RGB', (ANCHO * 4, ALTO * 2), (128, 128, 128))
for fila, rotulo in enumerate(['antes', 'despues']):
    columna = 0
    for momento in ['quienes-somos', 'por-que-develop']:
        imagen = Image.open(f'{DIR}/{momento}-{rotulo}.png').convert('RGB')
        for texto, recorte in [(f'{momento} - {rotulo}', None), (f'{momento} de cerca - {rotulo}', CERCA[momento])]:
            celda = imagen.crop(recorte) if recorte else imagen.copy()
            celda.thumbnail((ANCHO, ALTO))
            x, y = columna * ANCHO + (ANCHO - celda.width) // 2, fila * ALTO + (ALTO - celda.height) // 2
            hoja.paste(celda, (x, y))
            d = ImageDraw.Draw(hoja)
            d.rectangle((columna * ANCHO + 6, fila * ALTO + 6, columna * ANCHO + 14 + d.textlength(texto, font=fuente), fila * ALTO + 32), fill=(0, 0, 0))
            d.text((columna * ANCHO + 10, fila * ALTO + 8), texto, font=fuente, fill=(255, 255, 255))
            columna += 1
hoja.save(f'{DIR}/hoja-1440.png')
print(f'{DIR}/hoja-1440.png')
