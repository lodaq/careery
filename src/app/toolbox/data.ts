import { join } from 'node:path';
import { dataDirectory, readJson, updateJson } from '@/lib/storage';
export interface Tool {
  id: string;
  name: string;
  url: string;
  icon: string;
  description?: string;
  category?: string;
}
interface Toolbox { version: 1; tools: Tool[] }
export function website(value: string) {
  const url = new URL(value.includes('://') ? value : `https://${value}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.') || value.length > 2048) throw new Error('Enter a public HTTP or HTTPS website link without credentials.');
  return url.href;
}
export async function readTools(directory?: string): Promise<Toolbox> {
  directory ??= await dataDirectory();
  const data = await readJson<Toolbox>(join(directory, 'toolbox.json'), () => ({ version: 1, tools: [] }));
  if (!Array.isArray(data.tools) || data.tools.some(t => !t || ['id', 'name', 'url', 'icon'].some(k => typeof t[k as keyof Tool] !== 'string') || (t.description !== undefined && typeof t.description !== 'string') || (t.category !== undefined && typeof t.category !== 'string'))) throw new Error('Invalid Toolbox; original data was preserved.');
  for (const tool of data.tools) { website(tool.url); if (tool.icon) website(tool.icon); }
  return data;
}
export async function changeTool(operation: string, tool: Tool, directory?: string) {
  if (!['save', 'delete'].includes(operation) || !tool.id || tool.id.length > 100) throw new Error('Invalid tool.');
  if (operation === 'save') {
    tool = {
      ...tool,
      url: website(tool.url),
      name: tool.name.trim().slice(0, 200),
      icon: tool.icon ? website(tool.icon) : '',
      description: tool.description ? tool.description.trim().slice(0, 1000) : undefined,
      category: tool.category ? tool.category.trim().slice(0, 100) : undefined,
    };
    if (!tool.name) throw new Error('Enter a tool name.');
  }
  directory ??= await dataDirectory();
  return updateJson(join(directory, 'toolbox.json'), () => readTools(directory), data => {
    const index = data.tools.findIndex(t => t.id === tool.id);
    if (operation === 'delete') { if (index >= 0) data.tools.splice(index, 1); }
    else if (index >= 0) data.tools[index] = tool;
    else data.tools.unshift(tool);
  });
}
export async function seedToolbox(directory?: string) {
  const { seedTools } = await import('./seed-data');
  directory ??= await dataDirectory();
  return updateJson(join(directory, 'toolbox.json'), () => readTools(directory), data => {
    const existingUrls = new Set(data.tools.map(t => t.url));
    const toAdd = seedTools.filter(t => !existingUrls.has(t.url));
    data.tools.push(...toAdd);
  });
}
