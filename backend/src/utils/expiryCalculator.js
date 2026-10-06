const dayjs = require('dayjs');

/**
 * Calculates expiry date based on purchase date and product shelf life (in days)
 */
const calculateExpiryDate = (purchaseDate, shelfLifeDays) => {
  const pDate = dayjs(purchaseDate);
  const expiryDate = pDate.add(shelfLifeDays, 'day').endOf('day');
  return expiryDate.toDate();
};

/**
 * Computes status and days remaining for an item
 */
const getExpiryStatus = (expiryDate, consumedQty = 0, discardedQty = 0, totalQty = 1) => {
  if (consumedQty + discardedQty >= totalQty && totalQty > 0) {
    if (consumedQty >= totalQty) return { status: 'CONSUMED', daysRemaining: 0 };
    return { status: 'DISCARDED', daysRemaining: 0 };
  }

  const now = dayjs();
  const exp = dayjs(expiryDate);
  const diffHours = exp.diff(now, 'hour');
  const diffDays = Math.ceil(diffHours / 24);

  let status = 'FRESH';
  if (diffHours < 0) {
    status = 'EXPIRED';
  } else if (diffDays <= 3) {
    status = 'EXPIRING_SOON';
  }

  return {
    status,
    daysRemaining: diffDays,
  };
};

module.exports = {
  calculateExpiryDate,
  getExpiryStatus,
};
