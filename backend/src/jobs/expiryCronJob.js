const cron = require('node-cron');
const { runExpiryMonitoring } = require('../services/expiryEngineService');

const initExpiryCronJob = () => {
  // Run daily at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron Job] Triggering daily midnight expiry check...');
    try {
      await runExpiryMonitoring();
    } catch (err) {
      console.error('[Cron Job Error]', err);
    }
  });

  console.log('[Cron Job] Expiry monitoring background cron job initialized (Schedule: Every midnight)');
};

module.exports = { initExpiryCronJob };
