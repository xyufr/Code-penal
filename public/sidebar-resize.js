const root = document.documentElement;
const key = 'cp-sidebar-width';
let preferred = null;
try {
  const value = JSON.parse(localStorage.getItem(key));
  if (Number.isFinite(value) && value >= 220 && value <= 480) preferred = value;
} catch {}
let drag = null;
const maximum = () => Math.max(220, Math.min(480, innerWidth - 550));
const defaultWidth = () => innerWidth <= 1000 ? 220 : innerWidth <= 1180 ? 224 : 280;
const clamp = value => Math.round(Math.max(220, Math.min(maximum(), value)));
const currentWidth = () => clamp(preferred ?? defaultWidth());
function save() {
  try {
    if (preferred === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(preferred));
  } catch {}
}
export function syncSidebarResize() {
  const width = currentWidth();
  root.style.setProperty('--sidebar-width', `${width}px`);
  const handle = document.querySelector('.sidebar-resizer');
  if (!handle) return;
  handle.setAttribute('aria-valuemin', '220');
  handle.setAttribute('aria-valuemax', String(maximum()));
  handle.setAttribute('aria-valuenow', String(width));
}
document.addEventListener('pointerdown', event => {
  const handle = event.target.closest('.sidebar-resizer');
  if (!handle || event.button !== 0 || innerWidth < 760) return;
  event.preventDefault();
  handle.focus();
  drag = {id: event.pointerId, x: event.clientX, width: currentWidth(), handle};
  handle.setPointerCapture(event.pointerId);
  root.classList.add('resizing-sidebar');
});
document.addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  preferred = clamp(drag.width + event.clientX - drag.x);
  syncSidebarResize();
});
function finish(event) {
  if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.id)) return;
  const {handle, id} = drag;
  drag = null;
  if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
  root.classList.remove('resizing-sidebar');
  if (document.activeElement === handle) handle.blur();
  save();
}
document.addEventListener('pointerup', finish);
document.addEventListener('pointercancel', finish);
document.addEventListener('lostpointercapture', finish);
window.addEventListener('blur', finish);
document.addEventListener('keydown', event => {
  if (!event.target.matches('.sidebar-resizer')) return;
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  preferred = event.key === 'Home' ? 220 : event.key === 'End' ? maximum()
    : clamp(currentWidth() + (event.key === 'ArrowLeft' ? -10 : 10));
  syncSidebarResize();
  save();
});
document.addEventListener('dblclick', event => {
  if (!event.target.closest('.sidebar-resizer')) return;
  preferred = null;
  syncSidebarResize();
  save();
});
window.addEventListener('resize', () => {finish({}); syncSidebarResize();});
syncSidebarResize();
