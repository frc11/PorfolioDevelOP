type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LogicLogger {
    private isDev = process.env.NODE_ENV === 'development';

    private format(level: LogLevel, message: string, meta?: any) {
        const timestamp = new Date().toISOString();

        if (this.isDev) {
            // Iconos visuales para consola local
            const icons = { info: 'ℹ️', warn: '⚠️', error: '❌', debug: '🐛' };
            console.log(`${icons[level] || '🤖'} [${timestamp}] ${message}`);
            if (meta) {
                // If meta is an error, we want to see the stack
                if (meta instanceof Error) {
                    console.error(meta);
                } else {
                    console.log(meta);
                }
            }
        } else {
            // JSON para Vercel/Datadog
            // Ensure error objects are serialized properly
            const serializedMeta = meta instanceof Error ? {
                name: meta.name,
                message: meta.message,
                stack: meta.stack,
            } : meta;

            console.log(JSON.stringify({
                level,
                timestamp,
                message,
                ...(typeof serializedMeta === 'object' ? serializedMeta : { data: serializedMeta })
            }));
        }
    }

    info(msg: string, meta?: any) { this.format('info', msg, meta); }
    warn(msg: string, meta?: any) { this.format('warn', msg, meta); }
    error(msg: string, meta?: any) { this.format('error', msg, meta); }
    debug(msg: string, meta?: any) { this.format('debug', msg, meta); }

    // Traza específica para IA
    ai(stage: 'request' | 'response' | 'error' | 'streaming' | 'success', details: any) {
        const level = stage === 'error' ? 'error' : 'info';
        this.format(level, `AI_${stage.toUpperCase()}`, details);
    }
}

export const logger = new LogicLogger();
