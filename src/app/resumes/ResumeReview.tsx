'use client';
import { useState } from 'react';
import { SparklesIcon, CheckIcon, AlertCircleIcon, RotateCwIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FieldLabel } from '@/components/ui/field';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import type { Resume } from '../../lib/types';
import { type AiReview } from './ai-review';
import { resolveResume } from '../../lib/resolver';

export function ResumeReview({ resume, onSelect, review, stale, onRun, onApplySummary, onApplyFinding, appliedFindings }: {
  resume: Resume; onSelect: (section: string) => void; review: AiReview | null; stale: boolean;
  onApplyFinding: (index: number, changeIndex?: number) => Promise<void>; appliedFindings: string[];
  onRun: (targetRole: string) => Promise<void>; onApplySummary: (text: string) => void;
}) {
  const [targetRole, setTargetRole] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const [findingError, setFindingError] = useState<{ index: number; message: string } | null>(null);
  function applyButton(index: number, changeIndex?: number) {
    const applied = appliedFindings.includes(`${index}:${changeIndex ?? 0}`);
    return <Button type="button" variant="outline" disabled={stale || busy || applying !== null || applied} onClick={async () => {
      setApplying(`${index}:${changeIndex ?? 0}`); setFindingError(null);
      try { await onApplyFinding(index, changeIndex); } catch (error) { setFindingError({ index, message: error instanceof Error ? error.message : 'Could not apply this suggestion. Try again.' }); } finally { setApplying(null); }
    }}>{applied ? <CheckIcon aria-hidden="true" /> : applying === `${index}:${changeIndex ?? 0}` ? <RotateCwIcon aria-hidden="true" className="review-loading" /> : <SparklesIcon aria-hidden="true" />}{applied ? 'Suggestion applied' : applying === `${index}:${changeIndex ?? 0}` ? 'Applying…' : 'Apply suggestion'}</Button>;
  }
  const resolved = resolveResume(resume);
  const checks = [
    { name: 'Personal information', done: Boolean(resolved.name.value.trim()), section: 'basics' },
    { name: 'Contact information', done: Boolean(resume.basics.email || resume.basics.phone), section: 'basics' },
    { name: 'Professional summary', done: Boolean(resolved.summary.value.trim()), section: 'summary' },
    { name: 'Selected experience', done: resume.entries.length > 0, section: 'choose-content' },
    { name: 'Achievements', done: resume.entries.some((entry) => 'bullets' in entry && entry.bullets.length > 0), section: 'experience' },
    { name: 'Language coverage', done: resolved.missingArabicCount === 0, section: 'basics' },
  ];
  const completed = checks.filter((check) => check.done).length;
  return <div className="resume-review ai-review">
    <div className="review-heading"><span className="review-symbol"><SparklesIcon aria-hidden="true" /></span><div><h2>A fresh perspective on your Resume</h2><p>Practical feedback on clarity, evidence, and how your story comes together.</p></div></div>
    <Card className="ai-review-setup"><CardHeader><CardTitle>What are you aiming for?</CardTitle><CardDescription>Give the review a direction, or leave this blank for general feedback.</CardDescription></CardHeader><CardContent>
      <FieldLabel htmlFor="review-target-role">Target role or job description <span className="optional">(optional)</span></FieldLabel>
      <Textarea id="review-target-role" value={targetRole} maxLength={8000} rows={3} placeholder="For example: frontend engineer working on accessible products…" onChange={(event) => { event.stopPropagation(); setTargetRole(event.target.value); }} disabled={busy || applying !== null} />
      <p className="review-data-note">Runs through OpenRouter using your saved Resume wording and target role. Name and contact fields are excluded. Review is optional; nothing is changed automatically.</p>
      {error ? <p role="alert" className="review-error">{error}</p> : null}
    </CardContent><CardFooter><span>{busy ? 'Reading your Resume… This may take a minute.' : 'Your wording stays yours.'}</span><Button type="button" disabled={busy || applying !== null} onClick={async () => {
      setBusy(true); setError(''); setApplied(false);
      try { await onRun(targetRole); } catch (error) { setError(error instanceof Error ? error.message : 'Could not review. Retry.'); } finally { setBusy(false); }
    }}>{busy ? <RotateCwIcon aria-hidden="true" className="review-loading" /> : <SparklesIcon aria-hidden="true" />}{busy ? 'Reviewing…' : review ? 'Review again' : 'Run AI Review'}</Button></CardFooter></Card>
    {review ? <div className="ai-review-result" aria-live="polite">
      {stale ? <p className="review-stale" role="status">Your Resume changed since this review. Run it again for current feedback.</p> : null}
      <div className="ai-score"><div><strong>{review.score}<span>/100</span></strong><span>Writing quality</span></div><p>{review.overview}</p></div>
      <p className="review-data-note">AI feedback is a writing aid, not an ATS score or hiring prediction. Check every suggestion against your experience.</p>
      {review.strengths.length ? <Card className="review-strengths"><CardHeader><CardTitle>Keep what works</CardTitle></CardHeader><CardContent><ul>{review.strengths.map((strength, index) => <li key={index}><CheckIcon aria-hidden="true" /><span>{strength}</span></li>)}</ul></CardContent></Card> : null}
      <div className="review-findings-heading"><h3>Make your next edit count</h3><Badge variant="secondary">{review.findings.length} suggestions</Badge></div>
      <div className="review-findings">{review.findings.map((finding, index) => <Card key={index} className="review-finding"><CardHeader><div className="review-finding-meta"><Badge variant={finding.priority === 'high' ? 'outline' : 'secondary'}>{finding.priority} priority</Badge><span>{finding.section}</span></div><CardTitle>{finding.title}</CardTitle><CardDescription>{finding.detail}</CardDescription></CardHeader><CardContent><p>{finding.suggestion}</p>{finding.edits?.map((edit, changeIndex) => <div className="review-edit-preview" key={edit.field}><p><strong>Current</strong><br />{edit.before}</p><p><strong>Suggested</strong><br />{edit.after}</p>{applyButton(index, changeIndex)}</div>)}{finding.addSkills?.map((skill, skillIndex) => <div className="review-edit-preview" key={skill.name}><p><strong>Suggested skill</strong><br />{skill.name}</p>{applyButton(index, (finding.edits?.length ?? 0) + skillIndex)}</div>)}{findingError?.index === index ? <p role="alert" className="review-error">{findingError.message}</p> : null}</CardContent>{!finding.unavailable && !finding.edits?.length && !finding.addSkills?.length ? <CardFooter>{applyButton(index)}</CardFooter> : null}</Card>)}</div>
      {review.summaryRewrite ? <Card className="review-rewrite"><CardHeader><CardTitle>A possible summary</CardTitle><CardDescription>Compare this with your experience before using it.</CardDescription></CardHeader><CardContent><p dir={resume.language === 'ar' ? 'rtl' : 'ltr'}>{review.summaryRewrite}</p></CardContent><CardFooter><Button type="button" variant="outline" disabled={stale || applied} onClick={() => { onApplySummary(review.summaryRewrite); setApplied(true); }}>{applied ? 'Summary applied' : 'Use this summary'}</Button></CardFooter></Card> : null}
      <p className="review-model">Reviewed with {review.model}</p>
    </div> : <div className="review-empty"><SparklesIcon aria-hidden="true" /><h3>Feedback with a clear next step</h3><p>Get strengths worth keeping and focused suggestions for the sections that need attention.</p></div>}
    <Collapsible className="local-review-checks"><CollapsibleTrigger render={<Button variant="ghost" />}>Resume readiness · Local checks <Badge variant="secondary">{completed}/{checks.length}</Badge></CollapsibleTrigger><CollapsibleContent><Progress value={completed} max={checks.length} aria-label="Completed readiness checks" />{checks.map((check) => <div className="review-check" key={check.name}>{check.done ? <CheckIcon aria-hidden="true" /> : <AlertCircleIcon aria-hidden="true" />}<span>{check.name}</span><Button variant="ghost" type="button" aria-label={`Edit ${check.name}`} onClick={() => onSelect(check.section)}>Edit</Button></div>)}</CollapsibleContent></Collapsible>
  </div>;
}
