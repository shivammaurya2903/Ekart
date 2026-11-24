const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User');

let job = null;
let transporter = null;

const isEnabled = (value) => String(value || '').toLowerCase() === 'true';

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;

  if (!host) {
    throw new Error('SMTP_HOST is required to send price alert emails');
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if ((user && !pass) || (!user && pass)) {
    throw new Error('SMTP_USER and SMTP_PASS must be configured together');
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: isEnabled(process.env.SMTP_SECURE),
    ...(user ? { auth: { user, pass } } : {}),
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  });

  return transporter;
};

const escapeHtml = (value) => String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));

const formatINR = (value) => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
};

const buildAlertMessage = (userName, matches) => {
  const subject = matches.length === 1
    ? `Price drop alert: ${matches[0].name}`
    : `Price drop alerts: ${matches.length} products on your EKart list`;

  const textLines = [
    `Hi ${userName},`,
    '',
    'Good news! The price of a product you are tracking has reached your target price.',
    '',
    ...matches.map((match) => [
      `${match.name}`,
      `Current price: ${formatINR(match.currentPrice)}`,
      `Your target: ${formatINR(match.targetPrice)}`,
      ''
    ].join('\n')),
    'Visit EKart to complete your purchase before the price changes.',
    '',
    'Happy shopping,',
    'The EKart Team'
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#212121">
      <h2 style="color:#2874f0">EKart Price Drop Alert</h2>
      <p>Hi ${escapeHtml(userName)},</p>
      <p>Good news! The price of a product you are tracking has reached your target price.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <thead>
          <tr style="background:#f4f6f8">
            <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd">Product</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd">Current price</th>
            <th style="text-align:left;padding:10px;border-bottom:1px solid #ddd">Your target</th>
          </tr>
        </thead>
        <tbody>
          ${matches.map((match) => `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eee">${escapeHtml(match.name)}</td>
              <td style="padding:10px;border-bottom:1px solid #eee;color:#388e3c;font-weight:bold">${formatINR(match.currentPrice)}</td>
              <td style="padding:10px;border-bottom:1px solid #eee">${formatINR(match.targetPrice)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p>Visit EKart to complete your purchase before the price changes.</p>
      <p>Happy shopping,<br/><strong>The EKart Team</strong></p>
    </div>
  `;

  return {
    subject,
    text: textLines.join('\n'),
    html
  };
};

const processPriceAlerts = async () => {
  const mailer = getTransporter();
  const from = process.env.MAIL_FROM || 'EKart <no-reply@ekart.local>';
  const users = await User.find({ 'priceAlerts.notified': false })
    .populate({
      path: 'priceAlerts.productId',
      select: 'name currentPrice mrp'
    })
    .lean()
    .exec();

  let emailsSent = 0;
  let alertsMarked = 0;

  for (const user of users) {
    const matches = [];

    for (const alert of user.priceAlerts || []) {
      if (alert.notified) {
        continue;
      }

      const product = alert.productId;

      if (!product || typeof product !== 'object' || product.currentPrice === undefined) {
        continue;
      }

      const currentPrice = Number(product.currentPrice);
      const targetPrice = Number(alert.targetPrice);

      if (!Number.isFinite(currentPrice) || !Number.isFinite(targetPrice)) {
        continue;
      }

      if (currentPrice <= targetPrice) {
        matches.push({
          alertId: alert._id,
          name: product.name || 'Product',
          currentPrice,
          targetPrice,
          mrp: Number(product.mrp) || currentPrice
        });
      }
    }

    if (matches.length === 0) {
      continue;
    }

    const message = buildAlertMessage(user.name, matches);

    await mailer.sendMail({
      from,
      to: user.email,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    const alertIds = matches.map((match) => match.alertId).filter(Boolean);

    if (alertIds.length > 0) {
      const updateResult = await User.updateOne(
        {
          _id: user._id,
          'priceAlerts._id': { $in: alertIds },
          'priceAlerts.notified': false
        },
        {
          $set: { 'priceAlerts.$[alert].notified': true }
        },
        {
          arrayFilters: [
            {
              'alert._id': { $in: alertIds },
              'alert.notified': false
            }
          ]
        }
      ).exec();

      alertsMarked += updateResult.modifiedCount || 0;
    }

    emailsSent += 1;
  }

  return {
    usersChecked: users.length,
    emailsSent,
    alertsMarked
  };
};

const startPriceAlertWorker = () => {
  if (job) {
    return job;
  }

  const expression = process.env.PRICE_ALERT_CRON || '0 * * * *';

  if (!cron.validate(expression)) {
    throw new Error(`Invalid PRICE_ALERT_CRON expression: ${expression}`);
  }

  job = cron.schedule(expression, async () => {
    try {
      const result = await processPriceAlerts();

      if (result.emailsSent > 0) {
        console.log(`[price-alerts] Sent ${result.emailsSent} email(s) for ${result.alertsMarked} alert(s).`);
      }
    } catch (error) {
      console.error(`[price-alerts] Worker failed: ${error.message}`);
    }
  });

  return job;
};

const stopPriceAlertWorker = () => {
  if (job) {
    job.stop();
    job = null;
  }
};

module.exports = {
  processPriceAlerts,
  startPriceAlertWorker,
  stopPriceAlertWorker
};
