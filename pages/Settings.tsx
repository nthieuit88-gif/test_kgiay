import React from 'react';

const Settings: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col overflow-hidden relative bg-[#f8fafc]">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 sticky top-0 z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt hệ thống</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý cấu hình toàn bộ hệ thống Paperless Meeting</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-xs transition-all">Hủy thay đổi</button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Lưu cài đặt
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="border-b border-slate-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              <a className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors" href="#">
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Cấu hình chung
              </a>
              <a className="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors" href="#">
                <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                Quản lý người dùng
              </a>
              <a className="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors" href="#">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
                Quy trình phê duyệt
              </a>
              <a className="border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors" href="#">
                <span className="material-symbols-outlined text-[20px]">history</span>
                Nhật ký hoạt động
              </a>
            </nav>
          </div>
          {/* Section 1 */}
          <section className="bg-white shadow-xs rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Thông tin tổ chức</h3>
              <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin cơ bản về doanh nghiệp hiển thị trên các tài liệu.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên tổ chức</label>
                <input className="w-full bg-white border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400 py-2.5" type="text" defaultValue="Công ty Cổ phần Công nghệ ABC" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email hệ thống</label>
                <input className="w-full bg-white border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm focus:ring-primary focus:border-primary placeholder-slate-400 py-2.5" type="email" defaultValue="no-reply@abc-corp.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">Logo hệ thống</label>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">image</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors self-start">
                      Tải lên logo mới
                    </button>
                    <p className="text-xs text-slate-500">Hỗ trợ PNG, JPG. Kích thước tối đa 2MB.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Section 2 */}
          <section className="bg-white shadow-xs rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Bảo mật & Truy cập</h3>
              <p className="text-sm text-slate-500 mt-1">Cấu hình các quy tắc đăng nhập và bảo mật tài liệu.</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-semibold text-slate-900">Xác thực hai lớp (2FA)</span>
                  <span className="text-sm text-slate-500">Bắt buộc tất cả nhân viên kích hoạt 2FA khi đăng nhập vào hệ thống quản trị.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-semibold text-slate-900">Watermark tài liệu</span>
                  <span className="text-sm text-slate-500">Tự động chèn watermark "MẬT" chìm lên background các tài liệu nhạy cảm.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>
              <div className="w-full h-px bg-slate-100"></div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-semibold text-slate-900">Thời gian phiên làm việc</span>
                  <span className="text-sm text-slate-500">Tự động đăng xuất tài khoản sau khoảng thời gian không hoạt động.</span>
                </div>
                <div className="w-40">
                  <select className="w-full bg-white border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm focus:ring-primary focus:border-primary py-2 cursor-pointer">
                    <option value="15">15 phút</option>
                    <option defaultValue="30">30 phút</option>
                    <option value="60">1 giờ</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Settings;