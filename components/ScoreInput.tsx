
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ScoreInput: React.FC = () => {
  const [score, setScore] = useState(72);
  const [date, setDate] = useState('2023-10-24');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">스코어 입력</h1>
          <p className="text-[10px] text-gray-500">Sky 72 CC - Lake Course</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-primary font-bold">저장</button>
      </header>

      <div className="p-4 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { name: '나', avatar: 'https://picsum.photos/seed/u1/100', active: true },
          { name: '김철수', avatar: 'https://picsum.photos/seed/u2/100', active: false },
          { name: '이영희', avatar: 'https://picsum.photos/seed/u3/100', active: false },
        ].map(p => (
          <button key={p.name} className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border ${p.active ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-gray-400'}`}>
            <img src={p.avatar} className="w-6 h-6 rounded-full" alt="" />
            <span className="text-xs font-bold">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full bg-surface-light/30 rounded-3xl p-8 border border-white/10 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Round Date</label>
          <div className="relative mb-12">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">calendar_month</span>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="bg-background/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-center focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>

          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Total Score</h3>
          
          <div className="flex items-center gap-8 mb-10">
            <button onClick={() => setScore(s => s - 1)} className="w-16 h-16 rounded-2xl bg-background border border-white/10 flex items-center justify-center hover:bg-white/5 active:scale-90 transition-all">
              <span className="material-symbols-outlined text-3xl">remove</span>
            </button>
            <div className="text-center">
              <span className="text-8xl font-bold leading-none">{score}</span>
              <div className="mt-4 px-4 py-1 rounded-full bg-primary/10 border border-primary/20">
                <p className="text-primary font-bold text-xs">EVEN PAR</p>
              </div>
            </div>
            <button onClick={() => setScore(s => s + 1)} className="w-16 h-16 rounded-2xl bg-primary text-black flex items-center justify-center hover:opacity-90 active:scale-90 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-3xl font-bold">add</span>
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center leading-relaxed">라운드 종료 후 스코어 카드에 적힌<br/>최종 타수를 입력해주세요.</p>
        </div>
      </div>

      <div className="p-4 pb-10">
        <button onClick={() => navigate('/dashboard')} className="w-full h-14 bg-primary text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform">
          <span className="material-symbols-outlined filled">check_circle</span> 라운드 종료
        </button>
      </div>
    </div>
  );
};

export default ScoreInput;
