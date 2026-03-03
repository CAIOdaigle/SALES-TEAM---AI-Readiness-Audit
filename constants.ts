import { CategoryDefinition, CategoryId, MaturityTier, Question } from './types';

export const INDUSTRIES = [
  'Construction',
  'Real Estate',
  'Healthcare & Life Sciences',
  'Financial Services & Insurance',
  'Retail & Ecommerce',
  'Manufacturing & Supply Chain',
  'Professional Services',
  'Hospitality & Food Service',
  'Education',
  'Technology & SaaS',
  'Other',
];

export const EMPLOYEE_COUNTS = [
  'Under 50',
  '50–150',
  '150–500',
  '500–1,000',
  '1,000+',
];

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'adoption_culture',
    name: 'AI Adoption & Culture',
    weight: 0.20,
    description: 'How your team is using AI, who trained them, and how standardized their workflows are.',
    serviceConnection: 'AI literacy programs, prompt engineering training, workflow standardization',
    questionIds: ['q6', 'q7', 'q12'],
  },
  {
    id: 'governance_policy',
    name: 'Governance & Policy',
    weight: 0.30,
    description: 'Who owns AI strategy, whether policies exist, and how tools are managed.',
    serviceConnection: 'Fractional CAIO engagement, AI policy creation, tool governance, organizational design',
    questionIds: ['q8', 'q9', 'q14'],
  },
  {
    id: 'risk_compliance',
    name: 'Risk & Compliance',
    weight: 0.30,
    description: 'Whether proprietary data is protected, outputs are reviewed, and hallucination risks are managed.',
    serviceConnection: 'CAIO governance framework, AI use policy development, risk audit services',
    questionIds: ['q11', 'q13', 'q17'],
  },
  {
    id: 'roi_operationalization',
    name: 'ROI & Operationalization',
    weight: 0.20,
    description: 'Whether AI results are measured, training is ongoing, and AI is integrated into core systems.',
    serviceConnection: 'AI roadmap development, system integration consulting, training program design',
    questionIds: ['q10', 'q15', 'q16'],
  },
];

export const MATURITY_TIERS = [
  {
    tier: 'Exposed' as MaturityTier,
    minPercent: 0,
    maxPercent: 25,
    description: 'No strategy, no guardrails. AI is happening to you, not for you. High risk of data leakage, compliance gaps, and wasted spend.',
  },
  {
    tier: 'Experimenting' as MaturityTier,
    minPercent: 26,
    maxPercent: 50,
    description: 'Some activity and awareness, but no structure. Individual enthusiasts are carrying the load. Results are anecdotal and ungoverned.',
  },
  {
    tier: 'Operationalizing' as MaturityTier,
    minPercent: 51,
    maxPercent: 75,
    description: 'Real systems are forming. Policy exists, some measurement is happening, but gaps remain in enforcement, training, or integration.',
  },
  {
    tier: 'Optimizing' as MaturityTier,
    minPercent: 76,
    maxPercent: 100,
    description: 'Mature AI posture. Strategy is owned, governed, measured, and integrated. Focus shifts to continuous improvement and competitive advantage.',
  },
];

export const INDUSTRY_BENCHMARKS: Record<string, Record<CategoryId, number>> = {
  'Construction': {
    adoption_culture: 25,
    governance_policy: 20,
    risk_compliance: 25,
    roi_operationalization: 20,
  },
  'Real Estate': {
    adoption_culture: 35,
    governance_policy: 25,
    risk_compliance: 25,
    roi_operationalization: 30,
  },
  'Healthcare & Life Sciences': {
    adoption_culture: 35,
    governance_policy: 40,
    risk_compliance: 45,
    roi_operationalization: 25,
  },
  'Financial Services & Insurance': {
    adoption_culture: 45,
    governance_policy: 55,
    risk_compliance: 50,
    roi_operationalization: 35,
  },
  'Retail & Ecommerce': {
    adoption_culture: 50,
    governance_policy: 30,
    risk_compliance: 30,
    roi_operationalization: 40,
  },
  'Manufacturing & Supply Chain': {
    adoption_culture: 30,
    governance_policy: 25,
    risk_compliance: 30,
    roi_operationalization: 30,
  },
  'Professional Services': {
    adoption_culture: 45,
    governance_policy: 40,
    risk_compliance: 35,
    roi_operationalization: 30,
  },
  'Hospitality & Food Service': {
    adoption_culture: 30,
    governance_policy: 20,
    risk_compliance: 20,
    roi_operationalization: 25,
  },
  'Education': {
    adoption_culture: 40,
    governance_policy: 30,
    risk_compliance: 30,
    roi_operationalization: 25,
  },
  'Technology & SaaS': {
    adoption_culture: 60,
    governance_policy: 45,
    risk_compliance: 40,
    roi_operationalization: 45,
  },
};

export const CROSS_INDUSTRY_BENCHMARKS: Record<CategoryId, number> = {
  adoption_culture: 40,
  governance_policy: 33,
  risk_compliance: 33,
  roi_operationalization: 30,
};

