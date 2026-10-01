import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import Razorpay from 'razorpay';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup
app.use(cors());

// Raw body capture for webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Helper: GoHighLevel (GHL) Contact Sync
async function syncGHLContact({ name, email, phone, tags = [], note = '' }) {
  const locationId = process.env.GHL_LOCATION_ID || 'jsuZqhDRfnfSBFMgdfs2';
  const apiKey = process.env.GHL_API_KEY;
  const webhookUrl = process.env.GHL_WEBHOOK_URL;

  console.log(`[GHL Sync] Syncing contact: ${name} (${email || phone}) | Tags: ${tags.join(', ')}`);

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
          tags
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
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and either email or phone are required.' });
    }

    await syncGHLContact({
      name,
      email,
      phone,
      tags: ['VSL leads'],
      note: `Captured via Section 5 Auto-Popup on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
    });

    res.json({ success: true, message: 'Lead captured and synced to GHL' });
  } catch (error) {
    console.error('Error saving lead:', error);
    res.status(500).json({ error: 'Failed to process lead' });
  }
});

// -----------------------------------------------------------------------------
// API: Create Razorpay Order
// -----------------------------------------------------------------------------
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const amountInPaise = (Number(process.env.COURSE_PRICE) || 4997) * 100;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        error: 'Razorpay keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env'
      });
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        name: name || '',
        email: email || '',
        phone: phone || '',
        program: 'MOYA Complete Access'
      }
    };

    const order = await rzp.orders.create(options);
    console.log('[Razorpay Order Created]', order.id, 'Amount:', order.amount);

    res.json({
      success: true,
      order,
      keyId
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// -----------------------------------------------------------------------------
// API: Verify Successful Payment & Tag "Students" in GHL
// -----------------------------------------------------------------------------
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return res.status(500).json({ error: 'Razorpay secret not configured' });
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
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    console.log('[Razorpay Verified] Payment ID:', razorpay_payment_id);

    // Sync to GHL with "Students" tag
    await syncGHLContact({
      name,
      email,
      phone,
      tags: ['Students', 'VSL Enrolled'],
      note: `Payment Successful! Amount: ₹${process.env.COURSE_PRICE || '4,997'} | Razorpay Payment ID: ${razorpay_payment_id} | Order ID: ${razorpay_order_id}`
    });

    res.json({ success: true, redirect: '/thankyou' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal verification failure' });
  }
});

// -----------------------------------------------------------------------------
// API: Log Payment Failure & Tag "failed vsl payment" in GHL
// -----------------------------------------------------------------------------
app.post('/api/razorpay/payment-failed', async (req, res) => {
  try {
    const { orderId, paymentId, error = {}, name, email, phone } = req.body;

    console.warn(`[Payment Failed] Order: ${orderId} | Reason: ${error.description || error.reason || 'Unknown'}`);

    const failureReason = error.description || error.reason || 'Payment processing failed or dismissed by user';

    await syncGHLContact({
      name,
      email,
      phone,
      tags: ['failed vsl payment'],
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

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(req.rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('[Razorpay Webhook] Invalid webhook signature');
        return res.status(400).send('Invalid signature');
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Razorpay Webhook Received] Event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = payload?.payment?.entity;
      const notes = payment?.notes || {};

      await syncGHLContact({
        name: notes.name || payment?.contact || 'Student',
        email: notes.email || payment?.email,
        phone: notes.phone || payment?.contact,
        tags: ['Students', 'VSL Enrolled'],
        note: `Webhook Verified: ₹${(payment.amount / 100).toFixed(2)} | Razorpay ID: ${payment.id}`
      });
    } else if (event === 'payment.failed') {
      const payment = payload?.payment?.entity;
      const notes = payment?.notes || {};
      const errorDesc = payment?.error_description || payment?.error_reason || 'Bank decline';

      await syncGHLContact({
        name: notes.name || payment?.contact || 'Lead',
        email: notes.email || payment?.email,
        phone: notes.phone || payment?.contact,
        tags: ['failed vsl payment'],
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
