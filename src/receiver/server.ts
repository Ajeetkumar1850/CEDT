import net from "net";
import { receiverConfig } from "./config/receiver.config";
import { decodeMessage, encodeMessage } from "../protocol/codec";
import { MessageType, HelloMessage, HelloAckMessage, KeyExchangeMessage, KeyExchangeAckMessage, EncryptedDataMessage, AckMessage, NackMessage } from "../protocol/messages";
import { PROTOCOL_NAME, VERSION } from "../protocol/version";
import { logger } from "../shared/logger";
import { generateKeyPair, deriveSharedSecret } from "../protocol/crypto";
import { deriveAesKey } from "../protocol/key-derivation";
import { decryptChunk } from "../protocol/aes-gcm";
import { decompressChunk } from "../protocol/compression";
import { CompressionType } from "../protocol/compression-types";
import { createChunkWriter } from "../shared/chunk-writer";
import { scanFile } from "../shared/malware-scanner";
import path from "path";
import fs from "fs";

export function startReceiverServer() {
  const server = net.createServer((socket) => {
    logger.info("Sender connected");
    const receiverKeyPair = generateKeyPair();
    let sharedSecret: Buffer | null = null;
    let expectedChunk = 0;
    let writer: fs.WriteStream | null = null;
    const tempFilePath = path.join(receiverConfig.outputDir, "temp_received_file");

    socket.on("data", async (data) => {
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

          writer = createChunkWriter(receiverConfig.outputDir, "temp_received_file");
        }

        if ((msg as any).type === MessageType.DATA && sharedSecret) {
          const dataMsg = msg as EncryptedDataMessage;

          if (dataMsg.chunkIndex !== expectedChunk) {
            const nack: NackMessage = {
              type: MessageType.NACK,
              chunkIndex: dataMsg.chunkIndex,
              reason: "Out of order chunk"
            };
            socket.write(encodeMessage(nack));
            continue;
          }

          try {
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

            if (writer) {
              writer.write(originalChunk);
            }

            logger.info(`Decrypted chunk ${dataMsg.chunkIndex}: ${originalChunk.length} bytes`);

            const ack: AckMessage = {
              type: MessageType.ACK,
              chunkIndex: dataMsg.chunkIndex
            };

            socket.write(encodeMessage(ack));
            expectedChunk++;
          } catch (err) {
            const nack: NackMessage = {
              type: MessageType.NACK,
              chunkIndex: dataMsg.chunkIndex,
              reason: "Decryption or integrity failure"
            };

            socket.write(encodeMessage(nack));
          }
        }

        if ((msg as any).type === MessageType.END) {
          logger.info(`Transfer complete. Total chunks: ${(msg as any).totalChunks}`);

          if (writer) {
            writer.end();

            writer.on("finish", async () => {
              const isClean = await scanFile(tempFilePath);

              if (!isClean) {
                logger.error("Malware detected on receiver side. File rejected.");
                fs.unlinkSync(tempFilePath);
                socket.destroy();
                return;
              }

              logger.info("File scan: CLEAN");
              const finalPath = path.join(receiverConfig.outputDir, "received_file");
              fs.renameSync(tempFilePath, finalPath);
              logger.info(`File saved: ${finalPath}`);
            });
          }
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
