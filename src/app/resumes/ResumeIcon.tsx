import { ArrowLeftIcon, EyeIcon, PaletteIcon, PanelsTopLeftIcon, CheckIcon } from 'lucide-react';
const icons = { back: ArrowLeftIcon, eye: EyeIcon, palette: PaletteIcon, template: PanelsTopLeftIcon, check: CheckIcon };
export function ResumeIcon({ kind }: { kind: keyof typeof icons }) {
  const Icon = icons[kind];
  return <Icon className="studio-icon" aria-hidden="true" />;
}
