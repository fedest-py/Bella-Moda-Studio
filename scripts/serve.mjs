import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {onRequest} from '../functions/api/google-profile.js';
const root = fileURLToPath(new URL('..', import.meta.url));
const directory = resolve(root, process.argv.includes('--dist') ? 'dist' : 'web');
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.json':'application/json'};
createServer(async (req,res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (url.pathname === '/api/google-profile') {
      const result = await onRequest({request:new Request(url,{method:req.method,headers:req.headers}), env:process.env});
      res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
    }
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
    const path = resolve(directory, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!path.startsWith(directory+sep) || /(?:^|\/)[._]/.test(url.pathname)) {res.writeHead(404);res.end('Not found');return;}
    let bytes;
    try {bytes = await readFile(path);} catch {res.writeHead(404,{'content-type':'text/html; charset=utf-8'});res.end(await readFile(resolve(directory,'404.html')));return;}
    if (extname(path) === '.html') bytes = Buffer.from(bytes.toString().replaceAll('{{SITE_URL}}', `http://localhost:${port}`));
    res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream','cache-control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {res.writeHead(500);res.end('Server error');}
}).listen(port,'0.0.0.0',()=>console.log(`Local preview on http://localhost:${port}`));
