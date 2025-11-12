import { Response } from 'express';
import SavedSearch from '../models/SavedSearch';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user's saved searches
// @route   GET /api/saved-searches
// @access  Private
export const getSavedSearches = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const savedSearches = await SavedSearch.find({ userId: String(req.user!._id) }).sort({
      lastAccessed: -1,
    });

    res.json({ savedSearches });
  } catch (error: any) {
    console.error('Get saved searches error:', error);
    res.status(500).json({ message: 'Error fetching saved searches', error: error.message });
  }
};

// @desc    Create saved search
// @route   POST /api/saved-searches
// @access  Private
export const createSavedSearch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { name, filters, drawnBoundsJSON } = req.body;

    if (!name || !filters) {
      res.status(400).json({ message: 'Name and filters are required' });
      return;
    }

    const savedSearch = await SavedSearch.create({
      userId: String(req.user!._id),
      name,
      filters,
      drawnBoundsJSON: drawnBoundsJSON || null,
    });

    res.status(201).json({ savedSearch });
  } catch (error: any) {
    console.error('Create saved search error:', error);
    res.status(500).json({ message: 'Error creating saved search', error: error.message });
  }
};

// @desc    Update saved search access time
// @route   PATCH /api/saved-searches/:id/access
// @access  Private
export const updateAccessTime = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      res.status(404).json({ message: 'Saved search not found' });
      return;
    }

    // Check ownership
    if (savedSearch.userId.toString() !== String(req.user!._id).toString()) {
      res.status(403).json({ message: 'Not authorized to update this search' });
      return;
    }

    savedSearch.lastAccessed = new Date();
    await savedSearch.save();

    res.json({ savedSearch });
  } catch (error: any) {
    console.error('Update access time error:', error);
    res.status(500).json({ message: 'Error updating access time', error: error.message });
  }
};

// @desc    Delete saved search
// @route   DELETE /api/saved-searches/:id
// @access  Private
export const deleteSavedSearch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const savedSearch = await SavedSearch.findById(req.params.id);

    if (!savedSearch) {
      res.status(404).json({ message: 'Saved search not found' });
      return;
    }

    // Check ownership
    if (savedSearch.userId.toString() !== String(req.user!._id).toString()) {
      res.status(403).json({ message: 'Not authorized to delete this search' });
      return;
    }

    await savedSearch.deleteOne();

    res.json({ message: 'Saved search deleted successfully' });
  } catch (error: any) {
    console.error('Delete saved search error:', error);
    res.status(500).json({ message: 'Error deleting saved search', error: error.message });
  }
};
