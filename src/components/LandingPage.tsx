import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguagePreview } from './LanguagePreview';

export function LandingPage() {
  return <div className="landing"><a className="sr-only focus:not-sr-only" href="#landing-content">Skip to content</a>

<header style={{"paddingTop": "20px"}} className="wrap">
<div className="raise hdr">
<Link href="/" aria-label="Careery home" className="wm"><span aria-hidden="true" className="raise pri m logo">C</span>Careery</Link>
<nav aria-label="Primary" className="nav"><Button variant="outline" render={<a href="#features" />} nativeButton={false} className="btn ctl">Features</Button><Button variant="outline" render={<a href="#analytics" />} nativeButton={false} className="btn ctl">Analytics</Button><Button variant="outline" render={<a href="#languages" />} nativeButton={false} className="btn ctl">Languages</Button></nav>
<div className="acts"><SignInButton mode="modal" forceRedirectUrl="/today"><Button variant="outline" className="btn ctl">Sign in</Button></SignInButton><SignUpButton mode="modal" forceRedirectUrl="/career-record"><Button variant="default" className="btn pri">Get started</Button></SignUpButton></div>
</div>
</header>
<main id="landing-content">
<section className="wrap hero">
<div className="raise slab">
<div className="copy">
<h1 className="h1">Record your career once. Build a resume for every direction.</h1>
<p className="lead">Careery keeps your experience, education, projects, skills and certifications in one Career Record. Group them into Profiles, choose what each Resume shows, and write it in English or Arabic.</p>
<div className="acts"><SignUpButton mode="modal" forceRedirectUrl="/career-record"><Button variant="default" className="btn pri">Start your Career Record</Button></SignUpButton><Button variant="secondary" render={<a href="#features" />} nativeButton={false} className="btn sec">See how it works</Button></div>
</div>
<div aria-hidden="true" className="stage">
<div className="raise pri plate"></div>
<Card className="raise sh a"><Badge className="tag">Ledger</Badge><div className="pp led"><b>Your name</b><span>Software developer</span><i className="r"></i><em>Experience</em><i></i><i className="w"></i><i></i><em>Skills</em><i className="w"></i><i></i></div></Card>
<Card className="raise sh b"><Badge className="tag">Accent</Badge><div className="pp acc"><b>Your name</b><span>Software developer</span><i className="r"></i><em>Experience</em><i></i><i className="w"></i><i></i><em>Skills</em><i className="w"></i><i></i></div></Card>
<Card className="raise sh c"><Badge className="tag">Classic Resume</Badge><div className="pp"><b>Your name</b><span>Software developer</span><i className="r"></i><em>Experience</em><i></i><i className="w"></i><i></i><em>Skills</em><i className="w"></i><i></i></div></Card>
<div className="tabs"><span className="raise s ent">Experience</span><span className="raise s ent">Skills</span><span className="raise s ent">Certifications</span></div>
<div className="chips"><Badge className="tag">English</Badge><Badge dir="rtl" lang="ar" className="tag">العربية</Badge></div>
</div>
</div>
</section>
<section id="features" className="wrap band">
<h2 className="h2">How Careery keeps your career organized</h2>
<p className="mut">Everything starts in the Career Record. Profiles and Resumes build on it, so you don&apos;t retype your history for each application.</p>
<div className="cards">
<Card className="raise fcard"><h3>Career Record</h3><p>Add your experience, education, projects, skills and certifications once. Every Profile and Resume starts from this record.</p></Card>
<Card className="raise fcard"><h3>Profiles</h3><p>Create one for each direction you&apos;re considering, such as software development or IT support. A Profile keeps its own copies of your entries and its own Resumes.</p></Card>
<Card className="raise fcard"><h3>Resumes</h3><p>Choose which entries each Resume shows, then pick a template: Classic Resume, Professional, Centered, Accent, Cream or Ledger.</p></Card>
<Card className="raise fcard"><h3>English and Arabic</h3><p>Set the language of every Resume. Arabic documents lay out right to left.</p></Card>
<Card className="raise fcard"><h3>The rest of your search</h3><p>Track Applications, prepare Interview questions and keep Notes in the same workspace.</p></Card>
<Card className="raise fcard"><h3>Analytics</h3><p>See how your content is spread across Profiles, languages and templates, with exact counts in tables.</p></Card><Card className="raise fcard"><h3>PDF export and live preview</h3><p>Tailor wording, visibility, ordering and appearance, preview the result, and export an A4 PDF with selectable text.</p></Card><Card className="raise fcard"><h3>Optional AI review</h3><p>Request feedback on saved Resume wording for a target role. Review suggestions before applying any change.</p></Card><Card className="raise fcard"><h3>Applications and Today</h3><p>Track application stages, tasks, interviews, assessments, deadlines, offers and submitted documents. See what needs attention today.</p></Card><Card className="raise fcard"><h3>Interview practice</h3><p>Organize questions and tags, practice with spaced repetition, and review your activity.</p></Card><Card className="raise fcard"><h3>Notes and Lessons</h3><p>Capture searchable, pinned, colored notes and checklists, and reflect on lessons from interviews and working life.</p></Card><Card className="raise fcard"><h3>Jobs and Resources</h3><p>Explore the job feed and curated job-search resources. Save useful websites in your Toolbox.</p></Card><Card className="raise fcard"><h3>Autosave and backups</h3><p>See save progress, export a workspace backup, and restore saved data from Settings.</p></Card><Card className="raise fcard"><h3>Your workspace</h3><p>Keep account content separate, switch between light and dark themes, and use the workspace on mobile or with a keyboard.</p></Card>
</div>
</section>
<section id="analytics" className="wrap band">
<div className="two">
<div>
<h2 className="h2">See what&apos;s in your workspace</h2>
<p className="mut">Analytics turns your saved data into charts, with tables for the exact counts.</p>
<div className="mini">
<Card className="raise m fcard"><h3>Content mix</h3><p>Compare source entries, Profile copies and visible Resume entries.</p></Card>
<Card className="raise m fcard"><h3>Resumes by Profile</h3><p>See how your saved Resumes are organized, including Unfiled.</p></Card>
<Card className="raise m fcard"><h3>Document languages</h3><p>The selected language for each saved Resume.</p></Card>
<Card className="raise m fcard"><h3>Template usage</h3><p>Compare the document templates used in your workspace.</p></Card>
</div>
</div>
<Card className="raise chart">
<h3>Content mix</h3>
<div className="crow"><span>Experience</span><div aria-hidden="true" className="track"><div style={{"width": "46%"}} className="bar"></div></div></div>
<div className="crow"><span>Education</span><div aria-hidden="true" className="track"><div style={{"width": "22%"}} className="bar"></div></div></div>
<div className="crow"><span>Projects</span><div aria-hidden="true" className="track"><div style={{"width": "38%"}} className="bar"></div></div></div>
<div className="crow"><span>Skills</span><div aria-hidden="true" className="track"><div style={{"width": "92%"}} className="bar"></div></div></div>
<div className="crow"><span>Certifications</span><div aria-hidden="true" className="track"><div style={{"width": "58%"}} className="bar"></div></div></div>
<p className="cap">Sample data. Your own charts come with tables for the exact counts.</p>
</Card>
</div>
</section>
<section id="languages" className="wrap band">
<div className="two">
<div>
<h2 className="h2">Made for English and Arabic</h2>
<p className="mut">Write each Resume in the language the job asks for. Careery supports right-to-left layout, so Arabic reads the way it should. Choose a language to preview it.</p>
</div>
<LanguagePreview />

</div>
</section>
<section style={{"paddingBottom": "28px"}} className="wrap">
<div className="raise pri cta">
<div>
<h2 className="h2">Start with one entry</h2>
<p>Add your first role or project. When you&apos;re ready, group your entries into a Profile and build a Resume.</p>
</div>
<div className="acts"><SignUpButton mode="modal" forceRedirectUrl="/career-record"><Button variant="outline" className="btn">Start your Career Record</Button></SignUpButton><SignInButton mode="modal" forceRedirectUrl="/today"><Button variant="secondary" className="btn sec">Sign in</Button></SignInButton></div>
</div>
</section>
</main>
<footer style={{"paddingBottom": "28px"}} className="wrap">
<div className="raise ftr">
<span>© 2026 Careery</span>
<Button variant="outline" render={<a href="#features" />} nativeButton={false} className="btn ctl">Explore features</Button>
</div>
</footer>

</div>;
}
