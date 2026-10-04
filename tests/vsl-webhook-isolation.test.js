import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';

test('webhook rejects unsigned or forged calls and strictly isolates non-VSL payments', async () => {
  const port = '31899';
  const webhookSecret = 'test_webhook_secret_xyz123';
  const server = spawn(process.execPath, ['server.js'], {
    env: {
      ...process.env,
      PORT: port,
      GHL_API_KEY: '',
      GHL_WEBHOOK_URL: '',
      RAZORPAY_KEY_ID: '',
      RAZORPAY_KEY_SECRET: 'test_key_secret',
      RAZORPAY_WEBHOOK_SECRET: webhookSecret,
      FESTIVE_SPIN_SECRET: 'checkout-test-only',
      COURSE_PRICE: '4997',
      FESTIVE_ENABLED: 'false'
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Test server did not start')), 10000);
      server.stdout.on('data', chunk => {
        if (chunk.toString().includes('Local address:')) {
          clearTimeout(timeout);
          resolve();
        }
      });
      server.on('exit', code => {
        clearTimeout(timeout);
        if (code) reject(new Error(`Test server exited: ${code}`));
      });
    });

    const url = `http://127.0.0.1:${port}/api/razorpay/webhook`;

    // 1. Missing signature header -> Must be 401
    const resNoSig = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payment.captured' })
    });
    assert.equal(resNoSig.status, 401);

    // 2. Invalid / forged signature -> Must be 400
    const resBadSig = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'invalid_hex_signature'
      },
      body: JSON.stringify({ event: 'payment.captured' })
    });
    assert.equal(resBadSig.status, 400);

    // 3. Valid signature BUT External GHL Form / Non-VSL payment (notes.program is missing or different)
    const externalPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_external_ghl_form',
            amount: 499700,
            notes: {
              // No program or something else
            }
          }
        }
      }
    });

    const externalSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(externalPayload)
      .digest('hex');

    const resExternal = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': externalSignature
      },
      body: externalPayload
    });

    assert.equal(resExternal.status, 200);
    const dataExternal = await resExternal.json();
    assert.equal(dataExternal.status, 'ignored');
    assert.equal(dataExternal.reason, 'Not a VSL website payment');

    // 4. Valid signature AND Genuine VSL Website Payment (notes.program == 'MOYA Complete Access')
    const vslPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_vsl_genuine_payment',
            amount: 499700,
            notes: {
              program: 'MOYA Complete Access',
              coupon_code: 'NONE'
            }
          }
        }
      }
    });

    const vslSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(vslPayload)
      .digest('hex');

    const resVsl = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': vslSignature
      },
      body: vslPayload
    });

    assert.equal(resVsl.status, 200);
    const dataVsl = await resVsl.json();
    assert.equal(dataVsl.status, 'ok');

  } finally {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill();
    await exited;
  }
});
