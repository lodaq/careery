'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const subscribe = () => () => undefined;
const clientSnapshot = () => document.getElementById('workspace-page-heading');
const serverSnapshot = () => null;

export function PageHeading({ children }: { children: ReactNode }) {
  const header = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return header ? createPortal(children, header) : children;
}
