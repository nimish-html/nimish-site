import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const siteUrl = 'https://nimishbuilds.xyz';
const keyPath = path.resolve(root, 'public/indexnow.txt');

if (!fs.existsSync(keyPath)) {
  throw new Error('indexnow.txt not found in public/.');
}

const key = fs.readFileSync(keyPath, 'utf-8').trim();

let urls = [];
const sitemapPath = path.resolve(root, 'dist/sitemap.xml');

if (fs.existsSync(sitemapPath)) {
  const xml = fs.readFileSync(sitemapPath, 'utf-8');
  urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map(match => match[1]);
}

if (urls.length === 0) {
  const serverEntryPath = path.resolve(root, 'dist/server/entry-server.js');
  const { prerenderRoutes } = await import(pathToFileURL(serverEntryPath).href);
  urls = prerenderRoutes.map(route => `${siteUrl}${route === '/' ? '' : route}`);
}

const payload = {
  host: new URL(siteUrl).hostname,
  key,
  keyLocation: `${siteUrl}/indexnow.txt`,
  urlList: urls,
};

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const responseText = await response.text();

if (!response.ok) {
  console.error(`IndexNow failed: ${response.status} ${response.statusText}`);
  console.error(responseText);
  process.exit(1);
}

console.log(`IndexNow submitted ${urls.length} URLs.`);
console.log(responseText || 'Success');
