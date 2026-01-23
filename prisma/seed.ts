import { PrismaClient, UserRole, SwipeDirection } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const TECH_STACKS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Django', 'FastAPI', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'Next.js', 'Vue.js', 'Angular', 'Java', 'Spring Boot', 'C#', '.NET', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Terraform', 'Ansible'
];

const JOB_TEMPLATES = [
  {
    problem_statement: "We are scaling our real-time notification system to handle 1M+ concurrent users. The current polling architecture is inefficient.",
    expectations: "Design and implement a scalable WebSocket-based microservice. Optimize message delivery guarantees and reduce latency.",
    non_negotiables: "Experience with high-concurrency systems and WebSocket.",
    deal_breakers: "No experience with asynchronous event-driven architectures.",
    skills: ['Node.js', 'Redis', 'TypeScript', 'Docker']
  },
  {
    problem_statement: "Our React frontend is experiencing performance bottlenecks on mobile devices due to large bundle sizes.",
    expectations: "Refactor the core application to use Next.js. Implement code splitting, lazy loading, and optimize components.",
    non_negotiables: "Deep understanding of React rendering cycle and performance optimization.",
    deal_breakers: "Unfamiliarity with server-side rendering concepts.",
    skills: ['React', 'Next.js', 'TypeScript']
  },
  {
    problem_statement: "We need to migrate our monolithic backend to a microservices architecture on Kubernetes.",
    expectations: "Containerize existing services, define Kubernetes manifests, and set up a CI/CD pipeline.",
    non_negotiables: "Production experience with Kubernetes and Docker.",
    deal_breakers: "Lack of experience with cloud-native infrastructure.",
    skills: ['Python', 'Docker', 'Kubernetes', 'AWS']
  },
  {
    problem_statement: "Processing terabytes of data daily for real-time analytics is becoming a bottleneck.",
    expectations: "Build a robust data pipeline using Go and optimize database queries on PostgreSQL.",
    non_negotiables: "Strong background in distributed systems and SQL optimization.",
    deal_breakers: "No experience with typed languages like Go or Rust.",
    skills: ['Go', 'PostgreSQL', 'AWS']
  },
  {
    problem_statement: "We are launching a cross-platform mobile app for our fintech product.",
    expectations: "Develop a secure, high-performance mobile app using Flutter. Integrate with REST APIs.",
    non_negotiables: "Experience with mobile security best practices.",
    deal_breakers: "Only native development experience without framework knowledge.",
    skills: ['Flutter', 'Android', 'iOS']
  },
  {
    problem_statement: "Designing a serverless backend for an e-commerce platform with sudden traffic spikes.",
    expectations: "Leverage AWS Lambda and DynamoDB for cost-effective scaling. Implement event-driven updates.",
    non_negotiables: "Experience with AWS Lambda and Serverless framework.",
    deal_breakers: "Heavy preference for long-running server instances.",
    skills: ['Node.js', 'AWS', 'Terraform']
  },
  {
    problem_statement: "Our AI model inference is too slow for real-time video processing.",
    expectations: "Optimize PyTorch models for deployment. Implement efficient batching and multi-threading in C++.",
    non_negotiables: "Deep knowledge of PyTorch and C++ performance tuning.",
    deal_breakers: "No experience with machine learning model deployment.",
    skills: ['Python', 'C++', 'Java']
  }
];

