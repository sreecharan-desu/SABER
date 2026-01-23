import prisma from '../config/prisma';

export const extractAndStoreLinkedinData = async (userId: string, accessToken: string, rawProfile: any) => {
  try {
    // 1. Identify "Signals" in the raw profile
    // LinkedIn OIDC userinfo often includes 'headline' and sometimes 'given_name', 'family_name'
    const headline = rawProfile.headline || '';
    const summary = rawProfile.summary || '';
    const textToAnalyze = `${headline} ${summary}`;

    if (!textToAnalyze.trim()) {
      console.log(`[INFO] No significant LinkedIn text found for user ${userId} to extract signals.`);
      return;
    }

    // 2. Keyword-based skill extraction (as a fallback to deep API access)
    const commonSkills = [
      'TypeScript', 'JavaScript', 'Python', 'React', 'Node.js', 
      'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 
      'Product Management', 'Product Design', 'UI/UX', 'Engineering Manager',
      'Go', 'Solidity', 'Rust', 'Founding Engineer', 'Full Stack', 'Backend', 'Frontend'
    ];

    const extractedSkills: { name: string, confidence_score: number, source: string }[] = [];

    commonSkills.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(textToAnalyze)) {
        extractedSkills.push({
          name: skill,
          confidence_score: 0.8, // High confidence if explicitly in headline
          source: 'linkedin'
        });
      }
    });

    if (extractedSkills.length === 0) return;

    // 3. Store in DB
    await prisma.$transaction([
      prisma.skill.deleteMany({
        where: { user_id: userId, source: 'linkedin' }
      }),
      prisma.skill.createMany({
        data: extractedSkills.map(s => ({ ...s, user_id: userId }))
      })
    ]);

    console.log(`Successfully extracted ${extractedSkills.length} LinkedIn signals for user ${userId}.`);

  } catch (error) {
    console.error('Error extracting LinkedIn data:', error);
  }
};
