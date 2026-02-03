import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const serverEntryPath = path.resolve(root, 'dist/server/entry-server.js');
const { prerenderRoutes, postMeta } = await import(pathToFileURL(serverEntryPath).href);

const siteUrl = 'https://nimishbuilds.xyz';
const postLastmod = new Map();

for (const post of postMeta) {
  const postDate = new Date(post.date);
  const iso = Number.isNaN(postDate.getTime())
    ? undefined
    : postDate.toISOString();
  postLastmod.set(`/blog/${post.slug}`, iso);
}

const urlsXml = prerenderRoutes
  .map(route => {
    const loc = `${siteUrl}${route === '/' ? '' : route}`;
    const lastmod = postLastmod.get(route);
    return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>\n`;

const outputPath = path.resolve(root, 'dist/sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf-8');

console.log(`Generated sitemap with ${prerenderRoutes.length} URLs.`);
