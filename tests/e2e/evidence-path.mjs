import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const evidenceDirectory = process.env.GUMMY_EVIDENCE_DIR || 'artifacts/generated-evidence';

await mkdir(evidenceDirectory, { recursive: true });

export function evidencePath(fileName) {
  return join(evidenceDirectory, fileName);
}
