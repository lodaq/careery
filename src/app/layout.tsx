import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Careery — Your career, ready for what’s next',
  description: 'A personal workspace for your career and resumes.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Browser extensions can add body attributes before React hydrates.
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.classList.toggle('dark',localStorage.getItem('careery-theme')==='dark')}catch{document.documentElement.classList.remove('dark')}" }} />{children}</body></html>;
}
