
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => onLogin(), 1200);
  };

  return (
    <div className="font-display min-h-screen w-full flex overflow-hidden bg-white">
      {/* Cột trái: Hình ảnh & Branding Enterprise */}
      <div className="hidden lg:flex lg:w-[58%] relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105 animate-pulse-soft">
          <img
            alt="Office"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=2301"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-slate-950/90"></div>
        </div>
        
        <div className="relative z-10 p-24 flex flex-col justify-between w-full">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl rotate-3">
              <span className="material-symbols-outlined text-[36px] fill">layers</span>
            </div>
            <div>
              <h1 className="text-white text-3xl font-black tracking-tighter">PAPERLESS</h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Intelligence Suite</p>
            </div>
          </div>

          <div className="max-w-xl">
            <h2 className="text-6xl font-black text-white leading-tight mb-8 animate-in slide-in-from-bottom-10 duration-1000">
              Tương lai của <br/> 
              <span className="text-primary-hover underline decoration-white/20 underline-offset-8">Quản trị hội họp</span>
            </h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed mb-12">
              Chuyển đổi hoàn toàn trải nghiệm họp doanh nghiệp với hệ thống Paperless thế hệ mới. Tiết kiệm tài nguyên, tăng cường hiệu quả và bảo mật tuyệt đối.
            </p>
            <div className="flex gap-10">
               <div className="flex flex-col">
                  <span className="text-white text-2xl font-black">94%</span>
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Tỉ lệ hài lòng</span>
               </div>
               <div className="w-px h-10 bg-white/10 self-center"></div>
               <div className="flex flex-col">
                  <span className="text-white text-2xl font-black">2.5K+</span>
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Hội nghị mỗi ngày</span>
               </div>
            </div>
          </div>

          <div className="text-white/20 text-[11px] font-black uppercase tracking-[0.5em]">
            Enterprise Certified System • 2024
          </div>
        </div>
      </div>

      {/* Cột phải: Form Đăng nhập - Glassmorphism Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-10 lg:p-20 relative bg-slate-50/30">
        {/* Background Decor cho phần đăng nhập */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Xin chào!</h3>
            <p className="text-slate-500 font-bold">Vui lòng nhập thông tin để truy cập hệ thống.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tài khoản doanh nghiệp</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input
                  required
                  defaultValue="admin@paperless.com"
                  className="w-full h-[64px] bg-white border-2 border-slate-100 rounded-2xl px-6 pl-14 text-[15px] font-bold text-slate-800 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none"
                  placeholder="name@company.com"
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Mật khẩu truy cập</label>
                <button type="button" className="text-xs font-black text-primary hover:underline uppercase tracking-tighter">Quên?</button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">lock_person</span>
                <input
                  required
                  defaultValue="password"
                  className="w-full h-[64px] bg-white border-2 border-slate-100 rounded-2xl px-6 pl-14 text-[15px] font-bold text-slate-800 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none"
                  placeholder="••••••••"
                  type="password"
                />
                <button type="button" className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">visibility</span></button>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1">
              <input type="checkbox" id="rem" className="w-5 h-5 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary/20 cursor-pointer" />
              <label htmlFor="rem" className="text-sm font-bold text-slate-500 cursor-pointer select-none">Ghi nhớ đăng nhập</label>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full h-[68px] bg-primary hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-glow-blue active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              type="submit"
            >
              {isSubmitting ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : (
                <>
                   Đăng nhập hệ thống
                   <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">chevron_right</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-16 text-center space-y-6 pt-10 border-t border-slate-100">
             <button className="flex items-center justify-center gap-3 w-full h-[60px] bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                Dùng Microsoft Azure / Google SSO
             </button>
             <p className="text-xs font-bold text-slate-400">Trung tâm hỗ trợ: <span className="text-primary cursor-pointer hover:underline">1900 6868</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
