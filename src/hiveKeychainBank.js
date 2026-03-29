/** HiveClash prize escrow / bank account (receives stakes; pays winners.) */
export const HIVE_BANK_ACCOUNT = 'cbrs';

/**
 * Sends HIVE to the bank via Keychain. Call synchronously from a click handler
 * (no await before this) so the extension can show its approval UI.
 */
export function stakePrizeToBank({ fromUsername, amountFixed3, memo }) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.hive_keychain?.requestTransfer) {
      reject(new Error('Hive Keychain is not available.'));
      return;
    }
    try {
      window.hive_keychain.requestTransfer(
        fromUsername,
        HIVE_BANK_ACCOUNT,
        amountFixed3,
        memo,
        'HIVE',
        (response) => {
          if (response.error || response.success === false) {
            reject(
              new Error(
                typeof response.error === 'string'
                  ? response.error
                  : response.message || 'Transfer was cancelled or failed.',
              ),
            );
            return;
          }
          resolve(response);
        },
        true,
        null,
      );
    } catch (e) {
      reject(e);
    }
  });
}
