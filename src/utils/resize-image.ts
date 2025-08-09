import * as sharp from 'sharp';
import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';
import * as fs from 'fs';
import { randomNameFile } from './random-name';
import { normalizeString } from './normalize-string';

export const resizeImage = async (file: any): Promise<string> => {
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'image-thumbnail');
    if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
    }
    let linkFile = path.join(uploadPath, randomNameFile(normalizeString('thumbnail-image.jpeg')));
    const buffer = fs.readFileSync(file.path);
    try {
        console.log('đaa', buffer);
        await sharp(buffer)
            .resize(800) // Thay đổi kích thước (nếu cần)
            .jpeg({ quality: 50 }) // Định dạng và chất lượng ảnh
            .toFile(linkFile);
        return linkFile;
    } catch (error) {
        console.log(error);
    }
};
