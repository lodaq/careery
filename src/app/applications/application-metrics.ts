import { cairoDate, closedStatuses } from './application-types';
import type { ApplicationSummary } from './application-types';
const day = (value: string) => value.length > 10 ? cairoDate(new Date(value)) : value;
const days = (from: string, to: string) => Math.max(0, (Date.parse(day(to)) - Date.parse(day(from))) / 86_400_000);
const median = (values: number[]) => { const sorted = values.sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length ? (sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2) : null; };
export function analyzeApplications(applications: ApplicationSummary[], now = new Date()) {
  const today = cairoDate(now);
  const submitted = applications.filter((app) => app.details.appliedDate && app.details.appliedDate <= today);
  const interview = (app: ApplicationSummary) => app.events.some((event) => ['Interviewing', 'Offer', 'Accepted'].includes(event.status || '')) || app.interviews.some((item) => item.kind === 'Interview' && item.state !== 'Cancelled') || ['Interviewing', 'Offer', 'Accepted'].includes(app.status);
  const offer = (app: ApplicationSummary) => ['Offer', 'Accepted'].includes(app.status) || app.events.some((event) => event.status === 'Offer' || event.status === 'Accepted');
  const response = (app: ApplicationSummary) => app.events.filter((event) => event.kind === 'response' && day(event.at) >= (app.details.appliedDate ?? '') && event.at <= now.toISOString()).sort((a, b) => a.at.localeCompare(b.at))[0];
  const responded = submitted.filter((app) => response(app));
  const active = applications.filter((app) => !app.archived && !closedStatuses.includes(app.status));
  const openTasks = active.flatMap((app) => app.tasks.filter((task) => !task.completedAt));
  const sources = [...new Set(submitted.map((app) => app.details.source || 'Unspecified'))].sort().map((label) => { const group = submitted.filter((app) => (app.details.source || 'Unspecified') === label); return { label, submitted: group.length, responses: group.filter(response).length, interviews: group.filter(interview).length, offers: group.filter(offer).length }; });
  const months = Array.from({ length: 6 }, (_, index) => { const date = new Date(`${today.slice(0, 7)}-01T12:00:00Z`); date.setUTCMonth(date.getUTCMonth() - 5 + index); const month = date.toISOString().slice(0, 7); return { label: month, count: submitted.filter((app) => app.details.appliedDate?.startsWith(month)).length }; });
  const stages = ['Applied', 'Interviewing', 'Offer'].map((status) => { const durations: number[] = []; for (const app of submitted) { const events = app.events.filter((event) => event.kind === 'status').sort((a, b) => a.at.localeCompare(b.at)); events.forEach((event, index) => { if (event.status === status && events[index + 1]) durations.push(days(event.at, events[index + 1].at)); }); } return { label: status, count: durations.length, median: median(durations) }; });
  return { total: applications.length, submitted: submitted.length, active: active.length, archived: applications.filter((app) => app.archived).length,
    responded: responded.length, responseRate: submitted.length ? responded.length / submitted.length : null,
    interviewed: submitted.filter(interview).length, offers: submitted.filter(offer).length, accepted: submitted.filter((app) => app.status === 'Accepted').length,
    overdue: openTasks.filter((task) => task.due && task.due < today).length, openTasks: openTasks.length,
    upcomingInterviews: active.flatMap((app) => app.interviews).filter((item) => item.kind === 'Interview' && (!item.state || item.state === 'Scheduled') && item.at >= now.toISOString()).length,
    medianResponseDays: median(responded.map((app) => days(app.details.appliedDate!, response(app)!.at))),
    medianOutcomeDays: median(submitted.filter((app) => closedStatuses.includes(app.status) && app.details.outcomeDate && app.details.outcomeDate >= app.details.appliedDate!).map((app) => days(app.details.appliedDate!, app.details.outcomeDate!))),
    sources, months, stages, unanswered: submitted.filter((app) => !app.archived && !closedStatuses.includes(app.status) && !response(app) && days(app.details.appliedDate!, today) >= 14),
  };
}
