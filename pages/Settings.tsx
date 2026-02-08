
import React, { useState } from 'react';
import { User } from '../types';

interface SettingsProps {
  user: User;
  isAdmin: boolean;
}

const Settings: React.FC<SettingsProps> = ({ user, isAdmin }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'users' | 'workflow'>('profile');

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative bg-[#f8fafc] font-display">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{isAdmin ? 'Cài đặt hệ thống' : 'Thông tin cá nhân'}</h2>
          <p className="text-sm text-slate-500 mt-1">{isAdmin ? 'Quản lý cấu hình toàn bộ hệ thống Paperless' : 'Cập nhật thông tin hồ sơ của bạn'}</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Lưu thay đổi
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
          
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2`}>
                <span className="material-symbols-outlined text-[20px]">account_circle</span> Hồ sơ cá nhân
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => setActiveTab('general')} className={`${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2`}>
                    <span className="material-symbols-outlined text-[20px]">tune</span> Cấu hình chung
                  </button>
                  <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2`}>
                    <span className="material-symbols-outlined text-[20px]">manage_accounts</span> Người dùng
                  </button>
                </>
              )}
            </nav>
          </div>

          {activeTab === 'profile' && (
            <div className="bg-white shadow-xs rounded-xl border border-slate-200 p-8 space-y-8 animate-fade-in-up">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <img src={user.avatar} className="w-24 h-24 rounded-3xl border-4 border-slate-50 shadow-md group-hover:opacity-80 transition-opacity" alt="Avatar" />
                  <button className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </button>
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">{user.name}</h4>
                  <p className="text-slate-500 font-bold">{user.dept} • {user.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Họ và tên</label>
                  <input className="w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 px-4 font-bold text-slate-800" defaultValue={user.name} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email liên hệ</label>
                  <input disabled className="w-full bg-slate-100 border-slate-200 rounded-lg py-2.5 px-4 font-bold text-slate-400 cursor-not-allowed" defaultValue={user.email} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mật khẩu hiện tại</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 px-4 font-bold text-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Mật khẩu mới</label>
                  <input type="password" placeholder="Nhập để thay đổi" className="w-full bg-slate-50 border-slate-200 rounded-lg py-2.5 px-4 font-bold text-slate-800" />
                </div>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">lock</span>
              <p className="text-slate-400 font-bold">Các tab quản trị hệ thống bị khoá đối với tài khoản nhân viên.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Settings;
