import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY env var not set");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  return buf;
}

/**
 * Encrypt plaintext with AES-256-GCM
 * Returns { ciphertext, iv } both base64-encoded (with auth tag appended to ciphertext)
 */
export function encrypt(plaintext: string): { ciphertext: string; iv: string } {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16 bytes

  // Append auth tag to ciphertext for storage
  const ciphertextWithTag = Buffer.concat([encrypted, authTag]);

  return {
    ciphertext: ciphertextWithTag.toString("base64"),
    iv: iv.toString("base64"),
  };
}

/**
 * Decrypt AES-256-GCM ciphertext (with auth tag appended)
 */
export function decrypt(ciphertext: string, iv: string): string {
  const key = getEncryptionKey();
  const ivBuf = Buffer.from(iv, "base64");
  const ciphertextBuf = Buffer.from(ciphertext, "base64");

  // Last 16 bytes are auth tag
  const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);
  const encrypted = ciphertextBuf.subarray(0, ciphertextBuf.length - 16);

  const decipher = createDecipheriv(ALGORITHM, key, ivBuf);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
