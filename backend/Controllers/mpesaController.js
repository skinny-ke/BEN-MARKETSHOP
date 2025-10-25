const axios = require('axios');
const Order = require('../Models/Order');
require('dotenv').config();

// Helper to get access token (sandbox/production)
async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
  
  const baseUrl = environment === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke';
    
  const tokenUrl = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  
  try {
    const resp = await axios.get(tokenUrl, { 
      headers: { Authorization: `Basic ${auth}` },
      timeout: 10000
    });
    return resp.data.access_token;
  } catch (error) {
    console.error('M-Pesa token error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

exports.stkPush = async (req, res, next) => {
  try {
    const { amount, phone, account } = req.body;
    if (!amount || !phone) return res.status(400).json({ message: 'amount and phone required' });

    // Validate phone number format
    const phoneRegex = /^254[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format. Use 254xxxxxxxxx' });
    }

    const access = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0,14);
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;
    const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    
    const baseUrl = environment === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount), // Ensure amount is integer
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: account || 'benmarket',
      TransactionDesc: 'BenMarket Order Payment'
    };

    const resp = await axios.post(`${baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { 
        Authorization: `Bearer ${access}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Log successful STK push
    console.log(`STK Push initiated for ${phone}, amount: ${amount}, order: ${account}`);

    res.json({ 
      success: true, 
      data: resp.data,
      message: 'Payment request sent to your phone'
    });
  } catch (err) {
    console.error('STK push error', err.response ? err.response.data : err.message);
    res.status(500).json({ 
      message: 'STK push failed', 
      error: err.response?.data?.errorMessage || err.message 
    });
  }
};

// MPesa callback endpoint
exports.callback = async (req, res, next) => {
  try {
    const body = req.body;
    console.log('MPESA CALLBACK RECEIVED:', JSON.stringify(body, null, 2));
    
    // Parse the callback data
    const { Body } = body;
    if (Body && Body.stkCallback) {
      const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
      
      if (ResultCode === 0) {
        // Payment successful
        const metadata = CallbackMetadata?.Item || [];
        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;
        const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
        
        console.log('Payment successful:', {
          amount,
          mpesaReceiptNumber,
          phoneNumber,
          transactionDate
        });
        
        // Update order status
        const accountReference = Body.stkCallback.MerchantRequestID;
        if (accountReference) {
          await Order.findOneAndUpdate(
            { _id: accountReference },
            { 
              status: 'paid',
              paymentMethod: 'mpesa',
              paymentReference: mpesaReceiptNumber,
              paidAt: new Date()
            }
          );
          console.log(`Order ${accountReference} marked as paid`);
        }
      } else {
        // Payment failed
        console.log('Payment failed:', ResultDesc);
        
        // Update order status to failed
        const accountReference = Body.stkCallback.MerchantRequestID;
        if (accountReference) {
          await Order.findOneAndUpdate(
            { _id: accountReference },
            { 
              status: 'payment_failed',
              paymentError: ResultDesc
            }
          );
          console.log(`Order ${accountReference} marked as payment failed`);
        }
      }
    }
    
    res.status(200).json({ message: 'Callback received and processed' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.status(500).json({ message: 'Callback processing failed' });
  }
};
