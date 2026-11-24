import sharp from "sharp";
import path from "node:path";

const INPUT = "/home/container/assets/Rosiee.jpeg";
const OUTPUT = "./pixel-result.png";
const PIXEL_LEVEL = 30;

function getBlock(level) {
  const value = Math.min(Math.max(Number(level) || 12, 1), 40);
  return 41 - value;
}

async function pixelArt() {
  try {
    const image = sharp(INPUT, { limitInputPixels: false }).rotate().ensureAlpha();
    const meta = await image.metadata();

    const width = meta.width;
    const height = meta.height;
    const block = getBlock(PIXEL_LEVEL);

    const input = await image.raw().toBuffer();
    const output = Buffer.alloc(input.length);

    for (let y = 0; y < height; y += block) {
      for (let x = 0; x < width; x += block) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let count = 0;

        const maxY = Math.min(y + block, height);
        const maxX = Math.min(x + block, width);

        for (let yy = y; yy < maxY; yy++) {
          for (let xx = x; xx < maxX; xx++) {
            const i = (yy * width + xx) * 4;
            r += input[i];
            g += input[i + 1];
            b += input[i + 2];
            a += input[i + 3];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        for (let yy = y; yy < maxY; yy++) {
          for (let xx = x; xx < maxX; xx++) {
            const i = (yy * width + xx) * 4;
            output[i] = r;
            output[i + 1] = g;
            output[i + 2] = b;
            output[i + 3] = a;
          }
        }
      }
    }

    await sharp(output, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png({
        compressionLevel: 9,
        adaptiveFiltering: false
      })
      .toFile(OUTPUT);

    return {
      Status: true,
      Code: 200,
      Input: path.resolve(INPUT),
      Result: path.resolve(OUTPUT)
    };
  } catch (e) {
    return {
      Status: false,
      Code: 500,
      Input: INPUT,
      Result: null,
      Error: e.message
    };
  }
}

console.log(JSON.stringify(await pixelArt(), null, 2));