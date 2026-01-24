import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const KEEP_EMAILS = [
  "alaharibhanuprakash.04@gmail.com",
  "velpurianand8005@gmail.com",
];

async function cleanup() {
  console.log(
    "🧹 Starting database cleanup (keeping only specified users)...\n",
  );

  try {
    // 1. Get IDs of users to keep
    const keepUsers = await prisma.user.findMany({
      where: {
        email: { in: KEEP_EMAILS },
      },
      select: { id: true },
    });
    const keepIds = keepUsers.map((u) => u.id);

    console.log(`Keeping users: ${KEEP_EMAILS.join(", ")}`);
    console.log(`Keep IDs: ${keepIds.join(", ")}\n`);

    // Helper to delete where NOT in keepIds or related to a deleted entity

    console.log("Emptying Messages...");
    await prisma.message.deleteMany({
      where: {
        OR: [
          { sender_id: { notIn: keepIds } },
          { match: { candidate_id: { notIn: keepIds } } },
        ],
      },
    });

    console.log("Emptying Matches...");
    // A match should be deleted if the candidate is not kept
    // OR if the job it belongs to belongs to a recruiter who is not kept.
    await prisma.match.deleteMany({
      where: {
        OR: [
          { candidate_id: { notIn: keepIds } },
          { job: { company: { recruiter_id: { notIn: keepIds } } } },
        ],
      },
    });

    console.log("Emptying Swipes...");
    await prisma.swipe.deleteMany({
      where: {
        OR: [
          { user_id: { notIn: keepIds } },
          { target_user_id: { notIn: keepIds, not: null } },
          { job: { company: { recruiter_id: { notIn: keepIds } } } },
        ],
      },
    });

    console.log("Emptying Applications...");
    await prisma.application.deleteMany({
      where: {
        OR: [
          { user_id: { notIn: keepIds } },
          { job: { company: { recruiter_id: { notIn: keepIds } } } },
        ],
      },
    });

    console.log("Emptying Bookmarks...");
    await prisma.bookmark.deleteMany({
      where: {
        OR: [
          { user_id: { notIn: keepIds } },
          { job: { company: { recruiter_id: { notIn: keepIds } } } },
        ],
      },
    });

    console.log("Emptying Jobs (All)...");
    await prisma.job.deleteMany({});

    console.log("Emptying Companies (All)...");
    await prisma.company.deleteMany({});

    console.log("Emptying Skills...");
    await prisma.skill.deleteMany({
      where: {
        user_id: { notIn: keepIds },
      },
    });

    console.log("Emptying OAuth Accounts...");
    await prisma.oAuthAccount.deleteMany({
      where: {
        user_id: { notIn: keepIds },
      },
    });

    console.log("Emptying Recommendation Profiles...");
    await prisma.recommendationProfile.deleteMany({
      where: {
        user_id: { notIn: keepIds },
      },
    });

    console.log("Emptying Payments...");
    await prisma.payment.deleteMany({
      where: {
        user_id: { notIn: keepIds },
      },
    });

    console.log("Deleting non-whitelisted Users...");
    const deleteResult = await prisma.user.deleteMany({
      where: {
        email: { notIn: KEEP_EMAILS },
      },
    });

    console.log(
      `\n✅ Finished! Deleted ${deleteResult.count} users and their related data.`,
    );
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
