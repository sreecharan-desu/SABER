import axios from 'axios';
import prisma from '../config/prisma';

export const extractAndStoreGithubData = async (userId: string, accessToken: string) => {
  try {
    const startTime = Date.now();
    console.log(`[GITHUB] Attempting extraction for user ${userId}. Token length: ${accessToken.length}`);
    
    // 1. Fetch User Repos 
    const { data: repos } = await axios.get('https://api.github.com/user/repos?visibility=public&per_page=100&sort=updated', {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'SABER-Backend'
      },
    });

    if (!Array.isArray(repos) || repos.length === 0) {
       console.log(`[GITHUB] No public repos found for user ${userId}`);
       return;
    }

    console.log(`[GITHUB] Found ${repos.length} candidates for processing. Limiting to top 30 for performance.`);
    const activeRepos = repos.slice(0, 30);
    const skillMap: Record<string, { weight: number, count: number, lastUsed: Date }> = {};

    // 2. Process repos in small batches to avoid rate limits
    const processRepo = async (repo: any) => {
      try {
        const { name: repoName, owner: { login: ownerLogin }, pushed_at: lastPushed, fork } = repo;
        const lastPushedDate = new Date(lastPushed);

        // Fetch Languages & Topics in parallel
        const [langRes, topicRes] = await Promise.all([
          axios.get(`https://api.github.com/repos/${ownerLogin}/${repoName}/languages`, {
            headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'SABER-Backend' },
          }).catch(() => ({ data: {} })),
          axios.get(`https://api.github.com/repos/${ownerLogin}/${repoName}/topics`, {
            headers: { 
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.mercy-preview+json',
              'User-Agent': 'SABER-Backend'
            },
          }).catch(() => ({ data: { names: [] } }))
        ]);

        const languages = langRes.data;
        const topics = (topicRes.data as any).names || [];

        // Aggregate Languages
        for (const [lang, bytes] of Object.entries(languages)) {
          const normalizedLang = normalizeSkillName(lang);
          if (!skillMap[normalizedLang]) {
            skillMap[normalizedLang] = { weight: 0, count: 0, lastUsed: lastPushedDate };
          }
          skillMap[normalizedLang].weight += Number(bytes);
          skillMap[normalizedLang].count += 1;
          if (lastPushedDate > skillMap[normalizedLang].lastUsed) {
            skillMap[normalizedLang].lastUsed = lastPushedDate;
          }
        }

        // Aggregate Topics
        for (const topic of topics) {
          const normalizedTopic = normalizeSkillName(topic as string);
          if (!skillMap[normalizedTopic]) {
            skillMap[normalizedTopic] = { weight: 0, count: 0, lastUsed: lastPushedDate };
          }
          skillMap[normalizedTopic].weight += (fork ? 1000 : 5000); // Significant signal boost
          skillMap[normalizedTopic].count += 1;
          if (lastPushedDate > skillMap[normalizedTopic].lastUsed) {
            skillMap[normalizedTopic].lastUsed = lastPushedDate;
          }
        }
      } catch (err: any) {
        console.warn(`[GITHUB] Skipped repo ${repo.name}: ${err.message}`);
      }
    };

    // Use a simple batch processing to not overwhelm the API
    for (let i = 0; i < activeRepos.length; i += 5) {
      const batch = activeRepos.slice(i, i + 5);
      await Promise.all(batch.map(processRepo));
    }

    // 3. Normalize and calculate confidence scores
    const totalWeight = Object.values(skillMap).reduce((acc, s) => acc + s.weight, 0);
    const now = new Date();

    const skillsToUpsert = Object.entries(skillMap).map(([name, data]) => {
      const significanceRatio = totalWeight > 0 ? (data.weight / totalWeight) : 0;
      const monthsSinceLastUse = (now.getTime() - data.lastUsed.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const recencyFactor = Math.max(0.1, 1 - (monthsSinceLastUse / 24)); // Decay over 2 years

      let confidenceScore = (significanceRatio * 0.5 + recencyFactor * 0.5);
      confidenceScore = Math.min(0.99, Math.max(0.2, confidenceScore));

      return {
        name,
        confidence_score: parseFloat(confidenceScore.toFixed(2)),
        source: 'github',
      };
    }).sort((a,b) => b.confidence_score - a.confidence_score);

    if (skillsToUpsert.length === 0) {
        console.log(`[GITHUB] No skills extracted for user ${userId}`);
        return;
    }

    // 4. Persistence
    await prisma.$transaction([
      prisma.skill.deleteMany({
        where: { user_id: userId, source: 'github' }
      }),
      prisma.skill.createMany({
        data: skillsToUpsert.map(s => ({ ...s, user_id: userId }))
      })
    ]);

    const duration = Date.now() - startTime;
    console.log(`[GITHUB] Success for ${userId}. Extracted ${skillsToUpsert.length} skills in ${duration}ms.`);

  } catch (error: any) {
    console.error(`[GITHUB] Critical extraction error for user ${userId}:`, error.message);
  }
};

const normalizeSkillName = (name: string): string => {
  const n = name.toLowerCase().trim()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');

  const mapping: Record<string, string> = {
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'python': 'Python',
    'reactjs': 'React',
    'react': 'React',
    'nodejs': 'Node.js',
    'node': 'Node.js',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'k8s': 'Kubernetes',
    'aws': 'AWS',
    'amazon web services': 'AWS',
    'cpp': 'C++',
    'cplusplus': 'C++',
    'csharp': 'C#',
    'cs': 'C#',
    'rust': 'Rust',
    'golang': 'Go',
    'go': 'Go',
    'solidity': 'Solidity',
    'ethereum': 'Web3',
    'web3': 'Web3',
    'css': 'CSS',
    'html': 'HTML',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'angular': 'Angular',
  };

  return mapping[n] || name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
