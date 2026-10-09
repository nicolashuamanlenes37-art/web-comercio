import '../styles/admin.css';

import { $, $$ } from '../lib/dom.js';
import { supabase } from '../lib/supabase.js';
import { initSheet, toast, showError, busy } from './ui.js';
import { fetchProducts, renderProducts, renderCategoryFilter, initProducts } from './products.js';
import { fetchCategories, renderCategories, initCategories } from './categories.js';
import { fetchComplaints, renderComplaints, initComplaints } from './complaints.js';

const VIEWS = ['viewOffline', 'viewLogin', 'viewRecovery', 'viewDenied', 'viewApp'];
const show = (id) => VIEWS.forEach((v) => ($(`#${v}`).hidden = v !== id));

/* ---------- Pestañas ---------- */

function initTabs() {
  $('.tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    $$('.tabs [data-tab]').forEach((t) => t.setAttribute('aria-selected', t === tab));
    $$('.pane').forEach((p) => (p.hidden = p.id !== `pane-${tab.dataset.tab}`));
  });
}

/* ---------- Sesión ---------- */

async function isAdmin(email) {
  const { data, error } = await supabase.from('admins').select('email').limit(1);
  if (error) throw error;
  return data.length > 0 && data[0].email.toLowerCase() === email.toLowerCase();
}

let started = false;
// Al llegar desde el correo de recuperación primero se pide la nueva contraseña
let recovering = /type=recovery/.test(location.hash);

async function enter(session) {
  if (recovering) return show('viewRecovery');
  try {
    if (!(await isAdmin(session.user.email))) {
      $('#deniedEmail').textContent = session.user.email;
      return show('viewDenied');
    }
    show('viewApp');
    if (started) return;
    started = true;
    await fetchCategories();
    await fetchProducts();
    renderCategoryFilter();
    renderProducts();
    renderCategories();
    try {
      await fetchComplaints();
      renderComplaints();
    } catch (err) {
      console.warn('Reclamos no disponibles', err);
    }
  } catch (err) {
    showError(err, 'No se pudo cargar el panel. Revisa tu conexión.');
  }
}

function initAuth() {
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const btn = e.target.querySelector('[type="submit"]');
    const err = $('#loginError');
    err.hidden = true;
    busy(btn, true, 'Entrando…');
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get('email')).trim(),
      password: String(fd.get('password')),
    });
    busy(btn, false);
    if (error) {
      err.textContent = /invalid/i.test(error.message)
        ? 'Correo o contraseña incorrectos.'
        : 'No se pudo entrar. Intenta otra vez.';
      err.hidden = false;
    }
  });

  $('#forgotBtn').addEventListener('click', async () => {
    const email = $('#loginForm [name="email"]').value.trim();
    if (!email) {
      $('#loginError').textContent = 'Escribe tu correo y vuelve a tocar “Olvidé mi contraseña”.';
      $('#loginError').hidden = false;
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/admin/` });
    if (error) return showError(error, 'No se pudo enviar el correo.');
    toast('Te enviamos un correo para cambiar la contraseña.');
  });

  $('#recoveryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = String(new FormData(e.target).get('password'));
    const btn = e.target.querySelector('[type="submit"]');
    busy(btn, true);
    const { data, error } = await supabase.auth.updateUser({ password });
    busy(btn, false);
    if (error) {
      $('#recoveryError').textContent = 'No se pudo cambiar la contraseña. Usa al menos 8 caracteres.';
      $('#recoveryError').hidden = false;
      return;
    }
    toast('Contraseña actualizada');
    recovering = false;
    history.replaceState(null, '', location.pathname);
    enter({ user: data.user });
  });

  document.addEventListener('click', async (e) => {
    if (!e.target.closest('[data-logout]')) return;
    await supabase.auth.signOut();
    location.reload();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      recovering = true;
      return show('viewRecovery');
    }
    if (event === 'SIGNED_OUT' || !session) {
      started = false;
      return show('viewLogin');
    }
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      // Se difiere para no llamar a Supabase dentro del propio callback
      setTimeout(() => enter(session), 0);
    }
  });
}

/* ---------- Inicio ---------- */

if (!supabase) {
  show('viewOffline');
} else {
  initSheet();
  initTabs();
  initProducts();
  initCategories();
  initComplaints();
  initAuth();
}
