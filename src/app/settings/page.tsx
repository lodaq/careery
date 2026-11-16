import { PageHeading } from '@/components/PageHeading';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { ThemeSettings } from './ThemeSettings';
import { DataSettings } from './DataSettings';
export const metadata = { title: 'Settings', description: 'Manage your account preferences and workspace backups.', robots: { index: false, follow: false } };

export default function SettingsPage() {
  return <WorkspaceShell contentId="settings-content" className="settings-main"><PageHeading><h1>Settings</h1><p className="page-intro">Make your workspace comfortable to use.</p></PageHeading><section className="settings-section" aria-labelledby="appearance-heading"><h2 id="appearance-heading">Appearance</h2><ThemeSettings /></section><section className="settings-section" aria-labelledby="data-heading"><h2 id="data-heading">Your data</h2><DataSettings /></section></WorkspaceShell>;
}
