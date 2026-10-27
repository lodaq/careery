// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { BilingualInput } from './BilingualInput';
afterEach(cleanup);
it('keeps persisted textarea wording out of its accessible label', () => {
  render(<BilingualInput name="achievement" label="Achievement 1" value={{ en: 'Saved wording', ar: 'نص محفوظ' }} required multiline />);
  expect(screen.getByLabelText<HTMLTextAreaElement>('Achievement 1').value).toBe('Saved wording');
  expect(screen.getByLabelText<HTMLTextAreaElement>('Achievement 1 · Arabic (optional)').value).toBe('نص محفوظ');
});
