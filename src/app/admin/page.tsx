'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';
import { STORAGE_KEYS } from '@/lib/storage';
import { Plus, Upload, Download, Trash2, Edit3, Eye, Database, FileJson } from 'lucide-react';

interface AdminArticle {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  frequency: '高频' | '中频' | '低频';
  keywords: string[];
  content: string; // HTML content
}

const STORAGE_KEY = STORAGE_KEYS.CUSTOM_ARTICLES;

function loadArticles(): AdminArticle[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveArticles(articles: AdminArticle[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function getSubcategories(categoryId: string): string[] {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return [];
  return cat.subcategories.map(s => s.name);
}

export default function AdminPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [previewing, setPreviewing] = useState<AdminArticle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState<AdminArticle>({
    slug: '',
    title: '',
    category: 'politics',
    subcategory: '',
    frequency: '中频',
    keywords: [],
    content: '',
  });
  const [kwInput, setKwInput] = useState('');

  useEffect(() => {
    setArticles(loadArticles());
  }, []);

  const handleSave = () => {
    if (!form.title || !form.slug || !form.content) return;
    const existing = articles.findIndex(a => a.slug === form.slug);
    const next = [...articles];
    if (existing >= 0) {
      next[existing] = { ...form };
    } else {
      next.push({ ...form });
    }
    saveArticles(next);
    setArticles(next);
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (slug: string) => {
    const next = articles.filter(a => a.slug !== slug);
    saveArticles(next);
    setArticles(next);
  };

  const handleEdit = (article: AdminArticle) => {
    setForm({ ...article });
    setEditing(article);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ slug: '', title: '', category: 'politics', subcategory: '', frequency: '中频', keywords: [], content: '' });
    setKwInput('');
    setEditing(null);
  };

  // 导出所有文章（含内置）
  const handleExport = async () => {
    // Gather both custom and built-in articles
    const cats = CATEGORIES.map(c => c.id);
    const exported: AdminArticle[] = [...articles]; // custom articles
    
    // Append built-in article metadata
    try {
      const { getArticlesByCategory } = await import('@/lib/content');
      cats.forEach(catId => {
        const builtIn = getArticlesByCategory(catId);
        builtIn.forEach(a => {
          if (!exported.find(e => e.slug === a.slug)) {
            exported.push({
              slug: a.slug,
              title: a.title,
              category: a.category,
              subcategory: a.subcategory,
              frequency: a.frequency,
              keywords: a.keywords,
              content: '',
            });
          }
        });
      });
    } catch {}

    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-articles-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入文章
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as AdminArticle[];
        if (!Array.isArray(data)) throw new Error('格式错误');
        const existing = loadArticles();
        const existingSlugs = new Set(existing.map(a => a.slug));
        let added = 0;
        data.forEach(item => {
          if (!existingSlugs.has(item.slug)) {
            existing.push(item);
            existingSlugs.add(item.slug);
            added++;
          }
        });
        saveArticles(existing);
        setArticles(existing);
        setImportMsg(`成功导入 ${added} 篇文章`);
        setTimeout(() => setImportMsg(''), 3000);
      } catch {
        setImportMsg('导入失败：JSON 格式不正确');
        setTimeout(() => setImportMsg(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 生成 slug（从标题自动生成拼音简写）
  const generateSlug = (title: string, cat: string) => {
    const prefix = cat.slice(0, 4);
    const num = Date.now().toString(36);
    return `${prefix}-${num}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">内容管理后台</h1>
          <p className="text-slate-500 text-sm mt-1">管理知识库文章、导入导出内容</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> 新建文章
        </button>
      </div>

      {/* 导入/导出操作栏 */}
      <div className="card mb-6 p-4 flex items-center gap-4 flex-wrap">
        <button onClick={handleExport} className="btn-secondary gap-2 text-sm">
          <Download className="w-4 h-4" /> 导出 JSON
        </button>
        <label className="btn-secondary gap-2 text-sm cursor-pointer">
          <Upload className="w-4 h-4" /> 导入 JSON
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
        {importMsg && <span className={`text-sm ${importMsg.includes('失败') ? 'text-wrong-600' : 'text-correct-600'}`}>{importMsg}</span>}
      </div>

      {/* 题库导入 */}
      <div className="card mb-6 p-4">
        <h3 className="font-medium text-slate-900 text-sm mb-2 flex items-center gap-2"><Database className="w-4 h-4 text-primary-600" /> 题库管理</h3>
        <p className="text-xs text-slate-500 mb-3">导入题目 JSON 文件，导入后会自动合并到题库中，刷题和模拟考均可使用。</p>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="btn-secondary gap-2 text-sm cursor-pointer">
            <Upload className="w-4 h-4" /> 导入题目 JSON
            <input type="file" accept=".json" onChange={(e) => {
              const f = e.target.files?.[0]; if (!f) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const qs = JSON.parse(ev.target?.result as string);
                  if (!Array.isArray(qs)) throw new Error('格式错误');
                  let existing: unknown[] = [];
                  try { const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS); if (raw) existing = JSON.parse(raw); } catch {}
                  const existingIds = new Set((existing as { id: string }[]).map((q: { id: string }) => q.id));
                  let added = 0;
                  qs.forEach((q: { id: string }) => { if (!existingIds.has(q.id)) { existing.push(q); existingIds.add(q.id); added++; }});
                  localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(existing));
                  import('@/lib/questions').then(m => m.clearQuestionsCache());
                  setImportMsg(`成功导入 ${added} 道题目，刷新刷题页面生效`);
                  setTimeout(() => setImportMsg(''), 3000);
                } catch { setImportMsg('导入失败：JSON 格式不正确'); setTimeout(() => setImportMsg(''), 3000); }
              };
              reader.readAsText(f);
              e.target.value = '';
            }} className="hidden" />
          </label>
          <button onClick={() => {
            try {
              const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
              const questions = raw ? JSON.parse(raw) : [];
              const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `questions-${new Date().toISOString().split('T')[0]}.json`; a.click();
              URL.revokeObjectURL(url);
            } catch {}
          }} className="btn-secondary gap-2 text-sm">
            <Download className="w-4 h-4" /> 导出题目
          </button>
          <button onClick={() => {
            localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
            import('@/lib/questions').then(m => m.clearQuestionsCache());
            setImportMsg('已清空导入的题目');
            setTimeout(() => setImportMsg(''), 3000);
          }} className="text-xs text-wrong-600 hover:text-wrong-700 underline">清空导入题目</button>
        </div>
      </div>

      {/* 新建/编辑表单 */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="font-bold text-slate-900 mb-4">{editing ? '编辑文章' : '新建文章'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">文章标题 *</label>
              <input
                type="text" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value, slug: form.slug || generateSlug(e.target.value, form.category) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-100 outline-none"
                placeholder="如：民法总则精讲"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug *</label>
              <input
                type="text" value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 outline-none font-mono"
                placeholder="auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">学科 *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value, subcategory: '' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">章节 *</label>
              <select
                value={form.subcategory}
                onChange={e => setForm({ ...form, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              >
                <option value="">-- 选择章节 --</option>
                {getSubcategories(form.category).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">考频</label>
              <select
                value={form.frequency}
                onChange={e => setForm({ ...form, frequency: e.target.value as AdminArticle['frequency'] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 outline-none"
              >
                <option value="高频">高频</option>
                <option value="中频">中频</option>
                <option value="低频">低频</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">关键词（逗号分隔）</label>
              <div className="flex gap-2">
                <input
                  type="text" value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const kw = kwInput.trim().replace(/,/g, '');
                      if (kw && !form.keywords.includes(kw)) {
                        setForm({ ...form, keywords: [...form.keywords, kw] });
                      }
                      setKwInput('');
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 outline-none"
                  placeholder="输入后回车添加"
                />
              </div>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.keywords.map(kw => (
                    <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs">
                      {kw}
                      <button onClick={() => setForm({ ...form, keywords: form.keywords.filter(k => k !== kw) })} className="hover:text-wrong-600">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">正文（HTML）*</label>
            <textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary-500 outline-none font-mono"
              rows={10}
              placeholder={`<h2>概述</h2>\n<p>正文内容...</p>\n<h2>核心考点</h2>\n<ul>\n  <li>考点一</li>\n  <li>考点二</li>\n</ul>`}
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary gap-2 text-sm" disabled={!form.title || !form.slug || !form.content}>
              <Plus className="w-4 h-4" /> 保存文章
            </button>
            <button onClick={() => setPreviewing({ ...form })} className="btn-secondary gap-2 text-sm" disabled={!form.content}>
              <Eye className="w-4 h-4" /> 预览
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-sm text-slate-500 hover:text-slate-700">取消</button>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      {previewing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreviewing(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">{previewing.title || '(未命名)'}</h3>
            <p className="text-sm text-slate-500 mb-4">{previewing.category} / {previewing.subcategory} · {previewing.frequency}</p>
            <div className="prose prose-slate max-w-none text-sm" dangerouslySetInnerHTML={{ __html: previewing.content }} />
            <button onClick={() => setPreviewing(null)} className="btn-secondary mt-4 text-sm">关闭预览</button>
          </div>
        </div>
      )}

      {/* 文章列表 */}
      <h2 className="font-bold text-slate-900 mb-3">已导入的文章（{articles.length} 篇）</h2>
      {articles.length === 0 ? (
        <div className="card text-center py-8 text-slate-400 text-sm">
          暂无自定义文章。点击"新建文章"或"导入 JSON"来添加内容。
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map(article => (
            <div key={article.slug} className="card p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 text-sm truncate">{article.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {CATEGORIES.find(c => c.id === article.category)?.name || article.category} / {article.subcategory} · {article.frequency}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button onClick={() => handleEdit(article)} className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-50">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(article.slug)} className="p-2 text-slate-400 hover:text-wrong-600 rounded-lg hover:bg-slate-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
