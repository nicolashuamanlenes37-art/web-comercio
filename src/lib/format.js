import { STORE } from '../config.js';

export const money = (n) => `${STORE.currency} ${Number(n).toFixed(2)}`;
export const priceLabel = (price) => (price === null || price === undefined ? 'Consultar precio' : money(price));
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
