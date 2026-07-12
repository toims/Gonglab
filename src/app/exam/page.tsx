'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadAllExams, type MockExam } from '@/lib/questions';
import { loadData } from '@/lib/storage';
import { Clock, FileQuestion, ArrowRight, Plus } from 'lucide-react';

export default function ExamListPage() {
  const [exams, setExams] = useState<MockExam[]>([]);
  const [history, setHistory] = useState<ReturnType<typeof loadData>['examHistory']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllExams().then(e => {
      setExams(e);
      setLoading(false);
    });
    setHistory(loadData().examHistory);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">模拟考试</h1>
      <p className="text-slate-500 mb-2">限时套卷练习，模拟真实考试环境</p>

      <Link href="/exam/create"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 mb-6 transition-colors">
        <Plus className="w-4 h-4" /> 创建自定义试卷
      </Link>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : exams.length > 0 ? (
        <div className="space-y-4">
          {exams.map(exam => {
            const latestResult = history.filter(h => h.examId === exam.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            const isCustom = exam.id.startsWith('custom-');
            return (
              <Link key={exam.id} href={`/exam/${exam.id}`} className="card-hover p-5 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCustom ? 'bg-amber-100' : 'bg-primary-100'}`}>
                    <FileQuestion className={`w-6 h-6 ${isCustom ? 'text-amber-600' : 'text-primary-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 inline-flex items-center gap-2">
                      {exam.title}
                      {isCustom && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-normal">自定义</span>}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">{exam.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration} 分钟</span>
                      <span>{exam.questionIds.length} 题</span>
                    </div>
                    {latestResult && (
                      <div className="mt-1 text-xs">
                        <span className="text-correct-600 font-medium">最近成绩：{latestResult.score}/{latestResult.total} ({Math.round(latestResult.score/latestResult.total*100)}%)</span>
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12 text-slate-500">暂无模拟试卷，敬请期待</div>
      )}
    </div>
  );
}
