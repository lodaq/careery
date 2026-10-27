'use client';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
export default function ConfirmationDialog({ message, finish }: { message: string; finish: (confirmed: boolean) => void }) {
  return <AlertDialog open onOpenChange={(open) => { if(!open) finish(false); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Confirm removal</AlertDialogTitle><AlertDialogDescription>{message}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction type="button" variant="destructive" onClick={() => finish(true)}>Remove</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
