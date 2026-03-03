import React, { useState } from 'react';
import { Answers, Notes, CategoryId } from '../types';
import { SURVEY_QUESTIONS, CATEGORIES } from '../constants';
import ScoreSidebar from './ScoreSidebar';

interface Props {
  onComplete: (answers: Answers, notes: Notes) => void;
}

export default function Survey({ onComplete }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [notes, setNotes] = useState<Notes>({});

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNoteChange = (questionId: string, value: string) => {
    setNotes(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all required questions
    const allAnswered = SURVEY_QUESTIONS.every(q => answers[q.id]);
    if (allAnswered) {
      onComplete(answers, notes);
    } else {
      alert("Please answer all questions before generating the scorecard.");
    }
  };

  // Group questions by category
  const groupedQuestions = CATEGORIES.map(category => ({
    category,
    questions: SURVEY_QUESTIONS.filter(q => q.category === category.id)
  }));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex-1 max-w-4xl mx-auto py-12 px-8">
        <form onSubmit={handleSubmit} className="space-y-16">
          {groupedQuestions.map(({ category, questions }) => (
            <div key={category.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="mb-8 border-b border-slate-100 pb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">{category.name}</h2>
                <p className="text-slate-600">{category.description}</p>
              </div>

              <div className="space-y-12">
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">{question.text}</h3>
                        <p className="text-sm text-slate-500 mb-4">{question.description}</p>
                        
                        <div className="space-y-3">
                          {question.options?.map(option => (
                            <label
                              key={option.text}
                              className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${
                                answers[question.id] === option.text
                                  ? 'border-indigo-600 bg-indigo-50/50'
                                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center h-5">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option.text}
                                  checked={answers[question.id] === option.text}
                                  onChange={() => handleAnswerChange(question.id, option.text)}
                                  className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <span className={`font-medium ${answers[question.id] === option.text ? 'text-indigo-900' : 'text-slate-700'}`}>
                                  {option.text}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="mt-4">
                          <label htmlFor={`notes-${question.id}`} className="block text-xs font-medium text-slate-500 mb-1">
                            Notes (what they said)
                          </label>
                          <textarea
                            id={`notes-${question.id}`}
                            rows={2}
                            value={notes[question.id] || ''}
                            onChange={(e) => handleNoteChange(question.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors bg-slate-50"
                            placeholder="Optional context..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-8">
            <button
              type="submit"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-lg transition-colors shadow-sm"
            >
              Generate Scorecard
            </button>
          </div>
        </form>
      </div>
      
      <ScoreSidebar answers={answers} />
    </div>
  );
}
