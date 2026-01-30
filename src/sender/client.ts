import net from "net";
import { readFileInChunks } from "../shared/chunk-reader";

import { senderConfig } from "./config/sender.config";
import { PROTOCOL_NAME, VERSION } from "../protocol/version";
import { logger } from "../shared/logger";
import { generateKeyPair, deriveSharedSecret } from "../protocol/crypto";
import { MessageType, KeyExchangeMessage, HelloMessage } from "../protocol/messages";
import { encodeMessage, decodeMessage } from "../protocol/codec";
import { deriveAesKey } from "../protocol/key-derivation";
import { encryptChunk } from "../protocol/aes-gcm";
import { compressChunkAdaptive } from "../protocol/compression";
import { scanFile } from "../shared/malware-scanner";



export function connectToReceiver() {
  const socket = new net.Socket();
  const keyPair = generateKeyPair();
  const pendingChunks = new Map<number, Buffer>();

  socket.connect(
    senderConfig.targetPort,
    senderConfig.targetHost,
    () => {
      logger.info("Connected to receiver");

      const hello: HelloMessage = {
        type: MessageType.HELLO,
        protocol: PROTOCOL_NAME,
        version: VERSION
      };

      socket.write(encodeMessage(hello));
    }
  );

  socket.on("data", async (data) => {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const messages = decodeMessage(buffer);

    for (const msg of messages) {
      if ((msg as any).type === MessageType.HELLO_ACK && (msg as any).accepted) {
        const keyExchange: KeyExchangeMessage = {
          type: MessageType.KEY_EXCHANGE,
          publicKey: keyPair.publicKey
        };

        socket.write(encodeMessage(keyExchange));
      }

      if ((msg as any).type === MessageType.KEY_EXCHANGE_ACK) {
        const sharedSecret = deriveSharedSecret(
          keyPair.privateKey,
          (msg as any).publicKey
        );

        logger.info(`Shared secret established (sender): ${sharedSecret.length} bytes`);

        const aesKey = deriveAesKey(sharedSecret);

        const filePath = "./test-data/sample.txt";

        const isClean = await scanFile(filePath);

        if (!isClean) {
          logger.error("Malware detected. Transfer aborted.");
          socket.destroy();
          return;
        }

        logger.info("File scan: CLEAN");

        let chunkIndex = 0;

        for await (const chunk of readFileInChunks(filePath)) {
          const compressed = compressChunkAdaptive(chunk);

          logger.info(
            `Chunk ${chunkIndex}: ${chunk.length} → ${compressed.data.length} (${compressed.type})`
          );

          const encrypted = encryptChunk(
            compressed.data,
            aesKey
          );

          const encodedMessage = encodeMessage({
            type: MessageType.DATA,
            chunkIndex,
            compression: compressed.type,
            iv: encrypted.iv.toString("base64"),
            ciphertext: encrypted.ciphertext.toString("base64"),
            authTag: encrypted.authTag.toString("base64")
          });

          pendingChunks.set(chunkIndex, encodedMessage);
          socket.write(encodedMessage);

          chunkIndex++;
        }

        socket.write(
          encodeMessage({
            type: MessageType.END,
            totalChunks: chunkIndex
          })
        );
      }

      if ((msg as any).type === MessageType.ACK) {
        pendingChunks.delete((msg as any).chunkIndex);
        logger.info(`ACK received for chunk ${(msg as any).chunkIndex}`);
      }

      if ((msg as any).type === MessageType.NACK) {
        const chunk = pendingChunks.get((msg as any).chunkIndex);
        if (chunk) {
          socket.write(chunk);
          logger.info(`Resent chunk ${(msg as any).chunkIndex}`);
        }
      }
    }
  });

  socket.on("error", (err) => {
    logger.error(err.message);
  });
}
