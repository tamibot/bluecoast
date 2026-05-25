import puppeteer from 'puppeteer';
const br=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const pg=await br.newPage();
const errs=[]; pg.on('console',m=>m.type()==='error'&&errs.push(m.text())); pg.on('requestfailed',r=>errs.push('FAIL '+r.url()));
pg.on('response',r=>{if(r.status()>=400)errs.push(r.status()+' '+r.url());});
await pg.setViewport({width:1440,height:900,deviceScaleFactor:1});
await pg.goto('https://tamibot.github.io/bluecoast/v2/',{waitUntil:'networkidle0',timeout:45000});
await new Promise(r=>setTimeout(r,1500));
const info=await pg.evaluate(()=>({
  title:document.title,
  cssLoaded:!!document.querySelector('link[href*="app.css"]'),
  bodyBg:getComputedStyle(document.body).backgroundColor,
  heroFont:getComputedStyle(document.querySelector('.hero__title')||document.body).fontFamily,
  fonts:document.fonts?[...document.fonts].map(f=>f.family+' '+f.status).slice(0,6):'n/a',
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
}));
await pg.screenshot({path:'/tmp/live-desktop.png',fullPage:true});
await pg.screenshot({path:'/tmp/live-hero.png'});
console.log('errors:',JSON.stringify(errs.slice(0,8)));
console.log('info:',JSON.stringify(info,null,1));
await br.close();
