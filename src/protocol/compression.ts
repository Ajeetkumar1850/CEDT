import zlib from "zlib";
import { CompressionType } from "./compression-types";

export interface CompressedChunk {
  type: CompressionType;
  data: Buffer;
}

function gzipCompress(data: Buffer): Buffer {
  return zlib.gzipSync(data);
}

function brotliCompress(data: Buffer): Buffer {
  return zlib.brotliCompressSync(data);
}

export function compressChunkAdaptive(data: Buffer): CompressedChunk {
  const gzip = gzipCompress(data);
  const brotli = brotliCompress(data);

  let best = data;
  let type = CompressionType.NONE;

  if (gzip.length < best.length) {
    best = gzip;
    type = CompressionType.GZIP;
  }

  if (brotli.length < best.length) {
    best = brotli;
    type = CompressionType.BROTLI;
  }

  return { type, data: best };
}

export function decompressChunk(
  compressed: Buffer,
  type: CompressionType
): Buffer {
  switch (type) {
    case CompressionType.GZIP:
      return zlib.gunzipSync(compressed);
    case CompressionType.BROTLI:
      return zlib.brotliDecompressSync(compressed);
    default:
      return compressed;
  }
}
