#!/usr/bin/env bash
# [B12a.8] Corre un banco recién con 3 GB libres (la regla de los procesos pesados con servicios en paralelo): espera de a 10 s.
#   bash scripts-carga/con-memoria.sh npx tsx scripts-carga/velo.ts
libres() { powershell -NoProfile -Command '[math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)' | tr -d '\r'; }
while [ "$(libres)" -lt "${MINIMO_MB:-3000}" ]; do sleep 10; done
echo "[con-memoria] $(libres) MB libres"
exec "$@"
