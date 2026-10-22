import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, 'dist');
// The public business domain is permanent. Cloudflare gives every build a new
// CF_PAGES_URL; using that value made production pages canonicalize to a preview.
const url = new URL('https://bellamodastudionyc.com');
await rm(output, {recursive:true, force:true});
await mkdir(output, {recursive:true});
await cp(resolve(root, 'web'), output, {recursive:true});
for (const page of ['index.html', 'information.html', '404.html']) {
  const html = (await readFile(resolve(output, page), 'utf8')).replaceAll('{{SITE_URL}}', url.origin);
  await writeFile(resolve(output, page), html);
}
await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${url.origin}/sitemap.xml\n`);
await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url.origin}/</loc></url></urlset>\n`);
console.log(`Built dist/ for ${url.origin}; Pages Functions remain in functions/.`);