const CANDIDATE_TEMPLATES = [
  {
    intent: "I am looking for a Senior Backend role where I can architect scalable distributed systems.",
    why: "I thrive in solving complex concurrency problems and optimizing system performance.",
    tech: ['Go', 'Rust', 'Kubernetes', 'AWS', 'PostgreSQL']
  },
  {
    intent: "Seeking a Full Stack Engineer position with a focus on React and Node.js.",
    why: "I value clean code and developer experience. I am passionate about building products users love.",
    tech: ['React', 'Node.js', 'TypeScript', 'Next.js', 'GraphQL']
  },
  {
    intent: "I am a DevOps Engineer looking to help teams automate their infrastructure.",
    why: "I believe in 'Infrastructure as Code' and want to eliminate manual toil.",
    tech: ['Docker', 'Kubernetes', 'Terraform', 'Ansible', 'AWS']
  },
  {
    intent: "Aspiring Mobile Developer looking for opportunities in the fintech space.",
    why: "I am fascinated by the challenge of making secure financial tools accessible on mobile devices.",
    tech: ['Flutter', 'React Native', 'Swift', 'Kotlin']
  },
  {
    intent: "Data Engineer interested in building real-time processing pipelines.",
    why: "I enjoy turning raw data into actionable insights.",
    tech: ['Python', 'Django', 'PostgreSQL', 'MongoDB', 'Redis']
  },
  {
    intent: "UI/UX Designer who codes. Bridging the gap between pixels and production.",
    why: "I hate seeing great designs compromised by poor implementation.",
    tech: ['React', 'TypeScript', 'Next.js']
  },
  {
    intent: "Security Engineer focused on Zero Trust architecture and pentesting.",
    why: "Security shouldn't be an afterthought; it should be the foundation.",
    tech: ['Go', 'Python', 'Docker', 'Kubernetes']
  }
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Fetch existing users to interact with
  const existingUsers = await prisma.user.findMany({
    include: { companies: true }
  });
  
  const existingCandidates = existingUsers.filter(u => u.role === UserRole.candidate);
  const existingRecruiters = existingUsers.filter(u => u.role === UserRole.recruiter);

  console.log(`📡 Found ${existingCandidates.length} existing candidates and ${existingRecruiters.length} existing recruiters.`);

  // 2. Create NEW Recruiters (20) & Companies (20)
  const newRecruiters = [];
  const allCompanies = [...existingUsers.flatMap(u => u.companies)];

  for (let i = 0; i < 20; i++) {
    const recruiter = await prisma.user.create({
      data: {
        role: UserRole.recruiter,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        photo_url: faker.image.avatar(),
        created_at: faker.date.past()
      }
    });
    newRecruiters.push(recruiter);

    const company = await prisma.company.create({
      data: {
        name: faker.company.name(),
        website: faker.internet.url(),
        verified: faker.datatype.boolean(0.7),
        recruiter_id: recruiter.id,
        created_at: faker.date.past()
      }
    });
    allCompanies.push(company);
  }
  console.log(`✅ Created 20 new recruiters and companies`);

  // 3. Create NEW Candidates (100) & Skills
  const newCandidates = [];
  for (let i = 0; i < 100; i++) {
    const template = faker.helpers.arrayElement(CANDIDATE_TEMPLATES);
    const candidate = await prisma.user.create({
      data: {
        role: UserRole.candidate,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        photo_url: faker.image.avatar(),
        intent_text: template.intent,
        why_text: template.why,
        constraints_json: {
          preferred_salary: faker.number.int({ min: 80000, max: 250000 }),
          preferred_locations: [faker.location.city(), 'Remote'],
          remote_only: faker.datatype.boolean(0.3)
        },
        skills: {
          create: template.tech.map(s => ({
            name: s,
            source: faker.helpers.arrayElement(['manual', 'github', 'linkedin']),
            confidence_score: faker.number.float({ min: 0.6, max: 0.95 })
          }))
        }
      }
    });
    newCandidates.push(candidate);
  }
  const allCandidates = [...existingCandidates, ...newCandidates];
  console.log(`✅ Created 100 new candidates. Total: ${allCandidates.length}`);

  // 4. Create NEW Jobs (200 total)
  const allJobs = [];
  // Ensure every company has at least some jobs
  for (const company of allCompanies) {
    const jobCount = faker.number.int({ min: 2, max: 6 });
    for (let j = 0; j < jobCount; j++) {
      const template = faker.helpers.arrayElement(JOB_TEMPLATES);
      const job = await prisma.job.create({
        data: {
          company_id: company.id,
          problem_statement: template.problem_statement,
          expectations: template.expectations,
          non_negotiables: template.non_negotiables,
          deal_breakers: template.deal_breakers,
          skills_required: template.skills,
          constraints_json: {
            salary_range: [faker.number.int({ min: 100000, max: 130000 }), faker.number.int({ min: 140000, max: 250000 })],
            location: faker.helpers.arrayElement([faker.location.city(), 'Remote']),
            role_type: faker.helpers.arrayElement(['Full-time', 'Contract', 'Founding Engineer'])
          }
        }
      });
      allJobs.push(job);
    }
  }
  console.log(`✅ Created ${allJobs.length} new jobs across ${allCompanies.length} companies`);

  // 5. Generate Interactions (Swipes & Matches) - Massive scale
  console.log('🔄 Generating swipes and matches...');
  let swipeCount = 0;
  let matchCount = 0;

  for (const candidate of allCandidates) {
    // Each candidate swipes on 15-30 random jobs
    const sampleJobs = faker.helpers.arrayElements(allJobs, faker.number.int({ min: 15, max: 30 }));
    for (const job of sampleJobs) {
      const direction = faker.helpers.arrayElement([SwipeDirection.left, SwipeDirection.right]);
      
      try {
        await prisma.swipe.create({
          data: {
            user_id: candidate.id,
            job_id: job.id,
            direction: direction,
            created_at: faker.date.recent({ days: 14 })
          }
        });
        swipeCount++;

        // If candidate swiped right, maybe recruiter swiped right too (Match!)
        if (direction === SwipeDirection.right && faker.datatype.boolean(0.2)) {
           // Create a recruiter swipe for this candidate on this job
           const company = allCompanies.find(c => c.id === job.company_id);
           if (company) {
              await prisma.swipe.create({
                data: {
                  user_id: company.recruiter_id,
                  job_id: job.id,
                  target_user_id: candidate.id,
                  direction: SwipeDirection.right,
                  created_at: faker.date.recent({ days: 10 })
                } as any
              });
              
              // Create the match
              await prisma.match.create({
                data: {
                  candidate_id: candidate.id,
                  job_id: job.id,
                  reveal_status: true,
                  explainability_json: { 
                    reason: "Automated match from seed",
                    score: faker.number.float({ min: 0.85, max: 0.99 })
                  }
                }
              });
              matchCount++;

              // Add a few messages
              if (faker.datatype.boolean(0.6)) {
                 await prisma.message.create({
                   data: {
                     match_id: (await prisma.match.findFirst({ where: { candidate_id: candidate.id, job_id: job.id } }))!.id,
                     sender_id: candidate.id,
                     content: faker.helpers.arrayElement([
                       "Hey, I'm really interested in this problem statement!",
                       "Your expectations align perfectly with my background.",
                       "Can we talk more about the scalability challenges?"
                     ])
                   }
                 });
              }
           }
        }
      } catch (e) {
        // Skip duplicates
      }
    }
  }

  console.log(`✅ Seeded ${swipeCount} swipes and ${matchCount} mutual matches.`);
  console.log('✨ Dummy data injection complete. The UX should now feel populated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
