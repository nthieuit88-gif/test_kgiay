import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="font-display bg-bg-page min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="Modern bright office background"
          className="w-full h-full object-cover opacity-20 blur-sm scale-105 saturate-0"
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/90 to-blue-50/60"></div>
      </div>
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-200 mb-5 transform transition hover:scale-105 duration-300">
            <span className="material-symbols-outlined text-white text-[28px]">meeting_room</span>
          </div>
          <h1 className="text-2xl font-extrabold text-text-main tracking-tight text-center">E-Meeting Paperless</h1>
          <p className="text-text-secondary text-sm mt-2 font-medium">Hệ thống phòng họp chuyên nghiệp</p>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-card border border-white/50 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-20"></div>
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Đăng nhập hệ thống</h2>
            <p className="text-slate-500 text-sm">Vui lòng nhập thông tin tài khoản doanh nghiệp</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1" htmlFor="username">
                Tên đăng nhập
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <input
                  className="block w-full h-[50px] rounded-xl border border-slate-200 bg-slate-50 px-3 pl-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-200"
                  id="username"
                  placeholder="admin@paperless.com"
                  defaultValue="admin@paperless.com"
                  required
                  type="text"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="password">
                  Mật khẩu
                </label>
                <a className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors" href="#">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input
                  className="block w-full h-[50px] rounded-xl border border-slate-200 bg-slate-50 px-3 pl-11 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-200"
                  id="password"
                  placeholder="••••••••"
                  defaultValue="password"
                  required
                  type="password"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
              </div>
            </div>
            <div className="flex items-center pt-1">
              <input
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label className="ml-2.5 block text-sm font-medium text-slate-600 cursor-pointer select-none" htmlFor="remember-me">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <button
              className="w-full flex justify-center items-center h-[52px] rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.99] mt-2 group"
              type="submit"
            >
              Đăng nhập hệ thống
              <span className="material-symbols-outlined text-[18px] ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-medium">
                Cần hỗ trợ kỹ thuật?
                <a className="text-blue-600 hover:text-blue-700 font-semibold ml-1 transition-colors" href="#">Liên hệ IT Support</a>
              </p>
              <div className="mt-5 flex justify-center items-center gap-3 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] select-none">
                <span>Secure</span>
                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                <span>Paperless</span>
                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                <span>Pro</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs font-medium text-slate-400 mt-8">
          © 2024 Enterprise Meeting System v2.1.0
        </p>
      </div>
    </div>
  );
};

export default Login;