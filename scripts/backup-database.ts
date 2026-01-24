import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Use RAW Prisma client WITHOUT encryption extension to get actual DB data
const prisma = new PrismaClient();

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', timestamp);

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`Starting database backup...`);
    console.log(`Backup directory: ${backupDir}\n`);

    try {
        // Backup Users
        const users = await prisma.user.findMany({
            include: {
                oauth_accounts: true,
                skills: true,
                payments: true,
            },
        });
        fs.writeFileSync(
            path.join(backupDir, 'users.json'),
            JSON.stringify(users, null, 2)
        );
        console.log(`Backed up ${users.length} users`);

        // Backup Companies
        const companies = await prisma.company.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'companies.json'),
            JSON.stringify(companies, null, 2)
        );
        console.log(`Backed up ${companies.length} companies`);

        // Backup Jobs
        const jobs = await prisma.job.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'jobs.json'),
            JSON.stringify(jobs, null, 2)
        );
        console.log(`Backed up ${jobs.length} jobs`);

        // Backup Swipes
        const swipes = await prisma.swipe.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'swipes.json'),
            JSON.stringify(swipes, null, 2)
        );
        console.log(`Backed up ${swipes.length} swipes`);

        // Backup Matches
        const matches = await prisma.match.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'matches.json'),
            JSON.stringify(matches, null, 2)
        );
        console.log(`Backed up ${matches.length} matches`);

        // Backup Messages
        const messages = await prisma.message.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'messages.json'),
            JSON.stringify(messages, null, 2)
        );
        console.log(`Backed up ${messages.length} messages`);

        // Backup Applications
        const applications = await prisma.application.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'applications.json'),
            JSON.stringify(applications, null, 2)
        );
        console.log(`Backed up ${applications.length} applications`);

        // Backup Bookmarks
        const bookmarks = await prisma.bookmark.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'bookmarks.json'),
            JSON.stringify(bookmarks, null, 2)
        );
        console.log(`Backed up ${bookmarks.length} bookmarks`);

        // Backup RecommendationProfiles
        const recommendationProfiles = await prisma.recommendationProfile.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'recommendation_profiles.json'),
            JSON.stringify(recommendationProfiles, null, 2)
        );
        console.log(`Backed up ${recommendationProfiles.length} recommendation profiles`);

        // Backup API Keys
        const apiKeys = await prisma.apiKey.findMany();
        fs.writeFileSync(
            path.join(backupDir, 'api_keys.json'),
            JSON.stringify(apiKeys, null, 2)
        );
        console.log(`Backed up ${apiKeys.length} API keys`);

        // Create metadata file
        const metadata = {
            backup_date: new Date().toISOString(),
            total_records: {
                users: users.length,
                companies: companies.length,
                jobs: jobs.length,
                swipes: swipes.length,
                matches: matches.length,
                messages: messages.length,
                applications: applications.length,
                bookmarks: bookmarks.length,
                recommendation_profiles: recommendationProfiles.length,
                api_keys: apiKeys.length,
            },
        };
        fs.writeFileSync(
            path.join(backupDir, 'metadata.json'),
            JSON.stringify(metadata, null, 2)
        );

        console.log(`Backup completed successfully!`);
        console.log(`Location: ${backupDir}`);
        console.log(`To restore from this backup, use: npm run restore-backup ${timestamp}`);
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

backupDatabase();
