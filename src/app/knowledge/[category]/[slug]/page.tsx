'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Star } from 'lucide-react';
import { CATEGORIES, FREQUENCY_STYLES } from '@/lib/constants';
import { toggleBookmark as toggleBm, loadBookmarkSlugs } from '@/lib/bookmarks';
import { STORAGE_KEYS } from '@/lib/storage';

interface ArticleContent {
  title: string;
  category: string;
  categoryName: string;
  subcategory: string;
  frequency: string;
  keywords: string[];
  html: string;
}

// 轻量版内置内容映射（仅元数据 + 摘要）
const builtInMeta: Record<string, { title: string; category: string; categoryName: string; subcategory: string; frequency: string; keywords: string[]; points: string[] }> = {
  'overview': { title: '马克思主义哲学概述', category: 'politics', categoryName: '政治理论', subcategory: 'marxism', frequency: '高频', keywords: ['马哲'], points: ['马哲产生条件', '哲学基本问题', '唯物主义与唯心主义'] },
  'dialectics': { title: '唯物辩证法', category: 'politics', categoryName: '政治理论', subcategory: 'marxism', frequency: '高频', keywords: ['矛盾'], points: ['对立统一规律', '量变质变规律', '否定之否定规律'] },
  'politics-mao': { title: '毛泽东思想概论', category: 'politics', categoryName: '政治理论', subcategory: 'mao-zedong', frequency: '高频', keywords: ['毛概'], points: ['新民主主义革命', '农村包围城市', '三大法宝'] },
  'politics-socialism': { title: '中国特色社会主义', category: 'politics', categoryName: '政治理论', subcategory: 'socialism', frequency: '高频', keywords: ['中特'], points: ['初级阶段', '改革开放', '四个全面'] },
  'national-organs': { title: '国家机构的组成与职权', category: 'law', categoryName: '法律知识', subcategory: 'constitution', frequency: '高频', keywords: ['全国人大', '国务院'], points: ['全国人大职权', '国务院组成', '国家监察委'] },
  'law-civil-basics': { title: '民法总则基础', category: 'law', categoryName: '法律知识', subcategory: 'civil-law', frequency: '高频', keywords: ['民法'], points: ['民事权利能力', '民事行为能力', '诉讼时效'] },
  'law-criminal-basics': { title: '刑法基础', category: 'law', categoryName: '法律知识', subcategory: 'criminal-law', frequency: '高频', keywords: ['刑法'], points: ['犯罪构成四要件', '刑事责任年龄', '主刑与附加刑'] },
  'law-admin-basics': { title: '行政法基础', category: 'law', categoryName: '法律知识', subcategory: 'admin-law', frequency: '中频', keywords: ['行政法'], points: ['行政行为分类', '行政处罚种类', '行政复议'] },
  'law-procedure': { title: '诉讼法基础', category: 'law', categoryName: '法律知识', subcategory: 'procedure-law', frequency: '中频', keywords: ['诉讼法'], points: ['民诉基本原则', '刑诉程序', '行政诉讼范围'] },
  'law-economic-law': { title: '劳动法与消法', category: 'law', categoryName: '法律知识', subcategory: 'economic-law', frequency: '中频', keywords: ['经济法'], points: ['劳动合同', '消费者权利', '不正当竞争'] },
  'supply-demand': { title: '需求与供给', category: 'economics', categoryName: '经济常识', subcategory: 'micro', frequency: '中频', keywords: ['需求', '供给'], points: ['需求定律', '供给定律', '均衡价格'] },
  'econ-macro-basics': { title: '宏观经济基础', category: 'economics', categoryName: '经济常识', subcategory: 'macro', frequency: '中频', keywords: ['GDP'], points: ['GDP概念', '通货膨胀', '失业类型'] },
  'econ-fiscal': { title: '财政与税收', category: 'economics', categoryName: '经济常识', subcategory: 'fiscal', frequency: '中频', keywords: ['税收'], points: ['财政收入支出', '税收分类', '财政政策'] },
  'econ-money': { title: '货币与银行', category: 'economics', categoryName: '经济常识', subcategory: 'money-bank', frequency: '中频', keywords: ['货币'], points: ['货币职能', '中央银行', '货币政策'] },
  'doc-types-basics': { title: '公文种类与格式', category: 'document-writing', categoryName: '公文写作', subcategory: 'types', frequency: '中频', keywords: ['公文'], points: ['15种法定公文', '行文方向', '格式要素'] },
  'doc-rules': { title: '行文规则', category: 'document-writing', categoryName: '公文写作', subcategory: 'rules', frequency: '中频', keywords: ['行文'], points: ['行文关系', '主送抄送', '联合行文'] },
  'doc-writing-guide': { title: '公文写作要点', category: 'document-writing', categoryName: '公文写作', subcategory: 'writing', frequency: '中频', keywords: ['写作'], points: ['通知写法', '请示与报告', '批复与函'] },
  'history-qin-han': { title: '秦汉帝国', category: 'history', categoryName: '人文历史', subcategory: 'ancient-1', frequency: '高频', keywords: ['秦汉'], points: ['秦统一六国', '文景之治', '丝绸之路'] },
  'history-tang-song': { title: '隋唐与宋元', category: 'history', categoryName: '人文历史', subcategory: 'ancient-2', frequency: '中频', keywords: ['隋唐'], points: ['贞观之治', '科举制度', '宋代经济'] },
  'history-opium': { title: '鸦片战争', category: 'history', categoryName: '人文历史', subcategory: 'modern', frequency: '高频', keywords: ['鸦片战争'], points: ['第一次鸦片战争', '南京条约', '半殖民地化'] },
  'history-revolution': { title: '辛亥革命', category: 'history', categoryName: '人文历史', subcategory: 'modern', frequency: '高频', keywords: ['辛亥革命'], points: ['同盟会三民主义', '武昌起义', '民国成立'] },
  'history-world-war': { title: '世界大战', category: 'history', categoryName: '人文历史', subcategory: 'world', frequency: '中频', keywords: ['世界大战'], points: ['一战', '二战', '冷战格局'] },
  'lit-shi-jing': { title: '先秦两汉文学', category: 'literature', categoryName: '文学常识', subcategory: 'ancient-lit', frequency: '中频', keywords: ['先秦'], points: ['诗经风雅颂', '屈原楚辞', '司马迁史记'] },
  'lit-tang-song-lit': { title: '唐宋文学', category: 'literature', categoryName: '文学常识', subcategory: 'ancient-lit', frequency: '中频', keywords: ['唐宋'], points: ['李白与杜甫', '唐宋八大家', '宋词流派'] },
  'lit-modern-main': { title: '近现代文学', category: 'literature', categoryName: '文学常识', subcategory: 'modern-lit', frequency: '中频', keywords: ['鲁迅'], points: ['鲁迅', '茅盾', '巴金'] },
  'lit-foreign-main': { title: '外国文学', category: 'literature', categoryName: '文学常识', subcategory: 'foreign-lit', frequency: '低频', keywords: ['外国文学'], points: ['文艺复兴', '批判现实主义', '俄国文学'] },
  'lit-culture-main': { title: '文化常识', category: 'literature', categoryName: '文学常识', subcategory: 'culture', frequency: '低频', keywords: ['文化'], points: ['传统节日', '二十四节气', '书画艺术'] },
  'sci-four-inventions': { title: '中国古代科技', category: 'science', categoryName: '科技常识', subcategory: 'sci-history', frequency: '中频', keywords: ['四大发明'], points: ['四大发明', '天文成就', '中医药学'] },
  'sci-frontier': { title: '现代前沿科技', category: 'science', categoryName: '科技常识', subcategory: 'frontier', frequency: '中频', keywords: ['AI'], points: ['人工智能', '中国航天', '5G通信'] },
  'sci-it-basics': { title: '信息技术基础', category: 'science', categoryName: '科技常识', subcategory: 'it', frequency: '低频', keywords: ['计算机'], points: ['计算机组成', '互联网协议', '大数据'] },
  'pcb-newton': { title: '力学基础', category: 'physics-chem-bio', categoryName: '理化生', subcategory: 'physics', frequency: '低频', keywords: ['牛顿'], points: ['牛顿三定律', '重力与摩擦', '功与能'] },
  'pcb-chemistry': { title: '化学基础', category: 'physics-chem-bio', categoryName: '理化生', subcategory: 'chemistry', frequency: '低频', keywords: ['元素'], points: ['常见元素', '酸碱盐', '反应类型'] },
  'pcb-cells': { title: '生物基础', category: 'physics-chem-bio', categoryName: '理化生', subcategory: 'biology', frequency: '低频', keywords: ['细胞'], points: ['细胞结构', '遗传变异', '生态系统'] },
  'geo-physical': { title: '自然地理', category: 'geography', categoryName: '地理常识', subcategory: 'physical-geo', frequency: '低频', keywords: ['地形'], points: ['地形类型', '气候分布', '世界河流'] },
  'geo-china-terrain': { title: '中国地理', category: 'geography', categoryName: '地理常识', subcategory: 'china-geo', frequency: '低频', keywords: ['三级阶梯'], points: ['三级阶梯', '主要山脉', '四大高原'] },
  'geo-world': { title: '世界地理', category: 'geography', categoryName: '地理常识', subcategory: 'world-geo', frequency: '低频', keywords: ['大洲'], points: ['七大洲', '面积前六国', '国际通道'] },
  'nc-land-resource': { title: '国土与资源', category: 'national-conditions', categoryName: '国情省情', subcategory: 'land', frequency: '中频', keywords: ['国土'], points: ['陆地面积', '自然资源', '环境保护'] },
  'nc-population': { title: '人口与民族', category: 'national-conditions', categoryName: '国情省情', subcategory: 'population', frequency: '中频', keywords: ['人口'], points: ['人口结构', '56个民族', '人口政策'] },
  'nc-admin-division': { title: '行政区划与国家机构', category: 'national-conditions', categoryName: '国情省情', subcategory: 'state', frequency: '中频', keywords: ['行政'], points: ['34省级区', '4直辖市', '国家机构'] },
  'nc-foreign': { title: '外交与国际事务', category: 'national-conditions', categoryName: '国情省情', subcategory: 'foreign', frequency: '中频', keywords: ['外交'], points: ['五项原则', '一带一路', '国际组织'] },
};

