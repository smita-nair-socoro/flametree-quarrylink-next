import { describe, expect, test } from 'vitest';
import { getJobFormSchema } from '../job-form-schema';

const baseValues = {
  customerId: 1,
  accountManagerSub: 'account-manager-1',
  projectName: 'Test Project',
  receiptEmail: 'test@example.com',
  phone: '',
  contactPersonName: '',
};

describe('JobFormSchema delivery time window validation', () => {
  const schema = getJobFormSchema(false);

  test('allows all three delivery fields to be empty', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: undefined,
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
    });
    expect(result.success).toBe(true);
  });

  test('allows date only', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: new Date('2026-01-01'),
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
    });
    expect(result.success).toBe(true);
  });

  test('allows date with start time only', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: new Date('2026-01-01'),
      deliveryWindowStart: '09:00',
      deliveryWindowEnd: '',
    });
    expect(result.success).toBe(true);
  });

  test('allows date with end time only', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: new Date('2026-01-01'),
      deliveryWindowStart: '',
      deliveryWindowEnd: '17:00',
    });
    expect(result.success).toBe(true);
  });

  test('allows date with both start and end time', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: new Date('2026-01-01'),
      deliveryWindowStart: '09:00',
      deliveryWindowEnd: '17:00',
    });
    expect(result.success).toBe(true);
  });

  test('rejects start time only without a date', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: undefined,
      deliveryWindowStart: '09:00',
      deliveryWindowEnd: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes('deliveryStartDate'),
      );
      expect(issue).toBeDefined();
    }
  });

  test('rejects end time only without a date', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: undefined,
      deliveryWindowStart: '',
      deliveryWindowEnd: '17:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes('deliveryStartDate'),
      );
      expect(issue).toBeDefined();
    }
  });

  test('rejects start and end time without a date', () => {
    const result = schema.safeParse({
      ...baseValues,
      deliveryStartDate: undefined,
      deliveryWindowStart: '09:00',
      deliveryWindowEnd: '17:00',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes('deliveryStartDate'),
      );
      expect(issue).toBeDefined();
    }
  });
});
