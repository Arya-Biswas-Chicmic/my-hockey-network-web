export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
}

export function normalizeApiError(err: unknown, fallbackMsg = 'An unexpected error occurred.'): ApiError {
  if (err && typeof err === 'object') {
    const obj = err as Record<string, any>;
    const statusCode = typeof obj.statusCode === 'number' ? obj.statusCode : 500;
    const code = typeof obj.code === 'string' ? obj.code : 'UNKNOWN_ERROR';
    const message = typeof obj.message === 'string' && obj.message.trim() ? obj.message.trim() : fallbackMsg;
    return {
      statusCode,
      code,
      message,
    };
  }
  return {
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
    message: typeof err === 'string' && err.trim() ? err.trim() : fallbackMsg,
  };
}
