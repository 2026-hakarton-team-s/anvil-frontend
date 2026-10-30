import mockReport from '../mock/report.json';

// VITE_USE_MOCK=true 이면 백엔드 없이 src/mock/report.json 으로 화면을 그린다
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `요청 실패 (${res.status})`);
  return data;
}

export const getReport = () => (USE_MOCK ? Promise.resolve(mockReport) : request('/report'));

/** 1세대 실행. opts: { fpMax, bypMax, intensity, stageDelayMs } */
export const runGeneration = (opts) =>
  USE_MOCK ? Promise.resolve(mockReport) : request('/run', { method: 'POST', body: JSON.stringify(opts) });

export const resetAll = () => (USE_MOCK ? Promise.resolve(mockReport) : request('/reset', { method: 'POST' }));

export const testRequest = (req) =>
  USE_MOCK
    ? Promise.resolve({ request: req, deployedCount: 1, local: { blocked: /union|script|\.\./i.test(req), ruleId: 'R017', type: 'sqli', pattern: '(mock)' } })
    : request('/test', { method: 'POST', body: JSON.stringify({ request: req }) });

/** kind: normal | attack | mutated */
export const getSample = (kind) =>
  USE_MOCK
    ? Promise.resolve({ request: kind === 'normal' ? '/search?q=cat food' : "/item?id=1' OR 1=1--" })
    : request(`/samples?kind=${kind}`);

/**
 * 서버가 보내는 SSE(report 이벤트)를 구독한다. 연결이 끊기면 3초마다 폴링으로 대체한다.
 * 반환값은 구독 해제 함수.
 */
export function subscribe(onReport, onStatus) {
  if (USE_MOCK) {
    onReport(mockReport);
    onStatus(true);
    return () => {};
  }
  let timer = null;
  const poll = () => getReport().then((r) => { onReport(r); onStatus(true); }).catch(() => onStatus(false));
  const es = new EventSource('/api/events');
  es.addEventListener('report', (e) => { onReport(JSON.parse(e.data)); onStatus(true); });
  es.onopen = () => {
    onStatus(true);
    if (timer) { clearInterval(timer); timer = null; }
  };
  es.onerror = () => {
    onStatus(false);
    if (!timer) timer = setInterval(poll, 3000);
  };
  return () => { es.close(); if (timer) clearInterval(timer); };
}
