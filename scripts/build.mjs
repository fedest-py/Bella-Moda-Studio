import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, 'dist');
const url = new URL(process.env.SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4173');
if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
  throw new Error('SITE_URL must be an origin, e.g. https://your-domain.com, without a path, query, or credentials.');
}
if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('Production SITE_URL must use HTTPS.');
if (process.env.CF_PAGES && ['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('A production build needs SITE_URL or CF_PAGES_URL.');
await rm(output, {recursive:true, force:true});
await mkdir(output, {recursive:true});
await cp(resolve(root, 'web'), output, {recursive:true});
const html = (await readFile(resolve(output, 'index.html'), 'utf8')).replaceAll('{{SITE_URL}}', url.origin);
await writeFile(resolve(output, 'index.html'), html);
await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${url.origin}/sitemap.xml\n`);
await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url.origin}/</loc></url></urlset>\n`);
console.log(`Built dist/ for ${url.origin}; Pages Functions remain in functions/.`);
