import './styles/main.css';

import { loadCatalog } from './data/catalog.js';
import { initStoreInfo } from './lib/store-info.js';
import { reveal } from './lib/motion.js';
import { initSecretAdmin } from './lib/secret-admin.js';
import { initImageLoading } from './lib/img-loading.js';
import { initHeader, renderCategoryLinks } from './sections/header.js';
import { initHero } from './sections/hero.js';
import { initCatalog } from './sections/catalog.js';
import { initCartDrawer } from './sections/cartDrawer.js';

initStoreInfo();
initImageLoading('.product__media, .tile');
initHeader();
initCartDrawer();
initSecretAdmin(document.getElementById('footerLogo'));

loadCatalog().then((catalog) => {
  initCatalog(catalog);
  initHero(catalog);
  renderCategoryLinks(catalog.categories);
  document.body.classList.remove('is-loading');
  reveal();
});
