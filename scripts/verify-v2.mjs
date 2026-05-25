import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const ROOT = new URL('../site/', import.meta.url).pathname;
const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'};
const srv=createServer(async(rq,rs)=>{try{let p=decodeURIComponent(rq.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const b=await readFile(join(ROOT,p));rs.writeHead(200,{'content-type':T[extname(p)]||'application/octet-stream'});rs.end(b);}catch{rs.writeHead(404);rs.end('nf');}});
await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
const br=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const sizes=[{n:'desktop',w:1440,h:900},{n:'mobile',w:390,h:844},{n:'mobile-sm',w:360,h:760}];
const rep={};
for(const{n,w,h}of sizes){
  const pg=await br.newPage(); await pg.setViewport({width:w,height:h});
  const errs=[]; pg.on('console',m=>m.type()==='error'&&errs.push(m.text())); pg.on('pageerror',e=>errs.push('PE:'+e.message));
  await pg.goto(`http://localhost:${port}/v2/`,{waitUntil:'networkidle0'});
  await new Promise(r=>setTimeout(r,800));
  const m=await pg.evaluate(()=>({o:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  await pg.screenshot({path:`/tmp/v2-${n}.png`,fullPage:true});
  if(n==='desktop'){ await pg.screenshot({path:'/tmp/v2-hero.png'}); }
  rep[n]={overflow:m.o,errors:errs.slice(0,4)};
  await pg.close();
}
await br.close();srv.close();console.log(JSON.stringify(rep,null,1));
