#!/bin/bash
# SPRINT ESCENA — las hojas lado a lado: una por momento, ACTUAL · V1 · V2 · V3, con rótulo.
# En el hero, una segunda fila con la zona bajo el logo ampliada: la sombra de hoy contra la mancha
# de contacto quieta de las variantes. Uso: hojas.sh <ancho> [recorte ancho:alto:x:y del hero]
set -e
ANCHO=${1:-1440}
RECORTE=${2:-720:450:600:300}
DIR=/c/Users/Valentino/.cache/b4-medicion/escena
FUENTE="C\\:/Windows/Fonts/arial.ttf"
rotulo() { echo "drawtext=fontfile='$FUENTE':text='$1':x=18:y=16:fontsize=34:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=8"; }
cd "$DIR"
for m in hero quienes-somos trabajos-de-noche por-que-develop pie; do
  entradas=""
  filtro=""
  i=0
  for v in actual v1 v2 v3; do
    nombre=$(echo "$v" | tr a-z A-Z)
    entradas="$entradas -i $m-$ANCHO-$v.png"
    if [ "$m" = hero ]; then
      filtro="$filtro[$i]split[e$i][c$i];[e$i]scale=720:-1,$(rotulo "$nombre")[f$i];[c$i]crop=$RECORTE,scale=720:-1,$(rotulo "$nombre - bajo el logo")[z$i];"
    else
      filtro="$filtro[$i]scale=720:-1,$(rotulo "$nombre")[f$i];"
    fi
    i=$((i + 1))
  done
  if [ "$m" = hero ]; then
    filtro="$filtro[f0][f1][f2][f3]hstack=inputs=4[fila1];[z0][z1][z2][z3]hstack=inputs=4[fila2];[fila1][fila2]vstack=inputs=2"
  else
    filtro="$filtro[f0][f1][f2][f3]hstack=inputs=4"
  fi
  ffmpeg -y -loglevel error $entradas -filter_complex "$filtro" "hoja-$m-$ANCHO.png"
  echo "hoja-$m-$ANCHO.png"
done
