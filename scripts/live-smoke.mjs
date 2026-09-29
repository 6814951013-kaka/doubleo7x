// Start Vite on 5177 and a dedicated test Chrome with remote debugging on 9334.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const tabs = await (await fetch('http://127.0.0.1:9334/json/list')).json();
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open',resolve,{once:true}));
let id = 0; const pending = new Map(), errors = [];
ws.onmessage = event => { const m=JSON.parse(event.data); if(m.id){pending.get(m.id)(m);pending.delete(m.id);} if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text); };
const send = (method,params={}) => new Promise(resolve => {const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}));});
const evaluate = async expression => {const m=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(m.error||m.result.exceptionDetails)throw new Error(JSON.stringify(m));return m.result.result.value;};
try {
  await send('Runtime.enable');await send('Page.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:5177'});
  await send('Page.bringToFront');
  for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,100));if(await evaluate('!!document.querySelector("#live-toggle")?.onclick'))break;}
  await evaluate('document.querySelector("[data-channel=ringside]").click()');
  assert.equal(await evaluate('document.querySelector("#live-player").dataset.camera'),'ringside');
  assert.equal(await evaluate('document.querySelectorAll("[data-channel][aria-pressed=true]").length'),1);
  await evaluate('document.querySelector("#live-toggle").click()');
  assert.equal(await evaluate('document.querySelector("#live-player").classList.contains("paused")'),true);
  const time=await evaluate('document.querySelector("#live-elapsed").textContent');
  await new Promise(r=>setTimeout(r,1200));
  assert.equal(await evaluate('document.querySelector("#live-elapsed").textContent'),time);
  await evaluate('document.querySelector("[data-channel=studio]").click()');
  assert.equal(await evaluate('document.querySelector("#live-player").classList.contains("paused")'),true);
  await evaluate('document.querySelector("#live-toggle").click()');
  await new Promise(r=>setTimeout(r,1200));
  assert.notEqual(await evaluate('document.querySelector("#live-elapsed").textContent'),time);
  await evaluate('Promise.all([...document.querySelectorAll(".story img")].map(i=>{i.loading="eager";return i.decode()}))');
  assert.equal(await evaluate('new Set([...document.querySelectorAll(".story img")].map(i=>i.src)).size'),3);
  for(const width of [1440,1024,820,768,390,320]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<800});
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`overflow ${width}`);
    assert.equal(await evaluate('[...document.querySelectorAll(".story img")].every(i=>Math.abs(i.clientWidth/i.clientHeight-i.naturalWidth/i.naturalHeight)<.03)'),true,`image aspect ratio ${width}`);
    assert.equal(await evaluate('[...document.querySelectorAll(".story-image")].every(e=>e.clientHeight-e.querySelector("img").clientHeight<3)'),true,`blank image area ${width}`);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  for(const section of ['live','journal']) {
    await evaluate(`document.documentElement.style.scrollBehavior='auto';document.querySelector('#${section}').scrollIntoView()`);
    const shot=await send('Page.captureScreenshot',{format:'png'});
    await writeFile(join(tmpdir(),`ring-${section}-updated.png`),Buffer.from(shot.result.data,'base64'));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: channel switching, pause/resume timer, unique full-ratio images, no blank image panels, 6 responsive widths, no JS errors');
  console.log(join(tmpdir(),'ring-live-updated.png'));console.log(join(tmpdir(),'ring-journal-updated.png'));
} finally { ws.close(); }
