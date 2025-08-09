import { removeVietnameseTones } from "./generate-username";

export function normalizeString(fileName) {
    const parts = fileName.split('.');
    if (parts.length < 2) {
        return fileName; // Nếu không có phần mở rộng, trả lại tên gốc
    }

    const name = parts.slice(0, -1).join('.');
    const extension = parts[parts.length - 1];

    const normalizedName = removeSpaces(removeVietnameseTones(name));

    return `${normalizedName}.${extension}`;
}

function removeSpaces(str: string): string {
    return str.replace(/\s+/g, '');
}


