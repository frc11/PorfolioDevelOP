#!/bin/bash
# SPRINT ESCENA 3 — hojas lado a lado: los momentos en filas, una variante a la izquierda y otra a la
# derecha, con rótulo. Las capturas las deja `comparar.ts <ancho> <alto> capturas "<izq> <der>"`.
# Uso: hojas.sh <ancho> <izquierda> <derecha> [momentos separados por espacio] [nombre]
set -e
ANCHO=$1
IZQ=$2
DER=$3
MOMENTOS=${4:-"hero quienes-somos trabajos-de-noche por-que-develop pie"}
DIR=/c/Users/Valentino/.cache/b4-medicion/escena3/hojas
FUENTE="C\:/Windows/Fonts/arial.ttf"
rotulo() { echo "drawtext=fontfile='$FUENTE':text='$1':x=14:y=12:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=6"; }
archivo() { echo "$1" | tr ',=' '__'; }
NOMBRE=${5:-"hoja-$(archivo "$IZQ")-vs-$(archivo "$DER")-$ANCHO"}
LADO=$([ "$ANCHO" -ge 1000 ] && echo 720 || echo "$ANCHO")
cd "$DIR"
entradas=""
filtro=""
filas=""
i=0
for m in $MOMENTOS; do
  entradas="$entradas -i $m-$ANCHO-$(archivo "$IZQ").png -i $m-$ANCHO-$(archivo "$DER").png"
  a=$((i * 2))
  b=$((i * 2 + 1))
  filtro="$filtro[$a]scale=$LADO:-2,$(rotulo "$IZQ - $m")[x$a];[$b]scale=$LADO:-2,$(rotulo "$DER - $m")[x$b];[x$a][x$b]hstack[r$i];"
  filas="$filas[r$i]"
  i=$((i + 1))
done
ffmpeg -y -loglevel error $entradas -filter_complex "${filtro}${filas}vstack=inputs=$i" "$NOMBRE.png"
echo "$DIR/$NOMBRE.png"
