'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { loadAllQuestions, type Question } from '@/lib/questions';
import { loadData } from '@/lib/storage';
import { Pen, X, ArrowRight } from 'lucide-react';

export default function WrongPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadAllQuestions()]).then(([allQ]) => {
      setQuestions(allQ);
      const data = loadData();
      setWrongIds(data.wrongQuestionIds);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>;
  }

  const wrongQuestions = questions.filter(q => wrongIds.includes(q.id));

  // Group by category
  const categoryWrongCounts: Record<string, number> = {};
  wrongQuestions.forEach(q => { categoryWrongCounts[q.category] = (categoryWrongCounts[q.category] || 0) + 1; });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">错题本</h1>
      <p className="text-slate-500 mb-8">共 {wrongQuestions.length} 道错题待复习</p>

      {wrongQuestions.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">错题本已清空</h2>
          <p className="text-slate-500 mb-4">所有错题都已掌握，继续加油！</p>
          <Link href="/practice" className="btn-primary">继续刷题</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.filter(c => categoryWrongCounts[c.id]).map(cat => {
            const count = categoryWrongCounts[cat.id];
            const color = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.blue;
            return (
              <Link key={cat.id} href={`/wrong/${cat.id}`} className="card-hover p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}>
                    <Pen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{cat.name}</div>
                    <div className="text-sm text-slate-500">{count} 道错题</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
