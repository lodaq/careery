export type InterviewQuestion = { id: string; question: string; answer: string };

const starters = [
  ['Tell me about yourself.', 'Give a brief career-focused introduction: your current work or training, the experience most relevant to this role, and what you want to do next. Connect one concrete achievement to the job requirements. Aim for about one to two minutes.'],
  ['Why do you want this job?', 'Name the responsibilities that interest you, explain how your experience prepares you for them, and describe the contribution you hope to make. Use details from the job description rather than general enthusiasm.'],
  ['Why do you want to work here?', 'Choose something specific about the organization’s work, product, or mission that you have researched. Explain why it matters to you and how your skills could support it.'],
  ['What are your strengths?', 'Choose one or two strengths relevant to the position. For each, describe a real situation where you used it and the result. Focus on evidence rather than a list of adjectives.'],
  ['What is a weakness you are working on?', 'Share a real area for improvement. Explain what you have changed, how you practice, and what progress you have seen. Avoid presenting a strength as a weakness or claiming the issue is completely solved.'],
  ['Why should we hire you?', 'Connect the role’s main needs to two or three relevant skills or experiences. Back them with a concrete example and explain the value you could bring without comparing yourself to candidates you do not know.'],
  ['Tell me about a challenge you overcame.', 'Use STAR: briefly explain the Situation and Task, spend most of the answer on the Actions you personally took, then describe the Result and what you learned. Choose a relevant example with a clear outcome.'],
  ['Tell me about a time you worked in a team.', 'Describe the shared goal, your responsibility, and how you coordinated with others. Include how you communicated or handled differing ideas, then explain the team’s result and your contribution.'],
  ['How do you handle conflict at work?', 'Use a real example. Explain how you listened, clarified the disagreement, and worked toward a shared goal. Describe your actions respectfully and finish with the outcome or lesson.'],
  ['Tell me about a mistake or failure.', 'Choose a genuine example, take responsibility, and explain how you addressed the consequences. Describe the change you made to prevent a repeat and what you learned. Do not blame others.'],
  ['How do you handle stress and pressure?', 'Explain your practical approach: clarify priorities, break work into steps, and communicate risks early. Add a real example of a demanding situation and how your approach helped.'],
  ['How do you prioritize competing deadlines?', 'Explain how you assess urgency, impact, and dependencies, agree on priorities, and track progress. Give an example of a tradeoff you communicated and how you adjusted when plans changed.'],
  ['What is your greatest professional achievement?', 'Choose an achievement relevant to this role. Explain the starting problem, your specific contribution, and the outcome. Use an accurate measure when available; never invent numbers.'],
  ['Why are you leaving your current job?', 'Be honest, brief, and forward-looking. Explain what you are seeking in your next role, such as different responsibilities or growth. If discussing a difficult departure, stay factual and respectful.'],
  ['Where do you see yourself in five years?', 'Describe skills, responsibilities, or impact you want to develop. Connect that direction to the opportunity while acknowledging that you expect to learn and refine your goals.'],
  ['What motivates you?', 'Identify the work or conditions that help you do your best, such as solving problems, helping people, or mastering a skill. Give a specific example and connect it to this role.'],
  ['What are your salary expectations?', 'Research the role, location, and level before the interview. Give a considered range if you are ready, explain the basis, and clarify that the overall responsibilities and compensation package matter. You can also ask for the budgeted range.'],
  ['Do you have any questions for us?', 'Prepare questions that help you evaluate the opportunity: What would success look like in the first few months? What challenges is the team working on? How is feedback shared? What are the next steps? Choose questions not already answered.'],
] as const;

export const starterQuestions = (): InterviewQuestion[] => starters.map(([question, answer], index) => ({ id: `starter-${index + 1}`, question, answer }));
