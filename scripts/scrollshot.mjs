import puppeteer from 'puppeteer';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const ROOT = new URL('../site/', import.meta.url).pathname;
const T = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'};
const srv = createServer(async(rq,rs)=>{try{let p=decodeURIComponent(rq.url.split('?')[0]); if(p==='/')p='/index.html'; const b=await readFile(join(ROOT,p)); rs.writeHead(200,{'content-type':T[extname(p)]||'application/octet-stream'}); rs.end(b);}catch{rs.writeHead(404);rs.end('nf');}});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
const br=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const pg=await br.newPage(); await pg.setViewport({width:1440,height:900,deviceScaleFactor:1});
await pg.goto(`http://localhost:${port}/`,{waitUntil:'networkidle0'});
await pg.evaluate(()=>{const i=document.getElementById('intro'); if(i)i.remove();});
// Smoothly scroll to each section like a real user, let reveals fire, screenshot viewport
const ids = ['porque','productos','especies','testimonios','certificaciones','contacto'];
for (const id of ids){
  await pg.evaluate((id)=>{ const el=document.getElementById(id); if(el){ window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - 70, behavior:'instant'}); } }, id);
  await new Promise(r=>setTimeout(r,1100)); // allow IO + scroll-timeline to settle
  await pg.screenshot({path:`/tmp/bc-scroll-${id}.png`});
  // report visibility of key children
  const vis = await pg.evaluate((id)=>{
    const sec=document.getElementById(id); if(!sec) return null;
    const kids=[...sec.querySelectorAll('.reveal,.bento__card,.pcard,.sp,.tcard,.trust__item,.section__head')];
    const hidden=kids.filter(k=>parseFloat(getComputedStyle(k).opacity)<0.05).length;
    return { total:kids.length, hidden };
  }, id);
  console.log(id, JSON.stringify(vis));
}
await br.close(); srv.close();
