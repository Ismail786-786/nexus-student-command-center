const KEY = 'nexus:v1';

const defaults = {
  tasks: [],      // { id, title, priority, due, status, created }
  focusLog: {},   // { 'YYYY-MM-DD': minutes }
  notes: [],
  courses: [],
  theme: 'cyber'
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return { ...structuredClone(defaults), ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return structuredClone(defaults);
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked or full */ }
}

function notify() { listeners.forEach(fn => fn(state)); }

export const getState = () => state;

/* Change state through a function, then save and refresh every listener */
export function update(mutator) {
  mutator(state);
  save();
  notify();
}

/* Runs fn now and after every change; returns an unsubscribe function */
export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

/* Keep several open tabs in sync */
window.addEventListener('storage', e => {
  if (e.key === KEY) { state = load(); notify(); }
});