"""
CONSTRUIR LAS DOS CARAS DEL TITULAR — subset de mayusculas, woff2, variable.

Corre con:   python scripts-titular/subsetear-fuentes.py
Requiere:    pip install fonttools brotli     (herramienta de build, NO dependencia del proyecto)

Escribe en `src/app/v3/_fuentes/` y publica un manifiesto en
`scripts-titular/manifiesto-fuentes.json` con el sha256 de cada entrada y de
cada salida. `fuentes.invariant.ts` compara contra ESE manifiesto, igual que
compara las dos caras de Chivo contra el manifiesto de descarga de S0.

── Por que un subset de MAYUSCULAS ─────────────────────────────────────────

Las dos caras se usan SOLO en mayusculas —la linea 1 y la linea 2 del titular
del hero— asi que las minusculas serian peso muerto sin forma de acotarlo.
El conjunto es A-Z, 0-9, las siete acentuadas mayusculas del espanol y la
puntuacion basica: 68 puntos de codigo contra los 653 que trae Archivo entero.

── Por que el eje `wdth` de Archivo va PINCHADO y el `wght` queda vivo ─────

Archivo declara dos ejes (wdth 62-125, wght 100-900). El titular usa UN punto
del eje de ancho, y dejarlo vivo cuesta dos cosas medidas:

  1. PESO. Los deltas de `gvar` para los dos ejes son 25,73 KiB; con `wdth`
     pinchado en 62 son 10,30 KiB. Son 15,43 KiB por un eje que nadie mueve.
  2. MEDICION, y esta es la que decide. El repo mide texto estatico leyendo
     `hmtx` del propio `.woff2` (`s10-woff2.ts`), y `hmtx` publica la instancia
     POR DEFECTO de la variable — wdth 100. Con el eje vivo, el instrumento
     leeria "TU NEGOCIO VENDIENDO" 47,6 % mas ancho de lo que se pinta
     (12,5070 em contra 8,4750 em), y con eso se envenenan `s10-logo`,
     `s10-medida`, `s10-mobile` y `s3-banda`. Pinchado, `hmtx` ES lo que se
     pinta.

Cambiar la condensacion es volver a correr este script con otro
`ARCHIVO_WDTH`, actualizar el manifiesto y el sha256 del invariante. El eje
`wght` queda vivo en las dos caras, que es lo que el sistema ya declara para
las dos de Chivo (`weight: '100 900'`).
"""

import gzip
import hashlib
import json
import os
import subprocess
import sys
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "src", "app", "v3", "_fuentes")
TEMPORAL = os.path.join(RAIZ, "scripts-titular", "_upstream")
MANIFIESTO = os.path.join(RAIZ, "scripts-titular", "manifiesto-fuentes.json")

# El punto del eje de ancho con el que se compone la linea 1. 62 es el MINIMO
# del eje —verificado en `fvar`— y es el que maximiza el tamano que entra en
# una linea en la caja medida del titular.
ARCHIVO_WDTH = 62

MAYUSCULAS = list(range(0x41, 0x5B))
DIGITOS = list(range(0x30, 0x3A))
ACENTUADAS = [0x00C1, 0x00C9, 0x00CD, 0x00D3, 0x00DA, 0x00D1, 0x00DC]  # A E I O U N U con dieresis
PUNTUACION = [
    0x20, 0x21, 0x22, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2C, 0x2D, 0x2E, 0x2F,
    0x3A, 0x3B, 0x3F, 0xA0, 0xA1, 0xAB, 0xBB, 0xBF,
    0x2013, 0x2014, 0x2019, 0x201C, 0x201D,
]
PUNTOS = MAYUSCULAS + DIGITOS + ACENTUADAS + PUNTUACION

# Los nombres que se conservan en la tabla `name`: copyright (0) y la licencia
# (13, 14). Es lo que la OFL 1.1 exige que viaje con el binario, y viaja
# ademas como archivo en `_fuentes/OFL-*.txt`.
NAME_IDS = "0,1,2,13,14"

