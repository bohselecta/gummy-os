import { cp, mkdir, rm } from 'node:fs/promises';

await rm('build', { recursive: true, force: true });
await mkdir('build', { recursive: true });
await mkdir('build/licenses', { recursive: true });
await mkdir('build/node_modules/@fontsource-variable/inter/files', { recursive: true });
await cp('index.html', 'build/index.html');
await cp('src', 'build/src', { recursive: true });
await cp('schemas', 'build/schemas', { recursive: true });
await cp(
  'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  'build/node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
);
await cp('node_modules/@fontsource-variable/inter/LICENSE', 'build/licenses/Inter-OFL-1.1.txt');
console.log('Built Gummy into ./build');
