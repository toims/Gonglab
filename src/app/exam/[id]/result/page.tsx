'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { loadExam, loadAllQuestions, type Question } from '@/lib/questions';
import { formatTime } from '@/lib/exam-engine';
import { STORAGE_KEYS } from '@/lib/storage';
import { Check, X, Clock, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';

interface ExamResultData {
  examId: string;
  score: number;
  total: number;
  duration: number;
  wrongIds: string[];
  isTimeout: boolean;
}

export default function ExamResultPage() {
  const params = useParams();
  const examId = params.id as string;
  const [resultData, setResultData] = useState<ExamResultData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EXAM_LAST_RESULT);
      if (raw) {
        const data = JSON.parse(raw) as ExamResultData;
        if (data.examId === examId) {
          setResultData(data);
        }
      }
    } catch {}
    
    Promise.all([loadExam(examId), loadAllQuestions()]).then(([exam, allQ]) => {
      if (exam) {
        setExamTitle(exam.title);
        const qs = exam.questionIds.map(id => allQ.find(q => q.id === id)).filter(Boolean) as Question[];
        setQuestions(qs);
      }
      setLoading(false);
    });
  }, [examId]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>;
  }

  if (!resultData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">暂无考试结果数据</p>
          <Link href="/exam" className="btn-primary">返回模拟考列表</Link>
        </div>
      </div>
    );
  }

  const { score, total, duration, wrongIds, isTimeout } = resultData;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const wrongSet = new Set(wrongIds);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Score Card */}
      <div className="card text-center py-10 mb-6">
        {isTimeout && <div className="flex items-center justify-center gap-2 text-amber-600 text-sm mb-4"><AlertTriangle className="w-4 h-4" /> 考试时间到，已自动交卷</div>}
        <div className="text-6xl mb-3">{percent >= 80 ? '🎉' : percent >= 60 ? '📝' : '💪'}</div>
        <div className="text-4xl font-bold text-primary-600 mb-2">{percent}%</div>
        <div className="text-slate-500">得分 {score} / {total}</div>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 用时 {formatTime(duration)}</span>
          <span className="flex items-center gap-1"><X className="w-4 h-4 text-wrong-500" /> 错题 {wrongIds.length}</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link href={`/exam/${examId}`} className="btn-secondary gap-2">
            <RotateCcw className="w-4 h-4" /> 重新考试
          </Link>
          <Link href="/exam" className="btn-primary gap-2">
            返回列表 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Question Review */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">逐题回顾</h2>
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isWrong = wrongSet.has(q.id);
          const correctAnswer = Array.isArray(q.answer) ? q.answer : [q.answer];
          return (
            <div key={q.id} className={`card border-l-4 ${isWrong ? 'border-wrong-500' : 'border-correct-500'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isWrong ? 'bg-wrong-100 text-wrong-600' : 'bg-correct-100 text-correct-600'}`}>
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-500">{q.type}</span>
                <span className="text-xs text-slate-400 ml-auto">{q.difficulty} · {q.frequency}</span>
              </div>
              <p className="text-slate-900 font-medium mb-3">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = correctAnswer.includes(oi);
                  return (
                    <div key={oi} className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                      isCorrect ? 'bg-correct-50 border border-correct-200' : 'bg-slate-50 border border-slate-100'
                    }`}>
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                        isCorrect ? 'bg-correct-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>{String.fromCharCode(65 + oi)}</span>
                      <span className={isCorrect ? 'text-correct-700 font-medium' : 'text-slate-600'}>{opt}</span>
                      {isCorrect && <Check className="w-4 h-4 text-correct-600 ml-auto" />}
                    </div>
                  );
                })}
              </div>
              {isWrong && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                  <strong className="text-slate-700">解析：</strong>{q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
