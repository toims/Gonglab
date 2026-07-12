'use client';

// 浏览器本地存储键名（统一管理，避免散落各处）
export const STORAGE_KEYS = {
  DATA: 'gk-exam-data',
  CUSTOM_QUESTIONS: 'gk-custom-questions',
  CUSTOM_ARTICLES: 'gk-custom-articles',
  BOOKMARKS: 'gk-bookmarks',
  EXAM_LAST_RESULT: 'gk-exam-last-result',
} as const;

// 浏览器本地存储键名
const STORAGE_KEY = 'gk-exam-data';

export interface PracticeRecord {
  done: boolean;
  correct: boolean;
  timestamp: string;
}

export interface ExamRecord {
  examId: string;
  score: number;
  total: number;
  duration: number;
  timestamp: string;
  wrongIds: string[];
}

export interface AppData {
  practiceHistory: Record<string, PracticeRecord>;
  wrongQuestionIds: string[];
  examHistory: ExamRecord[];
  streak: {
    current: number;
    lastStudyDate: string;
  };
}

function getDefaultData(): AppData {
  return {
    practiceHistory: {},
    wrongQuestionIds: [],
    examHistory: [],
    streak: { current: 0, lastStudyDate: '' },
  };
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // 存储空间不足，静默失败
  }
}

// 记录单题结果
export function recordAnswer(questionId: string, correct: boolean): void {
  const data = loadData();
  data.practiceHistory[questionId] = {
    done: true,
    correct,
    timestamp: new Date().toISOString(),
  };

  if (!correct) {
    if (!data.wrongQuestionIds.includes(questionId)) {
      data.wrongQuestionIds.push(questionId);
    }
  } else {
    data.wrongQuestionIds = data.wrongQuestionIds.filter(id => id !== questionId);
  }

  updateStreak(data);
  saveData(data);
}

// 错题重做--答对后移出错题本
export function removeFromWrong(questionId: string): void {
  const data = loadData();
  data.wrongQuestionIds = data.wrongQuestionIds.filter(id => id !== questionId);
  saveData(data);
}

// 获取错题ID列表
export function getWrongQuestionIds(): string[] {
  return loadData().wrongQuestionIds;
}

// 获取某学科的错题数
export function getWrongCountByCategory(categoryId: string, allQuestions: { id: string; category: string }[]): number {
  const wrongIds = new Set(loadData().wrongQuestionIds);
  return allQuestions.filter(q => q.category === categoryId && wrongIds.has(q.id)).length;
}

// 记录模拟考试结果
export function recordExamResult(examId: string, score: number, total: number, duration: number, wrongIds: string[]): void {
  const data = loadData();
  data.examHistory.push({
    examId,
    score,
    total,
    duration,
    timestamp: new Date().toISOString(),
    wrongIds,
  });
  wrongIds.forEach(id => {
    if (!data.wrongQuestionIds.includes(id)) {
      data.wrongQuestionIds.push(id);
    }
  });
  updateStreak(data);
  saveData(data);
}

// 更新连续学习天数
function updateStreak(data: AppData): void {
  const today = new Date().toISOString().split('T')[0];
  if (data.streak.lastStudyDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (data.streak.lastStudyDate === yesterday) {
    data.streak.current += 1;
  } else {
    data.streak.current = 1;
  }
  data.streak.lastStudyDate = today;
}

// 获取学习统计
export function getStudyStats(): { streak: number; totalDone: number; correctRate: number } {
  const data = loadData();
  const records = Object.values(data.practiceHistory);
  const done = records.filter(r => r.done);
  const correct = done.filter(r => r.correct);
  return {
    streak: data.streak.current,
    totalDone: done.length,
    correctRate: done.length > 0 ? Math.round((correct.length / done.length) * 100) : 0,
  };
}

// 导出数据
export function exportData(): string {
  return JSON.stringify(loadData(), null, 2);
}

// 清空所有数据
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
