import { Answers, AuditResult, Notes, CompanyContext } from '../types';
import { SURVEY_QUESTIONS, CATEGORIES, MATURITY_TIERS, INDUSTRY_BENCHMARKS, CROSS_INDUSTRY_BENCHMARKS } from '../constants';
import { calculateAuditResult } from './scoringService';

const WORKER_URL = 'https://gemini-proxy.askai.workers.dev';

export async function getAIAssessment(
  answers: Answers,
  notes: Notes,
  companyContext: CompanyContext
): Promise<{ result: AuditResult; narrative: string }> {
  const result = calculateAuditResult(answers, notes, companyContext);

  const displayIndustry = companyContext.customIndustry || companyContext.industry;
  const benchmarks = INDUSTRY_BENCHMARKS[companyContext.industry] || null;
  const fallbackBenchmarks = CROSS_INDUSTRY_BENCHMARKS;
  const usedBenchmarks = benchmarks || fallbackBenchmarks;
  const benchmarkSource = benchmarks ? displayIndustry : 'cross-industry';

  const categoryDetails = result.categoryScores.map(cs => {
    const category = CATEGORIES.find(c => c.id === cs.categoryId)!;
    const questions = SURVEY_QUESTIONS.filter(q => q.category === cs.categoryId);
    const qDetails = questions.map(q => {
      const answer = answers[q.id];
      const option = q.options?.find(o => o.text === answer);
      const noteText = notes[q.id] ? `\n      Salesperson Context: "${notes[q.id]}"` : '';
      return `    - Q: ${q.text}\n      Answer: ${answer} (Score: ${option?.score ?? 'N/A'}/3)${noteText}`;
    }).join('\n');
    return `**${cs.categoryName}** (Weight: ${cs.weight * 100}%)
    Raw Score: ${cs.rawScore}/${cs.maxRawScore} (${cs.percentage}%)
    Maturity Tier: ${cs.tier}
    Service Connection: ${category.serviceConnection}
    ${qDetails}`;
  }).join('\n\n');

  const overallTierDef = MATURITY_TIERS.find(t => t.tier === result.overallTier)!;

  const benchmarkBlock = result.categoryScores.map(cs => {
    const benchmark = usedBenchmarks[cs.categoryId];
    const diff = cs.percentage - benchmark;
    const position = diff > 10 ? 'above' : diff < -10 ? 'below' : 'in line with';
    return `- ${cs.categoryName}: Their score ${cs.percentage}% vs. ${benchmarkSource} average ${benchmark}% (${position} peers)`;
  }).join('\n');

  const tierOrder: string[] = ['Exposed', 'Experimenting', 'Operationalizing', 'Optimizing'];
  const currentTierIndex = tierOrder.indexOf(result.overallTier);
  const nextTier = currentTierIndex < 3 ? tierOrder[currentTierIndex + 1] : 'Optimizing';

  const strongestCategory = [...result.categoryScores].sort((a, b) => b.percentage - a.percentage)[0];

  let nextStepCTA = '';
  let nextStepWho = '';
  const nextStepFraming = 'Most mid-market companies address these priorities through a focused 90-day engagement starting with governance foundations.';

  if (result.overallTier === 'Optimizing') {
    nextStepCTA = `Schedule a 30-minute session with ChiefAIOfficer.com to identify advanced optimization opportunities and competitive advantages for ${companyContext.companyName}.`;
  } else {
    if (['risk_compliance', 'governance_policy'].includes(result.topRisk.categoryId)) {
      nextStepCTA = `Schedule a 30-minute AI Governance Assessment with ChiefAIOfficer.com to build ${companyContext.companyName}'s risk mitigation roadmap and move from ${result.overallTier} to ${nextTier} within 90 days.`;
    } else {
      nextStepCTA = `Schedule a 30-minute AI Strategy Session with ChiefAIOfficer.com to build ${companyContext.companyName}'s roadmap for moving from ${result.overallTier} to ${nextTier} within 90 days.`;
    }
  }

  switch (result.topRisk.categoryId) {
    case 'governance_policy':
      nextStepWho = `We recommend including ${companyContext.companyName}'s operations lead or the person currently closest to AI decisions.`;
      break;
    case 'risk_compliance':
      nextStepWho = `Consider including ${companyContext.companyName}'s compliance lead or legal counsel in the session.`;
      break;
    case 'adoption_culture':
      nextStepWho = `Including the team leads who use AI tools daily would make this session most productive.`;
      break;
    case 'roi_operationalization':
      nextStepWho = `We recommend including the leaders responsible for the systems and teams where AI is being piloted.`;
      break;
    default:
      nextStepWho = `We recommend including ${companyContext.companyName}'s leadership team.`;
  }

  const prompt = `You are an expert AI strategy consultant providing feedback on an AI Readiness Audit conducted during a 15-minute sales call with a mid-market CEO. Generate a clear, actionable scorecard narrative.

## CRITICAL FORMATTING RULE
Throughout the ENTIRE output, use the company name "${companyContext.companyName}" every time you refer to the prospect's organization. NEVER use "your organization", "your company", "your team", "you are", "you have", or any second-person possessive.

## COMPANY CONTEXT
- Company: ${companyContext.companyName}
- Industry: ${displayIndustry}
- Employee Count: ${companyContext.employeeCount}

## AUDIT RESULTS
**Overall Score:** ${result.overallScore}/100
**Overall Maturity Tier:** ${result.overallTier}
**Tier Definition:** ${overallTierDef.description}
**Highest Risk Area:** ${result.topRisk.categoryName} - scored ${result.topRisk.percentage}% (${result.topRisk.tier})

### Category Breakdown:
${categoryDetails}

### Peer Benchmarks (${benchmarkSource}):
${benchmarkBlock}

## PATTERN IDENTIFICATION
Analyze the relationship between Adoption and Governance scores:
- Pattern A (Never Started): Low Adoption, Low Governance.
- Pattern B (Tried and Pulled Back): Moderate Governance, Low Adoption.
- Pattern C (Active but Ungoverned): High Adoption, Low Governance.
- Pattern D (Structured but Early): High Governance, Low Adoption.

Use the appropriate pattern sentence as the FIRST sentence of the Overall Assessment.

## OUTPUT STRUCTURE
Generate Markdown with EXACTLY these sections:

### Overall Assessment
One paragraph. Start with pattern sentence. State ${companyContext.companyName} scored ${result.overallScore}/100 at ${result.overallTier} tier.

### Category Scores
For each category (lowest to highest), 2-3 sentences with score, tier, specific answers, and one benchmark comparison.

### Top Risk: ${result.topRisk.categoryName}
3-4 sentences about why this is the most urgent gap.

### Estimated Business Impact
Productivity gap, risk exposure, and governance cost estimates scaled to company size.

### Priority Actions
3 numbered recommendations:
- Rec 1 & 2: Gap-fill targeting two lowest categories with industry-specific system names
- Rec 3: Acceleration targeting strongest category (${strongestCategory.categoryName} at ${strongestCategory.percentage}%)
Each names a CAIO service: "Fractional Chief AI Officer Engagement", "AI Governance & Policy Development", or "AI Training & Enablement Program"

### Next Step
Exactly these three sentences:
1. "${nextStepCTA}"
2. "${nextStepWho}"
3. "${nextStepFraming}"

## TONE AND STYLE
- Professional and direct. Use "${companyContext.companyName}" exclusively.
- Reference specific answers and salesperson notes throughout.
- BANNED PHRASES: "significant untapped potential", "digital transformation", "leverage AI", "holistic approach", "unlock value", "optimize your AI journey"
- Total output: under 900 words.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`Worker responded with ${response.status}`);
    const data = await response.json();
    return { result, narrative: data.text || '' };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error generating AI assessment:', error);
    return { result, narrative: 'There was an error generating your AI-powered feedback. Please try again later.' };
  }
}
