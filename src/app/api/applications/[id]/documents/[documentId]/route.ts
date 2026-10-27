import { readApplications } from '@/app/applications/application-data';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; documentId: string }> }) {
  const { id, documentId } = await params; const document = (await readApplications()).applications.find((app) => app.id === id)?.documents.find((item) => item.id === documentId);
  if (!document) return new Response('Document not found', { status: 404 });
  const filename = `${document.name}${document.resume ? '.json' : ''}`.replace(/[\r\n"\\/]/g, '_');
  return new Response(document.resume ? JSON.stringify(document.resume, null, 2) : Buffer.from(document.content || '', 'base64'), { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="document"; filename*=UTF-8''${encodeURIComponent(filename)}`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' } });
}
