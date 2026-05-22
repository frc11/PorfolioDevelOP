# Runbook — BFG cleanup del leak de `enviroment.env`

**Fecha:** 2026-05-21
**Operador propuesto:** Franco (NO ejecutar autónomamente por Claude — operación destructiva con force-push)
**Estado al cierre del sprint env-vars:** archivo eliminado del working tree, `.gitignore` patcheado, **history aún contiene el secret**.

---

## 0. Resumen

El archivo `logic-core-v3/enviroment.env` (typo, faltaba la "n") estaba tracked en git history desde commit `3953558`. Contenía:

```
GOOGLE_GENERATIVE_AI_API_KEY=<UUID-format-key>
```

Franco confirmó que la key **estaba deshabilitada antes del descubrimiento** → no hay riesgo activo. El sprint de env-vars (2026-05-21) hizo el "fix superficial":

- `git rm --cached enviroment.env` → fuera del index, archivo borrado del working tree
- `.gitignore` patcheado para que `*enviroment*`, `*environment*`, `*.env` se ignoren además del `.env*` original
- Commit pendiente con esos dos cambios

**Lo que falta — este runbook:** borrar el archivo (y por lo tanto el secret) del git history para que no quede expuesto en forks/clones ni en el remote.

---

## 1. ¿Es necesario el BFG si la key ya está deshabilitada?

**Argumento a favor de hacerlo:**
- El secret sigue en history → cualquiera que clone el repo lo ve.
- Si en el futuro alguien rota la key bajo el mismo nombre y commitea por error, el lookup por nombre podría confundirse.
- Es la higiene correcta.

**Argumento contra:**
- Reescribir history requiere `git push --force` al remote. Si hay PRs abiertos, branches activos de otros, o forks, los rompés.
- Cualquiera que ya tenga clones locales tiene que re-clonar o hacer `git fetch + reset hard`.

**Recomendación:** sí, hacerlo — el costo es bajo en este repo (solo Franco + un socio) y el valor es higiene a largo plazo.

---

## 2. Pre-requisitos

Antes de correr BFG:

1. **Confirmar que la key está deshabilitada** en Google Cloud Console o donde corresponda. Hecho según Franco.
2. **Comunicar a cualquier dev con clone local** (en este caso el socio, si aplica). Después del force-push tienen que re-clonar o `git fetch && git reset --hard origin/<branch>`.
3. **Cerrar / mergear PRs abiertos** si los hay. El force-push los va a desbasar.
4. **Hacer backup del repo entero** (clonar a otro path):
   ```powershell
   cd C:\Users\franc\Desktop
   git clone --mirror https://github.com/<owner>/<repo>.git PorfolioDevelOP-backup-2026-05-21.git
   ```
5. **Verificar que el commit con `git rm enviroment.env` ya está pusheado** (o al menos commiteado localmente). Si no, BFG va a procesar history que después vas a sobreescribir.

---

## 3. Ejecutar BFG

BFG Repo-Cleaner es un wrapper sobre `git filter-repo` orientado a borrar archivos/secrets de history. Requiere Java.

### 3.1 Instalar (si no tenés)

```powershell
# Opción A — Scoop
scoop install bfg

# Opción B — descarga directa
# https://rtyley.github.io/bfg-repo-cleaner/
# Guardar bfg-X.Y.Z.jar en algún lugar conocido, ej C:\tools\bfg.jar
```

Verificar:
```powershell
java -jar C:\tools\bfg.jar --version
```

### 3.2 Clonar mirror (BFG opera sobre repos bare)

```powershell
cd C:\tmp
git clone --mirror https://github.com/<owner>/<repo>.git portfolio-mirror.git
cd portfolio-mirror.git
```

### 3.3 Correr BFG

```powershell
# Borra el archivo entero del history
java -jar C:\tools\bfg.jar --delete-files "enviroment.env" .

# Alternativa: reemplazar el valor en history sin borrar el archivo (si querés conservarlo como placeholder).
# Crear un archivo C:\tmp\secrets-to-redact.txt con una línea por secret:
#   43e09ffb-b632-48f7-be07-5538568abf18
# Y correr:
# java -jar C:\tools\bfg.jar --replace-text C:\tmp\secrets-to-redact.txt .
```

