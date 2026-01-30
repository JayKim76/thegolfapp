
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-24">
      <header className="pt-4 mb-6">
        <h1 className="text-3xl font-bold px-1">설정</h1>
      </header>

      <div className="bg-surface rounded-3xl p-5 border border-white/5 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img src="https://picsum.photos/seed/user1/200" className="w-20 h-20 rounded-full border-2 border-primary" alt="" />
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-surface">
              <span className="material-symbols-outlined text-[14px] text-black font-bold">edit</span>
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold">김골프</h2>
            <p className="text-xs text-gray-500 mb-2">kimgolf@example.com</p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-yellow-900/40 text-yellow-500 text-[10px] font-bold">Gold Tier</span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">HCP 18</span>
            </div>
          </div>
        </div>
        <button className="w-full py-2.5 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors">프로필 관리</button>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">알림 설정</h3>
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            {[
              { label: '전체 푸시 알림', icon: 'notifications', color: 'bg-blue-900/40 text-blue-400', checked: true },
              { label: '경기/티타임 알림', icon: 'sports_golf', color: 'bg-green-900/40 text-green-400', checked: true },
              { label: '스코어 업데이트', icon: 'scoreboard', color: 'bg-orange-900/40 text-orange-400', checked: false }
            ].map((item, i) => (
              <div key={item.label} className={`flex items-center justify-between p-4 ${i !== 2 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}>
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${item.checked ? 'bg-primary' : 'bg-white/10'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.checked ? 'translate-x-6' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">앱 설정</h3>
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-900/40 text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">palette</span>
                </div>
                <span className="text-sm font-medium">테마 설정</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <span className="text-xs">다크 모드</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-900/40 text-teal-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                </div>
                <span className="text-sm font-medium">캘린더 동기화</span>
              </div>
              <span className="material-symbols-outlined text-gray-500 text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        <div>
           <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">지원 및 정보</h3>
           <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
             <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/10 text-gray-400 flex items-center justify-center">
                   <span className="material-symbols-outlined text-lg">description</span>
                 </div>
                 <span className="text-sm font-medium">이용약관</span>
               </div>
               <span className="material-symbols-outlined text-gray-500 text-sm">chevron_right</span>
             </button>
             <div className="w-full flex items-center justify-between p-4">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/10 text-gray-400 flex items-center justify-center">
                   <span className="material-symbols-outlined text-lg">info</span>
                 </div>
                 <span className="text-sm font-medium">앱 버전</span>
               </div>
               <span className="text-xs text-gray-500">v1.0.0</span>
             </div>
           </div>
        </div>

        <button onClick={() => navigate('/login')} className="w-full py-4 bg-red-900/10 border border-red-900/30 rounded-2xl text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-900/20 transition-all">
          <span className="material-symbols-outlined">logout</span> 로그아웃
        </button>

        <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">Golf Manager for Web</p>
      </div>
    </div>
  );
};

export default Settings;
