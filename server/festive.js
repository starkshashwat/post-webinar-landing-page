import crypto from 'node:crypto';

const weights = { 4000: 70, 3000: 20, 2000: 10 };
export function campaignFromCoupons(coupons, env = process.env, now = Date.now()) {
  const start = env.FESTIVE_START_AT ? Date.parse(env.FESTIVE_START_AT) : 0;
  const end = env.FESTIVE_END_AT ? Date.parse(env.FESTIVE_END_AT) : Infinity;
  const basePrice = Number(env.COURSE_PRICE) || 4997;
  // Later entries are explicit GHL overrides, including disabled overrides.
  const byAmount = new Map();
  for (const coupon of Object.values(coupons)) {
    if (weights[coupon.discount]) byAmount.set(coupon.discount, coupon);
  }
  const rewards = [...byAmount.values()]
    .filter(c => ['ENABLED', 'ACTIVE'].includes(c.status) && c.discount < basePrice)
    .sort((a, b) => b.discount - a.discount)
    .map(c => ({ code: c.code, discount: c.discount, weight: weights[c.discount] }));
  const total = rewards.reduce((sum, r) => sum + r.weight, 0);
  return {
    id: env.FESTIVE_CAMPAIGN_ID || 'moya-festive-2026',
    label: env.FESTIVE_LABEL || 'Festive Special',
    active: env.FESTIVE_ENABLED !== 'false' && now >= start && now < end && rewards.length > 0,
    endsAt: Number.isFinite(end) ? new Date(end).toISOString() : null,
    basePrice,
    rewards: rewards.map(r => ({ ...r, probability: r.weight / total })),
  };
}

export function chooseReward(campaign, spinId, secret) {
  const hash = crypto.createHmac('sha256', secret).update(`${campaign.id}:${spinId}`).digest();
  const sample = hash.readUInt32BE(0) / 0x100000000;
  let cumulative = 0;
  return campaign.rewards.find(r => { cumulative += r.probability; return sample < cumulative; })
    || campaign.rewards.at(-1);
}

export function mountFestiveRoutes(app, getCoupons) {
  const secret = process.env.FESTIVE_SPIN_SECRET || process.env.RAZORPAY_KEY_SECRET || crypto.randomBytes(32);
  const sign = value => crypto.createHmac('sha256', secret).update(value).digest('base64url');
  function receiptFor(campaign, spinId, reward) {
    const payload = Buffer.from(JSON.stringify({ campaignId: campaign.id, spinId, ...reward })).toString('base64url');
    return `${payload}.${sign(payload)}`;
  }
  function readReceipt(receipt) {
    if (typeof receipt !== 'string' || receipt.length > 2048) throw new Error('Invalid receipt');
    const [payload, signature] = receipt.split('.');
    const expected = sign(payload);
    if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid receipt');
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  }
  const load = async () => campaignFromCoupons(await getCoupons());
  app.get('/api/festive/campaign', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    try { res.json(await load()); }
    catch { res.status(503).json({ message: 'Offers are temporarily unavailable. Please try again.' }); }
  });
  app.post('/api/festive/spin', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const { spinId, campaignId, receipt } = req.body || {};
    if (typeof spinId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(spinId)) {
      return res.status(400).json({ message: 'Please reopen the wheel and try again.' });
    }
    try {
      const campaign = await load();
      if (!campaign.active || campaign.id !== campaignId) {
        return res.status(409).json({ message: 'This festive offer is no longer available. Please reopen the wheel.' });
      }
      let reward;
      if (receipt) {
        let saved;
        try { saved = readReceipt(receipt); }
        catch { return res.status(409).json({ message: 'This saved offer could not be verified. Please contact support.' }); }
        reward = campaign.rewards.find(r => r.code === saved.code && r.discount === saved.discount);
        if (saved.campaignId !== campaign.id || saved.spinId !== spinId || !reward) {
          return res.status(409).json({ message: 'Your saved offer is no longer available. Please contact support or continue without this offer.' });
        }
      } else reward = chooseReward(campaign, spinId, secret);
      // A retry with the same browser ID and campaign returns the same outcome.
      const result = { code: reward.code, discount: reward.discount };
      res.json({ campaign, reward: result, receipt: receiptFor(campaign, spinId, result) });
    } catch { res.status(503).json({ message: 'We couldn’t prepare your spin. Please try again.' }); }
  });
}
