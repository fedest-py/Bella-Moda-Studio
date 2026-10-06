import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const script = await readFile('dist/assets/analytics.js', 'utf8');
function setup(gtag) {
  const handlers = {};
  const calls = [];
  runInNewContext(script, {
    window: {gtag: gtag === false ? undefined : (...args) => calls.push(args)},
    document: {addEventListener(type, fn) { handlers[type] = fn; }}
  });
  function click(href, dataset = {}, type = 'click', button = 0) {
    const link = {getAttribute: () => href, dataset};
    // A nested span click resolves to its containing anchor, including anchors
    // inserted after analytics initializes by the site's contact renderer.
    const event = {type, button, target: {closest: () => link},
      preventDefault() {assert.fail('Analytics must not block link navigation');}};
    handlers[type](event);
  }
  return {calls, click};
}

test('only requested actions emit events, including dynamically inserted phone links', () => {
  const {calls, click} = setup();
  assert.equal(calls.length, 0, 'page views are not contact or directions clicks');
  click('#visit');
  click('https://policies.google.com/privacy');
  assert.equal(calls.length, 0);
  click('tel:+18624528098');
  click('https://www.google.com/maps/dir/?api=1', {analyticsEvent:'directions_click', analyticsLocation:'directions'});
  click('https://share.google/VjTKzQEwPOdjGNWEv', {analyticsEvent:'google_listing_click', analyticsLocation:'listing'});
  assert.deepEqual(calls.map(call => call[1]), ['phone_click', 'directions_click', 'google_listing_click']);
  for (const call of calls) {
    assert.equal(call[0], 'event');
    assert.equal(call[2].send_to, 'G-NRLQQ6BB38');
  }
});

test('middle clicks count once, right clicks do not, and missing Analytics does not break links', () => {
  const {calls, click} = setup();
  const data = {analyticsEvent:'google_listing_click', analyticsLocation:'hours'};
  click('https://www.google.com/maps/place/bella', data, 'auxclick', 1);
  click('https://www.google.com/maps/place/bella', data, 'auxclick', 2);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2].link_location, 'hours');
  assert.doesNotThrow(() => setup(false).click('tel:+18624528098'));
});

test('built pages load tracking once and retain all three listing links and directions tracking', async () => {
  for (const file of ['index.html', 'information.html']) {
    const html = await readFile(`dist/${file}`, 'utf8');
    assert.equal((html.match(/src="\/assets\/analytics.js\?v=1"/g) || []).length, 1);
    if (file === 'index.html') {
      assert.equal((html.match(/data-analytics-event="directions_click"/g) || []).length, 1);
      assert.equal((html.match(/data-analytics-event="google_listing_click"/g) || []).length, 3);
    }
  }
});
