// api/image-upscale.js — Server-side image upscaling using sharp
// sharp দিয়ে bicubic interpolation-এ 2x/4x upscaling করা হয়
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageData, scale = 2 } = req.body;

  if (!imageData || !imageData.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image data' });
  }

  const allowedScales = [2, 4];
  const scaleNum = parseInt(scale, 10);
  if (!allowedScales.includes(scaleNum)) {
    return res.status(400).json({ error: 'Scale must be 2 or 4' });
  }

  try {
    // Base64 থেকে buffer তৈরি করা
    const matches = imageData.match(/^data:(.+);base64,(.+)$/s);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image format' });
    }
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // sharp দিয়ে image metadata পাওয়া
    const sharp = (await import('sharp')).default;
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      return res.status(400).json({ error: 'Could not read image dimensions' });
    }

    // Maximum output size limit: 4000x4000 pixels
    const newWidth = Math.min(width * scaleNum, 4000);
    const newHeight = Math.min(height * scaleNum, 4000);

    // Upscale করা — bicubic (lanczos3) interpolation ব্যবহার করা হচ্ছে
    const upscaledBuffer = await sharp(buffer)
      .resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3, // সর্বোচ্চ মানের upscaling
        fit: 'fill',
        withoutEnlargement: false,
      })
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.5 }) // Edge sharpening
      .toFormat('png', { compressionLevel: 6 })
      .toBuffer();

    const outputBase64 = `data:image/png;base64,${upscaledBuffer.toString('base64')}`;

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      success: true,
      imageData: outputBase64,
      originalSize: { width, height },
      upscaledSize: { width: newWidth, height: newHeight },
      scale: scaleNum,
    });
  } catch (error) {
    console.error('Image upscale error:', error);
    return res.status(500).json({ error: 'Failed to upscale image', details: error.message });
  }
}