export const SURVEY_QUESTIONS: Question[] = [
  {
    id: 'q6',
    text: 'Is your team using AI tools in their day-to-day work, and is it actually helping?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'adoption_culture',
    options: [
      { text: 'Yes', score: 3 },
      { text: 'No', score: 0 },
      { text: 'Maybe', score: 2 },
      { text: "I don't know", score: 1 },
    ],
  },
  {
    id: 'q7',
    text: 'How did your team learn to use AI?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'adoption_culture',
    options: [
      { text: 'An outside expert or formal program', score: 3 },
      { text: 'I (or another leader) trained them', score: 2 },
      { text: 'They taught themselves', score: 1 },
      { text: 'Social media (TikTok, Instagram, YouTube)', score: 0 },
    ],
  },
  {
    id: 'q12',
    text: 'When different people on your team use AI, are they following the same playbook or doing their own thing?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'adoption_culture',
    options: [
      { text: 'Documented playbooks and templates everyone follows', score: 3 },
      { text: 'Some shared examples, but not standardized', score: 2 },
      { text: 'Everyone does their own thing', score: 1 },
      { text: 'No idea how people are using it', score: 0 },
    ],
  },
  {
    id: 'q8',
    text: "Is there a specific person or group responsible for your company's AI direction?",
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'governance_policy',
    options: [
      { text: 'Yes, a named leader or committee', score: 3 },
      { text: 'Shared informally across managers', score: 2 },
      { text: 'A few individual enthusiasts', score: 1 },
      { text: 'No clear owner', score: 0 },
    ],
  },
  {
    id: 'q9',
    text: "Does your company have a written policy that tells employees what AI tools they can use, what data they can put in, and what's off limits?",
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'governance_policy',
    options: [
      { text: "Yes, it's current and enforced", score: 3 },
      { text: "A draft exists but it's not enforced", score: 2 },
      { text: "We're working on it", score: 1 },
      { text: 'No', score: 0 },
    ],
  },
  {
    id: 'q14',
    text: 'How does your company control which AI tools people use and what happens to those accounts when someone leaves?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'governance_policy',
    options: [
      { text: 'We control access centrally, use secure login, and review regularly', score: 3 },
      { text: 'Some tools are approved, others people signed up for on their own', score: 2 },
      { text: 'People sign up for whatever they want', score: 1 },
      { text: "We don't know who's using what", score: 0 },
    ],
  },
  {
    id: 'q11',
    text: "Are employees putting sensitive company or customer information into AI tools that aren't company-controlled?",
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'risk_compliance',
    options: [
      { text: 'Never — we have strict controls', score: 3 },
      { text: 'Rarely, and we have safeguards', score: 2 },
      { text: 'Sometimes', score: 1 },
      { text: "Probably, but we're not sure", score: 0 },
    ],
  },
  {
    id: 'q13',
    text: 'Do managers check the work that AI produces before it goes to customers, gets published, or informs a decision?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'risk_compliance',
    options: [
      { text: 'Always', score: 3 },
      { text: 'Often', score: 2 },
      { text: 'Sometimes', score: 1 },
      { text: 'Rarely or never', score: 0 },
    ],
  },
  {
    id: 'q17',
    text: 'When AI tools produce incorrect or risky information, how does your team catch and handle that?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'risk_compliance',
    options: [
      { text: 'We have documented processes, escalation steps, and keep records', score: 3 },
      { text: 'Managers spot-check important work', score: 2 },
      { text: 'People fix problems as they find them', score: 1 },
      { text: "We trust the tools, or haven't addressed it", score: 0 },
    ],
  },
  {
    id: 'q10',
    text: 'Are you measuring whether AI is actually saving time, reducing errors, or making money for the company?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'roi_operationalization',
    options: [
      { text: 'Yes, we measure and report on it', score: 3 },
      { text: 'Some tracking, mostly anecdotal', score: 2 },
      { text: 'Not yet, but we plan to', score: 1 },
      { text: 'No', score: 0 },
    ],
  },
  {
    id: 'q15',
    text: 'How often does your team receive structured training on AI tools and how to use them?',
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'roi_operationalization',
    options: [
      { text: 'Regularly scheduled and part of our development plan', score: 3 },
      { text: 'A few times a year, loosely scheduled', score: 2 },
      { text: 'We did it once, or it happens ad hoc', score: 1 },
      { text: 'Never', score: 0 },
    ],
  },
  {
    id: 'q16',
    text: "Is AI built into the systems your team uses every day (like your CRM, helpdesk, or operations software) with clear rules for how it's used?",
    description: 'Select one.',
    type: 'radio',
    required: true,
    category: 'roi_operationalization',
    options: [
      { text: 'Yes, AI is built in and we have clear guidelines', score: 3 },
      { text: "We're testing it in a few teams", score: 2 },
      { text: 'People copy-paste between AI tools and our systems manually', score: 1 },
      { text: 'Not yet', score: 0 },
    ],
  },
];

export const MAX_RAW_SCORE_PER_CATEGORY = 9;
export const MAX_WEIGHTED_SCORE = 100;
