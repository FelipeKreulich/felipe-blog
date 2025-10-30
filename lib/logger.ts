import { prisma } from '@/lib/prisma'
import { LogLevel } from '@/lib/generated/prisma'

type LogContext = Record<string, any>

class Logger {
  private async saveLog(
    level: LogLevel,
    message: string,
    context?: LogContext,
    source?: string
  ) {
    try {
      await prisma.log.create({
        data: {
          level,
          message,
          context: context || null,
          source: source || null
        }
      })
    } catch (error) {
      // Se falhar ao salvar no banco, pelo menos mostra no console
      console.error('[Logger] Erro ao salvar log:', error)
    }
  }

  debug(message: string, context?: LogContext, source?: string) {
    console.debug(`[DEBUG] ${message}`, context || '')
    this.saveLog(LogLevel.DEBUG, message, context, source)
  }

  info(message: string, context?: LogContext, source?: string) {
    console.info(`[INFO] ${message}`, context || '')
    this.saveLog(LogLevel.INFO, message, context, source)
  }

  warn(message: string, context?: LogContext, source?: string) {
    console.warn(`[WARN] ${message}`, context || '')
    this.saveLog(LogLevel.WARN, message, context, source)
  }

  error(message: string, context?: LogContext, source?: string) {
    console.error(`[ERROR] ${message}`, context || '')
    this.saveLog(LogLevel.ERROR, message, context, source)
  }

  // Método para capturar logs síncronos (não espera salvar no DB)
  logSync(level: LogLevel, message: string, context?: LogContext, source?: string) {
    // Salva de forma assíncrona sem bloquear
    this.saveLog(level, message, context, source).catch(() => {})

    // Exibe no console
    const prefix = `[${level}]`
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, context || '')
        break
      case LogLevel.INFO:
        console.info(prefix, message, context || '')
        break
      case LogLevel.WARN:
        console.warn(prefix, message, context || '')
        break
      case LogLevel.ERROR:
        console.error(prefix, message, context || '')
        break
    }
  }
}

export const logger = new Logger()

// Função para interceptar console.log, console.error, etc.
// Esta função deve ser chamada no início da aplicação (em middleware ou layout)
export function interceptConsole() {
  if (typeof window === 'undefined') {
    // Apenas no servidor
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    console.log = (...args: any[]) => {
      originalLog(...args)
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      logger.logSync(LogLevel.INFO, message, undefined, 'console.log')
    }

    console.error = (...args: any[]) => {
      originalError(...args)
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      logger.logSync(LogLevel.ERROR, message, undefined, 'console.error')
    }

    console.warn = (...args: any[]) => {
      originalWarn(...args)
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      logger.logSync(LogLevel.WARN, message, undefined, 'console.warn')
    }

    console.info = (...args: any[]) => {
      originalInfo(...args)
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
      logger.logSync(LogLevel.INFO, message, undefined, 'console.info')
    }
  }
}
