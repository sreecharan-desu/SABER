import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { z } from 'zod';

const intentSchema = z.object({
  intent_text: z.string(),
  why_text: z.string(),
});

// Accept constraints directly in the body, not nested
const constraintsSchema = z.record(z.string(), z.any());

export const updateIntent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { intent_text, why_text } = intentSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: (req.user as any)?.id },
      data: { intent_text, why_text },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateConstraints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const constraints_json = constraintsSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: (req.user as any)?.id },
      data: { constraints_json: constraints_json as any },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
