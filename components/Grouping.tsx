import React, { useEffect, useMemo, useState } from 'react';
import { api, ApiMember } from '../services/api';
import { buildGroups, buildHistoryPairs, GroupingMode, GroupingResult } from '../services/grouping';

const MODES: { key: GroupingMode; label: string; desc: string }[] = [
  { key: 'average', label: '평균 균형', desc: '조별 평균 핸디캡 균등' },
  { key: 'sum', label: '합계 균형', desc: '조별 핸디캡 합계 균등 (팀전)' },
  { key: 'abcd', label: 'ABCD 추첨', desc: '4등급으로 나눠 등급별 추첨' },
  { key: 'fresh', label: '새 얼굴 우선', desc: '지난번 같은 조였던 조합 회피' },
  { key: 'random', label: '무작위', desc: '완전 랜덤 추첨' },
];
const DRAW_MODES: GroupingMode[] = ['abcd', 'fresh', 'random'];

type PairKind = 'together' | 'apart';

const Grouping: React.FC = () => {
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [mode, setMode] = useState<GroupingMode>('average');
  const [genderMix, setGenderMix] = useState(false);
  const [together, setTogether] = useState<[number, number][]>([]);
  const [apart, setApart] = useState<[number, number][]>([]);
  const [picking, setPicking] = useState<{ kind: PairKind; first: number | null } | null>(null);
  const [historyPairs, setHistoryPairs] = useState<Map<string, number>>(new Map());
  const [historyInfo, setHistoryInfo] = useState<{ rounds: number; schedules: number } | null>(null);
  const [result, setResult] = useState<GroupingResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMembers()
      .then((ms) => {
        setMembers(ms);
        setSelectedIds(ms.map((m) => m.id));
      })
      .catch((e: any) => setError(e?.message || '회원 목록을 불러오지 못했습니다.'));
    // History for 새 얼굴 우선: recorded rounds + saved schedules.
    Promise.all([api.getRounds().catch(() => []), api.getSchedules().catch(() => [])])
      .then(([rounds, schedules]) => {
        setHistoryPairs(buildHistoryPairs(rounds as any, schedules as any));
        setHistoryInfo({ rounds: (rounds as any[]).length, schedules: (schedules as any[]).length });
      })
      .catch(() => undefined);
  }, []);

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const nameOf = (id: number) => memberById.get(id)?.name ?? `#${id}`;

  const toggleMember = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const groupCount = useMemo(() => Math.max(1, Math.ceil(selectedIds.length / 4)), [selectedIds]);

  const runGrouping = () => {
    const selected = members.filter((m) => selectedIds.includes(m.id));
    if (selected.length < 2) return;
    const inSelected = (p: [number, number]) => selectedIds.includes(p[0]) && selectedIds.includes(p[1]);
    setResult(
      buildGroups(selected, {
        mode,
        genderMix,
        together: together.filter(inSelected),
        apart: apart.filter(inSelected),
        historyPairs,
      }),
    );
  };

  // --- pair picking (동반/분리) ---
  const startPicking = (kind: PairKind) => setPicking({ kind, first: null });
  const pickMember = (id: number) => {
    if (!picking) return;
    if (picking.first === null) {
      setPicking({ ...picking, first: id });
      return;
    }
    if (picking.first === id) {
      setPicking({ ...picking, first: null });
      return;
    }
    const pair: [number, number] = [picking.first, id];
    const setter = picking.kind === 'together' ? setTogether : setApart;
    setter((prev) => {
      const exists = prev.some(([a, b]) => (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]));
      return exists ? prev : [...prev, pair];
    });
    setPicking(null);
  };
  const removePair = (kind: PairKind, idx: number) =>
    (kind === 'together' ? setTogether : setApart)((prev) => prev.filter((_, i) => i !== idx));

  const pairSection = (kind: PairKind, title: string, hint: string, pairs: [number, number][]) => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-bold text-gray-300">{title}</p>
        <button
          onClick={() => (picking?.kind === kind ? setPicking(null) : startPicking(kind))}
          className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg ${picking?.kind === kind ? 'bg-primary text-black' : 'bg-white/5 text-primary border border-primary/30'}`}
        >
          {picking?.kind === kind ? '취소' : '+ 두 명 지정'}
        </button>
      </div>
      <p className="text-[10px] text-gray-500 mb-2">{hint}</p>
      {pairs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {pairs.map(([a, b], i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-full">
              {nameOf(a)} · {nameOf(b)}
              <button onClick={() => removePair(kind, i)} className="text-gray-400 font-bold px-0.5">×</button>
            </span>
          ))}
        </div>
      )}
      {picking?.kind === kind && (
        <div className="bg-background/60 border border-primary/20 rounded-xl p-3">
          <p className="text-[11px] text-primary font-bold mb-2">
            {picking.first === null ? '첫 번째 회원을 선택하세요' : `${nameOf(picking.first)}와(과) 함께할 두 번째 회원을 선택하세요`}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => pickMember(m.id)}
                className={`text-[11px] px-2.5 py-1.5 rounded-full border ${picking.first === m.id ? 'bg-primary text-black border-primary font-bold' : 'bg-white/5 border-white/10 text-gray-300'}`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 pb-20">
      <header className="flex justify-between items-center mb-6 pt-4">
        <h1 className="text-xl font-bold">조편성</h1>
      </header>

      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {/* 편성 방식 */}
      <p className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-wider">편성 방식</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`py-2.5 px-2 rounded-xl border text-left transition-all ${mode === m.key ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}
          >
            <p className={`text-xs font-bold ${mode === m.key ? 'text-primary' : 'text-gray-300'}`}>{m.label}</p>
            <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{m.desc}</p>
          </button>
        ))}
      </div>
      {mode === 'fresh' && (
        <p className="text-[11px] text-gray-400 bg-surface rounded-xl px-3 py-2.5 mb-3 border border-white/5">
          {historyInfo
            ? historyPairs.size > 0
              ? `지난 라운드 ${historyInfo.rounds}건 · 저장된 일정 ${historyInfo.schedules}건을 참고해, 전에 같은 조였던 조합을 최대한 피합니다.`
              : '참고할 지난 기록이 아직 없어 핸디캡 균형 위주로 편성됩니다. 일정·라운드 기록이 쌓일수록 효과가 커집니다.'
            : '지난 기록을 불러오는 중입니다.'}
        </p>
      )}

      {/* 옵션 */}
      <div className="bg-surface rounded-2xl p-5 mb-8 border border-white/5">
        <h3 className="font-bold flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary">tune</span> 편성 옵션
        </h3>
        <div className="flex justify-between items-center py-3 border-b border-white/5">
          <div>
            <p className="text-sm font-bold text-gray-200">성별 섞기</p>
            <p className="text-[10px] text-gray-500">조마다 남녀 비율을 고르게</p>
          </div>
          <button
            onClick={() => setGenderMix((v) => !v)}
            className={`w-11 h-6 rounded-full relative transition-all ${genderMix ? 'bg-primary' : 'bg-white/10'}`}
            aria-label="성별 섞기"
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${genderMix ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
        {pairSection('together', '동반 지정 (꼭 같은 조)', '지정한 두 명은 반드시 같은 조에 들어갑니다. 세 명 이상은 쌍을 겹쳐 지정하세요.', together)}
        <div className="border-t border-white/5 mt-4 pt-1">
          {pairSection('apart', '분리 지정 (절대 다른 조)', '지정한 두 명은 같은 조가 되지 않습니다. (부부·같은 회사 등)', apart)}
        </div>
      </div>

      {/* 참석 회원 */}
      <div className="flex justify-between items-center mb-4 px-1">
        <p className="text-xs text-gray-400 font-bold">참석 가능 회원</p>
        <button onClick={() => setSelectedIds(members.map((m) => m.id))} className="text-xs font-bold text-primary">모두 선택</button>
      </div>
      <div className="space-y-3 mb-10">
        {members.map((member) => (
          <div key={member.id} onClick={() => toggleMember(member.id)} className="flex items-center gap-4 bg-surface p-3 rounded-2xl border border-white/5 shadow-sm cursor-pointer hover:bg-surface-light transition-all">
            <div className="relative">
              <img src={`https://picsum.photos/seed/golf${member.id}/200`} alt="" className="w-12 h-12 rounded-full" />
              <div className="absolute -bottom-1 -right-1 px-1.5 bg-gray-800 border border-white/10 rounded-full text-[8px] font-bold">Hcp {member.handicap}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{member.name}</h4>
              <p className="text-[10px] text-gray-500">{member.type} · {member.gender === 'female' ? '여자' : '남자'}</p>
            </div>
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selectedIds.includes(member.id) ? 'bg-primary border-primary' : 'border-white/10'}`}>
              {selectedIds.includes(member.id) && <span className="material-symbols-outlined text-black text-sm font-bold">check</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 결과 */}
      {result && (
        <div className="bg-surface rounded-2xl p-4 border border-primary/20 mb-8">
          <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm filled">auto_awesome</span> 자동 편성 결과
          </h3>
          <div className="space-y-4">
            {result.groups.map((g, i) => (
              <div key={i} className="bg-background/50 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">{g.groupName} · {g.players.length}명</span>
                  <span className="text-[10px] text-primary">{mode === 'sum' ? '합계' : '평균'}: {g.metricValue.toFixed(1)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.players.map((p) => (
                    <span key={p.id} className="text-[10px] bg-white/5 px-2 py-1 rounded-md">{p.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-3 italic">"{result.reasoning}"</p>
          {mode === 'fresh' && historyPairs.size > 0 && (
            <p className="text-[10px] text-gray-400 mt-1.5">이전에 같은 조였던 쌍: {result.repeatPairs}개</p>
          )}
          {result.apartViolations > 0 && (
            <p className="text-[10px] text-red-400 mt-1.5">분리 지정 {result.apartViolations}건을 지키지 못했습니다. 지정이 서로 겹치는지 확인해 주세요.</p>
          )}
          {DRAW_MODES.includes(mode) && (
            <button onClick={runGrouping} className="w-full mt-4 h-11 rounded-xl border border-primary/40 text-primary font-bold text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">casino</span> 다시 뽑기
            </button>
          )}
        </div>
      )}

      <div className="fixed bottom-24 left-0 w-full px-4 flex flex-col gap-2 max-w-md mx-auto">
        <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
          <span>{selectedIds.length}명 선택됨 ({groupCount}개 조)</span>
          <button onClick={() => setSelectedIds([])} className="underline">초기화</button>
        </div>
        <button
          onClick={runGrouping}
          disabled={selectedIds.length < 2}
          className="w-full h-14 bg-primary text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
        >
          <span className="material-symbols-outlined filled">autorenew</span>
          자동 편성 하기
        </button>
      </div>
    </div>
  );
};

export default Grouping;
