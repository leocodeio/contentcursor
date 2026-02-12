export enum ErrorType {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export interface AppError extends Error {
  statusCode?: number
  digest?: string
}

export class HttpError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public cause?: Error
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const createAppError = (message: string, statusCode = 500): AppError => {
  return Object.assign(new Error(message), { statusCode })
}

export function getErrorType(error: Error & { statusCode?: number }) {
  const status = error.statusCode
  if (status && Object.values(ErrorType).includes(status)) {
    return status as ErrorType
  }

  const msg = `${error.name} ${error.message}`.toLowerCase()
  if (msg.includes('unauthorized') || msg.includes('401')) return ErrorType.UNAUTHORIZED
  if (msg.includes('forbidden') || msg.includes('403')) return ErrorType.FORBIDDEN
  if (msg.includes('not found') || msg.includes('404')) return ErrorType.NOT_FOUND
  if (msg.includes('maintenance') || msg.includes('503')) return ErrorType.SERVICE_UNAVAILABLE

  return ErrorType.INTERNAL_SERVER_ERROR
}

export function logError(error: Error, context = 'APP') {
  console.error(`[${context}] Error:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  })
}
