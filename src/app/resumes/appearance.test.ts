import { expect, it } from 'vitest';
import { defaultAppearance, parseAppearance, stylePresets } from './appearance';
it('validates all supported presets and rejects unsafe or out-of-range style input', () => {
  expect(parseAppearance(new FormData())).toBeUndefined();
  const form = new FormData();
  for (const preset of stylePresets) {
    for (const [key, value] of Object.entries(preset.value)) form.set(`appearance.${key}`, String(value));
    expect(parseAppearance(form)).toEqual(preset.value);
  }
  for (const [key, value] of Object.entries(defaultAppearance)) form.set(`appearance.${key}`, String(value));
  for (const [key, value] of [['accent', 'url(https://example.com)'], ['bodySize', '100'], ['font', 'remote-font'], ['template', 'unknown'], ['spacing', 'NaN']]) {
    const invalid = new FormData(); form.forEach((value, key) => invalid.set(key, value)); invalid.set(`appearance.${key}`, value);
    expect(() => parseAppearance(invalid)).toThrow('style settings');
  }
});
