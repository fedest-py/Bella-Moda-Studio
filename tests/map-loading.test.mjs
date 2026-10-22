import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const script=await readFile('dist/assets/location-map.js','utf8');

function setup(withObserver) {
  const loads=[];
  const frame={dataset:{src:'https://www.google.com/maps?q=Astoria&output=embed'},hidden:true,parentElement:{},
    set src(url) {loads.push(url);},
    removeAttribute(name) {if(name==='data-src')delete this.dataset.src;}
  };
  let callback,observed,disconnected=false;
  class Observer {
    constructor(fn) {callback=fn;}
    observe(element) {observed=element;}
    disconnect() {disconnected=true;}
  }
  runInNewContext(script, {document:{querySelector:()=>frame},window:withObserver?{IntersectionObserver:Observer}:{},IntersectionObserver:Observer});
  return {frame,loads,observed,intersect:value=>callback([{isIntersecting:value}]),disconnected:()=>disconnected};
}

test('Google Maps does not load until the location container approaches the viewport',()=>{
  const view=setup(true);
  assert.equal(view.loads.length,0);
  assert.equal(view.observed,view.frame.parentElement,'Observe the visible container, not the hidden iframe');
  view.intersect(false);assert.equal(view.loads.length,0);
  view.intersect(true);assert.equal(view.loads.length,1);
  assert.equal(view.frame.hidden,false);
  assert.equal(view.disconnected(),true);
  view.intersect(true);assert.equal(view.loads.length,1,'Load the map once');
});

test('browsers without IntersectionObserver still receive the map',()=>{
  const view=setup(false);
  assert.equal(view.loads.length,1);
  assert.equal(view.frame.hidden,false);
});
