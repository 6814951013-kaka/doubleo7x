import './live.css';
import { hasPass, openPass } from './membership.js';

const player = document.querySelector('#live-player');
const toggle = document.querySelector('#live-toggle');
const status = document.querySelector('#live-status');
const channels = {
  main: ['01', 'MAIN ARENA', 'บรรยากาศเวทีหลัก', 'ชมภาพกราฟิกสังเวียนจำลอง พร้อมแสงไฟเคลื่อนไหว'],
  ringside: ['02', 'RINGSIDE VIEW', 'ชิดขอบเวทีทุกจังหวะ', 'มุมภาพจำลองระยะใกล้ ให้คุณสัมผัสบรรยากาศข้างสังเวียน'],
  studio: ['03', 'FIGHT IQ STUDIO', 'อ่านเกมไปด้วยกัน', 'จับตาระยะเท้า การคุมพื้นที่ และจังหวะออกอาวุธก่อนเลือกมุมที่เชียร์'],
};
let playing = hasPass() && !matchMedia('(prefers-reduced-motion: reduce)').matches;
let elapsed = 0;
let lastTick = performance.now();
function paintPlayback() {
  player.classList.toggle('paused', !playing);
  toggle.textContent = playing ? 'Ⅱ พักภาพ' : '▶ เล่นภาพ';
  toggle.setAttribute('aria-label', playing ? 'พักภาพจำลอง' : 'เล่นภาพจำลอง');
}
toggle.onclick = () => {
  if (!hasPass()) return openPass();
  playing = !playing; lastTick = performance.now(); paintPlayback();
  status.textContent = playing ? 'กำลังเล่นภาพจำลอง ไม่มีวิดีโอหรือเสียงการแข่งขันจริง' : 'พักภาพจำลองแล้ว กดเล่นภาพเพื่อรับชมต่อ';
};
document.querySelectorAll('[data-channel]').forEach(button => {
  button.onclick = () => {
    if (!hasPass()) return openPass();
    const key = button.dataset.channel;
    const [number, kicker, title, description] = channels[key];
    player.dataset.camera = key;
    document.querySelector('#live-channel-number').textContent = number;
    document.querySelector('#live-kicker').textContent = kicker;
    document.querySelector('#live-channel-title').textContent = title;
    document.querySelector('#live-description').textContent = description;
    document.querySelectorAll('[data-channel]').forEach(option => {
      option.classList.toggle('active', option === button);
      option.setAttribute('aria-pressed', String(option === button));
    });
    status.textContent = `ช่อง ${number} · ${title} · ${playing ? 'กำลังเล่นภาพจำลอง' : 'พักภาพอยู่'}`;
  };
});
const fullscreen = document.querySelector('#live-fullscreen');
fullscreen.hidden = !document.fullscreenEnabled;
fullscreen.onclick = async () => {
  if (!hasPass()) return openPass();
  try {
    if (document.fullscreenElement === player) await document.exitFullscreen();
    else await player.requestFullscreen();
  } catch { status.textContent = 'เปิดเต็มจอไม่ได้ กรุณาลองอีกครั้ง'; }
};
document.addEventListener('fullscreenchange', () => {
  const active = document.fullscreenElement === player;
  fullscreen.textContent = active ? '⛶ ย่อหน้าจอ' : '⛶ เต็มจอ';
  fullscreen.setAttribute('aria-label', active ? 'ออกจากเต็มจอ' : 'เปิดเต็มจอ');
});
document.addEventListener('visibilitychange', () => { lastTick = performance.now(); });
setInterval(() => {
  const now = performance.now();
  if (playing && hasPass() && !document.hidden) elapsed += now - lastTick;
  lastTick = now;
  const seconds = Math.floor(elapsed / 1000);
  document.querySelector('#live-elapsed').textContent = `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
}, 250);
paintPlayback();
document.addEventListener('ring-pass-change', () => {
  if (!hasPass()) {
    playing = false;
    if (document.fullscreenElement === player) document.exitFullscreen().catch(() => {});
    status.textContent = 'สมัคร RING PASS เพื่อรับชมช่องจำลอง';
  }
  lastTick = performance.now(); paintPlayback();
});
