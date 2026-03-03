
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getAIAssessment } from '../services/geminiService';
import { Answers } from '../types';

interface ResultsProps {
  score: number;
  maxScore: number;
  answers: Answers;
  onRestart: () => void;
}

const ScoreGauge: React.FC<{ score: number; maxScore: number }> = ({ score, maxScore }) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const circumference = 2 * Math.PI * 55; // 2 * pi * r
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    let tier = 'Explorer';
    let color = 'text-yellow-600';
    if (percentage > 75) {
        tier = 'Leader';
        color = 'text-green-600';
    } else if (percentage > 40) {
        tier = 'Adopter';
        color = 'text-blue-600';
    }

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="55" strokeWidth="10" className="text-gray-200" stroke="currentColor" fill="transparent" />
                <circle
                    cx="60"
                    cy="60"
                    r="55"
                    strokeWidth="10"
                    className={`${color} transition-all duration-1000 ease-out`}
                    stroke="currentColor"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-gray-900">{score}</span>
                <span className="text-sm text-gray-500">out of {maxScore}</span>
            </div>
            <div className={`mt-4 text-2xl font-bold ${color}`}>{tier}</div>
        </div>
    );
};

const LoadingSpinner: React.FC<{text?: string}> = ({text = "Generating your analysis..."}) => (
    <div className="flex flex-col justify-center items-center p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">{text}</p>
    </div>
);

const ReportRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
    if (!markdown) return null;

    // Split into sections by the markdown header. Filter out any empty strings.
    const sections = markdown.split('### ').filter(s => s.trim());

    return (
        <div className="space-y-6">
            {sections.map((section, index) => {
                const lines = section.trim().split('\n');
                const title = lines[0];
                const contentLines = lines.slice(1).filter(l => l.trim());
                const content = contentLines.join('\n');
                
                const isNumberedList = /^\s*\d+\./m.test(content);

                return (
                    <div key={index}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                        {isNumberedList ? (
                            <ol className="list-decimal list-inside space-y-2 pl-2 text-gray-700">
                                {contentLines.map((item, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: item.replace(/^\s*\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>') }} />
                                ))}
                            </ol>
                        ) : (
                            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>').replace(/\n/g, '<br />') }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};


export const Results: React.FC<ResultsProps> = ({ score, maxScore, answers, onRestart }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [fullReport, setFullReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [reportUnlocked, setReportUnlocked] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      setIsLoading(true);
      setError('');
      try {
        const result = await getAIAssessment(score, maxScore, answers);
        setFullReport(result);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred while generating your report.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [score, maxScore, answers]);

  const handleUnlockReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      // Prepare data for GHL
      const contactData = {
        name,
        email,
        // Custom fields for GHL
        customFields: {
          aiReadinessScore: score,
          maxScore: maxScore,
          assessmentDate: new Date().toISOString(),
          scorePercentage: Math.round((score / maxScore) * 100),
          fullAssessmentReport: fullReport
        },
        // Optional: Add tags in GHL
        tags: ['AI Assessment Completed']
      };

      // Send to GHL webhook
      const response = await fetch('https://services.leadconnectorhq.com/hooks/FgaFLGYrbGZSBVprTkhR/webhook-trigger/elWtYyahvdVemgjf2SBn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        console.log('✅ Contact added to GHL successfully!');
        setReportUnlocked(true);
      } else {
        console.error('⚠️ Failed to add contact to GHL, but unlocking report anyway');
        setReportUnlocked(true);
      }
    } catch (error) {
      console.error('❌ Error sending to GHL:', error);
      setReportUnlocked(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestStatus('loading');
    try {
      const testData = {
        name: "Test Webhook",
        email: "test@example.com",
        customFields: {
          aiReadinessScore: Math.round(maxScore / 2),
          maxScore: maxScore,
          assessmentDate: new Date().toISOString(),
          scorePercentage: 50,
          fullAssessmentReport: "### Overall Assessment\n\nThis is a test report generated to verify your webhook connection. If you see this text in your CRM, the integration is working!"
        },
        tags: ['AI Assessment Completed', 'TEST_DATA']
      };

      const response = await fetch('https://services.leadconnectorhq.com/hooks/FgaFLGYrbGZSBVprTkhR/webhook-trigger/elWtYyahvdVemgjf2SBn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      console.error('❌ Error sending test webhook:', error);
      setTestStatus('error');
    }
  };

  const handleCopyReport = async () => {
      try {
          await navigator.clipboard.writeText(fullReport);
          setCopyFeedback('Copied to clipboard!');
          setTimeout(() => setCopyFeedback(''), 3000);
      } catch (err) {
          setCopyFeedback('Failed to copy');
      }
  };
  
  const handlePrint = () => {
      window.print();
  };

  const saveTextOnlyPdf = () => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 12;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      const lineHeight = 6;
      const lines = fullReport
        .replace(/\r/g, '')
        .split('\n')
        .map((line) => line.replace(/^###\s*/, '').replace(/\*\*/g, '').trim());

      let y = margin;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('AI Readiness Assessment Report', margin, y);
      y += 10;

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

      const dateStamp = new Date().toISOString().slice(0, 10);
      pdf.save(`ai-readiness-report-${dateStamp}.pdf`);
  };

  const handleDownloadPdf = async () => {
      if (!reportRef.current || isDownloadingPdf) return;

      setIsDownloadingPdf(true);
      const hiddenElements = Array.from(reportRef.current.querySelectorAll<HTMLElement>('.pdf-hidden'));
      const originalDisplay = hiddenElements.map((el) => el.style.display);

      try {
          hiddenElements.forEach((el) => {
              el.style.display = 'none';
          });

          const canvas = await html2canvas(reportRef.current, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
              windowWidth: reportRef.current.scrollWidth
          });

          const imageData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = 210;
          const pageHeight = 297;
          const margin = 10;
          const renderWidth = pageWidth - (margin * 2);
          const renderHeight = (canvas.height * renderWidth) / canvas.width;
          const availablePageHeight = pageHeight - (margin * 2);

          let heightLeft = renderHeight;
          let yPosition = margin;

          pdf.addImage(imageData, 'PNG', margin, yPosition, renderWidth, renderHeight);
          heightLeft -= availablePageHeight;

          while (heightLeft > 0) {
              pdf.addPage();
              yPosition = margin - (renderHeight - heightLeft);
              pdf.addImage(imageData, 'PNG', margin, yPosition, renderWidth, renderHeight);
              heightLeft -= availablePageHeight;
          }

          const dateStamp = new Date().toISOString().slice(0, 10);
          pdf.save(`ai-readiness-report-${dateStamp}.pdf`);
      } catch (err) {
          console.error('Failed to generate PDF:', err);
          try {
              saveTextOnlyPdf();
              setCopyFeedback('Downloaded fallback PDF.');
              setTimeout(() => setCopyFeedback(''), 4000);
          } catch (fallbackErr) {
              console.error('Fallback PDF generation failed:', fallbackErr);
              setCopyFeedback('PDF export failed. Try Print / Save PDF.');
              setTimeout(() => setCopyFeedback(''), 4000);
          }
      } finally {
          hiddenElements.forEach((el, index) => {
              el.style.display = originalDisplay[index];
          });
          setIsDownloadingPdf(false);
      }
  };
  
  const getTeaser = (report: string) => {
      if (!report) return '';
      const sections = report.split('###');
      // The first element is empty string before the first '###', the second is the first section.
      return sections.length > 1 ? `### ${sections[1]}`.trim() : report;
  };
  
  const renderContent = () => {
      if (isLoading) {
          return <LoadingSpinner />;
      }
      if (error) {
          return <p className="text-red-500 mt-4 text-center">{error}</p>;
      }
      if (reportUnlocked) {
           return (
            <div className="mt-8 text-left animate-fade-in">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Report Sent!</h3>
                        <div className="mt-2 text-sm text-green-700">
                            <p>We've sent the full report to <strong>{email}</strong>. Check your inbox shortly.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-6 justify-center sm:justify-end pdf-hidden">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-3-3m3 3l3-3M4 17a2 2 0 002 2h12a2 2 0 002-2" />
                        </svg>
                        {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                    <button
                        onClick={handleCopyReport}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        {copyFeedback || (
                             <>
                                <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy Report
                             </>
                        )}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print / Save PDF
                    </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Personalized Feedback</h3>
                    <ReportRenderer markdown={fullReport} />
                </div>
            </div>
           );
      }

      return (
         <>
            <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your Analysis Preview</h3>
                 <ReportRenderer markdown={getTeaser(fullReport)} />
            </div>

            {!showForm ? (
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
                    >
                        Read My Full Report
                    </button>
                </div>
            ) : (
                <div className="mt-8 p-6 rounded-lg border border-dashed border-indigo-300 bg-indigo-50 animate-fade-in">
                    <h3 className="text-2xl font-bold text-indigo-900 text-center">Unlock Your Full Report</h3>
                    <p className="text-gray-600 mt-2 text-center">Enter your details to receive your personalized roadmap via email.</p>
                    
                    <form onSubmit={handleUnlockReport} className="mt-6 space-y-4 max-w-md mx-auto">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="block w-full bg-white border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 placeholder-gray-400"
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="block w-full bg-white border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 placeholder-gray-400"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="flex justify-center pt-2">
                            <button
                                type="submit"
                                disabled={!name || !email || isSubmitting}
                                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-600/20"
                            >
                                {isSubmitting ? 'Sending...' : 'Email Me My Report'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center my-4 border-t border-indigo-200 py-4 max-w-md mx-auto mt-8">
                        <p className="text-sm text-gray-500 mb-2">Need to verify your webhook? Send a test request.</p>
                        <button
                            type="button"
                            onClick={handleTestWebhook}
                            disabled={testStatus === 'loading'}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-wait transition text-sm font-semibold"
                        >
                            {testStatus === 'loading' ? 'Sending...' : 'Send Test Webhook'}
                        </button>
                        {testStatus === 'success' && <p className="text-green-600 text-sm mt-2 animate-fade-in">✅ Test webhook sent successfully!</p>}
                        {testStatus === 'error' && <p className="text-red-500 text-sm mt-2 animate-fade-in">❌ Failed to send test webhook. Check console for details.</p>}
                    </div>
                </div>
            )}
        </>
      );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div ref={reportRef} className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-xl print:shadow-none print:border-none">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Your AI Readiness Score</h2>
          <p className="text-gray-500 mt-2">You've completed the assessment. Here's how you scored.</p>
          <div className="my-8">
            <ScoreGauge score={score} maxScore={maxScore} />
          </div>
        </div>

        {renderContent()}

        <div className="mt-10 border-t border-gray-200 pt-6 text-center print:hidden">
          <button
            onClick={onRestart}
            className="text-indigo-600 hover:text-indigo-800 transition font-medium"
          >
            Take the assessment again
          </button>
        </div>
      </div>
    </div>
  );
};
