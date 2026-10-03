import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { campaignFromCoupons, chooseReward, mountFestiveRoutes } from '../server/festive.js';

const coupons = Object.fromEntries([4000, 3000, 2000, 1000].map(discount => [`C${discount}`, { code: `C${discount}`, discount, status: 'ENABLED' }]));
test('only genuine, affordable rewards are advertised with normalized odds', () => {
  const campaign = campaignFromCoupons(coupons, {});
  assert.deepEqual(campaign.rewards.map(r => [r.discount, r.probability]), [[4000, .7], [3000, .2], [2000, .1]]);
  const lowerPrice = campaignFromCoupons(coupons, { COURSE_PRICE: '3000' });
  assert.deepEqual(lowerPrice.rewards.map(r => r.discount), [2000]);
  assert.equal(lowerPrice.rewards[0].probability, 1);
});
test('campaign dates, disabled campaigns and invalid dates fail closed', () => {
  for (const env of [{ FESTIVE_ENABLED: 'false' }, { FESTIVE_END_AT: '2020-01-01' }, { FESTIVE_START_AT: '2099-01-01' }, { FESTIVE_END_AT: 'bad' }]) {
    assert.equal(campaignFromCoupons(coupons, env).active, false);
  }
});
test('GHL overrides replace defaults, including explicitly disabled rewards', () => {
  const changed = { ...coupons, CUSTOM: { code: 'CUSTOM', discount: 4000, status: 'DISABLED' } };
  const campaign = campaignFromCoupons(changed, {});
  assert.deepEqual(campaign.rewards.map(r => r.discount), [3000, 2000]);
  assert.equal(campaign.rewards.reduce((s, r) => s + r.probability, 0), 1);
});
test('retries are deterministic and configured reward distribution is respected', () => {
  const campaign = campaignFromCoupons(coupons, {});
  const counts = { 4000: 0, 3000: 0, 2000: 0 };
  for (let i = 0; i < 10000; i++) counts[chooseReward(campaign, `browser-${i}`, 'test-secret').discount]++;
  for (const [discount, expected] of [[4000, 7000], [3000, 2000], [2000, 1000]]) assert.ok(Math.abs(counts[discount] - expected) < 200);
  assert.deepEqual(chooseReward(campaign, 'same-browser', 'test-secret'), chooseReward(campaign, 'same-browser', 'test-secret'));
});
test('API preserves signed rewards and rejects tampering, retired rewards and invalid requests', async () => {
  const app = express();
  app.use(express.json());
  let available = structuredClone(coupons);
  mountFestiveRoutes(app, async () => available);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = body => fetch(`${url}/api/festive/spin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const campaign = await (await fetch(`${url}/api/festive/campaign`)).json();
    const request = { spinId: 'test-browser-123456789', campaignId: campaign.id };
    const first = await (await post(request)).json();
    assert.ok(first.receipt);
    const again = await (await post(request)).json();
    assert.deepEqual(first.reward, again.reward);
    const restored = await (await post({ ...request, receipt: first.receipt })).json();
    assert.deepEqual(restored.reward, first.reward);
    assert.equal((await post({ ...request, receipt: first.receipt + 'bad' })).status, 409);
    assert.equal((await post({ ...request, spinId: 'bad' })).status, 400);
    assert.equal((await post({ ...request, campaignId: 'old-campaign' })).status, 409);
    available[first.reward.code].status = 'DISABLED';
    assert.equal((await post({ ...request, receipt: first.receipt })).status, 409);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('API surfaces unavailable coupon provider instead of inventing an offer', async () => {
  const app = express();
  mountFestiveRoutes(app, async () => { throw new Error('offline'); });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try { assert.equal((await fetch(`http://127.0.0.1:${server.address().port}/api/festive/campaign`)).status, 503); }
  finally { await new Promise(resolve => server.close(resolve)); }
});
