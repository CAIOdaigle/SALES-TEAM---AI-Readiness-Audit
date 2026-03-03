import React from 'react';
import { Answers, CategoryScore, MaturityTier } from '../types';
import { CATEGORIES } from '../constants';
import { calculateCategoryScore, getTierFromPercentage } from '../services/scoringService';

interface Props {
  answers: Answers;
}

export function getTierColor(tier: MaturityTier): string {
  switch (tier) {
    case 'Exposed': return 'text-red-700 bg-red-50 border-red-200';
    case 'Experimenting': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Operationalizing': return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'Optimizing': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    default: return 'text-slate-700 bg-slate-50 border-slate-200';
  }
}

export default function ScoreSidebar({ answers }: Props) {
  const categoryScores = CATEGORIES.map(c => calculateCategoryScore(c.id, answers));
  const overallScore = Math.round(categoryScores.reduce((sum, cs) => sum + cs.weightedScore, 0));
  const overallTier = getTierFromPercentage(overallScore);

  return (
    <div className="w-80 bg-slate-50 border-l border-slate-200 h-screen sticky top-0 overflow-y-auto p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Scoring</h2>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="text-sm text-slate-500 font-medium mb-1">Overall Score</div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">{overallScore}</span>
            <span className="text-slate-400">/ 100</span>
          </div>
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getTierColor(overallTier)}`}>
            {overallTier}
          </div>
        </div>

        <div className="space-y-4">
          {categoryScores.map((score) => (
            <div key={score.categoryId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-sm font-medium text-slate-900 mb-2">{score.categoryName}</div>
              <div className="flex justify-between items-end mb-2">
                <div className="text-2xl font-semibold text-slate-800">
                  {score.rawScore}<span className="text-sm text-slate-400 font-normal">/{score.maxRawScore}</span>
                </div>
                <div className="text-sm text-slate-500">{score.percentage}%</div>
              </div>
              <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${getTierColor(score.tier)}`}>
                {score.tier}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
