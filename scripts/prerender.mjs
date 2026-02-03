import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const templatePath = path.resolve(root, 'dist/index.html');

if (!fs.existsSync(templatePath)) {
  throw new Error('dist/index.html not found. Run the client build first.');
}

const template = fs.readFileSync(templatePath, 'utf-8');
const sanitizedTemplate = template
  .replace(/<title>.*?<\/title>/i, '')
  .replace(/<meta\s+name="description"[^>]*>/i, '');

const serverEntryPath = path.resolve(root, 'dist/server/entry-server.js');
const { render, prerenderRoutes } = await import(pathToFileURL(serverEntryPath).href);

const writePage = (url, html, headTags) => {
  const pageHtml = sanitizedTemplate
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    .replace('</head>', `${headTags}\n</head>`);

  const filePath =
    url === '/'
      ? path.resolve(root, 'dist/index.html')
      : path.resolve(root, 'dist', url.replace(/^\//, ''), 'index.html');

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, pageHtml, 'utf-8');
};

for (const url of prerenderRoutes) {
  const { html, helmet } = render(url);
  const headTags = [
    helmet?.title?.toString(),
    helmet?.meta?.toString(),
    helmet?.link?.toString(),
    helmet?.script?.toString(),
  ]
    .filter(Boolean)
    .join('\n');

  writePage(url, html, headTags);
}

console.log(`Pre-rendered ${prerenderRoutes.length} routes.`);
