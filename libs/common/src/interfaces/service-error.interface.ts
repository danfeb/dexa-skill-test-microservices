export interface ServiceError {
  error: string;
  statusCode: number;
}

export function isServiceError(value: unknown): value is ServiceError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ServiceError>;

  return (
    typeof candidate.error === 'string' &&
    typeof candidate.statusCode === 'number'
  );
}
