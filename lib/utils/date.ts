export function GetTomorrowDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function GetTodaysDate(): Date {
  const d = new Date();
  d.setDate(d.getDate());
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to format relative time
function formatRelativeTime(
  diffInSeconds: number,
  suffix: string = '',
  justNowText: string = 'Just now'
): string {
  // If the date is very recent
  if (diffInSeconds < 5) {
    return justNowText;
  }

  const addSuffix = (text: string) => (suffix ? `${text} ${suffix}` : text);

  // Seconds
  if (diffInSeconds < 60) {
    return addSuffix(`${diffInSeconds} sec${diffInSeconds === 1 ? '' : 's'}`);
  }

  // Minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return addSuffix(`${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'}`);
  }

  // Hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return addSuffix(`${diffInHours} hour${diffInHours === 1 ? '' : 's'}`);
  }

  // Days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return addSuffix(`${diffInDays} day${diffInDays === 1 ? '' : 's'}`);
  }

  // Weeks
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return addSuffix(`${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'}`);
  }

  // Months
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return addSuffix(`${diffInMonths} month${diffInMonths === 1 ? '' : 's'}`);
  }

  // Years
  const diffInYears = Math.floor(diffInDays / 365);
  return addSuffix(`${diffInYears} year${diffInYears === 1 ? '' : 's'}`);
}

/**
 * Get relative time for past dates (e.g., "2 days ago", "5 hours ago")
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const pastDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  return formatRelativeTime(diffInSeconds, 'ago', 'Just now');
}

/**
 * Get relative time for future dates without suffix (e.g., "2 days", "5 hours")
 */
export function getRelativeTimeFuture(date: Date | string | number): string {
  const now = new Date();
  const futureDate = new Date(date);
  const diffInSeconds = Math.floor(
    (futureDate.getTime() - now.getTime()) / 1000
  );

  return formatRelativeTime(diffInSeconds, '', 'Now');
}
