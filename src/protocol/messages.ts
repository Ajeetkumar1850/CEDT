export enum MessageType {
  HELLO = "HELLO",
  HELLO_ACK = "HELLO_ACK",
  KEY_EXCHANGE = "KEY_EXCHANGE",
  KEY_EXCHANGE_ACK = "KEY_EXCHANGE_ACK",
  DATA = "DATA",
  ACK = "ACK",
  NACK = "NACK",
  END = "END"
}

export interface HelloMessage {
  type: MessageType.HELLO;
  protocol: string;
  version: string;
}

export interface HelloAckMessage {
  type: MessageType.HELLO_ACK;
  accepted: boolean;
  reason?: string;
}

export interface KeyExchangeMessage {
  type: MessageType.KEY_EXCHANGE;
  publicKey: string; // base64
}

export interface KeyExchangeAckMessage {
  type: MessageType.KEY_EXCHANGE_ACK;
  publicKey: string; // base64
}

export interface EncryptedDataMessage {
  type: MessageType.DATA;
  chunkIndex: number;
  compression: string;
  iv: string;
  ciphertext: string;
  authTag: string;
}

export interface AckMessage {
  type: MessageType.ACK;
  chunkIndex: number;
}

export interface NackMessage {
  type: MessageType.NACK;
  chunkIndex: number;
  reason: string;
}

export interface EndMessage {
  type: MessageType.END;
  totalChunks: number;
}
