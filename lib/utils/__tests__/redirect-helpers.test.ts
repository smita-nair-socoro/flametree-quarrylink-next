import { describe, expect, test } from 'vitest';
import { getSafeRedirectUrl } from '../redirect-helpers';

describe('getSafeRedirectUrl', () => {
  test('returns the default when no redirect param is present', () => {
    expect(getSafeRedirectUrl('')).toBe('/');
    expect(getSafeRedirectUrl('', '/drivers-app')).toBe('/drivers-app');
  });

  test('accepts a valid relative redirect path from a query string', () => {
    expect(getSafeRedirectUrl('redirect=/dashboard')).toBe('/dashboard');
  });

  test('supports the returnTo alias', () => {
    expect(getSafeRedirectUrl('returnTo=/settings')).toBe('/settings');
  });

  test('accepts a URLSearchParams instance', () => {
    const params = new URLSearchParams('redirect=/jobs/123');
    expect(getSafeRedirectUrl(params)).toBe('/jobs/123');
  });

  test('decodes URL-encoded redirect params', () => {
    expect(
      getSafeRedirectUrl(`redirect=${encodeURIComponent('/a/b?c=1')}`),
    ).toBe('/a/b?c=1');
  });

  test('rejects protocol-relative URLs (//evil.com)', () => {
    expect(getSafeRedirectUrl('redirect=//evil.com')).toBe('/');
  });

  test('rejects absolute URLs to other origins', () => {
    expect(getSafeRedirectUrl('redirect=https://evil.com/phish')).toBe('/');
  });

  test('rejects paths containing backslashes', () => {
    expect(getSafeRedirectUrl('redirect=/a\\evil')).toBe('/');
  });

  test('rejects redirect values that do not start with a slash', () => {
    expect(getSafeRedirectUrl('redirect=dashboard')).toBe('/');
  });
});
