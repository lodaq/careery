import { printPdf } from '@/lib/pdf';

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const pdf = await printPdf(new URL('/', url.origin).href);
    return new Response(new Uint8Array(pdf), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="careery-smoke.pdf"', 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'PDF preparation failed or another export is running. Please try again.' }, { status: 503 });
  }
}
