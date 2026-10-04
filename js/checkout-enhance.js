// Presentation-only feedback for the existing offer and coupon flow.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function celebrate(box, count = 22) {
  if (!box || reducedMotion.matches) return;

  box.querySelector('.moya-celebration')?.remove();
  const layer = document.createElement('div');
  layer.className = 'moya-celebration';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['#e52e3f', '#ff8b73', '#f4c66e', '#a7ecbc', '#ffffff'];

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('span');
    const angle = (Math.PI * 2 * i) / count;
    const reach = 85 + Math.random() * 170;
    piece.style.setProperty('--dx', `${Math.cos(angle) * reach}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * reach + 75}px`);
    piece.style.setProperty('--rot', `${Math.round(Math.random() * 850 - 425)}deg`);
    piece.style.setProperty('--delay', `${Math.round(Math.random() * 120)}ms`);
    piece.style.setProperty('--size', `${Math.round(4 + Math.random() * 4)}px`);
    piece.style.setProperty('--color', colors[i % colors.length]);
    layer.append(piece);
  }

  box.append(layer);
  window.setTimeout(() => layer.remove(), 1450);
}

function enhanceCheckoutFeedback() {
  const reward = document.getElementById('rewardRevealModal');
  const checkout = document.getElementById('razorpayCheckoutModal');
  const disclosure = document.getElementById('checkoutCouponDisclosure');
  const couponStatus = document.getElementById('couponStatusMsg');
  const priceCard = document.getElementById('checkoutPriceCard');
  if (!reward || !checkout || !couponStatus) return;

  const rewardObserver = new MutationObserver(() => {
    if (reward.open || reward.hasAttribute('open')) {
      celebrate(reward.querySelector('.reward-modal-box'), 30);
    }
  });
  rewardObserver.observe(reward, { attributes: true, attributeFilter: ['open'] });

  let lastCouponState = '';
  const couponObserver = new MutationObserver(() => {
    const state = couponStatus.classList.contains('success')
      ? 'success'
      : couponStatus.classList.contains('error') ? 'error' : '';
    if (state === lastCouponState) return;
    lastCouponState = state;

    if (state === 'success' || state === 'error') disclosure.open = true;
    if (state === 'success') {
      priceCard?.classList.remove('is-celebrating');
      // Restart only this short price confirmation when a new code succeeds.
      if (priceCard) {
        void priceCard.offsetWidth;
        priceCard.classList.add('is-celebrating');
      }
      celebrate(checkout.querySelector('.checkout-modal-box'));
    }
  });
  couponObserver.observe(couponStatus, { attributes: true, attributeFilter: ['class'] });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceCheckoutFeedback, { once: true });
} else {
  enhanceCheckoutFeedback();
}
