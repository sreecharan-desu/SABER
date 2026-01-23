import { Router } from 'express';
import * as recruiterController from '../controllers/recruiter.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';
import { swipeLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/company', authenticateJWT, requireRole(['recruiter']), recruiterController.createCompany);
router.get('/company', authenticateJWT, requireRole(['recruiter']), recruiterController.getMyCompany);
router.post('/job', authenticateJWT, requireRole(['recruiter']), recruiterController.createJob);
router.get('/jobs', authenticateJWT, requireRole(['recruiter']), recruiterController.getMyJobs);
router.put('/job/:id', authenticateJWT, requireRole(['recruiter']), recruiterController.updateJob);
router.delete('/job/:id', authenticateJWT, requireRole(['recruiter']), recruiterController.deleteJob);
router.get('/signals', authenticateJWT, requireRole(['recruiter']), recruiterController.getSignalsOfInterest);
router.get('/recruiter/feed', authenticateJWT, requireRole(['recruiter']), recruiterController.getRecruiterFeed); 
router.post('/recruiter/swipe', authenticateJWT, requireRole(['recruiter']), swipeLimiter, recruiterController.recruiterSwipe); 

export default router;
