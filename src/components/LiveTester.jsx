import { useState } from 'react';
import { getSample, testRequest } from '../api/client.js';
import { showWs } from '../lib/format.js';

function Verdict({ result }) {
  if (result.deployedCount === 0 && !result.waf) {
    return (
      <div className="verdict allow">
        <div className="big">ALLOW</div>
        <div className="k" style={{ marginTop: 4 }}>배포된 룰이 없어 모든 요청이 통과합니다. 먼저 세대를 실행하세요.</div>
      </div>
    );
  }
  const viaWaf = result.waf && !result.waf.error;
  const blocked = viaWaf ? result.waf.blocked : result.local.blocked;
  return (
    <div className={`verdict ${blocked ? 'block' : 'allow'}`}>
      <div className="big">{blocked ? 'BLOCK · 403' : `ALLOW · ${viaWaf ? result.waf.status : 200}`}</div>
      <div className="row" style={{ marginTop: 6 }}>
        <span className="k">검사 위치</span> {viaWaf ? '실제 WAF (Nginx + ModSecurity)' : '플랫폼의 로컬 룰 검사'}
      </div>
      {result.waf?.error && <div className="row"><span className="k">WAF 호출 실패</span> {result.waf.error}</div>}
      {result.local.blocked && (
        <div className="row"><span className="k">탐지 룰</span> {result.local.ruleId} <code className="mono">{result.local.pattern}</code></div>
      )}
      {viaWaf && result.local.blocked !== result.waf.blocked && (
        <div className="row lv-warn">로컬 룰 검사와 WAF 결과가 다릅니다 (정규식 엔진 차이 가능성)</div>
      )}
    </div>
  );
}

export default function LiveTester() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const check = async (req) => {
    setError('');
    try { setResult(await testRequest(req)); } catch (e) { setError(e.message); }
  };
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) { setError('검사할 요청을 입력하세요.'); return; }
    check(text.trim());
  };
  const sample = async (kind) => {
    setError('');
    try {
      const { request } = await getSample(kind);
      setText(request);
      await check(request);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="card tester-card">
      <h2>실시간 요청 테스트</h2>
      <p className="card-sub">현재 배포된 룰셋으로 요청을 검사합니다.<br />백엔드에 WAF_URL이 설정돼 있으면 실제 WAF로도 전송합니다.</p>
      <form className="tester" onSubmit={submit}>
        <input value={text} onChange={(e) => { setText(e.target.value); setError(''); }} placeholder="/search?q=..." aria-label="검사할 요청" autoComplete="off" />
        <button className="primary" type="submit">검사</button>
      </form>
      <div className="err" role="alert">{error}</div>
      <div className="samples">
        <button type="button" onClick={() => sample('normal')}>정상 요청</button>
        <button type="button" onClick={() => sample('attack')}>원본 공격</button>
        <button type="button" onClick={() => sample('mutated')}>AI 변형 공격</button>
      </div>
      <div className={`verdict-area${result ? '' : ' empty'}`}>
        {result ? (
          <>
            <code className="mono req">{showWs(result.request)}</code>
            <Verdict result={result} />
          </>
        ) : (
          <span>요청을 입력하거나 샘플 버튼을 누르세요.</span>
        )}
      </div>
    </div>
  );
}
