import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';

test('GHL payment sync: sets pure numeric amount in custom fields and syncs opportunity to won with monetary value', async () => {
  const ghlRequests = [];

  // Mock GHL server
  const mockGhlServer = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let parsed = null;
      try { parsed = JSON.parse(body); } catch (_) {}
      ghlRequests.push({
        method: req.method,
        url: req.url,
        body: parsed
      });

      if (req.url === '/contacts/upsert') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ contact: { id: 'mock_contact_123', name: 'Rohan Sharma' } }));
      } else if (req.url?.startsWith('/opportunities/search')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          opportunities: [
            {
              id: 'mock_opp_999',
              name: 'Rohan Sharma',
              pipelineId: 'oRlyCNFHQMgZPRQDYjcz',
              pipelineStageId: '81669a03-2898-49f8-b672-aa52fe73351b',
              monetaryValue: 0,
              status: 'open'
            }
          ]
        }));
      } else if (req.url?.startsWith('/opportunities/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          opportunity: {
            id: 'mock_opp_999',
            pipelineStageId: 'f71a530b-829d-4d32-af02-6e730cf06e38',
            status: 'won',
            monetaryValue: 997
          }
        }));
      } else if (req.url?.includes('/notes')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ note: { id: 'mock_note_1' } }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      }
    });
  });

  await new Promise(resolve => mockGhlServer.listen(0, '127.0.0.1', resolve));
  const mockGhlPort = mockGhlServer.address().port;
  const mockGhlBase = `http://127.0.0.1:${mockGhlPort}`;

  const port = '31902';
  const webhookSecret = 'test_webhook_secret_999';
  const server = spawn(process.execPath, ['server.js'], {
    env: {
      ...process.env,
      PORT: port,
      GHL_API_BASE: mockGhlBase,
      GHL_API_KEY: 'test_ghl_key',
      GHL_LOCATION_ID: 'test_loc_123',
      RAZORPAY_KEY_ID: 'rzp_test_key',
      RAZORPAY_KEY_SECRET: 'rzp_test_secret',
      RAZORPAY_WEBHOOK_SECRET: webhookSecret,
      COURSE_PRICE: '4997'
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

    // 1. Verify Payment Endpoint
    ghlRequests.length = 0;
    const verifyPayload = {
      razorpay_order_id: 'order_test_123',
      razorpay_payment_id: 'pay_test_456',
      razorpay_signature: 'fake_sig_bypassed', // Razorpay client signature check handled
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      phone: '+919876543210',
      couponCode: 'MOYA55',
      paidAmount: 997
    };

    // Note: In verify-payment, signature verification will check Razorpay secret if key secret exists.
    // Let's create valid signature for order_test_123 and pay_test_456 with rzp_test_secret:
    const expectedSig = crypto
      .createHmac('sha256', 'rzp_test_secret')
      .update('order_test_123|pay_test_456')
      .digest('hex');
    verifyPayload.razorpay_signature = expectedSig;

    const resVerify = await fetch(`http://127.0.0.1:${port}/api/razorpay/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyPayload)
    });
    assert.equal(resVerify.status, 200);

    // Verify GHL contact upsert received pure numeric string "997" without currency symbols
    const upsertReq = ghlRequests.find(r => r.url === '/contacts/upsert');
    assert.ok(upsertReq, 'Contact upsert must be called');
    const totalPaidField = upsertReq.body.customFields.find(f => f.id === 'jY5kE16LGuyCbzmuxwWe');
    const couponField = upsertReq.body.customFields.find(f => f.id === 'OxYVPF3lZNekTPCUrfYV');
    assert.equal(totalPaidField.value, '997', 'Custom field jY5kE16LGuyCbzmuxwWe must be pure numeric string "997"');
    assert.equal(couponField.value, 'MOYA55', 'Coupon field must be MOYA55');

    // Verify Opportunity update received monetaryValue: 997 and won status
    const oppUpdateReq = ghlRequests.find(r => r.method === 'PUT' && r.url?.startsWith('/opportunities/mock_opp_999'));
    assert.ok(oppUpdateReq, 'Opportunity update must be called');
    assert.equal(oppUpdateReq.body.monetaryValue, 997, 'Opportunity monetaryValue must be numeric 997');
    assert.equal(oppUpdateReq.body.status, 'won', 'Opportunity status must be won');
    assert.equal(oppUpdateReq.body.pipelineStageId, 'f71a530b-829d-4d32-af02-6e730cf06e38');

    // 2. Webhook Endpoint
    ghlRequests.length = 0;
    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_wh_test_789',
            amount: 99700, // 997 INR
            notes: {
              program: 'MOYA Complete Access',
              coupon_code: 'MOYA55',
              name: 'Rohan Sharma',
              email: 'rohan@example.com',
              phone: '+919876543210'
            }
          }
        }
      }
    });

    const whSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookPayload)
      .digest('hex');

    const resWebhook = await fetch(`http://127.0.0.1:${port}/api/razorpay/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': whSignature
      },
      body: webhookPayload
    });
    assert.equal(resWebhook.status, 200);

    const whUpsertReq = ghlRequests.find(r => r.url === '/contacts/upsert');
    assert.ok(whUpsertReq, 'Webhook must call contact upsert');
    const whTotalPaidField = whUpsertReq.body.customFields.find(f => f.id === 'jY5kE16LGuyCbzmuxwWe');
    const whCouponField = whUpsertReq.body.customFields.find(f => f.id === 'OxYVPF3lZNekTPCUrfYV');
    assert.equal(whTotalPaidField.value, '997', 'Webhook custom field must be numeric string "997"');
    assert.equal(whCouponField.value, 'MOYA55', 'Webhook coupon field must be MOYA55');

    const whOppUpdateReq = ghlRequests.find(r => r.method === 'PUT' && r.url?.startsWith('/opportunities/mock_opp_999'));
    assert.ok(whOppUpdateReq, 'Webhook must call opportunity update');
    assert.equal(whOppUpdateReq.body.monetaryValue, 997);
    assert.equal(whOppUpdateReq.body.status, 'won');
  } finally {
    const exited = new Promise(resolve => server.once('exit', resolve));
    server.kill();
    await exited;
    await new Promise(resolve => mockGhlServer.close(resolve));
  }
});
