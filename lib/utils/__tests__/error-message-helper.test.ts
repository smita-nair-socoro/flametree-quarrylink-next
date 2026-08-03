import { describe, expect, test } from 'vitest';
import {
  extractErrorData,
  extractEligibilityBlockingDependencies,
  extractErrorMessage,
  extractErrorResponse,
} from '../error-message-helper';

describe('extractErrorData', () => {
  test('extracts data from error.response.data', () => {
    const error = { response: { data: { message: 'boom' } } };
    expect(extractErrorData(error)).toEqual({ message: 'boom' });
  });

  test('extracts data from error.data', () => {
    const error = { data: { message: 'boom' } };
    expect(extractErrorData(error)).toEqual({ message: 'boom' });
  });

  test('returns null when neither shape matches', () => {
    expect(extractErrorData(new Error('plain'))).toBeNull();
    expect(extractErrorData(null)).toBeNull();
    expect(extractErrorData('string error')).toBeNull();
  });
});

describe('extractEligibilityBlockingDependencies', () => {
  test('returns empty result for invalid data', () => {
    expect(extractEligibilityBlockingDependencies(null)).toEqual({
      blockingQuotations: [],
      blockingJobs: [],
      blockingDockets: [],
      blockingJobItems: [],
      hasBlockingDependencies: false,
    });
    expect(extractEligibilityBlockingDependencies('not an object')).toEqual({
      blockingQuotations: [],
      blockingJobs: [],
      blockingDockets: [],
      blockingJobItems: [],
      hasBlockingDependencies: false,
    });
  });

  test('filters valid blocking quotations/jobs/dockets/jobItems and sets hasBlockingDependencies', () => {
    const data = {
      blockingQuotations: [
        { id: 1, quoteNumber: 'Q-1', lineItemsCount: 2 },
        { id: 2 }, // missing required fields, filtered out
        'not an object',
      ],
      blockingJobs: [{ id: 1 }, {}],
      blockingDockets: [{ id: 1 }, null],
      blockingJobItems: [{ id: 1 }, 5],
    };
    const result = extractEligibilityBlockingDependencies(data);
    expect(result.blockingQuotations).toEqual([
      { id: 1, quoteNumber: 'Q-1', lineItemsCount: 2 },
    ]);
    expect(result.blockingJobs).toEqual([{ id: 1 }]);
    expect(result.blockingDockets).toEqual([{ id: 1 }]);
    expect(result.blockingJobItems).toEqual([{ id: 1 }]);
    expect(result.hasBlockingDependencies).toBe(true);
  });

  test('hasBlockingDependencies is false when all arrays are empty', () => {
    const result = extractEligibilityBlockingDependencies({
      blockingQuotations: [],
      blockingJobs: [],
      blockingDockets: [],
      blockingJobItems: [],
    });
    expect(result.hasBlockingDependencies).toBe(false);
  });
});

describe('extractErrorMessage', () => {
  test('joins field validation messages from response.data.messages', () => {
    const error = {
      response: {
        data: {
          messages: { firstName: 'is required', lastName: 'is too long' },
        },
      },
    };
    expect(extractErrorMessage(error)).toBe(
      'First Name: is required, Last Name: is too long',
    );
  });

  test('reads first message from response.data.errors[]', () => {
    const error = {
      response: { data: { errors: [{ message: 'Something failed' }] } },
    };
    expect(extractErrorMessage(error)).toBe('Something failed');
  });

  test('reads response.data.message directly', () => {
    const error = { response: { data: { message: 'Direct message' } } };
    expect(extractErrorMessage(error)).toBe('Direct message');
  });

  test('joins top-level validation messages', () => {
    const error = { messages: { email: 'is invalid' } };
    expect(extractErrorMessage(error)).toBe('Email: is invalid');
  });

  test('reads first message from top-level errors[]', () => {
    const error = { errors: [{ message: 'Top level error' }] };
    expect(extractErrorMessage(error)).toBe('Top level error');
  });

  test('falls back to native Error message', () => {
    expect(extractErrorMessage(new Error('native error'))).toBe(
      'native error',
    );
  });

  test('falls back to string errors', () => {
    expect(extractErrorMessage('plain string error')).toBe(
      'plain string error',
    );
  });

  test('falls back to object.message', () => {
    expect(extractErrorMessage({ message: 'object message' })).toBe(
      'object message',
    );
  });

  test('falls back to Unknown error occurred for unrecognized shapes', () => {
    expect(extractErrorMessage({})).toBe('Unknown error occurred');
    expect(extractErrorMessage(undefined)).toBe('Unknown error occurred');
  });
});

describe('extractErrorResponse', () => {
  test('extracts code, status, message from top-level fields', () => {
    const error = {
      response: {
        data: { code: 'ERR_1', status: 'BAD_REQUEST', message: 'Failed' },
      },
    };
    expect(extractErrorResponse(error)).toEqual({
      code: 'ERR_1',
      status: 'BAD_REQUEST',
      message: 'Failed',
    });
  });

  test('coerces numeric codes to strings', () => {
    const error = { response: { data: { code: 404 } } };
    expect(extractErrorResponse(error)).toEqual({
      code: '404',
      status: undefined,
      message: undefined,
    });
  });

  test('falls back to first entry of errors[] for code/message', () => {
    const error = {
      response: {
        data: { errors: [{ code: 'E2', message: 'Nested error' }] },
      },
    };
    expect(extractErrorResponse(error)).toEqual({
      code: 'E2',
      status: undefined,
      message: 'Nested error',
    });
  });

  test('returns null when no data could be extracted', () => {
    expect(extractErrorResponse(new Error('boom'))).toBeNull();
    expect(extractErrorResponse(null)).toBeNull();
  });

  test('returns null when data has none of code/status/message', () => {
    const error = { response: { data: { unrelated: true } } };
    expect(extractErrorResponse(error)).toBeNull();
  });
});
