const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.directory);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const name = path.basename(file.originalname, extension);
    cb(null, `${name}-${uniqueSuffix}${extension}`);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!config.upload.allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error(`File type not allowed. Allowed types: ${config.upload.allowedTypes.join(', ')}`),
      false
    );
  }

  // Check file extension
  const allowedExtensions = ['.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return cb(new Error('Only PDF files are allowed'), false);
  }

  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseFileSize(config.upload.maxFileSize),
    files: 10, // Maximum 10 files per request
  },
});

// Helper function to parse file size string (e.g., "50mb" to bytes)
function parseFileSize(sizeString) {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = sizeString.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    throw new Error(`Invalid file size format: ${sizeString}`);
  }

  const [, size, unit] = match;
  return parseInt(size) * units[unit];
}

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: `File size exceeds the limit of ${config.upload.maxFileSize}`,
        maxSize: config.upload.maxFileSize,
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files can be uploaded at once',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        message: 'Invalid file field name',
      });
    }
  }

  if (error.message.includes('File type not allowed')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message,
      allowedTypes: config.upload.allowedTypes,
    });
  }

  if (error.message.includes('Only PDF files are allowed')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only PDF files are allowed',
    });
  }

  // Default error
  return res.status(500).json({
    error: 'Upload failed',
    message: 'An error occurred during file upload',
  });
};

module.exports = {
  upload,
  handleUploadError,
  single: upload.single('file'),
  array: upload.array('files', 10),
  fields: upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'files', maxCount: 10 },
  ]),
};
