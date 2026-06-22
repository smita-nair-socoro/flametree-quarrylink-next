// Delay
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Hourly options for delivery time window selects (04:00–23:00). */
export const DELIVERY_TIME_WINDOW_HOUR_OPTIONS = Array.from(
  { length: 20 },
  (_, i) => {
    const hour = String(i + 4).padStart(2, '0');
    return `${hour}:00`;
  },
);
