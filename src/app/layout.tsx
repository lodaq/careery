import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Careery — Your career, ready for what’s next',
  description: 'A personal workspace for your career and resumes.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
