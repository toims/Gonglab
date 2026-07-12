'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';
import { loadAllQuestions, type MockExam } from '@/lib/questions';
import { ArrowLeft, Plus, Minus, SlidersHorizontal } from 'lucide-react';

// localStorage key for custom exams
const CUSTOM_EXAMS_KEY = 'gk-custom-exams';

interface Distribution {
  单选: number;
  多选: number;
  不定项: number;
}

interface CategoryDist {
  [catId: string]: number; // percentage
}

const TOTAL_MAX = 200;
const TOTAL_MIN = 5;
const TOTAL_DEFAULT = 50;
const DURATION_DEFAULT = 30; // minutes

export default function CreateExamPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [total, setTotal] = useState(TOTAL_DEFAULT);
  const [duration, setDuration] = useState(DURATION_DEFAULT);
  const [categoryDist, setCategoryDist] = useState<CategoryDist>({});
  const [typeDist, setTypeDist] = useState<Distribution>({ 单选: 60, 多选: 25, 不定项: 15 });
  const [availableCounts, setAvailableCounts] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  // Initialize category distribution evenly
  useEffect(() => {
    loadAllQuestions().then((allQ) => {
      const counts: Record<string, number> = {};
      const init: CategoryDist = {};
      const activeCats = CATEGORIES.filter((c) => allQ.some((q) => q.category === c.id));
      const pct = Math.floor(100 / activeCats.length);
      let remainder = 100 - pct * activeCats.length;
      activeCats.forEach((c, i) => {
        counts[c.id] = allQ.filter((q) => q.category === c.id).length;
        init[c.id] = pct + (i < remainder ? 1 : 0);
      });
      setAvailableCounts(counts);
      setCategoryDist(init);
    });
  }, []);

  // Validate configuration
  const validate = (): string[] => {
    const errs: string[] = [];
    const catTotal = Object.values(categoryDist).reduce((s, v) => s + v, 0);
    if (Math.abs(catTotal - 100) > 1) errs.push('学科占比总和应为 100%');
    const typeTotal = Object.values(typeDist).reduce((s, v) => s + v, 100);
    if (Math.abs(typeTotal - 100) > 1) errs.push('题型占比总和应为 100%');
    if (!title.trim()) errs.push('请输入试卷标题');
    if (total < TOTAL_MIN || total > TOTAL_MAX) errs.push(`题数应在 ${TOTAL_MIN}-${TOTAL_MAX} 之间`);

    // Check category availability
    for (const [catId, pct] of Object.entries(categoryDist)) {
      const needed = Math.round(total * pct / 100);
      if (needed > 0 && needed > (availableCounts[catId] || 0)) {
        const cat = CATEGORIES.find((c) => c.id === catId);
        errs.push(`「${cat?.name || catId}」题库不足（需 ${needed}，有 ${availableCounts[catId] || 0}）`);
      }
    }
    return errs;
  };

  // Generate the exam
  const handleGenerate = async () => {
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }

    setGenerating(true);
    setErrors([]);

    try {
      const allQ = await loadAllQuestions();
      const questionIds: string[] = [];

      // Calculate per-category counts from percentages
      let allocated = 0;
      const catCounts: { catId: string; count: number }[] = [];

      for (const [catId, pct] of Object.entries(categoryDist)) {
        if (pct <= 0) continue;
        const count = Math.round(total * pct / 100);
        if (count > 0) {
          catCounts.push({ catId, count });
          allocated += count;
        }
      }

      // Adjust for rounding (give/take from largest category)
      const diff = total - allocated;
      if (diff !== 0 && catCounts.length > 0) {
        catCounts.sort((a, b) => b.count - a.count);
        catCounts[0].count += diff;
      }

      // Calculate per-type counts from percentages
      const typeTargets: { type: string; count: number }[] = [];
      let typeAllocated = 0;
      for (const [type, pct] of Object.entries(typeDist)) {
        const count = Math.round(total * pct / 100);
        if (count > 0) {
          typeTargets.push({ type, count });
          typeAllocated += count;
        }
      }
      const typeDiff = total - typeAllocated;
      if (typeDiff !== 0 && typeTargets.length > 0) {
        typeTargets.sort((a, b) => b.count - a.count);
        typeTargets[0].count += typeDiff;
      }

      // Select questions per category, matching types
      for (const { catId, count } of catCounts) {
        if (count <= 0) continue;
        const pool = allQ.filter((q) => q.category === catId);
        const selected: string[] = [];
        const used = new Set<string>();

        // Try to match type distribution proportionally
        for (const { type, count: tCount } of typeTargets) {
          const typeCount = Math.round(count * tCount / total);
          const candidates = pool.filter((q) => q.type === type && !used.has(q.id));
          // Shuffle for randomness
          for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
          }
          for (const q of candidates) {
            if (selected.length >= count) break;
            if (used.has(q.id)) continue;
            used.add(q.id);
            selected.push(q.id);
          }
        }

        // Fill remaining with any type
        if (selected.length < count) {
          const rest = pool.filter((q) => !used.has(q.id));
          for (let i = rest.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rest[i], rest[j]] = [rest[j], rest[i]];
          }
          for (const q of rest) {
            if (selected.length >= count) break;
            selected.push(q.id);
          }
        }

        questionIds.push(...selected.slice(0, count));
      }

      if (questionIds.length === 0) {
        setErrors(['未能生成任何题目，请检查题库和配置']);
        setGenerating(false);
        return;
      }

      // Create exam object
      const examId = `custom-${Date.now()}`;
      const exam: MockExam = {
        id: examId,
        title: title.trim(),
        description: `自定义试卷 · ${questionIds.length} 题 · ${duration} 分钟`,
        duration,
        questionIds,
        category: 'custom',
      };

      // Store in localStorage
      const existing: MockExam[] = (() => {
        try {
          const r = localStorage.getItem(CUSTOM_EXAMS_KEY);
          return r ? JSON.parse(r) : [];
        } catch { return []; }
      })();
      existing.push(exam);
      localStorage.setItem(CUSTOM_EXAMS_KEY, JSON.stringify(existing));

      router.push(`/exam/${examId}`);
    } catch (e) {
      setErrors(['生成失败：' + String(e)]);
      setGenerating(false);
    }
  };

  // Update one category's percentage
  const setCatPct = (catId: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setCategoryDist((prev) => ({ ...prev, [catId]: clamped }));
  };

  // Update one type's percentage
  const setTypePct = (key: keyof Distribution, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setTypeDist((prev) => ({ ...prev, [key]: clamped }));
  };

  const catTotal = Object.values(categoryDist).reduce((s, v) => s + v, 0);
  const typeTotal = Object.values(typeDist).reduce((s, v) => s + v, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => router.push('/exam')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> 返回模拟考
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <SlidersHorizontal className="w-6 h-6 text-primary-600" /> 创建自定义试卷
      </h1>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          {errors.map((e, i) => <p key={i} className="text-sm text-red-700">{e}</p>)}
        </div>
      )}

      {/* Basic settings */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">基本设置</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">试卷标题</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="如：综合模拟卷(一)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              总题数 <span className="text-slate-400">({TOTAL_MIN}-{TOTAL_MAX})</span>
            </label>
            <div className="flex items-center gap-2">
              <button onClick={() => setTotal(Math.max(TOTAL_MIN, total - 5))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <Minus className="w-4 h-4" />
              </button>
              <input type="number" value={total}
                onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) setTotal(Math.max(TOTAL_MIN, Math.min(TOTAL_MAX, v))); }}
                className="w-20 text-center border border-slate-300 rounded-lg px-2 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary-500" />
              <button onClick={() => setTotal(Math.min(TOTAL_MAX, total + 5))} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">考试时长（分钟）</label>
            <input type="number" value={duration}
              onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setDuration(v); }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      {/* Category distribution */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">学科占比</h2>
          <span className={`text-sm font-mono font-bold ${Math.abs(catTotal - 100) <= 1 ? 'text-green-600' : 'text-red-500'}`}>
            {catTotal}%
          </span>
        </div>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const pct = categoryDist[cat.id] || 0;
            const questionCount = Math.round(total * pct / 100);
            const avail = availableCounts[cat.id] || 0;
            const shortage = questionCount > avail;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700">{cat.name}</span>
                  <span className={`font-mono text-xs ${shortage ? 'text-red-500' : 'text-slate-400'}`}>
                    {pct}% ≈ {questionCount} 题{shortage ? ` (仅${avail})` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCatPct(cat.id, pct - 5)} disabled={pct <= 0}
                    className="p-0.5 rounded text-slate-400 hover:bg-slate-100 disabled:opacity-20">
                    <Minus className="w-3 h-3" />
                  </button>
                  <input type="range" min="0" max="100" value={pct}
                    onChange={(e) => setCatPct(cat.id, parseInt(e.target.value))}
                    className="flex-1 h-2 rounded-full appearance-none bg-slate-200 accent-primary-600 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600" />
                  <button onClick={() => setCatPct(cat.id, pct + 5)} disabled={pct >= 100}
                    className="p-0.5 rounded text-slate-400 hover:bg-slate-100 disabled:opacity-20">
                    <Plus className="w-3 h-3" />
                  </button>
                  <input type="number" min="0" max="100" value={pct}
                    onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) setCatPct(cat.id, v); }}
                    className="w-14 text-center text-xs border border-slate-200 rounded px-1 py-1 font-mono outline-none" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Type distribution */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">题型占比</h2>
          <span className={`text-sm font-mono font-bold ${Math.abs(typeTotal - 100) <= 1 ? 'text-green-600' : 'text-red-500'}`}>
            {typeTotal}%
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['单选', '多选', '不定项'] as const).map((type) => {
            const pct = typeDist[type];
            const count = Math.round(total * pct / 100);
            return (
              <div key={type}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700">{type}题</span>
                  <span className="text-xs text-slate-400 font-mono">{pct}% ≈ {count} 题</span>
                </div>
                <input type="range" min="0" max="100" value={pct}
                  onChange={(e) => setTypePct(type, parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-primary-600 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">生成预览</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="pb-2 font-medium">学科</th>
                <th className="pb-2 font-medium text-right">题数</th>
                <th className="pb-2 font-medium text-right">单选</th>
                <th className="pb-2 font-medium text-right">多选</th>
                <th className="pb-2 font-medium text-right">不定项</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.filter((c) => (categoryDist[c.id] || 0) > 0).map((cat) => {
                const pct = categoryDist[cat.id] || 0;
                const count = Math.round(total * pct / 100);
                const s = Math.round(count * typeDist['单选'] / 100);
                const m = Math.round(count * typeDist['多选'] / 100);
                const u = count - s - m;
                return (
                  <tr key={cat.id} className="border-b border-slate-50">
                    <td className="py-2 text-slate-700">{cat.name}</td>
                    <td className="py-2 text-right font-mono text-slate-900">{count}</td>
                    <td className="py-2 text-right font-mono text-slate-500">{Math.max(0, s)}</td>
                    <td className="py-2 text-right font-mono text-slate-500">{Math.max(0, m)}</td>
                    <td className="py-2 text-right font-mono text-slate-500">{Math.max(0, u)}</td>
                  </tr>
                );
              })}
              <tr className="font-semibold">
                <td className="py-2 text-slate-900">合计</td>
                <td className="py-2 text-right font-mono text-slate-900">{total}</td>
                <td className="py-2 text-right font-mono text-slate-700">{Math.round(total * typeDist['单选'] / 100)}</td>
                <td className="py-2 text-right font-mono text-slate-700">{Math.round(total * typeDist['多选'] / 100)}</td>
                <td className="py-2 text-right font-mono text-slate-700">{Math.round(total * typeDist['不定项'] / 100)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="btn-primary w-full text-base py-3 disabled:opacity-50"
      >
        {generating ? '正在生成试卷...' : `生成试卷 · ${total} 题 · ${duration} 分钟`}
      </button>
    </div>
  );
}
