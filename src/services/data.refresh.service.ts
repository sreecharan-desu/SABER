import prisma from '../config/prisma';
import * as githubDataService from './github.data.service';
import * as linkedinDataService from './linkedin.data.service';
import * as oauthProviders from './oauth.providers';

export const refreshAllUsersData = async () => {
    console.log('[REFRESH] Starting global data refresh...');
    
    // 1. Fetch all OAuth accounts for GitHub and LinkedIn
    const accounts = await prisma.oAuthAccount.findMany({
        where: {
            provider: { in: ['github', 'linkedin'] }
        },
        include: { user: true }
    });

    console.log(`[REFRESH] Found ${accounts.length} accounts to check.`);

    for (const account of accounts) {
        try {
            const acc = account as any;
            let token = acc.access_token;
            
            // Check if token needs refresh (if expires_at is in the past)
            if (acc.expires_at && acc.expires_at < new Date() && acc.refresh_token) {
                console.log(`[REFRESH] Token expired for user ${acc.user_id} (${acc.provider}). Refreshing...`);
                const tokenData = await oauthProviders.refreshAccessToken(acc.provider, acc.refresh_token);
                
                if (tokenData.access_token) {
                    token = tokenData.access_token;
                    // Update account with new tokens
                    await prisma.oAuthAccount.update({
                        where: { id: acc.id },
                        data: {
                            access_token: token,
                            refresh_token: tokenData.refresh_token || acc.refresh_token,
                            expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null
                        } as any
                    });
                }
            }

            if (!token) {
                console.log(`[REFRESH] No token available for user ${acc.user_id} (${acc.provider})`);
                continue;
            }

            // Trigger extraction based on provider
            if (acc.provider === 'github') {
                console.log(`[REFRESH] Refreshing GitHub data for user ${acc.user_id}`);
                await githubDataService.extractAndStoreGithubData(acc.user_id, token);
            } else if (acc.provider === 'linkedin') {
                console.log(`[REFRESH] Refreshing LinkedIn data for user ${acc.user_id}`);
                await linkedinDataService.extractAndStoreLinkedinData(acc.user_id, token, acc.raw_data_json);
            }

        } catch (error: any) {
            console.error(`[REFRESH] Failed to refresh user ${account.user_id} (${account.provider}):`, error.message);
        }
    }

    console.log('[REFRESH] Global data refresh complete.');
};
