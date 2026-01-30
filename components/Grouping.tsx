
import React, { useState } from 'react';
import { MOCK_MEMBERS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

const Grouping: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(MOCK_MEMBERS.map(m => m.id));
  const [criteria, setCriteria] = useState<'average' | 'sum'>('average');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const toggleMember = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAISuggestion = async () => {
    setIsAIThinking(true);
    try {
      const selectedMembers = MOCK_MEMBERS.filter(m => selectedIds.includes(m.id));
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Given the following golfers and their handicaps, divide them into groups of 4 (or as balanced as possible).
          Goal: Minimize the difference in ${criteria === 'average' ? 'average handicap' : 'total handicap'} between groups.
          Golfers: ${JSON.stringify(selectedMembers.map(m => ({ name: m.name, handicap: m.handicap })))}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              groups: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    groupName: { type: Type.STRING },
                    players: { type: Type.ARRAY, items: { type: Type.STRING } },
                    metricValue: { type: Type.NUMBER }
                  },
                  required: ["groupName", "players", "metricValue"]
                }
              },
              reasoning: { type: Type.STRING }
            },
            required: ["groups", "reasoning"]
          }
        }
      });
      
      const res = JSON.parse(response.text);
      setAiResult(res);
    } catch (error) {
      console.error(error);
      alert("AI grouping failed. Try again.");
    } finally {
      setIsAIThinking(false);
    }
  };

  return (
    <div className="p-4 pb-20">
      <header className="flex justify-between items-center mb-6 pt-4">
        <h1 className="text-xl font-bold">조편성</h1>
        <div className="flex gap-2">
          <span className="material-symbols-outlined">history</span>
          <span className="material-symbols-outlined">settings</span>
        </div>
      </header>

      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">search</span>
        <input type="text" placeholder="회원 검색 (이름, 핸디캡)" className="w-full h-12 pl-12 pr-4 bg-surface border-none rounded-xl focus:ring-2 focus:ring-primary text-sm" />
      </div>

      <div className="flex h-10 bg-surface rounded-lg p-1 mb-6">
        <button onClick={() => setCriteria('average')} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${criteria === 'average' ? 'bg-surface-light text-white' : 'text-gray-500'}`}>핸디캡 균등</button>
        <button onClick={() => setCriteria('sum')} className={`flex-1 text-[10px] font-bold rounded-md transition-all ${criteria === 'sum' ? 'bg-surface-light text-white' : 'text-gray-500'}`}>무작위</button>
      </div>

      <div className="bg-surface rounded-2xl p-5 mb-8 border border-white/5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2"><span className="material-symbols-outlined text-primary">tune</span> 팀별 핸디캡 상세 설정</h3>
          <div className="w-10 h-6 bg-primary rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
        </div>
        <p className="text-[10px] text-gray-500 mb-3 font-bold uppercase tracking-wider">밸런싱 기준</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={() => setCriteria('average')} className={`py-3 rounded-xl border text-center transition-all ${criteria === 'average' ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
            <p className={`text-sm font-bold ${criteria === 'average' ? 'text-primary' : 'text-gray-300'}`}>평균 핸디캡</p>
            <p className="text-[10px] text-gray-500">조원 평균 타수</p>
          </button>
          <button onClick={() => setCriteria('sum')} className={`py-3 rounded-xl border text-center transition-all ${criteria === 'sum' ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
            <p className={`text-sm font-bold ${criteria === 'sum' ? 'text-primary' : 'text-gray-300'}`}>핸디캡 합계</p>
            <p className="text-[10px] text-gray-500">조원 전체 합산</p>
          </button>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mb-2">
          <span>최대 핸디캡 차이 허용</span>
          <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">± 3.0 타</span>
        </div>
        <input type="range" className="w-full accent-primary h-1.5 bg-white/10 rounded-full" />
      </div>

      <div className="flex justify-between items-center mb-4 px-1">
        <p className="text-xs text-gray-400 font-bold">참석 가능 회원</p>
        <button onClick={() => setSelectedIds(MOCK_MEMBERS.map(m => m.id))} className="text-xs font-bold text-primary">모두 선택</button>
      </div>

      <div className="space-y-3 mb-10">
        {MOCK_MEMBERS.map(member => (
          <div key={member.id} onClick={() => toggleMember(member.id)} className="flex items-center gap-4 bg-surface p-3 rounded-2xl border border-white/5 shadow-sm cursor-pointer hover:bg-surface-light transition-all">
            <div className="relative">
              <img src={member.avatar} alt="" className="w-12 h-12 rounded-full" />
              <div className="absolute -bottom-1 -right-1 px-1.5 bg-gray-800 border border-white/10 rounded-full text-[8px] font-bold">Hcp {member.handicap}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{member.name}</h4>
              <p className="text-[10px] text-gray-500">최근 5경기 평균 {member.handicap + 70}타</p>
            </div>
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${selectedIds.includes(member.id) ? 'bg-primary border-primary' : 'border-white/10'}`}>
              {selectedIds.includes(member.id) && <span className="material-symbols-outlined text-black text-sm font-bold">check</span>}
            </div>
          </div>
        ))}
      </div>

      {aiResult && (
        <div className="bg-surface rounded-2xl p-4 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm filled">auto_awesome</span> AI 추천 편성
          </h3>
          <div className="space-y-4">
            {aiResult.groups.map((g: any, i: number) => (
              <div key={i} className="bg-background/50 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">{g.groupName}</span>
                  <span className="text-[10px] text-primary">Metric: {g.metricValue.toFixed(1)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.players.map((p: string) => (
                    <span key={p} className="text-[10px] bg-white/5 px-2 py-1 rounded-md">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-3 italic">"{aiResult.reasoning}"</p>
        </div>
      )}

      <div className="fixed bottom-24 left-0 w-full px-4 flex flex-col gap-2 max-w-md mx-auto">
        <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1">
          <span>{selectedIds.length}명 선택됨 (2개 조)</span>
          <button onClick={() => setSelectedIds([])} className="underline">초기화</button>
        </div>
        <button 
          onClick={handleAISuggestion}
          disabled={isAIThinking || selectedIds.length < 2}
          className="w-full h-14 bg-primary text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
        >
          {isAIThinking ? (
            <div className="animate-spin h-6 w-6 border-4 border-black border-t-transparent rounded-full" />
          ) : (
            <>
              <span className="material-symbols-outlined filled">autorenew</span>
              AI 자동 편성 하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Grouping;
