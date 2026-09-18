<#
LIMPIAR — mata los node.exe/chrome.exe que este worktree dejo colgados.

Descubierto ANTES de escribir el filtro (no adivinado):
  - `npm run dev`/`dev:qa`/`start*` resuelven `next` dentro de node_modules del
    worktree: la linea de comando del proceso lleva la ruta absoluta del
    worktree.
  - Los bancos de medicion (scripts-b*/, scripts-<sprint>/) NO usan Playwright:
    lanzan su propio Chrome por CDP con `scripts-b4/cdp.ts` (`lanzarChrome`),
    que fija el perfil en `C:\Users\<user>\.cache\b4-medicion\<quien>` — un
    directorio FUERA del worktree, por diseno (queda vivo entre corridas). Ese
    Chrome raiz es HIJO del proceso node.exe que corre el script (`npx tsx
    scripts-bN/algo.ts`), y a su vez el raiz tiene hijos propios
    (crashpad-handler, gpu-process, utility, renderer) que NO repiten
    `--user-data-dir` en su propia linea de comando — hay que matarlos por
    parentesco, no por patron.
  - `chrome-devtools-mcp` (los tres node.exe permanentes que este script nunca
    toca) usa su PROPIO perfil fijo (`~/.cache/chrome-devtools-mcp/...`) y
    rutas bajo `AppData\Roaming\npm` / `AppData\Local\npm-cache\_npx` — ninguna
    contiene la ruta del worktree ni `.cache\b4-medicion`, asi que el filtro de
    abajo ya los deja afuera sin necesitar la exclusion explicita (que igual
    esta, por las dudas).

Filtro (las dos formas permitidas de probar pertenencia a ESTE worktree):
  (a) la linea de comando contiene la ruta de este worktree, o
  (b) es un Chrome (o un hijo de un Chrome) cuyo `--user-data-dir` cae bajo el
      cache de bancos de ESTE repo (`.cache\b4-medicion\`).
  Nunca por nombre de comando solo (`npx tsx`, `next`, etc.): ese filtro ya
  mato el envoltorio de una sesion vecina de Claude Code, que tambien corre
  como node.exe.

Riesgo declarado, no escondido: el cache de bancos es POR USUARIO, no por
worktree (`b4-medicion` es un nombre historico compartido por diseno entre
sesiones vecinas que midieron en paralelo, ver comentarios de
`scripts-b6/b6-comun.ts` y `scripts-b8/b8-comun.ts` sobre C:\v3-costura,
C:\v3-luz, C:\v3-defectos). Si dos worktrees usaran el MISMO nombre de perfil
(`quien`) a la vez, este filtro no los distingue. Mitigado en la practica
porque cada sprint uso un nombre de perfil distinto (b4, b6, b7, b8, b11,
titular, movil, compo, compo2, papel, texto, blend, boton, deslizar, ancho1...).
Si alguna vez hace falta blindarlo del todo, la unica ruta segura es que cada
worktree reciba su propio prefijo de perfil en `cdp.ts`.

Uso:
  npx pwsh scripts/limpiar.ps1              # mata los colgados de este worktree, <5s
  npx pwsh scripts/limpiar.ps1 -Profundo    # igual, mas un listado completo para un humano
#>

param(
  [switch]$Profundo
)

$ErrorActionPreference = 'Stop'

# Raiz del worktree = un nivel arriba de este archivo (scripts/limpiar.ps1).
$Worktree = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path.TrimEnd('\')
$CacheBancos = '.cache\b4-medicion\'
$MarcaPermanente = 'chrome-devtools-mcp'

function Contiene([string]$Texto, [string]$Patron) {
  if ([string]::IsNullOrEmpty($Texto)) { return $false }
  return $Texto.IndexOf($Patron, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Recortar([string]$Texto, [int]$Largo = 140) {
  if ([string]::IsNullOrEmpty($Texto)) { return '' }
  if ($Texto.Length -le $Largo) { return $Texto }
  return $Texto.Substring(0, $Largo) + '...'
}

function MemoriaLibreKB {
  (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory
}

Write-Host "Memoria libre ANTES: $(MemoriaLibreKB) KB"

$procesos = Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='chrome.exe'" |
  Select-Object ProcessId, ParentProcessId, Name, CommandLine, CreationDate, WorkingSetSize

# node.exe de ESTE worktree: la linea de comando lleva su ruta absoluta.
# Nunca los permanentes de chrome-devtools-mcp.
$raicesNode = $procesos | Where-Object {
  $_.Name -eq 'node.exe' -and
  (Contiene $_.CommandLine $Worktree) -and
  -not (Contiene $_.CommandLine $MarcaPermanente)
}

# chrome.exe RAIZ de un banco de este repo: por ruta del worktree, o por su
# perfil bajo el cache de bancos.
$raicesChrome = $procesos | Where-Object {
  $_.Name -eq 'chrome.exe' -and
  ((Contiene $_.CommandLine $Worktree) -or (Contiene $_.CommandLine $CacheBancos)) -and
  -not (Contiene $_.CommandLine $MarcaPermanente)
}

# Hijos de esas raices (crashpad-handler, gpu-process, utility, renderer): no
# repiten --user-data-dir en su propia linea, se identifican por parentesco.
$idsRaicesChrome = @($raicesChrome | ForEach-Object { $_.ProcessId })
$hijosChrome = $procesos | Where-Object {
  $_.Name -eq 'chrome.exe' -and
  $idsRaicesChrome.Count -gt 0 -and
  ($idsRaicesChrome -contains $_.ParentProcessId) -and
  -not ($idsRaicesChrome -contains $_.ProcessId)
}

$aMatar = @($raicesNode) + @($raicesChrome) + @($hijosChrome) |
  Sort-Object ProcessId -Unique

if ($aMatar.Count -eq 0) {
  Write-Host "Nada que matar: ningun node.exe/chrome.exe de este worktree quedo colgado."
} else {
  foreach ($p in $aMatar) {
    $linea = Recortar $p.CommandLine
    try {
      Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
      Write-Host "MATADO   PID $($p.ProcessId)  $($p.Name)  $linea"
    } catch {
      Write-Host "NO SE PUDO MATAR   PID $($p.ProcessId)  $($p.Name)  -- $($_.Exception.Message)"
    }
  }
}

$noIdentificados = @($procesos | Where-Object {
  ($aMatar.ProcessId -notcontains $_.ProcessId) -and
  -not (Contiene $_.CommandLine $MarcaPermanente)
}).Count
if ($noIdentificados -gt 0) {
  Write-Host "$noIdentificados proceso(s) node/chrome no identificados con certeza como de este worktree -- no tocados. Correr -Profundo para verlos."
}

if ($Profundo) {
  Write-Host "`n--- LISTADO COMPLETO node.exe / chrome.exe (para revision humana; nada de esto se mato salvo lo de arriba) ---"
  $ahora = Get-Date
  $procesos | ForEach-Object {
    $edadMin = try { [math]::Round(($ahora - $_.CreationDate).TotalMinutes, 1) } catch { $null }
    [PSCustomObject]@{
      PID         = $_.ProcessId
      PPID        = $_.ParentProcessId
      Nombre      = $_.Name
      EdadMin     = $edadMin
      RAM_MB      = [math]::Round(($_.WorkingSetSize / 1MB), 1)
      CommandLine = Recortar $_.CommandLine 160
    }
  } | Sort-Object Nombre, PID | Format-Table -AutoSize -Wrap | Out-String -Width 220 | Write-Host
}

Write-Host "`nMemoria libre DESPUES: $(MemoriaLibreKB) KB"
