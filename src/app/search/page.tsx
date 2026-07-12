export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">全站搜索</h1>
      <p className="text-slate-500 mb-8">搜索知识点和题库</p>
      
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="search"
            placeholder="输入关键词搜索知识点..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-slate-700"
          />
          <button className="btn-primary px-6">搜索</button>
        </div>
        <p className="text-sm text-slate-400 text-center py-8">
          搜索功能正在开发中，敬请期待。目前可以通过知识库浏览和分类刷题来学习。
        </p>
      </div>
    </div>
  );
}
