import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.login(id.trim(), password);
      setToken(res.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-4">
        <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="relative h-56 rounded-2xl overflow-hidden bg-cover bg-center mb-8" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(17,33,17,1) 100%), url("https://picsum.photos/seed/golfhero/800/600")' }}>
          <div className="absolute bottom-6 left-6">
            <h1 className="text-3xl font-bold tracking-tight">모임 관리자</h1>
            <p className="text-gray-300 text-sm">전체 회원을 관리하는 관리자 전용 로그인입니다</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">관리자 로그인</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">관리자 ID</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">person</span>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full h-14 pl-12 pr-4 bg-surface-light border-none rounded-xl focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full h-14 pl-12 pr-4 bg-surface-light border-none rounded-xl focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-14 bg-primary text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-4 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {busy ? '로그인 중...' : <>관리자로 로그인 <span className="material-symbols-outlined">login</span></>}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm pt-10 pb-8">
          회원은 개별 계정을 만들지 않습니다. 회원 등록은 관리자가 회원 관리 메뉴에서 직접 합니다.
        </p>
      </div>
    </div>
  );
};

export default Login;
