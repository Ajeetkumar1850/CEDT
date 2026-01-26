import net from "net";
import { receiverConfig } from "./config/receiver.config";
import { decodeMessage, encodeMessage } from "../protocol/codec";
import { MessageType, HelloMessage, HelloAckMessage } from "../protocol/messages";
import { PROTOCOL_NAME, VERSION } from "../protocol/version";
import { logger } from "../shared/logger";

export function startReceiverServer() {
  const server = net.createServer((socket) => {
    logger.info("Sender connected");

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
            type: MessageType.HELLO_ACk,
            accepted,
            reason: accepted ? undefined : "Protocol mismatch"
          };

          socket.write(encodeMessage(ack));
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
