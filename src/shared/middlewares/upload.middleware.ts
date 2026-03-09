import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
  fileFilter: (_, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files (JPEG, PNG, WebP, AVIF) are allowed'));
  },
}).array('images', 20);

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed. Accepted: PDF, JPEG, PNG, WebP'));
  },
}).single('document');

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
}).single('file');
