import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const ROOT=new URL('../site/',import.meta.url).pathname;
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'};
const srv=createServer(async(rq,rs)=>{try{let p=decodeURIComponent(rq.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const b=await readFile(join(ROOT,p));rs.writeHead(200,{'content-type':T[extname(p)]||'application/octet-stream'});rs.end(b);}catch{rs.writeHead(404);rs.end('nf');}});
await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
const br=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const pg=await br.newPage(); await pg.setViewport({width:1440,height:900,deviceScaleFactor:1});
const errs=[]; pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await pg.goto(`http://localhost:${port}/v2/opciones/`,{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,1200));
const o=await pg.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
for(const[i,sel]of[['1','.o1'],['2','.o2'],['3','.o3']]){
  await pg.evaluate(s=>document.querySelector(s).scrollIntoView(),sel);
  await new Promise(r=>setTimeout(r,500));
  await pg.screenshot({path:`/tmp/opt-${i}.png`});
}
console.log('overflow:',o,'errors:',errs.length);
await br.close();srv.close();
