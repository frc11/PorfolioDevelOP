---
name: pagina-home-based
description: Criterio de develOP para diseñar, construir o ajustar cualquier página o sección visible de /v3 (home, servicios, nosotros, blog, trabajos) y las variantes de escena. Usala siempre que el trabajo toque algo que se ve en /v3, un título 3D, un revelado, la escena por ruta, una transición entre páginas, o un sprint que termina en FRENO.
---

# Página home-based: cómo se trabaja una página de develOP

develOP es una agencia de Tucumán (Valentino y Franco). `/v3` es el rediseño del sitio: un home con una escena 3D viva y páginas que la comparten. Toda página nueva tiene que ser **home-based**: quien viene del home siente que no salió del sitio.

Esta skill es la copia para Claude Code del criterio del chat que planifica el home. Las fuentes mandan sobre esta copia: `claude/MANUAL-HOME-BASED.md` y `claude/ESCENA-CONTRATO.md`, en el proyecto de claude.ai. Si el prompt de Valentino contradice algo de acá, gana el prompt; si notás que esta skill quedó vieja frente al código, avisalo en el reporte y no lo "arregles" por tu cuenta.

## Qué leer, según el trabajo

| Si el trabajo es… | Leé además |
|---|---|
| Cualquier cosa visible | `GUSTO.md` (qué le gusta y qué no a Valentino) |
| Un sprint, un plan o un FRENO | `METODO.md` |
| Algo que cruza la frontera home ↔ páginas, la escena por ruta, la navbar o las transiciones | `CONTRATO.md` |
| Una variante de escena de una página | `VARIANTES.md` y `CONTRATO.md` §Ranura |

Y siempre, antes de tocar código: el log del sprint en curso de tu línea (`docs/rediseno/SPRINT-*.md` en el home, `docs/servicios/SPRINT-*.md` en servicios). Leé lo que existe antes de crear; no dupliques lógica.

## El ADN, en orden de importancia

1. **La escena viva.** La sala, el logo en el centro, el piso de bloques con energía en las juntas, el domo, el cristal, el ciclo de día y noche, y de noche el plasma y la red. Es la protagonista. En las páginas aparece en la intro y en el pie, con su variante.
2. **Los títulos 3D impresos** (`TituloDeVolumen`). Aparecen en su lugar con su animación y se van con una caída; nunca suben desde abajo ni desaparecen de golpe.
3. **El movimiento atado al scroll**, con los revelados de `_secciones/_contrato/`. Hay dos tipos y se eligen a propósito:
   - **progresivos:** siguen al scroll;
   - **gatillos:** una animación entera que se dispara al cruzar un punto y vuelve al subir.
4. **Papel y tinta.** Las secciones de lectura son opacas, en papel, con tinta oscura. La escena se tapa cuando hay que leer.
5. **Una sola voz de acento por página.** Web celeste, software violeta, IA verde. En la escena, el acento es luz (plasma, haz, filo, brillos), nunca superficie. Sobre papel van los oscuros; sobre la escena, los claros.
6. **El vidrio** para lo que flota sobre la escena: blanco al 4 %, `blur` de 20 px, saturación 180 %, borde blanco al 8 %.
7. **El sonido, sutil:** un tic al cambiar, un pestillo al confirmar. Siempre respeta el mute.
8. **La continuidad.** Entre páginas, la escena no se corta: viaja o pasa el velo (ver `CONTRATO.md`).
9. **El celular es otra experiencia**, no la de escritorio apretada; el ejemplo es el Portfolio en historias. Por debajo de 1024, la escena va en calidad compacta.

## Qué tipo de trabajo es

**Una sección del home** (`src/app/v3/_secciones/**`):
- **REGLA DE ALTURAS:** cambiar el alto de una sección corre el mapeo de la escena. Se compensa con `TRAMO_ESTIRADO` (`_lib/escena/tramoEstirado.ts`, una k por ancho); `_lib/secciones.ts` no se toca. Medí la deriva antes y después.
- Hay invariantes que no se rompen: s74, s75-carga (`?diag=carga`) y s76-portfolio.

**Una página** (`src/app/v3/[servicio]/`, nosotros, blog):
- tiene tres tramos: la intro con escena, el cuerpo en papel y el pie genérico;
- la escena, la cámara, el título 3D, la navbar y el velo son del home; la página pone el contenido, el cuerpo y su variante;
- una sola maqueta se aprueba y se replica por la plantilla: lo propio de cada servicio sale de los datos, no de componentes distintos.

**Una variante de escena** (`src/app/v3/_servicios/escena/`):
- se enchufa a la ranura del home y nunca toca `src/app/v3/_lib/**`;
- se rige por `VARIANTES.md`.

## Reglas duras (literal)

- Nunca `git add .`: se agregan los archivos por nombre.
- PROHIBIDO: `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte, `git stash`. Los merges entre ramas los hace Valentino a mano.
- Frozen, solo se consumen: `src/components/3d/HeroArtifact.tsx`, `src/context/TransitionContext.tsx`, `src/context/PreloaderContext.tsx`, `prisma/schema.prisma`, `src/auth.ts`, `src/lib/prisma.ts`, `src/components/ui/*`.
- Archivos compartidos con el sitio vivo: se cambia CÓMO se importa, nunca QUÉ renderiza. Las zonas de Franco no se tocan.
- Cero `any`, nunca `router.push` directo, nunca `prisma migrate reset`, nunca secretos hardcodeados.
- Nunca auto-confirmar que algo funciona porque compila. La coreografía la mira Valentino.
- Nunca debilitar un test para que pase.
- Nada de contenido inventado: ni cifras, ni reseñas, ni números de WhatsApp. Lo que falta va marcado con la llave de contenido falso.
- Los tests y el bench nunca llaman a `/api/contacto` ni a `/api/newsletter` reales (la Neon es compartida).
- `src/app/v3/_lib/motion/lente.ts` no entra en ningún commit. Tags solo en hitos. Una sola sesión de CC por worktree.

## Gate de verificación

El build de producción está rojo por errores de base ajenos, así que "build verde" no es el gate. No corras `next build` salvo que el prompt lo pida (O-10). El gate es esto:

1. lint limpio en los archivos tocados;
2. `$env:NODE_OPTIONS="--max-old-space-size=4096"; .\node_modules\.bin\tsc.cmd --noEmit`, sin errores nuevos;
3. `npm run verificar`, comparando **la lista de fallas** contra la base, no los colores de los grupos:
   - la base son s1, s2, s3, s4, s5, s7, s8 y s17;
   - en el worktree de servicios, s38, s44 y s74 también fallan por los finales de línea, hasta el sprint P-H;
4. las invariantes que toque el trabajo y el bench (cuadros, disco y memoria);
5. la revisión visual en reposo, desktop y mobile, si la herramienta está disponible; si no, decilo.

Si un proceso muere por memoria (la máquina tiene 16 GB y WebGL pierde pool no paginado), se reintenta una vez; si vuelve a morir, se reporta. Nunca se saltea una verificación.

## Cómo se cierra

Todo sprint visual termina en un **FRENO**: commit hecho, verificación pegada y la lista de qué tiene que mirar Valentino, con la URL y el ancho de cada cosa. Después de eso no se sigue sin su feedback. El detalle está en `METODO.md`.
