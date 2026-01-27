import fs from "fs";
import path from "path";

export function createChunkWriter(
  outputDir: string,
  fileName: string
) {
  fs.mkdirSync(outputDir, { recursive: true });

  const filePath = path.join(outputDir, fileName);
  return fs.createWriteStream(filePath);
}
