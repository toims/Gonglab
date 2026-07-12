// 考试引擎逻辑

export interface ExamState {
  examId: string;
  answers: Record<number, number | number[]>;
  startTime: number;
  submitted: boolean;
}

// 判断单个答案是否正确（供全局复用）
export function isAnswerCorrect(
  type: string,
  userAnswer: number | number[] | undefined,
  correctAnswer: number | number[]
): boolean {
  if (userAnswer === undefined) return false;
  if (type === '多选' || type === '不定项') {
    const ua = (Array.isArray(userAnswer) ? userAnswer : [userAnswer]).slice().sort();
    const ca = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]).slice().sort();
    return ua.length === ca.length && ua.every((v, i) => v === ca[i]);
  }
  return userAnswer === correctAnswer;
}

// 计算得分
export function calculateScore(
  answers: Record<number, number | number[]>,
  correctAnswers: (number | number[])[],
  questionTypes: string[]
): { score: number; total: number; wrongIndices: number[] } {
  let score = 0;
  const wrongIndices: number[] = [];
  
  for (let i = 0; i < correctAnswers.length; i++) {
    if (isAnswerCorrect(questionTypes[i], answers[i], correctAnswers[i])) {
      score++;
    } else {
      wrongIndices.push(i);
    }
  }
  
  return { score, total: correctAnswers.length, wrongIndices };
}

// 格式化时间 mm:ss
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// 获取剩余时间（秒）
export function getRemainingTime(startTime: number, durationMinutes: number): number {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const total = durationMinutes * 60;
  return Math.max(0, total - elapsed);
}