ENTRADAS = [
    {
        "cara": "archivo-display",
        "familia": "Archivo",
        "url": "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth%2Cwght%5D.ttf",
        "upstream": "Archivo[wdth,wght].ttf",
        "licencia": "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/OFL.txt",
        "licenciaArchivo": "OFL-archivo.txt",
        "pines": ["wdth=%d" % ARCHIVO_WDTH],
        "salida": "archivo-display-latin.woff2",
    },
    {
        "cara": "chivo-italic",
        "familia": "Chivo Italic",
        "url": "https://raw.githubusercontent.com/google/fonts/main/ofl/chivo/Chivo-Italic%5Bwght%5D.ttf",
        "upstream": "Chivo-Italic[wght].ttf",
        "licencia": "https://raw.githubusercontent.com/google/fonts/main/ofl/chivo/OFL.txt",
        "licenciaArchivo": "OFL-chivo.txt",
        "pines": [],
        "salida": "chivo-italic-latin.woff2",
    },
]


def sha256(ruta):
    with open(ruta, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def bajar(url, ruta):
    if os.path.exists(ruta):
        return
    print("  bajando %s" % os.path.basename(ruta))
    with urllib.request.urlopen(url) as r, open(ruta, "wb") as f:
        f.write(r.read())


def correr(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("FALLO: %s\n%s" % (" ".join(cmd), r.stderr[-2000:]))


def main():
    os.makedirs(TEMPORAL, exist_ok=True)
    os.makedirs(DESTINO, exist_ok=True)
    unicodes = "--unicodes=" + ",".join("U+%04X" % c for c in PUNTOS)
    print("subset de %d puntos de codigo, sin minusculas" % len(PUNTOS))

    caras = []
    for e in ENTRADAS:
        print("== %s" % e["cara"])
        origen = os.path.join(TEMPORAL, e["upstream"])
        bajar(e["url"], origen)
        licencia = os.path.join(DESTINO, e["licenciaArchivo"])
        bajar(e["licencia"], licencia)

        fuente = origen
        if e["pines"]:
            fuente = os.path.join(TEMPORAL, "pinchada-" + e["cara"] + ".ttf")
            correr([sys.executable, "-m", "fontTools.varLib.instancer", origen, "-o", fuente] + e["pines"])

        salida = os.path.join(DESTINO, e["salida"])
        correr([
            sys.executable, "-m", "fontTools.subset", fuente, unicodes,
            "--flavor=woff2", "--output-file=" + salida,
            "--name-IDs=" + NAME_IDS, "--layout-features=kern",
            "--no-hinting", "--drop-tables+=DSIG",
        ])
        bytes_ = os.path.getsize(salida)
        with open(salida, "rb") as f:
            gz = len(gzip.compress(f.read(), 9))
        print("   %s  %d B = %.2f KiB  (gzip del woff2: %.2f KiB)" % (e["salida"], bytes_, bytes_ / 1024, gz / 1024))
        caras.append({
            "cara": e["cara"],
            "familia": e["familia"],
            "enElRepo": e["salida"],
            "bytes": bytes_,
            "sha256": sha256(salida),
            "upstream": {"url": e["url"], "archivo": e["upstream"], "sha256": sha256(origen)},
            "licencia": {"nombre": "OFL-1.1", "url": e["licencia"], "enElRepo": e["licenciaArchivo"], "sha256": sha256(licencia)},
            "pines": e["pines"],
            "ejesVivos": ["wght"],
            "puntosDeCodigo": len(PUNTOS),
        })

    with open(MANIFIESTO, "w", encoding="utf-8") as f:
        json.dump({"generadoPor": "scripts-titular/subsetear-fuentes.py", "archivoWdth": ARCHIVO_WDTH, "caras": caras}, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("manifiesto: scripts-titular/manifiesto-fuentes.json")


if __name__ == "__main__":
    main()
