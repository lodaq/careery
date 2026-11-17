import type { NextRequest, NextFetchEvent } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

const middleware = clerkMiddleware();
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const protocol = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
  // Clerk's secure handshake cookies cannot be stored on plain-HTTP LAN hosts.
  if (protocol !== 'https' && !['localhost', '127.0.0.1', '[::1]'].includes(request.nextUrl.hostname)) {
    return new Response('Careery sign-in requires HTTPS on this address. Use an HTTPS preview, or open http://localhost on the server machine.', { status: 400, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return middleware(request, event);
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|icon.svg|apple-icon.png|icon-192.png|icon-512.png|manifest.webmanifest|manifest.json|robots.txt|sitemap.xml).*)', '/(api|trpc)(.*)'],
};
