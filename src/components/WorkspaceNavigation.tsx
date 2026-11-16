import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { WrenchIcon, StickyNoteIcon, BookOpenIcon, MessageSquareTextIcon, CalendarCheckIcon, BriefcaseBusinessIcon, ChartNoAxesCombinedIcon, FolderIcon, LibraryIcon, SettingsIcon } from 'lucide-react';
import { WorkspaceNavigationLink } from './WorkspaceNavigationLink';
const links = [['/today', 'Today', CalendarCheckIcon], ['/applications', 'Applications', BriefcaseBusinessIcon], ['/profiles', 'Profiles', FolderIcon], ['/career-record', 'Career Record', LibraryIcon], ['/interview-questions', 'Interview questions', MessageSquareTextIcon], ['/lessons', 'Lessons', BookOpenIcon], ['/analytics', 'Analytics', ChartNoAxesCombinedIcon], ['/notes', 'Notes', StickyNoteIcon], ['/resources', 'Resources', BookOpenIcon], ['/toolbox', 'Toolbox', WrenchIcon], ['/settings', 'Settings', SettingsIcon]] as const;
export function WorkspaceNavigation() {
  return <nav className="workspace-sidebar-navigation" aria-label="Workspace"><SidebarGroup><SidebarGroupContent><SidebarMenu>
    {links.map(([href, label, Icon]) => <SidebarMenuItem key={href}><WorkspaceNavigationLink href={href} label={label}><Icon aria-hidden="true" /><span className="navigation-label">{label}</span></WorkspaceNavigationLink></SidebarMenuItem>)}
  </SidebarMenu></SidebarGroupContent></SidebarGroup></nav>;
}
