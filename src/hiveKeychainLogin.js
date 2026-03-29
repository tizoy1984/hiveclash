const RPC_NODES = [
  'https://api.hive.blog',
  'https://api.openhive.network',
  'https://api.deathwing.me',
];

/**
 * Opens Hive Keychain's sign UI. requestSignBuffer must be invoked synchronously
 * in the same user-activation turn as the click — no await before this call — or
 * Chromium may suppress the extension prompt.
 */
export function loginWithHiveKeychainPostingKey(username, title = 'HiveClash — Sign in') {
  if (typeof window === 'undefined' || typeof window.hive_keychain?.requestSignBuffer !== 'function') {
    return Promise.reject(new Error('Hive Keychain is not available.'));
  }

  const message = JSON.stringify({
    app: 'hiveclash',
    ts: Date.now(),
    nonce:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  });

  return new Promise((resolve, reject) => {
    try {
      window.hive_keychain.requestSignBuffer(
        username,
        message,
        'Posting',
        async (response) => {
          try {
            if (response.error || response.success === false) {
              reject(
                new Error(
                  typeof response.error === 'string'
                    ? response.error
                    : response.message || 'Keychain request failed',
                ),
              );
              return;
            }

            const dhive = await import('@hiveio/dhive');
            const client = new dhive.Client(RPC_NODES);

            const refs = await client.keys.getKeyReferences([response.publicKey]);
            const accounts = refs?.accounts?.[0] ?? [];
            const normalized = username.toLowerCase();
            const ownsKey = accounts.some((a) => a.toLowerCase() === normalized);

            if (!ownsKey) {
              reject(new Error('The signature could not be verified for this account.'));
              return;
            }

            const signature = dhive.Signature.fromString(response.result);
            const key = dhive.PublicKey.fromString(response.publicKey);
            const digest = dhive.cryptoUtils.sha256(response.data.message);
            const ok = key.verify(digest, signature);

            if (!ok) {
              reject(new Error('The signature could not be verified.'));
              return;
            }

            resolve({ username: normalized, message });
          } catch (e) {
            reject(e);
          }
        },
        null,
        title,
      );
    } catch (e) {
      reject(e);
    }
  });
}
