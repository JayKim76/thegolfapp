import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiRoundSession } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [clubName, setClubName] = useState('');
  const [memberCount, setMemberCount] = useState(0);
  const [avgHandicap, setAvgHandicap] = useState<string>('-');
  const [topMember, setTopMember] = useState<{ name: string; handicap: number } | null>(null);
  const [sessions, setSessions] = useState<ApiRoundSession[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [club, stats, rounds, scheds] = await Promise.all([
          api.getClub(),
          api.getStats(),
          api.getRounds(),
          api.getSchedules(),
        ]);
        setClubName(club.name);
        setMemberCount(stats.members.total);
        setAvgHandicap(stats.members.avgHandicap != null ? stats.members.avgHandicap.toFixed(1) : '-');
        setTopMember(stats.members.topMember);
        setSessions(rounds);
        setSchedules(scheds);
      } catch (e: any) {
        setError(e?.message || '데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const overallAvg = useMemo(() => {
    const all = sessions.flatMap((s) => s.players.map((pl) => pl.score));
    return all.length ? (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1) : null;
  }, [sessions]);

  const sessionAgg = (s: ApiRoundSession) => {
    const scores = s.players.map((pl) => pl.score);
    return {
      count: scores.length,
      best: scores.length ? Math.min(...scores) : null,
      avg: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
    };
  };

  const today = new Date().toISOString().split('T')[0];
  const nextRound = useMemo(() => {
    const upcoming = schedules
      .filter((s) => typeof s.date === 'string' && s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0];
  }, [schedules, today]);

  const recent = useMemo(
    () => [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [sessions]
  );

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src="https://picsum.photos/seed/user1/100" alt="Avatar" className="w-12 h-12 rounded-full border-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{clubName || '골프 모임'}</h1>
            <p className="text-xs text-gray-500 font-medium">관리자 · 전체 회원 관리</p>
          </div>
        </div>
      </header>

      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3 mb-4">{error}</p>}
      {loading && <p className="text-sm text-gray-500 mb-4">불러오는 중...</p>}

      <section className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl filled">sports_golf</span>
            <span className="text-sm font-medium text-gray-400">전체 회원</span>
          </div>
          <div className="text-3xl font-bold">{memberCount}</div>
          <p className="text-[10px] text-gray-500 mt-1">관리자가 등록·관리</p>
        </div>
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl filled">emoji_events</span>
            <span className="text-sm font-medium text-gray-400">평균 핸디캡</span>
          </div>
          <div className="text-3xl font-bold">{avgHandicap}</div>
          <p className="text-[10px] text-primary font-bold mt-1">
            {topMember ? `최저: ${topMember.name} ${topMember.handicap}` : '핸디캡 기록 없음'}
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-surface-light to-surface rounded-2xl p-4 mb-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-6xl">analytics</span>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-medium text-gray-400 mb-1">모임 평균 스코어 (전체 기록 {sessions.length}회)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{overallAvg ?? '-'}</span>
            {overallAvg && <span className="text-xs text-gray-500">타 · 기록된 라운드 기준</span>}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4 px-1">빠른 실행</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '스코어 입력', icon: 'edit_square', path: '/score-input' },
            { label: '조편성', icon: 'groups', path: '/grouping' },
            { label: '코스 가이드', icon: 'map', path: '/course-guide' },
            { label: '회원 관리', icon: 'monitoring', path: '/members' },
          ].map((item) => (
            <button key={item.label} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-sm active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-primary text-2xl filled">{item.icon}</span>
              </div>
              <span className="text-[10px] font-medium text-gray-400">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {nextRound && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold">다가오는 라운드</h2>
          </div>
          <div className="bg-surface rounded-2xl overflow-hidden shadow-md border border-white/5">
            <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: 'url(https://picsum.photos/seed/golfcourse/800/400)' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <h3 className="font-bold text-lg">{nextRound.courseName}</h3>
                {nextRound.memo && <p className="text-xs text-gray-300">{nextRound.memo}</p>}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary filled">calendar_month</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{nextRound.date}</p>
                  <p className="text-[10px] text-gray-500">{nextRound.time ? `${nextRound.time} 티오프` : '시간 미정'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4 px-1">최근 라운드 기록</h2>
        <div className="space-y-3">
          {recent.length === 0 && !loading && (
            <p className="text-sm text-gray-500 px-1">아직 기록된 라운드가 없습니다. 스코어 입력에서 첫 라운드를 등록해 보세요.</p>
          )}
          {recent.map((s, i) => {
            const agg = sessionAgg(s);
            return (
              <div key={s.id ?? `legacy-${i}`} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-surface-light rounded-lg flex items-center justify-center font-bold text-lg">
                    {agg.best ?? '-'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{s.courseName || '(코스명 없음)'}</h4>
                    <p className="text-[10px] text-gray-500">{s.date} · {agg.count}명</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">평균 {agg.avg != null ? agg.avg.toFixed(1) : '-'}</p>
                  <p className="text-[10px] text-gray-500">최저 {agg.best ?? '-'}타</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
