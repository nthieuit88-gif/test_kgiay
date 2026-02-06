
import React, { useState, useMemo, useRef } from 'react';
import { Meeting, MeetingDocument, Room } from '../types';

interface CalendarProps {
  meetings: Meeting[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
}

type ViewMode = 'day' | 'week' | 'month';

const ROOMS_DATA: Room[] = [
  { id: 'room-1', name: 'Phòng Khánh Tiết', location: 'Tầng 1 - Khu A', capacity: '20 - 30', area: '120m²', image: '', status: 'available', amenities: [] },
  { id: 'room-2', name: 'Phòng Họp 202', location: 'Tầng 2 - Khu B', capacity: '8 - 10', area: '45m²', image: '', status: 'busy', amenities: [] },
  { id: 'room-3', name: 'Hội Trường A', location: 'Tầng 3 - Trung Tâm', capacity: '200+', area: '500m²', image: '', status: 'available', amenities: [] }
];

const Calendar: React.FC<CalendarProps> = ({ meetings, onAddMeeting, onUpdateMeeting }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [bookingForm, setBookingForm] = useState({
    title: '',
    date: currentDate.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    participants: 10,
    roomId: 'room-1',
    files: [] as File[]
  });

  // Điều hướng thời gian
  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
    setBookingForm(prev => ({ ...prev, date: newDate.toISOString().split('T')[0] }));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setBookingForm(prev => ({ ...prev, date: today.toISOString().split('T')[0] }));
  };

