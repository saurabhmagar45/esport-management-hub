import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure 32-byte key
const KEY = crypto.createHash('sha256')
  .update(process.env.ROOM_ENCRYPTION_KEY || 'esport-hub-super-secret-encryption-key-32b')
  .digest();

/**
 * Encrypt a plaintext string using AES-256-CBC with a random IV
 * @param {string} text - Plaintext to encrypt
 * @returns {{ ciphertext: string, iv: string }}
 */
export function encryptPassword(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    ciphertext: encrypted,
    iv: iv.toString('hex')
  };
}

/**
 * Decrypt ciphertext using AES-256-CBC and given IV
 * @param {string} ciphertext - Encrypted hex string
 * @param {string} ivHex - IV in hex format
 * @returns {string} Plaintext decrypted string
 */
export function decryptPassword(ciphertext, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
