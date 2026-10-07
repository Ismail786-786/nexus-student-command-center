import { $, $$, todayKey, h, PRIO_LABEL } from './utils.js';
import { subscribe } from './store.js';
import { initTasks } from './tasks.js';

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
  const hr = now.getHours();
  const part = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  $('#greeting').textContent = `${part}, Commander`;
}

/* ---------- Dashboard (updates whenever saved data changes) ---------- */
const RANK = { high: 0, med: 1, low: 2 };

function renderDashboard(s) {
  const open = s.tasks.filter(t => t.status !== 'done');
  $('#statTasks').textContent = open.length;
  $('#statNotes').textContent = s.notes.length;
  $('#statFocus').textContent = `${s.focusLog[todayKey()] || 0} min`;

  const top = [...open]
    .sort((a, b) => RANK[a.priority] - RANK[b.priority] || (a.due || '9999').localeCompare(b.due || '9999'))
    .slice(0, 3);

  const items = top.map(t => {
    const li = h('li', 'focus-item');
    li.append(h('span', '', t.title), h('span', `badge-prio ${t.priority}`, PRIO_LABEL[t.priority]));
    return li;
  });
  $('#focusList').replaceChildren(...(items.length ? items : [h('li', 'muted', 'No open tasks. Add one in Tasks.')]));
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
initTasks();
subscribe(renderDashboard);
showView();
updateClock();
setInterval(updateClock, 15000);