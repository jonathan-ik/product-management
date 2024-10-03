import { HttpException } from '@/exceptions/HttpException';
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    // throw new HttpException(400, "File must be of image type")
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
