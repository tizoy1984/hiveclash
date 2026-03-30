/** HiveClash prize escrow / bank account (receives stakes; pays winners.) */
export const HIVE_BANK_ACCOUNT = 'cbrs';

function keychainAccountName(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/^@+/, '');
}

/**
 * Sends HIVE to the bank via Keychain. Call synchronously from a click handler
 * (no await before this) so the extension can show its approval UI.
 *
 * Signature matches Hive Keychain docs: account, to, amount (3 decimals), memo,
 * currency, callback, enforce. Do not pass a trailing `null` for rpc unless you
 * supply a real rpc string — extra null caused "Cannot read properties of undefined (reading '0')".
 */
export function stakePrizeToBank({ fromUsername, amountFixed3, memo }) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.hive_keychain?.requestTransfer) {
      reject(new Error('Hive Keychain is not available.'));
      return;
    }
    const username = keychainAccountName(fromUsername);
    if (!username) {
      reject(new Error('Missing Hive username for transfer.'));
      return;
    }
    const amount = String(amountFixed3 ?? '').trim();
    const memoStr = String(memo ?? '');
    try {
      window.hive_keychain.requestTransfer(
        username,
        HIVE_BANK_ACCOUNT,
        amount,
        memoStr,
        'HIVE',
        (response) => {
          if (!response || response.error || response.success === false) {
            reject(
              new Error(
                typeof response?.error === 'string'
                  ? response.error
                  : response?.message || 'Transfer was cancelled or failed.',
              ),
            );
            return;
          }
          resolve(response);
        },
        true,
      );
    } catch (e) {
      reject(e);
    }
  });
}
