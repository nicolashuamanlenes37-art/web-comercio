import { STORE } from '../config.js';

export const money = (n) => `${STORE.currency} ${n.toFixed(2)}`;
export const weight = (g) => (g >= 1000 ? `${g / 1000} kg` : `${g} g`);
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
