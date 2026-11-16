import { afterEach, expect, it } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { changeTool, readTools, website } from './data';
const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map(d => rm(d, { recursive: true, force: true }))); });
it('normalizes links and rejects unsafe protocols and credentials', () => {
  expect(website('example.com/path')).toBe('https://example.com/path');
  for (const url of ['javascript://example.com', 'file://example.com', 'https://user:pass@example.com', 'https://localhost']) expect(() => website(url)).toThrow();
});
it('persists add, edit and delete without changing other tools', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'toolbox-')); directories.push(dir);
  const tool = { id: 'one', name: 'Example', url: 'https://example.com/', icon: '' };
  await changeTool('save', tool, dir);
  await changeTool('save', { ...tool, id: 'two' }, dir);
  await changeTool('save', { ...tool, name: 'Renamed' }, dir);
  expect((await readTools(dir)).tools.find(t => t.id === 'one')?.name).toBe('Renamed');
  await changeTool('delete', tool, dir);
  expect((await readTools(dir)).tools.map(t => t.id)).toEqual(['two']);
});
it('supports category, description and seedToolbox', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'toolbox-')); directories.push(dir);
  const tool = { id: 'one', name: 'Example', url: 'https://example.com/', icon: '', category: 'General', description: 'Helpful tool' };
  await changeTool('save', tool, dir);
  const saved = (await readTools(dir)).tools[0];
  expect(saved.category).toBe('General');
  expect(saved.description).toBe('Helpful tool');
  const { seedToolbox } = await import('./data');
  await seedToolbox(dir);
  const seeded = await readTools(dir);
  expect(seeded.tools.length).toBeGreaterThan(100);
  expect(seeded.tools.find(t => t.id === 'one')?.name).toBe('Example');
});
