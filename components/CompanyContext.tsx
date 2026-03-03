import React, { useState } from 'react';
import { CompanyContext as CompanyContextType } from '../types';
import { INDUSTRIES, EMPLOYEE_COUNTS } from '../constants';

interface Props {
  onStart: (context: CompanyContextType) => void;
}

export default function CompanyContext({ onStart }: Props) {
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName && industry && employeeCount) {
      if (industry === 'Other' && !customIndustry) return;
      onStart({ companyName, industry, employeeCount, ...(industry === 'Other' ? { customIndustry } : {}) });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-slate-900 mb-3">AI Readiness Audit</h1>
        <p className="text-slate-600">This assessment evaluates your organization across four key areas: AI Adoption, Governance, Risk, and ROI. It takes about 12 minutes.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
          <input type="text" id="companyName" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. Acme Corp" />
        </div>
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
          <select id="industry" required value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white">
            <option value="" disabled>Select an industry</option>
            {INDUSTRIES.map((ind) => (<option key={ind} value={ind}>{ind}</option>))}
          </select>
        </div>
        {industry === 'Other' && (
          <div>
            <label htmlFor="customIndustry" className="block text-sm font-medium text-slate-700 mb-1">Specify your industry</label>
            <input type="text" id="customIndustry" required value={customIndustry} onChange={(e) => setCustomIndustry(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" placeholder="e.g. Automotive" />
          </div>
        )}
        <div>
          <label htmlFor="employeeCount" className="block text-sm font-medium text-slate-700 mb-1">Approximate Employee Count</label>
          <select id="employeeCount" required value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-white">
            <option value="" disabled>Select employee count</option>
            {EMPLOYEE_COUNTS.map((count) => (<option key={count} value={count}>{count}</option>))}
          </select>
        </div>
        <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors mt-8">Begin Audit</button>
      </form>
    </div>
  );
}
