import crypto from "crypto";
export function deriveAesKey(sharedSecret: Buffer): Buffer {
  const derivedKey = crypto.hkdfSync(
    "sha256",
    sharedSecret,
    Buffer.alloc(0),
    Buffer.from("CEDTP_AES_KEY"),
    32 // 256-bit key
  );
  return Buffer.from(derivedKey);
}
