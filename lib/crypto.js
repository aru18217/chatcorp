// AES-256-CBC helpers.
// The key comes from the server environment (ENCRYPTION_KEY, 64 hex chars = 32 bytes)
// and is never stored next to the data. Each message gets its own random IV.
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';

function getKey() {
  const hex = process.env.ENCRYPTION_KEY || '';
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes). Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  return Buffer.from(hex, 'hex');
}

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
}

// legacyKey: messages saved by the old version stored a random key per message.
// They can still be read so existing chat history is not lost.
function decrypt(encryptedData, iv, legacyKey) {
  const key = legacyKey ? Buffer.from(legacyKey, 'hex') : getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function safeDecrypt(encryptedData, iv, legacyKey) {
  if (!encryptedData || !iv) return encryptedData;
  try {
    return decrypt(encryptedData, iv, legacyKey);
  } catch (e) {
    console.error('Failed to decrypt value:', e.message);
    return null;
  }
}

module.exports = { encrypt, decrypt, safeDecrypt, ALGORITHM };
