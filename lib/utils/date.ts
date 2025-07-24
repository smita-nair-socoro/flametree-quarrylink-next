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
