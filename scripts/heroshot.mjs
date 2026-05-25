import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const ROOT = new URL('../site/', import.meta.url).pathname;
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'};
const srv=createServer(async(rq,rs)=>{try{let p=decodeURIComponent(rq.url.split('?')[0]);if(p==='/')p='/index.html';const b=await readFile(join(ROOT,p));rs.writeHead(200,{'content-type':T[extname(p)]||'application/octet-stream'});rs.end(b);}catch{rs.writeHead(404);rs.end('nf');}});
await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
const br=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
// desktop hero
let pg=await br.newPage(); await pg.setViewport({width:1440,height:860});
await pg.goto(`http://localhost:${port}/`,{waitUntil:'networkidle0'});
await pg.evaluate(()=>{const i=document.getElementById('intro');if(i)i.remove();document.body.classList.add('hero-ready');});
await new Promise(r=>setTimeout(r,900));
await pg.screenshot({path:'/tmp/bc-hero-desktop.png'});
// mobile hero + por que
await pg.setViewport({width:390,height:844}); await new Promise(r=>setTimeout(r,400));
await pg.screenshot({path:'/tmp/bc-hero-mobile.png'});
// scroll to porque on desktop
await pg.setViewport({width:1440,height:860});
await pg.evaluate(()=>{const e=document.getElementById('porque'); window.scrollTo({top:e.getBoundingClientRect().top+window.scrollY-70,behavior:'instant'});});
await new Promise(r=>setTimeout(r,1100));
await pg.screenshot({path:'/tmp/bc-porque-desktop.png'});
await br.close();srv.close();console.log('done');
