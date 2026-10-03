const money = n => `₹${n.toLocaleString('en-IN')}`;
const memory = new Map();
const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) || memory.get(key); } catch { return memory.get(key); } },
  set(key, value) { memory.set(key, value); try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
};

// Six wedges share their geometry between the small invitation and the game.
function wheelSVG(id, rewards, miniature = false) {
  const colors = ['#9e2038', '#161a3b', miniature ? '#9e2038' : '#74213b', '#161a3b', '#9e2038', '#161a3b'];
  const wedges = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * Math.PI / 180;
    const b = a + Math.PI / 3;
    const r = rewards[i % rewards.length];
    const path = `M180 180 L${180 + 144 * Math.cos(a)} ${180 + 144 * Math.sin(a)} A144 144 0 0 1 ${180 + 144 * Math.cos(b)} ${180 + 144 * Math.sin(b)} Z`;
    return `<g data-wedge="${i}"><path d="${path}" fill="${colors[i]}" stroke="#c39a61" stroke-opacity=".5"/>${miniature ? '' : `<g transform="rotate(${i * 60 + 30} 180 180)"><text x="180" y="83" text-anchor="middle" fill="#fff5e0" font-size="19" font-weight="800">${money(r.discount)}</text><text x="180" y="100" text-anchor="middle" fill="#d9be97" font-size="9" letter-spacing="2">OFF</text></g>`}</g>`;
  }).join('');
  const lights = Array.from({ length: 24 }, (_, i) => {
    const a = i * Math.PI / 12;
    return `<circle cx="${180 + 157 * Math.cos(a)}" cy="${180 + 157 * Math.sin(a)}" r="2.2" fill="#f8ddb0" opacity="${i % 2 ? '.45' : '.9'}"/>`;
  }).join('');
  return `<svg viewBox="0 0 360 360" aria-hidden="true" focusable="false" class="fw-svg">
    <defs><linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8e6139"/><stop offset=".3" stop-color="#fae6bb"/><stop offset=".6" stop-color="#b78950"/><stop offset="1" stop-color="#e8c58b"/></linearGradient></defs>
    <circle cx="180" cy="180" r="174" fill="none" stroke="#bb925b" stroke-opacity=".25" stroke-dasharray="1 7"/>
    <circle cx="180" cy="180" r="165" fill="#211d28" stroke="url(#${id}-gold)" stroke-width="5"/>
    <g class="fw-lights">${lights}</g><g class="fw-face">${wedges}</g>
    <circle cx="180" cy="180" r="144" fill="none" stroke="url(#${id}-gold)" stroke-width="2"/>
    <circle cx="180" cy="183" r="39" fill="#050716" opacity=".5"/>
    <circle cx="180" cy="180" r="36" fill="url(#${id}-gold)" stroke="#fff0ce"/>
    <text x="180" y="${miniature ? '190' : '184'}" text-anchor="middle" font-size="${miniature ? '30' : '12'}" font-weight="800" fill="#35251e">${miniature ? 'M' : 'MOYA'}</text>
    ${miniature ? '' : '<text x="180" y="196" text-anchor="middle" font-size="6" letter-spacing="1.6" fill="#573d2c">FESTIVE EDITION</text>'}
    <g class="fw-pointer"><path d="M168 14 Q180 8 192 14 L180 44 Z" fill="url(#${id}-gold)" stroke="#ffebbd"/><circle cx="180" cy="17" r="4" fill="#fff2d0"/></g>
  </svg>`;
}

