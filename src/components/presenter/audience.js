import deck from './deck';

const sessionKey = `portfolio:audience-session:${deck.deckId}`;
const validSession = value => typeof value === 'string' && /^[a-zA-Z0-9-]{8,80}$/.test(value);
const requestedSession = new URL(location.href).searchParams.get('presenterSession');
let sessionId;
try { sessionId = validSession(requestedSession) ? requestedSession : sessionStorage.getItem(sessionKey); } catch {}
if (!validSession(sessionId)) sessionId = crypto.randomUUID();
try { sessionStorage.setItem(sessionKey, sessionId); } catch {}
const channelName = `portfolio-presenter:${deck.deckId}:${sessionId}`;
window.name = `portfolio-audience-${deck.deckId}-${sessionId}`;
let channel;
try { channel = new BroadcastChannel(channelName); } catch { /* The button explains unsupported browsers. */ }
let lastIndex = -1;
const indexKey = `${sessionKey}:index:${sessionId}`;
let pendingIndex = null;
try {
  const saved = sessionStorage.getItem(indexKey);
  if (saved !== null && /^\d+$/.test(saved) && Number(saved) < deck.slides.length) pendingIndex = Number(saved);
} catch {}
let awaitingIndex = null;
let requestedAt = 0;
let presenterSeenAt = 0;
let presenterWindow;

const button = document.createElement('button');
button.id = 'portfolio-presenter-button';
button.type = 'button';
button.textContent = 'Presenter view';
button.title = 'Open speaker notes in a separate window (P)';
button.setAttribute('aria-keyshortcuts', 'P');
const status = document.createElement('p');
status.id = 'portfolio-presenter-status';
status.setAttribute('role', 'status');
status.hidden = true;
document.body.append(button, status);

function navigation() {
  const nav = document.querySelector('nav[aria-label="Presentation navigation"]');
  const buttons = nav ? [...nav.querySelectorAll('button[aria-label^="Go to page "]')] : [];
  const island = nav?.closest('astro-island');
  return { buttons, ready: buttons.length === deck.slides.length && !island?.hasAttribute('ssr') };
}
function sendState(force = false, type = 'audience:state') {
  const {buttons, ready} = navigation();
  if (!ready) return;
  if (pendingIndex !== null) {
    const next = pendingIndex;
    pendingIndex = null;
    awaitingIndex = next;
    requestedAt = Date.now();
    buttons[next].click();
    return;
  }
  const index = buttons.findIndex(item => item.getAttribute('aria-current') === 'page');
  if (index < 0) return;
  if (awaitingIndex !== null) {
    if (index === awaitingIndex) awaitingIndex = null;
    else if (Date.now() - requestedAt < 1500) return;
    else awaitingIndex = null;
  }
  if (force || index !== lastIndex) channel?.postMessage({type, index, slideId:deck.slides[index].id});
  if (index !== lastIndex) { try { sessionStorage.setItem(indexKey, String(index)); } catch {} }
  lastIndex = index;
}
function openPresenter() {
  if (!channel) {
    status.textContent = 'Presenter view needs a current version of Chrome, Safari, Firefox, or Edge.';
    status.hidden = false;
    return;
  }
  const url = new URL('/notionxmaggie/presenter/', location.origin);
  url.searchParams.set('session', sessionId);
  presenterWindow = window.open(url.href, `portfolio-presenter-${deck.deckId}-${sessionId}`, 'popup=yes,width=1280,height=850,resizable=yes,scrollbars=yes');
  if (!presenterWindow) {
    status.textContent = 'Allow pop-ups for this site, then try Presenter view again.';
    status.hidden = false;
  } else {
    status.hidden = true;
    presenterWindow.focus();
  }
}
button.addEventListener('click', openPresenter);
window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
  if (event.key.toLowerCase() === 'p') { event.preventDefault(); openPresenter(); }
});
if (channel) channel.onmessage = ({data}) => {
  if (!data || typeof data !== 'object') return;
  if (!['presenter:hello','presenter:goto','presenter:audience'].includes(data.type)) return;
  presenterSeenAt = Date.now();
  button.hidden = true;
  status.hidden = true;
  if (data.type === 'presenter:goto') {
    if (!Number.isInteger(data.index) || data.index < 0 || data.index >= deck.slides.length) return;
    pendingIndex = data.index;
    sendState();
  } else {
    if (data.type === 'presenter:audience') window.focus();
    sendState(true);
  }
};
const observer = new MutationObserver(() => sendState());
observer.observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:['aria-current','ssr']});
const interval = setInterval(() => {
  if (presenterSeenAt && Date.now() - presenterSeenAt > 6500) button.hidden = false;
  sendState(true, 'audience:heartbeat');
}, 2000);
window.addEventListener('pageshow', () => sendState(true));
document.addEventListener('visibilitychange', () => { if (!document.hidden) sendState(true); });
window.addEventListener('pagehide', event => {
  if (!event.persisted) { observer.disconnect(); clearInterval(interval); channel?.close(); }
});
sendState(true);