### 3.4 Limpiar referencias rotas y gc

```powershell
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 3.5 Push forzado al remote

```powershell
git push --force
```

⚠️ Esto reescribe el remote. Cualquier persona con clones queda fuera de sync hasta que re-clone o haga reset.

---

## 4. Post-BFG: lo que tenés que hacer en tu clone normal (no el mirror)

En tu working copy normal (`logic-core-v3/`):

```powershell
git fetch origin
# Backup defensivo
git branch backup-pre-bfg-2026-05-21

# Reset al estado nuevo
git checkout main
git reset --hard origin/main
```

Verificar:

```powershell
# El archivo no debería existir en ningún lado
git log --all -- enviroment.env
# Debería devolver: nada
```

---

## 5. Verificación post-cleanup

1. `git log --all --oneline -- enviroment.env` → cero output
2. `git log --all -p -S "43e09ffb-b632-48f7-be07"` → cero output (busca el valor literal en patches del history)
3. Re-clonar el repo en otro path y abrir la web de GitHub para confirmar que el archivo no aparece en ningún commit

---

## 6. Recordatorios de seguridad

- Aunque la key estaba deshabilitada, **siempre** asumir que cualquier secret que fue committed alguna vez está comprometido. Rotarlo.
- Para futuros leaks accidentales, el `.gitignore` actual cubre los patrones comunes (`.env*`, `*.env`, `*environment*`, `*enviroment*`). Si vas a crear un archivo con secrets bajo otro nombre, agregalo al `.gitignore` **antes** de pegarle un valor.
- Considerar habilitar [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning) para que avise si vuelve a pasar.

---

## 7. Estado al cierre del sprint env-vars (lo ya hecho)

- ✅ `git rm --cached enviroment.env`
- ✅ archivo borrado del working tree
- ✅ `.gitignore` actualizado con `*enviroment*`, `*environment*`, `*.env`
- ✅ Verificado: `git check-ignore -v enviroment.env` ahora matchea la regla `*enviroment*`
- ⚠️ Sin commitear esos cambios todavía — Franco decide cuándo
- ⚠️ Secret aún en history hasta correr BFG

Cuando Franco corra BFG, este runbook se puede archivar.

---

## 8. Estado post-sprint B0.6 (purga ejecutada localmente)

**Fecha de ejecución:** 2026-05-21
**Operador:** Claude (parte B del sprint B0.6)
**Herramienta usada:** `git-filter-repo` 2.47.0 (instalado vía `pip install --user git-filter-repo`) en vez de BFG. Decisión: BFG no estaba instalado, no hay Scoop en el sistema y `git-filter-repo` es la alternativa moderna recomendada por la propia documentación de git. Resultado equivalente.

### 8.1 Lo que se hizo

1. Backup mirror desde el remote actual:
   ```
   C:\tmp\bfg-purge-2026-05-21\portfolio-mirror.git   (180 MB, 210 commits)
   ```
2. Purga sobre el mirror:
   ```powershell
   cd C:\tmp\bfg-purge-2026-05-21\portfolio-mirror.git
   & "C:\Users\franc\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\Scripts\git-filter-repo.exe" --path logic-core-v3/enviroment.env --invert-paths --force
   ```
3. Verificación dentro del mirror:
   - `git log --all --full-history -- logic-core-v3/enviroment.env` → cero output ✓
   - `git log --all --full-history -- enviroment.env` → cero output ✓
   - `git log --all -p -S "43e09ffb-b632-48f7-be07"` → cero output ✓
   - Commit `3953558` (que contenía el archivo) reescrito a `7f69ff1` con el mismo mensaje pero sin el archivo en el tree ✓
   - HEAD del mirror cambió de `7d551ba` a `14dc98f` (todos los SHAs posteriores al commit infectado también cambiaron — esperado).

### 8.2 Lo que NO se hizo (queda para Franco)

- ❌ `git push --force` al remote — operación destructiva con coordinación de equipo requerida.
- ❌ Reset del clone local de Franco al estado purgado.
- ❌ Comunicación al socio para que re-clone.

### 8.3 Pasos exactos del force-push (cuando Franco coordine con el socio)

> ⚠️ **Antes de correr esto, confirmar:**
> 1. El socio sabe que viene un force-push y va a re-clonar/resetear su clon.
> 2. No hay PRs abiertos contra `main` (los va a desbasar).
> 3. La key `43e09ffb-…` sigue deshabilitada en Google Cloud (Franco ya rotó — confirmado).

**Paso A — commitear y pushear el estado actual del working tree (rm + .gitignore + cambios del sprint env-vars), si todavía no está pusheado.**
Esto es importante para que el state que querés conservar quede *después* del commit infectado en términos de history. Si lo hacés *después* del force-push, vas a tener que rebasear / mergear contra una history reescrita.

Chequear si hay commits locales sin pushear:
```powershell
cd C:\Users\franc\Desktop\PorfolioDevelOP
git status
git log origin/main..HEAD --oneline
```

Si hay cambios locales sin commitear todavía (es el caso al cierre del sprint B0.6 — ver Sección 9 de la bitácora):
```powershell
# Stagear y commitear (revisar qué entra antes — git status / git diff --staged)
git add -A
git commit -m "chore: cleanup secrets + env-vars sprint cleanup"
git push origin main
```

**Paso B — re-clonar el mirror si pasó tiempo entre la purga y este momento.**
Si Franco corre esto el mismo día que se purgó el mirror, puede usar `C:\tmp\bfg-purge-2026-05-21\portfolio-mirror.git` tal cual. Si pasó tiempo y se pushearon nuevos commits, hay que regenerar el mirror:
```powershell
cd C:\tmp
Remove-Item -Recurse -Force C:\tmp\bfg-purge-2026-05-21\portfolio-mirror.git
mkdir C:\tmp\bfg-purge-2026-05-21
cd C:\tmp\bfg-purge-2026-05-21
git clone --mirror https://github.com/frc11/PorfolioDevelOP.git portfolio-mirror.git
cd portfolio-mirror.git
& "C:\Users\franc\AppData\Local\Packages\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\LocalCache\local-packages\Python313\Scripts\git-filter-repo.exe" --path logic-core-v3/enviroment.env --invert-paths --force
```

**Paso C — agregar remote (filter-repo lo borra por seguridad) y force-push.**
```powershell
cd C:\tmp\bfg-purge-2026-05-21\portfolio-mirror.git
git remote add origin https://github.com/frc11/PorfolioDevelOP.git
git push --force --all origin
git push --force --tags origin
```

**Paso D — sincronizar el clone local de Franco con la history nueva.**
```powershell
cd C:\Users\franc\Desktop\PorfolioDevelOP

