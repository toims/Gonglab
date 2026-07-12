'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Clock, Pen, BarChart3, ArrowRight } from 'lucide-react';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { getStudyStats } from '@/lib/storage';
import ProgressBar from '@/components/ui/ProgressBar';

export default function HomePage() {
  const [stats, setStats] = useState({ streak: 0, totalDone: 0, correctRate: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(getStudyStats());
  }, []);

  if (!mounted) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero */}
      <section className="text-center py-10">
        <h1 className="text-3xl font-bold text-slate-900">公基备考</h1>
        <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
          公务员考试公共基础知识在线学习平台 — 覆盖10大学科，随时刷题备考
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.totalDone}</div>
          <div className="text-sm text-slate-500 mt-1">累计刷题数</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-correct-600">{stats.correctRate}%</div>
          <div className="text-sm text-slate-500 mt-1">正确率</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.streak}</div>
          <div className="text-sm text-slate-500 mt-1">连续学习天数</div>
        </div>
        <div className="card text-center">
          <Link href="/wrong" className="text-2xl font-bold text-wrong-600">{stats.totalDone - Math.round(stats.totalDone * stats.correctRate / 100) || 0}</Link>
          <div className="text-sm text-slate-500 mt-1">错题数</div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/practice" className="btn-primary py-4 text-base">
          <GraduationCap className="w-5 h-5" /> 开始刷题
        </Link>
        <Link href="/wrong" className="btn-secondary py-4 text-base">
          <Pen className="w-5 h-5" /> 错题重做
        </Link>
        <Link href="/exam" className="btn-secondary py-4 text-base">
          <Clock className="w-5 h-5" /> 模拟考试
        </Link>
      </section>

      {/* Category Grid */}
      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4">选择学科</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => {
            const color = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.blue;
            return (
              <Link
                key={cat.id}
                href={`/knowledge/${cat.id}`}
                className={`card-hover flex flex-col items-center text-center p-4 ${color.light} ${color.border}`}
              >
                <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center mb-2`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium text-sm text-slate-900">{cat.name}</div>
                <div className="text-xs text-slate-500 mt-1">{cat.description.slice(0, 20)}...</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
