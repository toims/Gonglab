'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCategoryById, CATEGORY_COLORS } from '@/lib/constants';
import { getArticlesByCategory } from '@/lib/content';
import { loadBookmarkSlugs, toggleBookmark } from '@/lib/bookmarks';
import { STORAGE_KEYS } from '@/lib/storage';
import { ArrowLeft, BookOpen, FileText, GraduationCap, Star } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const category = getCategoryById(categoryId);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [customArticles, setCustomArticles] = useState<{ slug: string; title: string; subcategory: string }[]>([]);

  useEffect(() => {
    setBookmarks(loadBookmarkSlugs());
    // 加载自定义文章
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ARTICLES);
      if (raw) {
        const articles = JSON.parse(raw) as { slug: string; title: string; category: string; subcategory: string }[];
        setCustomArticles(articles.filter(a => a.category === categoryId).map(a => ({ slug: a.slug, title: a.title, subcategory: a.subcategory })));
      }
    } catch {}
  }, [categoryId]);

  if (!category) {
    return <div className="max-w-5xl mx-auto px-4 py-8 text-center text-slate-500">分类未找到</div>;
  }

  const color = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.blue;
  const builtInArticles = getArticlesByCategory(categoryId);

  const subcategoryMap: Record<string, { slug: string; title: string; isCustom: boolean }[]> = {};
  builtInArticles.forEach(a => {
    if (!subcategoryMap[a.subcategory]) subcategoryMap[a.subcategory] = [];
    subcategoryMap[a.subcategory].push({ slug: a.slug, title: a.title, isCustom: false });
  });
  customArticles.forEach(a => {
    if (!subcategoryMap[a.subcategory]) subcategoryMap[a.subcategory] = [];
    subcategoryMap[a.subcategory].push({ slug: a.slug, title: a.title, isCustom: true });
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/knowledge" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> 返回知识库
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className={`w-14 h-14 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{category.name}</h1>
          <p className="text-slate-500 mt-1">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.subcategories.map(sub => {
          const subArticles = subcategoryMap[sub.name] || [];
          return (
            <div key={sub.name} className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-slate-900 text-sm">{sub.label}</h3>
                <Link href={`/practice/${categoryId}?sub=${sub.name}`}
                  className={`text-xs ${color.text} hover:underline flex items-center gap-1 flex-shrink-0`}>
                  <GraduationCap className="w-3 h-3" /> 练习
                </Link>
              </div>
              {subArticles.length > 0 ? (
                <div className="space-y-0.5">
                  {subArticles.map(a => {
                    const isBookmarked = bookmarks.includes(a.slug);
                    const handleToggleBookmark = (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const nowBookmarked = toggleBookmark(a.slug);
                      setBookmarks(prev => nowBookmarked ? [...prev, a.slug] : prev.filter(s => s !== a.slug));
                    };
                    return (
                      <Link key={a.slug} href={`/knowledge/${categoryId}/${a.slug}`}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 py-1.5 px-2 rounded hover:bg-slate-50">
                        <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${a.isCustom ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span className="truncate flex-1">{a.title}</span>
                        <button onClick={handleToggleBookmark}
                          className={`flex-shrink-0 p-0.5 rounded transition-colors ${isBookmarked ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
                          title={isBookmarked ? '取消标记' : '添加标记'}>
                          <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                        </button>
                      </Link>
                    );
                  })}
                </div>
              ) : sub.chapters.map(chapter => (
                <div key={chapter} className="flex items-center gap-2 text-sm text-slate-400 py-1.5 px-2">
                  <FileText className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span className="truncate">{chapter}（待编写）</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
