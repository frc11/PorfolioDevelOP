# Backups y Disaster Recovery — Neon PostgreSQL

## Estado a verificar (Franco debe hacerlo)

1. Login a https://console.neon.tech
2. Ir al proyecto develOP
3. Verificar:
   - ¿Plan free o paid? (free no incluye backups automáticos confiables)
   - ¿Point-in-time recovery habilitado? (requiere plan paid)
   - ¿Cuánto retention? (default 7 días en free, 30+ en paid)
   - ¿Branches configuradas? (Neon permite crear "branches" como snapshots)

## Plan recomendado

### Si estás en plan Free:
- **Considerar upgrade a Launch ($19/mes)** para tener backups confiables
- Mientras tanto: hacer dumps manuales semanales

### Backup manual semanal

```bash
# Comando para hacer dump completo
pg_dump $DATABASE_URL > backups/develop-$(date +%Y%m%d).sql

# Comprimir
gzip backups/develop-$(date +%Y%m%d).sql

# Subir a Google Drive o S3 manualmente
```

### Cron job para automatizar (recomendado)

Si tenés un servidor con cron, agregar:

```cron
0 3 * * 0 cd /path/to/project && pg_dump $DATABASE_URL | gzip > /backups/develop-$(date +\%Y\%m\%d).sql.gz
```

(Backup todos los domingos a las 3am)

## Disaster Recovery Plan

### Escenario: Neon DB inaccesible o corrupta

1. Verificar status: https://status.neon.tech
2. Si es problema de Neon, esperar y comunicar a clientes
3. Si es corrupción nuestra:
   - Restaurar último backup: `psql $DATABASE_URL < backup.sql`
   - Re-correr migraciones pendientes: `npx prisma migrate deploy`
   - Verificar integridad: queries de smoke test

### Escenario: Necesitamos rollback a punto específico

1. Si tenemos PITR (Point-in-time Recovery): usar dashboard de Neon
2. Si no: usar último backup manual disponible

### Tiempo objetivo de recuperación (RTO): 4 horas
### Punto objetivo de recuperación (RPO): 7 días (con backups semanales)

## Mejoras futuras

- Implementar backups diarios automáticos (cuando haya 5+ clientes activos)
- Replica read-only para reporting (cuando el load aumente)
- Monitoring de latencia DB en Sentry
