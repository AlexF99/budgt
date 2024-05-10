export const parseMoney = (amount?: number) => `R$ ${(amount ?? 0).toFixed(2).replace('.', ',')}`;
