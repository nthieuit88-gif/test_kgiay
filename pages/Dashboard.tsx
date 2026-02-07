
import React from 'react';
import { Page, Meeting, Room, MeetingDocument } from '../types';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
    onNavigate: (page: Page) => void;
    meetings: Meeting[];
    rooms: Room[];
    documents: MeetingDocument[];
    onViewMeeting?: (meeting: Meeting) => void;
}

const data = [
  { name: 'Thứ 2', meetings: 4, hours: 8 },
  { name: 'Thứ 3', meetings: 7, hours: 14 },
  { name: 'Thứ 4', meetings: 5, hours: 10 },
  { name: 'Thứ 5', meetings: 8, hours: 16 },
  { name: 'Thứ 6', meetings: 6, hours: 12 },
  { name: 'Thứ 7', meetings: 2, hours: 4 },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, meetings, rooms, documents, onViewMeeting }) => {
  // Tính toán số liệu thực tế
  const busyRoomsCount = rooms.filter(r => r.status === 'busy').length;
  
  return (
    <main className="flex-1 overflow-y-auto bg-[#f8fafc] page-transition">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl px-8 py-5 flex items-center justify-between border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-4 w-1/3">
          <div className="relative w-full max-w-sm group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input className="w-full bg-slate-100/50 border border-slate-200 text-sm rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all" placeholder="Tìm cuộc họp, tài liệu..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-2xl hover:bg-white hover:shadow-soft transition-all cursor-pointer">
             <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">AD</div>
             <span className="text-xs font-bold text-slate-700">Enterprise Admin</span>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Xin chào, Quản trị viên!</h1>
            <p className="text-slate-500 font-medium">Hôm nay hệ thống ghi nhận <span className="text-primary font-bold">{meetings.length} cuộc họp</span> trong kế hoạch.</p>
          </div>
          <button onClick={() => onNavigate(Page.CALENDAR)} className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-glow-blue hover:-translate-y-1 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span> Đặt lịch họp mới
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => onNavigate(Page.CALENDAR)} className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-500 animate-fade-in-up cursor-pointer">
            <div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl card-gradient-blue text-white flex items-center justify-center shadow-glow-blue"><span className="material-symbols-outlined text-[28px] fill">event_available</span></div><div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng cuộc họp</p><h3 className="text-3xl font-black text-slate-800">{meetings.length}</h3></div></div>
            <div className="text-xs font-bold text-emerald-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">trending_up</span> Đang diễn ra</div>
          </div>
          <div onClick={() => onNavigate(Page.ROOMS)} className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-500 animate-fade-in-up cursor-pointer">
            <div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl card-gradient-purple text-white flex items-center justify-center shadow-glow-purple"><span className="material-symbols-outlined text-[28px] fill">meeting_room</span></div><div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái phòng</p><h3 className="text-3xl font-black text-slate-800">{busyRoomsCount} / {rooms.length}</h3></div></div>
            <div className="text-xs font-bold text-slate-500">Phòng đang bận</div>
          </div>
          <div onClick={() => onNavigate(Page.DOCUMENTS)} className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-500 animate-fade-in-up cursor-pointer">
            <div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl card-gradient-orange text-white flex items-center justify-center shadow-glow-orange"><span className="material-symbols-outlined text-[28px] fill">folder_shared</span></div><div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng tài liệu</p><h3 className="text-3xl font-black text-slate-800">{documents.length}</h3></div></div>
            <div className="text-xs font-bold text-orange-500">Đã đồng bộ</div>
          </div>
          <div className="group relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-soft hover:shadow-soft-hover transition-all duration-500 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl card-gradient-emerald text-white flex items-center justify-center shadow-glow-emerald"><span className="material-symbols-outlined text-[28px] fill">schedule</span></div><div className="flex flex-col"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hiệu suất</p><h3 className="text-3xl font-black text-slate-800">94%</h3></div></div>
            <div className="text-xs font-bold text-emerald-500">Tối ưu xuất sắc</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-soft p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8"><div><h3 className="text-xl font-bold text-slate-800">Phân tích tần suất</h3><p className="text-sm text-slate-400 font-medium">Thống kê hoạt động hệ thống</p></div></div>
            <div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#137fec" stopOpacity={0.1}/><stop offset="95%" stopColor="#137fec" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} /><Tooltip /><Area type="monotone" dataKey="meetings" stroke="#137fec" strokeWidth={3} fill="url(#colorMeetings)" /></AreaChart></ResponsiveContainer></div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-soft p-8 animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Cuộc họp sắp tới</h3>
            <div className="space-y-4">
               {meetings.slice(0, 4).map((meeting) => (
                 <div key={meeting.id} onClick={() => onViewMeeting?.(meeting)} className="group flex flex-col gap-3 p-5 rounded-[1.75rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-soft-hover transition-all cursor-pointer relative overflow-hidden">
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-enterprise-${meeting.color || 'blue'}`}></div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col gap-0.5"><h4 className="font-bold text-slate-800 text-[15px] truncate group-hover:text-primary transition-colors">{meeting.title}</h4><span className="text-[11px] font-bold text-slate-400">{new Date(meeting.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} • {rooms.find(r => r.id === meeting.roomId)?.name || meeting.roomId}</span></div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary">chevron_right</span>
                    </div>
                 </div>
               ))}
            </div>
            <button onClick={() => onNavigate(Page.CALENDAR)} className="w-full mt-6 py-4 rounded-2xl text-[13px] font-black text-slate-500 hover:bg-slate-100 border border-dashed border-slate-200">Xem toàn bộ lịch trình</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
