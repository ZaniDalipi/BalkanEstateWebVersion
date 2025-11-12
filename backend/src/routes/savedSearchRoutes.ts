import express from 'express';
import {
  getSavedSearches,
  createSavedSearch,
  updateAccessTime,
  deleteSavedSearch,
} from '../controllers/savedSearchController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/', getSavedSearches);
router.post('/', createSavedSearch);
router.patch('/:id/access', updateAccessTime);
router.delete('/:id', deleteSavedSearch);

export default router;
