#!/usr/bin/env node
/**
 * 公基题库 AI 批量生成器
 * ------------------------------------------------------------
 * 读取 src/lib/constants.ts 中的「学科 → 章节 → 知识点」结构，
 * 调用 OpenAI 兼容的 LLM 接口，为每一个章节批量生成题目，
 * 并合并写入 data/questions/<category>.json（自动去重、续编号）。
 *
 * 支持任意 OpenAI 兼容端点：
 *   - OpenAI:        OPENAI_BASE_URL=https://api.openai.com/v1
 *   - DeepSeek:      OPENAI_BASE_URL=https://api.deepseek.com/v1   MODEL=deepseek-chat
 *   - 阿里通义:      OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1  MODEL=qwen-plus
 *
 * 用法：
 *   node scripts/gen-questions.mjs                 # 生成全部章节
 *   node scripts/gen-questions.mjs --cat law       # 只生成法律知识
 *   node scripts/gen-questions.mjs --per 15        # 每章 15 题
 *   node scripts/gen-questions.mjs --parse-only    # 仅打印章节结构，不调用接口
 *
 * 环境变量：
 *   OPENAI_API_KEY   (必填) API 密钥
 *   OPENAI_BASE_URL  (选填) 默认 https://api.openai.com/v1
 *   MODEL            (选填) 默认 gpt-4o-mini
 *   PER_CHAPTER      (选填) 每章题数，默认 10
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONSTANTS_PATH = path.join(ROOT, 'src/lib/constants.ts');
const QUESTIONS_DIR = path.join(ROOT, 'data/questions');

// ---------- 参数解析 ----------
const argv = process.argv.slice(2);
const PARSE_ONLY = argv.includes('--parse-only');
const filterCat = (() => { const i = argv.indexOf('--cat'); return i >= 0 ? argv[i + 1] : null; })();
const perArgIndex = argv.indexOf('--per');
const PER_CHAPTER = perArgIndex >= 0 ? parseInt(argv[perArgIndex + 1], 10) : (parseInt(process.env.PER_CHAPTER, 10) || 10);

const API_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.MODEL || 'gpt-4o-mini';

// ---------- 1. 解析 constants.ts ----------
function extractChapters(text, startIdx) {
  const open = text.indexOf('[', startIdx);
  let depth = 0;
  let i = open;
  for (; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') { depth--; if (depth === 0) break; }
  }
  const inner = text.slice(open + 1, i);
  return [...inner.matchAll(/'([^']*)'|"([^"]*)"/g)].map((m) => m[1] ?? m[2]);
}

function parseConstants() {
  const src = fs.readFileSync(CONSTANTS_PATH, 'utf8');
  const toc = [];
  let currentCat = null;
  // 学科：id + name + icon；章节：name + label + chapters
  const re = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*icon:|name:\s*'([^']+)',\s*label:\s*'([^']+)',\s*chapters:\s*\[/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[1] !== undefined) {
      currentCat = { id: m[1], name: m[2], subs: [] };
      toc.push(currentCat);
    } else if (currentCat) {
      const chapters = extractChapters(src, m.index);
      currentCat.subs.push({ name: m[3], label: m[4], chapters });
    }
  }
  return toc;
}

// ---------- 2. 读取/合并现有题库 ----------
function readBank(catId) {
  const file = path.join(QUESTIONS_DIR, `${catId}.json`);
  if (!fs.existsSync(file)) return [];
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}

function nextSeq(existing, catId, subName) {
  const prefix = `${catId}-${subName}-`;
  let max = 0;
  for (const q of existing) {
    if (typeof q.id === 'string' && q.id.startsWith(prefix)) {
      const n = parseInt(q.id.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
  }
  return max + 1;
}

// ---------- 3. 调用 LLM ----------
async function callLLM(prompt) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const resp = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: '你是公基（公共基础知识）考试题库生成助手。只输出符合要求的 JSON，不要任何额外说明文字。' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`API ${resp.status}: ${txt.slice(0, 200)}`);
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '';
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(catName, subLabel, chapters, single, multi, judge) {
  const chapterText = chapters.length ? chapters.join('、') : subLabel;
  return `请为「公共基础知识」考试生成题目。
学科：${catName}
章节：${subLabel}
该章节涵盖的知识点：${chapterText}

要求生成 ${single + multi + judge} 道题，类型分布如下：
- 单选题 ${single} 道（options 为 4 个选项，answer 为正确选项的下标，从 0 开始）
- 多选题 ${multi} 道（options 为 4 个选项，answer 为正确选项下标的数组，如 [0,2]）
- 判断题 ${judge} 道（options 固定为 ["正确","错误"]，answer 为 0 表示正确、1 表示错误）

每道题必须包含字段：type（"单选"/"多选"/"判断"）、question（题干）、options（字符串数组）、answer（单选/判断为数字，多选为数字数组）、explanation（解析，1-3 句）、difficulty（"易"/"中"/"难"）、frequency（"高频"/"中频"/"低频"）。

要求：
1. 题目符合公基考试风格，表述严谨、无歧义；
2. 解析准确、能说明考点；
3. 题目围绕上面给出的知识点，避免重复；
4. 只返回一个 JSON 对象，格式为 {"questions":[...]}，不要 Markdown 代码块，不要多余文字。`;
}

// ---------- 4. 校验单题 ----------
const TYPES = new Set(['单选', '多选', '判断']);
function validate(q, catId, subName) {
  if (!q || !TYPES.has(q.type)) return null;
  if (typeof q.question !== 'string' || !q.question.trim()) return null;
  if (!Array.isArray(q.options) || q.options.length < 2) return null;
  if (q.type === '多选') {
    if (!Array.isArray(q.answer) || q.answer.length < 1) return null;
    if (!q.answer.every((i) => Number.isInteger(i) && i >= 0 && i < q.options.length)) return null;
  } else {
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) return null;
  }
  if (typeof q.explanation !== 'string' || !q.explanation.trim()) q.explanation = '（暂无解析）';
  if (!['易', '中', '难'].includes(q.difficulty)) q.difficulty = '中';
  if (!['高频', '中频', '低频'].includes(q.frequency)) q.frequency = '中频';
  q.category = catId;
  q.subcategory = subName;
  return q;
}

// ---------- 主流程 ----------
async function main() {
  const toc = parseConstants();
  if (PARSE_ONLY) {
    console.log('解析到的学科/章节结构：');
    for (const c of toc) {
      console.log(`\n【${c.name} (${c.id})】`);
      for (const s of c.subs) {
        console.log(`  - ${s.label} (${s.name})  知识点 ${s.chapters.length} 个`);
      }
    }
    console.log(`\n共 ${toc.length} 个学科，${toc.reduce((n, c) => n + c.subs.length, 0)} 个章节。`);
    return;
  }

  if (!API_KEY) {
    console.error('❌ 缺少 OPENAI_API_KEY 环境变量。\n用法示例：');
    console.error('  OPENAI_API_KEY=sk-xxx OPENAI_BASE_URL=https://api.deepseek.com/v1 MODEL=deepseek-chat node scripts/gen-questions.mjs');
    process.exit(1);
  }

  if (!fs.existsSync(QUESTIONS_DIR)) fs.mkdirSync(QUESTIONS_DIR, { recursive: true });

  let totalNew = 0;
  for (const cat of toc) {
    if (filterCat && cat.id !== filterCat) continue;
    let bank = readBank(cat.id);
    for (const sub of cat.subs) {
      const single = Math.max(1, Math.round(PER_CHAPTER * 0.7));
      const multi = Math.max(1, Math.round(PER_CHAPTER * 0.2));
      const judge = Math.max(1, PER_CHAPTER - single - multi);
      const prompt = buildPrompt(cat.name, sub.label, sub.chapters, single, multi, judge);

      let questions = [];
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const raw = await callLLM(prompt);
          const parsed = JSON.parse(raw.replace(/^[\s\S]*?\{/, '{').replace(/\}[\s\S]*$/, '}'));
          questions = parsed.questions || [];
          break;
        } catch (e) {
          console.warn(`  ⚠️ ${cat.name}/${sub.label} 第${attempt}次生成失败：${e.message}`);
          if (attempt === 2) continue;
        }
      }
      if (!questions.length) { console.warn(`  ⏭️ ${cat.name}/${sub.label} 跳过（无有效题目）`); continue; }

      let seq = nextSeq(bank, cat.id, sub.name);
      let added = 0;
      for (const q of questions) {
        const valid = validate(q, cat.id, sub.name);
        if (!valid) continue;
        valid.id = `${cat.id}-${sub.name}-${String(seq).padStart(3, '0')}`;
        bank.push(valid);
        seq++;
        added++;
      }
      totalNew += added;
      console.log(`  ✅ ${cat.name}/${sub.label}: 新增 ${added} 题（本学科累计 ${bank.length}）`);
      // 每章写完即落盘，避免中断丢数据
      fs.writeFileSync(path.join(QUESTIONS_DIR, `${cat.id}.json`), JSON.stringify(bank, null, 2), 'utf8');
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  console.log(`\n🎉 完成！本次共新增 ${totalNew} 道题。`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });
