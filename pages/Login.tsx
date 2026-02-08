
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@paperless.com');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Tạo 15 tài khoản user + 1 admin
  const MOCK_USERS: Record<string, { name: string, role: UserRole, dept: string, pass: string }> = {
    'admin@paperless.com': { name: 'Nguyễn Văn A', role: 'ADMIN', dept: 'Ban Giám Đốc', pass: 'password' }
  };

  for (let i = 1; i <= 15; i++) {
    MOCK_USERS[`user${i}@paperless.com`] = {
      name: `Nhân viên ${i}`,
      role: 'USER',
      dept: 'Phòng chuyên môn',
      pass: 'Longphu25##'
    };
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      const userFound = MOCK_USERS[email];
      if (userFound && userFound.pass === password) {
        onLogin({
          id: email,
          name: userFound.name,
          email: email,
          role: userFound.role,
          dept: userFound.dept,
          avatar: `https://i.pravatar.cc/150?u=${email}`
        });
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác.');
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="font-display min-h-screen w-full flex overflow-hidden bg-white">
      <div className="hidden lg:flex lg:w-[58%] relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105 animate-pulse-soft">
          <img alt="Office" className="w-full h-full object-cover opacity-60 mix-blend-overlay" src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=2301" />
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
            <h2 className="text-6xl font-black text-white leading-tight mb-8">Tương lai của <br/><span className="text-primary-hover underline decoration-white/20 underline-offset-8">Quản trị hội họp</span></h2>
            <p className="text-xl text-white/60 font-medium leading-relaxed mb-12">Chuyển đổi hoàn toàn trải nghiệm họp doanh nghiệp với hệ thống Paperless thế hệ mới. 15 tài khoản nhân viên đã sẵn sàng.</p>
          </div>
          <div className="text-white/20 text-[11px] font-black uppercase tracking-[0.5em]">Enterprise Certified System • 2024</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-10 lg:p-20 relative bg-slate-50/30">
        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Xin chào!</h3>
            <p className="text-slate-500 font-bold">Dùng Longphu25## cho các tài khoản User.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tài khoản doanh nghiệp</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input required value={email} onChange={e => setEmail(e.target.value)} className="w-full h-[64px] bg-white border-2 border-slate-100 rounded-2xl px-6 pl-14 text-[15px] font-bold text-slate-800 focus:border-primary transition-all outline-none" placeholder="name@company.com" type="email" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mật khẩu truy cập</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">lock_person</span>
                <input required value={password} onChange={e => setPassword(e.target.value)} className="w-full h-[64px] bg-white border-2 border-slate-100 rounded-2xl px-6 pl-14 text-[15px] font-bold text-slate-800 focus:border-primary transition-all outline-none" placeholder="••••••••" type="password" />
              </div>
            </div>

            {error && <p className="text-rose-500 text-xs font-bold ml-1">{error}</p>}

            <button disabled={isSubmitting} className="w-full h-[68px] bg-primary hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-glow-blue active:scale-95 transition-all flex items-center justify-center gap-3" type="submit">
              {isSubmitting ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Đăng nhập hệ thống"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
