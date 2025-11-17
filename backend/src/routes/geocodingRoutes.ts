import express from 'express';
import { searchLocation } from '../controllers/geocodingController';

const router = express.Router();

// Public route - no authentication required
router.get('/search', searchLocation);

export default router;
