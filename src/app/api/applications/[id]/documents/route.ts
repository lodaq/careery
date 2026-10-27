import { revalidatePath } from 'next/cache';
import { changeApplication } from '@/app/applications/application-data';
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get('origin');
  const expectedOrigin = `${new URL(request.url).protocol}//${request.headers.get('host')}`;
  if (!origin || origin !== expectedOrigin) return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  if (Number(request.headers.get('content-length')) > 6 * 1024 * 1024) return Response.json({ error: 'File is too large.' }, { status: 413 });
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error('No file provided.');
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) { const chunk = await reader.read(); if (chunk.done) break; size += chunk.value.length; if (size > 6 * 1024 * 1024) { await reader.cancel(); return Response.json({ error: 'File is too large.' }, { status: 413 }); } chunks.push(chunk.value); }
    const data = await new Response(Buffer.concat(chunks), { headers: { 'content-type': request.headers.get('content-type') || '' } }).formData();
    const file = data.get('file'); if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !file.size) throw new Error('Choose a file under 5 MB.');
    const { id } = await params; await changeApplication(id, Number(data.get('revision')), 'attachment', { name: file.name, content: Buffer.from(await file.arrayBuffer()).toString('base64') });
    revalidatePath(`/applications/${id}`); return Response.json({ success: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Upload failed.' }, { status: 400 }); }
}
