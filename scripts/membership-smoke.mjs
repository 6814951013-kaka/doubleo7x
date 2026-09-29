// Start Vite on 5177 and a dedicated test Chrome with remote debugging on 9334.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const tabs = await (await fetch('http://127.0.0.1:9334/json/list')).json();
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open',resolve,{once:true}));
let id = 0; const pending = new Map(), errors = [];
ws.onmessage = event => { const m=JSON.parse(event.data); if(m.id){pending.get(m.id)(m);pending.delete(m.id);} if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (method,params={}) => new Promise(resolve => {const n=++id;pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params}));});
const evaluate = async expression => {const m=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(m.error||m.result.exceptionDetails)throw new Error(JSON.stringify(m));return m.result.result.value;};
try {
  await send('Runtime.discardConsoleEntries');
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate',{url:'http://127.0.0.1:5177'}); await send('Page.bringToFront');
  for(let i=0;i<100;i++){await new Promise(r=>setTimeout(r,100));if(await evaluate('!!document.querySelector("#pass-form")?.onsubmit'))break;}
  await evaluate('localStorage.removeItem("ring-pass-v1");window.dispatchEvent(new StorageEvent("storage",{key:"ring-pass-v1"}))');
  assert.equal(await evaluate('document.querySelector("#pass-plans").hidden'),false);
  await evaluate('document.querySelector("[data-plan=monthly]").click()');
  assert.equal(await evaluate('document.querySelector("#pass-dialog").open'),true);
  assert.equal(await evaluate('document.querySelector("#pass-form").checkValidity()'),false);
  assert.equal(await evaluate('document.querySelector("#pass-order-price").textContent.includes("199")'),true);
  await evaluate('document.querySelector("#pass-close").click();document.querySelector("[data-plan=yearly]").click()');
  assert.equal(await evaluate('document.querySelector("#pass-order-price").textContent.includes("1,899")'),true);
  await evaluate('document.querySelector("#pass-consent").checked=true;document.querySelector("#pass-form").requestSubmit()');
  assert.equal(await evaluate('document.querySelector("#pass-plans").hidden'),true);
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ring-pass-v1")).plan'),'yearly');
  assert.equal(await evaluate('Math.ceil((JSON.parse(localStorage.getItem("ring-pass-v1")).expiresAt-Date.now())/86400000)'),365);
  await evaluate('document.querySelector("[data-plan=monthly]").click()');
  await send('Page.reload'); await new Promise(r=>setTimeout(r,800));
  assert.equal(await evaluate('document.querySelector("#pass-plans").hidden'),true);
  await evaluate('localStorage.setItem("ring-pass-v1",JSON.stringify({plan:"yearly",expiresAt:Date.now()-1}));window.dispatchEvent(new StorageEvent("storage",{key:"ring-pass-v1"}))');
  assert.equal(await evaluate('document.querySelector("#pass-plans").hidden'),false);
  for(const width of [1440,768,390,320]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<800});
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`overflow ${width}`);
  }
  await evaluate('document.querySelector("[data-plan=monthly]").click()');
  assert.equal(await evaluate('document.querySelector("#pass-dialog").scrollWidth<=document.querySelector("#pass-dialog").clientWidth'),true);
  await evaluate('document.querySelector("#pass-consent").checked=true;document.querySelector("#pass-form").requestSubmit()');
  assert.equal(await evaluate('Math.ceil((JSON.parse(localStorage.getItem("ring-pass-v1")).expiresAt-Date.now())/86400000)'),30);
  await evaluate('document.querySelector("#pass-end").click()');
  assert.equal(await evaluate('localStorage.getItem("ring-pass-v1")'),null);
  assert.equal(await evaluate('document.querySelector("#pass-plans").hidden'),false);
  assert.deepEqual(errors,[]);
  console.log('PASS: paywall, monthly/yearly prices and terms, consent validation, activation, persistence, expiry, cancellation, mobile checkout');
} finally { ws.close(); }
