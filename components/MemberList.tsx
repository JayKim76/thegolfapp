
import React, { useState } from 'react';
import { MOCK_MEMBERS } from '../constants';

const MemberList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('전체');

  const filters = ['전체', '남자', '여자', '정회원'];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md p-4 pb-2 border-b border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">회원 목록</h1>
          <button className="w-10 h-10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl filled">add_circle</span>
          </button>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">search</span>
          <input 
            type="text" 
            placeholder="회원 검색 (이름, 핸디캡)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-surface border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-9 px-5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filter === f ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-surface border border-white/10 text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-3">
        {MOCK_MEMBERS.map(member => (
          <div key={member.id} className="flex items-center gap-4 bg-surface p-3 rounded-2xl border border-white/5 shadow-sm group active:border-primary/50 transition-all cursor-pointer">
            <div className="relative shrink-0">
              <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-full border-2 border-transparent group-active:border-primary" />
              <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface ${member.status === 'active' ? 'bg-primary' : 'bg-gray-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base truncate">{member.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                  HDCP {member.handicap}
                </span>
                {member.type === '티칭프로' && (
                   <span className="px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-400 text-[10px] font-bold border border-yellow-400/20">PRO</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {member.type} • {member.lastRound ? `최근 라운딩 ${member.lastRound}` : `가입일 ${member.joinDate}`}
              </p>
            </div>
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
