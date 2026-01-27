import fs from "fs";
import { DEFAULT_CHUNK_SIZE } from "../protocol/constants";

export async function* readFileInChunks(
  filePath: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): AsyncGenerator<Buffer> {
  const stream = fs.createReadStream(filePath, {
    highWaterMark: chunkSize
  });

  for await (const chunk of stream) {
    yield chunk as Buffer;
  }
}
