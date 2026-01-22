import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.get('/oauth/callback', authController.handleOAuthCallbackGET);
router.post('/oauth/callback', authLimiter, authController.handleOAuthCallback);
router.post('/link-provider', authenticateJWT, authLimiter, authController.linkProvider);
router.get('/me', authenticateJWT, authController.getMe); // Moved /me here as it's typically auth related, though could be in user routes

export default router;