export function initFestiveSpinGame({ applyOffer }) {
  const $ = id => document.getElementById(id);
  const modal = $('festiveSpinModal');
  if (!modal) return;
  const widget = $('festiveSpinWidget');
  const launcher = $('openSpinModalBtn');
  const trigger = $('spinTriggerBtn');
  const status = $('spinStatus');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let campaign, reward, receipt, spinId, rotation = 0, frame, audio, requestVersion = 0;
  let state = 'loading', sound = false, paused = storage.get('moya-spin-paused') === true;
  const defaultRewards = [4000, 3000, 2000].map(discount => ({ discount }));
  $('spinLauncherArt').innerHTML = wheelSVG('fw-mini', defaultRewards, true);
  $('spinWheelArt').innerHTML = wheelSVG('fw-full', defaultRewards);

  async function api(path, body) {
    const res = await fetch(`/api/festive/${path}`, {
      ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10000),
    });
    let data;
    try { data = await res.json(); }
    catch { throw new Error('Offers are temporarily unavailable. Please try again.'); }
    if (!res.ok) throw new Error(data.message || 'Offers are temporarily unavailable. Please try again.');
    return data;
  }
  function setState(next, message = '') {
    state = next;
    modal.dataset.state = next;
    status.textContent = message;
    trigger.disabled = ['loading', 'preparing', 'spinning', 'unavailable'].includes(next);
    trigger.textContent = next === 'spinning' ? 'Revealing your offer…' : next === 'preparing' ? 'Preparing your spin…' : next === 'loading' ? 'Checking offers…' : next === 'error' ? 'Try again' : 'Spin my offer';
    syncMotion();
  }
  function syncMotion() {
    const otherModal = !!document.querySelector('dialog[open]:not(#festiveSpinModal), .modal.is-open');
    widget.classList.toggle('fw-still', paused || reduced.matches || document.hidden || modal.open || !!reward || otherModal);
    widget.classList.toggle('fw-obscured', modal.open || otherModal);
    $('spinPauseBtn').setAttribute('aria-pressed', String(paused));
    $('spinPauseBtn').setAttribute('aria-label', paused ? 'Resume festive animation' : 'Pause festive animation');
    $('spinPauseBtn').textContent = paused ? '▷' : 'Ⅱ';
  }
  function renderCampaign(data) {
    campaign = data;
    document.querySelectorAll('[data-festive-label]').forEach(el => { el.textContent = data.label; });
    if (!data.active) throw new Error('The festive offer is currently unavailable. Please check back later.');
    const rewards = data.rewards;
    // For two available tiers alternate them; for one use the same real reward throughout.
    $('spinWheelArt').innerHTML = wheelSVG('fw-full', rewards);
    const amounts = rewards.map(r => money(r.discount));
    const list = amounts.length > 1 ? `${amounts.slice(0, -1).join(', ')} or ${amounts.at(-1)}` : amounts[0];
    $('spinOfferDescription').textContent = `Spin to reveal ${list} off MOYA Complete Access.`;
    $('spinLauncherValue').textContent = `Up to ${money(Math.max(...rewards.map(r => r.discount)))} off`;
    $('spinOdds').textContent = rewards.map(r => `${money(r.discount)} off: ${(r.probability * 100).toFixed(1).replace('.0', '')}%`).join(' · ');
    $('spinExpiry').textContent = data.endsAt ? `Available until ${new Date(data.endsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST.` : '';
  }
  function key() { return `moya-festive:${campaign.id}`; }
  function save() { storage.set(key(), { spinId, reward, receipt, endsAt: campaign.endsAt }); }
  function showReward(celebrate = false) {
    cancelAnimationFrame(frame);
    $('prizeDisplayAmount').textContent = money(reward.discount);
    $('prizeCouponCode').textContent = reward.code;
    $('prizePayable').textContent = `${money(campaign.basePrice - reward.discount)} with your offer`;
    $('spinLauncherLabel').textContent = 'Your offer is ready';
    $('spinLauncherValue').textContent = `View ${money(reward.discount)} off`;
    launcher.setAttribute('aria-label', `View your ${money(reward.discount)} festive offer`);
    setState('won', `Your ${money(reward.discount)} offer is unlocked.`);
    if (modal.open) $('prizeClaimBtn').focus({ preventScroll: true });
    if (celebrate && modal.open && !reduced.matches) confetti();
  }
  async function load() {
    const version = ++requestVersion;
    reward = null;
    setState('loading');
    try {
      const data = await api('campaign');
      if (version !== requestVersion) return;
      renderCampaign(data);
      const saved = storage.get(key());
      spinId = typeof saved?.spinId === 'string' ? saved.spinId : crypto.randomUUID();
      // Save the request ID before any network request so interrupted attempts retry identically.
      reward = null;
      receipt = saved?.receipt;
      if (!saved?.reward) save();
      if (saved?.reward) {
        const result = await api('spin', { spinId, campaignId: campaign.id, receipt });
        if (version !== requestVersion) return;
        renderCampaign(result.campaign);
        reward = result.reward;
        receipt = result.receipt;
        save();
        landOnReward();
        showReward();
      } else setState('ready', 'Every eligible spin reveals a discount.');
    } catch (error) {
      if (version !== requestVersion) return;
      $('spinLauncherLabel').textContent = 'Festive offers';
      $('spinLauncherValue').textContent = 'Check availability';
      launcher.setAttribute('aria-label', 'Check festive MOYA offers');
      setState('error', error.name === 'TimeoutError' ? 'The connection is taking too long. Please try again.' : error.message);
    }
  }
  function targetAngle() {
    const index = campaign.rewards.findIndex(r => r.code === reward.code);
    return ((360 - (index * 60 + 30)) % 360);
  }
  function landOnReward() {
    rotation = targetAngle();
    $('spinWheelArt').querySelector('.fw-face').style.transform = `rotate(${rotation}deg)`;
    $('spinWheelArt').querySelector(`[data-wedge="${campaign.rewards.findIndex(r => r.code === reward.code)}"]`).classList.add('fw-winning');
  }
  function tick() {
    if (!modal.open || document.hidden || reduced.matches) return;
    $('spinWheelArt').querySelector('.fw-pointer').animate([{ transform: 'rotate(-12deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }], { duration: 130 });
    if (!sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      audio.resume();
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(460, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(140, audio.currentTime + .025);
      gain.gain.setValueAtTime(.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .025);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + .03);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* The offer remains usable when audio is unavailable. */ }
  }
  async function spin() {
    if (state === 'error') return load();
    if (state !== 'ready') return;
    const version = ++requestVersion;
    setState('preparing', 'Preparing your festive offer…');
    try {
      const result = await api('spin', { spinId, campaignId: campaign.id });
      if (version !== requestVersion) return;
      renderCampaign(result.campaign);
      reward = result.reward;
      receipt = result.receipt;
      save();
      if (!modal.open || reduced.matches) { landOnReward(); showReward(); return; }
      setState('spinning', 'Your festive offer is on its way…');
      const face = $('spinWheelArt').querySelector('.fw-face');
      const end = 5 * 360 + targetAngle(), start = performance.now();
      let lastPeg = 0;
      const animate = now => {
        const t = Math.min((now - start) / 3200, 1);
        // Integral of t*(1-t)^3 gives a short acceleration and a long smooth deceleration.
        const eased = 10*t*t - 20*t*t*t + 15*t**4 - 4*t**5;
        rotation = end * eased;
        face.style.transform = `rotate(${rotation}deg)`;
        const peg = Math.floor(rotation / 60);
        if (peg !== lastPeg) { tick(); lastPeg = peg; }
        if (t < 1 && modal.open && !document.hidden && !reduced.matches) frame = requestAnimationFrame(animate);
        else { landOnReward(); showReward(true); }
      };
      frame = requestAnimationFrame(animate);
    } catch (error) {
      if (version === requestVersion) setState('error', error.message || 'We couldn’t prepare your spin. Please try again.');
    }
  }
  function confetti() {
    const host = $('spinConfetti');
    host.replaceChildren();
    for (let i = 0; i < 28; i++) {
      const dot = document.createElement('i');
      dot.style.background = ['#e3c18a', '#e52e3f', '#fff0d4'][i % 3];
      host.append(dot);
      const animation = dot.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${(Math.random() - .5) * 480}px,${100 + Math.random() * 250}px) rotate(${Math.random() * 540}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 350, easing: 'cubic-bezier(.15,.6,.45,1)' });
      animation.onfinish = () => dot.remove();
    }
  }
  launcher.addEventListener('click', () => {
    modal.showModal();
    document.body.classList.add('fw-modal-open');
    window.lenisInstance?.stop();
    $('closeSpinModalBtn').focus();
    syncMotion();
    load();
  });
  $('closeSpinModalBtn').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
  modal.addEventListener('close', () => {
    cancelAnimationFrame(frame);
    if (reward) { landOnReward(); showReward(); }
    $('spinConfetti').replaceChildren();
    audio?.suspend();
    document.body.classList.remove('fw-modal-open');
    window.lenisInstance?.start();
    syncMotion();
    launcher.focus();
  });
  trigger.addEventListener('click', spin);
  $('spinPauseBtn').addEventListener('click', () => { paused = !paused; storage.set('moya-spin-paused', paused); syncMotion(); });
  $('spinSoundBtn').addEventListener('click', () => {
    sound = !sound;
    $('spinSoundBtn').setAttribute('aria-pressed', String(sound));
    $('spinSoundBtn').textContent = `Sound ${sound ? 'on' : 'off'}`;
    if (sound) tick();
  });
  $('prizeCopyBtn').addEventListener('click', async () => {
    if (!reward) return;
    try { await navigator.clipboard.writeText(reward.code); status.textContent = 'Offer code copied.'; }
    catch { status.textContent = `Your code is ${reward.code}. You can select and copy it above.`; }
  });
  $('prizeClaimBtn').addEventListener('click', async () => {
    if (!reward) return;
    const code = reward.code;
    modal.close();
    await applyOffer(code);
  });
  function motionChanged() {
    syncMotion();
    if ((document.hidden || reduced.matches) && state === 'spinning' && reward) { landOnReward(); showReward(); }
  }
  document.addEventListener('visibilitychange', motionChanged);
  reduced.addEventListener('change', motionChanged);
  const sticky = $('mobileStickyBar');
  function position() {
    const visible = sticky && sticky.getAttribute('aria-hidden') !== 'true';
    widget.style.setProperty('--fw-bottom', `${visible ? sticky.getBoundingClientRect().height + 16 : 20}px`);
  }
  if (sticky) {
    new ResizeObserver(position).observe(sticky);
    new MutationObserver(position).observe(sticky, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
  }
  document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(syncMotion).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  position(); syncMotion(); load();
}
