import type { Resume } from '@/lib/types';

export const statuses = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'Position Closed'] as const;
export type ApplicationStatus = typeof statuses[number];
export const closedStatuses: readonly ApplicationStatus[] = ['Accepted', 'Rejected', 'Withdrawn', 'Position Closed'];
export const detailFields = {
  jobUrl: 'Job posting URL', description: 'Saved job description', reference: 'Job reference ID',
  location: 'Location', eligibleCountries: 'Eligible countries', timezone: 'Timezone requirements', relocation: 'Relocation', sponsorship: 'Visa sponsorship',
  seniority: 'Seniority', department: 'Department', employmentType: 'Employment type', skills: 'Required skills',
  salaryMin: 'Salary minimum', salaryMax: 'Salary maximum', currency: 'Currency', payPeriod: 'Pay period', bonus: 'Bonus', equity: 'Equity', benefits: 'Benefits', expectedSalary: 'Expected salary',
  interest: 'Why this role', strengths: 'Matching strengths', gaps: 'Skill gaps', concerns: 'Concerns',
  source: 'Source', sourceUrl: 'Source URL', referral: 'Referral', foundDate: 'Date found', deadline: 'Application deadline',
  appliedDate: 'Date applied', submissionMethod: 'Submission method', confirmation: 'Confirmation number', tags: 'Tags', notes: 'Notes',
  coverLetter: 'Submitted cover letter', portfolio: 'Submitted portfolio URL', answers: 'Application answers',
  offerSalary: 'Offer base salary', offerBonus: 'Offer bonus', offerEquity: 'Offer equity', offerBenefits: 'Offer benefits', offerArrangement: 'Offer work arrangement', startDate: 'Start date', offerDeadline: 'Offer response deadline', negotiation: 'Negotiation history',
  outcomeDate: 'Outcome date', outcomeReason: 'Outcome reason / feedback', applyAgain: 'Would apply again',
} as const;
export type DetailKey = keyof typeof detailFields;
export interface ApplicationTask { id: string; title: string; due: string; completedAt?: string }
export interface ApplicationEvent { id: string; kind: 'status' | 'note' | 'email' | 'call' | 'message' | 'response'; text: string; at: string; status?: ApplicationStatus }
export interface Interview { id: string; kind: 'Interview' | 'Assessment'; state?: 'Scheduled' | 'Completed' | 'Cancelled'; title: string; at: string; timezone: string; duration: string; interviewers: string; location: string; deadline: string; preparation: string; questions: string; feedback: string; result: string }
export interface Contact { id: string; name: string; role: string; email: string; linkedin: string; phone: string; relationship: string }
export interface ApplicationDocument { id: string; name: string; createdAt: string; resume?: Resume; content?: string; size?: number }
export interface JobApplication {
  id: string; revision: number; company: string; role: string; status: ApplicationStatus;
  priority: 'Low' | 'Medium' | 'High'; arrangement: '' | 'Remote' | 'Hybrid' | 'On-site'; archived: boolean;
  createdAt: string; updatedAt: string; details: Partial<Record<DetailKey, string>>;
  tasks: ApplicationTask[]; events: ApplicationEvent[]; interviews: Interview[]; contacts: Contact[]; documents: ApplicationDocument[];
}
export interface ApplicationStore { version: 1; applications: JobApplication[] }
export type ApplicationSummary = Omit<JobApplication, 'documents'>;
export const nextTask = (app: ApplicationSummary) => app.tasks.filter((task) => !task.completedAt).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))[0];
export const cairoDate = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export const lastContact = (app: ApplicationSummary) => app.events.filter((event) => ['email', 'call', 'message', 'response'].includes(event.kind)).map((event) => event.at).sort().at(-1);
