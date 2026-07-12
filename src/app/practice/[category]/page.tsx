'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCategoryById, CATEGORY_COLORS } from '@/lib/constants';
import { loadAllQuestions, type Question } from '@/lib/questions';
import { loadData } from '@/lib/storage';
import { ArrowLeft, FileText } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

export default function CategoryPracticePage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = getCategoryById(categoryId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [data, setData] = useState(loadData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllQuestions().then(allQ => {
      setQuestions(allQ.filter(q => q.category === categoryId));
      setLoading(false);
    });
    setData(loadData());
  }, [categoryId]);

  if (!category) return null;
  const color = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.blue;

  const subStats = (category.subcategories || []).map(sub => {
    const subQ = questions.filter(q => q.subcategory === sub.name);
    const total = subQ.length;
    const done = subQ.filter(q => data.practiceHistory[q.id]?.done).length;
    const correct = subQ.filter(q => data.practiceHistory[q.id]?.correct).length;
    return { ...sub, total, done, correct };
  }).filter(s => s.total > 0);

  // Also show subcategories with 0 questions
  const emptySubs = (category.subcategories || [])
    .filter(sub => !questions.some(q => q.subcategory === sub.name));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> 返回题库
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{category.name}</h1>
          <p className="text-slate-500 text-sm">{questions.length} 道题目</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {subStats.map(sub => (
            <Link
              key={sub.name}
              href={`/practice/${categoryId}/${sub.name}`}
              className="card-hover flex items-center justify-between p-4"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="font-medium text-slate-900 text-sm">{sub.label}</div>
                <div className="mt-1.5">
                  <ProgressBar value={sub.done} max={sub.total} />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
                <span>{sub.total} 题</span>
                {sub.done > 0 && <span className="text-correct-600 font-medium">正确 {sub.correct}/{sub.done}</span>}
              </div>
            </Link>
          ))}
          {subStats.length === 0 && emptySubs.length > 0 && (
            <div className="card text-center py-8 text-slate-500 text-sm">
              该学科题目正在建设中，敬请期待
            </div>
          )}
        </div>
      )}
    </div>
  );
}
