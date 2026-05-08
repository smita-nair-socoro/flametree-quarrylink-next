const formatTimeString = (dateString) => {
  if (!dateString) return '';

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateString)) {
    return dateString.substring(0, 5);
  }

  if (dateString.includes('T')) {
    const timePart = dateString.split('T')[1];
    if (timePart) {
      return timePart.substring(0, 5);
    }
  } else if (dateString.includes(' ')) {
    const timePart = dateString.split(' ')[1];
    if (timePart) {
      return timePart.substring(0, 5);
    }
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
};

console.log(formatTimeString("2026-05-09T00:00:00+10:00"));
console.log(formatTimeString("2026-05-09T10:00:00+10:00"));
