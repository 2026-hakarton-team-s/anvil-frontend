import { useEffect, useState } from 'react';

const KEY = 'anvil-theme';

const saved = () => {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
};

/** 라이트/다크 테마. <html data-theme>에 반영하고 브라우저에 기억해 둔다 */
export function useTheme() {
  const [theme, setTheme] = useState(saved);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(KEY, theme); } catch { /* 저장소를 못 쓰면 이번 방문 동안만 유지 */ }
  }, [theme]);
  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
