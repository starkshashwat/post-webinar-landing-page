import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

test('Lead-First 20-minute coupon urgency funnel backend integration', async () => {
  const port = '31895';
  const server = spawn(process.execPath, ['server.js'], {
    env: {
      ...process.env,
      PORT: port,
      GHL_API_KEY: '',
      GHL_WEBHOOK_URL: '',
      RAZORPAY_KEY_ID: '',
      RAZORPAY_KEY_SECRET: '',
      COURSE_PRICE: '4997'
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Test server did not start in time')), 10000);
      server.stdout.on('data', chunk => {
        if (chunk.toString().includes('Local address:')) {
          clearTimeout(timeout);
          resolve();
        }
      });
      server.on('exit', code => {
        clearTimeout(timeout);
        if (code) reject(new Error(`Server exited unexpectedly with code ${code}`));
      });
    });

    const post = (path, body) => fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // 1. Test Lead Capture API
    const validLeadRes = await post('/api/leads', {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      income: '$250 - $750 / mo'
    });
    assert.equal(validLeadRes.status, 200);
    const validLeadData = await validLeadRes.json();
    assert.equal(validLeadData.success, true);

    // 2. Test Invalid Lead Capture
    const invalidLeadRes = await post('/api/leads', {
      name: '',
      email: '',
      phone: ''
    });
    assert.equal(invalidLeadRes.status, 400);

    // 3. Test Coupon Validation for Urgency Voucher MOYA55
    const couponRes = await post('/api/coupon/validate', { couponCode: 'MOYA55' });
    assert.equal(couponRes.status, 200);
    const couponData = await couponRes.json();
    assert.equal(couponData.valid, true);
    assert.equal(couponData.code, 'MOYA55');
    assert.equal(couponData.discount, 4000);
    assert.equal(couponData.finalAmount, 997);
  } finally {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill();
    await exited;
  }
});
