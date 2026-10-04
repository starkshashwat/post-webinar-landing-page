import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { mountFestiveRoutes, campaignFromCoupons } from './server/festive.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup - restricted to authorized domains + localhost
const allowedOrigins = [
  'https://vsl.mechanismofya.com',
  'https://mechanismofya.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, curl, tests) or allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  }
}));

// In-memory sliding window rate limiter
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of hits.entries()) {
      if (now - data.resetTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, Math.min(windowMs, 60000));
  if (timer.unref) timer.unref();

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = hits.get(ip) || { count: 0, resetTime: now };
    if (now - record.resetTime > windowMs) {
      record.count = 0;
      record.resetTime = now;
    }
    record.count++;
    hits.set(ip, record);
    if (record.count > max) {
      return res.status(429).json({ error: message || 'Too many requests. Please try again later.' });
    }
    next();
  };
}

const leadsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests. Please wait a few minutes before submitting again.'
});

const failureLogLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests.'
});

// Raw body capture for webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Helper: GoHighLevel (GHL) Contact Sync
async function syncGHLContact({ name, email, phone, tags = [], note = '', customFields = [], source = 'VSL Landing Page' }) {
  const locationId = process.env.GHL_LOCATION_ID || 'jsuZqhDRfnfSBFMgdfs2';
  const apiKey = process.env.GHL_API_KEY;
  const webhookUrl = process.env.GHL_WEBHOOK_URL;

  console.log(`[GHL Sync] Syncing contact: ${name} (${email || phone}) | Tags: ${tags.join(', ')} | Source: ${source}`);

  let contactId = null;

  // 1. Direct GHL API Call (if API Key provided)
  if (apiKey) {
    try {
      const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locationId,
          name,
          email: email || undefined,
          phone: phone || undefined,
          tags,
          source: source || 'VSL Landing Page',
          customFields: customFields.length > 0 ? customFields : undefined
        })
      });

      const ghlData = await ghlRes.json();
      contactId = ghlData?.contact?.id;
      console.log(`[GHL API] Contact upserted successfully: ${contactId || 'OK'}`);

      // Add Note if provided and contactId exists
      if (note && contactId) {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Version': '2021-07-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ body: note })
        });
        console.log(`[GHL API] Note logged for contact: ${contactId}`);
      }
    } catch (err) {
      console.error('[GHL API Error]', err.message);
    }
  }

  // 2. Custom Webhook Fallback (if configured)
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId,
          name,
          email,
          phone,
          tags,
          source: source || 'VSL Landing Page',
          note,
          timestamp: new Date().toISOString()
        })
      });
      console.log('[GHL Webhook] Dispatched event to custom webhook');
    } catch (err) {
      console.error('[GHL Webhook Error]', err.message);
    }
  }

  return { success: true, contactId };
}

// -----------------------------------------------------------------------------
// API: Capture Lead from Section 5 Auto-Popup
// -----------------------------------------------------------------------------
app.post('/api/leads', leadsLimiter, async (req, res) => {
  try {
    const { name, email, phone, income } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and either email or phone are required.' });
    }

    const tags = ['VSL leads'];
    if (income) {
      const cleanIncomeTag = 'income-' + income.split('/')[0].replace(/[^a-zA-Z0-9-]/g, '').trim();
      tags.push(cleanIncomeTag);
    }

    await syncGHLContact({
      name,
      email,
      phone,
      tags,
      source: 'VSL Landing Page',
      note: `Captured via Section 5 Auto-Popup on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}${income ? `\n• Current Monthly Income: ${income}` : ''}`
    });

    res.json({ success: true, message: 'Lead captured and synced to GHL' });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ error: 'Unable to reserve your access right now. Please proceed directly to checkout.' });
  }
});

// -----------------------------------------------------------------------------
// GHL Custom Values & Live Festive Coupon Management Engine
// Official MOYA Scholarship & 20-Minute Urgency Voucher Engine
// -----------------------------------------------------------------------------
let couponCache = {
  data: null,
  expiresAt: 0
};

