export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  return time;
};

export const formatDateTime = (date: string, time: string): string => {
  return `${formatDate(date)} a las ${time}`;
};

export const getWeekDates = (startDate: Date): Date[] => {
  const week = [];
  const start = new Date(startDate);
  start.setDate(start.getDate() - start.getDay() + 1); // Lunes

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    week.push(day);
  }
  
  return week;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('es-ES', { weekday: 'long' });
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('es-ES', { month: 'long' });
};