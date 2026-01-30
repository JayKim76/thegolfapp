
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_ROUNDS, MOCK_HISTORY } from '../constants';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const nextRound = MOCK_ROUNDS[0];

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src="https://picsum.photos/seed/user1/100" alt="Avatar" className="w-12 h-12 rounded-full border-2 border-primary" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-background" />
          </div>
          <div>
            <h1 className="text-lg font-bold">안녕하세요, 김민수님</h1>
            <p className="text-xs text-gray-500 font-medium">Gold Member</p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surface-light transition-colors">
          <span className="material-symbols-outlined filled">notifications</span>
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl filled">sports_golf</span>
            <span className="text-sm font-medium text-gray-400">핸디캡</span>
          </div>
          <div className="text-3xl font-bold">12</div>
          <p className="text-[10px] text-gray-500 mt-1">상위 15%</p>
        </div>
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-xl filled">emoji_events</span>
            <span className="text-sm font-medium text-gray-400">최고 점수</span>
          </div>
          <div className="text-3xl font-bold">78</div>
          <p className="text-[10px] text-primary font-bold mt-1">New Record!</p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-surface-light to-surface rounded-2xl p-4 mb-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <span className="material-symbols-outlined text-6xl">analytics</span>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-medium text-gray-400 mb-1">평균 스코어 (최근 5경기)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">82.4</span>
            <span className="text-xs font-bold text-primary flex items-center">
               <span className="material-symbols-outlined text-sm">trending_down</span> -1.5%
            </span>
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
            { label: '통계 분석', icon: 'monitoring', path: '/dashboard' }
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center border border-white/5 shadow-sm active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-primary text-2xl filled">{item.icon}</span>
              </div>
              <span className="text-[10px] font-medium text-gray-400">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-lg font-bold">다가오는 라운드</h2>
          <button className="text-xs font-bold text-primary">전체보기</button>
        </div>
        <div className="bg-surface rounded-2xl overflow-hidden shadow-md border border-white/5">
          <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url(${nextRound.image})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-3 left-4">
              <h3 className="font-bold text-lg">{nextRound.courseName}</h3>
              <p className="text-xs text-gray-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span> {nextRound.location}
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-primary filled">calendar_month</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{nextRound.date}</p>
                  <p className="text-[10px] text-gray-500">{nextRound.teeOff} 티오프</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-green-900/40 text-green-400 text-[10px] font-bold">예약 확정</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/user${i}/100`} className="w-8 h-8 rounded-full border-2 border-surface" alt="Player" />
                ))}
              </div>
              <button className="px-4 py-2 bg-primary text-black text-xs font-bold rounded-lg active:scale-95 transition-transform">상세 보기</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4 px-1">최근 라운드 기록</h2>
        <div className="space-y-3">
          {MOCK_HISTORY.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-light rounded-lg flex items-center justify-center font-bold text-lg">
                  {item.score}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{item.courseName}</h4>
                  <p className="text-[10px] text-gray-500">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${item.parDiff > 0 ? 'text-red-400' : 'text-primary'}`}>
                  {item.parDiff > 0 ? `+${item.parDiff}` : item.parDiff}
                </p>
                <p className="text-[10px] text-gray-500">{item.score}타</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
