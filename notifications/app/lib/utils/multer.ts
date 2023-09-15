import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  filename: function (req: Request, file, cb) {
    console.log(`req: ${req.params}`);
    const uniqueSuffix = Date.now() + '.' + file.mimetype.split('/')[1];
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

export default upload;
