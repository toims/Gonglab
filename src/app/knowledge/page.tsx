import Link from 'next/link';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function KnowledgePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">知识库</h1>
      <p className="text-slate-500 mb-8">按学科浏览公基考试全部考点知识</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => {
          const color = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.blue;
          return (
            <Link key={cat.id} href={`/knowledge/${cat.id}`} className="card-hover group">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900">{cat.name}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${cat.weight === '高' ? 'bg-red-100 text-red-600' : cat.weight === '中' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.weight}频
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{cat.description}</p>
                  <div className="mt-2 text-xs text-slate-400">
                    {cat.subcategories.length} 个章节
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 flex-shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
