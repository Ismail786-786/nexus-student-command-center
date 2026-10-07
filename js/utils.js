export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* Local date as YYYY-MM-DD */
export const todayKey = () => new Date().toLocaleDateString('en-CA');

export const PRIO_LABEL = { low: 'Low', med: 'Medium', high: 'High' };

/* Small DOM helper: text is set with textContent, so user input can never inject HTML */
export function h(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}