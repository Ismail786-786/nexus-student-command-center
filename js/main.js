const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- View routing (hash based, works on GitHub Pages) ---------- */
function showView() {
  const id = location.hash.slice(1) || 'dashboard';
  const view = document.getElementById(id);
  const target = view && view.classList.contains('view') ? view : $('#dashboard');

  $$('.view').forEach(v => v.classList.toggle('active', v === target));
  $$('.nav-item').forEach(a => a.classList.toggle('active', a.dataset.nav === target.id));
  $('#pageTitle').textContent = target.dataset.title || 'NEXUS';
  document.title = `${target.dataset.title || 'NEXUS'} | NEXUS`;
  closeMenu();
}

/* ---------- Mobile menu ---------- */
const menuBtn = $('#menuBtn');
function openMenu() {
  document.body.classList.add('menu-open');
  menuBtn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  document.body.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
}
menuBtn.addEventListener('click', () => {
  document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
});
$('#scrim').addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ---------- Greeting and clock ---------- */
function updateClock() {
  const now = new Date();
  $('#clock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const h = now.getHours();
  const part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  $('#greeting').textContent = `${part}, Commander`;
}

/* ---------- Feedback form: client-side validation ---------- */
const form = $('#feedbackForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  form.reset();
  form.classList.remove('was-validated');
  const ok = $('#feedbackOk');
  ok.hidden = false;
  setTimeout(() => { ok.hidden = true; }, 4000);
});

/* ---------- Start ---------- */
window.addEventListener('hashchange', showView);
showView();
updateClock();
setInterval(updateClock, 15000);