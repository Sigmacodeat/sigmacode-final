// /app/lib/api/exceptions.ts
import { API_ERROR_CODES, HTTP_STATUS_MAP } from './responses';

export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any,
    public field?: string,
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// Factory functions for common API errors
export function createBadRequestError(message: string, details?: any): ApiException {
  return new ApiException(
    API_ERROR_CODES.BAD_REQUEST,
    message,
    HTTP_STATUS_MAP[API_ERROR_CODES.BAD_REQUEST],
    details,
  );
}

export function createUnauthorizedError(message: string = 'Authentication required'): ApiException {
  return new ApiException(
    API_ERROR_CODES.UNAUTHORIZED,
    message,
    HTTP_STATUS_MAP[API_ERROR_CODES.UNAUTHORIZED],
  );
}

export function createForbiddenError(message: string = 'Access denied'): ApiException {
  return new ApiException(
    API_ERROR_CODES.FORBIDDEN,
    message,
    HTTP_STATUS_MAP[API_ERROR_CODES.FORBIDDEN],
  );
}

export function createNotFoundError(resource: string): ApiException {
  return new ApiException(
    API_ERROR_CODES.RESOURCE_NOT_FOUND,
    `${resource} not found`,
    HTTP_STATUS_MAP[API_ERROR_CODES.RESOURCE_NOT_FOUND],
  );
}

export function createValidationError(
  message: string,
  field?: string,
  details?: any,
): ApiException {
  return new ApiException(
    API_ERROR_CODES.VALIDATION_ERROR,
    message,
    HTTP_STATUS_MAP[API_ERROR_CODES.VALIDATION_ERROR],
    details,
    field,
  );
}

export function createInternalServerError(
  message: string = 'Internal server error',
  details?: any,
): ApiException {
  return new ApiException(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    message,
    HTTP_STATUS_MAP[API_ERROR_CODES.INTERNAL_SERVER_ERROR],
    details,
  );
}

export function createDatabaseError(
  message: string = 'Database error',
  details?: any,
): ApiException {
  return new ApiException(
    API_ERROR_CODES.DATABASE_ERROR,
    message,
    HTTP_STATUS_MAP[API_ERROR_CODES.DATABASE_ERROR],
    details,
  );
}

export function createExternalServiceError(service: string, details?: any): ApiException {
  return new ApiException(
    API_ERROR_CODES.EXTERNAL_SERVICE_ERROR,
    `${service} service unavailable`,
    HTTP_STATUS_MAP[API_ERROR_CODES.EXTERNAL_SERVICE_ERROR],
    details,
  );
}
