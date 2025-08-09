import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { promises as fs } from 'fs';
import { randomNameFile, randomNameFileVideo } from './random-name';
import { cutPathThumbnailVideo } from './cut-part';

export const generateImageFromVideo = async (videoPathFile: string, time: string = '00:00:14'): Promise<{ path: string; sizeMB: number }> => {
    const videoPath = path.join(__dirname, '..', '..', 'public', videoPathFile);
    const nameOutputImage = randomNameFileVideo('thumbnail-image.png');
    const outputImagePath = path.join(__dirname, '..', '..', 'public', 'video-thumbnail', nameOutputImage);

    ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: [time],
                filename: path.basename(outputImagePath), // Ensure only the filename is used, not the full path
                folder: path.dirname(outputImagePath),
            })
            .on('end', async () => {
                try {
                    const stats = await fs.stat(outputImagePath); // Lấy thông tin của tệp ảnh
                    const sizeMB = stats.size / (1024 * 1024); // Chuyển kích thước sang MB
                    resolve({ path: cutPathThumbnailVideo(outputImagePath), sizeMB });
                } catch (error) {
                    console.log(error);
                }
            })
            .on('error', (err: any) => {
                console.error('Error taking screenshot:', err);
                reject(err);
            });
    });
};
