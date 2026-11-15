const asset = name => `icons/superagents/${name}`;
const catalog = [
  { id: 'project-manager', name: 'Project Manager', avatar: 'project-manager.png', description: 'Keeps projects on track, follows up on progress, and helps your team meet deadlines.' },
  { id: 'personal-assistant', name: 'Personal Assistant', avatar: 'personal-assistant.png', description: 'Organizes your priorities, keeps track of your tasks, and helps you plan your day.' },
  { id: 'meetings-manager', name: 'Meetings Manager', avatar: 'meetings-manager.png', description: 'Prepares meeting agendas, captures key decisions, and follows up on action items.' },
  { id: 'ux-writer', name: 'UX writer', avatar: 'project-manager.png', description: 'Cleans up typos, tightens sentences, and ensures everything reads perfectly.' },
];
const storageKey = 'agent-suggestions-sidebar-v1';
const icon = name => `<img src="${asset(name + '.svg')}" alt="">`;
const escapeHtml = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function dismissOverlay(overlay) {
  overlay.inert = true;
  overlay.removeAttribute('id');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlay.remove();
    return;
  }
  const fade = overlay.animate([{ opacity: getComputedStyle(overlay).opacity }, { opacity: 0 }], {
    duration: 100,
    easing: 'ease-out',
    fill: 'forwards',
  });
  fade.finished.then(() => overlay.remove(), () => overlay.remove());
}

class SuperAgents extends HTMLElement {
  constructor() {
    super();
    this.suggestions = catalog.slice(0, 3).map(agent => agent.id);
    this.created = [];
    this.collapsed = false;
    this.loading = new Set();
    this.tooltipTimer = null;
  }

