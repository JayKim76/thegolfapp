import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiMember } from '../services/api';

interface MemberRounds {
  rounds: { id: number; date: string; courseName: string; score: number }[];
  stats: { count: number; avgScore: number | null; bestScore: number | null; recentScores: number[] };
}

const fmtDate = (d: string) => (d ? d.slice(0, 10) : '');

// Member detail: profile + summary stats + the member's full score history.
const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const memberId = Number(id);
  const [member, setMember] = useState<ApiMember | null>(null);
  const [data, setData] = useState<MemberRounds | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memberId) return;
    Promise.all([
      api.getMembers().then((ms) => ms.find((m) => m.id === memberId) ?? null),
      api.getMemberRounds(memberId),
    ])
      .then(([m, rounds]) => {
        setMember(m);
        setData(rounds);
      })
      .catch((e: any) => setError(e?.message || '회원 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [memberId]);

  // Recent-form trend: oldest → newest of the last 10 rounds.
  const trend = useMemo(() => {
    if (!data) return [];
    return [...data.rounds].slice(0, 10).reverse();
  }, [data]);
  const trendMax = trend.length ? Math.max(...trend.map((r) => r.score)) : 0;
  const trendMin = trend.length ? Math.min(...trend.map((r) => r.score)) : 0;

  return (
    <div className="p-4 pb-20">
      <header className="flex items-center gap-2 mb-6 pt-4">
        <button onClick={() => navigate('/members')} className="w-10 h-10 flex items-center justify-center text-gray-300" title="회원 목록으로">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold">회원 상세</h1>
      </header>

      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3 mb-4">{error}</p>}
      {loading && <p className="text-sm text-gray-500">불러오는 중...</p>}

      {!loading && member && (
        <>
          {/* 프로필 */}
          <div className="bg-surface rounded-2xl p-5 border border-white/5 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img src={`https://picsum.photos/seed/golf${member.id}/200`} alt={member.name} className="w-16 h-16 rounded-full" />
                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-surface ${member.status === 'active' ? 'bg-primary' : 'bg-gray-500'}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-lg">{member.name}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">HDCP {member.handicap}</span>
                  {member.type === '티칭프로' && (
                    <span className="px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-400 text-[10px] font-bold border border-yellow-400/20">PRO</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {member.type} · {member.gender === 'female' ? '여자' : '남자'} · 가입 {fmtDate(member.joinDate)}
                </p>
                {member.phone && <p className="text-xs text-gray-500 mt-0.5">{member.phone}</p>}
                {member.email && <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>}
              </div>
            </div>
          </div>

          {/* 요약 통계 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-surface rounded-2xl p-4 border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">라운드</p>
              <p className="text-xl font-bold mt-1">{data?.stats.count ?? 0}<span className="text-xs text-gray-500 font-normal"> 회</span></p>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">평균 스코어</p>
              <p className="text-xl font-bold mt-1">{data?.stats.avgScore ?? '-'}</p>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">베스트</p>
              <p className="text-xl font-bold mt-1 text-primary">{data?.stats.bestScore ?? '-'}</p>
            </div>
          </div>

          {/* 최근 추이 */}
          {trend.length > 1 && (
            <div className="bg-surface rounded-2xl p-5 border border-white/5 mb-4">
              <p className="text-xs font-bold text-gray-300 mb-3">최근 {trend.length}경기 추이 <span className="text-gray-500 font-normal">(낮을수록 좋음)</span></p>
              <div className="flex items-end gap-1.5 h-24">
                {trend.map((r) => {
                  const range = Math.max(10, trendMax - trendMin);
                  // lower score = taller bar (better round stands out)
                  const heightPct = 30 + ((trendMax - r.score) / range) * 70;
                  return (
                    <div key={r.id} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full">
                      <span className="text-[9px] font-bold text-gray-300">{r.score}</span>
                      <div
                        className={`w-full rounded-t-md ${r.score === trendMin ? 'bg-primary' : 'bg-white/20'}`}
                        style={{ height: `${heightPct}%` }}
                        title={`${fmtDate(r.date)} ${r.courseName} ${r.score}타`}
                      />
                      <span className="text-[8px] text-gray-500 truncate w-full text-center">{fmtDate(r.date).slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 전체 스코어 */}
          <h3 className="font-bold text-sm text-gray-200 mb-3 px-1">전체 스코어 기록</h3>
          {data && data.rounds.length === 0 && (
            <p className="text-sm text-gray-500 bg-surface rounded-2xl p-5 border border-white/5">아직 기록된 스코어가 없습니다.</p>
          )}
          <div className="space-y-2">
            {data?.rounds.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-surface p-3.5 rounded-2xl border border-white/5">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{r.courseName || '골프장 미기록'}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{fmtDate(r.date)}</p>
                </div>
                {data.stats.avgScore != null && (
                  <span className={`text-[10px] font-bold ${r.score <= data.stats.avgScore ? 'text-primary' : 'text-gray-500'}`}>
                    {r.score <= data.stats.avgScore ? '평균 이하' : '평균 이상'}
                  </span>
                )}
                <span className={`text-lg font-bold ${data.stats.bestScore === r.score ? 'text-primary' : ''}`}>{r.score}<span className="text-[10px] text-gray-500 font-normal"> 타</span></span>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !member && !error && (
        <p className="text-sm text-gray-500">회원을 찾을 수 없습니다.</p>
      )}
    </div>
  );
};

export default MemberDetail;
