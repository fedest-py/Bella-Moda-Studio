import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile, readdir, stat} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
const root = resolve('dist');
const html = await readFile(resolve(root,'index.html'),'utf8');
const decode = value => value.replaceAll('&amp;','&');
async function exists(path) {assert.ok((await stat(resolve(root,path))).isFile(),path);}
async function files(dir) {const out=[]; for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);out.push(...e.isDirectory()?await files(p):[p]);}return out;}
test('all page links, responsive images, scripts, and styles resolve',async()=>{
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  for(const file of ['index.html','information.html','404.html']) {
    const page=await readFile(resolve(root,file),'utf8');
    const refs=[...page.matchAll(/\b(?:src|href)="([^"]+)"/g)].map(m=>decode(m[1]));
    for(const m of page.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) refs.push(...m[1].split(',').map(s=>s.trim().split(/\s+/)[0]));
    for(const ref of refs) {
      if(ref.startsWith('#')) {assert.ok(ids.has(ref.slice(1)),ref);continue;}
      if(/^(?:data:|https:|http:|tel:|mailto:)/.test(ref)){new URL(ref);continue;}
      await exists(ref==='/'?'index.html':ref.replace(/^\//,'').split(/[?#]/)[0]);
    }
  }
  for(const name of ['entrance','handbags','collection','mirror','outerwear','accessories','storefront','storefront-portrait']) await exists(`assets/${name}-1280.webp`);
});
test('all bundled photographs and logo are nonempty WebP assets',async()=>{
  const images=(await files(resolve(root,'assets'))).filter(p=>extname(p)==='.webp');
  assert.equal(images.length,17);
  for(const path of images){const bytes=await readFile(path);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(bytes.length>1000);}
});
test('current copy, map, contact and slideshow controls are preserved',()=>{
  for(const text of ['Every day.','That’s passion for fashion.','Consider this','your walk-in.','Be classy, Be chic.','Make it a statement.','Sample Sale + Boutique']) assert.ok(html.includes(text),text);
  assert.equal((html.match(/class="hours-row"/g)||[]).length,7);
  const frame=html.match(/<iframe[^>]+src="([^"]+)"/);assert.ok(frame);
  const map=new URL(decode(frame[1]));assert.equal(map.hostname,'www.google.com');assert.equal(map.searchParams.get('output'),'embed');assert.equal(map.searchParams.get('q'),'29-09 Ditmars Boulevard, Astoria, NY 11105');
  assert.ok(html.includes('href="tel:+18624528098"'));
  for(const value of ['data-go-slide="0"','data-go-slide="1"','data-go-slide="2"','play-toggle','lightbox-next','lightbox-previous','lightbox-close']) assert.ok(html.includes(value),value);
});
test('metadata has a standalone origin and no unresolved placeholders',()=>{
  assert.ok(!html.includes('{{SITE_URL}}'));
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];new URL(canonical);
  assert.ok(html.includes('property="og:image"'));assert.ok(html.includes('name="viewport"'));assert.ok(html.includes('rel="icon"'));
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);assert.equal(schema.name,'Bella Moda Studio');
});
test('client build contains no platform runtime, credentials or server source',async()=>{
  for(const path of await files(root)){
    if(!['.html','.css','.js','.json','.txt','.xml'].includes(extname(path)))continue;
    const text=await readFile(path,'utf8');
    assert.ok(!/chatgpt|openai|oaiusercontent|sediment:|sites-project:|\bastra\b/i.test(text),path);
    assert.ok(!/AIza[\w-]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(text),path);
    assert.ok(!text.includes('GOOGLE_PLACES_API_KEY'),path);
  }
});
