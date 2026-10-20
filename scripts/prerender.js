import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const distSsrDir = path.join(rootDir, 'dist-ssr');
const htmlPath = path.join(distDir, 'index.html');

async function prerender() {
  console.log('[Prerender] 1. Construindo bundle SSR com Vite...');
  execSync('npx vite build --ssr src/App.tsx --outDir dist-ssr', {
    cwd: rootDir,
    stdio: 'inherit',
  });

  console.log('[Prerender] 2. Carregando componente App...');
  const appModulePath = path.join(distSsrDir, 'App.js');
  const mod = await import(`file://${appModulePath.replace(/\\/g, '/')}`);
  const App = mod.default;

  console.log('[Prerender] 3. Renderizando árvore React para HTML semântico...');
  const appHtml = ReactDOMServer.renderToString(React.createElement(App));
  console.log(`[Prerender] HTML gerado: ${(appHtml.length / 1024).toFixed(1)} KB`);

  console.log('[Prerender] 4. Injetando HTML dentro de <div id="root">...');
  let html = fs.readFileSync(htmlPath, 'utf-8');
  if (!html.includes('<div id="root"></div>')) {
    throw new Error('Marcador <div id="root"></div> não encontrado em dist/index.html');
  }

  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  fs.writeFileSync(htmlPath, html, 'utf-8');

  console.log('[Prerender] 5. Limpando artefatos temporários de dist-ssr...');
  fs.rmSync(distSsrDir, { recursive: true, force: true });

  console.log('[Prerender] ✓ Sucesso: dist/index.html pré-renderizado estaticamente com sucesso!');
}

prerender().catch((err) => {
  console.error('[Prerender] Erro durante a pré-renderização:', err);
  process.exit(1);
});
