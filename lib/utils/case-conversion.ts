/**
 * Convert camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Deep convert object keys from camelCase to snake_case
 */
export function convertKeysToSnakeCase<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const snakeKey = camelToSnake(key);
        converted[snakeKey] = convertKeysToSnakeCase(
          (obj as Record<string, unknown>)[key],
        );
      }
    }
    return converted as T;
  }

  return obj;
}

/**
 * Deep convert object keys from snake_case to camelCase
 */
export function convertKeysToCamelCase<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const camelKey = snakeToCamel(key);
        converted[camelKey] = convertKeysToCamelCase(
          (obj as Record<string, unknown>)[key],
        );
      }
    }
    return converted as T;
  }

  return obj;
}
