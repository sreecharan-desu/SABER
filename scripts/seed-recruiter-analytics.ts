import {
  PrismaClient,
  UserRole,
  SwipeDirection,
  ApplicationStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Recruiter Analytics Data...");

  // 1. Get or Create SPECIFIC Recruiter
  const targetEmail = "alaharibhanuprakash.04@gmail.com";
  console.log(`Targeting Recruiter: ${targetEmail}`);

  let recruiter = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!recruiter) {
    console.log("Recruiter not found, creating...");
    recruiter = await prisma.user.create({
      data: {
        role: UserRole.recruiter,
        name: "Bhanu Prakash",
        email: targetEmail,
        created_at: new Date(),
      },
    });
  } else if (recruiter.role !== UserRole.recruiter) {
    console.log(
      `User exists but is ${recruiter.role}. Promoting to recruiter...`,
    );
    recruiter = await prisma.user.update({
      where: { id: recruiter.id },
      data: { role: UserRole.recruiter },
    });
  }

  console.log(`Using Recruiter ID: ${recruiter.id}`);

  // 2. Ensure Recruiter has a Company
  let company = await prisma.company.findFirst({
    where: { recruiter_id: recruiter.id },
  });

  if (!company) {
    console.log("Creating company for recruiter...");
    company = await prisma.company.create({
      data: {
        name: faker.company.name(),
        recruiter_id: recruiter.id,
        verified: true,
      },
    });
  }

  // 3. Create active jobs (Ensure at least 5)
  const existingJobsCount = await prisma.job.count({
    where: { company_id: company.id },
  });
  if (existingJobsCount < 5) {
    console.log(`Creating dummy jobs (current: ${existingJobsCount})...`);
    for (let i = 0; i < 5; i++) {
      await prisma.job.create({
        data: {
          company_id: company.id,
          problem_statement: faker.hacker.phrase(),
          expectations: faker.lorem.paragraph(),
          non_negotiables: faker.lorem.sentence(),
          deal_breakers: faker.lorem.sentence(),
          skills_required: [faker.hacker.noun(), faker.hacker.noun()],
          constraints_json: {},
          active: true,
        },
      });
    }
  }

  const myJobs = await prisma.job.findMany({
    where: { company_id: company.id },
  });
  console.log(`Processing ${myJobs.length} jobs for analytics...`);

  // 4. Create/Get Candidates
  const candidateCount = await prisma.user.count({
    where: { role: UserRole.candidate },
  });
  if (candidateCount < 20) {
    console.log("Seeding more candidates...");
    for (let i = 0; i < 20; i++) {
      await prisma.user.create({
        data: {
          role: UserRole.candidate,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          intent_text: faker.lorem.sentence(),
          skills: {
            create: [
              { name: "React", source: "manual", confidence_score: 1.0 },
            ],
          },
        },
      });
    }
  }

  // Fetch a pool of candidates
  const candidates = await prisma.user.findMany({
    where: { role: UserRole.candidate },
    take: 100,
  });

  // 5. Generate Interactions (Swipes, Applications, Matches)
  console.log("Generating interactions (Views, Applications, Pipeline)...");

  let viewsAdded = 0;
  let appsAdded = 0;

  for (const job of myJobs) {
    // Randomly select 15-30 candidates per job
    const viewers = faker.helpers.arrayElements(
      candidates,
      faker.number.int({ min: 15, max: 30 }),
    );

    for (const candidate of viewers) {
      const direction = faker.helpers.arrayElement([
        SwipeDirection.left,
        SwipeDirection.right,
      ]);

      // Create Swipe (View)
      try {
        // Determine if we need to set target_user_id (usually for recruiter swipes)
        // For candidate swiping on job, target_user_id is typically null in many schemas,
        // but if your schema constraint requires it or it's part of the unique key, we must handle it.
        // Based on previous errors/schema, unique is [user_id, job_id, target_user_id]
        // We'll trust createMany or ignore duplicates
        await prisma.swipe.create({
          data: {
            user_id: candidate.id,
            job_id: job.id,
            direction,
          },
        });
        viewsAdded++;
      } catch (e) {
        // Ignore unique constraint violations
      }

      // If Right Swipe -> Application (Funnel)
      // Generate varied statuses for the graph
      if (direction === SwipeDirection.right) {
        // Random status with distribution
        // 40% Pending, 25% Reviewing, 20% Interview, 10% Rejected, 5% Accepted
        const r = Math.random();
        let status: ApplicationStatus = ApplicationStatus.pending;
        if (r > 0.4) status = ApplicationStatus.reviewing;
        if (r > 0.65) status = ApplicationStatus.interview;
        if (r > 0.85) status = ApplicationStatus.rejected;
        if (r > 0.95) status = ApplicationStatus.accepted;

        try {
          await prisma.application.create({
            data: {
              user_id: candidate.id,
              job_id: job.id,
              status: status,
              cover_note: faker.lorem.sentence(),
              created_at: faker.date.recent({ days: 60 }),
            },
          });
          appsAdded++;

          // If advanced stage, create match
          if (["interview", "accepted", "reviewing"].includes(status)) {
            await prisma.match.create({
              data: {
                candidate_id: candidate.id,
                job_id: job.id,
                reveal_status: true,
                explainability_json: {},
              },
            });
          }
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
  }

  console.log(`✅ Analytics Seed Complete for ${targetEmail}`);
  console.log(`   - Views (Swipes) Generated: ~${viewsAdded}`);
  console.log(`   - Applications Generated: ~${appsAdded}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
