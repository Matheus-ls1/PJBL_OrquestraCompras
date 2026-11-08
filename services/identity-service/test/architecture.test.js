import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

async function files(directory) { const entries = await readdir(directory, { withFileTypes: true }); return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat(); }
test('Domain não depende de API ou Infrastructure', async () => { const domainFiles = await files(fileURLToPath(new URL('../src/domain', import.meta.url))); for (const file of domainFiles.filter((file) => file.endsWith('.js'))) { const content = await readFile(file, 'utf8'); assert.doesNotMatch(content, /(?:api|infrastructure|express|mongodb|bcrypt|jsonwebtoken)/i); } });
