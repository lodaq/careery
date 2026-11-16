import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  ...(process.env.CAREERY_SITE_URL ? { metadataBase: new URL(process.env.CAREERY_SITE_URL) } : {}),
  title: { default: 'Careery | Home', template: 'Careery | %s' },
  description: 'Build English and Arabic resumes, organize your career experience, track applications and prepare for interviews with Careery.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Browser extensions can add body attributes before React hydrates.
  return <html lang="en" suppressHydrationWarning><body suppressHydrationWarning><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.classList.toggle('dark',localStorage.getItem('careery-theme')==='dark')}catch{document.documentElement.classList.remove('dark')}" }} /><ClerkProvider>{children}</ClerkProvider></body></html>;
}
