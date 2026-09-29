import assert from 'node:assert/strict';
const tabs = await (await fetch('http://127.0.0.1:9334/json/list')).json();
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open',resolve,{once:true}));
let id = 0; const pending = new Map();
ws.onmessage = event => { const m = JSON.parse(event.data); if(m.id) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method,params={}) => new Promise(resolve => { const n=++id; pending.set(n,resolve);ws.send(JSON.stringify({id:n,method,params})); });
const evaluate = async expression => { const m = await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(m.error || m.result.exceptionDetails) throw new Error(JSON.stringify(m)); return m.result.result.value; };
const reload = async () => { await send('Page.reload'); for(let i=0;i<100;i++){ await new Promise(r=>setTimeout(r,100));if(await evaluate('!!document.querySelector("[data-pick]")'))return; } throw new Error('Page did not load'); };
try {
  await evaluate('localStorage.clear()'); await reload();
  await evaluate('document.querySelector("[data-topup]").click();document.querySelector("[data-credit=\\"500\\"]").click()');
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ring-game-v1")).balance'),2000);
  await evaluate('document.querySelector("[data-pick]").click();document.querySelector("#confirm-picks").click()');
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ring-game-v1")).balance'),1900);
  await reload(); assert.equal(await evaluate('document.querySelector("#balance").textContent'),'1,900');
  await evaluate('document.querySelector("#open-slip").click();document.querySelector(".slip-topup").click();document.querySelector("[data-credit=\\"1500\\"]").click()');
  assert.equal(await evaluate('document.querySelector("#slip-dialog").open'),true);
  assert.equal(await evaluate('document.querySelector("#slip-balance").textContent'),'3,400');
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ring-game-v1")).history.length'),1);
  await evaluate('document.querySelector("#slip-dialog").close();document.querySelector("#book-ticket").click()');
  assert.equal(await evaluate('document.querySelector("#ticket-dialog").open'),true);
  await evaluate('document.querySelector("[name=holder]").value="Smoke test";document.querySelector("#ticket-form input[type=checkbox]").checked=true;document.querySelector("#ticket-form").requestSubmit()');
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ring-tickets-v1")).length'),1);
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("ring-game-v1")).balance'),3400);
  await evaluate('document.querySelector("#content-dialog").close()');
  assert.equal(await evaluate('Number.isFinite(Number(document.querySelector("[data-time=days]").textContent))'),true);
  for(const width of [1440,768,390,320]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true,`overflow ${width}`);
  }
  await evaluate('document.querySelector("[data-topup]").click()');
  assert.equal(await evaluate('document.querySelector("#topup-dialog").scrollWidth<=document.querySelector("#topup-dialog").clientWidth'),true);
  console.log('PASS: refill, deduction, reload persistence, refill from slip, history preservation, ticket booking, separate wallet, countdown, desktop/mobile layouts');
} finally { ws.close(); }
