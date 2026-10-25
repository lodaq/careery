import { readWorkspace } from '../../../../../lib/storage';
import { printPdf } from '../../../../../lib/pdf';
import { resumeRevision } from '../../../../resumes/resume-data';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resume = (await readWorkspace()).resumes.find((item) => item.id === id);
    if (!resume) return Response.json({ error: 'Resume not found.' }, { status: 404 });
    const revision = resumeRevision(resume), requested = new URL(request.url).searchParams.get('revision');
    if (requested && requested !== revision) return Response.json({ error: 'Resume changed. Save and retry.' }, { status: 409 });
    const target = new URL(`/render/${encodeURIComponent(id)}`, request.url); target.searchParams.set('revision', revision);
    const pdf = await printPdf(target.href);
    const pages = [...pdf.toString('latin1').matchAll(/\/Type\s*\/Page\b/g)].length;
    if (!pages) throw new Error('PDF contains no pages.');
    const filename = encodeURIComponent(resume.name).replace(/['()*]/g, (character) => `%${character.charCodeAt(0).toString(16)}`);
    return new Response(new Uint8Array(pdf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="resume.pdf"; filename*=UTF-8''${filename}.pdf`, 'Cache-Control': 'no-store', 'X-Resume-Pages': String(pages) } });
  } catch { return Response.json({ error: 'PDF preparation failed or another export is running. Please retry.' }, { status: 503 }); }
}
