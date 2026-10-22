import assert from 'node:assert/strict';
import {test} from 'node:test';
import {cp, mkdir, mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const origin = 'https://bellamodastudionyc.com';
const html = await readFile('dist/index.html', 'utf8');
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);

test('deployment environment cannot replace the public canonical domain', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'bella-seo-'));
  try {
    await mkdir(join(directory, 'scripts'));
    await cp('scripts/build.mjs', join(directory, 'scripts/build.mjs'));
    await cp('web', join(directory, 'web'), {recursive:true});
    const result = spawnSync(process.execPath, ['scripts/build.mjs'], {
      cwd:directory,
      env:{...process.env, CF_PAGES:'1', CF_PAGES_URL:'https://preview.bella-moda-studio.pages.dev', SITE_URL:'https://stale.example'},
      encoding:'utf8'
    });
    assert.equal(result.status, 0, result.stderr);
    for (const page of ['index.html', 'information.html']) {
      const output = await readFile(join(directory, 'dist', page), 'utf8');
      assert.ok(output.includes(`rel="canonical" href="${origin}/`));
      assert.ok(!/pages\.dev|stale\.example|\{\{SITE_URL\}\}/.test(output));
    }
    const robots = await readFile(join(directory, 'dist/robots.txt'), 'utf8');
    const sitemap = await readFile(join(directory, 'dist/sitemap.xml'), 'utf8');
    assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
    assert.ok(sitemap.includes(`<loc>${origin}/</loc>`));
    assert.equal((sitemap.match(/<loc>/g) || []).length, 1);
    assert.ok(!robots.includes('Disallow: /'));
  } finally {
    await rm(directory, {recursive:true, force:true});
  }
});

test('one Astoria store has consistent contact details, hours, profiles, and local images', () => {
  assert.equal((html.match(/"@type":\s*"ClothingStore"/g) || []).length, 1);
  assert.equal(schema['@id'], `${origin}/#astoria-store`);
  assert.equal(schema.url, `${origin}/`);
  assert.equal(schema.telephone, '+18624528098');
  assert.equal(schema.address.streetAddress, '29-09 Ditmars Boulevard');
  assert.equal(schema.address.addressLocality, 'Astoria');
  assert.equal(schema.address.postalCode, '11105');
  assert.equal(schema.openingHoursSpecification[0].dayOfWeek.length, 7);
  assert.equal(schema.openingHoursSpecification[0].opens, '11:00');
  assert.equal(schema.openingHoursSpecification[0].closes, '19:00');
  assert.ok(schema.sameAs.includes('https://www.instagram.com/bella.modastudio/'));
  assert.ok(schema.sameAs.includes('https://share.google/VjTKzQEwPOdjGNWEv'));
  assert.ok(schema.image.every(image => image.startsWith(`${origin}/assets/`)));
  assert.equal(schema.logo.url, `${origin}/assets/bella-logo.webp`);
  assert.ok(!schema.geo, 'Coordinates must be independently verified before publication');
  assert.ok(!schema.aggregateRating && !schema.review, 'Do not add self-serving review markup');
});

test('homepage stays indexable with one H1 and no skipped heading levels', () => {
  assert.ok(!/<meta[^>]+(?:name="robots"|name="googlebot")[^>]+content="[^"]*noindex/i.test(html));
  const headings = [...html.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]));
  assert.equal(headings.filter(level => level === 1).length, 1);
  for (let i = 1; i < headings.length; i++) assert.ok(headings[i] <= headings[i-1] + 1);
  assert.ok(html.includes('boutique and sample sale on Ditmars Boulevard in Astoria, Queens.'));
  assert.ok(html.includes('below-retail finds.'));
  assert.ok(!/<meta\b[^>]*name="keywords"/i.test(html));
});
