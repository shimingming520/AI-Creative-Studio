import WebSocket from "ws";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const y = targets.find(x => x.type === 'page' && x.url.includes('dev-src/renderer'));
const s = targets.find(x => x.type === 'page' && /serpentHosted/.test(x.url));
function connect(t) {
  const ws = new WebSocket(t.webSocketDebuggerUrl); let id = 0; const p = new Map();
  ws.on('message', d => { const m=JSON.parse(d); if(m.id&&p.has(m.id)){p.get(m.id)(m);p.delete(m.id);} else if(m.method==='Runtime.consoleAPICalled'||m.method==='Runtime.exceptionThrown') console.log(t.url.includes('serpentHosted')?'SERP':'YUH',m.method,JSON.stringify(m.params).slice(0,1000)); });
  return new Promise((res,rej)=>{ws.on('open',()=>res({ws,send:(method,params={})=>new Promise((resolve,reject)=>{const i=++id;p.set(i,m=>m.error?reject(m.error):resolve(m.result));ws.send(JSON.stringify({id:i,method,params}));})}));ws.on('error',rej);});
}
const ys=await connect(y), ss=await connect(s); await ys.send('Runtime.enable'); await ss.send('Runtime.enable');
const ev=(c,e)=>c.send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});
console.log('before',await ev(ss,`(()=>{const w=document.querySelector('#v2-wrap');return {text:document.body.innerText.slice(0,80),hasV2:!!w,v2Display:w&&getComputedStyle(w).display,v2Text:w?.textContent?.slice(0,200),events:window.__rsOpenViewEvents||[]}})()`));
console.log('click',await ev(ys,`(()=>{const b=document.querySelector('aside.left-rail nav .yuh-replacement-entry');b?.click();return !!b})()`));
await sleep(2000);
console.log('after',await ev(ss,`(()=>{const w=document.querySelector('#v2-wrap');return {text:document.body.innerText.slice(0,120),hasV2:!!w,v2Display:w&&getComputedStyle(w).display,v2Text:w?.textContent?.slice(0,500),events:window.__rsOpenViewEvents||[]}})()`));
ys.ws.close();ss.ws.close();
