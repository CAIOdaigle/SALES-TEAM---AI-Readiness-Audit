import React from 'react';
import { CategoryScore, MaturityTier } from '../types';
import { getTierColor } from './ScoreSidebar';
import { INDUSTRY_BENCHMARKS, CROSS_INDUSTRY_BENCHMARKS } from '../constants';

interface Props {
  score: CategoryScore;
  industry: string;
  isTopRisk?: boolean;
}

function getProgressBarColor(tier: MaturityTier): string {
  switch (tier) {
    case 'Exposed': return '#DC2626';       // red
    case 'Experimenting': return '#EA580C';  // orange
    case 'Operationalizing': return '#2563EB'; // blue
    case 'Optimizing': return '#16A34A';     // green
    default: return '#2563EB';
  }
}

export default function CategoryCard({ score, industry, isTopRisk }: Props) {
  const benchmarks = INDUSTRY_BENCHMARKS[industry];
  const fallbackBenchmarks = CROSS_INDUSTRY_BENCHMARKS;
  const usedBenchmarks = benchmarks || fallbackBenchmarks;
  const benchmark = usedBenchmarks[score.categoryId];
  const benchmarkSource = benchmarks ? 'Industry' : 'Cross-industry';

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isTopRisk ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-900 leading-tight">{score.categoryName}</h3>
        {isTopRisk && (
          <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 border border-red-200">
            Top Risk
          </span>
        )}
      </div>
      
      <div className="flex items-end gap-3 mb-3">
        <div className="text-3xl font-bold text-slate-900">{score.percentage}%</div>
        <div className={`mb-1 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border ${getTierColor(score.tier)}`}>
          {score.tier}
        </div>
      </div>

      <div className="relative w-full bg-slate-100 rounded-full h-2 mb-2 overflow-visible">
        <div 
          className="h-2 rounded-full transition-all duration-500" 
          style={{ width: `${score.percentage}%`, backgroundColor: getProgressBarColor(score.tier) }}
        ></div>
        {benchmark !== undefined && (
          <div 
            className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-slate-400 z-10"
            style={{ left: `${benchmark}%` }}
          >
            <div className="absolute -top-1 -left-1 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-400"></div>
          </div>
        )}
      </div>

      {benchmark !== undefined && (
        <div className="text-[12px] text-slate-500 flex justify-between items-center mt-1">
          <span>{benchmarkSource} avg:</span>
          <span className="font-medium text-slate-700">{benchmark}%</span>
        </div>
      )}
    </div>
  );
}
