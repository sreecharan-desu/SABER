import {
  PrismaClient,
  UserRole,
  ApplicationStatus,
  SwipeDirection,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const TARGET_EMAILS = [
  "alaharibhanuprakash.04@gmail.com",
  "bhanuprakashalahari.04@gmail.com",
];

async function main() {
  for (const email of TARGET_EMAILS) {
    console.log(`🚀 Seeding targeted activity for: ${email}\n`);

    const recruiter = await prisma.user.findUnique({
      where: { email: email },
      include: { companies: true },
    });

    if (!recruiter || recruiter.role !== UserRole.recruiter) {
      console.warn(
        `⚠️ Target recruiter ${email} not found or has wrong role. Skipping.`,
      );
      continue;
    }

    let company = recruiter.companies[0];
    if (!company) {
      console.log(`Creating company for recruiter ${email}...`);
      company = await prisma.company.create({
        data: {
          name: "Bhanu's Tech Ventures",
          website: "https://bhanu-tech.example.com",
          verified: true,
          recruiter_id: recruiter.id,
        },
      });
    }

    const candidates = await prisma.user.findMany({
      where: { role: UserRole.candidate },
    });

    if (candidates.length === 0) {
      console.error(
        "❌ No candidates found in database to create applications.",
      );
      return;
    }

    const jobTemplates = [
      "Senior Modern Backend Engineer",
      "Lead Distributed Systems Architect",
      "Privacy-First Product Engineer",
      "Infrastructure Reliability Lead",
      "Internal Platform Developer",
      "Staff Security Engineer",
      "Full Stack Performance Engineer",
      "Founding Engineer (Core API)",
      "Senior TypeScript Systems Engineer",
      "Data Platform Engineer",
    ];

    console.log(`Creating ${jobTemplates.length} jobs for ${email}...`);
    const jobs = [];
    for (const title of jobTemplates) {
      const job = await prisma.job.create({
        data: {
          company_id: company.id,
          problem_statement: `Title: ${title}. ${faker.lorem.paragraph()}`,
          expectations: faker.lorem.sentences(3),
          non_negotiables: faker.lorem.sentence(),
          deal_breakers: faker.lorem.sentence(),
          skills_required: ["Go", "TypeScript", "PostgreSQL", "Redis"],
          constraints_json: {
            salary_range: [180000, 250000],
            location: "Remote",
            role_type: "Full-time",
          },
        },
      });
      jobs.push(job);
    }

    console.log("Creating applications, swipes, and matches...");
    const statuses: ApplicationStatus[] = [
      "pending",
      "reviewing",
      "interview",
      "accepted",
      "rejected",
    ];

    let appsCreated = 0;
    let matchesCreated = 0;

    for (const job of jobs) {
      const luckyCandidates = faker.helpers.arrayElements(
        candidates,
        faker.number.int({ min: 5, max: 10 }),
      );

      for (const candidate of luckyCandidates) {
        try {
          await prisma.swipe
            .create({
              data: {
                user_id: recruiter.id,
                job_id: job.id,
                target_user_id: candidate.id,
                direction: SwipeDirection.right,
              },
            })
            .catch(() => {});

          const status = faker.helpers.arrayElement(statuses);
          await prisma.application.create({
            data: {
              user_id: candidate.id,
              job_id: job.id,
              status: status,
              cover_note: faker.lorem.paragraph(),
              created_at: faker.date.recent({ days: 7 }),
            },
          });
          appsCreated++;

          if (
            status === "interview" ||
            status === "accepted" ||
            faker.datatype.boolean(0.3)
          ) {
            await prisma.match.create({
              data: {
                candidate_id: candidate.id,
                job_id: job.id,
                reveal_status: true,
                explainability_json: {
                  score: 0.98,
                  reasoning: "Perfect skill match.",
                },
              },
            });
            matchesCreated++;
          }
        } catch (e) {}
      }
    }
    console.log(`\n✅ Finished Targeted Seed for ${email}!`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
