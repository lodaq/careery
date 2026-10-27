import type { ResumeAppearance } from '../../lib/types';
export const templates = [
  ['classic', 'Classic Resume'], ['professional', 'Professional'], ['centered', 'Centered'], ['accent', 'Accent'], ['cream', 'Cream'], ['ledger', 'Ledger'],
] as const;
export const defaultAppearance: ResumeAppearance = { template: 'classic', font: 'serif', bodySize: 10, nameSize: 24, accent: '#344b8e', spacing: 1.4 };
export const stylePresets = [
  { name: 'Professional', description: 'Balanced', value: defaultAppearance },
  { name: 'Compact', description: 'Dense', value: { ...defaultAppearance, bodySize: 9, spacing: 1.2 } },
  { name: 'Modern', description: 'Crisp', value: { ...defaultAppearance, template: 'professional', font: 'sans', accent: '#315e55', spacing: 1.5 } },
  { name: 'Elegant', description: 'Editorial', value: { ...defaultAppearance, template: 'ledger', accent: '#51416b', nameSize: 28, spacing: 1.5 } },
] satisfies { name: string; description: string; value: ResumeAppearance }[];
export function parseAppearance(form: FormData): ResumeAppearance | undefined {
  if (!form.has('appearance.template')) return undefined;
  const template = form.get('appearance.template'), font = form.get('appearance.font'), accent = form.get('appearance.accent');
  const bodySize = Number(form.get('appearance.bodySize')), nameSize = Number(form.get('appearance.nameSize')), spacing = Number(form.get('appearance.spacing'));
  if (!templates.some(([key]) => key === template) || !['sans', 'serif', 'mono'].includes(String(font)) || typeof accent !== 'string' || !/^#[0-9a-f]{6}$/i.test(accent) || !Number.isFinite(bodySize) || bodySize < 8 || bodySize > 13 || !Number.isFinite(nameSize) || nameSize < 18 || nameSize > 32 || !Number.isFinite(spacing) || spacing < 1.1 || spacing > 1.8) throw new Error('Check the Resume style settings.');
  return { template: templates.find(([key]) => key === template)![0], font: font === 'sans' ? 'sans' : font === 'mono' ? 'mono' : 'serif', accent, bodySize, nameSize, spacing };
}
