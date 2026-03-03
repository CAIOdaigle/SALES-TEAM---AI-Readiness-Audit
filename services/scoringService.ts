import { Answers, CategoryScore, AuditResult, MaturityTier, CategoryId, CompanyContext, Notes } from '../types';
import { SURVEY_QUESTIONS, CATEGORIES, MAX_RAW_SCORE_PER_CATEGORY } from '../constants';

export function getTierFromPercentage(percentage: number): MaturityTier {
  if (percentage <= 25) return 'Exposed';
  if (percentage <= 50) return 'Experimenting';
  if (percentage <= 75) return 'Operationalizing';
  return 'Optimizing';
}

export function calculateCategoryScore(categoryId: CategoryId, answers: Answers): CategoryScore {
  const category = CATEGORIES.find(c => c.id === categoryId)!;
  const categoryQuestions = SURVEY_QUESTIONS.filter(q => q.category === categoryId);
  let rawScore = 0;
  for (const question of categoryQuestions) {
    const answerText = answers[question.id];
    if (answerText && question.options) {
      const option = question.options.find(o => o.text === answerText);
      if (option) {
        rawScore += option.score;
      }
    }
  }
  const percentage = Math.round((rawScore / MAX_RAW_SCORE_PER_CATEGORY) * 100);
  const tier = getTierFromPercentage(percentage);
  const weightedScore = (rawScore / MAX_RAW_SCORE_PER_CATEGORY) * (category.weight * 100);
  return {
    categoryId: category.id,
    categoryName: category.name,
    rawScore,
    maxRawScore: MAX_RAW_SCORE_PER_CATEGORY,
    percentage,
    tier,
    weight: category.weight,
    weightedScore: Math.round(weightedScore * 10) / 10,
  };
}

export function calculateAuditResult(answers: Answers, notes: Notes, companyContext: CompanyContext): AuditResult {
  const categoryScores = CATEGORIES.map(c => calculateCategoryScore(c.id, answers));
  const overallScore = Math.round(categoryScores.reduce((sum, cs) => sum + cs.weightedScore, 0));
  const overallTier = getTierFromPercentage(overallScore);
  const topRisk = [...categoryScores].sort((a, b) => a.percentage - b.percentage)[0];
  return {
    overallScore,
    overallTier,
    categoryScores,
    topRisk,
    companyContext,
    answers,
    notes,
  };
}
