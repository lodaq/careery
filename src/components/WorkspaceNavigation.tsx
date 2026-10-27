import { MessageSquareTextIcon, CalendarCheckIcon, BriefcaseBusinessIcon, ChartNoAxesCombinedIcon, FolderIcon, LibraryIcon, SettingsIcon } from 'lucide-react';
import { WorkspaceNavigationLink } from './WorkspaceNavigationLink';
const links = [['/today', 'Today', CalendarCheckIcon], ['/applications', 'Applications', BriefcaseBusinessIcon], ['/profiles', 'Profiles', FolderIcon], ['/career-record', 'Career Record', LibraryIcon], ['/interview-questions', 'Interview questions', MessageSquareTextIcon], ['/analytics', 'Analytics', ChartNoAxesCombinedIcon], ['/settings', 'Settings', SettingsIcon]] as const;
export function WorkspaceNavigation() {
  return <nav className="workspace-navigation" aria-label="Workspace"><div className="workspace-navigation-links">
    {links.map(([href, label, Icon]) => <WorkspaceNavigationLink key={href} href={href} label={label}><Icon aria-hidden="true" /><span className="navigation-label">{label}</span></WorkspaceNavigationLink>)}
  </div></nav>;
}
