import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { sha256, normalizePhone, formatUserData, sendMetaCapiEvent } from '../server/meta-capi.js';

test('Meta CAPI unit: sha256 hashes lowercase and trimmed strings', () => {
  const email1 = '  Test.User@Example.COM ';
  const hash1 = sha256(email1);
  const expected = 'a97d7a4513204a9cc7cb2f11d72d41a59b18d1ba633d22e58d53c625518f5203'; // sha256 of 'test.user@example.com'
  assert.equal(hash1, expected);
  assert.equal(sha256(''), null);
  assert.equal(sha256(null), null);
});

test('Meta CAPI unit: normalizePhone adds 91 to 10-digit Indian numbers and strips non-digits', () => {
  assert.equal(normalizePhone('9876543210'), '919876543210');
  assert.equal(normalizePhone('+91 98765-43210'), '919876543210');
  assert.equal(normalizePhone('09876543210'), '919876543210');
  assert.equal(normalizePhone(''), null);
  assert.equal(normalizePhone(null), null);
});

test('Meta CAPI unit: formatUserData structures and hashes PII properly', () => {
  const formatted = formatUserData({
    name: 'Aarav Sharma',
    email: 'aarav@gmail.com',
    phone: '9876543210',
    clientIp: '::ffff:103.21.244.2',
    userAgent: 'Mozilla/5.0 Test Agent',
    fbp: 'fb.1.123456.789',
    fbc: 'fb.1.123456.testclick'
  });

  assert.ok(Array.isArray(formatted.em) && formatted.em.length === 1);
  assert.equal(formatted.em[0], sha256('aarav@gmail.com'));

  assert.ok(Array.isArray(formatted.ph) && formatted.ph.length === 1);
  assert.equal(formatted.ph[0], sha256('919876543210'));

  assert.ok(Array.isArray(formatted.fn) && formatted.fn.length === 1);
  assert.equal(formatted.fn[0], sha256('aarav'));

  assert.ok(Array.isArray(formatted.ln) && formatted.ln.length === 1);
  assert.equal(formatted.ln[0], sha256('sharma'));

  assert.equal(formatted.client_ip_address, '103.21.244.2');
  assert.equal(formatted.client_user_agent, 'Mozilla/5.0 Test Agent');
  assert.equal(formatted.fbp, 'fb.1.123456.789');
  assert.equal(formatted.fbc, 'fb.1.123456.testclick');
});

test('Meta CAPI integration: sendMetaCapiEvent skips gracefully when tokens missing', async () => {
  const origPixel = process.env.META_PIXEL_ID;
  const origToken = process.env.META_ACCESS_TOKEN;

  delete process.env.META_PIXEL_ID;
  delete process.env.META_ACCESS_TOKEN;

  const result = await sendMetaCapiEvent({
    eventName: 'Lead',
    eventId: 'test_lead_1',
    userData: { email: 'test@example.com' }
  });

  assert.equal(result.skipped, true);

  // Restore env
  if (origPixel) process.env.META_PIXEL_ID = origPixel;
  if (origToken) process.env.META_ACCESS_TOKEN = origToken;
});
