import React from 'react';

const RoomManagement: React.FC = () => {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#f8fafc]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 w-1/3">
          <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap hidden lg:block">Quản lý Phòng họp</h2>
          <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 placeholder-slate-400 transition-all shadow-sm"
              placeholder="Tìm phòng theo tên, sức chứa..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            <span>Lọc</span>
          </button>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </header>
      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Danh sách Phòng họp</h1>
            <p className="text-slate-500">Quản lý trạng thái, thiết bị và đặt lịch cho <span className="text-primary font-bold">12 phòng</span> trong hệ thống.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[20px]">map</span>
              Sơ đồ tổng thể
            </button>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Thêm phòng mới
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
           {/* Stat Cards */}
           {[
            {icon: 'meeting_room', color: 'blue', label: 'Tổng số phòng', val: '12'},
            {icon: 'check_circle', color: 'green', label: 'Đang trống', val: '8'},
            {icon: 'groups', color: 'orange', label: 'Đang họp', val: '3'},
            {icon: 'build', color: 'slate', label: 'Bảo trì', val: '1'}
           ].map((stat, idx) => (
             <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-card flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
                <div className={`w-14 h-14 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[28px]">{stat.icon}</span>
                </div>
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-800">{stat.val}</p>
                </div>
            </div>
           ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Room 1 */}
            <div className="group bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-60 overflow-hidden">
                    <img alt="Phòng Khánh tiết" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=2340" />
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 text-green-700 backdrop-blur-sm shadow-md border border-green-100">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            Đang trống
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                        <h3 className="text-white font-bold text-xl drop-shadow-sm mb-1">Phòng Khánh Tiết</h3>
                        <p className="text-white/90 text-sm flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            Tầng 1 - Khu A
                        </p>
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-slate-600">
                            <div className="p-1.5 bg-blue-50 rounded-md text-primary">
                                <span className="material-symbols-outlined text-[20px]">group</span>
                            </div>
                            <span className="text-sm font-semibold">20 - 30 Người</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <div className="p-1.5 bg-blue-50 rounded-md text-primary">
                                <span className="material-symbols-outlined text-[20px]">square_foot</span>
                            </div>
                            <span className="text-sm font-semibold">120m²</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thiết bị hỗ trợ</p>
                        <div className="flex flex-wrap gap-2">
                           {['Micro', 'Video Conf', 'Tea break', 'Wifi 6'].map(item => (
                                <span key={item} className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors group-hover:border-slate-200">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">{item === 'Micro' ? 'mic' : item === 'Video Conf' ? 'videocam' : item === 'Tea break' ? 'coffee' : 'wifi'}</span> {item}
                                </span>
                           ))}
                        </div>
                    </div>
                    <div className="mt-auto flex gap-3 pt-2">
                        <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 transform active:scale-95">
                            Đặt phòng ngay
                        </button>
                        <button className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg transition-colors shadow-sm" title="Xem sơ đồ">
                            <span className="material-symbols-outlined">map</span>
                        </button>
                    </div>
                </div>
            </div>

             {/* Room 2 */}
             <div className="group bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-60 overflow-hidden">
                    <img alt="Phòng Họp 202" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[10%]" src="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&q=80&w=2340" />
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 text-orange-600 backdrop-blur-sm shadow-md border border-orange-100">
                            <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                            Đang họp
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                        <h3 className="text-white font-bold text-xl drop-shadow-sm mb-1">Phòng Họp Nhỏ 202</h3>
                         <p className="text-white/90 text-sm flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            Tầng 2 - Khu B
                        </p>
                    </div>
                </div>
                 <div className="p-6 flex-1 flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                         <div className="flex items-center gap-2 text-slate-600">
                            <div className="p-1.5 bg-blue-50 rounded-md text-primary">
                                <span className="material-symbols-outlined text-[20px]">group</span>
                            </div>
                            <span className="text-sm font-semibold">8 - 10 Người</span>
                        </div>
                         <div className="flex items-center gap-2 text-slate-600">
                             <div className="p-1.5 bg-blue-50 rounded-md text-primary">
                                <span className="material-symbols-outlined text-[20px]">square_foot</span>
                            </div>
                             <span className="text-sm font-semibold">45m²</span>
                        </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 shadow-sm">
                        <p className="text-[10px] text-orange-600 font-extrabold uppercase mb-1 tracking-wide">Cuộc họp hiện tại</p>
                        <p className="text-sm font-bold text-slate-800 truncate">Review Thiết kế UI/UX App</p>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            Kết thúc: 15:30 (còn 45p)
                        </p>
                    </div>
                     <div className="mt-auto flex gap-3 pt-2">
                        <button className="flex-1 bg-slate-100 text-slate-400 cursor-not-allowed py-2.5 rounded-lg text-sm font-bold transition-colors">
                            Đã kín lịch
                        </button>
                        <button className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg transition-colors shadow-sm" title="Xem lịch chi tiết">
                            <span className="material-symbols-outlined">calendar_month</span>
                        </button>
                    </div>
                 </div>
             </div>

             {/* Room 3 */}
            <div className="group bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-60 overflow-hidden">
                    <img alt="Hội trường lớn" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://images.unsplash.com/photo-1544982590-0f2c42ce095d?auto=format&fit=crop&q=80&w=2340" />
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 text-green-700 backdrop-blur-sm shadow-md border border-green-100">
                             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            Đang trống
                        </span>
                    </div>
                     <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                        <h3 className="text-white font-bold text-xl drop-shadow-sm mb-1">Hội Trường A</h3>
                        <p className="text-white/90 text-sm flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                            Tầng 3 - Trung Tâm
                        </p>
                    </div>
                </div>
                 <div className="p-6 flex-1 flex flex-col gap-5">
                     <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 text-slate-600">
                            <div className="p-1.5 bg-blue-50 rounded-md text-primary">
                                <span className="material-symbols-outlined text-[20px]">group</span>
                            </div>
                            <span className="text-sm font-semibold">200+ Người</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                             <div className="p-1.5 bg-blue-50 rounded-md text-primary">
                                <span className="material-symbols-outlined text-[20px]">square_foot</span>
                            </div>
                            <span className="text-sm font-semibold">500m²</span>
                        </div>
                    </div>
                     <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thiết bị hỗ trợ</p>
                         <div className="flex flex-wrap gap-2">
                           {['Bục phát biểu', 'Màn hình LED 200"', 'Âm thanh'].map(item => (
                                <span key={item} className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors group-hover:border-slate-200">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400">{item === 'Bục phát biểu' ? 'podium' : item === 'Màn hình LED 200"' ? 'tv' : 'speaker'}</span> {item}
                                </span>
                           ))}
                        </div>
                    </div>
                    <div className="mt-auto flex gap-3 pt-2">
                        <button className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 transform active:scale-95">
                            Đặt lịch ngay
                        </button>
                         <button className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg transition-colors shadow-sm" title="Xem sơ đồ">
                            <span className="material-symbols-outlined">map</span>
                        </button>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </main>
  );
};

export default RoomManagement;