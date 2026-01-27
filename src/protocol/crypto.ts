import crypto from "crypto";

export function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("x25519");

  return {
    publicKey: publicKey.export({ format: "der", type: "spki" }).toString("base64"),
    privateKey
  };
}

export function deriveSharedSecret(
  privateKey: crypto.KeyObject,
  peerPublicKeyBase64: string
): Buffer {
  const peerPublicKey = crypto.createPublicKey({
    key: Buffer.from(peerPublicKeyBase64, "base64"),
    format: "der",
    type: "spki"
  });

  return crypto.diffieHellman({
    privateKey,
    publicKey: peerPublicKey
  });
}
