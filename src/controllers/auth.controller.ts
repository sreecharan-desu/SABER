import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as oauthProviders from '../services/oauth.providers';
import * as userService from '../services/user.service';
import * as githubDataService from '../services/github.data.service';
import { generateToken } from '../utils/jwt';

import { config } from '../config/env';

const callbackSchema = z.object({
  provider: z.enum(['google', 'github', 'linkedin']),
  code: z.string(),
  redirect_uri: z.string().optional(),
});

export const handleOAuthCallbackGET = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>No authorization code received from OAuth provider.</p>
            <p>Please try logging in again.</p>
          </body>
        </html>
      `);
    }

    // Return HTML page with instructions for frontend
    res.send(`
      <html>
        <head>
          <title>SABER - OAuth Success</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 500px;
              text-align: center;
            }
            h1 { color: #333; margin-bottom: 1rem; }
            p { color: #666; line-height: 1.6; }
            code {
              background: #f4f4f4;
              padding: 0.2rem 0.5rem;
              border-radius: 4px;
              font-size: 0.9em;
              word-break: break-all;
            }
            .success { color: #10b981; font-size: 3rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>OAuth Authorization Successful</h1>
            <p>Your authorization code has been received.</p>
            <p><strong>Authorization Code:</strong></p>
            <p><code>${code}</code></p>
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid #eee;">
            <h3>For Frontend Developers:</h3>
            <p>Send a POST request to <code>/api/auth/oauth/callback</code> with:</p>
            <pre style="text-align: left; background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto;">
{
  "provider": "google|github|linkedin",
  "code": "${code}"
}</pre>
            <p style="margin-top: 2rem; font-size: 0.9em; color: #999;">
              This page is for testing purposes. In production, the frontend will handle this automatically.
            </p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};

export const handleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, code, redirect_uri } = callbackSchema.parse(req.body);
    const redirectUri = redirect_uri || `${config.baseUrl}/api/auth/oauth/callback`; 

    let profile;
    switch (provider) {
      case 'google':
        profile = await oauthProviders.getGoogleProfile(code, redirectUri);
        break;
      case 'github':
        profile = await oauthProviders.getGithubProfile(code, redirectUri);
        break;
      case 'linkedin':
        profile = await oauthProviders.getLinkedinProfile(code, redirectUri);
        break;
      default:
        throw new Error('Invalid provider');
    }

    const user = await userService.findOrCreateUserConfirmingIdentity(profile);
    
    // Trigger GitHub data extraction in background if available
    if (provider === 'github' && profile.accessToken) {
      githubDataService.extractAndStoreGithubData(user.id, profile.accessToken);
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const linkProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { provider, code, redirect_uri } = callbackSchema.parse(req.body);
    const redirectUri = redirect_uri || `${config.baseUrl}/api/auth/oauth/callback`;

    let profile;
    switch (provider) {
      case 'google':
        profile = await oauthProviders.getGoogleProfile(code, redirectUri);
        break;
      case 'github':
        profile = await oauthProviders.getGithubProfile(code, redirectUri);
        break;
      case 'linkedin':
        profile = await oauthProviders.getLinkedinProfile(code, redirectUri);
        break;
        default:
          throw new Error('Invalid provider');
    }

    await userService.linkOAuthCloudAccount((req.user as any)?.id, profile);
    
    // Trigger GitHub data extraction in background if available
    if (provider === 'github' && profile.accessToken) {
      githubDataService.extractAndStoreGithubData((req.user as any).id, profile.accessToken);
    }
    
    res.json({ status: 'ok', message: 'Provider linked successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  res.json(req.user);
};
