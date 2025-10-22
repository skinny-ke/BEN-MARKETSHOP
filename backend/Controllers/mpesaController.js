const axios = require('axios');
const Order = require('../Models/Order');
require('dotenv').config();

// Helper to get access token (sandbox/production)
async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const tokenUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const resp = await axios.get(tokenUrl, { headers: { Authorization: `Basic ${auth}` } });
  return resp.data.access_token;
}

exports.stkPush = async (req, res, next) => {
  try {
    const { amount, phone, account } = req.body;
    if (!amount || !phone) return res.status(400).json({ message: 'amount and phone required' });

    const access = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0,14);
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: account || 'benmarket',
      TransactionDesc: 'Order payment'
    };

    const resp = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
      headers: { Authorization: `Bearer ${access}` }
    });

    res.json({ success: true, data: resp.data });
  } catch (err) {
    console.error('STK push error', err.response ? err.response.data : err.message);
    res.status(500).json({ message: 'STK push failed', error: err.message });
  }
};

// MPesa callback endpoint
exports.callback = async (req, res, next) => {
  try {
    // MPesa sends nested JSON; store raw for debugging
    const body = req.body;
    console.log('MPESA CALLBACK BODY:', JSON.stringify(body).slice(0,2000));
    // Try to parse transaction result
    // TODO: adapt to actual Daraja response structure
    // For now, respond 200 to acknowledge
    res.json({ message: 'Callback received' });
  } catch (err) {
    next(err);
  }
};