  connectedCallback() {
    if (!this.hasAttribute('data-demo')) this.restore();
    this.className = 'superagents';
    this.setAttribute('aria-label', 'Super Agents');
    this.render();
    this.addEventListener('click', event => this.handleClick(event));
    this.addEventListener('pointerover', event => this.scheduleTooltip(event));
    this.addEventListener('pointerout', event => {
      if (!event.target.closest('.sa-row')?.contains(event.relatedTarget)) this.hideTooltip();
    });
    this.addEventListener('focusin', event => this.scheduleTooltip(event));
    this.addEventListener('focusout', () => this.hideTooltip());
    document.addEventListener('pointerdown', event => {
      if (this.menu && !this.menu.contains(event.target) && !this.menuTrigger.contains(event.target)) this.closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.hideTooltip();
        this.closeMenu(true);
      }
    });
    window.addEventListener('resize', () => { this.hideTooltip(); this.closeMenu(); });
    this.closest('.sidebar__body').addEventListener('scroll', () => { this.hideTooltip(); this.closeMenu(); });
  }

  restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (!saved) return;
      if (Array.isArray(saved.suggestions)) this.suggestions = [...new Set(saved.suggestions)].filter(id => catalog.some(agent => agent.id === id)).slice(0, 3);
      if (Array.isArray(saved.created)) this.created = saved.created.filter(agent => typeof agent.id === 'string' && typeof agent.name === 'string' && typeof agent.description === 'string' && catalog.some(item => item.avatar === agent.avatar));
      this.collapsed = saved.collapsed === true;
    } catch { /* Start with the default recommendations if saved state is unavailable. */ }
  }

  save() {
    if (this.hasAttribute('data-demo')) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ suggestions: this.suggestions, created: this.created, collapsed: this.collapsed })); }
    catch { /* The prototype remains usable when browser storage is unavailable. */ }
  }

  getAgent(id) {
    return this.created.find(agent => agent.id === id) || catalog.find(agent => agent.id === id);
  }

  render(revealedAgentId, { animateResize = false } = {}) {
    const previousList = animateResize && !matchMedia('(prefers-reduced-motion: reduce)').matches
      ? this.querySelector('#sa-agent-list')
      : null;
    const previousHeight = previousList?.offsetHeight;
    const previousPositions = new Map();
    if (previousList) {
      for (const row of previousList.querySelectorAll('[data-agent], .sa-new')) {
        previousPositions.set(row.dataset.agent, row.getBoundingClientRect().top);
      }
    }
    this.innerHTML = `
      <div class="sa-header">
        <button class="sa-heading" data-action="collapse" aria-expanded="${!this.collapsed}" aria-controls="sa-agent-list">Super Agents</button>
        <div class="sa-header-actions">
          <button class="sa-icon-button" data-action="section-menu" aria-label="Super Agents options" aria-haspopup="menu" aria-expanded="false">${icon('section-more')}</button>
          <button class="sa-icon-button" data-action="create" aria-label="New Super Agent">${icon('section-add')}</button>
        </div>
      </div>
      <div id="sa-agent-list" ${this.collapsed ? 'inert' : ''}><div class="sa-list-content">
        ${this.created.map(agent => this.row(agent, true)).join('')}
        ${this.suggestions.map(id => this.row(this.getAgent(id), false, id === revealedAgentId)).join('')}
        <div class="sa-row-wrap"><button class="sa-new" data-action="create">${icon('add')}<span>New Super Agent</span></button></div>
      </div></div>`;
    if (!previousList) return;
    const list = this.querySelector('#sa-agent-list');
    const height = list.offsetHeight;
    if (previousHeight === height) return;
    const scale = list.getBoundingClientRect().width / list.offsetWidth || 1;
    const timing = { duration: 260, easing: 'cubic-bezier(.2,.75,.25,1)' };
    list.animate([{ height: `${previousHeight}px` }, { height: `${height}px` }], timing);
    for (const row of list.querySelectorAll('[data-agent], .sa-new')) {
      const previousTop = previousPositions.get(row.dataset.agent);
      const offset = (previousTop - row.getBoundingClientRect().top) / scale;
      if (offset) row.animate([{ transform: `translateY(${offset}px)` }, { transform: 'none' }], timing);
    }
  }

  row(agent, created, revealed) {
    if (this.loading.has(agent.id)) return `<div class="sa-row-wrap"><div class="sa-skeleton sa-reveal" role="status" aria-label="Loading suggestion"><span class="sa-skeleton-avatar"></span><span class="sa-skeleton-name"></span></div></div>`;
    return `<div class="sa-row-wrap"><div class="sa-row ${created ? 'sa-row--created' : ''} ${revealed ? 'sa-reveal' : ''}" data-agent="${escapeHtml(agent.id)}">
      <button class="sa-agent" data-action="open" aria-label="${escapeHtml(agent.name)}">
        <img class="sa-avatar" src="${asset(agent.avatar)}" alt="" width="20" height="20">
        <span class="sa-name">${escapeHtml(agent.name)}</span>
      </button>
      ${created ? '' : `<span class="sa-recommendation" aria-label="Recommended by ClickUp">${icon('recommendation')}</span>
      <div class="sa-row-actions"><button class="sa-try" data-action="open" aria-label="Try ${escapeHtml(agent.name)}">Try it</button><button class="sa-more" data-action="menu" aria-label="Options for ${escapeHtml(agent.name)}" aria-haspopup="menu" aria-expanded="false">${icon('more')}</button></div>`}
    </div></div>`;
  }

  handleClick(event) {
    const button = event.target.closest('button');
    const row = event.target.closest('[data-agent]');
    if (!button) {
      if (row) this.openCreation(this.getAgent(row.dataset.agent), row.querySelector('.sa-agent'));
      return;
    }
    const id = row?.dataset.agent;
    this.hideTooltip();
    switch (button.dataset.action) {
      case 'open': this.openCreation(this.getAgent(id), button); break;
      case 'create': this.openCreation(null, button); break;
      case 'menu': this.openMenu(button, id); break;
      case 'section-menu': this.openMenu(button); break;
      case 'collapse':
        this.closeMenu();
        this.collapsed = !this.collapsed;
        this.save();
        button.setAttribute('aria-expanded', String(!this.collapsed));
        this.querySelector('#sa-agent-list').inert = this.collapsed;
        break;
    }
  }

  scheduleTooltip(event) {
    this.hideTooltip();
    const row = event.target.closest('.sa-row');
    if (!row || event.target.closest('.sa-row-actions') || this.menu || this.dialog?.open) return;
    this.tooltipTimer = setTimeout(() => this.showTooltip(row), 60);
  }

  showTooltip(row) {
    if (!row.isConnected) return;
    const agent = this.getAgent(row.dataset.agent);
    const tooltip = document.createElement('div');
    tooltip.id = 'sa-tooltip';
    tooltip.className = 'sa-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.innerHTML = `<img class="sa-tooltip-arrow" src="${asset('tooltip-arrow.svg')}" alt=""><div class="sa-tooltip-body"><div class="sa-tooltip-title">${escapeHtml(agent.name)}</div><div class="sa-tooltip-description">${escapeHtml(agent.description)}</div>${row.classList.contains('sa-row--created') ? '' : `<div class="sa-tooltip-divider"></div><div class="sa-tooltip-footer">${icon('tooltip-recommendation')}<span>Recommended by ClickUp</span></div>`}</div>`;
    document.body.append(tooltip);
    const rect = row.getBoundingClientRect();
    const scale = Number(getComputedStyle(tooltip).zoom) || 1;
    tooltip.style.left = `${Math.min(rect.right - 1, window.innerWidth - tooltip.offsetWidth * scale - 8) / scale}px`;
    tooltip.style.top = `${Math.max(8, Math.min(rect.top + rect.height / 2 - tooltip.offsetHeight * scale / 2, window.innerHeight - tooltip.offsetHeight * scale - 8)) / scale}px`;
    row.querySelector('.sa-agent').setAttribute('aria-describedby', tooltip.id);
    this.tooltip = tooltip;
  }

  hideTooltip() {
    clearTimeout(this.tooltipTimer);
    if (this.tooltip) dismissOverlay(this.tooltip);
    this.tooltip = null;
    this.querySelector('[aria-describedby]')?.removeAttribute('aria-describedby');
  }

  openMenu(trigger, id, { focus = true } = {}) {
    const wasOpen = this.menuTrigger === trigger && this.menu;
    this.closeMenu();
    if (wasOpen) return;
    const menu = document.createElement('div');
    menu.className = 'sa-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', id ? 'Suggestion options' : 'Super Agents options');
    const item = (action, label, glyph) => `<button role="menuitem" data-action="${action}">${icon(glyph)}<span>${label}</span></button>`;
    menu.innerHTML = id
      ? item('hide', 'Hide this suggestion', 'hide') + item('hide-all', 'Hide all suggestions', 'hide-all') + '<div class="sa-menu-divider" role="separator"></div>' + item('refresh', 'Suggest another', 'refresh')
      : item('restore', 'Show suggestions', 'refresh') + item('hide-all', 'Hide all suggestions', 'hide-all');
    document.body.append(menu);
    const rect = trigger.getBoundingClientRect();
    const scale = Number(getComputedStyle(menu).zoom) || 1;
    menu.style.left = `${Math.min(rect.left, window.innerWidth - menu.offsetWidth * scale - 8) / scale}px`;
    menu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - menu.offsetHeight * scale - 8) / scale}px`;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.closest('.sa-row')?.classList.add('sa-row--active');
    this.menu = menu;
    this.menuTrigger = trigger;
    if (focus) menu.querySelector('button').focus();
    menu.addEventListener('keydown', event => {
      const buttons = [...menu.querySelectorAll('button')];
      const index = buttons.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
      }
      if (event.key === 'Tab') this.closeMenu(true);
    });
    menu.addEventListener('click', event => {
      const action = event.target.closest('button')?.dataset.action;
      if (!action) return;
      this.closeMenu();
      if (action === 'refresh') { this.replaceSuggestion(id, { focus }); return; }
      if (action === 'hide') {
        this.suggestions = this.suggestions.filter(value => value !== id);
        this.dismissedSuggestions?.add(id);
      }
      if (action === 'hide-all') this.suggestions = [];
      if (action === 'restore') this.suggestions = catalog.filter(agent => !this.created.some(created => created.id === agent.id)).slice(0, 3).map(agent => agent.id);
      this.save();
      this.render(undefined, { animateResize: this.hasAttribute('data-demo') });
      if (focus) this.querySelector('.sa-heading').focus();
    });
  }

  closeMenu(returnFocus = false) {
    if (!this.menu) return;
    dismissOverlay(this.menu);
    this.menu = null;
    this.menuTrigger.setAttribute('aria-expanded', 'false');
    this.menuTrigger.closest('.sa-row')?.classList.remove('sa-row--active');
    if (returnFocus) this.menuTrigger.focus();
    this.menuTrigger = null;
  }

  async replaceSuggestion(id, { focus = true } = {}) {
    const pending = this.loading;
    pending.add(id);
    this.render();
    // Model the asynchronous recommendation update shown in the Figma flow.
    await new Promise(resolve => setTimeout(resolve, 850));
    if (pending !== this.loading) return;
    const replacement = catalog.find(agent => !this.suggestions.includes(agent.id)
      && !this.dismissedSuggestions?.has(agent.id)
      && !this.created.some(created => created.id === agent.id));
    this.suggestions = this.suggestions.map(value => value === id && replacement ? replacement.id : value);
    this.loading.delete(id);
    this.save();
    const revealedAgentId = replacement?.id || id;
    this.render(revealedAgentId);
    if (focus) this.querySelector(`[data-agent="${revealedAgentId}"] .sa-agent`)?.focus();
  }

  openCreation(agent, trigger) {
    this.closeMenu();
    this.hideTooltip();
    const existing = agent && this.created.some(item => item.id === agent.id);
    const dialog = document.createElement('dialog');
    dialog.className = 'sa-dialog';
    dialog.setAttribute('aria-labelledby', 'sa-dialog-title');
    dialog.innerHTML = `<form>
      <h2 id="sa-dialog-title">${existing ? 'Edit Super Agent' : 'Create Super Agent'}</h2>
      ${agent ? `<div class="sa-dialog-preview"><img src="${asset(agent.avatar)}" alt="" width="40" height="40"><p>${escapeHtml(agent.description)}</p></div>` : ''}
      <label for="sa-agent-name">Name</label><input id="sa-agent-name" name="name" required maxlength="80" value="${escapeHtml(agent?.name || '')}" placeholder="Name your agent">
      <label for="sa-agent-instructions">Instructions</label><textarea id="sa-agent-instructions" name="instructions" required rows="4" placeholder="What should your agent help with?">${escapeHtml(agent?.description || '')}</textarea>
      <div class="sa-dialog-actions"><button type="button" data-cancel>Cancel</button><button class="sa-primary" type="submit">${existing ? 'Save changes' : 'Create agent'}</button></div>
    </form>`;
    if (agent && !existing) {
      const prompts = {
        'project-manager': 'Create a Project Manager agent that keeps projects on track. Monitor deadlines and progress, identify blockers, follow up with task owners, and share concise status updates with my team. Ask me which projects to manage before getting started.',
        'personal-assistant': 'Create a Personal Assistant agent that organizes my priorities, keeps track of my tasks, and helps me plan my day. Highlight upcoming deadlines, suggest what to focus on, and ask me about my preferences before getting started.',
        'meetings-manager': 'Create a Meetings Manager agent. When I @mention you with a meeting request, schedule a 30-minute meeting with me and only the teammates I name, using any topic I give as the title. Check everyone’s availability over the next 7 business days, within my working hours of 9:00 AM to 5:00 PM. Confirm my time zone and the meeting details before scheduling.'
      };
      const prompt = prompts[agent.id] || `Create a ${agent.name} agent. ${agent.description} Ask me about my preferences before getting started.`;
      const glyph = name => `<img src="icons/agent-prompt/${name}.svg" alt="">`;
      dialog.classList.add('sa-prompt-dialog', 'sa-creation-screen');
      dialog.innerHTML = `<div class="sa-creation-content"><h2 id="sa-dialog-title">Super Agents Builder</h2><div class="sa-composer-glow"><form class="sa-prompt-form">
        <input type="hidden" name="name" value="${escapeHtml(agent.name)}">
        <textarea name="instructions" aria-label="Prompt to create ${escapeHtml(agent.name)}" required autofocus>${escapeHtml(prompt)}</textarea>
        <div class="sa-prompt-toolbar">
          <div class="sa-prompt-tools">
            <button type="button" data-attach aria-label="Attach a reference file">${glyph('screen-add')}</button>
            <input type="file" hidden data-file>
          </div>
          <div class="sa-prompt-tools">
            <button class="sa-prompt-send" type="submit" aria-label="Create agent">${glyph('screen-send')}</button>
          </div>
        </div>
        <output class="sa-prompt-attachment" aria-live="polite"></output>
      </form></div></div>`;
      const promptInput = dialog.querySelector('textarea');
      const sendButton = dialog.querySelector('.sa-prompt-send');
      const updateSendState = () => { sendButton.disabled = !promptInput.value.trim(); };
      promptInput.addEventListener('input', updateSendState);
      updateSendState();
      dialog.querySelector('[data-attach]').addEventListener('click', () => dialog.querySelector('[data-file]').click());
      dialog.querySelector('[data-file]').addEventListener('change', event => { dialog.querySelector('output').textContent = event.target.files[0]?.name || ''; });
      dialog.addEventListener('click', event => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
      });
    }
    document.body.append(dialog);
    if (dialog.classList.contains('sa-creation-screen')) {
      const windowFrame = this.closest('.demo-window');
      const fitScreen = () => {
        const rect = windowFrame?.getBoundingClientRect();
        Object.assign(dialog.style, {
          left: `${rect?.left || 0}px`, top: `${rect?.top || 0}px`,
          width: `${rect?.width || window.innerWidth}px`, height: `${rect?.height || window.innerHeight}px`,
          borderRadius: windowFrame ? getComputedStyle(windowFrame).borderRadius : '0px'
        });
      };
      fitScreen();
      window.addEventListener('resize', fitScreen);
      dialog.addEventListener('close', () => window.removeEventListener('resize', fitScreen), { once: true });
    }
    this.dialog = dialog;
    dialog.addEventListener('close', () => { dialog.remove(); this.dialog = null; if (trigger.isConnected) trigger.focus(); else this.querySelector('.sa-heading').focus(); });
    dialog.querySelector('[data-cancel]')?.addEventListener('click', () => dialog.close());
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      const nameInput = dialog.querySelector('input');
      const instructions = dialog.querySelector('textarea');
      if (!nameInput.value.trim() || !instructions.value.trim()) return;
      const created = { id: agent?.id || `custom-${Date.now()}`, name: nameInput.value.trim(), description: instructions.value.trim(), avatar: agent?.avatar || catalog[0].avatar };
      this.created = [...this.created.filter(item => item.id !== created.id), created];
      this.suggestions = this.suggestions.filter(id => id !== created.id);
      this.save();
      this.render();
      dialog.close();
    });
    dialog.showModal();
    if (dialog.classList.contains('sa-creation-screen')) {
      const promptInput = dialog.querySelector('textarea');
      promptInput.focus({ preventScroll: true });
      promptInput.setSelectionRange(promptInput.value.length, promptInput.value.length);
    }
  }
}

customElements.define('super-agents', SuperAgents);

// The distributed prototype contains compiled Angular output. Mount the isolated
// section when its sidebar is ready, without rewriting Angular's generated view.
function mountSuperAgents() {
  const divider = document.querySelector('app-sidebar .sidebar__divider');
  if (!divider) return false;
  divider.after(document.createElement('super-agents'));
  return true;
}
const appRoot = document.querySelector('app-root');
if (appRoot && !mountSuperAgents()) {
  const observer = new MutationObserver(() => { if (mountSuperAgents()) observer.disconnect(); });
  observer.observe(appRoot, { childList: true, subtree: true });
}
