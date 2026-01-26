import net from "net";
import { senderConfig } from "./config/sender.config";
import { encodeMessage } from "../protocol/codec";
import { MessageType, HelloMessage } from "../protocol/messages";
import { PROTOCOL_NAME, VERSION } from "../protocol/version";
import { logger } from "../shared/logger";

export function connectToReceiver() {
  const socket = new net.Socket();

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

  socket.on("data", (data) => {
    logger.info(`Receiver raw data received`);
  });

  socket.on("error", (err) => {
    logger.error(err.message);
  });
}
