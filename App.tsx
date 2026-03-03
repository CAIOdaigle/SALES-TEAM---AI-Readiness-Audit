import React, { useState } from 'react';
import { CompanyContext as CompanyContextType, Answers, Notes, AuditResult } from './types';
import CompanyContext from './components/CompanyContext';
import Survey from './components/Survey';
import Results from './components/Results';
import { getAIAssessment } from './services/geminiService';
import { Loader2 } from 'lucide-react';

type AppState = 'context' | 'survey' | 'loading' | 'results';

export default function App() {
  const [appState, setAppState] = useState<AppState>('context');
  const [companyContext, setCompanyContext] = useState<CompanyContextType | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [narrative, setNarrative] = useState<string>('');

  const handleStart = (context: CompanyContextType) => {
    setCompanyContext(context);
    setAppState('survey');
  };

  const handleCompleteSurvey = async (answers: Answers, notes: Notes) => {
    if (!companyContext) return;
    
    setAppState('loading');
    try {
      const { result: auditResult, narrative: aiNarrative } = await getAIAssessment(answers, notes, companyContext);
      setResult(auditResult);
      setNarrative(aiNarrative);
      setAppState('results');
    } catch (error) {
      console.error('Error getting assessment:', error);
      alert('Failed to generate assessment. Please try again.');
      setAppState('survey');
    }
  };

  const handleReset = () => {
    setCompanyContext(null);
    setResult(null);
    setNarrative('');
    setAppState('context');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-slate-900 text-white py-4 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">ChiefAIOfficer.com</div>
          <div className="text-sm font-medium text-slate-400">AI Readiness Audit Tool</div>
        </div>
      </header>

      <main>
        {appState === 'context' && (
          <CompanyContext onStart={handleStart} />
        )}
        
        {appState === 'survey' && (
          <Survey onComplete={handleCompleteSurvey} />
        )}

        {appState === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Analyzing Results...</h2>
            <p className="text-slate-500">Generating your personalized AI strategy scorecard.</p>
          </div>
        )}

        {appState === 'results' && result && (
          <Results result={result} narrative={narrative} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}
