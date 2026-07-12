'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadExam, loadAllQuestions, type Question, type MockExam } from '@/lib/questions';
import { recordExamResult, recordAnswer, STORAGE_KEYS } from '@/lib/storage';
import { formatTime, calculateScore, isAnswerCorrect } from '@/lib/exam-engine';
import { Clock, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const [exam, setExam] = useState<MockExam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Refs to avoid stale closure in timer callback
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;

  useEffect(() => {
    Promise.all([loadExam(examId), loadAllQuestions()]).then(([e, allQ]) => {
      if (!e) { router.push('/exam'); return; }
      setExam(e);
      const qs = e.questionIds.map(id => allQ.find(q => q.id === id)).filter(Boolean) as Question[];
      setQuestions(qs);
      setTimeLeft(e.duration * 60);
      setLoading(false);
      startTimeRef.current = Date.now();
    });
  }, [examId, router]);

  // Submit function — uses refs so it always reads latest values
  const doSubmit = useCallback((autoSubmit = false) => {
    if (submittedRef.current) return;
    setSubmitted(true);

    const currentAnswers = answersRef.current;
    const currentQuestions = questionsRef.current;
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const correctAnswers = currentQuestions.map(q => q.answer);
    const questionTypes = currentQuestions.map(q => q.type);
    const { score, total, wrongIndices } = calculateScore(currentAnswers, correctAnswers, questionTypes);
    const wrongIds = wrongIndices.map(i => currentQuestions[i].id);

    currentQuestions.forEach((q, i) => {
      if (currentAnswers[i] !== undefined) {
        recordAnswer(q.id, isAnswerCorrect(q.type, currentAnswers[i], q.answer));
      }
    });

    recordExamResult(examId, score, total, duration, wrongIds);
    localStorage.setItem(STORAGE_KEYS.EXAM_LAST_RESULT, JSON.stringify({ examId, score, total, duration, wrongIds, isTimeout: autoSubmit }));
    router.push(`/exam/${examId}/result`);
  }, [examId, router]);

  // Timer — only starts/restarts when loading completes or submitted changes
  useEffect(() => {
    if (loading || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); doSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, submitted]);

  const handleAnswer = (qIndex: number, optionIdx: number) => {
    const q = questions[qIndex];
    if (!q || submitted) return;

    if (q.type === '多选' || q.type === '不定项') {
      setAnswers(prev => {
        const prevArr = (prev[qIndex] as number[]) || [];
        const next = prevArr.includes(optionIdx) ? prevArr.filter(i => i !== optionIdx) : [...prevArr, optionIdx];
        return { ...prev, [qIndex]: next };
      });
    } else {
      setAnswers(prev => ({ ...prev, [qIndex]: optionIdx }));
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-96 bg-slate-100 rounded-xl animate-pulse" /></div>;
  }
  if (!exam) return null;

  const answeredCount = Object.keys(answers).length;
  const isTimeLow = timeLeft <= 300; // Last 5 min warning

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
      {/* Timer Bar */}
      <div className={`flex items-center justify-between p-4 rounded-xl mb-4 sticky top-16 z-40 ${isTimeLow ? 'bg-red-50 border border-red-200' : 'bg-white border border-slate-200'}`}>
        <div>
          <h3 className="font-medium text-slate-900 text-sm">{exam.title}</h3>
          <div className="text-xs text-slate-500">已答 {answeredCount}/{questions.length}</div>
        </div>
        <div className={`flex items-center gap-2 font-mono text-lg font-bold ${isTimeLow ? 'text-red-600' : 'text-slate-700'}`}>
          {isTimeLow ? <AlertTriangle className={`w-4 h-4 ${timeLeft % 2 === 0 ? 'opacity-100' : 'opacity-0'}`} /> : <Clock className="w-4 h-4 text-slate-400" />}
          {formatTime(timeLeft)}
        </div>
        <button
          onClick={() => setShowSubmitConfirm(true)}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          交卷
        </button>
      </div>

      <div className="flex gap-6">
        {/* Question area */}
        <div className="flex-1 min-w-0">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-slate-500">第 {currentQ + 1} 题</span>
              <Badge variant="difficulty">{questions[currentQ].difficulty}</Badge>
              <span className="text-xs text-slate-400 ml-auto">{questions[currentQ].type}</span>
            </div>

            <p className="text-lg font-medium text-slate-900 mb-6">{questions[currentQ].question}</p>

            <div className="space-y-3">
              {questions[currentQ].options.map((opt, idx) => {
                const isSelected = questions[currentQ].type === '多选' || questions[currentQ].type === '不定项'
                  ? ((answers[currentQ] as number[]) || []).includes(idx)
                  : answers[currentQ] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQ, idx)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                      isSelected ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300 bg-white'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>{String.fromCharCode(65 + idx)}</span>
                    <span className="text-slate-700">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="btn-secondary text-sm disabled:opacity-30"
              >上一题</button>
              <span className="text-sm text-slate-400">{currentQ + 1} / {questions.length}</span>
              <button
                onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                disabled={currentQ === questions.length - 1}
                className="btn-secondary text-sm disabled:opacity-30"
              >下一题</button>
            </div>
          </div>
        </div>

        {/* Answer Sheet */}
        <div className="hidden lg:block w-48 flex-shrink-0">
          <div className="card sticky top-32">
            <h4 className="font-medium text-sm text-slate-700 mb-3">答题卡</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const answered = answers[idx] !== undefined && 
                  (Array.isArray(answers[idx]) ? (answers[idx] as number[]).length > 0 : true);
                const isCurrent = idx === currentQ;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQ(idx)}
                    className={`w-full aspect-square rounded-lg text-xs font-medium transition-colors ${
                      isCurrent ? 'bg-primary-600 text-white' :
                      answered ? 'bg-primary-100 text-primary-700' :
                      'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >{idx + 1}</button>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-slate-400">
              <span className="inline-block w-3 h-3 bg-primary-600 rounded mr-1" /> 当前
              <span className="inline-block w-3 h-3 bg-primary-100 rounded ml-2 mr-1" /> 已答
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirm dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-slate-900 mb-2">确认交卷？</h3>
            <p className="text-sm text-slate-500 mb-1">已答：{answeredCount} / {questions.length} 题</p>
            {questions.length - answeredCount > 0 && (
              <p className="text-sm text-wrong-600 mb-4">还有 {questions.length - answeredCount} 题未答</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitConfirm(false)} className="btn-secondary flex-1">继续答题</button>
              <button onClick={() => doSubmit()} className="btn-primary flex-1">确认交卷</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
