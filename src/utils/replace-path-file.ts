import * as path from 'path';
export const ReplacePathFile = (fullPath): string => {
    const relativePath = path.relative(path.join(__dirname, '..', '..'), fullPath.replace(/\\/g, '/'));

    console.log(relativePath); // Output: /publication/thumbnail/e6626bae-0a4a-4dd7-b1a2-6e135638fd7b_thumbnail-image.jpeg
    return relativePath.replace(/\\/g, '/');
};