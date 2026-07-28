import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";

export interface StorageProvider {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".local-storage");

// Swap point: implement StorageProvider against an S3-compatible bucket
// (S3/R2) and change the export below. Used for voice reminder audio,
// generated PDF reports, and consultation recordings.
const devStorageProvider: StorageProvider = {
  async put(key, data) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
  },
  async get(key) {
    return readFile(path.join(LOCAL_STORAGE_DIR, key));
  },
  async delete(key) {
    await unlink(path.join(LOCAL_STORAGE_DIR, key)).catch(() => {});
  },
};

export const storageProvider: StorageProvider = devStorageProvider;
