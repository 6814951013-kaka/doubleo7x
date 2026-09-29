import './membership.css';
const $ = selector => document.querySelector(selector);
const key = 'ring-pass-v1';
const plans = {
  monthly: {name:'รายเดือน', price:199, days:30},
  yearly: {name:'รายปี', price:1899, days:365},
};
let membership = null, selected = 'monthly';
try {
  const stored = JSON.parse(localStorage.getItem(key));
  if (stored && Object.hasOwn(plans,stored.plan) && Number.isFinite(stored.expiresAt)) membership = stored;
} catch { /* A missing or damaged demo subscription starts locked. */ }
export const hasPass = () => Boolean(membership && membership.expiresAt > Date.now());
export function openPass(plan = 'monthly') {
  if (hasPass()) return;
  selected = Object.hasOwn(plans,plan) ? plan : 'monthly';
  const offer = plans[selected];
  $('#pass-form').reset(); $('#pass-error').textContent = '';
  $('#pass-order-name').textContent = `RING PASS · ${offer.name}`;
  $('#pass-order-price').textContent = `฿${offer.price.toLocaleString('th-TH')}`;
  $('#pass-order-term').textContent = `สิทธิ์ ${offer.days} วันนับจากยืนยัน · ไม่ต่ออายุอัตโนมัติ`;
  $('#pass-submit').textContent = `ยืนยันชำระเงินจำลอง ${offer.price.toLocaleString('th-TH')} บาท`;
  if (!$('#pass-dialog').open) $('#pass-dialog').showModal();
}
function renderPass() {
  const active = hasPass();
  $('#pass-account').hidden = !active; $('#pass-plans').hidden = active;
  document.querySelectorAll('[data-plan]').forEach(button => { button.disabled = active; });
  if (active) {
    $('#pass-name').textContent = `RING PASS ${plans[membership.plan].name} · สมาชิกจำลอง`;
    $('#pass-expiry').textContent = 'ใช้ได้ถึง ' + new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'}).format(membership.expiresAt) + ' น. (เวลาไทย) · ไม่ต่ออายุอัตโนมัติ';
  }
  document.dispatchEvent(new CustomEvent('ring-pass-change',{detail:{active}}));
}
document.querySelectorAll('[data-plan]').forEach(button => { button.onclick = () => openPass(button.dataset.plan); });
$('#pass-close').onclick = () => $('#pass-dialog').close();
$('#pass-form').onsubmit = event => {
  event.preventDefault();
  if (hasPass() || !$('#pass-form').reportValidity()) return;
  const next = {plan:selected,expiresAt:Date.now()+plans[selected].days*86400000};
  try { localStorage.setItem(key,JSON.stringify(next)); }
  catch { $('#pass-error').textContent = 'บันทึกสิทธิ์ไม่ได้ กรุณาอนุญาตพื้นที่เก็บข้อมูลแล้วลองอีกครั้ง'; return; }
  membership = next; renderPass(); $('#pass-dialog').close();
  $('#pass-status').textContent = 'สมัครสมาชิกจำลองสำเร็จ ตรวจสอบวันหมดอายุได้ด้านบน ไม่มีการเรียกเก็บเงินจริง';
  $('#pass-end').focus();
};
$('#pass-end').onclick = () => {
  try { localStorage.removeItem(key); }
  catch { $('#pass-status').textContent = 'ล้างสิทธิ์จำลองไม่ได้ กรุณาลองอีกครั้ง'; return; }
  membership = null; renderPass();
  $('#pass-status').textContent = 'สิ้นสุดสมาชิกจำลองแล้ว เลือกแพ็กเกจเพื่อทดลองสมัครใหม่ได้';
};
let wasActive = hasPass();
setInterval(() => {
  if (wasActive !== hasPass()) { renderPass(); wasActive = hasPass(); }
},1000);
document.addEventListener('ring-pass-change',() => { wasActive = hasPass(); });
window.addEventListener('storage', event => {
  if (event.key !== key && event.key !== null) return;
  try { const next=JSON.parse(localStorage.getItem(key)); membership=next && Object.hasOwn(plans,next.plan) && Number.isFinite(next.expiresAt) ? next : null; } catch { membership=null; }
  renderPass();
});
renderPass();
