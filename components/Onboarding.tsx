
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Easy Member Management",
    desc: "Keep track of all club members, profiles, and handicaps in one secure place.",
    image: "https://picsum.photos/seed/ob1/400/400",
    icon: "badge"
  },
  {
    title: "Real-time Score Tracking",
    desc: "Input scores effortlessly hole-by-hole and view live analytics as you play.",
    image: "https://picsum.photos/seed/ob2/400/400",
    icon: "monitoring"
  },
  {
    title: "Automatic Grouping",
    desc: "Generate fair and balanced teams in seconds using our smart algorithm.",
    image: "https://picsum.photos/seed/ob3/400/400",
    icon: "groups"
  }
];

const Onboarding: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col h-screen px-6 py-12 text-center">
      <div className="flex justify-end">
        <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full aspect-square max-w-[300px] mb-8 relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
          <img src={slides[current].image} alt={slides[current].title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-background/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <span className="material-symbols-outlined text-primary text-2xl">{slides[current].icon}</span>
            <div className="text-left">
              <p className="text-white text-[10px] font-bold uppercase tracking-wider">Feature</p>
              <p className="text-gray-300 text-xs">{slides[current].title.split(' ')[0]}</p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-3">{slides[current].title}</h1>
        <p className="text-gray-400 font-light max-w-xs">{slides[current].desc}</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
          ))}
        </div>

        <button onClick={next} className="w-full h-14 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
          {current === slides.length - 1 ? 'Start Golfing' : 'Next'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <p className="text-gray-500 text-sm">Already a member? <button onClick={() => navigate('/login')} className="text-primary font-medium">Log in</button></p>
      </div>
    </div>
  );
};

export default Onboarding;
