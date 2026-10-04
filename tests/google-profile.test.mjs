import assert from 'node:assert/strict';
import {test} from 'node:test';
import {onRequest} from '../functions/api/google-profile.js';
const origin='https://bella.example';
const request=path=>new Request(origin+path);
test('Google endpoint preserves fallback and securely validates live data',async()=>{
let calls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => { calls++; throw new Error('Should not reach Google without credentials'); };
const disconnected = await onRequest({request:request('/api/google-profile'),env:{}});
assert.equal((await disconnected.json()).reason,'not_configured');
assert.equal(calls,0);
assert.equal(disconnected.headers.get('cache-control'),'no-store');
const env = {GOOGLE_PLACES_API_KEY:'test-key-not-a-real-credential',GOOGLE_PLACE_ID:'TestPlaceId123'};
let capturedFields;
const live = {displayName:{text:'Bella Sample Sale & Boutique'},formattedAddress:'29-09 Ditmars Blvd, Astoria, NY 11105, USA',rating:4.7,googleMapsUri:'https://www.google.com/maps/place/example',currentOpeningHours:{weekdayDescriptions:['Monday: 10:00 AM–6:00 PM','Tuesday: 11:00 AM–7:00 PM','Wednesday: 11:00 AM–7:00 PM','Thursday: 11:00 AM–7:00 PM','Friday: 11:00 AM–7:00 PM','Saturday: 11:00 AM–7:00 PM','Sunday: Closed']},attributions:[]};
globalThis.fetch = async (url,options) => {
  assert.ok(String(url).startsWith('https://places.googleapis.com/v1/places/TestPlaceId123?'));
  assert.equal(options.headers['X-Goog-Api-Key'],env.GOOGLE_PLACES_API_KEY);
  capturedFields = options.headers['X-Goog-FieldMask'];
  return new Response(JSON.stringify(live),{headers:{'content-type':'application/json'}});
};
const changed = await (await onRequest({request:request('/api/google-profile'),env})).json();
assert.equal(changed.connected,true); assert.equal(changed.rating,4.7);
assert.equal(changed.hours[0].time,'10:00 AM–6:00 PM'); assert.equal(changed.hours[6].time,'Closed');
assert.ok(!capturedFields.includes('userRatingCount')); assert.ok(!JSON.stringify(changed).includes(env.GOOGLE_PLACES_API_KEY));
const crossSite = await onRequest({request:new Request(origin+'/api/google-profile',{headers:{Origin:'https://other.example'}}),env});
assert.equal(crossSite.status,403);
globalThis.fetch = async () => new Response(JSON.stringify({...live,formattedAddress:'100 Wrong Street'}));
assert.equal((await (await onRequest({request:request('/api/google-profile'),env})).json()).reason,'listing_mismatch');
globalThis.fetch = async () => new Response('Unavailable',{status:503});
assert.equal((await (await onRequest({request:request('/api/google-profile'),env})).json()).connected,false);
globalThis.fetch = originalFetch;

});
