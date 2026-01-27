import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM
const AUTH_TAG_LENGTH = 16;

export interface EncryptedChunk {
  iv: Buffer;
  ciphertext: Buffer;
  authTag: Buffer;
}

export function encryptChunk(
  plaintext: Buffer,
  key: Buffer
): EncryptedChunk {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return { iv, ciphertext, authTag };
}

export function decryptChunk(
  encrypted: EncryptedChunk,
  key: Buffer
): Buffer {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    encrypted.iv
  );

  decipher.setAuthTag(encrypted.authTag);

  return Buffer.concat([
    decipher.update(encrypted.ciphertext),
    decipher.final()
  ]);
}
