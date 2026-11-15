/** Dedicated speaker-notes window. Previews are static images, never live slide embeds. */
export function mountPresenter({ deckId, title, slides, audienceUrl, channelName, audienceWindowName, notesUrl }) {
  const pages = (Array.isArray(slides) ? slides : []).map((slide, index) => ({
    id: String(slide.id ?? index),
    title: String(slide.title || `Slide ${index + 1}`),
    preview: typeof slide.preview === 'string' ? slide.preview : '',
  }));
  const notes = new Map();
  const unsavedNotes = new Set();
  const pendingSync = new Map();
  let syncInProgress = false;
  let migratedNotes = false;
  let syncStatus = 'Syncing notes…';
  const listeners = [];
  let index = 0;
  let lastAudienceMessage = null;
  let pendingSelection = null;
  let hasConnected = false;
  let storageFailed = false;
  let channel = null;
  let audienceWindow = null;
  let elapsed = 0;
  let startedAt = null;
  let disposed = false;
  const storageKey = id => `portfolio:speaker-notes:v1:${encodeURIComponent(deckId)}:${encodeURIComponent(id)}`;
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const listen = (element, event, handler) => {
    element.addEventListener(event, handler);
    listeners.push(() => element.removeEventListener(event, handler));
  };
  const button = (text, className = '') => {
    const element = node('button', `pv-button ${className}`.trim(), text);
    element.type = 'button';
    return element;
  };
  const app = node('main', 'pv-app');
  app.setAttribute('aria-label', 'Presenter view');
  document.body.classList.add('presenter-window');
  document.title = `${title} — Presenter view`;
  document.body.replaceChildren(app);

  const header = node('header', 'pv-header');
  const headingGroup = node('div', 'pv-heading');
  headingGroup.append(node('p', 'pv-eyebrow', 'Presenter view'), node('h1', 'pv-title', title));
  const headerActions = node('div', 'pv-header-actions');
  const connection = node('span', 'pv-connection', 'Waiting for slides window');
  connection.setAttribute('role', 'status');
  const openAudience = button('Open slides window', 'pv-button-secondary');
  const exportNotes = button('Export notes', 'pv-button-quiet');
  const importNotes = button('Import notes', 'pv-button-secondary');
  const notesFile = node('input');
  notesFile.type = 'file';
  notesFile.accept = '.json,application/json';
  notesFile.hidden = true;
  headerActions.append(connection, openAudience, importNotes, exportNotes, notesFile);
  header.append(headingGroup, headerActions);
  app.append(header, node('p', 'pv-instruction', notesUrl
    ? 'Share only the slides window. Notes sync across browsers on this Mac.'
    : 'Share only the slides window. Notes are saved in this browser.'));
  const notice = node('p', 'pv-notice');
  notice.setAttribute('role', 'status');
  notice.hidden = true;
  app.append(notice);

  const exportPanel = node('section', 'pv-notice');
  exportPanel.hidden = true;
  exportPanel.setAttribute('aria-label', 'Notes export');
  const exportLink = node('a', 'pv-button pv-button-secondary', 'Download JSON');
  const copyExport = button('Copy JSON', 'pv-button-secondary');
  const closeExport = button('Close', 'pv-button-quiet');
  const exportText = node('textarea');
  exportText.readOnly = true;
  exportText.hidden = true;
  exportText.setAttribute('aria-label', 'Notes export JSON');
  const exportStatus = node('p', '', 'If the download did not start, download or copy the backup here.');
  exportStatus.setAttribute('role', 'status');
  exportPanel.append(exportStatus, exportLink, copyExport, closeExport, exportText);
  let exportUrl;

  const content = node('div', 'pv-content');
  const previews = node('section', 'pv-previews');
  previews.setAttribute('aria-label', 'Slide previews');
  function previewCard(label, className) {
    const card = node('section', `pv-preview-card ${className}`);
    const caption = node('div', 'pv-preview-caption');
    const labelNode = node('p', 'pv-eyebrow', label);
    const titleNode = node('h2', 'pv-slide-title');
    caption.append(labelNode, titleNode);
    const frame = node('div', 'pv-preview-frame');
    const img = node('img', 'pv-preview-image');
    img.decoding = 'async';
    const fallback = node('p', 'pv-preview-fallback', 'Preview unavailable');
    fallback.hidden = true;
    frame.append(img, fallback);
    card.append(caption, frame);
    listen(img, 'error', () => { img.hidden = true; fallback.hidden = false; });
    return { card, titleNode, img, fallback };
  }
  const current = previewCard('Current slide', 'pv-current');
  const next = previewCard('Up next', 'pv-next');
  previews.append(current.card, next.card);

  const notesPanel = node('section', 'pv-notes-panel');
  const notesHeader = node('div', 'pv-notes-header');
  const notesLabel = node('label', 'pv-notes-label', 'Speaker notes');
  notesLabel.htmlFor = 'pv-speaker-notes';
  const saveStatus = node('span', 'pv-save-status', 'Saved in this browser');
  saveStatus.setAttribute('role', 'status');
  const saveNotesButton = button('Save all notes', 'pv-button-primary');
  notesHeader.append(notesLabel, saveStatus, saveNotesButton);
  const textarea = node('textarea', 'pv-notes');
  textarea.id = 'pv-speaker-notes';
  textarea.placeholder = 'Add talking points for this slide…';
  textarea.spellcheck = true;
  textarea.setAttribute('aria-describedby', 'pv-notes-help');
  const notesHelp = node('p', 'pv-notes-help', 'Your notes stay out of the audience window. Export a copy to keep a backup.');
  notesHelp.id = 'pv-notes-help';
  notesPanel.append(notesHeader, textarea, notesHelp);
  content.append(previews, notesPanel);
  app.append(content, exportPanel);

  const footer = node('footer', 'pv-footer');
  const navigation = node('nav', 'pv-navigation');
  navigation.setAttribute('aria-label', 'Presentation controls');
  const previous = button('← Previous', 'pv-button-secondary');
  const nextButton = button('Next →', 'pv-button-primary');
  const jumpLabel = node('label', 'pv-jump-label', 'Slide');
  jumpLabel.htmlFor = 'pv-slide-jump';
  const jump = node('select', 'pv-slide-jump');
  jump.id = 'pv-slide-jump';
  for (const [pageIndex, page] of pages.entries()) {
    const option = node('option', '', `${pageIndex + 1} / ${pages.length} · ${page.title}`);
    option.value = String(pageIndex);
    jump.append(option);
  }
  const jumpGroup = node('div', 'pv-jump');
  jumpGroup.append(jumpLabel, jump);
  navigation.append(previous, jumpGroup, nextButton);
  const timer = node('section', 'pv-timer');
  timer.setAttribute('aria-label', 'Presentation timer');
  const clock = node('output', 'pv-clock', '00:00');
  clock.setAttribute('aria-label', 'Elapsed time');
  const timerToggle = button('Start timer', 'pv-button-secondary');
  const timerReset = button('Reset', 'pv-button-quiet');
  timerReset.setAttribute('aria-label', 'Reset timer');
  timer.append(clock, timerToggle, timerReset);
  footer.append(navigation, timer);
  app.append(footer, node('p', 'pv-shortcuts', '← → Change slides · Notes save as you type'));

  function getNotes(id) {
    if (notes.has(id)) return notes.get(id);
    try {
      const value = localStorage.getItem(storageKey(id)) || '';
      notes.set(id, value);
      return value;
    } catch {
      storageFailed = true;
      notes.set(id, '');
      return '';
    }
  }
  function updateSaveStatus(message = notesUrl ? syncStatus : 'Saved in this browser') {
    saveStatus.textContent = storageFailed ? 'Not saved — browser storage unavailable' : message;
    saveStatus.dataset.error = String(storageFailed);
    if (storageFailed) {
      notice.dataset.reason = 'storage';
      notice.textContent = 'Your browser could not save these notes. Keep this window open and export a copy before closing it.';
      notice.hidden = false;
    } else if (notice.dataset.reason === 'storage') {
      notice.hidden = true;
      delete notice.dataset.reason;
    }
  }
  async function syncNotes() {
    if (!notesUrl || syncInProgress || disposed) return;
    syncInProgress = true;
    const sent = new Map(pendingSync);
    async function writeSharedNotes(edits, fillMissing = false) {
      const response = await fetch(notesUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edits: Object.fromEntries(edits), fillMissing }),
      });
      if (!response.ok) throw new Error('Shared notes unavailable');
      return response.json();
    }
    try {
      let shared;
      if (sent.size) {
        shared = await writeSharedNotes([...sent].map(([id, edit]) => [id, edit.value]));
        for (const [id, edit] of sent) {
          if (pendingSync.get(id) === edit) pendingSync.delete(id);
        }
      } else {
        const response = await fetch(notesUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error('Shared notes unavailable');
        shared = await response.json();
      }
      if (!migratedNotes) {
        const existing = [];
        for (const { id } of pages) {
          if (!Object.hasOwn(shared, id) && !pendingSync.has(id)) {
            const value = getNotes(id);
            if (value) existing.push([id, value]);
          }
        }
        if (existing.length) shared = await writeSharedNotes(existing, true);
        migratedNotes = true;
      }
      if (disposed) return;
      for (const [id, value] of Object.entries(shared)) {
        if (pendingSync.has(id) || notes.get(id) === value) continue;
        notes.set(id, value);
        if (id === pages[index]?.id) textarea.value = value;
      }
      syncStatus = pendingSync.size ? 'Syncing notes…' : 'Notes synced';
      updateSaveStatus();
    } catch {
      syncStatus = 'Sync unavailable. Retrying…';
      if (!disposed) updateSaveStatus();
    } finally {
      syncInProgress = false;
    }
  }
  function updatePreview(view, page, pageIndex) {
    view.img.hidden = !page?.preview;
    view.fallback.hidden = Boolean(page?.preview);
    if (!page) {
      view.titleNode.textContent = 'End of presentation';
      view.fallback.textContent = 'You’re on the last slide.';
      view.img.removeAttribute('src');
      return;
    }
    view.titleNode.textContent = `${pageIndex + 1}. ${page.title}`;
    view.img.alt = `${pageIndex + 1}. ${page.title}`;
    view.fallback.textContent = 'Preview unavailable';
    if (page.preview) {
      try {
        const url = new URL(page.preview, location.href);
        if (url.origin !== location.origin) throw new Error('Preview must be same-origin');
        view.img.src = url.href;
      } catch {
        view.img.removeAttribute('src');
        view.img.hidden = true;
        view.fallback.hidden = false;
      }
    } else view.img.removeAttribute('src');
  }
  function render(nextIndex, force = false) {
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= pages.length) return;
    if (!force && index === nextIndex) return;
    index = nextIndex;
    updatePreview(current, pages[index], index);
    updatePreview(next, pages[index + 1], index + 1);
    textarea.value = getNotes(pages[index].id);
    textarea.setAttribute('aria-label', `Speaker notes for slide ${index + 1}: ${pages[index].title}`);
    jump.value = String(index);
    previous.disabled = index === 0;
    nextButton.disabled = index === pages.length - 1;
    updateSaveStatus();
  }
  function post(message) {
    try { channel?.postMessage(message); } catch { /* Reconnect is handled by the next hello. */ }
  }
  function hello() { post({ type: 'presenter:hello' }); }
  function isConnected() {
    return Boolean(channel && lastAudienceMessage !== null && Date.now() - lastAudienceMessage <= 6000);
  }
  function go(nextIndex) {
    if (nextIndex < 0 || nextIndex >= pages.length || !Number.isInteger(nextIndex)) return;
    pendingSelection = { index: nextIndex, sentAt: isConnected() ? Date.now() : null };
    render(nextIndex);
    post({ type: 'presenter:goto', index: nextIndex });
  }
  function updateConnection() {
    const connected = isConnected();
    connection.dataset.connected = String(connected);
    connection.textContent = !channel ? 'Live sync unavailable' : connected ? 'Slides connected' : hasConnected ? 'Slides window disconnected' : 'Waiting for slides window';
    openAudience.textContent = connected ? 'Focus slides window' : 'Open slides window';
  }
  try {
    channel = new BroadcastChannel(channelName);
    channel.addEventListener('message', event => {
      const message = event.data;
      if (!message || typeof message !== 'object' || Array.isArray(message)
        || !['audience:state', 'audience:heartbeat'].includes(message.type)
        || !Number.isInteger(message.index) || message.index < 0 || message.index >= pages.length) return;
      const wasConnected = isConnected();
      lastAudienceMessage = Date.now();
      hasConnected = true;
      updateConnection();
      if (pendingSelection) {
        if (message.index === pendingSelection.index) {
          pendingSelection = null;
        } else if (!wasConnected || pendingSelection.sentAt === null) {
          // A reconnect starts the acknowledgement clock; editing offline never expires a selection.
          pendingSelection.sentAt = Date.now();
          post({ type: 'presenter:goto', index: pendingSelection.index });
          return;
        } else if (Date.now() - pendingSelection.sentAt < 1500) {
          // A queued heartbeat can describe the previous slide while the audience is navigating.
          return;
        } else {
          // A live audience remains authoritative if it rejects or supersedes the request.
          pendingSelection = null;
        }
      }
      render(message.index);
    });
  } catch {
    notice.textContent = 'This browser does not support live slide syncing. You can still edit and export your notes here.';
    notice.hidden = false;
  }

  listen(previous, 'click', () => go(index - 1));
  listen(nextButton, 'click', () => go(index + 1));
  listen(jump, 'change', () => go(Number(jump.value)));
  function saveNotes(ids, message, sync = true) {
    for (const id of ids) {
      if (notesUrl && sync) pendingSync.set(id, { value: notes.get(id) });
      try {
        localStorage.setItem(storageKey(id), notes.get(id));
        unsavedNotes.delete(id);
      } catch {
        unsavedNotes.add(id);
      }
    }
    storageFailed = unsavedNotes.size > 0;
    if (notesUrl && pendingSync.size) syncStatus = 'Syncing notes…';
    updateSaveStatus(notesUrl ? syncStatus : message);
  }
  listen(textarea, 'input', () => {
    const id = pages[index].id;
    notes.set(id, textarea.value);
    saveNotes([id]);
  });
  listen(saveNotesButton, 'click', () => {
    saveNotes(unsavedNotes, notesUrl ? 'Syncing notes…' : 'All slide notes saved', false);
    void syncNotes();
  });
  listen(openAudience, 'click', () => {
    post({ type: 'presenter:audience' });
    const connected = isConnected();
    let focusTarget = null;
    if (connected) {
      try {
        const candidate = audienceWindow && !audienceWindow.closed ? audienceWindow : window.opener;
        if (candidate && !candidate.closed) focusTarget = candidate;
      } catch { /* COOP can separate the two browsing contexts. */ }
      if (focusTarget) {
        try { focusTarget.focus(); return; } catch { /* Try the named-window fallback below. */ }
      }
    }
    // Empty URL reuses a named audience without resetting its current slide.
    audienceWindow = window.open('', audienceWindowName || `portfolio-audience-${deckId}`);
    if (!audienceWindow) {
      notice.textContent = 'Your browser blocked the slides window. Allow pop-ups for this site, then choose Open slides window again.';
      notice.hidden = false;
    } else {
      try {
        if (audienceWindow.location.href === 'about:blank') {
          if (!pendingSelection) pendingSelection = { index, sentAt: null };
          else pendingSelection.sentAt = null;
          audienceWindow.location.replace(audienceUrl);
        }
        audienceWindow.focus();
      } catch { /* An existing audience may be crossing its sign-in screen; leave it in place. */ }
      notice.hidden = !storageFailed;
      if (storageFailed) updateSaveStatus();
      hello();
    }
  });
  listen(importNotes, 'click', () => notesFile.click());
  listen(notesFile, 'change', async () => {
    const file = notesFile.files[0];
    notesFile.value = '';
    if (!file) return;
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      saveStatus.textContent = 'Could not read the notes file';
      return;
    }
    if (disposed) return;
    if (data?.version !== 1 || data.deckId !== deckId || !Array.isArray(data.notes) ||
        data.notes.some(entry => typeof entry?.id !== 'string' || typeof entry.text !== 'string')) {
      saveStatus.textContent = 'Choose a notes export for this presentation';
      return;
    }
    const pageIds = new Set(pages.map(page => page.id));
    const imported = new Map(data.notes.filter(entry => pageIds.has(entry.id) && entry.text.trim())
      .map(entry => [entry.id, entry.text]));
    if (!imported.size) {
      saveStatus.textContent = 'No matching notes in this file';
      return;
    }
    for (const [id, value] of imported) {
      notes.set(id, value);
    }
    saveNotes(imported.keys(), `Imported notes for ${imported.size} slides`);
    render(index, true);
    updateSaveStatus(`Imported notes for ${imported.size} slides`);
  });
  listen(exportNotes, 'click', () => {
    const data = { version: 1, deckId, title, exportedAt: new Date().toISOString(), notes: pages.map(page => ({ id: page.id, title: page.title, text: getNotes(page.id) })) };
    exportText.value = JSON.stringify(data, null, 2);
    exportText.hidden = true;
    exportStatus.textContent = 'If the download did not start, download or copy the backup here.';
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    exportUrl = URL.createObjectURL(new Blob([exportText.value], { type: 'application/json' }));
    exportLink.href = exportUrl;
    exportLink.download = `${String(deckId).replace(/[^a-z0-9_-]/gi, '-')}-speaker-notes.json`;
    exportPanel.hidden = false;
    exportLink.click();
  });
  listen(copyExport, 'click', async () => {
    try {
      await navigator.clipboard.writeText(exportText.value);
      exportStatus.textContent = 'Notes backup copied.';
    } catch {
      exportText.hidden = false;
      exportText.focus();
      exportText.select();
      exportStatus.textContent = 'Press Command+C or Ctrl+C to copy the selected backup.';
    }
  });
  listen(closeExport, 'click', () => {
    exportPanel.hidden = true;
    exportNotes.focus();
  });
  function updateClock() {
    const seconds = Math.floor((elapsed + (startedAt === null ? 0 : performance.now() - startedAt)) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
    const remainder = String(seconds % 60).padStart(2, '0');
    clock.value = hours ? `${hours}:${minutes}:${remainder}` : `${minutes}:${remainder}`;
  }
  listen(timerToggle, 'click', () => {
    if (startedAt === null) {
      startedAt = performance.now();
      timerToggle.textContent = 'Pause timer';
    } else {
      elapsed += performance.now() - startedAt;
      startedAt = null;
      timerToggle.textContent = 'Resume timer';
    }
    updateClock();
  });
  listen(timerReset, 'click', () => {
    elapsed = 0;
    startedAt = null;
    timerToggle.textContent = 'Start timer';
    updateClock();
  });
  listen(document, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest?.('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); go(index - 1); }
    if (['ArrowRight', 'PageDown'].includes(event.key)) { event.preventDefault(); go(index + 1); }
  });
  listen(window, 'pageshow', hello);
  listen(document, 'visibilitychange', () => { if (!document.hidden) hello(); });
  const heartbeat = setInterval(() => { hello(); updateConnection(); void syncNotes(); }, 2000);
  const timerInterval = setInterval(updateClock, 250);
  if (pages.length) render(0, true);
  else {
    current.titleNode.textContent = 'No slides available';
    current.img.hidden = true;
    current.fallback.hidden = false;
    next.card.hidden = true;
    textarea.disabled = true;
    saveNotesButton.disabled = true;
    previous.disabled = true;
    nextButton.disabled = true;
    jump.disabled = true;
  }
  updateConnection();
  hello();
  void syncNotes();
  return () => {
    if (disposed) return;
    disposed = true;
    clearInterval(heartbeat);
    clearInterval(timerInterval);
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    for (const remove of listeners) remove();
    channel?.close();
    app.remove();
    document.body.classList.remove('presenter-window');
  };
}
