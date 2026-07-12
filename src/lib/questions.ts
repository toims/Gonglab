// 题目类型定义
export interface Question {
  id: string;
  type: '单选' | '多选' | '不定项' | '判断';
  category: string;
  subcategory: string;
  question: string;
  options: string[];
  answer: number | number[];
  explanation: string;
  difficulty: '易' | '中' | '难';
  frequency: '高频' | '中频' | '低频';
}

// 模拟试卷类型定义
export interface MockExam {
  id: string;
  title: string;
  description: string;
  duration: number;
  questionIds: string[];
  category: string;
}

import { STORAGE_KEYS } from './storage';

// 题库缓存（构建时加载）
let questionsCache: Question[] | null = null;

// 加载所有题目
export async function loadAllQuestions(): Promise<Question[]> {
  if (questionsCache) return questionsCache;
  // 动态加载所有题库 JSON
  const categories = ['politics', 'law', 'economics', 'document-writing', 'history', 'literature', 'science', 'physics-chem-bio', 'geography', 'national-conditions'];
  const allQuestions: Question[] = [];
  
  for (const cat of categories) {
    try {
      const mod = await import(`@/../data/questions/${cat}.json`);
      allQuestions.push(...(mod.default || mod));
    } catch {
      // 题库文件可能还不存在，跳过
    }
  }

  // 加载自定义题目（从 localStorage 导入的）
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      if (raw) {
        allQuestions.push(...(JSON.parse(raw) as Question[]));
      }
    } catch {}
  }
  
  questionsCache = allQuestions;
  return allQuestions;
}

// 清除题目缓存（自定义题目变更后需要刷新）
export function clearQuestionsCache(): void {
  questionsCache = null;
}

// 按学科筛选题目
export function filterByCategory(questions: Question[], categoryId: string): Question[] {
  return questions.filter(q => q.category === categoryId);
}

// 按章节筛选题目
export function filterBySubcategory(questions: Question[], subcategoryName: string): Question[] {
  return questions.filter(q => q.subcategory === subcategoryName);
}

// 按ID列表筛选
export function filterByIds(questions: Question[], ids: string[]): Question[] {
  const idSet = new Set(ids);
  return questions.filter(q => idSet.has(q.id));
}

// 随机排列题目（Fisher-Yates 洗牌）
export function shuffleQuestions(questions: Question[]): Question[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 加载单个试卷（内置 JSON 或 localStorage 自定义）
export async function loadExam(examId: string): Promise<MockExam | null> {
  // 先检查内置试卷
  try {
    const mod = await import(`@/../data/exams/${examId}.json`);
    return mod.default || mod;
  } catch { /* not found, try custom */ }

  // 再查自定义试卷
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('gk-custom-exams');
      if (raw) {
        const exams = JSON.parse(raw) as MockExam[];
        return exams.find((e) => e.id === examId) || null;
      }
    } catch { /* skip */ }
  }

  return null;
}

// 加载所有模拟试卷列表（内置 + 自定义）
export async function loadAllExams(): Promise<MockExam[]> {
  const exams: MockExam[] = [];
  
  // 预定义的试卷
  const examIds = ['exam-001', 'exam-002'];
  for (const id of examIds) {
    try {
      const mod = await import(`@/../data/exams/${id}.json`);
      exams.push(mod.default || mod);
    } catch { /* skip */ }
  }

  // 自定义试卷（localStorage）
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('gk-custom-exams');
      if (raw) {
        exams.push(...(JSON.parse(raw) as MockExam[]));
      }
    } catch { /* skip */ }
  }
  
  return exams;
}
