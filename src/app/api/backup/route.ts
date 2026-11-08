import { connection } from 'next/server';
import { createBackup, restoreBackup } from '@/app/settings/backup';

const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  try {
    const requested = new URL(request.url);
    const host = request.headers.get('host') || requested.host;
    const local = new URL(`${requested.protocol}//${host}`);
    return Boolean(origin && new URL(origin).origin === local.origin && ['localhost', '127.0.0.1', '[::1]'].includes(local.hostname));
  } catch { return false; }
};

export async function GET() {
  await connection();
  const backup = await createBackup();
  return new Response(JSON.stringify(backup, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="careery-backup-${backup.exportedAt.slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request) || !request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'Restore from Careery Settings on this machine.' }, { status: 403 });
  }
  if (Number(request.headers.get('content-length') ?? 0) > 25_000_000) {
    return Response.json({ error: 'That backup is too large.' }, { status: 413 });
  }
  const text = await request.text();
  if (text.length > 25_000_000) return Response.json({ error: 'That backup is too large.' }, { status: 413 });
  let bundle: unknown;
  try { bundle = JSON.parse(text); }
  catch { return Response.json({ error: 'That file is not valid JSON.' }, { status: 400 }); }
  try {
    const result = await restoreBackup(bundle);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const message = error instanceof Error && (error.message.startsWith('That file') || error.message.startsWith('The backup'))
      ? error.message
      : 'This backup could not be validated. Your current data was not changed.';
    return Response.json({ error: message }, { status: 400 });
  }
}
