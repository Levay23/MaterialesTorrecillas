export const formatCop = (value: number | undefined | null) => {
  if (value === undefined || value === null) return "$0";
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
};
