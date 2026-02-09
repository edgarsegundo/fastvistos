// responsive-image-processor.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export class ResponsiveImageProcessor {
    constructor({
        inputDir,
        outputDir,
        breakpoints = [],
        scales = [1, 2],
        types = ['webp', 'jpeg'],
    }) {
        this.inputDir = inputDir;
        this.outputDir = outputDir;
        this.breakpoints = breakpoints;
        this.scales = scales;
        this.types = types;
        this.index = {};

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        this.processors = {
            webp: (img, width, outPath) =>
                img.clone().resize(width).webp({ quality: 70 }).toFile(outPath),

            jpeg: (img, width, outPath) =>
                img.clone().resize(width).jpeg({ quality: 80 }).toFile(outPath),

            avif: (img, width, outPath) =>
                img.clone().resize(width).avif({ quality: 55 }).toFile(outPath),
        };
    }

    addFormat(formatName, handlerFn) {
        this.processors[formatName] = handlerFn;
    }

    getImages() {
        return fs.readdirSync(this.inputDir).filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));
    }

    async processImage(file) {
        const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const inputPath = path.join(this.inputDir, file);
        const image = sharp(inputPath);

        // Blur placeholder
        const blur = await image.resize(20).blur().toBuffer();
        const blurBase64 = `data:image/jpeg;base64,${blur.toString('base64')}`;

        this.index[baseName] = { blurDataURL: blurBase64 };

        // Initialize format arrays
        this.types.forEach((t) => (this.index[baseName][t] = []));

        for (const bp of this.breakpoints) {
            for (const scale of this.scales) {
                const width = bp * scale;
                const prefix = `${baseName}-${bp}-${scale}x`;

                for (const type of this.types) {
                    const outName = `${prefix}.${type}`;
                    const outPath = path.join(this.outputDir, outName);

                    if (!this.processors[type]) {
                        console.warn(`⚠️ Missing processor for format "${type}"`);
                        continue;
                    }

                    await this.processors[type](image, width, outPath);
                    this.index[baseName][type].push(`${outName} ${width}w`);
                }
            }
        }

        console.log('OK:', file);
    }

    async process() {
        const files = this.getImages();
        for (const file of files) {
            await this.processImage(file);
        }
        return this.index;
    }
}

// CLI argument (optional usage)
const args = process.argv.slice(2);
const siteId = args[0] ?? null;

// ----------------------------------------
// MASTER TASK LIST (ADD AS MANY AS YOU WANT)
// ----------------------------------------
const tasks = [
    {
        id: 'task-images-responsive-base',
        inputDir: `public/${siteId}/assets/images-responsive-base`,
        outputDir: `public/${siteId}/assets/images-responsive-base/resized`,
        jsonOutput: `multi-sites/sites/${siteId}/generated-image-map.json`,
        breakpoints: [356, 485, 608],
        scales: [1, 2],
        types: ['webp', 'jpeg'],
    },

    {
      id: "task-blog-images",
      inputDir: `public/${siteId}/assets/images/blog`,
      outputDir: `public/${siteId}/assets/images/blog/resized`,
      jsonOutput: `multi-sites/sites/${siteId}/generated-blog-image-map.json`,
      breakpoints: [1216, 608, 320],
      scales: [1, 2],
      types: ["jpeg", "webp"],
    },
];

// ----------------------------------------
// RUN ALL TASKS IN SEQUENCE
// ----------------------------------------
(async () => {
    for (const t of tasks) {
        console.log(`\n🚀 Running ${t.id}...`);

        const processor = new ResponsiveImageProcessor({
            inputDir: t.inputDir,
            outputDir: t.outputDir,
            breakpoints: t.breakpoints,
            scales: t.scales,
            types: t.types,
        });

        const result = await processor.process();

        // Ensure directory exists
        const dir = t.jsonOutput.split('/').slice(0, -1).join('/');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Save JSON map
        fs.writeFileSync(t.jsonOutput, JSON.stringify(result, null, 2));

        console.log(`✅ Finished ${t.id}`);
        console.log(`📄 JSON saved at: ${t.jsonOutput}`);
    }

    console.log('\n🎉 All processing tasks completed.\n');
})();