function loadCustomArticles(): Record<string, ArticleContent> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_ARTICLES);
    if (!raw) return {};
    const articles = JSON.parse(raw) as { slug: string; title: string; category: string; subcategory: string; frequency: string; keywords: string[]; content: string }[];
    const map: Record<string, ArticleContent> = {};
    articles.forEach(a => {
      const cat = CATEGORIES.find(c => c.id === a.category);
      map[a.slug] = {
        title: a.title,
        category: a.category,
        categoryName: cat?.name || a.category,
        subcategory: a.subcategory,
        frequency: a.frequency,
        keywords: a.keywords,
        html: a.content,
      };
    });
    return map;
  } catch { return {}; }
}

export default function ArticlePage() {
  const params = useParams();
  const category = params.category as string;
  const slug = params.slug as string;
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  const handleToggleBookmark = () => {
    const nowBookmarked = toggleBm(slug);
    setBookmarked(nowBookmarked);
  };

  useEffect(() => {
    setBookmarked(loadBookmarkSlugs().includes(slug));
    // 1. 检查自定义文章（localStorage）
    const custom = loadCustomArticles();
    if (custom[slug]) {
      setArticle(custom[slug]);
      return;
    }
    // 2. 检查内置文章
    const meta = builtInMeta[slug];
    if (meta && meta.category === category) {
      setArticle({
        title: meta.title,
        category: meta.category,
        categoryName: meta.categoryName,
        subcategory: meta.subcategory,
        frequency: meta.frequency,
        keywords: meta.keywords,
        html: `<h2>测试内容</h2><p>本文为<strong>${meta.title}</strong>章节的测试占位内容。详细版本将在后续更新中补充完善。</p><h3>核心考点</h3><ul>${meta.points.map(p => `<li>${p}</li>`).join('')}</ul>`,
      });
    }
  }, [slug, category]);

  if (!article || article.category !== category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">文章未找到</p>
        <Link href="/knowledge" className="btn-primary">返回知识库</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
        <Link href="/knowledge" className="hover:text-primary-600">知识库</Link>
        <span>/</span>
        <Link href={`/knowledge/${article.category}`} className="hover:text-primary-600">{article.categoryName}</Link>
        <span>/</span>
        <span className="text-slate-400">{article.title}</span>
      </nav>

      <article className="card">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h1 className="text-2xl font-bold text-slate-900">{article.title}</h1>
          <button onClick={handleToggleBookmark} className={`p-1.5 rounded-lg transition-colors ${bookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'}`} title={bookmarked ? '取消标记' : '添加标记'}>
            <Star className={`w-5 h-5 ${bookmarked ? 'fill-amber-400' : ''}`} />
          </button>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${FREQUENCY_STYLES[article.frequency] || ''}`}>
            {article.frequency}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {article.keywords.map(kw => (
            <span key={kw} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{kw}</span>
          ))}
        </div>

        <div
          className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-200 prose-h3:text-lg prose-h3:font-semibold prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">掌握知识点后，来刷题巩固吧</div>
          <Link href={`/practice/${article.category}?sub=${article.subcategory}`} className="btn-primary gap-1.5">
            <GraduationCap className="w-4 h-4" /> 去刷题
          </Link>
        </div>
      </article>
    </div>
  );
}
