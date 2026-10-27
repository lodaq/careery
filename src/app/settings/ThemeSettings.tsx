'use client';
import { useSyncExternalStore } from 'react';
import { MoonIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
const subscribe = (callback: () => void) => { window.addEventListener('careery-theme', callback); return () => window.removeEventListener('careery-theme', callback); };
export function ThemeSettings() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains('dark'), () => false);
  function changeTheme(checked: boolean) {
    document.documentElement.classList.toggle('dark', checked);
    try { localStorage.setItem('careery-theme', checked ? 'dark' : 'light'); } catch { /* The current session still uses the selected theme. */ }
    window.dispatchEvent(new Event('careery-theme'));
  }
  return <FieldGroup><Field orientation="horizontal"><FieldContent><FieldLabel htmlFor="dark-mode"><MoonIcon className="size-4" aria-hidden="true" />Dark mode</FieldLabel><FieldDescription>Use a darker workspace. Your preference is saved on this browser.</FieldDescription></FieldContent><Switch id="dark-mode" checked={dark} onCheckedChange={changeTheme} /></Field></FieldGroup>;
}
