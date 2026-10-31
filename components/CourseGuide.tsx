import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface Course { id: number; name: string; location: string; distance?: string | null }

// Course list served by the backend (/api/courses).
// The old version searched with Gemini + Maps grounding from the browser,
// which required a browser-exposed API key; that is gone by design.
const CourseGuide: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCourses()
      .then(setCourses)
      .catch((e: any) => setError(e?.message || '코스 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return courses;
    return courses.filter((c) => c.name.includes(q) || c.location.includes(q));
  }, [courses, query]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center justify-between border-b border-white/5 bg-background/90 backdrop-blur-md sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">코스 가이드</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="골프장 이름·지역 검색"
            className="w-full h-12 pl-12 pr-4 bg-surface border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3 mb-4">{error}</p>}
        {loading && <p className="text-sm text-gray-500">불러오는 중...</p>}
        {!loading && visible.length === 0 && <p className="text-sm text-gray-500">등록된 코스가 없습니다.</p>}

        <div className="space-y-3">
          {visible.map((c) => (
            <div key={c.id} className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
              <div className="h-28 bg-cover bg-center relative" style={{ backgroundImage: `url(https://picsum.photos/seed/course${c.id}/800/300)` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h3 className="font-bold">{c.name}</h3>
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span> {c.location}
                    {c.distance ? ` · ${c.distance}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseGuide;
