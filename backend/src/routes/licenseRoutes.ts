import express from 'express';
import multer from 'multer';
import {
  submitLicense,
  getLicenseStatus,
  verifyLicense,
  getPendingLicenses,
  getAllLicenses,
} from '../controllers/licenseController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Configure multer for license document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  },
});

// Protected routes - User endpoints
router.post('/submit', protect, upload.single('document'), submitLicense);
router.get('/status', protect, getLicenseStatus);

// Protected routes - Admin only endpoints
router.get('/pending', protect, getPendingLicenses);
router.get('/all', protect, getAllLicenses);
router.put('/verify/:userId', protect, verifyLicense);

export default router;
