import React from 'react';

const Calendar: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white">
      <header className="shrink-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_clock</span>
            Lịch họp hệ thống
          </h2>
          <div className="h-6 w-px bg-slate-300"></div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-md transition-all">Ngày</button>
            <button className="px-3 py-1 text-xs font-bold bg-white text-slate-900 shadow-sm rounded-md transition-all">Tuần</button>
            <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-md transition-all">Tháng</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64 hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 placeholder-slate-400 transition-all hover:bg-slate-100 focus:bg-white"
              placeholder="Tìm phòng, chủ trì..."
              type="text"
            />
          </div>
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>
      <div className="shrink-0 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors">Hôm nay</button>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-slate-100 rounded-full transition-colors"><span className="material-symbols-outlined text-slate-600">chevron_left</span></button>
            <button className="p-1 hover:bg-slate-100 rounded-full transition-colors"><span className="material-symbols-outlined text-slate-600">chevron_right</span></button>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Tháng 10, 2023</h3>
        </div>
        <button className="group flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add</span>
          Đặt lịch họp
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-white">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
            <div className="p-3 text-center border-r border-slate-200 text-xs font-medium text-slate-400">
              GMT+7
            </div>
            {['T2 (25)', 'T3 (26)', 'T4 (27)', 'T5 (28)'].map(day => {
              const [d, date] = day.split(' ');
              return (
                <div key={day} className="p-3 text-center border-r border-slate-200">
                  <span className="block text-xs font-medium text-slate-500 uppercase">{d}</span>
                  <span className="block text-xl font-bold text-slate-700">{date.replace(/[()]/g, '')}</span>
                </div>
              );
            })}
            <div className="p-3 text-center border-r border-slate-200 bg-blue-50/50">
              <span className="block text-xs font-bold text-primary uppercase">T6</span>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xl font-bold shadow-md shadow-blue-200 mt-1">29</div>
            </div>
             {['T7 (30)', 'CN (1)'].map(day => {
              const [d, date] = day.split(' ');
              return (
                <div key={day} className="p-3 text-center border-r border-slate-200 last:border-r-0">
                  <span className="block text-xs font-medium text-slate-500 uppercase">{d}</span>
                  <span className="block text-xl font-bold text-slate-700">{date.replace(/[()]/g, '')}</span>
                </div>
              );
            })}
          </div>
          <div className="relative grid grid-cols-[60px_repeat(7,1fr)] flex-1 min-h-[1000px]">
             {/* Background Grid Lines */}
             <div className="col-span-8 absolute inset-0 grid grid-rows-[repeat(11,1fr)] pointer-events-none z-0">
                {Array.from({length: 11}).map((_, i) => (
                    <div key={i} className="border-b border-slate-100"></div>
                ))}
             </div>
            {/* Time Column */}
            <div className="border-r border-slate-200 bg-white text-xs text-slate-400 font-medium text-center grid grid-rows-[repeat(11,1fr)] z-10">
                {[8,9,10,11,12,13,14,15,16,17,18].map(h => (
                     <span key={h} className="relative -top-2.5">{h < 10 ? `0${h}` : h}:00</span>
                ))}
            </div>

            {/* Event Columns */}
            {/* Mon */}
            <div className="border-r border-slate-200 relative group hover:bg-slate-50 transition-colors">
              <div className="absolute top-[9.09%] left-1 right-1 h-[18.18%] bg-blue-50 border-l-4 border-primary rounded px-2 py-1.5 cursor-pointer hover:shadow-lg hover:z-20 hover:scale-[1.02] transition-all">
                <p className="text-[10px] font-bold text-primary mb-0.5">09:00 - 11:00</p>
                <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">Giao ban tuần - Phòng Marketing</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-slate-300 bg-cover" style={{backgroundImage: "url('https://i.pravatar.cc/150?u=a')"}}></span>
                  <span className="text-[10px] text-slate-500">Nguyễn Văn A</span>
                </div>
              </div>
            </div>
            {/* Tue */}
            <div className="border-r border-slate-200 relative group hover:bg-slate-50 transition-colors">
               <div className="absolute top-[54.54%] left-1 right-1 h-[9.09%] bg-green-50 border-l-4 border-green-500 rounded px-2 py-1.5 cursor-pointer hover:shadow-lg hover:z-20 hover:scale-[1.02] transition-all">
                <p className="text-[10px] font-bold text-green-600 mb-0.5">14:00 - 15:00</p>
                <p className="text-xs font-bold text-slate-800 leading-tight">Review thiết kế UI/UX</p>
              </div>
            </div>
            {/* Wed */}
            <div className="border-r border-slate-200 relative group hover:bg-slate-50 transition-colors">
               <div className="absolute top-[18.18%] left-1 right-1 h-[18.18%] bg-orange-50 border-l-4 border-orange-500 rounded px-2 py-1.5 cursor-pointer hover:shadow-lg hover:z-20 hover:scale-[1.02] transition-all opacity-90 border-dashed border-l-solid">
                <div className="flex items-center gap-1 mb-0.5">
                  <p className="text-[10px] font-bold text-orange-600">10:00 - 12:00</p>
                  <span className="material-symbols-outlined text-[10px] text-orange-500">hourglass_empty</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-tight">Đào tạo nhân sự mới (Chờ duyệt)</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-slate-400">meeting_room</span>
                  <span className="text-[10px] text-slate-500">P.301</span>
                </div>
              </div>
            </div>
            {/* Thu */}
            <div className="border-r border-slate-200 relative group hover:bg-slate-50 transition-colors"></div>
            {/* Fri (Current Day) */}
            <div className="border-r border-slate-200 bg-blue-50/20 relative group transition-colors">
                <div className="absolute top-[40%] left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                    <span className="text-[10px] font-bold text-red-500 bg-white px-1 ml-1 rounded shadow-sm">12:24</span>
                </div>
               <div className="absolute top-[4.5%] left-1 right-1 h-[13.6%] bg-purple-50 border-l-4 border-purple-500 rounded px-2 py-1.5 cursor-pointer hover:shadow-lg hover:z-20 hover:scale-[1.02] transition-all">
                <p className="text-[10px] font-bold text-purple-600 mb-0.5">08:30 - 10:00</p>
                <p className="text-xs font-bold text-slate-800 leading-tight">Họp Hội Đồng Quản Trị</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-slate-400">location_on</span>
                  <span className="text-[10px] text-slate-500">Phòng VIP</span>
                </div>
              </div>
              <div className="absolute top-[63.63%] left-1 right-1 h-[18.18%] bg-blue-50 border-l-4 border-primary rounded px-2 py-1.5 cursor-pointer hover:shadow-lg hover:z-20 hover:scale-[1.02] transition-all">
                <p className="text-[10px] font-bold text-primary mb-0.5">15:00 - 17:00</p>
                <p className="text-xs font-bold text-slate-800 leading-tight">Demo sản phẩm với khách hàng</p>
                <div className="mt-2 flex -space-x-1.5">
                   {[1,2].map(i => <div key={i} className="w-5 h-5 rounded-full border border-white bg-cover" style={{backgroundImage: `url('https://i.pravatar.cc/150?u=${i+10}')`}}></div>)}
                  <div className="w-5 h-5 rounded-full border border-white bg-slate-200 text-slate-600 text-[8px] flex items-center justify-center font-bold">+2</div>
                </div>
              </div>
            </div>
            {/* Sat */}
            <div className="border-r border-slate-200 relative group hover:bg-slate-50 transition-colors bg-slate-50/30"></div>
            {/* Sun */}
            <div className="relative group hover:bg-slate-50 transition-colors bg-slate-50/30"></div>
          </div>
        </div>
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 shadow-xl hidden lg:flex">
          <div className="p-5 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-4">Lịch nhanh</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-700">Tháng 10, 2023</span>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
                  <button className="p-1 hover:bg-slate-200 rounded text-slate-500"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center gap-y-2 text-xs">
                 {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <span key={d} className="text-slate-400 font-medium">{d}</span>)}
                 {[25,26,27,28].map(d => <span key={d} className="text-slate-400 py-1">{d}</span>)}
                 <span className="text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-sm">29</span>
                 {[30,1,2,3,4,5,6,7,8].map(d => <span key={d} className="text-slate-600 py-1">{d}</span>)}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Phòng họp</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-slate-100" type="checkbox" />
                  <span className="text-sm text-slate-700 group-hover:text-primary transition-colors">Tất cả phòng</span>
                </label>
                 <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-slate-100" type="checkbox" />
                  <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-primary transition-colors">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Phòng VIP (Tầng 5)
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-slate-100" type="checkbox" />
                  <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-primary transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Phòng họp Lớn (Tầng 3)
                  </div>
                </label>
              </div>
            </div>
             <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trạng thái</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-slate-100" type="checkbox" />
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                    Đã duyệt
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input defaultChecked className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary bg-slate-100" type="checkbox" />
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[16px] text-orange-500">pending</span>
                    Chờ duyệt
                  </div>
                </label>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Calendar;