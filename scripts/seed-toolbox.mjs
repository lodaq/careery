import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(process.env.CAREERY_DATA_DIR ?? 'data');
await mkdir(rootDir, { recursive: true });

const seedTools = JSON.parse(await readFile(join(__dirname, '../src/app/toolbox/seed-tools.json'), 'utf8'));
const payload = JSON.stringify({ version: 1, tools: seedTools }, null, 2) + '\n';
await writeFile(join(rootDir, 'toolbox.json'), payload, 'utf8');
console.log(`Seeded ${join(rootDir, 'toolbox.json')} with ${seedTools.length} tools.`);

const usersDir = join(rootDir, 'users');
try {
  const users = await readdir(usersDir);
  for (const user of users) {
    const userDir = join(usersDir, user);
    const s = await stat(userDir);
    if (s.isDirectory()) {
      await writeFile(join(userDir, 'toolbox.json'), payload, 'utf8');
      console.log(`Seeded ${join(userDir, 'toolbox.json')} with ${seedTools.length} tools.`);
    }
  }
} catch {
  // users directory might not exist yet; root is seeded.
}
