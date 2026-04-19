const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { isSupabaseStorageEnabled } = require('../utils/storageHelper');

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);

    cb(null, `${Date.now()}-${uniqueSuffix}-${baseName}${extension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Solo se permiten archivos de imagen.'));
};

const upload = multer({
  storage: isSupabaseStorageEnabled() ? multer.memoryStorage() : diskStorage,
  fileFilter,
  limits: {
    files: 13,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