  const handleOpenBooking = () => {
    setBookingForm({
      title: '',
      date: currentDate.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      participants: 10,
      roomId: 'room-1',
      files: []
    });
    setShowBookingModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = [...bookingForm.files, ...newFiles].slice(0, 10);
      setBookingForm({ ...bookingForm, files: totalFiles });
      if (bookingForm.files.length + newFiles.length > 10) {
        alert("Chỉ được phép tải lên tối đa 10 tài liệu cho mỗi phiên họp.");
      }
    }
  };

  const removeFile = (index: number) => {
    setBookingForm({ ...bookingForm, files: bookingForm.files.filter((_, i) => i !== index) });
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const attachedDocs: MeetingDocument[] = bookingForm.files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
      type: f.name.split('.').pop() || 'file',
      file: f,
      url: URL.createObjectURL(f)
    }));

    const newMeeting: Meeting = {
      id: Math.random().toString(36).substr(2, 9),
      title: bookingForm.title,
      startTime: `${bookingForm.date}T${bookingForm.startTime}:00`,
      endTime: `${bookingForm.date}T${bookingForm.endTime}:00`,
      roomId: bookingForm.roomId,
      host: 'Nguyễn Văn A (Tôi)',
      participants: bookingForm.participants,
      status: 'pending',
      color: 'blue',
      documents: attachedDocs
    };

    onAddMeeting(newMeeting);
    setShowBookingModal(false);
    alert('Đã gửi yêu cầu đặt lịch thành công!');
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, meeting: Meeting) => {
    e.dataTransfer.setData('meetingId', meeting.id);
    e.dataTransfer.effectAllowed = 'move';
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('offsetY', offsetY.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const meetingId = e.dataTransfer.getData('meetingId');
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY') || '0');
    const meeting = meetings.find(m => m.id === meetingId);
    
    if (meeting && gridContainerRef.current) {
      const rect = gridContainerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top - offsetY;
      const totalMinutes = (relativeY / 100) * 60;
      const hoursFromSeven = Math.floor(totalMinutes / 60);
      const remainingMinutes = Math.round((totalMinutes % 60) / 15) * 15;
      const newStartHour = 7 + hoursFromSeven;
      const newStartMin = remainingMinutes;
      if (newStartHour < 7 || newStartHour > 20) return;
      const oldStart = new Date(meeting.startTime);
      const oldEnd = new Date(meeting.endTime);
      const durationMs = oldEnd.getTime() - oldStart.getTime();
      const newStart = new Date(oldStart);
      newStart.setHours(newStartHour, newStartMin, 0, 0);
      const newEnd = new Date(newStart.getTime() + durationMs);
      onUpdateMeeting({
        ...meeting,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString()
      });
    }
  };

  const headerLabel = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    }
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    }
    return `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
  }, [currentDate, viewMode]);

  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const mDate = new Date(m.startTime);
      return mDate.getDate() === currentDate.getDate() &&
             mDate.getMonth() === currentDate.getMonth() &&
             mDate.getFullYear() === currentDate.getFullYear();
    });
  }, [meetings, currentDate]);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push({ day: null, currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        currentMonth: true, 
        isToday: i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
        isSelected: i === currentDate.getDate()
      });
    }
    return days;
  }, [currentDate]);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#f8fafc] page-transition">
      <header className="shrink-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined fill text-[24px]">calendar_month</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Lịch trình</h2>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'day' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ngày</button>
            <button onClick={() => setViewMode('month')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tháng</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => navigateDate(-1)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><span className="material-symbols-outlined">chevron_left</span></button>
            <button onClick={goToToday} className="px-3 py-1 text-xs font-bold text-slate-600 hover:text-primary transition-colors border-x border-slate-100">Hôm nay</button>
            <button onClick={() => navigateDate(1)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
          <button onClick={handleOpenBooking} className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-glow-blue transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Đặt lịch
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800 capitalize">{headerLabel}</h3>
            {viewMode === 'day' && <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{filteredMeetings.length} cuộc họp</span>}
          </div>
          <div className="flex-1 overflow-y-auto relative custom-scrollbar">
            {viewMode === 'day' ? (
              <div className="grid grid-cols-[100px_1fr] min-h-[1400px]">
                <div className="border-r border-slate-100 bg-slate-50/30">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="h-[100px] border-b border-slate-50 p-4 text-right">
                      <span className="text-xs font-black text-slate-400">{i + 7}:00</span>
                    </div>
                  ))}
                </div>
                <div ref={gridContainerRef} onDragOver={handleDragOver} onDrop={handleDrop} className="relative p-4 pattern-grid transition-colors duration-200">
                  {filteredMeetings.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 opacity-60">
                      <span className="material-symbols-outlined text-6xl mb-2">event_busy</span>
                      <p className="font-bold">Không có lịch trình cho ngày này</p>
                    </div>
                  ) : (
                    filteredMeetings.map((meeting) => {
                      const start = new Date(meeting.startTime);
                      const end = new Date(meeting.endTime);
                      const top = (start.getHours() - 7) * 100 + (start.getMinutes() / 60) * 100;
                      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                      const height = duration * 100;
                      return (
                        <div key={meeting.id} draggable onDragStart={(e) => handleDragStart(e, meeting)} className={`absolute left-6 right-6 rounded-2xl border-l-[6px] shadow-soft p-5 cursor-move transition-all hover:shadow-xl hover:z-10 group ${meeting.color === 'blue' ? 'bg-blue-50 border-blue-500 text-blue-700' : meeting.color === 'purple' ? 'bg-purple-50 border-purple-500 text-purple-700' : meeting.color === 'orange' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-emerald-50 border-emerald-500 text-emerald-700'}`} style={{ top: `${top}px`, height: `${height}px`, minHeight: '80px' }}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-[14px] opacity-70">schedule</span>
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-80">{start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <h4 className="font-extrabold text-slate-800 text-lg leading-tight group-hover:text-primary transition-colors">{meeting.title}</h4>
                            </div>
                            <div className="flex -space-x-2">
                               {[1,2,3].map(i => <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 bg-cover" style={{backgroundImage: `url('https://i.pravatar.cc/100?u=${meeting.id}${i}')`}}></div>)}
                               <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+{meeting.participants - 3}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-bold opacity-70 mt-auto">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">meeting_room</span> {ROOMS_DATA.find(r => r.id === meeting.roomId)?.name || meeting.roomId}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> {meeting.host}</span>
                          </div>
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                            <span className="material-symbols-outlined text-sm">drag_pan</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 h-full">
                <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-soft">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <div key={day} className="bg-slate-50/80 p-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">{day}</div>)}
                  {monthDays.map((date, i) => {
                    const meetingsOnDay = meetings.filter(m => {
                      const mDate = new Date(m.startTime);
                      return mDate.getDate() === date.day && mDate.getMonth() === currentDate.getMonth() && mDate.getFullYear() === currentDate.getFullYear();
                    });
                    return (
                      <div key={i} onClick={() => { if (date.day) { const newDate = new Date(currentDate); newDate.setDate(date.day); setCurrentDate(newDate); setViewMode('day'); } }} className={`bg-white min-h-[140px] p-4 transition-all border-b border-r border-slate-100 flex flex-col gap-2 ${date.currentMonth ? 'hover:bg-blue-50/50 cursor-pointer' : 'bg-slate-50/30'} ${date.isSelected && date.currentMonth ? 'ring-2 ring-primary ring-inset z-10' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-black ${date.currentMonth ? (date.isToday ? 'bg-primary text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-glow-blue' : 'text-slate-800') : 'text-slate-200'}`}>{date.day}</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                          {meetingsOnDay.slice(0, 3).map(m => <div key={m.id} className={`px-2 py-1 rounded-md text-[10px] font-bold truncate ${m.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{m.title}</div>)}
                          {meetingsOnDay.length > 3 && <span className="text-[9px] font-black text-slate-400 ml-1">+{meetingsOnDay.length - 3} cuộc họp khác</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {viewMode === 'day' && (
          <aside className="w-80 border-l border-slate-100 bg-white/50 backdrop-blur-sm p-6 hidden xl:flex flex-col gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Tóm tắt ngày</h4>
              <div className="grid grid-cols-1 gap-3">
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                    <p className="text-xs font-bold text-slate-400 mb-1">Tổng thời gian họp</p>
                    <p className="text-xl font-black text-slate-800">4.5 Giờ</p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft">
                    <p className="text-xs font-bold text-slate-400 mb-1">Đại biểu tham dự</p>
                    <p className="text-xl font-black text-slate-800">28 Người</p>
                 </div>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Phòng họp bận</h4>
              <div className="space-y-2">
                 {ROOMS_DATA.map(room => (
                   <div key={room.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                     <span className="text-xs font-bold text-slate-600">{room.name}</span>
                     <span className={`w-2 h-2 rounded-full ${meetings.some(m => m.roomId === room.id && new Date(m.startTime).getDate() === currentDate.getDate()) ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                   </div>
                 ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">add_task</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Đặt lịch mới</h2>
                  <p className="text-sm text-slate-500 font-medium">Lên kế hoạch họp cho tổ chức</p>
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề cuộc họp</label>
                <input required value={bookingForm.title} onChange={e => setBookingForm({...bookingForm, title: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 placeholder-slate-300 transition-all" placeholder="Ví dụ: Họp giao ban đầu tuần" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày họp</label>
                  <input type="date" required value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Chọn phòng họp</label>
                  <select value={bookingForm.roomId} onChange={e => setBookingForm({...bookingForm, roomId: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all">
                    {ROOMS_DATA.map(r => <option key={r.id} value={r.id}>{r.name} ({r.location})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Bắt đầu</label>
                  <input type="time" required value={bookingForm.startTime} onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kết thúc</label>
                  <input type="time" required value={bookingForm.endTime} onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tài liệu đính kèm (Tối đa 10 file)</label>
                  <span className="text-[10px] font-bold text-slate-400">{bookingForm.files.length}/10</span>
                </div>
                <div onClick={() => bookingForm.files.length < 10 && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[1.5rem] p-6 transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer ${bookingForm.files.length >= 10 ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : 'border-slate-200 hover:border-primary hover:bg-primary/5'}`}>
                  <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.xlsx,.pptx" />
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${bookingForm.files.length >= 10 ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'}`}><span className="material-symbols-outlined text-[28px]">cloud_upload</span></div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Tải tài liệu lên</p>
                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ tối đa 10 tệp (PDF, Word, Excel, PPT)</p>
                  </div>
                </div>
                {bookingForm.files.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {bookingForm.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-slate-300 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[20px]">{file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}</span></div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={() => removeFile(idx)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all">Xác nhận đặt lịch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Calendar;
