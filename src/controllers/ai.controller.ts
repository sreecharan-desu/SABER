import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

// Zod schemas for AI writes
const recommendationUpdateSchema = z.object({
  user_id: z.string(),
  positive_signals: z.record(z.string(), z.any()),
  negative_signals: z.record(z.string(), z.any()),
  suppression_rules: z.record(z.string(), z.any()),
});

export const getUsersData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const cursor = req.query.cursor as string | undefined;
        
        const users = await prisma.user.findMany({
            where: { role: 'candidate' },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { id: 'asc' },
            include: { skills: true }
        });
        
        const nextCursor = users.length === limit ? users[users.length - 1].id : null;

        const data = users.map(u => ({
             user_id: u.id,
             role: u.role,
             intent_text: u.intent_text,
             why_text: u.why_text,
             constraints: u.constraints_json,
             skills: u.skills,
             created_at: u.created_at,
             updated_at: u.updated_at
        }));
        
        res.json({ data, next_cursor: nextCursor });
    } catch(err) { next(err); }
};

export const getJobsData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const cursor = req.query.cursor as string | undefined;

        const jobs = await prisma.job.findMany({ 
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { id: 'asc' } 
        });

        const nextCursor = jobs.length === limit ? jobs[jobs.length - 1].id : null;

        const data = jobs.map(j => ({
            job_id: j.id,
            company_id: j.company_id,
            problem_statement: j.problem_statement,
            expectations: j.expectations,
            skills_required: j.skills_required,
            constraints: j.constraints_json,
            active: j.active,
            created_at: j.created_at
        }));
        res.json({ data, next_cursor: nextCursor });
    } catch(err) { next(err); }
};

export const getSwipesData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const cursor = req.query.cursor as string | undefined;

        const swipes = await prisma.swipe.findMany({ 
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { id: 'asc' }
        });

        const nextCursor = swipes.length === limit ? swipes[swipes.length - 1].id : null;

        const data = swipes.map(s => ({
            swipe_id: s.id,
            user_id: s.user_id,
            job_id: s.job_id,
            direction: s.direction,
            created_at: s.created_at
        }));
        res.json({ data, next_cursor: nextCursor });
    } catch(err) { next(err); }
};

export const getMatchesData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const cursor = req.query.cursor as string | undefined;

        const matches = await prisma.match.findMany({ 
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { id: 'asc' }
        });

        const nextCursor = matches.length === limit ? matches[matches.length - 1].id : null;

        const data = matches.map(m => ({
            match_id: m.id,
            user_id: m.candidate_id,
            job_id: m.job_id,
            explainability: m.explainability_json,
            created_at: m.created_at
        }));
        res.json({ data, next_cursor: nextCursor });
    } catch(err) { next(err); }
}

export const updateRecommendation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = recommendationUpdateSchema.parse(req.body);
        
        await prisma.recommendationProfile.upsert({
            where: { user_id: payload.user_id },
            update: {
                positive_signals_json: payload.positive_signals as any,
                negative_signals_json: payload.negative_signals as any,
                suppression_rules_json: payload.suppression_rules as any,
                last_updated: new Date()
            },
            create: {
                user_id: payload.user_id,
                positive_signals_json: payload.positive_signals as any,
                negative_signals_json: payload.negative_signals as any,
                suppression_rules_json: payload.suppression_rules as any
            }
        });
        
        res.json({ status: "ok", updated_at: new Date() });
    } catch(err) { next(err); }
};
