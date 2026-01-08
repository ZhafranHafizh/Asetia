import sharp from 'sharp'

export async function processPreviewImage(fileBuffer: Buffer): Promise<Buffer> {
    const image = sharp(fileBuffer)
    const metadata = await image.metadata()

    const width = metadata.width || 800
    const height = metadata.height || 600

    // Create a diagonal grid pattern for the watermark
    const text = 'ASETIA'
    const fontSize = Math.max(width, height) / 10

    // Create an SVG overlay
    const svgOverlay = `
        <svg width="${width}" height="${height}">
            <style>
                .text {
                    fill: rgba(255, 255, 255, 0.2);
                    font-size: ${fontSize}px;
                    font-weight: bold;
                    font-family: sans-serif;
                }
            </style>
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${width / 2}" height="${height / 2}" patternTransform="rotate(-45)">
                <text x="50%" y="50%" class="text" text-anchor="middle" dominant-baseline="middle">${text}</text>
            </pattern>
            <rect width="100%" height="100%" fill="url(#pattern)" />
        </svg>
    `

    return image
        .composite([{
            input: Buffer.from(svgOverlay),
            blend: 'over'
        }])
        .withMetadata({
            // Strip all metadata but keep orientation
            orientation: metadata.orientation
        })
        .jpeg({ quality: 80 })
        .toBuffer()
}
