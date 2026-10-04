const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const JSON_HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json = (body, status = 200) => new Response(JSON.stringify(body), {status,headers:JSON_HEADERS});

function hoursFromGoogle(place) {
  const descriptions = place.currentOpeningHours?.weekdayDescriptions || place.regularOpeningHours?.weekdayDescriptions || [];
  const hours = descriptions.map(text => {
    const separator = text.indexOf(':');
    return {days:text.slice(0,separator).trim(),time:text.slice(separator+1).trim()};
  }).filter(row => DAYS.includes(row.days) && row.time);
  return DAYS.every(day => hours.some(row => row.days === day)) ? DAYS.map(day => hours.find(row => row.days === day)) : [];
}

async function googleProfile(request, env) {
  if (request.method !== 'GET') return json({connected:false},405);
  const requestURL = new URL(request.url);
  const origin = request.headers.get('Origin');
  if ((origin && origin !== requestURL.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') return json({connected:false},403);
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  const placeId = env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return json({connected:false,reason:'not_configured'});
  if (!/^[A-Za-z0-9_-]{5,256}$/.test(placeId)) return json({connected:false,reason:'configuration_error'});
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(),4500);
  try {
    const upstream = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en&regionCode=US`,{
      headers:{'X-Goog-Api-Key':apiKey,'X-Goog-FieldMask':'displayName,formattedAddress,currentOpeningHours.weekdayDescriptions,regularOpeningHours.weekdayDescriptions,rating,googleMapsUri,attributions'},
      signal:controller.signal
    });
    if (!upstream.ok) return json({connected:false,reason:'temporarily_unavailable'});
    const place = await upstream.json();
    const name = String(place.displayName?.text || '').toLowerCase();
    const address = String(place.formattedAddress || '').toLowerCase().replace(/[^a-z0-9]/g,'');
    if (!name.includes('bella') || !address.includes('2909ditmars')) return json({connected:false,reason:'listing_mismatch'});
    return json({
      connected:true,
      hours:hoursFromGoogle(place),
      rating:Number.isFinite(place.rating) && place.rating >= 1 && place.rating <= 5 ? place.rating : null,
      googleMapsUri:place.googleMapsUri || null,
      attributions:Array.isArray(place.attributions) ? place.attributions : []
    });
  } catch { return json({connected:false,reason:'temporarily_unavailable'}); }
  finally { clearTimeout(timeout); }
}

export function onRequest({request, env}) {
  return googleProfile(request, env);
}
