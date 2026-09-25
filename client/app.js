const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const format = value => new Intl.NumberFormat('th-TH').format(value);
const money = value => `฿${format(value)}`;
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500); }
function openModal(id) { const modal = $(id); if (!modal.open) modal.showModal(); }
function content(title, body) { $('#content-body').innerHTML = `<h2 id="content-title">${escapeHtml(title)}</h2>${body}`; openModal('#content-dialog'); }
$$('[data-close]').forEach(button => button.onclick = () => button.closest('dialog').close());
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); }));
$('#menu-toggle').onclick = () => { const expanded = $('#main-nav').classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(expanded)); $('#menu-toggle').setAttribute('aria-label', expanded ? 'ปิดเมนู' : 'เปิดเมนู'); };
$$('#main-nav a').forEach(link => link.onclick = () => { $('#main-nav').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); $('#menu-toggle').setAttribute('aria-label', 'เปิดเมนู'); });

const athletes = [
  {name:'รถถัง',full:'รถถัง จิตรเมืองนนท์',en:'RODTANG',slug:'rodtang',country:'THAILAND'},
  {name:'ซุปเปอร์เล็ก',full:'ซุปเปอร์เล็ก ซุปเปอร์เล็กมวยไทย',en:'SUPERLEK',slug:'superlek',country:'THAILAND'},
  {name:'ตะวันฉาย',full:'ตะวันฉาย พีเค.แสนชัย',en:'TAWANCHAI',slug:'tawanchai',country:'THAILAND'},
  {name:'ซุปเปอร์บอน',full:'ซุปเปอร์บอน ซุปเปอร์บอนเทรนนิงแคมป์',en:'SUPERBON',slug:'superbon',country:'THAILAND'},
  {name:'แฮ็กเกอร์ตี',full:'โจนาธาน แฮ็กเกอร์ตี',en:'JONATHAN HAGGERTY',slug:'jonathan-haggerty',country:'UNITED KINGDOM'},
  {name:'น้องโอ๋',full:'น้องโอ๋ ฮาม่ามวยไทย',en:'NONG-O',slug:'nong-o',country:'THAILAND'},
];
const portrait = athlete => '/images/' + athlete.slug + (athlete.slug === 'superlek' ? '.png' : '.jpg');
const source = athlete => `https://www.onefc.com/th/athletes/${athlete.slug}/`;
$('#athlete-list').innerHTML = athletes.map((a, i) => `<a class="athlete-card" href="${source(a)}" target="_blank" rel="noopener noreferrer" aria-label="อ่านโปรไฟล์ ${a.full} บนเว็บไซต์ทางการ เปิดแท็บใหม่"><img class="athlete-photo" src="${portrait(a)}" alt="${a.full} — ภาพจาก ONE Championship" width="600" height="600" loading="lazy" /><span class="athlete-number">0${i + 1}</span><small>${a.en}</small><h3>${a.name}</h3><p>${a.full}</p><span aria-hidden="true">↗</span></a>`).join('');
const matches = [
  {id:1,title:'THE DREAM MATCH',type:'muaythai',label:'มวยไทย',a:athletes[0],b:athletes[1]},
  {id:2,title:'THE ART OF TIMING',type:'kickboxing',label:'คิกบ็อกซิง',a:athletes[2],b:athletes[3]},
  {id:3,title:'HEART OF A FIGHTER',type:'muaythai',label:'มวยไทย',a:athletes[4],b:athletes[5]},
];
const savedGame = read('ring-game-v1', {});
let balance = Number.isSafeInteger(savedGame.balance) && savedGame.balance >= 0 ? savedGame.balance : 1500;
let history = Array.isArray(savedGame.history) ? savedGame.history.filter(h => h && typeof h.name === 'string' && Number.isSafeInteger(h.stake) && typeof h.at === 'string').slice(0,100) : [];
let picks = [], activeType = 'all';
function renderMatches() {
  const query = $('#match-search').value.trim().toLocaleLowerCase();
  const shown = matches.filter(m => (activeType === 'all' || m.type === activeType) && `${m.a.full} ${m.b.full} ${m.a.en} ${m.b.en}`.toLocaleLowerCase().includes(query));
  $('#event-list').innerHTML = shown.length ? shown.map(m => {
    const pick = picks.find(p => p.matchId === m.id);
    return `<article class="match-card"><div class="match-cover"><div class="match-portraits"><img src="${portrait(m.a)}" alt="${m.a.full}" loading="lazy" width="300" height="300" /><img src="${portrait(m.b)}" alt="${m.b.full}" loading="lazy" width="300" height="300" /></div><span>FANTASY MATCHUP / 0${m.id}</span><h3>${m.title}</h3><p>คู่ชกจำลอง · ${m.label}</p></div><div class="match-body"><div class="match-label"><span>${m.label} / เลือกมุมที่คุณเชียร์</span><span>0${m.id}</span></div><div class="fighters">${['a','b'].map((side,index) => `${index ? '<b>VS</b>' : ''}<button class="fighter ${pick?.fighter === side ? 'selected' : ''}" data-pick="${side}" data-match="${m.id}" aria-pressed="${pick?.fighter === side}"><small>${m[side].country}</small><strong>${m[side].name}</strong><em>${pick?.fighter === side ? '✓ มุมของคุณ' : 'เลือกนักกีฬา'}</em></button>`).join('')}</div><div class="pick-area"><label>แต้มจำลอง<input type="number" min="10" max="1500" step="10" value="${pick?.stake ?? 100}" data-stake="${m.id}" aria-label="แต้มสำหรับคู่ ${m.a.name} และ ${m.b.name}" /></label><button class="add-pick" data-add="${m.id}" ${pick ? '' : 'disabled'}>${pick ? 'ดูรายการ ↗' : 'เลือกนักกีฬาก่อน'}</button></div></div></article>`;
  }).join('') : '<p class="empty">ไม่พบคู่ชก ลองค้นหาชื่ออื่นหรือเลือกทุกคู่ชก</p>';
}
$('#event-list').addEventListener('click', event => {
  const fighter = event.target.closest('[data-pick]');
  if (fighter) {
    const matchId = Number(fighter.dataset.match);
    const existing = picks.find(p => p.matchId === matchId);
    const stake = Number($(`[data-stake="${matchId}"]`).value);
    if (existing) existing.fighter = fighter.dataset.pick;
    else picks.push({matchId, fighter:fighter.dataset.pick, stake:Number.isSafeInteger(stake) && stake >= 10 && stake <= 1500 && stake % 10 === 0 ? stake : 100});
    renderMatches(); renderSlip();
  }
  if (event.target.closest('[data-add]')) openModal('#slip-dialog');
});
$('#event-list').addEventListener('input', event => {
  if (!event.target.matches('[data-stake]')) return;
  const pick = picks.find(p => p.matchId === Number(event.target.dataset.stake));
  if (pick) { pick.stake = Number(event.target.value); renderSlip(); }
});
$$('.filter').forEach(button => button.onclick = () => { activeType = button.dataset.type; $$('.filter').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderMatches(); });
$('#match-search').oninput = renderMatches;
function renderSlip() {
  $('#balance').textContent = format(balance); $('#slip-balance').textContent = format(balance);
  $('#slip-count').textContent = picks.length;
  const total = picks.reduce((sum, p) => sum + (Number.isFinite(p.stake) ? p.stake : 0), 0);
  const invalid = picks.some(p => !Number.isSafeInteger(p.stake) || p.stake < 10 || p.stake > 1500 || p.stake % 10 !== 0);
  $('#stake-total').textContent = `${format(total)} แต้ม`;
  $('#slip-error').textContent = invalid ? 'ใช้แต้มครั้งละ 10 ตั้งแต่ 10 ถึง 1,500 แต้ม' : total > balance ? 'แต้มคงเหลือไม่เพียงพอ กรุณาลดจำนวนแต้ม' : '';
  $('#confirm-picks').disabled = !picks.length || invalid || total > balance;
  $('#slip-items').innerHTML = picks.length ? picks.map(p => { const m = matches.find(m => m.id === p.matchId); return `<article class="slip-item"><small>${m.title}</small><b>${m[p.fighter].full}</b><div>${format(p.stake)} แต้มจำลอง</div><button data-remove="${m.id}" aria-label="ลบ ${m[p.fighter].name}">×</button></article>`; }).join('') : '<p class="empty">ยังไม่มีรายการ เลือกนักกีฬาที่คุณเชียร์ได้จากคู่ชก</p>';
}
$('#slip-items').onclick = event => { const button = event.target.closest('[data-remove]'); if (button) { picks = picks.filter(p => p.matchId !== Number(button.dataset.remove)); renderMatches(); renderSlip(); } };
$('#open-slip').onclick = () => openModal('#slip-dialog');
$('#confirm-picks').onclick = () => {
  renderSlip(); if ($('#confirm-picks').disabled) return;
  const total = picks.reduce((sum,p) => sum + p.stake, 0);
  const nextHistory = [...picks.map(p => ({name:matches.find(m => m.id === p.matchId)[p.fighter].full,stake:p.stake,at:new Date().toISOString()})),...history].slice(0,100);
  if (!write('ring-game-v1', {balance:balance-total,history:nextHistory})) { $('#slip-error').textContent = 'บันทึกไม่ได้ กรุณาอนุญาตพื้นที่เก็บข้อมูลของเบราว์เซอร์'; return; }
  balance -= total; history = nextHistory; picks = []; renderMatches(); renderSlip(); $('#slip-dialog').close(); toast('บันทึกมุมที่คุณเชียร์แล้ว');
};
$('#open-history').onclick = () => content('ประวัติการเลือกมุม', history.length ? `<p class="quiet-note">แต้มจำลอง ไม่มีการตัดสินผลหรือจ่ายรางวัล</p>${history.map(h => `<article class="slip-item"><small>${escapeHtml(h.at.slice(0,10))}</small><b>${escapeHtml(h.name)}</b><div>${format(h.stake)} แต้ม</div></article>`).join('')}` : '<p class="empty">ยังไม่มีประวัติ ลองเลือกนักกีฬาที่คุณเชียร์แล้วกดยืนยันรายการ</p>');

