import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { FileTextIcon, FolderIcon, LibraryIcon } from 'lucide-react';
export default function Page() {
  return <WorkspaceShell contentId="home-content" footer="Made for your next move. Stored on your machine.">
    <div className="introduction"><h1>Your next chapter starts here.</h1><p>Keep your career in one place. Shape a resume for wherever you want to go.</p><Button nativeButton={false} role="link" render={<Link href="/career-record" />} size="lg"><LibraryIcon data-icon="inline-start" />Build your Career Record</Button></div>
    <section className="home-workspace" aria-labelledby="home-workspace-title"><h2 id="home-workspace-title">Your workspace</h2><p>Start with your career content, organize a Profile, or pick up a Resume.</p><div className="row-actions"><Button nativeButton={false} role="link" render={<Link href="/profiles" prefetch={false} />} variant="outline" size="lg"><FolderIcon data-icon="inline-start" />Browse Profiles</Button><Button nativeButton={false} role="link" render={<Link href="/resumes" prefetch={false} />} variant="outline" size="lg"><FileTextIcon data-icon="inline-start" />Browse Resumes</Button></div></section>
  </WorkspaceShell>;
}
