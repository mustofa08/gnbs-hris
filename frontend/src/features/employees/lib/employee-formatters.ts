export function formatEmployeeStatus(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatCurrency(value: string | number) {
  const amount = typeof value === 'string' ? Number(value) : value;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function toDateInputValue(value: string) {
  return value.slice(0, 10);
}
