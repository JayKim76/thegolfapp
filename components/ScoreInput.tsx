import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiMember } from '../services/api';

interface Row {
  memberId?: number;
  name: string;
  score: number;
}

const ScoreInput: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [courseName, setCourseName] = useState('');
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [guestName, setGuestName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getMembers().then(setMembers).catch(() => setError('회원 목록을 불러오지 못했습니다.'));
  }, []);

  const addMemberRow = (m: ApiMember) => {
    if (rows.some((r) => r.memberId === m.id)) return;
    setRows((rs) => [...rs, { memberId: m.id, name: m.name, score: 90 }]);
  };

  const addGuestRow = () => {
    const name = guestName.trim();
    if (!name) return;
    setRows((rs) => [...rs, { name, score: 90 }]);
    setGuestName('');
  };

  const setScore = (idx: number, score: number) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, score: Math.max(0, Math.min(250, score || 0)) } : r)));

  const removeRow = (idx: number) => setRows((rs) => rs.filter((_, i) => i !== idx));

  const handleOcrFile = async (file: File) => {
    setError('');
    setNotice('');
    setScanning(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(',')[1];
      const result = await api.ocrScorecard(base64, file.type || 'image/jpeg');
      if (result.date) setDate(result.date);
      if (result.courseName) setCourseName(result.courseName);
      setRows(
        result.players.map((p) => {
          const match = members.find((m) => m.name === p.name);
          return { memberId: match?.id, name: p.name, score: p.totalScore };
        })
      );
      setNotice(`인식 결과 ${result.players.length}명을 불러왔습니다. 이름과 타수를 확인한 뒤 저장하세요.`);
    } catch (e: any) {
      setError(e?.message || '스코어카드 인식에 실패했습니다.');
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!courseName.trim()) return setError('골프장 이름을 입력하세요.');
    if (rows.length === 0) return setError('선수를 1명 이상 추가하세요.');
    setSaving(true);
    try {
      await api.createRound({
        date,
        courseName: courseName.trim(),
        players: rows.map((r) => ({ memberId: r.memberId, name: r.name, score: r.score })),
      });
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">스코어 입력</h1>
          <p className="text-[10px] text-gray-500">라운드 기록은 서버(DB)에 저장됩니다</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="text-primary font-bold disabled:opacity-50">저장</button>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" />
          <input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="골프장 이름" className="flex-[2] bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" />
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={scanning}
          className="w-full h-12 rounded-xl border border-primary/40 bg-primary/10 text-primary font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">document_scanner</span>
          {scanning ? '스코어카드 인식 중...' : '스코어카드 사진으로 자동 입력 (OCR)'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleOcrFile(f);
            e.target.value = '';
          }}
        />

        {error && <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 rounded-xl px-4 py-3">{error}</p>}
        {notice && <p className="text-sm text-primary bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">{notice}</p>}

        <div>
          <p className="text-xs font-bold text-gray-400 mb-2">회원 추가 (탭하면 아래 명단에 들어갑니다)</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => addMemberRow(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap border ${
                  rows.some((r) => r.memberId === m.id) ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-gray-300'
                }`}
              >
                <span className="text-xs font-bold">{m.name}</span>
                <span className="text-[10px] opacity-70">H{m.handicap}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="게스트 이름" className="flex-1 bg-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-primary" />
            <button onClick={addGuestRow} className="px-4 rounded-xl bg-surface border border-white/10 text-sm font-bold">게스트 추가</button>
          </div>
        </div>

        <div className="space-y-3 pb-28">
          {rows.length === 0 && <p className="text-sm text-gray-500 text-center py-6">위에서 회원을 선택하거나, 스코어카드 사진으로 자동 입력하세요.</p>}
          {rows.map((row, idx) => (
            <div key={idx} className="bg-surface rounded-2xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{row.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${row.memberId ? 'bg-primary/10 text-primary' : 'bg-white/10 text-gray-400'}`}>
                    {row.memberId ? '회원' : '게스트'}
                  </span>
                </div>
                <button onClick={() => removeRow(idx)} className="text-gray-500 hover:text-red-400">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button onClick={() => setScore(idx, row.score - 1)} className="w-11 h-11 rounded-xl bg-background border border-white/10 flex items-center justify-center active:scale-90 transition-all">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  type="number"
                  value={row.score}
                  onChange={(e) => setScore(idx, Number(e.target.value))}
                  className="w-24 text-center text-5xl font-bold bg-transparent outline-none"
                />
                <button onClick={() => setScore(idx, row.score + 1)} className="w-11 h-11 rounded-xl bg-primary text-black flex items-center justify-center active:scale-90 transition-all">
                  <span className="material-symbols-outlined font-bold">add</span>
                </button>
              </div>
              <p className="text-center text-[10px] text-gray-500 mt-2">총 타수 (파 72 기준 {row.score - 72 >= 0 ? `+${row.score - 72}` : row.score - 72})</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-6 max-w-md mx-auto">
        <button onClick={handleSave} disabled={saving} className="w-full h-14 bg-primary text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50">
          <span className="material-symbols-outlined filled">check_circle</span> {saving ? '저장 중...' : '라운드 저장'}
        </button>
      </div>
    </div>
  );
};

export default ScoreInput;