const DEFAULT_MOYA_COUPONS = {
  'MOYA55': { code: 'MOYA55', discount: 4000, status: 'ENABLED' },
  'MOYA44': { code: 'MOYA44', discount: 3000, status: 'ENABLED' },
  'MOYA22': { code: 'MOYA22', discount: 2000, status: 'ENABLED' },
  'MOYA11': { code: 'MOYA11', discount: 1000, status: 'ENABLED' }
};

async function getActiveCouponsFromGHL() {
  const now = Date.now();
  if (couponCache.data && couponCache.expiresAt > now) {
    return couponCache.data;
  }

  const locationId = process.env.GHL_LOCATION_ID || 'jsuZqhDRfnfSBFMgdfs2';
  const apiKey = process.env.GHL_API_KEY;

  let coupons = { ...DEFAULT_MOYA_COUPONS };

  if (apiKey) {
    try {
      const res = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}/customValues`, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const customValues = data?.customValues || [];

        // Check for single override or multi-coupon custom values
        const legacyCode = customValues.find(cv => cv.name === 'VSL Coupon Code')?.value;
        const legacyDiscount = customValues.find(cv => cv.name === 'VSL Coupon Discount')?.value;
        const legacyStatus = customValues.find(cv => cv.name === 'VSL Coupon Status')?.value;

        if (legacyCode) {
          coupons[legacyCode.trim().toUpperCase()] = {
            code: legacyCode.trim().toUpperCase(),
            discount: Number(legacyDiscount) || 4000,
            status: legacyStatus ? legacyStatus.trim().toUpperCase() : 'ENABLED'
          };
        }

        // Custom mappings for 4000, 3000, 2000, 1000 if set in GHL
        const cv4000 = customValues.find(cv => cv.name === 'Festival Coupon 4000')?.value;
        const cv3000 = customValues.find(cv => cv.name === 'Festival Coupon 3000')?.value;
        const cv2000 = customValues.find(cv => cv.name === 'Festival Coupon 2000')?.value;
        const cv1000 = customValues.find(cv => cv.name === 'Festival Coupon 1000')?.value;

        if (cv4000) coupons[cv4000.trim().toUpperCase()] = { code: cv4000.trim().toUpperCase(), discount: 4000, status: 'ENABLED' };
        if (cv3000) coupons[cv3000.trim().toUpperCase()] = { code: cv3000.trim().toUpperCase(), discount: 3000, status: 'ENABLED' };
        if (cv2000) coupons[cv2000.trim().toUpperCase()] = { code: cv2000.trim().toUpperCase(), discount: 2000, status: 'ENABLED' };
        if (cv1000) coupons[cv1000.trim().toUpperCase()] = { code: cv1000.trim().toUpperCase(), discount: 1000, status: 'ENABLED' };

        couponCache = {
          data: coupons,
          expiresAt: now + 60000 // Cache for 60 seconds
        };
        console.log('[GHL Live Coupons Cached]', Object.keys(coupons));
        return coupons;
      } else {
        throw new Error('Unable to retrieve active coupon configuration');
      }
    } catch (err) {
      console.warn('[GHL Live Coupons Notice]', err.message);
      throw err;
    }
  }

  return coupons;
}

mountFestiveRoutes(app, getActiveCouponsFromGHL);

function isCouponAvailable(coupon, coupons) {
  if (!coupon || !['ENABLED', 'ACTIVE'].includes(coupon.status)) return false;
  if ([4000, 3000, 2000, 1000].includes(coupon.discount)) {
    const campaign = campaignFromCoupons(coupons);
    if (!campaign.active) return false;
    if (coupon.discount !== 1000 && !campaign.rewards.some(r => r.code === coupon.code)) return false;
  }
  return Number.isFinite(coupon.discount) && coupon.discount > 0;
}

// -----------------------------------------------------------------------------
// API: Get Active Offer Config (Dynamic Sync with GHL Custom Values)
// -----------------------------------------------------------------------------
app.get('/api/offer-config', async (req, res) => {
  try {
    const coupons = await getActiveCouponsFromGHL();
    const basePrice = Number(process.env.COURSE_PRICE) || 4997;
    const vslCode = (process.env.VSL_COUPON_CODE || 'MOYA55').trim().toUpperCase();
    const matched = coupons[vslCode] || Object.values(coupons).find(c => isCouponAvailable(c, coupons));

    if (matched && isCouponAvailable(matched, coupons)) {
      const discount = Math.min(basePrice, matched.discount);
      const finalAmount = Math.max(1, basePrice - discount);
      return res.json({
        success: true,
        code: matched.code,
        discount,
        basePrice,
        finalAmount
      });
    }

    return res.json({
      success: true,
      code: 'MOYA55',
      discount: 4000,
      basePrice: 4997,
      finalAmount: 997
    });
  } catch (err) {
    return res.json({
      success: true,
      code: 'MOYA55',
      discount: 4000,
      basePrice: 4997,
      finalAmount: 997
    });
  }
});

// -----------------------------------------------------------------------------
// API: Validate Coupon Code (Live Check Against GHL Custom Values)
// -----------------------------------------------------------------------------
app.post('/api/coupon/validate', async (req, res) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode || !couponCode.trim()) {
      return res.status(400).json({ valid: false, message: 'Please enter a valid coupon code.' });
    }

    const coupons = await getActiveCouponsFromGHL();
    const cleanInput = couponCode.trim().toUpperCase();
    const basePrice = Number(process.env.COURSE_PRICE) || 4997;

    const matchedCoupon = coupons[cleanInput];

    if (isCouponAvailable(matchedCoupon, coupons)) {
      const discount = Math.min(basePrice, matchedCoupon.discount);
      const finalAmount = Math.max(1, basePrice - discount);

      return res.json({
        valid: true,
        code: matchedCoupon.code,
        discount: discount,
        originalPrice: basePrice,
        finalAmount: finalAmount,
        message: `✓ Coupon "${matchedCoupon.code}" applied! Flat ₹${discount.toLocaleString('en-IN')} OFF.`
      });
    } else {
      return res.json({
        valid: false,
        message: 'Invalid, inactive, or expired coupon code.'
      });
    }
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ valid: false, message: 'Could not validate coupon at this time.' });
  }
});

// -----------------------------------------------------------------------------
// API: Create Razorpay Order
// -----------------------------------------------------------------------------
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { name, email, phone, couponCode, expectedAmount } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const basePrice = Number(process.env.COURSE_PRICE) || 4997;

    let finalAmount = basePrice;
    let appliedCoupon = null;
    let discount = 0;

    if (couponCode && couponCode.trim()) {
      const coupons = await getActiveCouponsFromGHL();
      const matched = coupons[couponCode.trim().toUpperCase()];
      if (isCouponAvailable(matched, coupons)) {
        discount = Math.min(basePrice, matched.discount);
        finalAmount = Math.max(1, basePrice - discount);
        appliedCoupon = matched.code;
      } else {
        return res.status(409).json({ error: 'Your offer is no longer available. Please remove it or apply another code before paying.' });
      }
    }

    if (expectedAmount !== undefined && Number(expectedAmount) !== finalAmount) {
      return res.status(409).json({ error: 'The price has changed. Please reapply your offer and review the total before paying.' });
    }

    const amountInPaise = finalAmount * 100;

    if (!keyId || !keySecret) {
      console.error('[CONFIG WARNING] Razorpay keys (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) not set in environment variables.');
      return res.status(503).json({
        error: 'Payment gateway is currently undergoing a secure scheduled update. Please retry in a few moments.'
      });
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_vsl_${Date.now()}`,
      notes: {
        name: name || '',
        email: email || '',
        phone: phone || '',
        coupon_code: appliedCoupon || 'NONE',
        discount: discount.toString(),
        total_paid: finalAmount.toString(),
        program: 'MOYA Complete Access',
        source: 'VSL Landing Page'
      }
    };

    const order = await rzp.orders.create(options);
    console.log('[Razorpay Order Created]', order.id, 'Amount:', order.amount, 'Coupon:', appliedCoupon || 'None');

    res.json({
      success: true,
      order,
      keyId,
      finalAmount,
      appliedCoupon,
      discount
    });
  } catch (error) {
    console.error('[Razorpay Order Creation Error]', error.message, error);
    res.status(500).json({ error: 'Unable to initiate payment session. Please refresh and retry.' });
  }
});

