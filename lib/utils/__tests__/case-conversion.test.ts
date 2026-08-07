import { describe, expect, test } from 'vitest';
import {
  camelToSnake,
  snakeToCamel,
  convertKeysToSnakeCase,
  convertKeysToCamelCase,
} from '../case-conversion';

describe('camelToSnake', () => {
  test('converts camelCase to snake_case', () => {
    expect(camelToSnake('helloWorld')).toBe('hello_world');
    expect(camelToSnake('thisIsATest')).toBe('this_is_a_test');
  });

  test('leaves already-snake_case strings unchanged', () => {
    expect(camelToSnake('hello_world')).toBe('hello_world');
  });

  test('leaves lowercase strings without uppercase letters unchanged', () => {
    expect(camelToSnake('hello')).toBe('hello');
  });
});

describe('snakeToCamel', () => {
  test('converts snake_case to camelCase', () => {
    expect(snakeToCamel('hello_world')).toBe('helloWorld');
    expect(snakeToCamel('this_is_a_test')).toBe('thisIsATest');
  });

  test('leaves already-camelCase strings unchanged', () => {
    expect(snakeToCamel('helloWorld')).toBe('helloWorld');
  });
});

describe('convertKeysToSnakeCase', () => {
  test('converts top-level keys', () => {
    expect(convertKeysToSnakeCase({ firstName: 'A', lastName: 'B' })).toEqual({
      first_name: 'A',
      last_name: 'B',
    });
  });

  test('converts nested object keys', () => {
    expect(
      convertKeysToSnakeCase({ userInfo: { firstName: 'A' } }),
    ).toEqual({ user_info: { first_name: 'A' } });
  });

  test('converts keys inside arrays', () => {
    expect(
      convertKeysToSnakeCase({ items: [{ itemName: 'A' }, { itemName: 'B' }] }),
    ).toEqual({ items: [{ item_name: 'A' }, { item_name: 'B' }] });
  });

  test('returns null and undefined unchanged', () => {
    expect(convertKeysToSnakeCase(null)).toBeNull();
    expect(convertKeysToSnakeCase(undefined)).toBeUndefined();
  });

  test('returns primitives unchanged', () => {
    expect(convertKeysToSnakeCase(5 as unknown as object)).toBe(5);
    expect(convertKeysToSnakeCase('str' as unknown as object)).toBe('str');
  });
});

describe('convertKeysToCamelCase', () => {
  test('converts top-level keys', () => {
    expect(convertKeysToCamelCase({ first_name: 'A', last_name: 'B' })).toEqual({
      firstName: 'A',
      lastName: 'B',
    });
  });

  test('converts nested object keys', () => {
    expect(
      convertKeysToCamelCase({ user_info: { first_name: 'A' } }),
    ).toEqual({ userInfo: { firstName: 'A' } });
  });

  test('converts keys inside arrays', () => {
    expect(
      convertKeysToCamelCase({ items: [{ item_name: 'A' }, { item_name: 'B' }] }),
    ).toEqual({ items: [{ itemName: 'A' }, { itemName: 'B' }] });
  });

  test('returns null and undefined unchanged', () => {
    expect(convertKeysToCamelCase(null)).toBeNull();
    expect(convertKeysToCamelCase(undefined)).toBeUndefined();
  });
});
