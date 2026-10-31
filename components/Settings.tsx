import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken } from '../services/api';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [clubName, setClubName] = useState('');
  const [memberCount, setMemberCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [toggles, setToggles] = useState({ push: true, tee: true, score: false });

  useEffect(() => {
    api
      .getClub()
      .then((c) => {
        setClubName(c.name);
        setMemberCount(c.memberCount);
      })
      .catch((e: any) => setError(e?.message || '모임 정보를 불러오지 못했습니다.'));
  }, []);

  const saveName = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await api.updateClubName(nameInput.trim());
      setClubName(nameInput.trim());
      setEditing(false);
      setNotice('모임 이름이 변경됐습니다.');
    } catch (e: any) {
      setError(e?.message || '변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  const toggleRow = (key: keyof typeof toggles, label: string, icon: string, color: string, last = false) => (
    <div className={`flex items-center justify-between p-4 ${last ? '' : 'border-b border-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button
        onClick={() => setToggles((t) => ({ ...t, [key]: !t[key] }))}
        className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${toggles[key] ? 'bg-primary' : 'bg-white/10'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${toggles[key] ? 'translate-x-6' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="p-4 pb-24">
      <header className="pt-4 mb-6">
        <h1 className="text-3xl font-bold px-1">모임 관리</h1>
      </header>

      {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3 mb-4">{error}</p>}
      {notice && <p className="text-sm text-primary bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-4">{notice}</p>}

      <div className="bg-surface rounded-3xl p-5 border border-white/5 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <img src="https://picsum.photos/seed/user1/200" className="w-20 h-20 rounded-full border-2 border-primary" alt="" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{clubName || '골프 모임'}</h2>
            <p className="text-xs text-gray-500 mb-2">관리자 계정으로 운영 중 · 회원 {memberCount}명</p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-yellow-900/40 text-yellow-500 text-[10px] font-bold">관리자</span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">단일 모임</span>
            </div>
          </div>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="새 모임 이름"
              className="flex-1 h-11 px-3 bg-background rounded-xl text-sm border-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={saveName} disabled={saving} className="px-4 bg-primary text-black font-bold rounded-xl text-sm disabled:opacity-50">
              {saving ? '저장 중' : '저장'}
            </button>
            <button onClick={() => setEditing(false)} className="px-4 bg-white/5 rounded-xl text-sm font-bold">취소</button>
          </div>
        ) : (
          <button
            onClick={() => { setNameInput(clubName); setEditing(true); }}
            className="w-full py-2.5 bg-white/5 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
          >
            모임 이름 변경
          </button>
        )}
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">알림 설정 (이 기기)</h3>
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            {toggleRow('push', '전체 푸시 알림', 'notifications', 'bg-blue-900/40 text-blue-400')}
            {toggleRow('tee', '경기/티타임 알림', 'sports_golf', 'bg-green-900/40 text-green-400')}
            {toggleRow('score', '스코어 업데이트', 'scoreboard', 'bg-orange-900/40 text-orange-400', true)}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">지원 및 정보</h3>
          <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
            <div className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 text-gray-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">info</span>
                </div>
                <span className="text-sm font-medium">앱 버전</span>
              </div>
              <span className="text-xs text-gray-500">v1.0.0 (웹)</span>
            </div>
          </div>
        </div>

        <button onClick={logout} className="w-full py-4 bg-red-900/10 border border-red-900/30 rounded-2xl text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-900/20 transition-all">
          <span className="material-symbols-outlined">logout</span> 로그아웃
        </button>

        <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">Golf Manager for Web</p>
      </div>
    </div>
  );
};

export default Settings;
