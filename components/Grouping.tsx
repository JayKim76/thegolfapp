import React, { useEffect, useMemo, useState } from 'react';
import { api, ApiMember } from '../services/api';

type Mode = 'average' | 'sum' | 'random';

interface GroupResult {
  groups: { groupName: string; players: string[]; metricValue: number }[];
  reasoning: string;
}

// Balanced grouping, computed locally from real member handicaps.
// (Previously this called Gemini from the browser with an exposed key;
// a snake draft reaches the same balance deterministically, for free.)
function buildGroups(selected: ApiMember[], mode: Mode): GroupResult {
  const groupCount = Math.max(1, Math.ceil(selected.length / 4));
  const groups: ApiMember[][] = Array.from({ length: groupCount }, () => []);

  if (mode === 'random') {
    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    shuffled.forEach((m, i) => groups[i % groupCount].push(m));
    return {
      groups: groups.map((g, i) => ({
        groupName: `${i + 1}조`,
        players: g.map((m) => m.name),
        metricValue: g.length ? g.reduce((s, m) => s + m.handicap, 0) / g.length : 0,
      })),
      reasoning: '무작위로 편성했습니다. 실력 균형이 필요하면 핸디캡 균등 모드를 쓰세요.',
    };
  }

  // Snake draft: sort by handicap, then deal 1→N, N→1, ... so each group
  // gets a similar mix of low and high handicaps.
  const sorted = [...selected].sort((a, b) => a.handicap - b.handicap);
  sorted.forEach((m, i) => {
    const round = Math.floor(i / groupCount);
    const pos = i % groupCount;
    const idx = round % 2 === 0 ? pos : groupCount - 1 - pos;
    groups[idx].push(m);
  });

  // Balance pass: the plain snake draft leaves the short groups (when the
  // headcount is not a multiple of 4) without a high-handicap player, so
  // their averages land several strokes low. Swap pairs between groups
  // while any swap narrows the spread of the chosen metric. Deterministic:
  // fixed scan order, first improving swap wins, repeat until stable.
  const metric = (g: ApiMember[]) => {
    const sum = g.reduce((s, m) => s + m.handicap, 0);
    return mode === 'sum' ? sum : g.length ? sum / g.length : 0;
  };
  const spread = () => {
    const vals = groups.map(metric);
    return Math.max(...vals) - Math.min(...vals);
  };
  let best = spread();
  let improved = true;
  let guard = 0;
  while (improved && guard++ < 100) {
    improved = false;
    outer: for (let a = 0; a < groups.length; a++) {
      for (let b = a + 1; b < groups.length; b++) {
        for (let i = 0; i < groups[a].length; i++) {
          for (let j = 0; j < groups[b].length; j++) {
            [groups[a][i], groups[b][j]] = [groups[b][j], groups[a][i]];
            const s = spread();
            if (s < best - 1e-9) {
              best = s;
              improved = true;
              break outer;
            }
            [groups[a][i], groups[b][j]] = [groups[b][j], groups[a][i]];
          }
        }
      }
    }
  }

  return {
    groups: groups.map((g, i) => {
      const sum = g.reduce((s, m) => s + m.handicap, 0);
      return {
        groupName: `${i + 1}조`,
        players: g.map((m) => m.name),
        metricValue: mode === 'sum' ? sum : g.length ? sum / g.length : 0,
      };
    }),
    reasoning:
      mode === 'sum'
        ? '핸디캡 합계가 비슷해지도록 스네이크 방식으로 배정했습니다.'
        : '평균 핸디캡이 비슷해지도록 스네이크 방식으로 배정했습니다.',
  };
}

const Grouping: React.FC = () => {
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [criteria, setCriteria] = useState<Mode>('average');
  const [result, setResult] = useState<GroupResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMembers()
      .then((ms) => {
        setMembers(ms);
        setSelectedIds(ms.map((m) => m.id));
      })
      .catch((e: any) => setError(e?.message || '회원 목록을 불러오지 못했습니다.'));
  }, []);

  const toggleMember = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const groupCount = useMemo(() => Math.max(1, Math.ceil(selectedIds.length / 4)), [selectedIds]);

  const handleSuggest = () => {
    const selected = members.filter((m) => selectedIds.includes(m.id));
    if (selected.length < 2) return;
    setResult(buildGroups(selected, criteria));
  };

  return (
    <div className="p-4 pb-20">
      <header className="flex justify-between items-center mb-6 pt-4">
        <h1 className="text-xl font-bold">조편성</h1>
      </header>

      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3 mb-4">{error}</p>}

      <div className="flex h-10 bg-surface rounded-lg p-1 mb-6">
        <button onClick={() => setCriteria('average')} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${criteria !== 'random' ? 'bg-surface-light text-white' : 'text-gray-500'}`}>핸디캡 균등</button>
        <button onClick={() => setCriteria('random')} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${criteria === 'random' ? 'bg-surface-light text-white' : 'text-gray-500'}`}>무작위</button>
      </div>

      <div className="bg-surface rounded-2xl p-5 mb-8 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">tune</span> 팀별 핸디캡 상세 설정</h3>
        </div>
        <p className="text-[10px] text-gray-500 mb-3 font-bold uppercase tracking-wider">밸런싱 기준</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setCriteria('average')} className={`py-3 rounded-xl border text-center transition-all ${criteria === 'average' ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
            <p className={`text-sm font-bold ${criteria === 'average' ? 'text-primary' : 'text-gray-300'}`}>평균 핸디캡</p>
            <p className="text-[10px] text-gray-500">조원 평균 타수</p>
          </button>
          <button onClick={() => setCriteria('sum')} className={`py-3 rounded-xl border text-center transition-all ${criteria === 'sum' ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
            <p className={`text-sm font-bold ${criteria === 'sum' ? 'text-primary' : 'text-gray-300'}`}>핸디캡 합계</p>
            <p className="text-[10px] text-gray-500">조원 전체 합산</p>
          </button>
        </div>
      </div>

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

      {result && (
        <div className="bg-surface rounded-2xl p-4 border border-primary/20 mb-8">
          <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm filled">auto_awesome</span> 자동 편성 결과
          </h3>
          <div className="space-y-4">
            {result.groups.map((g, i) => (
              <div key={i} className="bg-background/50 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">{g.groupName}</span>
                  <span className="text-[10px] text-primary">{criteria === 'sum' ? '합계' : '평균'}: {g.metricValue.toFixed(1)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.players.map((p) => (
                    <span key={p} className="text-[10px] bg-white/5 px-2 py-1 rounded-md">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-3 italic">"{result.reasoning}"</p>
        </div>
      )}

      <div className="fixed bottom-24 left-0 w-full px-4 flex flex-col gap-2 max-w-md mx-auto">
        <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
          <span>{selectedIds.length}명 선택됨 ({groupCount}개 조)</span>
          <button onClick={() => setSelectedIds([])} className="underline">초기화</button>
        </div>
        <button
          onClick={handleSuggest}
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
