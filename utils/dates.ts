export const differenceInDays = (from: string, to: Date = new Date()): number => {
  const fromDate = new Date(from);
  if (Number.isNaN(fromDate.getTime())) {
    return 0;
  }
  const diff = to.getTime() - fromDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
