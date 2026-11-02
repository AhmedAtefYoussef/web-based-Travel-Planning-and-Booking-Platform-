import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { promises as fsp } from 'node:fs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  SaveImagesOptions,
  StoredImage,
  UploadedImageFile,
  UploadsService as UploadsServiceContract,
} from '../../common/contracts/uploads.contract';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type Kind = 'png' | 'jpg';
const MIME: Record<Kind, string> = { png: 'image/png', jpg: 'image/jpeg' };
const FILENAME =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(png|jpg)$/;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function sniff(buf: Buffer): Kind | null {
  if (
    buf.length >= 8 &&
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return 'jpg';
  }
  return null;
}

@Injectable()
export class UploadsService implements UploadsServiceContract {
  constructor(private readonly config: ConfigService) {}

  private get dir(): string {
    return path.resolve(this.config.get<string>('UPLOAD_DIR') ?? './uploads');
  }

  async saveImages(
    files: UploadedImageFile[],
    options: SaveImagesOptions,
  ): Promise<StoredImage[]> {
    if (!files?.length) throw new BadRequestException('No file uploaded');
    if (files.length > options.max) {
      throw new BadRequestException(
        `Too many files: at most ${options.max} allowed`,
      );
    }
    // Validate everything first so a bad file stores nothing.
    const kinds = files.map((f) => this.validate(f));

    await fsp.mkdir(this.dir, { recursive: true });
    const stored: StoredImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const id = randomUUID();
      const kind = kinds[i];
      await fsp.writeFile(
        path.join(this.dir, `${id}.${kind}`),
        files[i].buffer,
      );
      stored.push({
        id,
        url: `/uploads/${id}.${kind}`,
        mimetype: MIME[kind],
        size: files[i].size,
      });
    }
    return stored;
  }

  async deleteImage(id: string): Promise<void> {
    if (!ID.test(id)) return;
    for (const ext of ['png', 'jpg']) {
      await fsp.rm(path.join(this.dir, `${id}.${ext}`), { force: true });
    }
  }

  /** Maps a public filename to a stored file, or null when unknown/invalid. */
  resolveFile(filename: string): { path: string; mimetype: string } | null {
    const m = FILENAME.exec(filename);
    if (!m) return null;
    const full = path.join(this.dir, filename);
    if (!fs.existsSync(full)) return null;
    return { path: full, mimetype: MIME[m[2] as Kind] };
  }

  private validate(file: UploadedImageFile): Kind {
    const label = file.originalname || 'file';
    if (file.size > MAX_IMAGE_BYTES || file.buffer.length > MAX_IMAGE_BYTES) {
      throw new BadRequestException(`${label} exceeds the 5 MB limit`);
    }
    const declared =
      file.mimetype === 'image/png'
        ? 'png'
        : file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'
          ? 'jpg'
          : null;
    if (!declared) {
      throw new BadRequestException(
        `${label}: only JPG and PNG images are allowed`,
      );
    }
    if (sniff(file.buffer) !== declared) {
      throw new BadRequestException(
        `${label}: file content does not match a valid ${declared.toUpperCase()} image`,
      );
    }
    return declared;
  }
}
