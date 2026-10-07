import { $, uid, todayKey, h, PRIO_LABEL } from './utils.js';
import { update, subscribe } from './store.js';

const COLS = ['todo', 'doing', 'done'];

function moveTask(id, status) {
  update(s => {
    const i = s.tasks.findIndex(t => t.id === id);
    if (i < 0 || s.tasks[i].status === status) return;
    const [task] = s.tasks.splice(i, 1);
    task.status = status;
    s.tasks.push(task);
  });
}

function removeTask(id) {
  update(s => { s.tasks = s.tasks.filter(t => t.id !== id); });
}

function miniBtn(label, text, onClick, disabled = false) {
  const b = h('button', 'mini-btn', text);
  b.type = 'button';
  b.setAttribute('aria-label', label);
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

function createCard(t) {
  const el = h('article', `task-card prio-${t.priority}`);
  el.draggable = true;
  el.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', t.id);
    e.dataTransfer.effectAllowed = 'move';
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));

  const title = h('p', 'task-title', t.title);

  const meta = h('div', 'task-meta');
  meta.append(h('span', `badge-prio ${t.priority}`, PRIO_LABEL[t.priority] || 'Medium'));
  if (t.due) {
    const overdue = t.status !== 'done' && t.due < todayKey();
    meta.append(h('span', overdue ? 'due overdue' : 'due', `Due ${t.due}`));
  }

  const idx = COLS.indexOf(t.status);
  const actions = h('div', 'task-actions');
  actions.append(
    miniBtn('Move left', '\u25C0', () => moveTask(t.id, COLS[idx - 1]), idx === 0),
    miniBtn('Move right', '\u25B6', () => moveTask(t.id, COLS[idx + 1]), idx === COLS.length - 1),
    miniBtn('Delete task', '\u2715', () => removeTask(t.id))
  );

  el.append(title, meta, actions);
  return el;
}

function render(state) {
  COLS.forEach(status => {
    const body = $(`#col-${status}`);
    const items = state.tasks.filter(t => t.status === status);
    body.replaceChildren(...(items.length ? items.map(createCard) : [h('p', 'empty-hint', 'Drop tasks here')]));
    $(`#count-${status}`).textContent = items.length;
  });
}

export function initTasks() {
  const form = $('#taskForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = $('#taskTitle').value.trim();
    if (!title) { $('#taskTitle').focus(); return; }
    update(s => s.tasks.push({
      id: uid(),
      title,
      priority: $('#taskPriority').value,
      due: $('#taskDue').value,
      status: 'todo',
      created: Date.now()
    }));
    form.reset();
    $('#taskPriority').value = 'med';
    $('#taskTitle').focus();
  });

  $('#clearDone').addEventListener('click', () => {
    update(s => { s.tasks = s.tasks.filter(t => t.status !== 'done'); });
  });

  COLS.forEach(status => {
    const col = $(`#col-${status}`);
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('drag-over'); });
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      moveTask(e.dataTransfer.getData('text/plain'), status);
    });
  });

  subscribe(render);
}