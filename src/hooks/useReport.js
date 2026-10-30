import { useEffect, useState } from 'react';
import { subscribe } from '../api/client.js';

/** 서버의 최신 report와 연결 상태를 돌려준다 */
export function useReport() {
  const [report, setReport] = useState(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => subscribe(setReport, setConnected), []);
  return { report, connected };
}
