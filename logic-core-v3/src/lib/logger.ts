type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class LogicLogger {
  private isDev = process.env.NODE_ENV === 'development'

  private writeStdout(message: string) {
    process.stdout.write(`${message}\n`)
  }

  private format(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString()

    if (this.isDev) {
      const icons = { info: 'i', warn: '!', error: 'x', debug: '*' }
      this.writeStdout(`${icons[level] || '>'} [${timestamp}] ${message}`)

      if (meta) {
        if (meta instanceof Error) {
          console.error(meta)
        } else {
          this.writeStdout(typeof meta === 'string' ? meta : JSON.stringify(meta, null, 2))
        }
      }

      return
    }

    const serializedMeta =
      meta instanceof Error
        ? {
            name: meta.name,
            message: meta.message,
            stack: meta.stack,
          }
        : meta

    this.writeStdout(
      JSON.stringify({
        level,
        timestamp,
        message,
        ...(typeof serializedMeta === 'object' && serializedMeta !== null
          ? serializedMeta
          : { data: serializedMeta }),
      })
    )
  }

  info(msg: string, meta?: unknown) {
    this.format('info', msg, meta)
  }

  warn(msg: string, meta?: unknown) {
    this.format('warn', msg, meta)
  }

  error(msg: string, meta?: unknown) {
    this.format('error', msg, meta)
  }

  debug(msg: string, meta?: unknown) {
    this.format('debug', msg, meta)
  }

  ai(stage: 'request' | 'response' | 'error' | 'streaming' | 'success', details: unknown) {
    const level = stage === 'error' ? 'error' : 'info'
    this.format(level, `AI_${stage.toUpperCase()}`, details)
  }
}

export const logger = new LogicLogger()
