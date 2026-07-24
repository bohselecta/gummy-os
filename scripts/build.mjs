import { cp, mkdir, rm } from 'node:fs/promises';

await rm('build', { recursive: true, force: true });
await mkdir('build', { recursive: true });
await cp('index.html', 'build/index.html');
await cp('src', 'build/src', { recursive: true });
await cp('schemas', 'build/schemas', { recursive: true });
console.log('Built Gummy into ./build');
