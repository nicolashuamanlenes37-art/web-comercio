import './styles/main.css';

import { STORE } from './config.js';
import { bindWhatsAppLinks } from './lib/whatsapp.js';
import { initHeader } from './sections/header.js';
import { initHero } from './sections/hero.js';
import { initCatalog } from './sections/catalog.js';
import { initCartDrawer } from './sections/cartDrawer.js';

function initStoreInfo() {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.querySelectorAll('[data-store-email]').forEach((a) => {
    a.href = `mailto:${STORE.email}`;
    a.textContent = STORE.email;
  });
  document.querySelectorAll('[data-store-instagram]').forEach((a) => (a.href = STORE.instagram));
  bindWhatsAppLinks();
}

initStoreInfo();
initHeader();
initCatalog();
initHero();
initCartDrawer();
