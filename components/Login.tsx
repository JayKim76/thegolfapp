
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

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
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-gray-300 text-sm">Ready to hit the green?</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Perfect Your Swing</h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">mail</span>
              <input type="email" placeholder="user@example.com" className="w-full h-14 pl-12 pr-4 bg-surface-light border-none rounded-xl focus:ring-2 focus:ring-primary transition-all" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">lock</span>
              <input type="password" placeholder="••••••••" className="w-full h-14 pl-12 pr-12 bg-surface-light border-none rounded-xl focus:ring-2 focus:ring-primary transition-all" />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">visibility_off</button>
            </div>
            <div className="text-right">
              <button className="text-xs text-gray-500 font-medium hover:text-primary transition-colors">Forgot Password?</button>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="w-full h-14 bg-primary text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-4 active:scale-[0.98] transition-transform">
            Log In <span className="material-symbols-outlined">login</span>
          </button>
        </div>

        <div className="flex items-center gap-4 py-8">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-4 gap-3 mb-10">
          <button className="h-14 rounded-xl bg-[#FEE500] flex items-center justify-center text-black">
             <span className="material-symbols-outlined">chat_bubble</span>
          </button>
          <button className="h-14 rounded-xl bg-[#03C75A] flex items-center justify-center text-white font-bold">N</button>
          <button className="h-14 rounded-xl bg-white flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M17.05 20.28c-.96.95-2.04 1.9-3.32 1.9-1.25 0-1.63-.76-3.13-.76s-1.92.74-3.11.76c-1.25.02-2.45-1-3.41-1.98-1.98-1.98-3.41-5.59-1.42-8.98 1-1.69 2.76-2.75 4.67-2.78 1.45-.03 2.82.97 3.71.97.89 0 2.53-1.2 4.25-1.03.73.03 2.75.29 4.05 2.19-.1.06-2.42 1.41-2.4 4.18.02 3.33 2.91 4.45 2.94 4.47-.02.07-.46 1.58-1.53 3.05zm-4.14-16.7c.83-1.02 1.38-2.43 1.23-3.83-1.21.05-2.67.81-3.54 1.83-.78.9-1.47 2.36-1.29 3.72 1.34.1 2.72-.65 3.6-1.72z" fill="black"/></svg>
          </button>
          <button className="h-14 rounded-xl bg-white flex items-center justify-center">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm pb-8">
          Don't have an account? <button className="text-primary font-bold hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
