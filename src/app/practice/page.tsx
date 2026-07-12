'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { loadAllQuestions, type Question } from '@/lib/questions';
import { loadData } from '@/lib/storage';
import { Shuffle, Pen } from 'lucide-react';
import ProgressBar from '@/components/ui/ProgressBar';

export default function PracticePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [practiceHistory, setPracticeHistory] = useState<Record<string, { done: boolean; correct: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllQuestions().then(qs => {
      setQuestions(qs);
      setLoading(false);
    });
    const d = loadData();
    setWrongCount(d.wrongQuestionIds.length);
    setPracticeHistory(d.practiceHistory);
  }, []);

  const handleRandomPractice = useCallback(() => {
    if (questions.length === 0) return;
    const idx = Math.floor(Math.random() * questions.length);
    const q = questions[idx];
    router.push(`/practice/${q.category}/${q.subcategory}`);
  }, [questions, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">题库刷题</h1>
      <p className="text-slate-500 mb-6">按学科或章节选择题目进行练习</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button onClick={handleRandomPractice} className="card-hover flex items-center gap-4 p-5 text-left w-full">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shuffle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900">随机刷题</div>
            <div className="text-sm text-slate-500">从题库随机抽题练习</div>
          </div>
        </button>
        <Link href="/wrong" className="card-hover flex items-center gap-4 p-5">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Pen className="w-6 h-6 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900">错题重做</div>
            <div className="text-sm text-slate-500">{wrongCount} 道待复习错题</div>
          </div>
        </Link>
      </div>

      <h2 className="text-lg font-bold text-slate-900 mb-4">选择学科</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map(cat => {
            const catQuestions = questions.filter(q => q.category === cat.id);
            const totalQ = catQuestions.length;
            const done = catQuestions.filter(q => practiceHistory[q.id]?.done).length;
            return (
              <Link key={cat.id} href={`/practice/${cat.id}`} className="card-hover flex flex-col p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900 text-sm">{cat.name}</span>
                  <span className="text-xs text-slate-400">{totalQ} 题</span>
                </div>
                <ProgressBar value={done} max={totalQ || 1} />
                <div className="text-xs text-slate-400 mt-1.5">
                  {totalQ === 0 ? '暂无题目' : done === 0 ? '未开始' : done < totalQ ? `已完成 ${done}/${totalQ}` : '全部完成'}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
