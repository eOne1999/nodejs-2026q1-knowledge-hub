export const sortDataByOrder = <T extends Record<string, any>>(
  data: T[],
  sortBy: string,
  order: string,
): T[] => {
  const direction = order === 'desc' ? -1 : 1;
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (aVal === undefined || bVal === undefined) return 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * direction;
    }
    return String(aVal).localeCompare(String(bVal)) * direction;
  });
};
