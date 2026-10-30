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

// mock 모드는 0세대(룰 없음)에서 시작해 실행할 때마다 1세대씩 쌓인다.
// report.json은 세대가 끝났을 때 채워 넣을 후보·배포 룰 등의 예시 데이터로 쓴다
const MOCK_INITIAL = {
  ...mockReport,
  gen: 0,
  busy: false,
  activeStage: null,
  stages: [],
  converged: false,
  kpis: { ...mockReport.kpis, deployed: 0, detect: 0, bypass: 1, fp: 0, techniques: 0, corpus: 0 },
  candidates: [],
  deployed: [],
  history: [{ gen: 0, detect: 0, bypass: 1, fp: 0 }],
  corpus: { attacks: [], learned: 0 },
  logs: [],
};
let mockState = MOCK_INITIAL;
let mockListener = null;
let mockPaused = false;
let mockResume = null;
const emitMock = (patch) => {
  mockState = { ...mockState, ...patch };
  mockListener?.(mockState);
  return mockState;
};
async function runMock(stageDelayMs = 600) {
  for (let i = 0; i < mockReport.stages.length; i++) {
    emitMock({ busy: true, activeStage: i, stages: mockReport.stages.slice(0, i) });
    await new Promise((r) => setTimeout(r, stageDelayMs));
    if (mockPaused) await new Promise((r) => (mockResume = r)); // 일시정지 중이면 다음 단계로 넘어가지 않는다
  }
  // 한 사이클이 끝나면 다음 세대를 기록한다 (우회 성공률이 조금씩 줄어드는 흉내)
  const { gen, history, kpis, logs } = mockState;
  const last = history[history.length - 1];
  const bypass = Math.round(last.bypass * 0.6 * 100) / 100;
  const next = { gen: gen + 1, detect: 1 - bypass, bypass, fp: 0 };
  return emitMock({
    busy: false,
    activeStage: null,
    stages: mockReport.stages,
    gen: next.gen,
    converged: bypass < 0.05,
    history: [...history, next],
    kpis: { ...mockReport.kpis, detect: next.detect, bypass, fp: 0 },
    candidates: mockReport.candidates.map((r) => ({ ...r, gen: next.gen })),
    deployed: gen === 0 ? mockReport.deployed.map((r) => ({ ...r, gen: next.gen })) : mockState.deployed,
    corpus: mockReport.corpus,
    logs: [{ gen: next.gen, level: 'ok', msg: `세대 ${next.gen} 완료 (우회 ${Math.round(bypass * 100)}%)`, t: Date.now() }, ...logs],
  });
}

/**
 * 진행 중인 세대를 단계 사이에서 멈춘다. 백엔드에는 멈춤 API가 없어 mock 모드에서만 동작하며,
 * 멈추지 못하면 false를 돌려준다 (이때는 진행 중인 세대가 끝난 뒤 멈추게 된다)
 */
export function pauseRun() {
  if (!USE_MOCK) return false;
  mockPaused = true;
  emitMock({ paused: true });
  return true;
}

export function resumeRun() {
  if (!USE_MOCK) return;
  mockPaused = false;
  emitMock({ paused: false });
  mockResume?.();
  mockResume = null;
}

export const getReport = () => (USE_MOCK ? Promise.resolve(mockState) : request('/report'));

/** 1세대 실행. 백엔드 /api/run 기본값이 3세대라 generations: 1을 명시한다. opts: { fpMax, bypMax, intensity, stageDelayMs } */
export const runGeneration = (opts) =>
    USE_MOCK ? runMock(opts.stageDelayMs)
        : request('/run', { method: 'POST', body: JSON.stringify({ generations: 1, ...opts }) });

export const resetAll = () => (USE_MOCK ? Promise.resolve(emitMock(MOCK_INITIAL)) : request('/reset', { method: 'POST' }));

/** mock 모드: 지금 배포된 룰의 정규식으로 직접 검사한다 */
function testMock(req) {
  let decoded = req;
  try { decoded = decodeURIComponent(req); } catch { /* 잘못된 인코딩은 원문 그대로 검사 */ }
  const hit = mockState.deployed.find((r) => {
    try { return new RegExp(r.pattern, 'i').test(decoded); } catch { return false; }
  });
  const local = hit ? { blocked: true, ruleId: hit.id, type: hit.type, pattern: hit.pattern } : { blocked: false };
  return { request: req, deployedCount: mockState.deployed.length, local };
}

export const testRequest = (req) =>
    USE_MOCK ? Promise.resolve(testMock(req))
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
    mockListener = onReport;
    onReport(mockState);
    onStatus(true);
    return () => { mockListener = null; };
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
