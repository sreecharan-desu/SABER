import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Global Limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Auth Limiter (Login, etc.)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 login/auth attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' }
});

// Swipe Limiter
export const swipeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 swipes per hour per IP (server-side logic also enforces global daily limits per user)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Swipe limit reached for this IP, please try again later.' }
});

// AI Limiter (Identifier by API Key)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 AI internal calls per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
      return req.header('X-API-KEY') || req.ip || 'unknown';
  },
  skip: (req: Request) => {
      // Only limit if API key matches internal one? No, limit all.
      // But maybe we trust our internal cron. 
      // Let's enforce it to prevent runaway loops.
      return false;
  },
  message: { error: 'AI Rate limit exceeded' }
});
