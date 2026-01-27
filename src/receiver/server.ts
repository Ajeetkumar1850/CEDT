import net from "net";
import { receiverConfig } from "./config/receiver.config";
import { decodeMessage, encodeMessage } from "../protocol/codec";
import { MessageType, HelloMessage, HelloAckMessage, KeyExchangeMessage, KeyExchangeAckMessage, EncryptedDataMessage } from "../protocol/messages";
import { PROTOCOL_NAME, VERSION } from "../protocol/version";
import { logger } from "../shared/logger";
import { generateKeyPair, deriveSharedSecret } from "../protocol/crypto";
import { deriveAesKey } from "../protocol/key-derivation";
import { decryptChunk } from "../protocol/aes-gcm";
import { decompressChunk } from "../protocol/compression";
import { CompressionType } from "../protocol/compression-types";

export function startReceiverServer() {
  const server = net.createServer((socket) => {
    logger.info("Sender connected");
    const receiverKeyPair = generateKeyPair();
    let sharedSecret: Buffer | null = null;

    socket.on("data", (data) => {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const messages = decodeMessage(buffer);

      for (const msg of messages) {
        if ((msg as any).type === MessageType.HELLO) {
          const hello = msg as HelloMessage;

          logger.info(
            `HELLO received: ${hello.protocol} v${hello.version}`
          );

          const accepted =
            hello.protocol === PROTOCOL_NAME &&
            hello.version === VERSION;

          const ack: HelloAckMessage = {
            type: MessageType.HELLO_ACK,
            accepted,
            reason: accepted ? undefined : "Protocol mismatch"
          };

          socket.write(encodeMessage(ack));
        }

        if ((msg as any).type === MessageType.KEY_EXCHANGE) {
          const ke = msg as KeyExchangeMessage;

          sharedSecret = deriveSharedSecret(
            receiverKeyPair.privateKey,
            ke.publicKey
          );

          logger.info(`Shared secret established (receiver): ${sharedSecret.length} bytes`);

          const ack: KeyExchangeAckMessage = {
            type: MessageType.KEY_EXCHANGE_ACK,
            publicKey: receiverKeyPair.publicKey
          };

          socket.write(encodeMessage(ack));
        }

        if ((msg as any).type === MessageType.DATA && sharedSecret) {
          const dataMsg = msg as EncryptedDataMessage;
          const aesKey = deriveAesKey(sharedSecret);

          const decrypted = decryptChunk(
            {
              iv: Buffer.from(dataMsg.iv, "base64"),
              ciphertext: Buffer.from(dataMsg.ciphertext, "base64"),
              authTag: Buffer.from(dataMsg.authTag, "base64")
            },
            aesKey
          );

          const originalChunk = decompressChunk(
            decrypted,
            dataMsg.compression as CompressionType
          );

          logger.info(`Decrypted data: ${originalChunk.toString()}`);
        }
      }
    });

    socket.on("error", (err) => {
      logger.error(err.message);
    });
  });

  server.listen(receiverConfig.listenPort, () => {
    logger.info(`Receiver listening on ${receiverConfig.listenPort}`);
  });
}
