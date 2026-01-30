
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MemberList from './components/MemberList';
import Grouping from './components/Grouping';
import ScoreInput from './components/ScoreInput';
import Settings from './components/Settings';
import CourseGuide from './components/CourseGuide';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNav = ['/', '/login', '/score-input'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background relative shadow-2xl overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 w-full max-w-md bg-surface/90 backdrop-blur-md border-t border-white/5 px-6 py-2 pb-safe flex justify-between items-center z-50">
          <button onClick={() => navigate('/dashboard')} className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-500'}`}>
            <span className={`material-symbols-outlined ${location.pathname === '/dashboard' ? 'filled' : ''}`}>home</span>
            <span className="text-[10px] font-medium">홈</span>
          </button>
          <button onClick={() => navigate('/members')} className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/members' ? 'text-primary' : 'text-gray-500'}`}>
            <span className={`material-symbols-outlined ${location.pathname === '/members' ? 'filled' : ''}`}>groups</span>
            <span className="text-[10px] font-medium">회원</span>
          </button>
          <div className="relative -top-6">
            <button onClick={() => navigate('/score-input')} className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/30 transform active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[32px] filled">add</span>
            </button>
          </div>
          <button onClick={() => navigate('/grouping')} className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/grouping' ? 'text-primary' : 'text-gray-500'}`}>
            <span className={`material-symbols-outlined ${location.pathname === '/grouping' ? 'filled' : ''}`}>tactic</span>
            <span className="text-[10px] font-medium">조편성</span>
          </button>
          <button onClick={() => navigate('/settings')} className={`flex flex-col items-center gap-1 p-2 ${location.pathname === '/settings' ? 'text-primary' : 'text-gray-500'}`}>
            <span className={`material-symbols-outlined ${location.pathname === '/settings' ? 'filled' : ''}`}>settings</span>
            <span className="text-[10px] font-medium">설정</span>
          </button>
        </nav>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/members" element={<MemberList />} />
          <Route path="/grouping" element={<Grouping />} />
          <Route path="/score-input" element={<ScoreInput />} />
          <Route path="/course-guide" element={<CourseGuide />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
