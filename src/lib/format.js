import { STORE } from '../config.js';

export const money = (n) => `${STORE.currency} ${Number(n).toFixed(2)}`;
export const priceLabel = (price) => (price === null || price === undefined ? 'Consultar precio' : money(price));
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/** 51916083665 → 916 083 665 */
export const prettyPhone = (n) => n.replace(/^51/, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

/** ['Yape', 'Plin', 'efectivo'] → "Yape, Plin y efectivo" (o "… o efectivo") */
export const listText = (items, type = 'conjunction') => new Intl.ListFormat('es', { type }).format(items);
