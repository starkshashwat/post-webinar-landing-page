import crypto from 'crypto';

/**
 * SHA-256 hash helper for Meta Conversions API compliance
 * Meta requires data to be lowercase, trimmed, and hashed with SHA-256
 */
export function sha256(value) {
  if (!value || typeof value !== 'string') return null;
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return null;
  return crypto.createHash('sha256').update(cleaned).digest('hex');
}

/**
 * Normalize phone number for India (+91) or international E.164 (without leading plus)
 */
export function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return '91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1);
  return digits;
}

/**
 * Format user_data object adhering to Meta Conversions API specifications
 */
export function formatUserData(userData = {}) {
  const formatted = {};

  if (userData.email) {
    const hashedEmail = sha256(userData.email);
    if (hashedEmail) formatted.em = [hashedEmail];
  }

  if (userData.phone) {
    const normPh = normalizePhone(userData.phone);
    const hashedPhone = sha256(normPh);
    if (hashedPhone) formatted.ph = [hashedPhone];
  }

  if (userData.name) {
    const parts = String(userData.name).trim().split(/\s+/);
    if (parts.length > 0 && parts[0]) {
      const hashedFn = sha256(parts[0]);
      if (hashedFn) formatted.fn = [hashedFn];
    }
    if (parts.length > 1) {
      const hashedLn = sha256(parts.slice(1).join(' '));
      if (hashedLn) formatted.ln = [hashedLn];
    }
  }

  if (userData.clientIp) {
    const cleanIp = String(userData.clientIp).replace('::ffff:', '').trim();
    if (cleanIp && cleanIp !== '::1' && cleanIp !== '127.0.0.1') {
      formatted.client_ip_address = cleanIp;
    }
  }

  if (userData.userAgent) {
    formatted.client_user_agent = String(userData.userAgent).trim();
  }

  if (userData.fbp) {
    formatted.fbp = String(userData.fbp).trim();
  }

  if (userData.fbc) {
    formatted.fbc = String(userData.fbc).trim();
  }

  return formatted;
}

/**
 * Send server-side event to Meta Conversions API (Graph API)
 *
 * @param {Object} options
 * @param {string} options.eventName - e.g. 'Lead', 'Purchase'
 * @param {string} [options.eventId] - Unique event ID for deduplication with browser pixel
 * @param {string} [options.eventSourceUrl] - URL of the landing page / thank you page
 * @param {Object} [options.userData] - Raw or pre-formatted user information
 * @param {Object} [options.customData] - Additional parameters like value, currency, order_id
 * @returns {Promise<Object>}
 */
export async function sendMetaCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData = {},
  customData = {}
}) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const apiVersion = process.env.META_API_VERSION || 'v20.0';

  if (!pixelId || !accessToken) {
    return { skipped: true, reason: 'META_PIXEL_ID or META_ACCESS_TOKEN not configured' };
  }

  const userPayload = formatUserData(userData);

  const eventPayload = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: eventSourceUrl || 'https://vsl.mechanismofya.com/',
    user_data: userPayload
  };

  if (eventId) {
    eventPayload.event_id = String(eventId);
  }

  if (customData && Object.keys(customData).length > 0) {
    eventPayload.custom_data = customData;
  }

  const requestBody = {
    data: [eventPayload]
  };

  if (process.env.META_TEST_EVENT_CODE) {
    requestBody.test_event_code = process.env.META_TEST_EVENT_CODE.trim();
  }

  const endpoint = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn(`[Meta CAPI Warning] ${eventName} response status ${res.status}:`, data.error?.message || data);
      return { success: false, status: res.status, error: data.error };
    }

    console.log(`[Meta CAPI Success] ${eventName} (event_id: ${eventId || 'N/A'}) - events_received: ${data.events_received}`);
    return { success: true, data };
  } catch (error) {
    console.error(`[Meta CAPI Network Error] ${eventName}:`, error.message);
    return { success: false, error: error.message };
  }
}
