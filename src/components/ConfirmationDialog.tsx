'use client';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import type { ConfirmationOptions } from './ConfirmAction';
export default function ConfirmationDialog({ message, options, finish }: { message: string; options?: ConfirmationOptions; finish: (confirmed: boolean) => void }) {
  return <AlertDialog open onOpenChange={(open) => { if(!open) finish(false); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{options?.title ?? 'Confirm removal'}</AlertDialogTitle><AlertDialogDescription>{message}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" onClick={() => finish(true)}>{options?.action ?? 'Remove'}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