const zones = {standard:{name:'Standard',price:800},premium:{name:'Premium',price:1500},ringside:{name:'Ringside',price:2500}};
const ticketForm = $('#ticket-form');
const storedTickets = read('ring-tickets-v1', []);
let tickets = Array.isArray(storedTickets) ? storedTickets.filter(t => t && typeof t.id === 'string' && typeof t.holder === 'string' && Object.hasOwn(zones,t.zone) && Number.isInteger(t.quantity) && t.quantity >= 1 && t.quantity <= 6).slice(0,100) : [];
function ticketTotal() { const zone = zones[ticketForm.elements.zone.value]; const quantity = Number(ticketForm.elements.quantity.value); const total = zone.price * quantity; $('#ticket-subtotal').textContent = money(total); $('#ticket-total').textContent = money(total); }
$('#book-ticket').onclick = () => { ticketForm.reset(); $('#ticket-error').textContent = ''; ticketTotal(); openModal('#ticket-dialog'); };
ticketForm.addEventListener('change', ticketTotal);
function receipt(ticket) { return `<article class="ticket-receipt"><small>DEMO E-TICKET / ใช้เข้างานจริงไม่ได้</small><h3>RINGSIDE SESSIONS.</h3><p>31 ต.ค. 2569 · 18:00 น.<br />RING Studio · กรุงเทพฯ (สถานที่สมมติ)</p><dl><dt>ชื่อบนบัตร</dt><dd>${escapeHtml(ticket.holder)}</dd><dt>โซนที่นั่ง</dt><dd>${zones[ticket.zone].name}</dd><dt>จำนวน</dt><dd>${ticket.quantity} ที่นั่ง</dd><dt>ยอดจำลอง</dt><dd>${money(zones[ticket.zone].price * ticket.quantity)}</dd><dt>การชำระเงิน</dt><dd>ไม่มีการเรียกเก็บเงิน</dd></dl><p class="receipt-code">${escapeHtml(ticket.id)}</p><small class="quiet-note">ไม่ใช่หลักฐานชำระเงิน ไม่ได้ระบุเลขที่นั่งจริง และไม่เกี่ยวข้องกับผู้จัดการแข่งขันรายอื่น</small><button class="button button-dark" data-download="${escapeHtml(ticket.id)}">ดาวน์โหลดบัตร (.txt) ↓</button></article>`; }
ticketForm.onsubmit = event => {
  event.preventDefault(); if (!ticketForm.reportValidity()) return;
  const zone = ticketForm.elements.zone.value, quantity = Number(ticketForm.elements.quantity.value), holder = ticketForm.elements.holder.value.trim();
  if (!Object.hasOwn(zones,zone) || !Number.isInteger(quantity) || quantity < 1 || quantity > 6 || !holder || holder.length > 80) { $('#ticket-error').textContent = 'กรุณาตรวจสอบโซน จำนวน และชื่อบนบัตร'; return; }
  const ticket = {id:`RING-DEMO-${crypto.randomUUID()}`,zone,quantity,holder};
  const next = [ticket,...tickets].slice(0,100);
  if (!write('ring-tickets-v1',next)) { $('#ticket-error').textContent = 'บันทึกบัตรไม่ได้ กรุณาอนุญาตพื้นที่เก็บข้อมูลของเบราว์เซอร์แล้วลองใหม่'; return; }
  tickets = next; $('#ticket-dialog').close(); content('จองบัตรจำลองสำเร็จ', `<p>เก็บบัตรไว้แล้ว เปิดดูได้ที่ “บัตรของฉัน” ในเบราว์เซอร์นี้</p>${receipt(ticket)}<button class="text-button" id="print-ticket">พิมพ์บัตร / บันทึก PDF ↗</button>`);
  $('#print-ticket').onclick = () => window.print();
};
$('#my-tickets').onclick = () => content('บัตรของฉัน', tickets.length ? `<p class="quiet-note">บัตรจำลองที่เก็บในเบราว์เซอร์นี้ · ไม่มีการชำระเงินจริง</p>${tickets.map(receipt).join('')}` : '<p class="empty">ยังไม่มีบัตร ลองกด “เลือกบัตร” เพื่อจองประสบการณ์ข้างเวที</p>');
$('#content-body').addEventListener('click', event => {
  const download = event.target.closest('[data-download]'); if (!download) return;
  const ticket = tickets.find(t => t.id === download.dataset.download); if (!ticket) return;
  const text = `RING / DEMO E-TICKET\nบัตรจำลองเพื่อการศึกษา ใช้เข้างานจริงไม่ได้\n\nRINGSIDE SESSIONS\n31 ตุลาคม 2569 เวลา 18:00 น.\nRING Studio กรุงเทพฯ (สถานที่สมมติ)\nชื่อ: ${ticket.holder}\nโซน: ${zones[ticket.zone].name}\nจำนวน: ${ticket.quantity} ที่นั่ง\nยอดจำลอง: ${money(zones[ticket.zone].price*ticket.quantity)}\nไม่มีการชำระเงิน\nรหัส: ${ticket.id}\n\nนักกีฬาในเว็บไซต์ไม่ได้ร่วมงานนี้ ไม่เกี่ยวข้องกับ ONE Championship`;
  const url = URL.createObjectURL(new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'})); const link = document.createElement('a'); link.href=url; link.download=`${ticket.id}.txt`; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
});

const articles = {
  'eight-limbs':{title:'ศิลปะของอาวุธทั้งแปด',paragraphs:['มวยไทยเปิดพื้นที่ให้หมัด เท้า เข่า และศอกทำงานร่วมกัน นักชกจึงต้องคิดถึงระยะห่างและสมดุลของร่างกายอยู่เสมอ อาวุธที่เหมาะกับระยะไกลอาจใช้ไม่ได้เมื่อคู่ต่อสู้เข้าประชิด','ลองเริ่มดูจากเท้าของนักกีฬา ใครเป็นฝ่ายขยับเข้าหา ใครรักษาระยะ และใครออกอาวุธแล้วกลับมาตั้งหลักได้ ลำดับเล็ก ๆ เหล่านี้ช่วยให้เห็นเกมมากกว่าจังหวะปะทะเพียงอย่างเดียว']},
  'read-the-fight':{title:'อ่านเกมก่อนเสียงระฆัง',paragraphs:['ก่อนเริ่มชม ลองทำความรู้จักนักกีฬาจากแหล่งข้อมูลทางการ แล้วตรวจสอบกติกาของรายการนั้น เพราะรูปแบบการแข่งขันและเกณฑ์ให้คะแนนอาจต่างกัน','ระหว่างชม ให้สังเกตว่าใครคุมระยะได้ ใครออกอาวุธตรงจังหวะ และใครเปลี่ยนวิธีรับมือได้เมื่อสถานการณ์เปลี่ยน ไม่จำเป็นต้องรีบตัดสินผู้ชนะจากอาวุธครั้งเดียว']},
  'respect':{title:'ต่างมุมเดียวกัน',paragraphs:['นักสู้ทั้งสองมุมต่างผ่านการฝึกซ้อมและความกดดัน การเชียร์จึงเป็นโอกาสที่จะชื่นชมความพยายามโดยไม่ลดคุณค่าของอีกฝ่าย','เราอาจชอบนักกีฬาคนละคน แต่ร่วมกันสร้างพื้นที่ที่สนุกและให้เกียรติกันได้ ลองพูดถึงสิ่งที่เห็นบนเวที อธิบายเหตุผลของมุมมอง และพร้อมรับฟังความเห็นที่ต่างออกไป']},
};
$$('[data-article]').forEach(button => button.onclick = () => { const a = articles[button.dataset.article]; content(a.title, `<p class="eyebrow">RING ORIGINAL / บทความเขียนสำหรับโครงงาน</p>${a.paragraphs.map(p => `<p>${p}</p>`).join('')}`); });
$('#about-open').onclick = () => content('เกี่ยวกับ RING และแหล่งข้อมูล', `<p>โครงงานเว็บไซต์ภาษาไทยสำหรับคนรักศิลปะการต่อสู้ ออกแบบและเขียนบทความขึ้นใหม่ ภาพสังเวียนเป็นกราฟิก SVG ที่สร้างสำหรับโครงงาน ภาพนักกีฬาอ้างอิงจากหน้าโปรไฟล์ทางการของ ONE Championship โดยแสดงเครดิตและลิงก์แหล่งที่มา ลิขสิทธิ์ภาพยังเป็นของเจ้าของเดิม ไม่ได้อ้างว่าเป็นภาพปลอดลิขสิทธิ์ และไม่ได้รับรองว่าการใช้เพื่อการศึกษาจะอนุญาตให้เผยแพร่ได้ทุกกรณี</p><p>ชื่อนักกีฬาใช้อ้างอิงเพื่อให้ข้อมูล คู่ชกทั้งหมดเป็นจินตนาการ ไม่มีสถิติแต่งขึ้น ไม่มีการรับรองจากนักกีฬา และไม่ใช่ประกาศการแข่งขันจริง</p><p>ระบบบัตรเป็นการสาธิตสำหรับงานสมมติ ไม่มีการรับเงินจริงหรือสำรองที่นั่งจริง ส่วนประวัติแต้มและบัตรเก็บบนเบราว์เซอร์นี้ บัญชีสมาชิกใช้ระบบเซิร์ฟเวอร์แยกต่างหาก</p><h3>แหล่งข้อมูลชื่อนักกีฬา</h3><ul>${athletes.map(a => `<li><a href="${source(a)}" target="_blank" rel="noopener noreferrer">${a.full} ↗</a></li>`).join('')}</ul><p class="quiet-note">ตรวจสอบแหล่งข้อมูล 25 กันยายน 2569 · ชื่อค่ายอาจเปลี่ยนแปลงได้<br />แบบอักษร IBM Plex Sans Thai, Noto Sans Thai และ Barlow Condensed ผ่าน Google Fonts</p>`);

const authBase = (import.meta.env.VITE_API_URL || '/api/auth').replace(/\/$/,'');
const authForm = $('#auth-form'); let authMode = 'login', currentUser = null;
function paintUser(user) { currentUser=user; $('#auth-open').hidden=Boolean(user); $('#profile-button').hidden=!user; if(user) { $('#profile-name').textContent=user.name; $('#profile-avatar').textContent=(user.name || 'R').trim().charAt(0); } }
function setAuthMode(mode) { authMode=mode; $$('.auth-tab').forEach(b => { b.classList.toggle('active',b.dataset.mode===mode); b.setAttribute('aria-pressed',String(b.dataset.mode===mode)); }); $('.name-field').hidden=mode==='login'; authForm.elements.name.required=mode==='register'; authForm.elements.password.autocomplete=mode==='register'?'new-password':'current-password'; $('#auth-title').textContent=mode==='register'?'สมัครสมาชิก RING':'เข้าสู่ระบบ RING'; $('#auth-submit').textContent=mode==='register'?'สมัครสมาชิก ↗':'เข้าสู่ระบบ ↗'; }
$('#auth-open').onclick=() => { $('#auth-error').textContent=''; openModal('#auth-dialog'); };
$$('.auth-tab').forEach(b => b.onclick=() => { setAuthMode(b.dataset.mode); $('#auth-error').textContent=''; });
$('#profile-button').onclick=() => { content('บัญชีของฉัน',`<p>${escapeHtml(currentUser?.name || '')}</p><p>${escapeHtml(currentUser?.email || '')}</p><button id="signout" class="button button-dark">ออกจากระบบ</button>`); $('#signout').onclick=() => { try { localStorage.removeItem('ring-auth-token'); } catch {} paintUser(null); $('#content-dialog').close(); toast('ออกจากระบบแล้ว'); }; };
authForm.onsubmit=async event => {
  event.preventDefault(); if ($('#auth-submit').disabled || !authForm.reportValidity()) return;
  const data=Object.fromEntries(new FormData(authForm)); data.email=data.email.trim(); if(authMode==='register') { data.name=data.name.trim(); if(!data.name) { $('#auth-error').textContent='กรุณากรอกชื่อที่แสดง'; return; } }
  $('#auth-submit').disabled=true; $$('.auth-tab').forEach(b => b.disabled=true); $('#auth-error').textContent=''; $('#auth-submit').textContent='กำลังเชื่อมต่อ…';
  try {
    const response=await fetch(`${authBase}/${authMode==='register'?'register':'login'}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
    const result=await response.json().catch(() => ({}));
    if(!response.ok) throw new Error(response.status>=500?'ระบบสมาชิกยังไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง':response.status===401?'อีเมลหรือรหัสผ่านไม่ถูกต้อง':response.status===409?'อีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบ':'กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง');
    if(!result.token || !result.user || typeof result.user.name!=='string') throw new Error('ข้อมูลตอบกลับไม่ครบ กรุณาลองใหม่');
    try { localStorage.setItem('ring-auth-token',result.token); } catch { toast('เข้าสู่ระบบแล้ว แต่ไม่สามารถจดจำบัญชีในเบราว์เซอร์นี้'); }
    paintUser(result.user); $('#auth-dialog').close(); authForm.reset(); toast('ยินดีต้อนรับ '+result.user.name);
  } catch(error) { $('#auth-error').textContent=error.name==='TimeoutError'?'การเชื่อมต่อใช้เวลานาน กรุณาลองใหม่':error instanceof TypeError?'เชื่อมต่อระบบสมาชิกไม่ได้ กรุณาลองใหม่ภายหลัง':error.message; }
  finally { $('#auth-submit').disabled=false; $$('.auth-tab').forEach(b => b.disabled=false); setAuthMode(authMode); }
};
async function restoreSession() { try { const token=localStorage.getItem('ring-auth-token'); if(!token) return; const response=await fetch(`${authBase}/me`,{headers:{Authorization:`Bearer ${token}`},signal:AbortSignal.timeout(10000)}); if(response.status===401) { localStorage.removeItem('ring-auth-token'); return; } if(response.ok) { const result=await response.json(); if(typeof result.user?.name==='string') paintUser(result.user); } } catch { /* Offline users can still explore and book demo tickets. */ } }
renderMatches(); renderSlip(); ticketTotal(); setAuthMode('login'); restoreSession();
