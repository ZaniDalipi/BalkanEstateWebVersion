import express from 'express';
import {
  createExport,
  getExports,
  getExport,
  downloadExport,
} from '../controllers/bankExportController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication (admin check is done in controller)
router.use(authenticate);

router.post('/', createExport);
router.get('/', getExports);
router.get('/:batchId', getExport);
router.get('/:batchId/download', downloadExport);

export default router;
