'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { loadAllQuestions, shuffleQuestions, type Question } from '@/lib/questions';
import { recordAnswer } from '@/lib/storage';
import { isAnswerCorrect } from '@/lib/exam-engine';
import { ArrowLeft, ArrowRight, Check, X, RotateCcw } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';

export default function SubcategoryPracticePage() {
  const params = useParams();
  const categoryId = params.category as string;
  const subcategoryName = decodeURIComponent(params.subcategory as string);

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | number[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  useEffect(() => {
    loadAllQuestions().then(allQ => {
      const filtered = allQ.filter(q => q.category === categoryId && q.subcategory === subcategoryName);
      setAllQuestions(shuffleQuestions(filtered));
      setLoading(false);
    });
  }, [categoryId, subcategoryName]);

  const currentQuestion = allQuestions[currentIndex];
  const isMultiSelect = currentQuestion?.type === '多选' || currentQuestion?.type === '不定项';

  const correctCount = Object.values(answers).filter(Boolean).length;
  const totalAnswered = Object.keys(answers).length;

  const handleSelect = (index: number) => {
    if (showResult) return;

    if (isMultiSelect) {
      const prev = (selectedOption as number[]) || [];
      const next = prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index];
      setSelectedOption(next);
    } else {
      // 单选题/判断题：选中后自动确认
      setSelectedOption(index);
      // 延迟提交，让用户看到选中反馈
      timeoutRef.current = setTimeout(() => submitAnswer(index), 150);
    }
  };

  const submitAnswer = (option?: number | number[]) => {
    const answer = option !== undefined ? option : selectedOption;
    if (answer === null || !currentQuestion) return;
    if (isMultiSelect && (answer as number[]).length === 0) return;

    const correct = isAnswerCorrect(currentQuestion.type, answer, currentQuestion.answer);

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: correct }));
    recordAnswer(currentQuestion.id, correct);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setAllQuestions(shuffleQuestions(allQuestions));
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setAnswers({});
    setFinished(false);
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>;
  }

  if (finished) {
    const total = allQuestions.length;
    const correct = correctCount;
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">{correct === total ? '🎉' : '📝'}</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">练习完成</h2>
          <div className="text-4xl font-bold text-primary-600 mb-4">{total > 0 ? Math.round((correct / total) * 100) : 0}%</div>
          <div className="flex items-center justify-center gap-6 text-slate-500 mb-8">
            <div>正确 <span className="text-correct-600 font-bold">{correct}</span> / {total}</div>
            <div>错误 <span className="text-wrong-600 font-bold">{total - correct}</span> / {total}</div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={handleRestart} className="btn-secondary gap-2">
              <RotateCcw className="w-4 h-4" /> 再做一遍
            </button>
            <Link href={`/practice/${categoryId}`} className="btn-primary gap-2">
              返回章节
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12 text-slate-500">该章节暂无题目</div>
      </div>
    );
  }

  const correctAnswer = Array.isArray(currentQuestion.answer) ? currentQuestion.answer : [currentQuestion.answer];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-sm text-slate-500">
            第 {currentIndex + 1} / {allQuestions.length} 题
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-correct-600">✓ {correctCount}</span>
            <span className="text-wrong-600">✗ {totalAnswered - correctCount}</span>
          </div>
        </div>
        <ProgressBar value={currentIndex + 1} max={allQuestions.length} />
      </div>

      {/* Question Card */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="difficulty">{currentQuestion.difficulty}</Badge>
          <Badge variant="frequency">{currentQuestion.frequency}</Badge>
          <span className="text-xs text-slate-400 ml-auto">{currentQuestion.type}</span>
        </div>

        <p className="text-lg font-medium text-slate-900 mb-6">{currentQuestion.question}</p>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let optStyle = 'border-slate-200 hover:border-primary-300 bg-white';
            if (showResult) {
              if (correctAnswer.includes(idx)) {
                optStyle = 'border-correct-600 bg-correct-50';
              } else if ((isMultiSelect && (selectedOption as number[])?.includes(idx)) || selectedOption === idx) {
                if (!correctAnswer.includes(idx)) {
                  optStyle = 'border-wrong-600 bg-wrong-50';
                }
              }
            } else if (isMultiSelect && (selectedOption as number[])?.includes(idx)) {
              optStyle = 'border-primary-500 bg-primary-50';
            } else if (selectedOption === idx) {
              optStyle = 'border-primary-500 bg-primary-50';
            }

            const showCheck = showResult && correctAnswer.includes(idx);
            const showX = showResult && selectedOption !== null && !correctAnswer.includes(idx) && 
              (isMultiSelect ? (selectedOption as number[])?.includes(idx) : selectedOption === idx);

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${optStyle}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  showCheck ? 'bg-correct-600 text-white' : showX ? 'bg-wrong-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {showCheck ? <Check className="w-4 h-4" /> : showX ? <X className="w-4 h-4" /> : String.fromCharCode(65 + idx)}
                </span>
                <span className="text-slate-700">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Multi-select confirm button */}
        {isMultiSelect && !showResult && (
          <button
            onClick={() => submitAnswer()}
            disabled={!selectedOption || (selectedOption as number[]).length === 0}
            className="btn-primary w-full mt-4"
          >
            确认选择
          </button>
        )}

        {/* Result & Explanation */}
        {showResult && (
          <div className={`mt-4 p-4 rounded-xl ${answers[currentQuestion.id] ? 'bg-correct-50 border border-correct-200' : 'bg-wrong-50 border border-wrong-200'}`}>
            <div className={`font-medium mb-2 flex items-center gap-2 ${answers[currentQuestion.id] ? 'text-correct-700' : 'text-wrong-700'}`}>
              {answers[currentQuestion.id] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {answers[currentQuestion.id] ? '回答正确！' : '回答错误'}
            </div>
            <div className="text-sm text-slate-600">
              <strong>解析：</strong>{currentQuestion.explanation}
            </div>
          </div>
        )}

        {/* Next button */}
        {showResult && (
          <button onClick={handleNext} className="btn-primary w-full mt-4 gap-2">
            {currentIndex < allQuestions.length - 1 ? (
              <>下一题 <ArrowRight className="w-4 h-4" /></>
            ) : (
              '查看成绩'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
