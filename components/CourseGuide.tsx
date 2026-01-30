
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const CourseGuide: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | undefined>(undefined);
  const [links, setLinks] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(undefined);
    setLinks([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite-latest",
        contents: `${query}${userLocation ? ` near me (Lat: ${userLocation.lat}, Lng: ${userLocation.lng})` : ""}`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: userLocation ? {
                latitude: userLocation.lat,
                longitude: userLocation.lng
              } : undefined
            }
          }
        },
      });

      setResult(response.text);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        setLinks(groundingChunks.filter((chunk: any) => chunk.maps).map((chunk: any) => chunk.maps));
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResult("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSearch} className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">search</span>
          <input 
            type="text" 
            placeholder="코스 이름 또는 지역 검색 (예: 제주도 골프장)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-surface border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm shadow-inner"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 bg-primary text-black font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" /> : '검색'}
          </button>
        </form>

        {!result && !loading && (
          <div className="py-12 flex flex-col items-center justify-center opacity-40">
            <span className="material-symbols-outlined text-8xl mb-4">explore</span>
            <p className="text-sm font-medium">전국의 멋진 골프 코스를 찾아보세요</p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
            <div className="h-32 w-full bg-white/10 rounded-2xl" />
          </div>
        )}

        {result && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-surface p-5 rounded-2xl border border-white/5 prose prose-invert prose-sm max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{result}</p>
            </div>

            {links.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">찾은 장소</h3>
                <div className="grid gap-3">
                  {links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-surface-light/40 border border-primary/20 rounded-2xl hover:bg-surface-light/60 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                        </div>
                        <span className="text-sm font-bold text-white">{link.title || "장소 보기"}</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-500">open_in_new</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 mt-auto">
        <section className="bg-surface-light/20 p-4 rounded-2xl border border-white/5">
          <h4 className="text-[10px] font-bold text-primary uppercase mb-2">추천 테마</h4>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['바다 전망', '가성비 좋은', '야간 라운딩', '초보 추천'].map(tag => (
              <button 
                key={tag}
                onClick={() => setQuery(tag + " 골프장")}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold whitespace-nowrap"
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CourseGuide;
