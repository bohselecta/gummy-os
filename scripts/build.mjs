import { cp } from 'node:fs/promises';
import { build } from 'vite';

await build();
await cp('schemas', 'build/schemas', { recursive: true });
console.log('Built Gummy OS into ./build');
