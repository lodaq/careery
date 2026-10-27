'use server';
import { revalidatePath } from 'next/cache';
import { changeQuestion, changeTag, readQuestions } from './question-data';
import { previewQuestion, reviewQuestion, undoReview, type ReviewInput } from './practice-data';
export async function loadLibraryAction() { return readQuestions(); }
export async function changeQuestionAction(form: FormData) {
  const result = await changeQuestion(form);
  if (result.library) revalidatePath('/interview-questions');
  return result;
}
export async function changeTagAction(form: FormData) {
  const result = await changeTag(form);
  if (result.library) revalidatePath('/interview-questions');
  return result;
}
export async function previewQuestionAction(id: string) { return previewQuestion(id); }
export async function reviewQuestionAction(input: ReviewInput) {
  const result = await reviewQuestion(input);
  if (result.library) revalidatePath('/interview-questions');
  return result;
}
export async function undoReviewAction(id: string, sessionId: string) {
  const result = await undoReview(id, sessionId);
  if (result.library) revalidatePath('/interview-questions');
  return result;
}
