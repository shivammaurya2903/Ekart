const Razorpay = require('razorpay');

let razorpay = null;

const getRazorpay = () => {
  if (razorpay) {
    return razorpay;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for checkout.');
  }

  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  return razorpay;
};

module.exports = getRazorpay;
