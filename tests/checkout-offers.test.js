import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

test('checkout validates totals and rejects invalid offers before payment creation', async () => {
  // No payment credentials or CRM connection: these checks cannot create a payment or contact.
  const port = '31889';
  const server = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: port, GHL_API_KEY: '', GHL_WEBHOOK_URL: '',
      RAZORPAY_KEY_ID: '', RAZORPAY_KEY_SECRET: '', FESTIVE_SPIN_SECRET: 'checkout-test-only',
      COURSE_PRICE: '4997', FESTIVE_ENABLED: 'true', FESTIVE_START_AT: '', FESTIVE_END_AT: '' },
    stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Test server did not start')), 10000);
      server.stdout.on('data', chunk => { if (chunk.toString().includes('Local address:')) { clearTimeout(timeout); resolve(); } });
      server.on('exit', code => { clearTimeout(timeout); if (code) reject(new Error(`Test server exited: ${code}`)); });
    });
    const post = (path, body) => fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    // 1. MOYA55 should be valid with total 997
    const validResult = await (await post('/api/coupon/validate', { couponCode: 'MOYA55' })).json();
    assert.equal(validResult.valid, true);
    assert.equal(validResult.finalAmount, 997);
    const changed = await post('/api/razorpay/create-order', { couponCode: 'MOYA55', expectedAmount: 998 });
    assert.equal(changed.status, 409);

    // 2. All legacy coupons must be strictly rejected
    const legacyCodes = ['MOYA44', 'MOYA22', 'MOYA23', 'MOYA11', '3000OFF', '2000OFF', '1000OFF', 'EXPIRED'];
    for (const code of legacyCodes) {
      const result = await (await post('/api/coupon/validate', { couponCode: code })).json();
      assert.equal(result.valid, false, `Coupon ${code} should be rejected`);
      const orderAttempt = await post('/api/razorpay/create-order', { couponCode: code, expectedAmount: 997 });
      assert.equal(orderAttempt.status, 409, `Order creation with ${code} should be rejected`);
    }

    // 3. Empty coupon submission must be rejected with 400
    const emptyResult = await post('/api/coupon/validate', { couponCode: '' });
    assert.equal(emptyResult.status, 400);
  } finally {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill();
    await exited;
  }
});
