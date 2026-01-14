export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('sl-SI', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(val);
};
