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
    for (const [code, total] of [['MOYA55', 997], ['MOYA44', 1997], ['MOYA22', 2997]]) {
      const result = await (await post('/api/coupon/validate', { couponCode: code })).json();
      assert.equal(result.valid, true);
      assert.equal(result.finalAmount, total);
      const changed = await post('/api/razorpay/create-order', { couponCode: code, expectedAmount: total + 1 });
      assert.equal(changed.status, 409);
    }
    assert.equal((await post('/api/razorpay/create-order', { couponCode: 'EXPIRED', expectedAmount: 997 })).status, 409);
    assert.equal((await (await post('/api/coupon/validate', { couponCode: 'EXPIRED' })).json()).valid, false);
  } finally {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill();
    await exited;
  }
});
