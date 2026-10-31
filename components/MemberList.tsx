import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiMember } from '../services/api';

const MemberList: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', gender: 'male', handicap: '18', type: '정회원' });
  const [saving, setSaving] = useState(false);

  const filters = ['전체', '남자', '여자'];

  const load = async () => {
    try {
      setMembers(await api.getMembers());
      setError('');
    } catch (e: any) {
      setError(e?.message || '회원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    return members.filter((m) => {
      if (filter === '남자' && m.gender !== 'male') return false;
      if (filter === '여자' && m.gender !== 'female') return false;
      if (search && !m.name.includes(search) && !String(m.handicap).includes(search)) return false;
      return true;
    });
  }, [members, filter, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.createMember({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        gender: form.gender,
        handicap: Number(form.handicap) || 0,
        type: form.type,
      });
      setForm({ name: '', phone: '', gender: 'male', handicap: '18', type: '정회원' });
      setShowForm(false);
      await load();
    } catch (e: any) {
      setError(e?.message || '회원 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: ApiMember) => {
    if (!window.confirm(`${m.name} 회원을 삭제할까요? 이 회원의 라운드 기록도 함께 삭제됩니다.`)) return;
    try {
      await api.deleteMember(m.id);
      await load();
    } catch (e: any) {
      setError(e?.message || '삭제에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md p-4 pb-2 border-b border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">회원 목록 <span className="text-sm text-gray-500">{members.length}명</span></h1>
          <button onClick={() => setShowForm((v) => !v)} className="w-10 h-10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl filled">{showForm ? 'close' : 'add_circle'}</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="bg-surface rounded-2xl border border-white/10 p-4 mb-4 space-y-3">
            <p className="text-sm font-bold">새 회원 등록</p>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="이름 (필수)" className="w-full h-11 px-3 bg-background rounded-xl text-sm focus:ring-2 focus:ring-primary border-none" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="전화번호 (선택)" className="w-full h-11 px-3 bg-background rounded-xl text-sm focus:ring-2 focus:ring-primary border-none" />
            <div className="flex gap-2">
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="flex-1 h-11 px-3 bg-background rounded-xl text-sm border-none">
                <option value="male">남자</option>
                <option value="female">여자</option>
              </select>
              <input value={form.handicap} onChange={(e) => setForm({ ...form, handicap: e.target.value })} type="number" placeholder="핸디캡" className="flex-1 h-11 px-3 bg-background rounded-xl text-sm focus:ring-2 focus:ring-primary border-none" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex-1 h-11 px-3 bg-background rounded-xl text-sm border-none">
                <option>정회원</option>
                <option>일반회원</option>
                <option>티칭프로</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full h-11 bg-primary text-black font-bold rounded-xl disabled:opacity-50">
              {saving ? '등록 중...' : '등록하기'}
            </button>
          </form>
        )}

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
          {filters.map((f) => (
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
        {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3">{error}</p>}
        {loading && <p className="text-sm text-gray-500">불러오는 중...</p>}
        {!loading && visible.length === 0 && <p className="text-sm text-gray-500">회원이 없습니다. 오른쪽 위 + 버튼으로 등록하세요.</p>}
        {visible.map((member) => (
          <div key={member.id} className="flex items-center gap-4 bg-surface p-3 rounded-2xl border border-white/5 shadow-sm">
            <div
              className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(`/members/${member.id}`)}
              title="상세 · 전체 스코어 보기"
            >
              <div className="relative shrink-0">
                <img src={`https://picsum.photos/seed/golf${member.id}/200`} alt={member.name} className="w-14 h-14 rounded-full border-2 border-transparent" />
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
                  {member.type} · {member.gender === 'female' ? '여자' : '남자'}{member.phone ? ` · ${member.phone}` : ''}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-600 shrink-0">chevron_right</span>
            </div>
            <button onClick={() => handleDelete(member)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-400 shrink-0" title="회원 삭제">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
