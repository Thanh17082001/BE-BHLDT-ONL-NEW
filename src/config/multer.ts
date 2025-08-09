import { diskStorage } from 'multer';
import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { randomNameFile } from 'src/utils/random-name';
import { normalizeString } from 'src/utils/normalize-string';

export const storage = (folder: string, isSplit: boolean = false) =>
    diskStorage({
        destination: (req, file, cb) => {
            // Đường dẫn động được truyền từ controller thông qua biến folder
            // ngoài thư mục dist
            let uploadPath = path.join(__dirname, '..', '..', 'public', folder);

            // chia ra từng thư mục
            if (isSplit) {
                if (file.mimetype == 'application/pdf') {
                    uploadPath = path.join(uploadPath, 'pdf');
                } else if (file.mimetype == 'video/mp4') {
                    uploadPath = path.join(uploadPath, 'video');
                } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || file.originalname.endsWith('.pptx')) {
                    uploadPath = path.join(uploadPath, 'ptt');
                } else if (file.mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.originalname.endsWith('.docx') || file.originalname.endsWith('.doc')) {
                    uploadPath = path.join(uploadPath, 'word');
                } else {
                    uploadPath = path.join(uploadPath, 'image');
                }
            }

            // Tạo thư mục nếu nó không tồn tại
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath); // Trả về đường dẫn lưu trữ
        },
        filename: (req, file, cb) => {
            // Tạo tên tệp ngẫu nhiên
            const randomName = randomNameFile(normalizeString(file.originalname));
            console.log('aaaa');
            cb(null, `${randomName}`);
        },
    });

export const multerOptions = {
    limits: {
        fileSize: 1024 * 1024 * 1024, // Giới hạn kích thước tệp (1024MB)
    },
};
