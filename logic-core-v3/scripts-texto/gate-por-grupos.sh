#!/usr/bin/env bash
# TEXTO-1 · el gate corrido POR GRUPOS, con reanudación.
#
# `npm run verificar` corre los 27 agregados adentro de UN proceso que vive
# veinte minutos. En esta máquina —14 GB, con el resto de las cosas abiertas— el
# vigilante de memoria del harness lo mató dos veces, una en `tsc` y otra en el
# agregado 19. Correr el mismo trabajo grupo por grupo deja el pico donde estaba
# —cada agregado ya se ejecuta en su propio proceso— pero hace que una muerte
# cueste UN grupo y no la corrida entera: lo hecho queda en su `.log` y la
# siguiente pasada lo saltea.
#
# No cambia qué se corre ni cómo: es el mismo `s4-agregado.ts` con el mismo
# argumento que usa `verificar`. Lo que no reproduce es el resumen de los pasos
# 1, 1b y 2, que van aparte.
#
#     bash scripts-texto/gate-por-grupos.sh <carpeta-de-salidas>

set -u
SALIDA="${1:?falta la carpeta de salidas}"
mkdir -p "$SALIDA"

GRUPOS="s1 s10 s10e s11e s12e s13b s13e s14e s15e s16 s17 s18 s19 s2 s20 s21 s22 s3 s4 s5 s6 s7 s7e s8 s8e s9 s9e"

for g in $GRUPOS; do
  if [ -f "$SALIDA/$g.exit" ]; then
    echo "saltado (ya estaba): $g"
    continue
  fi
  npx tsx src/app/v3/_lib/__tests__/s4-agregado.ts "$g" > "$SALIDA/$g.log" 2>&1
  code=$?
  echo "$code" > "$SALIDA/$g.exit"
  echo "grupo $g -> exit $code"
done
echo "GRUPOS_TERMINADOS"
