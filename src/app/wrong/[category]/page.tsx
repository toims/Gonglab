'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCategoryById, CATEGORY_COLORS } from '@/lib/constants';
import { loadAllQuestions, shuffleQuestions, type Question } from '@/lib/questions';
import { loadData, removeFromWrong } from '@/lib/storage';
import { isAnswerCorrect } from '@/lib/exam-engine';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';

export default function WrongCategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = getCategoryById(categoryId);
  const color = category ? (CATEGORY_COLORS[category.color] || CATEGORY_COLORS.blue) : CATEGORY_COLORS.blue;

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | number[] | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [correctInSession, setCorrectInSession] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  useEffect(() => {
    loadAllQuestions().then(allQ => {
      const data = loadData();
      const wIds = data.wrongQuestionIds;
      setWrongIds(wIds);
      const wrongQs = allQ.filter(q => q.category === categoryId && wIds.includes(q.id));
      setAllQuestions(shuffleQuestions(wrongQs));
      setLoading(false);
    });
  }, [categoryId]);

  const currentQuestion = allQuestions[currentIndex];
  const isMultiSelect = currentQuestion?.type === '多选' || currentQuestion?.type === '不定项';

  const handleSelect = (index: number) => {
    if (showResult) return;
    if (isMultiSelect) {
      const prev = (selectedOption as number[]) || [];
      const next = prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index];
      setSelectedOption(next);
    } else {
      // 单选题/判断题：选中后自动确认
      setSelectedOption(index);
      timeoutRef.current = setTimeout(() => submitAnswer(index), 150);
    }
  };

  const submitAnswer = (option?: number | number[]) => {
    const answer = option !== undefined ? option : selectedOption;
    if (answer === null || !currentQuestion) return;
    if (isMultiSelect && (answer as number[]).length === 0) return;

    const correct = isAnswerCorrect(currentQuestion.type, answer, currentQuestion.answer);

    if (correct) {
      removeFromWrong(currentQuestion.id);
      setCorrectInSession(prev => new Set(prev).add(currentQuestion.id));
    }
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

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>;
  }

  if (finished) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">错题复习完成</h2>
          <p className="text-slate-500 mb-2">本次做对 {correctInSession.size} 道，已移出错题本</p>
          <p className="text-sm text-slate-400 mb-6">{allQuestions.length - correctInSession.size} 道仍未掌握，将继续保留在错题本</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/wrong" className="btn-secondary">返回错题本</Link>
            <Link href="/practice" className="btn-primary">继续刷题</Link>
          </div>
        </div>
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-slate-500 mb-4">该学科暂无错题</p>
          <Link href="/wrong" className="btn-primary">返回</Link>
        </div>
      </div>
    );
  }

  const correctAnswer = Array.isArray(currentQuestion.answer) ? currentQuestion.answer : [currentQuestion.answer];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <Link href="/wrong" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> 返回错题本
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-sm text-slate-500">错题 {currentIndex + 1} / {allQuestions.length}</div>
          <div className="text-sm text-correct-600">已做对 {correctInSession.size}</div>
        </div>
        <ProgressBar value={currentIndex + 1} max={allQuestions.length} />
      </div>

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
                if (!correctAnswer.includes(idx)) optStyle = 'border-wrong-600 bg-wrong-50';
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
              <button key={idx} onClick={() => handleSelect(idx)} disabled={showResult}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${optStyle}`}>
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

        {isMultiSelect && !showResult && (
          <button onClick={() => submitAnswer()} disabled={!selectedOption || (selectedOption as number[]).length === 0}
            className="btn-primary w-full mt-4">确认选择</button>
        )}

        {showResult && (
          <div className={`mt-4 p-4 rounded-xl ${correctInSession.has(currentQuestion.id) ? 'bg-correct-50 border border-correct-200' : 'bg-wrong-50 border border-wrong-200'}`}>
            <div className={`font-medium mb-2 flex items-center gap-2 ${correctInSession.has(currentQuestion.id) ? 'text-correct-700' : 'text-wrong-700'}`}>
              {correctInSession.has(currentQuestion.id) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {correctInSession.has(currentQuestion.id) ? '回答正确！已移出错题本' : '仍未掌握，继续保留在错题本'}
            </div>
            <div className="text-sm text-slate-600"><strong>解析：</strong>{currentQuestion.explanation}</div>
          </div>
        )}

        {showResult && (
          <button onClick={handleNext} className="btn-primary w-full mt-4 gap-2">
            {currentIndex < allQuestions.length - 1 ? <>下一题 <ArrowRight className="w-4 h-4" /></> : '查看结果'}
          </button>
        )}
      </div>
    </div>
  );
}
