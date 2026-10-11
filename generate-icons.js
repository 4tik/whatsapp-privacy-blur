/**
 * @file generate-icons.js
 * @description Standalone zero-dependency Node.js script to generate standard PNG icons
 * for Chrome Extension Manifest V3 packaging.
 *
 * Implements a pure JavaScript PNG chunk encoder (IHDR, IDAT with zlib deflate, and IEND
 * with CRC32 checksums) so contributors can build icons without heavy native dependencies
 * like node-canvas or sharp.
 */

import fs from 'fs';
import zlib from 'zlib';

/**
 * Creates a raw PNG binary Buffer from a custom pixel rasterization callback.
 *
 * @param {number} width - Output image width in pixels.
 * @param {number} height - Output image height in pixels.
 * @param {function(number, number, number, number): [number, number, number, number]} drawFn -
 *        Pixel shader callback receiving (x, y, width, height) and returning [r, g, b, a].
 * @returns {Buffer} Standard binary PNG file buffer.
 */
function createPng(width, height, drawFn) {
  // RGBA buffer: (width * 4 bytes + 1 scanline filter byte) * height
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress raw RGBA scanlines using standard zlib Deflate
  const deflated = zlib.deflateSync(rawData);

  // Official PNG 8-byte file magic signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: Image Header Chunk (13 bytes)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // Bit depth: 8 bits per channel
  ihdrData[9] = 6;  // Color type: 6 = RGBA
  ihdrData[10] = 0; // Compression method: Deflate
  ihdrData[11] = 0; // Filter method: Standard
  ihdrData[12] = 0; // Interlace: None

  /**
   * Constructs a formatted PNG chunk with Length, Type, Data, and CRC32.
   *
   * @param {string} type - 4-character ASCII chunk type (e.g. 'IHDR', 'IDAT', 'IEND').
   * @param {Buffer} data - Chunk payload data.
   * @returns {Buffer} Formatted chunk buffer.
   */
  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);

    // Calculate CRC-32 checksum across chunk type and data bytes
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  /**
   * Computes IEEE 802.3 CRC-32 checksum.
   *
   * @param {Buffer} buf - Buffer slice to checksum.
   * @returns {number} Unsigned 32-bit CRC integer.
   */
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Pixel rasterizer that draws the WhatsApp Privacy Blur icon:
 * - Rounded Indigo (#4F46E5) squircle badge
 * - White privacy eye contour
 * - Crisp centered focal pupil
 *
 * @param {number} x - Current pixel X coordinate.
 * @param {number} y - Current pixel Y coordinate.
 * @param {number} w - Icon canvas width.
 * @param {number} h - Icon canvas height.
 * @returns {[number, number, number, number]} RGBA color tuple [0..255].
 */
function drawIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;

  // Badge geometry: squircle with rounded corners
  const pad = w * 0.08;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const rx = Math.max(0, Math.abs(x - cx) - (innerW / 2 - pad));
  const ry = Math.max(0, Math.abs(y - cy) - (innerH / 2 - pad));
  const cornerDist = Math.sqrt(rx * rx + ry * ry);

  // Outside rounded squircle: transparent
  if (cornerDist > pad && (Math.abs(x - cx) > innerW / 2 || Math.abs(y - cy) > innerH / 2)) {
    return [0, 0, 0, 0];
  }

  // Eye outline formula: normalized ellipse coordinates
  const eyeX = dx / (w * 0.32);
  const eyeY = dy / (h * 0.20);
  const eyeDist = eyeX * eyeX + eyeY * eyeY;

  // Center iris/pupil distance
  const irisDist = Math.sqrt(dx * dx + dy * dy) / (w * 0.12);

  // Center pupil (white)
  if (irisDist < 1.0) {
    return [255, 255, 255, 255];
  }

  // Eye outer contour (white)
  if (eyeDist <= 1.1 && eyeDist >= 0.6) {
    return [255, 255, 255, 240];
  }

  // Primary background: Indigo (#4F46E5 -> R:79, G:70, B:229)
  return [79, 70, 229, 255];
}

// Generate required Chrome Extension icon sizes: 16x16, 32x32, 48x48, 128x128
const ICON_SIZES = [16, 32, 48, 128];
const OUTPUT_DIR = './public/icons';

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const size of ICON_SIZES) {
  const pngBuffer = createPng(size, size, drawIcon);
  fs.writeFileSync(`${OUTPUT_DIR}/icon${size}.png`, pngBuffer);
  console.log(`[Icon Generator] Created icon${size}.png (${pngBuffer.length} bytes)`);
}
