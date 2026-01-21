import axios from 'axios';
import prisma from '../config/prisma';

export const extractAndStoreGithubData = async (userId: string, accessToken: string) => {
  try {
    // 1. Fetch User Repos (Publicly available via the public_repo/read:user scopes)
    const { data: repos } = await axios.get('https://api.github.com/user/repos?visibility=public&per_page=100', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const skillMap: Record<string, { weight: number, count: number, lastUsed: Date }> = {};

    // 2. Process each repo
    for (const repo of repos) {
      const { name: repoName, owner: { login: ownerLogin }, pushed_at: lastPushed } = repo;
      const lastPushedDate = new Date(lastPushed);

      // Fetch Languages
      const { data: languages } = await axios.get(`https://api.github.com/repos/${ownerLogin}/${repoName}/languages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Fetch Topics
      const { data: topicsData } = await axios.get(`https://api.github.com/repos/${ownerLogin}/${repoName}/topics`, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.mercy-preview+json' // Still good to keep for topics compatibility
        },
      });
      const topics = topicsData.names || [];

      // Weighting logic:
      // Base weight for language is the number of bytes.
      // We normalize its significance across the whole profile.
      for (const [lang, bytes] of Object.entries(languages)) {
        const normalizedLang = normalizeSkillName(lang);
        if (!skillMap[normalizedLang]) {
          skillMap[normalizedLang] = { weight: 0, count: 0, lastUsed: lastPushedDate };
        }
        
        // Weight = bytes (log scale maybe? Or just sum and normalize later). 
        // Let's use simple weighting for now: frequency + recency.
        skillMap[normalizedLang].weight += Number(bytes);
        skillMap[normalizedLang].count += 1;
        if (lastPushedDate > skillMap[normalizedLang].lastUsed) {
          skillMap[normalizedLang].lastUsed = lastPushedDate;
        }
      }

      // Topics as skills
      for (const topic of topics) {
        const normalizedTopic = normalizeSkillName(topic as string);
        if (!skillMap[normalizedTopic]) {
          skillMap[normalizedTopic] = { weight: 0, count: 0, lastUsed: lastPushedDate };
        }
        // Topics get a flat boost
        skillMap[normalizedTopic].weight += 1000; // Arbitrary boost for topic presence
        skillMap[normalizedTopic].count += 1;
        if (lastPushedDate > skillMap[normalizedTopic].lastUsed) {
          skillMap[normalizedTopic].lastUsed = lastPushedDate;
        }
      }
    }

    // 3. Normalize and calculate confidence scores
    const totalWeight = Object.values(skillMap).reduce((acc, s) => acc + s.weight, 0);
    const now = new Date();

    const skillsToUpsert = Object.entries(skillMap).map(([name, data]) => {
      // Confidence Score calculation (0.0 to 1.0)
      // Factors: 
      // - Share of total bytes/topics (significance)
      // - Recency (how long ago was the last push)
      
      const significanceRatio = totalWeight > 0 ? data.weight / totalWeight : 0;
      
      // Recency factor: Decay over 2 years
      const monthsSinceLastUse = (now.getTime() - data.lastUsed.getTime()) / (1000 * 60 * 60 * 24 * 30);
      const recencyFactor = Math.max(0.2, 1 - (monthsSinceLastUse / 24)); 

      let confidenceScore = (significanceRatio * 0.7 + recencyFactor * 0.3);
      
      // Cap at 0.95 for evidence-based
      confidenceScore = Math.min(0.95, confidenceScore);
      // Floor at 0.1
      confidenceScore = Math.max(0.1, confidenceScore);

      return {
        name,
        confidence_score: parseFloat(confidenceScore.toFixed(2)),
        source: 'github',
      };
    });

    // 4. Store in DB
    // Clear old github skills for this user first to keep it simple, or upsert.
    // Prompt says "Aggregate levels... Normalize... Weight...".
    // We'll replace the old ones with the new analysis.
    await prisma.$transaction([
      prisma.skill.deleteMany({
        where: { user_id: userId, source: 'github' }
      }),
      prisma.skill.createMany({
        data: skillsToUpsert.map(s => ({ ...s, user_id: userId }))
      })
    ]);

    console.log(`Successfully processed GitHub data for user ${userId}. Extracted ${skillsToUpsert.length} skills.`);

  } catch (error) {
    console.error('Error extracting GitHub data:', error);
    // Don't throw, we don't want to crash auth if extraction fails
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
  };

  return mapping[n] || name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};
