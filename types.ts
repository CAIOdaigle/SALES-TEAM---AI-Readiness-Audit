export interface Option {
  text: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'radio';
  required: boolean;
  options?: Option[];
  description?: string;
  category: CategoryId;
}

export type Answers = {
  [key: string]: string;
};

export type Notes = {
  [key: string]: string;
};

export type CategoryId = 'risk_compliance' | 'governance_policy' | 'roi_operationalization' | 'adoption_culture';

export type MaturityTier = 'Exposed' | 'Experimenting' | 'Operationalizing' | 'Optimizing';

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  weight: number;
  description: string;
  serviceConnection: string;
  questionIds: string[];
}

export interface CategoryScore {
  categoryId: CategoryId;
  categoryName: string;
  rawScore: number;
  maxRawScore: number;
  percentage: number;
  tier: MaturityTier;
  weight: number;
  weightedScore: number;
}

export interface CompanyContext {
  companyName: string;
  industry: string;
  customIndustry?: string;
  employeeCount: string;
}

export interface AuditResult {
  overallScore: number;
  overallTier: MaturityTier;
  categoryScores: CategoryScore[];
  topRisk: CategoryScore;
  companyContext: CompanyContext;
  answers: Answers;
  notes: Notes;
}
