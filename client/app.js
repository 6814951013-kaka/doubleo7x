const matches=[
{id:1,startsAt:'2026-10-17T19:30:00+07:00',date:'17 OCT · 19:30',type:'MUAY THAI',title:'NIGHT SHIFT 08',division:'FLYWEIGHT · 135 LBS',a:{name:'ธันวา สายฟ้า',country:'THA',record:'18–3',win:78,ko:'9 KO',reach:'170 cm',style:'TECHNICIAN',form:['W · KO R2','W · DEC','W · TKO R3','L · DEC','W · KO R1']},b:{name:'มาร์โก เด ลา ครูซ',country:'ESP',record:'14–2',win:71,ko:'7 KO',reach:'173 cm',style:'PRESSURE',form:['W · DEC','W · KO R1','L · DEC','W · TKO R2','W · DEC']},image:'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1200&q=90'},
{id:2,startsAt:'2026-10-24T20:00:00+07:00',date:'24 OCT · 20:00',type:'MMA',title:'CAGE THEORY 12',division:'LIGHTWEIGHT · 155 LBS',a:{name:'คิริน วงศ์วานิช',country:'THA',record:'11–1',win:84,ko:'5 KO',reach:'177 cm',style:'GRAPPLER',form:['W · SUB R2','W · DEC','W · TKO R1','W · SUB R3','L · DEC']},b:{name:'อาเดรียน โคล',country:'AUS',record:'16–5',win:64,ko:'8 KO',reach:'180 cm',style:'STRIKER',form:['L · DEC','W · KO R2','W · KO R1','W · DEC','L · SUB R2']},image:'https://images.unsplash.com/photo-1564419434663-c49967363849?auto=format&fit=crop&w=1200&q=90'},
{id:3,startsAt:'2026-10-31T19:30:00+07:00',date:'31 OCT · 19:30',type:'MUAY THAI',title:'NIGHT SHIFT 09',division:'BANTAMWEIGHT · 145 LBS',a:{name:'ปกรณ์ นครสวรรค์',country:'THA',record:'22–6',win:66,ko:'12 KO',reach:'175 cm',style:'CLINCH',form:['W · TKO R3','L · DEC','W · KO R2','W · DEC','W · KO R1']},b:{name:'ลูคัส วอล์คเกอร์',country:'GBR',record:'19–4',win:73,ko:'10 KO',reach:'178 cm',style:'COUNTER',form:['W · DEC','W · KO R3','L · DEC','W · KO R2','W · DEC']},image:'https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=1200&q=90'}];
const $=s=>document.querySelector(s);let balance=Number(localStorage.getItem('strike-balance')||1500),picks=JSON.parse(localStorage.getItem('strike-picks')||'[]'),activeType='all',expandedMatch=null;const format=n=>new Intl.NumberFormat('th-TH').format(n);const save=()=>{localStorage.setItem('strike-balance',balance);localStorage.setItem('strike-picks',JSON.stringify(picks))};
function history(f){return `<div class="form-guide"><p>LAST 5 FIGHTS <span>${f.name}</span></p><div>${f.form.map(r=>`<span class="${r[0]==='W'?'win':'loss'}" title="${r}">${r[0]}</span>`).join('')}</div><small>${f.form.join(' · ')}</small></div>`}function stats(m){let rows=[['WIN RATE',`${m.a.win}%`,`${m.b.win}%`],['FINISHES',m.a.ko,m.b.ko],['REACH',m.a.reach,m.b.reach],['FIGHT STYLE',m.a.style,m.b.style]];return `<section class="stats-drawer"><div class="drawer-title"><span>FIGHT PROFILE</span><b>PRE-FIGHT INTEL</b></div><div class="stat-compare">${rows.map(r=>`<div><strong>${r[1]}</strong><span>${r[0]}</span><strong>${r[2]}</strong></div>`).join('')}</div><div class="history-grid">${history(m.a)}${history(m.b)}</div></section>`}
function card(m){let p=picks.find(x=>x.matchId===m.id),open=expandedMatch===m.id;return `<article class="match-card"><div class="match-cover" style="background-image:linear-gradient(90deg,#08090dbf,#08090d24),url('${m.image}')"><span>${m.type}</span><p>${m.date}</p><h3>${m.title}</h3><i>RING//PULSE ORIGINAL</i></div><div class="match-body"><div class="match-label"><span>${m.division}</span><button class="stats-button ${open?'open':''}" data-stats="${m.id}">${open?'HIDE INTEL −':'VIEW FIGHT INTEL +'}</button></div><div class="fighters"><button class="fighter ${p?.fighter==='a'?'selected':''}" data-pick="a" data-match="${m.id}"><small>${m.a.country}</small><strong>${m.a.name}</strong><em>${m.a.record}</em><i>${m.a.win}% WIN RATE</i></button><b>VS</b><button class="fighter ${p?.fighter==='b'?'selected':''}" data-pick="b" data-match="${m.id}"><small>${m.b.country}</small><strong>${m.b.name}</strong><em>${m.b.record}</em><i>${m.b.win}% WIN RATE</i></button></div>${open?stats(m):''}<div class="pick-area"><label><span>POINT STAKE</span><input type="number" min="10" step="10" value="${p?.stake||100}" data-stake="${m.id}" /></label><button class="add-pick ${p?'added':''}" data-add="${m.id}" ${p?'':'disabled'}>${p?'✓ ON YOUR CARD':'CHOOSE A FIGHTER'}</button></div></div></article>`}
function renderMatches(){let shown=matches.filter(m=>activeType==='all'||m.type===activeType);$('#event-list').innerHTML=shown.map(card).join('');bind()};function bind(){document.querySelectorAll('.fighter').forEach(b=>b.onclick=()=>{let id=+b.dataset.match,p=picks.find(x=>x.matchId===id);p?p.fighter=b.dataset.pick:picks.push({matchId:id,fighter:b.dataset.pick,stake:100});save();renderMatches();renderSlip()});document.querySelectorAll('[data-stake]').forEach(i=>i.oninput=()=>{let p=picks.find(x=>x.matchId===+i.dataset.stake);if(p){p.stake=Math.max(10,+i.value||10);save();renderSlip()}});document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{$('#slip').classList.add('open');$('#slip').setAttribute('aria-hidden','false');$('#scrim').classList.add('show')});document.querySelectorAll('[data-stats]').forEach(b=>b.onclick=()=>{expandedMatch=expandedMatch===+b.dataset.stats?null:+b.dataset.stats;renderMatches()})}
function renderSlip(){let total=picks.reduce((s,p)=>s+p.stake,0);$('#slip-count').textContent=picks.length;$('#chosen-count').textContent=picks.length;$('#stake-total').textContent=`${format(total)} PTS`;$('#confirm-picks').disabled=!picks.length;$('#slip-items').innerHTML=picks.length?picks.map(p=>{let m=matches.find(x=>x.id===p.matchId),f=m[p.fighter];return `<article class="slip-item"><button data-remove="${m.id}">×</button><small>${m.title} · ${m.date}</small><b>${f.name}</b><div><span>${format(p.stake)} PTS</span><em>WIN PICK</em></div></article>`}).join(''):'<p class="empty">NO PICKS ON YOUR CARD<br /><small>เลือกนักกีฬาจากรายการแมตช์</small></p>';document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{picks=picks.filter(p=>p.matchId!==+b.dataset.remove);save();renderMatches();renderSlip()})}
function toast(s){let t=$('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}function updateBalance(){$('#balance').textContent=format(balance);$('#slip-balance').textContent=format(balance);$('#balance-large').childNodes[0].nodeValue=`${format(balance)} `};$('.filter-row').onclick=e=>{if(!e.target.matches('.filter'))return;$('.filter.active').classList.remove('active');e.target.classList.add('active');activeType=e.target.dataset.type;expandedMatch=null;renderMatches()};$('#open-slip').onclick=()=>{$('#slip').classList.add('open');$('#slip').setAttribute('aria-hidden','false');$('#scrim').classList.add('show')};let close=()=>{$('#slip').classList.remove('open');$('#slip').setAttribute('aria-hidden','true');$('#scrim').classList.remove('show')};$('#close-slip').onclick=close;$('#scrim').onclick=close;$('#confirm-picks').onclick=()=>{let total=picks.reduce((s,p)=>s+p.stake,0);if(!picks.length)return;if(picks.some(p=>!Number.isSafeInteger(p.stake)||p.stake<10||p.stake%10!==0))return toast('กรุณาระบุแต้มเป็นจำนวนเต็มทีละ 10 แต้ม');if(picks.some(p=>Date.now()>=Date.parse(matches.find(m=>m.id===p.matchId).startsAt)))return toast('รายการนี้เริ่มแข่งขันแล้ว');if(total>balance){topupDialog.showModal();return toast('แต้มไม่พอ เติมแต้มฟรีเพื่อเชียร์ต่อ');}balance-=total;picks=[];save();updateBalance();renderMatches();renderSlip();close();toast(`LOCKED IN · ใช้ ${format(total)} แต้ม`)};$('#copy-contact').onclick=async()=>{try{await navigator.clipboard.writeText('hello@ringpulse.example');toast('คัดลอกอีเมลแล้ว')}catch{toast('EMAIL: hello@ringpulse.example')}};updateBalance();renderMatches();renderSlip();

// Virtual credits use the same persistent wallet as prediction stakes.
const topupDialog = $('#topup-dialog');
// Set this to the organizer's actual checkout page before enabling ticket sales.
const ticketCheckout = import.meta.env.VITE_TICKET_CHECKOUT_URL?.trim();
if (ticketCheckout) {
  try {
    const checkoutUrl = new URL(ticketCheckout);
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.username || checkoutUrl.password) {
      throw new Error('Ticket checkout must be a public HTTPS URL');
    }
    const ticketButton = $('.ticket-cta');
    ticketButton.href = checkoutUrl.href;
    ticketButton.target = '_blank';
    ticketButton.rel = 'noopener noreferrer';
    ticketButton.textContent = 'ซื้อบัตรเข้าสนาม ↗';
    $('.ticket-note').textContent = 'ซื้อบัตรและตรวจสอบวันเวลา ราคา และที่นั่งบนเว็บไซต์ผู้จำหน่าย';
  } catch {
    console.error('Invalid VITE_TICKET_CHECKOUT_URL: use a public HTTPS checkout URL.');
  }
}
document.querySelectorAll('[data-topup]').forEach(button => {
  button.onclick = () => topupDialog.showModal();
});
document.querySelectorAll('[data-credit]').forEach(button => {
  button.onclick = () => {
    const amount = Number(button.dataset.credit);
    if (!Number.isSafeInteger(balance + amount)) return toast('ยอดแต้มเกินขีดจำกัด');
    balance += amount;
    save();
    updateBalance();
    topupDialog.close();
    toast(`เติมสำเร็จ +${format(amount)} แต้ม · คงเหลือ ${format(balance)} แต้ม`);
  };
});
function updateCountdown() {
  const remaining = Math.max(0, Math.ceil((Date.parse(matches[0].startsAt) - Date.now()) / 1000));
  const values = {days: Math.floor(remaining / 86400), hours: Math.floor(remaining / 3600) % 24, minutes: Math.floor(remaining / 60) % 60, seconds: remaining % 60};
  Object.entries(values).forEach(([unit, value]) => {
    document.querySelector(`[data-time="${unit}"]`).textContent = String(value).padStart(2, '0');
  });
  $('#countdown-label').textContent = remaining ? 'นับถอยหลังสู่คืนชก' : 'ถึงเวลาแข่งขันแล้ว';
}
updateCountdown();
setInterval(updateCountdown, 1000);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !topupDialog.open) close();
});