# Backup defensivo por si algo sale mal
git branch backup-pre-bfg-2026-05-21

# Sincronizar
git fetch origin
git checkout main
git reset --hard origin/main
```

**Paso E — verificación post force-push.**
```powershell
git log --all --full-history -- logic-core-v3/enviroment.env
# Debería devolver: nada

git log --all -p -S "43e09ffb-b632-48f7-be07"
# Debería devolver: nada
```
Y abrir la URL del commit infectado original en GitHub para confirmar 404:
- `https://github.com/frc11/PorfolioDevelOP/commit/3953558` → debería dar "Not Found"

**Paso F — comunicación al socio.** Mensaje sugerido para Slack/WhatsApp:

> Hice un force-push al `main` para borrar un secret que había quedado en la history. Si tenés un clone del repo, hacé esto en tu máquina:
>
> ```bash
> cd <ruta-al-repo>
> git fetch origin
> git checkout main
> git reset --hard origin/main
> ```
>
> Si tenés ramas propias con trabajo en curso, avisame antes — vamos a tener que rebasear sobre el `main` nuevo.

### 8.4 Una vez completado todo lo de 8.3

- Borrar el directorio `C:\tmp\bfg-purge-2026-05-21\` (ya no hace falta).
- Archivar este runbook (marcar como histórico).

