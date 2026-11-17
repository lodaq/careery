import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { LandingPage } from '@/components/LandingPage';
import './landing.css';

async function Home() {
  await connection();
  const { userId } = await auth();
  if (userId || process.env.CAREERY_LOCAL_USER) redirect('/today');
  return <LandingPage />;
}

export default function Page() {
  return <Suspense fallback={<p role="status">Loading Careery…</p>}><Home /></Suspense>;
}
