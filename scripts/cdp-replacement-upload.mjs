import WebSocket from 'ws';
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const y = targets.find(x=>x.type==='page'&&x.url.includes('dev-src/renderer'));
const s = targets.find(x=>x.type==='page'&&/serpentHosted/.test(x.url));
function conn(t){ const ws=new WebSocket(t.webSocketDebuggerUrl,{maxPayload:128*1024*1024}); let id=0,p=new Map(); ws.on('message',d=>{const m=JSON.parse(d);if(m.id&&p.has(m.id)){p.get(m.id)(m);p.delete(m.id)}}); return new Promise((res,rej)=>{ws.on('open',()=>res({ws,send:(method,params={})=>new Promise((r,j)=>{const i=++id;p.set(i,m=>m.error?j(m.error):r(m.result));ws.send(JSON.stringify({id:i,method,params}))})}));ws.on('error',rej)}) }
const ys=await conn(y), ss=await conn(s); const ev=async(c,e)=>{const r=await c.send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true}); return r?.result?.value};
await ys.send('Runtime.enable'); await ss.send('Runtime.enable');
console.log('state',await ev(ss,`(()=>({v2:!!document.querySelector('#v2-wrap'),inputs:[...document.querySelectorAll('input')].map((e,i)=>({i,type:e.type,accept:e.accept,multiple:e.multiple,display:getComputedStyle(e).display,rect:e.getBoundingClientRect().toJSON()})),buttons:[...document.querySelectorAll('button')].map((e,i)=>({i,text:e.textContent.trim(),cls:e.className})).filter(x=>x.text)}))()`));
const buttonInfo=await ev(ss,`(()=>{const b=[...document.querySelectorAll('button')].find(e=>/选择视频/.test(e.textContent)); if(!b)return null; const r=b.getBoundingClientRect(); b.click(); return {text:b.textContent.trim(),rect:r.toJSON()}})()`); console.log('clicked',buttonInfo);
await sleep(800);
const inputs=await ev(ss,`[...document.querySelectorAll('input')].map((e,i)=>({i,type:e.type,accept:e.accept,multiple:e.multiple,display:getComputedStyle(e).display}))`); console.log('after inputs',inputs);
const inputIndex=(inputs||[]).find(x=>x.type==='file')?.i; if(inputIndex===undefined) throw new Error('file input missing');
const doc=await ev(ss,`(()=>{const e=document.querySelectorAll('input')[${inputIndex}];return {outer:e.outerHTML}})()`); console.log('input',doc);
// locate DOM node and set files via CDP (only after real click/chooser path)
await ss.send('DOM.enable'); const q=await ss.send('DOM.getDocument',{depth:-1});
const node=await ss.send('DOM.querySelector',{nodeId:q.root.nodeId,selector:`input[type=file]`});
console.log('node',node);
await ss.send('DOM.setFileInputFiles',{nodeId:node.nodeId,files:['F:/PyCharm_Project/AI-Creative-Studio/YUH-Studio/bundled-resources/engine/indextts/assets/IndexTTS2.mp4']});
await sleep(3000);
console.log('post upload',await ev(ss,`(()=>({text:document.querySelector('#v2-wrap')?.textContent?.slice(0,1200),inputs:[...document.querySelectorAll('input')].map(e=>({type:e.type,value:e.value,files:e.files?.length||0})),buttons:[...document.querySelectorAll('button')].map(e=>e.textContent.trim()).filter(Boolean).slice(0,30)}))()`));
ys.ws.close();ss.ws.close();
