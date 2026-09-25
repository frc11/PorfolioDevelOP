#!/bin/bash
# SPRINT ESCENA 2 — una hoja por idea: los cinco momentos en filas, BASE a la izquierda y la idea
# a la derecha, con rótulo. Uso: hojas-entorno.sh <ancho> <variante> [<variante>...]
# (las capturas las deja `entorno.ts <ancho> <alto> capturas`).
set -e
ANCHO=$1
shift
DIR=/c/Users/Valentino/.cache/b4-medicion/escena2/entorno
FUENTE="C\\:/Windows/Fonts/arial.ttf"
rotulo() { echo "drawtext=fontfile='$FUENTE':text='$1':x=14:y=12:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=6"; }
cd "$DIR"
for v in "$@"; do
  entradas=""
  filtro=""
  filas=""
  i=0
  for m in hero quienes-somos trabajos-de-noche por-que-develop pie; do
    entradas="$entradas -i $m-$ANCHO-base.png -i $m-$ANCHO-$v.png"
    a=$((i * 2))
    b=$((i * 2 + 1))
    filtro="$filtro[$a]scale=720:-1,$(rotulo "BASE - $m")[x$a];[$b]scale=720:-1,$(rotulo "$v - $m")[x$b];[x$a][x$b]hstack[r$i];"
    filas="$filas[r$i]"
    i=$((i + 1))
  done
  ffmpeg -y -loglevel error $entradas -filter_complex "${filtro}${filas}vstack=inputs=5" "hoja-$v-$ANCHO.png"
  echo "hoja-$v-$ANCHO.png"
done
