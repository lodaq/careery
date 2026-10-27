const statuses = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'Position Closed'];
const sources = ['Company website', 'LinkedIn', 'Referral', 'Job board', 'Recruiter'];
const roles = ['Frontend engineer', 'Full-stack developer', 'Backend engineer', 'Data analyst', 'QA engineer', 'Technical support specialist', 'DevOps engineer', 'Product designer'];
const companies = ['Cedar', 'Atlas', 'Harbor', 'Orion', 'Juniper', 'Clearpath', 'Northstar', 'Mosaic', 'Willow', 'Meridian'];
const sections = ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'];
const bilingual = (en) => ({ en, ar: `بيانات تجريبية: ${en}` });

/** Add deterministic demo IDs only; never refresh or replace existing content. */
export function populateTrackingDemo(record, workspace, store, today) {
  const anchor = new Date(`${today}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || !Number.isFinite(anchor.getTime()) || anchor.toISOString().slice(0, 10) !== today) throw new Error('Invalid CAREERY_DEMO_DATE.');
  const date = (offset) => new Date(anchor.getTime() + offset * 86400000).toISOString().slice(0, 10);
  const at = (offset) => `${date(offset)}T09:00:00.000Z`;
  const careerNames = {
    experience: ['Accessibility consultant', 'Platform engineer', 'Analytics engineer', 'Developer advocate'],
    education: ['Applied statistics', 'Distributed systems', 'Design leadership', 'Arabic technical communication'],
    projects: ['Application tracking workspace', 'Interview preparation notebook', 'Bilingual reporting toolkit', 'Volunteer scheduling service'],
    skills: ['Observability', 'Domain modeling', 'Data quality', 'Mentoring'],
    certifications: ['Inclusive design practice', 'Database reliability', 'Analytics engineering', 'Team facilitation'],
  };
  for (const [kind, names] of Object.entries(careerNames)) for (const [index, name] of names.entries()) {
    const id = `demo-expanded-${kind}-${index + 1}`;
    if (record.entries.some((entry) => entry.id === id)) continue;
    const original = record.entries.find((entry) => entry.kind === kind && entry.id.startsWith('demo-'));
    if (!original) throw new Error(`Missing demo ${kind} source.`);
    const entry = structuredClone(original); entry.id = id;
    if ('bullets' in entry) entry.bullets = entry.bullets.map((bullet, i) => ({ ...bullet, id: `${id}-bullet-${i + 1}` }));
    if (kind === 'experience') { entry.title = bilingual(name); entry.employer = bilingual('Fictional Career Lab'); entry.dates = { start: '2024-01', end: '2025-06' }; }
    else if (kind === 'education') entry.qualification = bilingual(`${name} (demo)`);
    else { entry.name = bilingual(`${name} (demo)`); if (kind === 'skills') entry.category = bilingual('Professional practice'); }
    record.entries.push(entry);
  }
  const templates = ['classic', 'professional', 'centered', 'accent', 'cream', 'ledger'];
  for (let index = 0; index < 20; index++) {
    const id = `demo-resume-${55 + index}`;
    if (workspace.resumes.some((resume) => resume.id === id)) continue;
    const profile = workspace.profiles.find((item) => item.id === `demo-profile-${index % 8 + 1}`);
    if (!profile) throw new Error('Missing demo Profile.');
    const entries = [...profile.entries, ...record.entries.filter((entry) => entry.id.startsWith('demo-expanded-')).filter((_, i) => i % 4 === index % 4)];
    const resume = {
      id, name: `${roles[index % 8]} — ${companies[index % 10]} opportunity ${index + 1} (fictional demo)`,
      profileId: profile.id, language: index % 2 ? 'ar' : 'en', basics: structuredClone(profile.basics),
      entries: structuredClone(index === 19 ? [] : entries), headline: structuredClone(profile.headline), summary: structuredClone(profile.summary),
      hiddenEntryIds: index % 4 === 0 ? [entries[0].id] : [], sectionOrder: index % 5 === 0 ? sections.filter((section) => section !== 'certifications') : [...sections],
      hiddenSections: index % 3 === 0 ? ['projects'] : [], updatedAt: at(-index),
      appearance: { template: templates[index % 6], font: ['sans', 'serif', 'mono'][index % 3], bodySize: 10, nameSize: 24, accent: '#315e55', spacing: 1.4 },
    };
    if (index === 0) { resume.headline = { en: '' }; resume.basics.title = { en: '' }; }
    if (index === 1) { resume.basics.email = ''; resume.basics.phone = ''; resume.basics.links = []; }
    workspace.resumes.push(resume);
  }
  for (let index = 0; index < 50; index++) {
    const id = `demo-application-${index + 1}`;
    if (store.applications.some((app) => app.id === id)) continue;
    const status = statuses[index < 10 ? 0 : index < 22 ? 1 : index < 32 ? 2 : index < 37 ? 3 : index < 40 ? 4 : index < 46 ? 5 : index < 48 ? 6 : 7];
    const applied = -30 - index % 6 * 25;
    const interviewed = index >= 22 && index <= 42 || index === 46;
    const offered = index >= 32 && index <= 40 || index === 46;
    const closed = index >= 37;
    const response = index >= 22 && index <= 45;
    const resume = workspace.resumes.find((item) => item.id === `demo-resume-${55 + index % 20}`);
    const details = {
      jobUrl: `https://example.com/demo/jobs/${index + 1}`, description: `Fictional ${roles[index % 8]} opportunity. Build accessible products, collaborate across teams and document decisions. Sample data only.`, reference: `DEMO-${index + 1}`,
      location: ['Cairo, Egypt', 'Berlin, Germany', 'Remote'][index % 3], eligibleCountries: 'Egypt, Germany, remote-friendly locations (fictional)', timezone: ['Africa/Cairo', 'Europe/Berlin', 'UTC'][index % 3], relocation: index % 2 ? 'Not required' : 'Open to discussion', sponsorship: index % 3 ? 'Not required' : 'Available (fictional)',
      seniority: ['Mid-level', 'Senior', 'Lead'][index % 3], department: 'Product & Engineering', employmentType: index % 4 ? 'Full-time' : 'Contract', skills: 'TypeScript, accessibility, clear communication, testing',
      salaryMin: String(45000 + index * 1000), salaryMax: String(65000 + index * 1000), currency: ['USD', 'EUR', 'EGP'][index % 3], payPeriod: 'Annual', bonus: '10% target (fictional)', equity: 'Subject to offer', benefits: 'Health coverage, learning budget, flexible hours', expectedSalary: String(55000 + index * 1000),
      interest: 'Product ownership and room to grow.', strengths: 'Practical delivery, accessibility and bilingual communication.', gaps: 'Learn the domain and internal tools.', concerns: index % 2 ? 'Confirm timezone overlap.' : 'Clarify growth expectations.',
      source: sources[index % 5], sourceUrl: 'https://example.com/demo/opportunities', referral: index % 5 === 2 ? 'Fictional colleague' : '', foundDate: date(status === 'Saved' ? -2 : applied - 3), deadline: date(5 + index % 7), appliedDate: status === 'Saved' ? '' : date(applied), submissionMethod: 'Company portal', confirmation: status === 'Saved' ? '' : `DEMO-SUBMISSION-${index + 1}`,
      tags: `fictional-demo, ${roles[index % 8]}, ${index % 2 ? 'international' : 'local'}`, notes: 'Fictional example for exploring Careery; not a real application.',
      coverLetter: status === 'Saved' ? '' : 'Fictional submitted cover letter describing relevant skills and interest.', portfolio: 'https://example.com/demo/portfolio', answers: 'Work authorization: demo scenario. Notice period: 30 days.',
      ...(offered ? { offerSalary: String(60000 + index * 1000), offerBonus: '10% annual target', offerEquity: 'Fictional equity grant', offerBenefits: 'Medical coverage and learning budget', offerArrangement: 'Hybrid', startDate: date(45), offerDeadline: date(4), negotiation: 'Asked about learning budget and flexibility; fictional discussion.' } : {}),
      ...(closed ? { outcomeDate: date(applied + 18), outcomeReason: status === 'Accepted' ? 'Accepted a suitable fictional offer.' : status === 'Rejected' ? 'Another candidate was selected (fictional).' : status === 'Withdrawn' ? 'Withdrew because of work arrangement.' : 'Position was closed.', applyAgain: index % 2 ? 'Yes' : 'Maybe' } : {}),
    };
    const events = [{ id: `${id}-saved`, kind: 'status', status: 'Saved', text: 'Saved fictional opportunity', at: at(status === 'Saved' ? -2 : applied - 3) }];
    const addEvent = (kind, text, offset, stage) => events.push({ id: `${id}-event-${events.length}`, kind, text, at: at(offset), ...(stage ? { status: stage } : {}) });
    if (status !== 'Saved') addEvent('status', 'Submitted application', applied, 'Applied');
    if (response) addEvent('response', 'Employer replied (fictional)', applied + 2 + index % 3);
    if (interviewed) addEvent('status', 'Started interviews', applied + 5, 'Interviewing');
    if (offered) addEvent('status', 'Received offer', applied + 10, 'Offer');
    if (closed) addEvent('status', `Outcome: ${status}`, applied + 18, status);
    addEvent('note', 'Reviewed the role and prepared questions (fictional).', status === 'Saved' ? -1 : applied + 1);
    addEvent('email', 'Sent a clarification email (outgoing, fictional).', status === 'Saved' ? -1 : applied + 1);
    const interviews = [];
    const round = (number, kind, state, offset) => ({ id: `${id}-round-${number}`, kind, state, title: `${kind === 'Interview' ? ['Recruiter screen', 'Technical interview', 'Team discussion'][number % 3] : 'Practical exercise'} (demo)`, at: at(offset), timezone: 'Africa/Cairo', duration: '45 minutes', interviewers: 'Fictional hiring team', location: 'https://example.com/demo/meeting', deadline: kind === 'Assessment' ? date(offset + 2) : '', preparation: 'Review the role, prepare examples and confirm the meeting link.', questions: state === 'Completed' ? 'Describe a project and explain a technical trade-off.' : '', feedback: state === 'Completed' ? 'Clear communication and relevant examples (fictional).' : '', result: state === 'Completed' ? 'Completed fictional round.' : '' });
    if (interviewed) interviews.push(round(1, 'Interview', 'Completed', applied + 6));
    if (status === 'Interviewing') interviews.push(round(2, 'Interview', 'Scheduled', 1 + index % 4));
    if (index % 4 === 0) interviews.push(round(3, 'Assessment', closed ? 'Completed' : 'Scheduled', closed ? applied + 7 : 3));
    if (index === 47) interviews.push(round(4, 'Interview', 'Cancelled', 2));
    const content = Buffer.from(`Fictional cover letter for opportunity ${index + 1}.\n`).toString('base64');
    store.applications.push({
      id, revision: 1, company: `${companies[index % 10]} ${Math.floor(index / 10) + 1} (fictional demo)`, role: roles[index % 8], status,
      priority: ['High', 'Medium', 'Low'][index % 3], arrangement: ['Remote', 'Hybrid', 'On-site'][index % 3], archived: [9, 37, 40, 41, 46, 48].includes(index), createdAt: at(status === 'Saved' ? -2 : applied - 3), updatedAt: at(-index % 7), details,
      tasks: [{ id: `${id}-task-1`, title: 'Review job requirements (demo)', due: date(-3), completedAt: at(-2) }, { id: `${id}-task-2`, title: `${status === 'Saved' ? 'Tailor Resume' : 'Follow up with recruiter'} (demo)`, due: date([-1, 0, 3][index % 3]) }, { id: `${id}-task-3`, title: 'Research the team (demo)', due: '' }],
      events: events.sort((a, b) => a.at.localeCompare(b.at)), interviews,
      contacts: [{ id: `${id}-contact`, name: `Demo Recruiter ${index + 1}`, role: 'Talent partner (fictional)', email: `recruiter-${index + 1}@example.com`, phone: '', linkedin: 'https://example.com/demo/contact', relationship: index % 5 === 2 ? 'Referred by fictional colleague' : 'Recruiter' }],
      documents: status === 'Saved' ? [] : [{ id: `${id}-resume`, name: resume.name, createdAt: at(applied), resume: structuredClone(resume) }, { id: `${id}-letter`, name: 'fictional-cover-letter.txt', createdAt: at(applied), content, size: Buffer.from(content, 'base64').length }],
    });
  }
}
