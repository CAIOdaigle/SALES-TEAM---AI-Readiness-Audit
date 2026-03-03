import React, { useRef } from 'react';
import { AuditResult } from '../types';
import Markdown from 'react-markdown';
import CategoryCard from './CategoryCard';
import { getTierColor } from './ScoreSidebar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  result: AuditResult;
  narrative: string;
  onReset: () => void;
}

export default function Results({ result, narrative, onReset }: Props) {
  const scorecardRef = useRef<HTMLDivElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);

  const displayIndustry = result.companyContext.customIndustry || result.companyContext.industry;

  const saveTextOnlyPdf = () => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 12;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const lineHeight = 6;
      const dateStamp = new Date().toISOString().slice(0, 10);
      const plainNarrative = narrative
        .replace(/\r/g, '')
        .replace(/[#*_`>-]/g, '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const lines = [
        `AI Readiness Audit - ${result.companyContext.companyName}`,
        `Industry: ${displayIndustry}`,
        `Overall Score: ${result.overallScore}`,
        `Tier: ${result.overallTier}`,
        `Generated: ${new Date().toLocaleDateString()}`,
        '',
        ...plainNarrative
      ];

      let y = margin;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);

      for (const rawLine of lines) {
          const safeLine = rawLine.length > 0 ? rawLine : ' ';
          const wrapped = pdf.splitTextToSize(safeLine, usableWidth) as string[];

          if (y + wrapped.length * lineHeight > pageHeight - margin) {
              pdf.addPage();
              y = margin;
          }

          pdf.text(wrapped, margin, y);
          y += wrapped.length * lineHeight;
      }

      pdf.save(`${result.companyContext.companyName.replace(/\s+/g, '_')}_AI_Readiness_Audit_${dateStamp}.pdf`);
  };

  const handleDownloadPdf = async () => {
    if (!scorecardRef.current || !narrativeRef.current) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Capture Scorecard
      const scorecardCanvas = await html2canvas(scorecardRef.current, { scale: 2 });
      const scorecardImgData = scorecardCanvas.toDataURL('image/png');
      const scorecardImgProps = pdf.getImageProperties(scorecardImgData);
      const scorecardPdfHeight = (scorecardImgProps.height * pdfWidth) / scorecardImgProps.width;
      
      pdf.addImage(scorecardImgData, 'PNG', 0, 0, pdfWidth, scorecardPdfHeight);
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Prepared by ChiefAIOfficer.com | ${new Date().toLocaleDateString()}`, 10, pdfHeight - 10);

      // Capture Narrative
      pdf.addPage();
      const narrativeCanvas = await html2canvas(narrativeRef.current, { scale: 2 });
      const narrativeImgData = narrativeCanvas.toDataURL('image/png');
      const narrativeImgProps = pdf.getImageProperties(narrativeImgData);
      const narrativePdfHeight = (narrativeImgProps.height * pdfWidth) / narrativeImgProps.width;

      pdf.addImage(narrativeImgData, 'PNG', 0, 0, pdfWidth, narrativePdfHeight);
      pdf.text(`Prepared by ChiefAIOfficer.com | ${new Date().toLocaleDateString()}`, 10, pdfHeight - 10);

      pdf.save(`${result.companyContext.companyName.replace(/\s+/g, '_')}_AI_Readiness_Audit.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      try {
        saveTextOnlyPdf();
        alert('Primary PDF export failed. Downloaded text-only PDF fallback.');
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError);
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div ref={scorecardRef} className="p-10 bg-white">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Readiness Audit</h1>
              <div className="text-lg text-slate-600">
                <span className="font-semibold text-slate-800">{result.companyContext.companyName}</span> • {displayIndustry}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Overall Score</div>
              <div className="flex items-center gap-4 justify-end">
                <div className="text-5xl font-bold text-slate-900">{result.overallScore}</div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${getTierColor(result.overallTier)}`}>
                  {result.overallTier}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {result.categoryScores.map(score => (
              <CategoryCard 
                key={score.categoryId} 
                score={score} 
                industry={result.companyContext.industry}
                isTopRisk={score.categoryId === result.topRisk.categoryId}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 mb-12">
        <div ref={narrativeRef} className="bg-white">
          <div className="prose prose-slate prose-indigo max-w-none">
            <Markdown>{narrative}</Markdown>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-20">
        <button
          onClick={handleDownloadPdf}
          className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors shadow-sm"
        >
          Download PDF Scorecard
        </button>
        <a
          href="https://chiefaiofficer.com/schedule"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          Schedule AI Strategy Session
        </a>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors shadow-sm"
        >
          Start New Audit
        </button>
      </div>
    </div>
  );
}
