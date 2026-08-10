/*
 * Phase 1 of the skills-mining plan: index all parent chat transcripts
 * (subagents excluded) across ~/.cursor/projects, deduped by chat UUID,
 * newest first. Output: skills-mining/index.json.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const OUT = new URL("./index.json", import.meta.url).pathname;

const raw = execSync(
  `find ${os.homedir()}/.cursor/projects -path '*/agent-transcripts/*/*.jsonl' ! -path '*/subagents/*' -exec stat -f '%m %z %N' {} \\;`,
  { encoding: "utf8" },
);

const entries = raw
  .trim()
  .split("\n")
  .map((line) => {
    const match = line.match(/^(\d+) (\d+) (.+)$/);
    if (!match) return null;
    const [, mtime, size, file] = match;
    return { mtime: Number(mtime), size: Number(size), file };
  })
  .filter(Boolean);

// The same chat can be mirrored under more than one project folder; keep the
// largest copy, which is the most complete.
const byId = new Map();
for (const entry of entries) {
  const id = path.basename(entry.file, ".jsonl");
  const existing = byId.get(id);
  if (!existing || entry.size > existing.size) byId.set(id, entry);
}

function firstUserQuery(file) {
  const content = fs.readFileSync(file, "utf8");
  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    if (parsed.role !== "user") continue;
    const text = (parsed.message?.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    const query = text.match(/<user_query>\n?([\s\S]*?)\n?<\/user_query>/);
    if (query) return query[1].trim().slice(0, 200);
    if (text.trim()) return text.trim().slice(0, 200);
  }
  return null;
}

function countUserMessages(file) {
  const content = fs.readFileSync(file, "utf8");
  let count = 0;
  for (const line of content.split("\n")) {
    if (line.startsWith('{"role":"user"')) count += 1;
  }
  return count;
}

const index = [...byId.entries()]
  .map(([id, entry]) => {
    const project = entry.file.match(/projects\/([^/]+)\/agent-transcripts/)?.[1] ?? "unknown";
    return {
      id,
      project,
      date: new Date(entry.mtime * 1000).toISOString().slice(0, 10),
      size_kb: Math.round(entry.size / 1024),
      user_messages: countUserMessages(entry.file),
      first_user_message: firstUserQuery(entry.file),
      file_path: entry.file,
      processed: false,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : -1));

fs.writeFileSync(OUT, JSON.stringify(index, null, 2));
console.log(`${index.length} chats indexed -> ${OUT}`);
for (const item of index) {
  console.log(
    `${item.date}  ${item.id.slice(0, 8)}  ${String(item.size_kb).padStart(6)}kB  ${String(item.user_messages).padStart(3)} msgs  ${item.first_user_message?.slice(0, 60) ?? "(empty)"}`,
  );
}
