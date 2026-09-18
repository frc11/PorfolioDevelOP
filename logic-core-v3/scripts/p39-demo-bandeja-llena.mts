/**
 * P39 · DEMOSTRACIÓN — la bandeja de `setter-qa` llena. Branch Neon dev, y nada más.
 *
 * El panel de Novedades lee los 50 avisos sin leer MÁS NUEVOS del setter
 * (`AVISOS_LEIDOS`, `novedades.ts`). Una prueba que afirma sobre sus avisos en la
 * bandeja de la persona compartida depende de que nadie más le deje 50 avisos más
 * nuevos que los suyos mientras corre — exactamente lo que hace otra corrida en
 * paralelo sobre `setter-qa`, o la fuga de 07-G1 acumulada.
 *
 * `--sembrar` crea 50 avisos `LEAD_REASIGNADO_SALIENTE` sin lead para `setter-qa`
 * con fecha de dentro de dos horas (así quedan delante de lo que la prueba cree
 * durante la corrida) y ANOTA cada id en el registro antes de crear el siguiente.
 * `--limpiar` borra por esos ids y verifica que no queda ninguno.
 *
 * Uso:
 *   npx tsx scripts/p39-demo-bandeja-llena.mts --sembrar --registro=C:/tmp/p39-fugas/demo-n6/registro.json
 *   npx tsx scripts/p39-demo-bandeja-llena.mts --limpiar --registro=C:/tmp/p39-fugas/demo-n6/registro.json
 */
import fs from 'fs'
import path from 'path'
import { config as loadEnv } from 'dotenv'
import { DEV_BRANCH_HOST } from './dev/siembra-categorias.mts'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL?.includes(DEV_BRANCH_HOST)) {
  console.error('ABORT: DATABASE_URL no apunta a la branch Neon dev.')
  process.exit(1)
}

const arg = (nombre: string) =>
  process.argv.find((a) => a.startsWith(`--${nombre}=`))?.split('=').slice(1).join('=') ?? null
const flag = (nombre: string) => process.argv.includes(`--${nombre}`)

const CANTIDAD = 50
const ADELANTO_MS = 2 * 60 * 60 * 1000

async function main() {
  const registro = arg('registro')
  if (!registro) throw new Error('falta --registro=<archivo.json>')
  const { prisma } = await import('@/lib/prisma')

  if (flag('sembrar')) {
    if (fs.existsSync(registro)) throw new Error(`el registro ya existe (${registro}): limpiá antes de sembrar otra vez`)
    fs.mkdirSync(path.dirname(registro), { recursive: true })
    const qa = await prisma.user.findUniqueOrThrow({ where: { email: 'setter-qa@develop.test' }, select: { id: true } })
    const ids: string[] = []
    fs.writeFileSync(registro, JSON.stringify({ avisos: ids }))
    for (let i = 0; i < CANTIDAD; i += 1) {
      const aviso = await prisma.osSetterNotice.create({
        data: {
          setterId: qa.id,
          leadId: null,
          kind: 'LEAD_REASIGNADO_SALIENTE',
          title: 'Te reasignaron un lead',
          body: `P39-DEMO bandeja llena ${i} pasó a otro setter. Ya no está en tu cartera.`,
          createdAt: new Date(Date.now() + ADELANTO_MS + i),
        },
        select: { id: true },
      })
      ids.push(aviso.id)
      fs.writeFileSync(registro, JSON.stringify({ avisos: ids }))
    }
    console.log(`sembrados ${ids.length} avisos para setter-qa · registro → ${registro}`)
  } else if (flag('limpiar')) {
    const { avisos } = JSON.parse(fs.readFileSync(registro, 'utf8')) as { avisos: string[] }
    const borrados = await prisma.osSetterNotice.deleteMany({ where: { id: { in: avisos } } })
    const quedan = await prisma.osSetterNotice.count({ where: { id: { in: avisos } } })
    console.log(`registro ${avisos.length} · borrados ${borrados.count} · quedan ${quedan}`)
    if (quedan !== 0) process.exitCode = 1
    else fs.renameSync(registro, `${registro}.limpiado`)
  } else {
    throw new Error('--sembrar o --limpiar')
  }
  await prisma.$disconnect()
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
