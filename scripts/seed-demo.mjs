import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const directory = resolve(process.env.CAREERY_DATA_DIR ?? 'data');
await mkdir(directory, { recursive: true });
const bilingual = (en, ar) => ar ? { en, ar } : { en };
const basics = { name: bilingual('Samir Nour (fictional demo)', 'سمير نور (بيانات تجريبية)'), title: bilingual('Software engineer', 'مهندس برمجيات'), location: bilingual('Cairo, Egypt', 'القاهرة، مصر'), email: 'samir.demo@example.com', phone: '', links: [{ label: 'Portfolio (demo)', url: 'https://example.com/portfolio' }, { label: 'GitHub (demo)', url: 'https://example.com/code' }] };
async function read(name, fallback) {
  try { return JSON.parse(await readFile(join(directory, name), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
async function save(name, value) {
  const temporary = join(directory, `${name}.seed-${process.pid}.tmp`);
  await writeFile(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
  await rename(temporary, join(directory, name));
}
const record = await read('career-record.json', { version: 1, basics, entries: [] });
const workspace = await read('workspace.json', { version: 1, profiles: [], resumes: [], lastLanguage: 'en' });
if (record.version !== 1 || workspace.version !== 1 || !Array.isArray(record.entries) || !Array.isArray(workspace.profiles) || !Array.isArray(workspace.resumes)) throw new Error('Unsupported data; no files changed.');
if (!record.basics.name.en && !record.basics.email && !record.basics.phone && !record.basics.links.length && !record.basics.title.en && !record.basics.location.en) record.basics = structuredClone(basics);
const entries = [];
const roles = [
  ['Frontend engineer', 'مهندس واجهات', 'Cedar Labs', 'مختبرات سيدار'], ['Full-stack developer', 'مطور متكامل', 'Atlas Studio', 'استوديو أطلس'],
  ['Backend engineer', 'مهندس أنظمة خلفية', 'Harbor Systems', 'أنظمة هاربر'], ['Data analyst', 'محلل بيانات', 'Orion Analytics', 'أوريون للتحليلات'],
  ['QA engineer', 'مهندس ضمان الجودة', 'Juniper Software', 'جونيبر للبرمجيات'], ['Technical support specialist', 'أخصائي دعم فني', 'Clearpath Services', 'خدمات كليرباث'],
  ['DevOps engineer', 'مهندس تشغيل وتطوير', 'Northstar Cloud', 'نورث ستار السحابية'], ['Product designer', 'مصمم منتجات', 'Mosaic Digital', 'موزاييك الرقمية'],
  ['Web developer', 'مطور ويب', 'Willow Creative', 'ويلو الإبداعية'], ['Engineering mentor', 'مرشد هندسي', 'Open Learning Collective', 'مجتمع التعلم المفتوح'],
  ['Research assistant', 'مساعد باحث', 'Demo Computing Lab', 'مختبر الحوسبة التجريبي'], ['Freelance developer', 'مطور مستقل', 'Independent demo projects', 'مشروعات تجريبية مستقلة'],
];
for (const [index, [title, arTitle, employer, arEmployer]] of roles.entries()) entries.push({ id: `demo-experience-${index+1}`, kind: 'experience', employer: bilingual(`${employer} (fictional)`, `${arEmployer} (تجريبي)`), title: bilingual(title, arTitle), dates: { start: `${2012+index}-01`, end: `${2012+index}-12` }, bullets: [
  { id: `demo-exp-${index+1}-a`, text: bilingual(`Delivered accessible, maintainable solutions as a ${title.toLowerCase()} in a fictional cross-functional team.`, 'تطوير حلول سهلة الوصول وقابلة للصيانة ضمن فريق متعدد التخصصات.') },
  { id: `demo-exp-${index+1}-b`, text: bilingual('Documented decisions and improved handoffs between design, engineering, and operations.', index % 4 ? 'توثيق القرارات وتحسين التعاون بين فرق التصميم والهندسة والتشغيل.' : undefined) },
  { id: `demo-exp-${index+1}-c`, text: bilingual('Built repeatable checks and supported colleagues through reviews and mentoring.', 'بناء إجراءات تحقق متكررة ودعم الزملاء بالمراجعة والإرشاد.') },
] });
for (const [index, [qualification, ar]] of [['BSc Computer Science', 'بكالوريوس علوم الحاسب'], ['Software Architecture Diploma', 'دبلوم هندسة البرمجيات'], ['Data Analysis Certificate Program', 'برنامج تحليل البيانات'], ['Human-Computer Interaction Course', 'دورة تفاعل الإنسان والحاسوب'], ['Cloud Systems Program', 'برنامج الأنظمة السحابية'], ['Technical Writing Workshop', 'ورشة الكتابة التقنية']].entries()) entries.push({ id: `demo-education-${index+1}`, kind: 'education', institution: bilingual(`Fictional Learning Institute ${index+1}`, `معهد التعلم التجريبي ${index+1}`), qualification: bilingual(qualification, ar), dates: { start: `${2010+index}-09`, end: `${2011+index}-06` }, bullets: [{ id: `demo-edu-${index+1}-a`, text: bilingual('Completed practical coursework and a collaborative capstone project.', 'إكمال دراسة تطبيقية ومشروع تخرج تعاوني.') }] });
const projects = [['Accessible component library','مكتبة مكونات سهلة الوصول'],['Career workspace','مساحة عمل مهنية'],['Inventory dashboard','لوحة متابعة المخزون'],['Support knowledge base','قاعدة معرفة الدعم'],['Event registration portal','بوابة تسجيل الفعاليات'],['Personal finance planner','مخطط مالي شخصي'],['Learning progress tracker','متتبع التعلم'],['API monitoring console','لوحة مراقبة الواجهات'],['Research data explorer','مستكشف بيانات البحث'],['Deployment toolkit','أدوات النشر'],['Customer feedback hub','مركز ملاحظات العملاء'],['Mobile reading experience','تطبيق قراءة محمول'],['Testing starter kit','حزمة بدء الاختبارات'],['Design token playground','مساحة رموز التصميم'],['Bilingual documentation site','موقع توثيق ثنائي اللغة'],['Volunteer coordination tool','أداة تنسيق المتطوعين'],['Search relevance experiment','تجربة تحسين البحث'],['Performance audit toolkit','أدوات تدقيق الأداء']];
for (const [index, [name, ar]] of projects.entries()) entries.push({ id: `demo-project-${index+1}`, kind: 'projects', name: bilingual(name, ar), description: bilingual(`A fictional ${name.toLowerCase()} built to demonstrate product thinking, clear interfaces, and maintainable implementation.`, index % 5 ? 'مشروع تجريبي يعرض التفكير في المنتج ووضوح الواجهات وسهولة الصيانة.' : undefined), url: `https://example.com/projects/${index+1}`, bullets: [{ id: `demo-project-${index+1}-a`, text: bilingual('Designed the core user flow, implemented the working slice, and verified behavior with real-browser tests.', 'تصميم تجربة الاستخدام وتنفيذها والتحقق من السلوك باختبارات المتصفح.') }, { id: `demo-project-${index+1}-b`, text: bilingual('Recorded assumptions and trade-offs so future contributors could extend the project safely.', 'توثيق الافتراضات والمفاضلات لتسهيل تطوير المشروع مستقبلاً.') }] });
const skills = ['TypeScript','JavaScript','React','Next.js','HTML','CSS','Accessibility','Node.js','Python','SQL','PostgreSQL','REST APIs','Git','Linux','Docker','CI/CD','Playwright','Vitest','Test planning','Incident response','Technical writing','Customer support','Data visualization','Spreadsheet analysis','Figma','Interaction design','User research','Performance profiling','Cloud operations','Automation','Arabic communication','English communication'];
for (const [index, name] of skills.entries()) entries.push({ id: `demo-skill-${index+1}`, kind: 'skills', name: bilingual(name, index % 6 ? name : undefined), category: bilingual(['Engineering','Quality','Operations','Communication'][index%4], ['الهندسة','الجودة','التشغيل','التواصل'][index%4]) });
for (const [index, [name, ar]] of [['Web Accessibility Foundations','أساسيات إتاحة الويب'],['Cloud Fundamentals','أساسيات الحوسبة السحابية'],['Advanced TypeScript Workshop','ورشة تايب سكريبت المتقدمة'],['SQL for Analysis','تحليل البيانات باستخدام إس كيو إل'],['Technical Support Essentials','أساسيات الدعم الفني'],['Software Testing Practice','ممارسات اختبار البرمجيات'],['Secure Web Development','تطوير الويب الآمن'],['User Research Methods','أساليب بحث المستخدم'],['Product Design Foundations','أساسيات تصميم المنتجات'],['Linux Administration','إدارة لينكس'],['Performance Engineering','هندسة الأداء'],['Technical Communication','التواصل التقني']].entries()) entries.push({ id: `demo-certification-${index+1}`, kind: 'certifications', name: bilingual(`${name} (demo)`, index%5 ? `${ar} (تجريبي)` : undefined), issuer: bilingual('Fictional Skills Academy', 'أكاديمية المهارات التجريبية'), date: `${2020+index%6}-06`, url: `https://example.com/certificates/${index+1}` });
const existingEntryIds = new Set(record.entries.map(entry => entry.id));
for (const entry of entries) if (!existingEntryIds.has(entry.id)) record.entries.push(entry);
const tracks = ['Frontend engineering','Full-stack development','Backend engineering','Data analysis','Quality assurance','Technical support','Cloud and DevOps','Product design'];
for (const [index, track] of tracks.entries()) {
  const id = `demo-profile-${index+1}`;
  if (workspace.profiles.some(profile => profile.id === id)) continue;
  workspace.profiles.push({ id, name: `${track} (demo)`, basics: structuredClone(basics), entries: structuredClone(entries.filter((entry, entryIndex) => entryIndex % 8 === index || entry.kind === 'skills' && entryIndex % 4 === index % 4)), headline: bilingual(track, 'مسار مهني تجريبي'), summary: bilingual(`Fictional professional focused on ${track.toLowerCase()}, clear communication, and practical results. This content is sample data for exploring Careery.`, 'ملف مهني تجريبي يركز على التواصل الواضح والنتائج العملية. هذه بيانات توضيحية لاستكشاف التطبيق.') });
}
const sections = ['summary','skills','experience','education','projects','certifications'];
for (let index=0; index<54; index++) {
  const id = `demo-resume-${index+1}`;
  if (workspace.resumes.some(resume => resume.id === id)) continue;
  const profile = workspace.profiles.find(profile => profile.id === `demo-profile-${index%8+1}`);
  workspace.resumes.push({ id, name: `${['Specialist','Senior','Associate','Lead','Consultant','Generalist'][Math.floor(index/8)%6]} ${tracks[index%8]} ${index+1} (demo)`, profileId: index<48 ? profile.id : null, language: index%3 === 0 ? 'ar' : 'en', basics: structuredClone(profile.basics), entries: structuredClone(profile.entries.slice(0, index%4+5)), headline: structuredClone(profile.headline), summary: structuredClone(profile.summary), hiddenEntryIds: [], sectionOrder: [...sections] });
}
await save('career-record.json', record);
await save('workspace.json', workspace);
console.log(`Demo data ready: ${record.entries.length} career entries, ${workspace.profiles.length} Profiles, ${workspace.resumes.length} Resumes. Existing IDs were preserved.`);
