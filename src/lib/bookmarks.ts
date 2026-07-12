'use client';
import { STORAGE_KEYS } from './storage';

// 获取所有已标记的文章 slug
export function loadBookmarkSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]');
  } catch {
    return [];
  }
}

// 检查某个 slug 是否已标记
export function isBookmarked(slug: string): boolean {
  return loadBookmarkSlugs().includes(slug);
}

// 切换标记状态，返回新状态（true = 已标记）
export function toggleBookmark(slug: string): boolean {
  const list = loadBookmarkSlugs();
  const idx = list.indexOf(slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveBookmarks(list);
    return false;
  } else {
    list.push(slug);
    saveBookmarks(list);
    return true;
  }
}

function saveBookmarks(slugs: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(slugs));
  } catch {
    // storage full, silent fail
  }
}
