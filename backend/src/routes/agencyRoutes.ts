import express from 'express';
import multer from 'multer';
import {
  createAgency,
  getAgencies,
  getAgency,
  updateAgency,
  addAgentToAgency,
  removeAgentFromAgency,
  getFeaturedAgencies,
  uploadAgencyLogo,
  uploadAgencyCover,
  joinAgencyByInvitationCode,
  verifyInvitationCode,
  addAgencyAdmin,
  removeAgencyAdmin,
} from '../controllers/agencyController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

// Public routes
router.get('/', getAgencies);
router.get('/featured/rotation', getFeaturedAgencies);
router.get('/:country/:name', getAgency); // Format: /agencies/:country/:name (e.g., /agencies/albania/zano-real-estate)
router.get('/:idOrSlug', getAgency); // Fallback for ID or single-segment slug lookups

// Protected routes
router.post('/', protect, createAgency);
router.put('/:id', protect, updateAgency);
router.post('/:id/agents', protect, addAgentToAgency);
router.delete('/:id/agents/:agentId', protect, removeAgentFromAgency);
router.post('/join-by-code', protect, joinAgencyByInvitationCode);

// Admin management routes
router.post('/:id/verify-code', protect, verifyInvitationCode);
router.post('/:id/admins', protect, addAgencyAdmin);
router.delete('/:id/admins/:userId', protect, removeAgencyAdmin);

// Image upload routes
router.post('/:id/upload-logo', protect, upload.single('logo'), uploadAgencyLogo);
router.post('/:id/upload-cover', protect, upload.single('cover'), uploadAgencyCover);

export default router;
