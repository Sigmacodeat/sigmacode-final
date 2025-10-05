// /app/__tests__/lib/api/responses.test.ts
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createValidationErrorResponse,
  createRateLimitResponse,
  API_ERROR_CODES,
  HTTP_STATUS_MAP,
} from '@/app/lib/api/responses';

describe('API Response Utilities', () => {
  const mockRequestId = 'test-request-123';

  describe('createSuccessResponse', () => {
    it('should create a success response with minimal data', () => {
      const response = createSuccessResponse('test data', 'v1', mockRequestId);

      expect(response).toEqual({
        success: true,
        data: 'test data',
        timestamp: expect.any(String),
        version: 'v1',
        requestId: mockRequestId,
      });
    });

    it('should create a success response with complex data', () => {
      const complexData = {
        id: 123,
        name: 'Test Item',
        metadata: { createdAt: '2024-01-01' },
      };

      const response = createSuccessResponse(complexData, 'v1');

      expect(response).toEqual({
        success: true,
        data: complexData,
        timestamp: expect.any(String),
        version: 'v1',
      });
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response with all fields', () => {
      const details = { field: 'email', value: 'invalid' };
      const response = createErrorResponse(
        API_ERROR_CODES.VALIDATION_ERROR,
        'Email is required',
        HTTP_STATUS_MAP[API_ERROR_CODES.VALIDATION_ERROR],
        details,
        'email',
        'v1',
        mockRequestId,
      );

      expect(response).toEqual({
        success: false,
        error: {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: 'Email is required',
          details,
          field: 'email',
        },
        timestamp: expect.any(String),
        version: 'v1',
        requestId: mockRequestId,
      });
    });

    it('should create a simple error response', () => {
      const response = createErrorResponse(
        API_ERROR_CODES.NOT_FOUND,
        'Resource not found',
        HTTP_STATUS_MAP[API_ERROR_CODES.NOT_FOUND],
        undefined,
        undefined,
        'v1',
      );

      expect(response).toEqual({
        success: false,
        error: {
          code: API_ERROR_CODES.NOT_FOUND,
          message: 'Resource not found',
        },
        timestamp: expect.any(String),
        version: 'v1',
      });
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create a paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };

      const response = createPaginatedResponse(data, pagination, 'v1', mockRequestId);

      expect(response).toEqual({
        success: true,
        data,
        pagination,
        timestamp: expect.any(String),
        version: 'v1',
        requestId: mockRequestId,
      });
    });
  });

  describe('createValidationErrorResponse', () => {
    it('should create a validation error response', () => {
      const fieldErrors = {
        email: 'Email is required',
        password: 'Password must be at least 8 characters',
      };

      const response = createValidationErrorResponse(fieldErrors, 'v1', mockRequestId);

      expect(response).toEqual({
        success: false,
        error: {
          code: API_ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: { fieldErrors },
        },
        timestamp: expect.any(String),
        version: 'v1',
        requestId: mockRequestId,
      });
    });
  });

  describe('createRateLimitResponse', () => {
    it('should create a rate limit response', () => {
      const retryAfter = 60;
      const response = createRateLimitResponse(retryAfter, 'v1', mockRequestId);

      expect(response).toEqual({
        success: false,
        error: {
          code: API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: 'Rate limit exceeded',
          details: { retryAfter },
        },
        timestamp: expect.any(String),
        version: 'v1',
        requestId: mockRequestId,
      });
    });
  });

  describe('Error Code Constants', () => {
    it('should have all required error codes', () => {
      expect(API_ERROR_CODES).toHaveProperty('BAD_REQUEST');
      expect(API_ERROR_CODES).toHaveProperty('UNAUTHORIZED');
      expect(API_ERROR_CODES).toHaveProperty('FORBIDDEN');
      expect(API_ERROR_CODES).toHaveProperty('NOT_FOUND');
      expect(API_ERROR_CODES).toHaveProperty('VALIDATION_ERROR');
      expect(API_ERROR_CODES).toHaveProperty('INTERNAL_SERVER_ERROR');
    });

    it('should have corresponding HTTP status codes', () => {
      expect(HTTP_STATUS_MAP[API_ERROR_CODES.BAD_REQUEST]).toBe(400);
      expect(HTTP_STATUS_MAP[API_ERROR_CODES.UNAUTHORIZED]).toBe(401);
      expect(HTTP_STATUS_MAP[API_ERROR_CODES.FORBIDDEN]).toBe(403);
      expect(HTTP_STATUS_MAP[API_ERROR_CODES.NOT_FOUND]).toBe(404);
      expect(HTTP_STATUS_MAP[API_ERROR_CODES.INTERNAL_SERVER_ERROR]).toBe(500);
    });
  });

  describe('Timestamp Generation', () => {
    it('should generate valid ISO timestamps', () => {
      const response = createSuccessResponse('test', 'v1');

      // Check if timestamp is a valid ISO string
      const timestamp = response.timestamp;
      const date = new Date(timestamp);
      expect(date.toISOString()).toBe(timestamp);
    });

    it('should generate different timestamps for different calls', () => {
      // Nutze Fake-Timer, um Millisekunden-Kollisionen zu vermeiden
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00.000Z'));

      const response1 = createSuccessResponse('test1', 'v1');

      // Eine Millisekunde vorrücken, damit sich der Timestamp sicher unterscheidet
      jest.advanceTimersByTime(1);

      const response2 = createSuccessResponse('test2', 'v1');

      expect(response1.timestamp).not.toBe(response2.timestamp);

      // Timer zurücksetzen
      jest.useRealTimers();
    });
  });
});