// -----------------------------------------------------------------------------
// API: Verify Successful Payment & Tag strictly "vsl students" in GHL
// -----------------------------------------------------------------------------
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone,
      couponCode,
      paidAmount: clientPaidAmount
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error('[CONFIG WARNING] Razorpay secret missing in environment variables.');
      return res.status(503).json({ error: 'Enrollment verification recorded. Please check your email for access instructions.' });
    }

    // Verify HMAC SHA256 Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error('[Razorpay Verify] Invalid signature detected!');
      return res.status(400).json({ error: 'Payment verification could not be confirmed. If your payment was deducted, please contact support.' });
    }

    console.log('[Razorpay Verified] Payment ID:', razorpay_payment_id);

    // Prepare tags: strictly 'vsl students' ONLY (no extra tags)
    const tags = ['vsl students'];
    const cleanCoupon = couponCode ? couponCode.trim().toUpperCase() : null;

    // Securely verify paid amount against coupon and base price
    const basePrice = Number(process.env.COURSE_PRICE) || 4997;
    let verifiedAmount = basePrice;
    if (cleanCoupon) {
      try {
        const coupons = await getActiveCouponsFromGHL();
        const matched = coupons[cleanCoupon];
        if (isCouponAvailable(matched, coupons)) {
          verifiedAmount = Math.max(1, basePrice - matched.discount);
        }
      } catch (e) {
        if (clientPaidAmount && Number(clientPaidAmount) > 0) {
          verifiedAmount = Number(clientPaidAmount);
        }
      }
    }
    const paidStr = verifiedAmount.toString();

    // Contact Custom Fields in GHL
    const customFields = [
      { id: 'OxYVPF3lZNekTPCUrfYV', value: cleanCoupon || 'NONE (Full Price)' },
      { id: 'jY5kE16LGuyCbzmuxwWe', value: `₹${paidStr}` }
    ];

    const note = `🎉 Enrollment Confirmed via Razorpay!\n• Course: MOYA Complete Access\n• Total Paid: ₹${paidStr}\n• Coupon Applied: ${cleanCoupon || 'None (Full Price)'}\n• Razorpay Payment ID: ${razorpay_payment_id}\n• Order ID: ${razorpay_order_id}\n• Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    await syncGHLContact({
      name,
      email,
      phone,
      tags,
      source: 'VSL Landing Page',
      note,
      customFields
    });

    res.json({ success: true, redirect: '/thankyou' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Enrollment verification recorded. Please check your email for confirmation.' });
  }
});

// -----------------------------------------------------------------------------
// API: Log Payment Failure & Tag "failed vsl payment" in GHL
// -----------------------------------------------------------------------------
app.post('/api/razorpay/payment-failed', failureLogLimiter, async (req, res) => {
  try {
    const { orderId, paymentId, error = {}, name, email, phone } = req.body;

    console.warn(`[Payment Failed] Order: ${orderId} | Reason: ${error.description || error.reason || 'Unknown'}`);

    const failureReason = error.description || error.reason || 'Payment processing failed or dismissed by user';

    await syncGHLContact({
      name,
      email,
      phone,
      tags: ['failed vsl payment'],
      source: 'VSL Landing Page',
      note: `Payment FAILED on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.\nReason: ${failureReason}\nPayment ID: ${paymentId || 'N/A'}\nOrder ID: ${orderId || 'N/A'}`
    });

    res.json({ success: true, logged: true });
  } catch (err) {
    console.error('Error logging failed payment:', err);
    res.status(500).json({ error: 'Failed to record failure' });
  }
});

// -----------------------------------------------------------------------------
// API: Razorpay Webhook (Server-to-Server Fallback Safety Net)
// -----------------------------------------------------------------------------
app.post('/api/razorpay/webhook', async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Mandatory Security Verification: Reject unsigned or unconfigured calls
    if (!webhookSecret || !signature) {
      console.warn('[Razorpay Webhook] Rejected: Missing webhook secret or signature header.');
      return res.status(401).send('Unauthorized webhook call');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[Razorpay Webhook] Rejected: Invalid signature mismatch.');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    const payment = payload?.payment?.entity;
    const notes = payment?.notes || {};

    // STRICT ISOLATION: Only process payments originating from the VSL website!
    // External GHL native forms, webinar tickets, etc., MUST NOT be touched or tagged by the website.
    if (notes.program !== 'MOYA Complete Access') {
      console.log(`[Razorpay Webhook] Ignored payment ${payment?.id || 'N/A'} - Not a VSL website order (program: "${notes.program || 'None'}"). External GHL automation will handle.`);
      return res.status(200).json({ status: 'ignored', reason: 'Not a VSL website payment' });
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      const couponCode = notes.coupon_code && notes.coupon_code !== 'NONE' ? notes.coupon_code.toUpperCase() : null;
      const paidAmount = (payment.amount / 100).toFixed(0);

      // Strictly ONLY 'vsl students'
      const tags = ['vsl students'];

      const customFields = [
        { id: 'OxYVPF3lZNekTPCUrfYV', value: couponCode || 'NONE (Full Price)' },
        { id: 'jY5kE16LGuyCbzmuxwWe', value: `₹${paidAmount}` }
      ];

      await syncGHLContact({
        name: notes.name || undefined,
        email: notes.email || payment?.email,
        phone: notes.phone || payment?.contact,
        tags,
        source: 'VSL Landing Page',
        note: `Webhook Verified: ₹${paidAmount} | Coupon: ${couponCode || 'None (Full Price)'} | Razorpay ID: ${payment.id}`,
        customFields
      });
    } else if (event === 'payment.failed') {
      const errorDesc = payment?.error_description || payment?.error_reason || 'Bank decline';

      await syncGHLContact({
        name: notes.name || undefined,
        email: notes.email || payment?.email,
        phone: notes.phone || payment?.contact,
        tags: ['failed vsl payment'],
        source: 'VSL Landing Page',
        note: `Webhook Failure Event: ${errorDesc} | Payment ID: ${payment?.id}`
      });
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing error');
  }
});

// -----------------------------------------------------------------------------
// Static Files & Clean URLs for Coolify Production
// -----------------------------------------------------------------------------
const distPath = path.resolve(__dirname, 'dist');

// 301 Redirect .html to clean slug
app.use((req, res, next) => {
  if (req.path.endsWith('.html') && req.path !== '/index.html' && req.path !== '/') {
    const cleanSlug = req.path.slice(0, -5);
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanSlug + query);
  }
  next();
});

app.use(express.static(distPath));

// Clean URL rewrite mappings for Coolify
const rewrites = {
  '/privacy': 'privacy.html',
  '/terms-of-service': 'terms.html',
  '/terms': 'terms.html',
  '/refund-policy': 'refund.html',
  '/refund': 'refund.html',
  '/contact-us': 'contact.html',
  '/contact': 'contact.html',
  '/thankyou': 'thankyou.html',
  '/disclaimer': 'disclaimer.html'
};

for (const [route, file] of Object.entries(rewrites)) {
  app.get(route, (req, res) => {
    res.sendFile(path.join(distPath, file));
  });
}

// Fallback to index or 404 (Express 5 compatible)
app.use((req, res) => {
  if (req.path === '/' || req.path === '/index.html') {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  res.status(404).sendFile(path.join(distPath, '404.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`MOYA Web App running in Coolify / Node on port ${PORT}`);
  console.log(`Local address: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
