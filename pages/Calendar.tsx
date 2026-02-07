
import React, { useState, useMemo, useRef } from 'react';
import { Meeting, MeetingDocument, Room } from '../types';

interface CalendarProps {
  meetings: Meeting[];
  rooms: Room[]; // Nhận rooms từ props
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
}

const Calendar: React.FC<CalendarProps> = ({ meetings, rooms, onAddMeeting, onUpdateMeeting }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bookingForm, setBookingForm] = useState({
    title: '',
    date: currentDate.toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    participants: 10,
    roomId: rooms[0]?.id || 'room-1', // Sử dụng phòng đầu tiên làm mặc định
    color: 'blue' as 'blue' | 'purple' | 'orange' | 'emerald',
    files: [] as File[]
  });

  // Điều hướng thời gian (Chỉ theo tháng)
  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
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
      roomId: rooms[0]?.id || 'room-1',
      color: 'blue',
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
      color: bookingForm.color,
      documents: attachedDocs
    };

    onAddMeeting(newMeeting);
    setShowBookingModal(false);
    alert('Đã gửi yêu cầu đặt lịch thành công!');
  };

  const headerLabel = useMemo(() => {
    return `Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`;
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    // Tính toán ngày bắt đầu (Thứ 2 là đầu tuần)
    // getDay(): 0 là CN, 1 là T2...
    // Nếu là CN (0) -> offset 6 ngày trống
    // Nếu là T2 (1) -> offset 0 ngày trống
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) {
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
          {/* Đã loại bỏ nút chuyển đổi Day/Month */}
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
          </div>
          <div className="flex-1 overflow-y-auto relative custom-scrollbar">
            {/* Chế độ xem Tháng (Month View) duy nhất */}
            <div className="p-8 h-full min-h-[800px]">
              <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-soft h-full">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <div key={day} className="bg-slate-50/80 p-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest">{day}</div>)}
                {monthDays.map((date, i) => {
                  const meetingsOnDay = meetings.filter(m => {
                    const mDate = new Date(m.startTime);
                    return date.day && mDate.getDate() === date.day && mDate.getMonth() === currentDate.getMonth() && mDate.getFullYear() === currentDate.getFullYear();
                  });
                  return (
                    <div 
                      key={i} 
                      className={`bg-white min-h-[140px] p-4 transition-all border-b border-r border-slate-100 flex flex-col gap-2 relative group
                        ${date.currentMonth ? 'hover:bg-blue-50/30' : 'bg-slate-50/30'} 
                        ${date.isToday ? 'bg-blue-50/10' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-black w-8 h-8 flex items-center justify-center rounded-lg transition-all ${date.isToday ? 'bg-primary text-white shadow-glow-blue' : (date.currentMonth ? 'text-slate-700' : 'text-slate-200')}`}>
                          {date.day}
                        </span>
                      </div>
                      
                      {date.currentMonth && date.day && (
                        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden mt-1">
                          {meetingsOnDay.slice(0, 4).map(m => (
                            <div key={m.id} className={`px-2 py-1.5 rounded-lg border flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer ${m.color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-700' : m.color === 'purple' ? 'bg-purple-50 border-purple-100 text-purple-700' : m.color === 'orange' ? 'bg-orange-50 border-orange-100 text-orange-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                               <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.color === 'blue' ? 'bg-blue-500' : m.color === 'purple' ? 'bg-purple-500' : m.color === 'orange' ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                               <span className="text-[11px] font-bold truncate">{new Date(m.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} {m.title}</span>
                            </div>
                          ))}
                          {meetingsOnDay.length > 4 && (
                            <span className="text-[10px] font-black text-slate-400 pl-1 hover:text-primary cursor-pointer">+{meetingsOnDay.length - 4} cuộc họp khác</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.location})</option>)}
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

              {/* Color Picker Section */}
              <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nhãn màu ghi chú</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'blue', bg: 'bg-blue-500', label: 'Xanh dương' },
                      { id: 'purple', bg: 'bg-purple-500', label: 'Tím' },
                      { id: 'orange', bg: 'bg-orange-500', label: 'Cam' },
                      { id: 'emerald', bg: 'bg-emerald-500', label: 'Lục' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setBookingForm({...bookingForm, color: c.id as any})}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${bookingForm.color === c.id ? 'ring-2 ring-offset-2 ring-slate-300 scale-110 shadow-lg' : 'hover:scale-105 opacity-70 hover:opacity-100'} ${c.bg}`}
                        title={c.label}
                      >
                        {bookingForm.color === c.id && <span className="material-symbols-outlined text-white text-xl">check</span>}
                      </button>
                    ))}
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
