import { Router } from 'express';
import * as candidateController from '../controllers/candidate.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// ==========================================
// BOOKMARKS
// ==========================================

/**
 * GET /candidates/bookmarks
 * Get all bookmarked jobs for the current user
 */
router.get('/bookmarks', candidateController.getBookmarks);

/**
 * POST /candidates/bookmarks
 * Bookmark a job (or update notes if already bookmarked)
 * Body: { job_id: string, notes?: string }
 */
router.post('/bookmarks', candidateController.createBookmark);

/**
 * DELETE /candidates/bookmarks/:job_id
 * Remove a bookmark
 */
router.delete('/bookmarks/:job_id', candidateController.deleteBookmark);

// ==========================================
// APPLICATIONS
// ==========================================

/**
 * GET /candidates/applications
 * Get all applications for the current user
 * Query params: status? (pending|reviewing|interview|accepted|rejected|withdrawn)
 */
router.get('/applications', candidateController.getApplications);

/**
 * POST /candidates/applications
 * Submit an application to a job
 * Body: { job_id: string, cover_note?: string }
 */
router.post('/applications', candidateController.createApplication);

/**
 * DELETE /candidates/applications/:id
 * Withdraw an application
 */
router.delete('/applications/:id', candidateController.withdrawApplication);

// ==========================================
// RECRUITER ENDPOINTS (for managing applications)
// ==========================================

/**
 * PUT /candidates/applications/:id/status
 * Update application status (recruiter only)
 * Body: { status: 'pending'|'reviewing'|'interview'|'accepted'|'rejected' }
 */
router.put('/applications/:id/status', candidateController.updateApplicationStatus);

/**
 * GET /candidates/jobs/:job_id/applications
 * Get all applications for a specific job (recruiter only)
 * Query params: status? (pending|reviewing|interview|accepted|rejected|withdrawn)
 */
router.get('/jobs/:job_id/applications', candidateController.getJobApplications);

export default router;
