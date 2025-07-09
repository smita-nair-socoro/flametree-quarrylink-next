import { toast, ExternalToast } from 'sonner';
import React from 'react';

// shared defaults for all toasts
const BASE_OPTS: Omit<ExternalToast, 'description'> = {
  dismissible: true,
};

export function notify(
  message: React.ReactNode,
  opts?: Partial<ExternalToast>,
) {
  return toast(message, { ...BASE_OPTS, ...opts });
}
export function notifySuccess(
  message: React.ReactNode,
  opts?: Partial<ExternalToast>,
) {
  return toast.success(message, { ...BASE_OPTS, ...opts });
}
export function notifyError(
  message: React.ReactNode,
  opts?: Partial<ExternalToast>,
) {
  return toast.error(message, { ...BASE_OPTS, ...opts });
}
export function notifyInfo(
  message: React.ReactNode,
  opts?: Partial<ExternalToast>,
) {
  return toast.info(message, { ...BASE_OPTS, ...opts });
}
export function notifyWarning(
  message: React.ReactNode,
  opts?: Partial<ExternalToast>,
) {
  return toast.warning(message, { ...BASE_OPTS, ...opts });
}

type ToastPromiseOpts = Partial<Omit<ExternalToast, 'description'>>;

type PromiseMessages<T> = {
  loading: React.ReactNode;
  success: (data: T) => React.ReactNode;
  error: (err: unknown) => React.ReactNode;
};

/**
 * Wrap any promise in a toast:
 * - shows `loading` immediately
 * - swaps to `success(...)` on resolve
 * - or `error(...)` on reject
 */
export function notifyPromise<T>(
  getPromise: Promise<T> | (() => Promise<T>),
  messages: PromiseMessages<T>,
  opts?: ToastPromiseOpts,
) {
  const promise = typeof getPromise === 'function' ? getPromise() : getPromise;

  return toast.promise(promise, {
    loading: messages.loading,
    success: (data) => messages.success(data as T),
    error: (err) => messages.error(err),
    ...BASE_OPTS,
    ...opts,
  });
}
