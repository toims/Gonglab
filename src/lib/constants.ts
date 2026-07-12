// 公基考试学科分类常量
export interface Subcategory {
  name: string;     // 英文ID，数据存储用
  label: string;    // 中文显示名
  chapters: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  weight: '高' | '中' | '低';
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'politics', name: '政治理论', icon: 'Landmark',
    description: '马克思主义哲学、毛泽东思想、中国特色社会主义理论体系、时政方针',
    color: 'blue', weight: '高',
    subcategories: [
      { name: 'marxism', label: '马克思主义哲学', chapters: ['马克思主义哲学概述', '唯物辩证法', '认识论与实践论', '历史唯物主义'] },
      { name: 'mao-zedong', label: '毛泽东思想概论', chapters: ['毛泽东思想概论', '新民主主义革命理论', '社会主义改造理论'] },
      { name: 'socialism', label: '中国特色社会主义理论体系', chapters: ['邓小平理论', '三个代表重要思想', '科学发展观', '新时代中国特色社会主义思想'] },
      { name: 'current-affairs', label: '时政方针', chapters: ['时政热点', '重要会议精神', '国家重大方针政策'] },
    ],
  },
  {
    id: 'law', name: '法律知识', icon: 'Scale',
    description: '宪法、民法、刑法、行政法、经济法、诉讼法',
    color: 'teal', weight: '高',
    subcategories: [
      { name: 'constitution', label: '宪法', chapters: ['宪法的基本理论', '国家制度', '公民的基本权利和义务', '国家机构'] },
      { name: 'civil-law', label: '民法', chapters: ['民法总则', '物权', '合同', '侵权责任', '婚姻家庭与继承'] },
      { name: 'criminal-law', label: '刑法', chapters: ['犯罪构成', '刑罚', '常见罪名', '刑法修正案'] },
      { name: 'admin-law', label: '行政法', chapters: ['行政行为', '行政处罚', '行政许可', '行政复议与诉讼'] },
      { name: 'procedure-law', label: '诉讼法', chapters: ['民事诉讼法', '刑事诉讼法', '行政诉讼法'] },
      { name: 'economic-law', label: '经济法与社会法', chapters: ['劳动法与劳动合同法', '消费者权益保护法', '反不正当竞争法', '公司法'] },
    ],
  },
  {
    id: 'economics', name: '经济常识', icon: 'TrendingUp',
    description: '微观经济、宏观经济、财政税收、货币银行',
    color: 'amber', weight: '中',
    subcategories: [
      { name: 'micro', label: '微观经济', chapters: ['需求与供给', '市场结构', '市场失灵与政府干预'] },
      { name: 'macro', label: '宏观经济', chapters: ['国民收入核算', '失业与通货膨胀', '财政政策与货币政策', '经济增长与发展'] },
      { name: 'political-econ', label: '政治经济学', chapters: ['商品经济与价值规律', '剩余价值理论', '资本积累与循环'] },
      { name: 'fiscal', label: '财政与税收', chapters: ['财政收支', '税收制度', '政府预算'] },
      { name: 'money-bank', label: '货币与银行', chapters: ['货币与货币制度', '金融市场', '中央银行与货币政策'] },
    ],
  },
  {
    id: 'document-writing', name: '公文写作', icon: 'FileText',
    description: '公文种类、格式、行文规则、写作规范',
    color: 'purple', weight: '中',
    subcategories: [
      { name: 'types', label: '公文种类', chapters: ['公文概述', '法定公文种类', '常用事务文书'] },
      { name: 'format', label: '公文格式', chapters: ['公文格式要素', '版头规范', '主体规范', '版记规范'] },
      { name: 'rules', label: '行文规则', chapters: ['行文关系', '行文方向', '行文规则'] },
      { name: 'writing', label: '公文写作', chapters: ['命令与决定', '通知与通报', '报告与请示', '批复与函'] },
    ],
  },
  {
    id: 'history', name: '人文历史', icon: 'BookOpen',
    description: '中国古代史、近代史、世界历史、文学常识',
    color: 'green', weight: '中',
    subcategories: [
      { name: 'ancient-1', label: '古代史(先秦至南北朝)', chapters: ['先秦时期', '秦汉帝国', '三国两晋南北朝'] },
      { name: 'ancient-2', label: '古代史(隋唐至明清)', chapters: ['隋唐盛世', '宋元时期', '明清时期'] },
      { name: 'modern', label: '近代史', chapters: ['鸦片战争与半殖民地化', '洋务运动与维新变法', '辛亥革命与民国', '抗日战争与解放战争'] },
      { name: 'world', label: '世界史', chapters: ['古代文明', '中世纪欧洲', '近代革命与工业革命', '世界大战与当代格局'] },
    ],
  },
  {
    id: 'literature', name: '文学常识', icon: 'Pen',
    description: '古代文学、现代文学、外国文学、文化常识',
    color: 'pink', weight: '低',
    subcategories: [
      { name: 'ancient-lit', label: '古代文学', chapters: ['先秦两汉文学', '魏晋南北朝文学', '唐宋文学', '元明清文学'] },
      { name: 'modern-lit', label: '近现代文学', chapters: ['五四文学', '现代文学', '当代文学'] },
      { name: 'foreign-lit', label: '外国文学', chapters: ['欧洲文学', '美洲文学', '亚洲文学'] },
      { name: 'culture', label: '文化常识', chapters: ['传统节日', '古代礼仪', '书画艺术', '戏曲文化'] },
    ],
  },
  {
    id: 'science', name: '科技常识', icon: 'Flask',
    description: '科技史、前沿科技、信息技术、理化生基础',
    color: 'coral', weight: '中',
    subcategories: [
      { name: 'sci-history', label: '科技史', chapters: ['中国古代科技成就', '世界科技发展史', '中国现代科技成就'] },
      { name: 'frontier', label: '前沿科技', chapters: ['人工智能', '航天技术', '生物技术', '新能源技术'] },
      { name: 'it', label: '信息技术', chapters: ['计算机基础', '互联网技术', '信息安全'] },
    ],
  },
  {
    id: 'physics-chem-bio', name: '理化生', icon: 'Atom',
    description: '物理、化学、生物基础常识',
    color: 'blue', weight: '低',
    subcategories: [
      { name: 'physics', label: '物理常识', chapters: ['力学基础', '热学与声学', '电磁学', '光学'] },
      { name: 'chemistry', label: '化学常识', chapters: ['物质分类与性质', '化学反应', '有机化学基础', '生活中的化学'] },
      { name: 'biology', label: '生物常识', chapters: ['细胞与遗传', '人体生理', '生态与环境'] },
    ],
  },
  {
    id: 'geography', name: '地理常识', icon: 'Globe',
    description: '自然地理、人文地理、中国地理、世界地理',
    color: 'amber', weight: '低',
    subcategories: [
      { name: 'physical-geo', label: '自然地理', chapters: ['地形地貌', '气候', '水文'] },
      { name: 'human-geo', label: '人文地理', chapters: ['人口与城市', '农业', '工业与交通'] },
      { name: 'china-geo', label: '中国地理', chapters: ['中国地形', '气候特征', '区域地理'] },
      { name: 'world-geo', label: '世界地理', chapters: ['亚洲', '欧洲', '非洲', '美洲', '大洋洲'] },
    ],
  },
  {
    id: 'national-conditions', name: '国情省情', icon: 'MapPin',
    description: '国土资源、人口民族、行政区划、国家机构',
    color: 'green', weight: '中',
    subcategories: [
      { name: 'land', label: '国土与资源', chapters: ['国土概况', '自然资源', '生态环境'] },
      { name: 'population', label: '人口与民族', chapters: ['人口结构', '民族分布', '人口政策'] },
      { name: 'admin', label: '行政区划', chapters: ['行政区划体系', '地方行政层级'] },
      { name: 'state', label: '国家机构', chapters: ['国家制度', '国家机构体系', '政治制度'] },
      { name: 'foreign', label: '外交与国际事务', chapters: ['外交政策', '国际组织', '一带一路'] },
    ],
  },
];

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-600', border: 'border-teal-200', light: 'bg-teal-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
  pink: { bg: 'bg-pink-600', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50' },
  coral: { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
};

export const FREQUENCY_STYLES: Record<string, string> = {
  '高频': 'bg-red-100 text-red-700 border border-red-200',
  '中频': 'bg-amber-100 text-amber-700 border border-amber-200',
  '低频': 'bg-gray-100 text-gray-600 border border-gray-200',
};

export const DIFFICULTY_STYLES: Record<string, string> = {
  '易': 'bg-green-100 text-green-700',
  '中': 'bg-yellow-100 text-yellow-700',
  '难': 'bg-red-100 text-red-700',
};

export function getAllSubcategories(): { categoryId: string; categoryName: string; subcategoryName: string; label: string; chapters: string[] }[] {
  const result: { categoryId: string; categoryName: string; subcategoryName: string; label: string; chapters: string[] }[] = [];
  CATEGORIES.forEach(cat => {
    cat.subcategories.forEach(sub => {
      result.push({ categoryId: cat.id, categoryName: cat.name, subcategoryName: sub.name, label: sub.label, chapters: sub.chapters });
    });
  });
  return result;
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getSubcategoryLabel(categoryId: string, subName: string): string {
  const cat = getCategoryById(categoryId);
  const sub = cat?.subcategories.find(s => s.name === subName);
  return sub?.label || subName;
}
