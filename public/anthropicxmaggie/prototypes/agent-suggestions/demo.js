import './superagents.js?v=12';

const widget = document.querySelector('super-agents');
const stage = document.querySelector('.demo-stage');
const play = document.querySelector('.demo-play');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const defaults = [...widget.suggestions];
const [projectManager] = defaults;
let playing = false;
let visible = true;
let manuallyPaused = false;
let runId = 0;
let scriptedFocus = false;
const pointer = document.createElement('div');
pointer.className = 'demo-pointer';
pointer.setAttribute('aria-hidden', 'true');
pointer.innerHTML = `<svg viewBox="0 0 36 44" width="36" height="44"><path d="M31 2 L3 24 L16 26 L22 39 Z" fill="#111" stroke="white" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
document.body.append(pointer);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function clearHover() {
  document.querySelectorAll('[data-demo-hover]').forEach(el => el.removeAttribute('data-demo-hover'));
  widget.querySelectorAll('.sa-row--active').forEach(el => el.classList.remove('sa-row--active'));
}
function reset() {
  if (widget.dialog?.open) {
    scriptedFocus = true;
    widget.dialog.addEventListener('close', () => { scriptedFocus = false; }, { once: true });
    widget.dialog.close();
  }
  widget.hideTooltip();
  widget.closeMenu();
  clearHover();
  widget.created = [];
  widget.loading = new Set();
  widget.collapsed = false;
  widget.dismissedSuggestions = new Set();
  widget.suggestions = [...defaults];
  widget.render(undefined, { animateResize: true });
}
async function moveTo(element, id, fraction = .5) {
  if (!element || id !== runId) return false;
  const rect = element.getBoundingClientRect();
  pointer.style.transform = `translate3d(${rect.left + rect.width * fraction}px, ${rect.top + rect.height / 2}px, 0)`;
  pointer.classList.add('is-visible');
  await wait(650);
  return id === runId;
}
async function clickPointer(id) {
  pointer.classList.add('is-pressed');
  await wait(120);
  pointer.classList.remove('is-pressed');
  return id === runId;
}
async function run(id) {
  const pause = async ms => { await wait(ms); return id === runId; };
  while (id === runId) {
    if (!await pause(700)) return;
    let row = widget.querySelector(`[data-agent="${projectManager}"]`);
    if (!await moveTo(row, id, .35)) return;
    row.classList.add('sa-row--active');
    if (!await pause(60)) return;
    widget.showTooltip(row);
    if (!await pause(2200)) return;
    widget.hideTooltip();
    for (const [agent, action] of [[projectManager, 'refresh']]) {
      row = widget.querySelector(`[data-agent="${agent}"]`);
      if (!row) { stop(); return; }
      widget.hideTooltip();
      if (!row.classList.contains('sa-row--active')) {
        clearHover();
        if (!await moveTo(row, id, .4)) return;
        row.classList.add('sa-row--active');
        if (!await pause(300)) return;
      }
      const trigger = row.querySelector('.sa-more');
      if (!await moveTo(trigger, id)) return;
      trigger.setAttribute('data-demo-hover', '');
      if (!await pause(550) || !await clickPointer(id)) return;
      widget.openMenu(trigger, agent, { focus: false });
      if (!await pause(300)) return;
      const item = widget.menu.querySelector(`[data-action="${action}"]`);
      if (!await moveTo(item, id, .45)) return;
      trigger.removeAttribute('data-demo-hover');
      item.setAttribute('data-demo-hover', '');
      if (!await pause(650) || !await clickPointer(id)) return;
      item.click();
      if (!await pause(action === 'refresh' ? 1900 : 1000)) return;
    }
    // Show the creation screen as the final beat of the walkthrough.
    clearHover();
    row = widget.querySelector('[data-agent="meetings-manager"]');
    if (!await moveTo(row, id, .4)) return;
    row.classList.add('sa-row--active');
    const tryButton = row.querySelector('.sa-try');
    if (!await moveTo(tryButton, id)) return;
    tryButton.setAttribute('data-demo-hover', '');
    if (!await pause(180) || !await clickPointer(id)) return;
    tryButton.click();
    pointer.classList.remove('is-visible');
    if (!await pause(4200)) return;
    const creationScreen = widget.dialog;
    if (creationScreen?.open) {
      await creationScreen.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' }).finished;
      if (id !== runId) return;
      scriptedFocus = true;
      await new Promise(resolve => {
        creationScreen.addEventListener('close', resolve, { once: true });
        creationScreen.close();
      });
      scriptedFocus = false;
    }
    if (!await pause(700)) return;
    reset();
  }
}

function start() {
  if (playing || manuallyPaused || !visible || document.hidden || reducedMotion.matches) return;
  reset();
  playing = true;
  play.textContent = 'Pause demo';
  run(++runId);
}

function stop() {
  runId++;
  pointer.classList.remove('is-visible', 'is-pressed');
  clearHover();
  playing = false;
  play.textContent = 'Replay demo';
}

function takeControl() {
  manuallyPaused = true;
  stop();
  if (!widget.menu) {
    widget.hideTooltip();
    widget.querySelector('.sa-row--active')?.classList.remove('sa-row--active');
  }
}

play.addEventListener('click', () => {
  if (playing) {
    takeControl();
  } else {
    manuallyPaused = false;
    if (reducedMotion.matches) reset();
    else start();
  }
});

widget.addEventListener('pointerdown', takeControl);
widget.addEventListener('focusin', () => { if (!scriptedFocus) takeControl(); }, { capture: true });
document.addEventListener('pointerdown', event => {
  if (widget.menu?.contains(event.target) || widget.dialog?.contains(event.target)) takeControl();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else start();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    stop();
    reset();
    play.textContent = 'Reset demo';
  } else {
    start();
  }
});

const observer = new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  if (visible) start();
  else stop();
});
observer.observe(stage);
if (reducedMotion.matches) play.textContent = 'Reset demo';
