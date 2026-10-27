import { WorkspaceShell } from '@/components/WorkspaceShell';
import { ThemeSettings } from './ThemeSettings';
export default function SettingsPage() {
  return <WorkspaceShell contentId="settings-content" className="settings-main"><h1>Settings</h1><p className="page-intro">Make your workspace comfortable to use.</p><section className="settings-section" aria-labelledby="appearance-heading"><h2 id="appearance-heading">Appearance</h2><ThemeSettings /></section></WorkspaceShell>;
}
