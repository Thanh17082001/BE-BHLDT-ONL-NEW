import * as path from 'path';

// export function cutPath(fullPath: string): string {
//     const cutPath = path.join(__dirname, '..', '..', '/public/');
//     const relativePath = path.relative(cutPath, fullPath);
//     return '/' + relativePath.replace(/\\/g, '/');
// }


export function cutPathThumbnailVideo(fullPath: string): string {
    const cutPath = path.join(__dirname, '..', '..');
    const relativePath = path.relative(cutPath, fullPath);
    return '/' + relativePath.replace(/\\/g, '/');
}
