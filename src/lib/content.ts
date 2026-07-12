// 知识点内容加载工具

export interface KnowledgeArticle {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  order: number;
  frequency: '高频' | '中频' | '低频';
  keywords: string[];
}

// 所有文章索引（与 knowledge/[category]/[slug]/page.tsx 保持同步）
const allArticles: KnowledgeArticle[] = [
  // 政治理论
  { slug: 'overview', title: '测试内容—马克思主义哲学概述', category: 'politics', subcategory: 'marxism', order: 1, frequency: '高频', keywords: ['马哲'] },
  { slug: 'dialectics', title: '唯物辩证法', category: 'politics', subcategory: 'marxism', order: 2, frequency: '高频', keywords: ['矛盾'] },
  { slug: 'politics-mao', title: '测试内容—毛泽东思想概论', category: 'politics', subcategory: 'mao-zedong', order: 1, frequency: '高频', keywords: ['毛概'] },
  { slug: 'politics-socialism', title: '测试内容—中国特色社会主义', category: 'politics', subcategory: 'socialism', order: 1, frequency: '高频', keywords: ['中特'] },
  // 法律知识
  { slug: 'national-organs', title: '国家机构的组成与职权', category: 'law', subcategory: 'constitution', order: 4, frequency: '高频', keywords: ['全国人大', '国务院'] },
  { slug: 'law-civil-basics', title: '测试内容—民法总则基础', category: 'law', subcategory: 'civil-law', order: 1, frequency: '高频', keywords: ['民法'] },
  { slug: 'law-criminal-basics', title: '测试内容—刑法基础', category: 'law', subcategory: 'criminal-law', order: 1, frequency: '高频', keywords: ['刑法'] },
  { slug: 'law-admin-basics', title: '测试内容—行政法基础', category: 'law', subcategory: 'admin-law', order: 1, frequency: '中频', keywords: ['行政法'] },
  { slug: 'law-procedure', title: '测试内容—诉讼法基础', category: 'law', subcategory: 'procedure-law', order: 1, frequency: '中频', keywords: ['诉讼法'] },
  { slug: 'law-economic-law', title: '测试内容—劳动法与消法', category: 'law', subcategory: 'economic-law', order: 1, frequency: '中频', keywords: ['经济法'] },
  // 经济常识
  { slug: 'supply-demand', title: '需求与供给', category: 'economics', subcategory: 'micro', order: 1, frequency: '中频', keywords: ['需求', '供给'] },
  { slug: 'econ-macro-basics', title: '测试内容—宏观经济基础', category: 'economics', subcategory: 'macro', order: 1, frequency: '中频', keywords: ['GDP'] },
  { slug: 'econ-fiscal', title: '测试内容—财政与税收', category: 'economics', subcategory: 'fiscal', order: 1, frequency: '中频', keywords: ['税收'] },
  { slug: 'econ-money', title: '测试内容—货币与银行', category: 'economics', subcategory: 'money-bank', order: 1, frequency: '中频', keywords: ['货币'] },
  // 公文写作
  { slug: 'doc-types-basics', title: '测试内容—公文种类与格式', category: 'document-writing', subcategory: 'types', order: 1, frequency: '中频', keywords: ['公文'] },
  { slug: 'doc-rules', title: '测试内容—行文规则', category: 'document-writing', subcategory: 'rules', order: 1, frequency: '中频', keywords: ['行文'] },
  { slug: 'doc-writing-guide', title: '测试内容—公文写作要点', category: 'document-writing', subcategory: 'writing', order: 1, frequency: '中频', keywords: ['写作'] },
  // 人文历史
  { slug: 'history-qin-han', title: '测试内容—秦汉帝国', category: 'history', subcategory: 'ancient-1', order: 2, frequency: '高频', keywords: ['秦汉'] },
  { slug: 'history-tang-song', title: '测试内容—隋唐与宋元', category: 'history', subcategory: 'ancient-2', order: 1, frequency: '中频', keywords: ['隋唐'] },
  { slug: 'history-opium', title: '测试内容—鸦片战争与近代开端', category: 'history', subcategory: 'modern', order: 1, frequency: '高频', keywords: ['鸦片战争'] },
  { slug: 'history-revolution', title: '测试内容—辛亥革命', category: 'history', subcategory: 'modern', order: 2, frequency: '高频', keywords: ['辛亥革命'] },
  { slug: 'history-world-war', title: '测试内容—世界大战', category: 'history', subcategory: 'world', order: 1, frequency: '中频', keywords: ['世界大战'] },
  // 文学常识
  { slug: 'lit-shi-jing', title: '测试内容—先秦两汉文学', category: 'literature', subcategory: 'ancient-lit', order: 1, frequency: '中频', keywords: ['先秦'] },
  { slug: 'lit-tang-song-lit', title: '测试内容—唐宋文学', category: 'literature', subcategory: 'ancient-lit', order: 2, frequency: '中频', keywords: ['唐宋'] },
  { slug: 'lit-modern-main', title: '测试内容—近现代文学', category: 'literature', subcategory: 'modern-lit', order: 1, frequency: '中频', keywords: ['鲁迅'] },
  { slug: 'lit-foreign-main', title: '测试内容—外国文学', category: 'literature', subcategory: 'foreign-lit', order: 1, frequency: '低频', keywords: ['外国文学'] },
  { slug: 'lit-culture-main', title: '测试内容—文化常识', category: 'literature', subcategory: 'culture', order: 1, frequency: '低频', keywords: ['文化'] },
  // 科技常识
  { slug: 'sci-four-inventions', title: '测试内容—中国古代科技', category: 'science', subcategory: 'sci-history', order: 1, frequency: '中频', keywords: ['四大发明'] },
  { slug: 'sci-frontier', title: '测试内容—现代前沿科技', category: 'science', subcategory: 'frontier', order: 1, frequency: '中频', keywords: ['AI'] },
  { slug: 'sci-it-basics', title: '测试内容—信息技术基础', category: 'science', subcategory: 'it', order: 1, frequency: '低频', keywords: ['计算机'] },
  // 理化生
  { slug: 'pcb-newton', title: '测试内容—力学基础', category: 'physics-chem-bio', subcategory: 'physics', order: 1, frequency: '低频', keywords: ['牛顿'] },
  { slug: 'pcb-chemistry', title: '测试内容—化学基础', category: 'physics-chem-bio', subcategory: 'chemistry', order: 1, frequency: '低频', keywords: ['元素'] },
  { slug: 'pcb-cells', title: '测试内容—生物基础', category: 'physics-chem-bio', subcategory: 'biology', order: 1, frequency: '低频', keywords: ['细胞'] },
  // 地理常识
  { slug: 'geo-physical', title: '测试内容—自然地理', category: 'geography', subcategory: 'physical-geo', order: 1, frequency: '低频', keywords: ['地形'] },
  { slug: 'geo-china-terrain', title: '测试内容—中国地理', category: 'geography', subcategory: 'china-geo', order: 1, frequency: '低频', keywords: ['三级阶梯'] },
  { slug: 'geo-world', title: '测试内容—世界地理', category: 'geography', subcategory: 'world-geo', order: 1, frequency: '低频', keywords: ['大洲'] },
  // 国情省情
  { slug: 'nc-land-resource', title: '测试内容—国土与资源', category: 'national-conditions', subcategory: 'land', order: 1, frequency: '中频', keywords: ['国土'] },
  { slug: 'nc-population', title: '测试内容—人口与民族', category: 'national-conditions', subcategory: 'population', order: 1, frequency: '中频', keywords: ['人口'] },
  { slug: 'nc-admin-division', title: '测试内容—行政区划与国家机构', category: 'national-conditions', subcategory: 'state', order: 1, frequency: '中频', keywords: ['行政'] },
  { slug: 'nc-foreign', title: '测试内容—外交与国际事务', category: 'national-conditions', subcategory: 'foreign', order: 1, frequency: '中频', keywords: ['外交'] },
];

export function getArticleSlugsByCategory(categoryId: string): string[] {
  return allArticles.filter(a => a.category === categoryId).map(a => a.slug);
}

export function getArticlesByCategory(categoryId: string): KnowledgeArticle[] {
  return allArticles.filter(a => a.category === categoryId);
}

export function getAllCategories(): string[] {
  return [...new Set(allArticles.map(a => a.category))];
}
