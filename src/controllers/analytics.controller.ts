import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

// ==========================================
// CANDIDATE ANALYTICS
// ==========================================
export const getCandidateAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.user as any)?.id;

    const [
      matchesCount,
      applicationsCount,
      swipesCount,
      applicationStats,
      profileViews,
    ] = await Promise.all([
      // 1. Total Matches
      prisma.match.count({
        where: { candidate_id: userId },
      }),

      // 2. Total Applications
      prisma.application.count({
        where: { user_id: userId, status: { not: "withdrawn" } },
      }),

      // 3. Swipes Made (Right)
      prisma.swipe.count({
        where: { user_id: userId, direction: "right" },
      }),

      // 4. Applications by Status
      prisma.application.groupBy({
        by: ["status"],
        where: { user_id: userId, status: { not: "withdrawn" } },
        _count: {
          status: true,
        },
      }),

      // 5. Profile Views (Swipes received from recruiters)
      // A recruiter swiping 'right' or 'left' on a candidate counts as a view.
      // Ideally we should have a 'View' model but this is a good proxy.
      prisma.swipe.count({
        where: { target_user_id: userId },
      }),
    ]);

    res.json({
      total_matches: matchesCount,
      total_applications: applicationsCount,
      applications_breakdown: applicationStats.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      swipes_made: swipesCount,
      profile_views: profileViews,
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// RECRUITER ANALYTICS
// ==========================================
export const getRecruiterAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const recruiterId = (req.user as any)?.id;

    // Get all jobs managed by this recruiter
    const jobs = await prisma.job.findMany({
      where: { company: { recruiter_id: recruiterId } },
      select: { id: true },
    });
    const jobIds = jobs.map((j) => j.id);

    if (jobIds.length === 0) {
      return res.json({
        active_jobs: 0,
        total_applications: 0,
        total_matches: 0,
        profile_views: 0,
        pipeline: [],
      });
    }

    const [
      activeJobsCount,
      totalApplications,
      totalMatches,
      applicationStats,
      totalViews,
    ] = await Promise.all([
      // 1. Active Jobs
      prisma.job.count({
        where: { company: { recruiter_id: recruiterId }, active: true },
      }),

      // 2. Total Applications received
      prisma.application.count({
        where: { job_id: { in: jobIds }, status: { not: "withdrawn" } },
      }),

      // 3. Total Matches made
      prisma.match.count({
        where: { job_id: { in: jobIds } },
      }),

      // 4. Applications by Status (Pipeline)
      prisma.application.groupBy({
        by: ["status"],
        where: { job_id: { in: jobIds }, status: { not: "withdrawn" } },
        _count: { status: true },
      }),

      // 5. Total Views (Swipes on these jobs)
      prisma.swipe.count({
        where: { job_id: { in: jobIds } },
      }),
    ]);

    res.json({
      active_jobs: activeJobsCount,
      total_applications: totalApplications,
      total_matches: totalMatches,
      total_views: totalViews, // Total candidates who saw/swiped on the jobs
      pipeline: applicationStats.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
    });
  } catch (err) {
    next(err);
  }
};
