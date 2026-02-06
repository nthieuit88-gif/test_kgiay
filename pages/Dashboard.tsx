import React from 'react';
import { Page } from '../types';

interface DashboardProps {
    onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-bg-main">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-4 w-1/3">
          <div className="relative w-full max-w-sm group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input
              className="w-full bg-slate-100/50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white text-text-main placeholder-slate-400 transition-all shadow-sm"
              placeholder="Tìm kiếm cuộc họp, tài liệu..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-200">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="p-2.5 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-xl transition-all duration-200">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </header>
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Xin chào, Nguyễn Văn A! 👋</h2>
            <p className="text-slate-500 font-medium">Bạn có <span className="text-primary font-bold">3 cuộc họp</span> và <span className="text-orange-500 font-bold">5 tài liệu</span> cần xử lý hôm nay.</p>
          </div>
          <button onClick={() => onNavigate(Page.CALENDAR)} className="group flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0">
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
            Tạo cuộc họp mới
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <span className="material-symbols-outlined text-9xl text-blue-600">groups</span>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <p className="text-slate-500 font-semibold text-sm">Cuộc họp hôm nay</p>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-slate-800">3</span>
              <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-lg mb-1.5 flex items-center gap-1 border border-green-100">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +1
              </span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <span className="material-symbols-outlined text-9xl text-orange-600">description</span>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                <span className="material-symbols-outlined">pending_actions</span>
              </div>
              <p className="text-slate-500 font-semibold text-sm">Tài liệu chờ duyệt</p>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-slate-800">5</span>
              <span className="text-slate-400 text-sm font-semibold mb-1.5">hồ sơ cần ký</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <span className="material-symbols-outlined text-9xl text-purple-600">bolt</span>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm">
                <span className="material-symbols-outlined">notifications_active</span>
              </div>
              <p className="text-slate-500 font-semibold text-sm">Thông báo mới</p>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-slate-800">12</span>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg mb-1.5 flex items-center border border-blue-100">
                Mới cập nhật
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_upcoming</span>
                Cuộc họp sắp tới
              </h3>
              <a onClick={(e) => { e.preventDefault(); onNavigate(Page.CALENDAR); }} className="text-sm font-bold text-primary hover:text-primary-hover hover:underline decoration-2 underline-offset-4 transition-all cursor-pointer" href="#">Xem tất cả</a>
            </div>
            {/* Meeting Item 1 */}
            <div onClick={() => onNavigate(Page.MEETING_DETAIL)} className="group bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 cursor-pointer overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex flex-col items-center justify-center bg-blue-50/50 rounded-xl p-4 min-w-[90px] border border-blue-100/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Hôm nay</span>
                    <span className="text-2xl font-black text-primary my-0.5">14:00</span>
                    <span className="text-xs font-semibold text-slate-400">15:30</span>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold uppercase tracking-wider">Sắp diễn ra</span>
                      <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        Phòng 301 - Tầng 3
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors leading-tight">Họp chiến lược Quý 3 & Review KPI</h4>
                    <div className="flex items-center -space-x-2.5 pt-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-9 h-9 rounded-full border-[3px] border-white shadow-sm bg-cover" style={{ backgroundImage: `url('https://i.pravatar.cc/150?u=${i}')` }}></div>
                      ))}
                      <div className="w-9 h-9 rounded-full border-[3px] border-white shadow-sm bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold">+5</div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button onClick={(e) => {e.stopPropagation(); onNavigate(Page.MEETING_DETAIL)}} className="px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-sm font-bold transition-all duration-200">Chi tiết</button>
                    <button className="px-5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all duration-200">Tài liệu</button>
                  </div>
                </div>
              </div>
            </div>
            {/* Meeting Item 2 */}
            <div className="group bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-300 cursor-pointer p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-4 min-w-[90px] border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ngày mai</span>
                  <span className="text-2xl font-black text-slate-700 my-0.5">09:00</span>
                  <span className="text-xs font-semibold text-slate-400">11:00</span>
                </div>
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">Đã lên lịch</span>
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">videocam</span>
                      Online Meeting (Google Meet)
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors leading-tight">Đánh giá tiến độ dự án Alpha</h4>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[16px]">attach_file</span> 2 tài liệu đính kèm
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl text-sm font-semibold transition-all">Sửa đổi</button>
                </div>
              </div>
            </div>
            {/* Promo Banner */}
            <div className="mt-2 relative rounded-2xl overflow-hidden min-h-[160px] flex items-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-lg shadow-slate-200">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/30 to-transparent"></div>
              <div className="relative z-10 p-8 w-full md:w-2/3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">NEW</span>
                  <h4 className="text-white text-xl font-bold">Cập nhật hệ thống v2.4</h4>
                </div>
                <p className="text-slate-300 text-sm mb-5 leading-relaxed">Tính năng ký số tài liệu trực tuyến đã sẵn sàng. Trải nghiệm ngay để tiết kiệm thời gian phê duyệt.</p>
                <button className="text-xs font-bold bg-white text-slate-900 px-5 py-2.5 rounded-lg hover:bg-slate-100 transition-colors shadow-sm">Tìm hiểu thêm</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-lg">Tháng 10, 2023</h3>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center gap-y-3 gap-x-1 text-sm">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                  <span key={day} className="text-slate-400 text-xs font-bold uppercase mb-2">{day}</span>
                ))}
                <span className="text-slate-300 py-2">25</span>
                <span className="text-slate-300 py-2">26</span>
                <span className="text-slate-300 py-2">27</span>
                <span className="text-slate-300 py-2">28</span>
                <span className="text-slate-300 py-2">29</span>
                <span className="text-slate-300 py-2">30</span>
                <span className="text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors font-medium">1</span>
                <span className="text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors font-medium">2</span>
                <span className="text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors font-medium">3</span>
                <span className="text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors font-medium">4</span>
                <span className="bg-primary text-white rounded-lg shadow-md shadow-primary/30 py-2 cursor-pointer font-bold">5</span>
                <span className="text-slate-700 py-2 relative rounded-lg hover:bg-slate-50 cursor-pointer transition-colors font-medium">
                  6 <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></span>
                </span>
                <span className="text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors font-medium">7</span>
                <span className="text-slate-700 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors font-medium">8</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-soft flex-1">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800 text-lg">Thông báo mới</h3>
                <button className="text-xs text-primary font-bold hover:underline">Đánh dấu đã đọc</button>
              </div>
              <div className="space-y-2">
                <div className="flex gap-3 items-start p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="mt-2 min-w-[8px] h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-800 leading-snug font-medium group-hover:text-primary transition-colors">Tài liệu cuộc họp "Chiến lược Q3" đã được cập nhật bởi Ban Thư Ký.</p>
                    <span className="text-xs text-slate-400 font-medium">10 phút trước</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 my-1"></div>
                <div className="flex gap-3 items-start p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="mt-2 min-w-[8px] h-2 w-2 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-800 leading-snug font-medium group-hover:text-primary transition-colors">Lời mời tham gia họp: "Đánh giá nhân sự" từ Nguyễn Văn B.</p>
                    <span className="text-xs text-slate-400 font-medium">1 giờ trước</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 my-1"></div>
                <div className="flex gap-3 items-start p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group opacity-70 hover:opacity-100">
                  <div className="mt-2 min-w-[8px] h-2 w-2 rounded-full bg-slate-400 ring-4 ring-slate-100"></div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-slate-800 leading-snug font-medium group-hover:text-primary transition-colors">Hệ thống bảo trì định kỳ vào 00:00 ngày mai.</p>
                    <span className="text-xs text-slate-400 font-medium">5 giờ trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;