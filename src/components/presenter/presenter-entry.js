import deck from './deck';
import {mountPresenter} from './presenter-window.js';
const url = new URL(location.href);
let session = url.searchParams.get('session');
if (!session || !/^[a-zA-Z0-9-]{8,80}$/.test(session)) {
  session = crypto.randomUUID();
  url.searchParams.set('session', session);
  history.replaceState(null, '', url);
}
const audienceUrl = new URL('/notionxmaggie', location.origin);
audienceUrl.searchParams.set('presenterSession', session);
mountPresenter({...deck, audienceUrl:audienceUrl.href, audienceWindowName:`portfolio-audience-${deck.deckId}-${session}`, channelName:`portfolio-presenter:${deck.deckId}:${session}`, notesUrl: import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? '/api/notion-speaker-notes' : null});
