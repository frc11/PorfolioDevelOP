# Regenerar el Atlas

> Comandos exactos en PowerShell, desde `logic-core-v3`. Los generadores leen el árbol de la ref con git, no compilan ni tocan la base: no necesitan `.env.local`, y como no son pesados en memoria, DEC-42 no los frena. Los datos que mantienen las personas (`funcionalidades.json`, `zonas.json`, `entradas.json`, `atlas.curado.json`) no se pisan nunca.

## Cuándo

Después de cada merge a `main` que agregue, mueva o borre páginas, handlers, server actions, modelos o carpetas de `src/`, y antes de planificar un sprint con el Atlas.

## Pasos

```powershell
# 1. atlas.json desde main (o una rama, o el árbol de trabajo con --ref worktree); agrega una línea a historial.jsonl
node scripts/auditoria/atlas/generar.mjs --ref origin/main

# 2. hallazgos.json desde los .md de la auditoría (02, 03, 04, 05, 10)
node scripts/auditoria/validar.mjs --emitir

# 3. las vistas .md (rutas, datos, dependencias, ramas, modulos/)
node scripts/auditoria/atlas/vistas.mjs

# 4. controlar los JSON contra el contrato y la integridad del grafo
node scripts/auditoria/atlas/validar-atlas.mjs
```

Desde otro repo o carpeta: `node <ruta>/generar.mjs --repo <raíz del repo> --ref <ref> --app <carpeta de la app> --atlas <carpeta del Atlas>`. Con `--sin-ramas` se saltea el análisis de ramas (el paso más lento).

## Controles

- `generar.mjs` imprime `control`: páginas, handlers, archivos con server actions, modelos y funcionalidades. En `57c421bc` dio 86 · 36 · 92 · 63 · 445, lo mismo que el inventario de F1 (`01-INVENTARIO.md`). Si un número cambia sin que haya cambiado el código, el generador se rompió.
- `validar-atlas.mjs` falla si un JSON no cumple `atlas.schema.json`, si una arista apunta a un nodo que no existe o si `atlas.curado.json` tiene un id que ya no es nodo (por ejemplo, porque se renombró una funcionalidad).
- `historial.jsonl` suma una línea por corrida: es la curva de progreso (madurez, veredicto, alcance, hallazgos abiertos, LOC).

## Mantener lo curado

- **Una funcionalidad nueva** va a mano en `funcionalidades.json` (id `<herramienta>.<slug>`, nombre, padre, archivos, entradas) y en `atlas.curado.json` con su madurez y evidencia.
- **Un archivo que cambia de zona** (por ejemplo, cuando se decida la política de `11-CONGELADOS.md`) se cambia en `zonas.json`.
- **Una carpeta nueva de `src/`** necesita una regla en `scripts/auditoria/atlas/nodos.mjs`. Sin regla cae en `lib.<carpeta>`. Los IDs no se renombran: si algo se mueve, se agrega una regla.
- **`alcance`** lo deciden Valentino y Franco en `atlas.curado.json`, con una entrada en `decisiones` (fecha, texto, quién).
