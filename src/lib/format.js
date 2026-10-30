export const TYPES = { sqli: 'SQLi', xss: 'XSS', path: 'Path', cmd: 'CMDi' };
export const TYPE_NAMES = {
  sqli: 'SQL Injection',
  xss: 'Cross-Site Scripting',
  path: 'Path Traversal',
  cmd: 'Command Injection',
};

export const FLAG_LABEL = { i: '대소문자', url: 'URL디코딩', url2: '이중디코딩', cmt: '주석제거', ws: '공백정리' };
export const TECH_LABEL = { cmt: '주석 삽입', ws: '공백 치환', case: '대소문자 혼합', url: 'URL 인코딩', url2: '이중 인코딩' };
export const TIER_LABEL = { literal: '원문 복사형', good: '구조 일반화형', broad: '과일반화형', ai: 'AI 생성' };

export const STATUS_VIEW = {
  pending: ['r-pending', '검증 중'],
  ok: ['r-ok', '생존'],
  deploy: ['r-deploy', '배포'],
  fp: ['r-fp', '탈락 · 오탐'],
  det: ['r-det', '탈락 · 탐지 부족'],
  byp: ['r-byp', '탈락 · 우회됨'],
};

export const pct = (x) => (x * 100).toFixed(x > 0 && x < 0.1 ? 1 : 0) + '%';

/** 탭 문자는 눈에 보이게 표시 */
export const showWs = (s) => String(s).replace(/\t/g, '⇥');
