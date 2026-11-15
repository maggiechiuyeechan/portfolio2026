import type { APIRoute } from 'astro';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import deck from '../../components/presenter/deck';

export const prerender = false;

const directory = resolve('.speaker-notes');
const notesPath = resolve(directory, 'notion-speaker-notes.json');
const slideIds = new Set<string>(deck.slides.map(slide => String(slide.id)));
let writes = Promise.resolve();

function allowed(request: Request) {
  const { hostname, origin } = new URL(request.url);
  return import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
    && (request.headers.get('origin') ?? origin) === origin
    && request.headers.get('sec-fetch-site') !== 'cross-site';
}

async function readNotes(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(notesPath, 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}

export const GET: APIRoute = async ({ request }) => {
  if (!allowed(request)) return new Response(null, { status: 404 });
  return json(await readNotes());
};

export const PUT: APIRoute = async ({ request }) => {
  if (!allowed(request) || !request.headers.get('content-type')?.startsWith('application/json')) {
    return new Response(null, { status: 404 });
  }
  const payload = await request.json().catch(() => null);
  const edits = payload?.edits;
  if (!edits || typeof edits !== 'object' || Array.isArray(edits)
    || Object.entries(edits).some(([id, value]) => !slideIds.has(id) || typeof value !== 'string')) {
    return json({ error: 'Invalid slide notes' }, 400);
  }

  const write = writes.then(async () => {
    const current = await readNotes();
    for (const [id, value] of Object.entries<string>(edits)) {
      if (!payload.fillMissing || !Object.hasOwn(current, id)) current[id] = value;
    }
    await mkdir(directory, { recursive: true });
    await writeFile(notesPath + '.tmp', JSON.stringify(current), { mode: 0o600 });
    await rename(notesPath + '.tmp', notesPath);
    return current;
  });
  writes = write.then(() => {}, () => {});
  return json(await write);
};
