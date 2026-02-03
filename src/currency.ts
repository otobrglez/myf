export const formatCurrency =
  (val: number) =>
    new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(val);
