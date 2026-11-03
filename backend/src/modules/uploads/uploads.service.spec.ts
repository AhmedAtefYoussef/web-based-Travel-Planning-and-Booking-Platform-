/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException } from '@nestjs/common';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { UploadedImageFile } from '../../common/contracts/uploads.contract';
import { UploadsService } from './uploads.service';

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(32),
]);
const JPG = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(32),
]);
const GIF = Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(32)]);

function file(buffer: Buffer, mimetype: string, name = 'x'): UploadedImageFile {
  return { originalname: name, mimetype, size: buffer.length, buffer };
}

describe('UploadsService', () => {
  let dir: string;
  let service: UploadsService;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uploads-'));
    service = new UploadsService({ get: () => dir } as any);
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('accepts PNG and JPG and stores them under UPLOAD_DIR', async () => {
    const out = await service.saveImages(
      [file(PNG, 'image/png'), file(JPG, 'image/jpeg')],
      { max: 5 },
    );
    expect(out).toHaveLength(2);
    expect(out[0].url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/);
    expect(out[1].url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.jpg$/);
    expect(out[0].mimetype).toBe('image/png');
    expect(fs.readdirSync(dir)).toHaveLength(2);
  });

  it('rejects GIF', async () => {
    await expect(
      service.saveImages([file(GIF, 'image/gif')], { max: 5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(fs.readdirSync(dir)).toHaveLength(0);
  });

  it('rejects a text file renamed to .png (bad magic bytes)', async () => {
    const txt = Buffer.from('hello world, not an image at all');
    await expect(
      service.saveImages([file(txt, 'image/png', 'a.png')], { max: 5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects mimetype that disagrees with content', async () => {
    await expect(
      service.saveImages([file(JPG, 'image/png')], { max: 5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects files over 5 MB and accepts exactly 5 MB', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);
    await expect(
      service.saveImages([file(big, 'image/png')], { max: 5 }),
    ).rejects.toThrow(/5 MB/);
    const ok = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024 - PNG.length)]);
    await expect(
      service.saveImages([file(ok, 'image/png')], { max: 5 }),
    ).resolves.toHaveLength(1);
  });

  it('rejects more files than max and nothing is stored', async () => {
    await expect(
      service.saveImages(
        [
          file(PNG, 'image/png'),
          file(PNG, 'image/png'),
          file(PNG, 'image/png'),
        ],
        { max: 2 },
      ),
    ).rejects.toThrow(/at most 2/);
    expect(fs.readdirSync(dir)).toHaveLength(0);
  });

  it('stores nothing when one of several files is invalid', async () => {
    await expect(
      service.saveImages([file(PNG, 'image/png'), file(GIF, 'image/gif')], {
        max: 5,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(fs.readdirSync(dir)).toHaveLength(0);
  });

  it('rejects an empty upload', async () => {
    await expect(service.saveImages([], { max: 5 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('deletes a stored image by id and ignores unknown ids', async () => {
    const [img] = await service.saveImages([file(PNG, 'image/png')], {
      max: 1,
    });
    await service.deleteImage(img.id);
    expect(fs.readdirSync(dir)).toHaveLength(0);
    await expect(service.deleteImage(img.id)).resolves.toBeUndefined();
    await expect(
      service.deleteImage('../../etc/passwd'),
    ).resolves.toBeUndefined();
  });

  it('resolves stored files and refuses traversal / unknown names', async () => {
    const [img] = await service.saveImages([file(PNG, 'image/png')], {
      max: 1,
    });
    const name = img.url.replace('/uploads/', '');
    expect(service.resolveFile(name)).toEqual({
      path: path.join(dir, name),
      mimetype: 'image/png',
    });
    expect(service.resolveFile('../secret.png')).toBeNull();
    expect(service.resolveFile('nope.png')).toBeNull();
    expect(
      service.resolveFile('00000000-0000-4000-8000-000000000000.png'),
    ).toBeNull();
  });
});
