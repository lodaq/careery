import { createHash } from 'node:crypto';
import type { CareerRecord } from '../../lib/types';
export { parseRecord } from './form-data';

export function recordRevision(record: CareerRecord): string {
  return createHash('sha256').update(JSON.stringify(record)).digest('hex');
}
