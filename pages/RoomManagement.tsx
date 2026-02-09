
import React, { useState, useRef } from 'react';
import { Room, Meeting, MeetingDocument } from '../types';

interface RoomManagementProps {
  onAddMeeting: (meeting: Meeting) => void;
  meetings: Meeting[];
  rooms: Room[]; 
  onViewMeeting?: (meeting: Meeting) => void;
  isAdmin: boolean;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ onAddMeeting, meetings, rooms, onViewMeeting, isAdmin }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const myMeetings = meetings
    .filter(m => m.host.includes('Tôi') || m.host === 'Nguyễn Văn A')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const [bookingForm, setBookingForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    participants: 10,
    files: [] as File[]
  });

  const handleOpenBooking = (room: Room) => {
    if (!isAdmin) return;
    setSelectedRoom(room);
    setBookingForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      participants: 10,
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
    setBookingForm({
      ...bookingForm,
      files: bookingForm.files.filter((_, i) => i !== index)
    });
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !isAdmin) return;

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
      roomId: selectedRoom.id,
      host: 'Nguyễn Văn A (Tôi)',
      participants: bookingForm.participants,
      status: 'pending',
      color: 'blue',
      documents: attachedDocs
    };

    onAddMeeting(newMeeting);
    setShowBookingModal(false);
  };

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#f8fafc] page-transition font-display">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 w-1/3">
          <h2 className="text-xl font-bold text-slate-800 whitespace-nowrap">Quản lý Phòng họp</h2>
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Tìm phòng..."
              type="text"
            />
          </div>
        </div>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Danh sách Phòng</h1>
          <p className="text-slate-500 font-medium">Lựa chọn phòng họp phù hợp với nhu cầu của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isBusy = room.status === 'busy' || meetings.some(m => m.roomId === room.id && new Date(m.startTime).toDateString() === new Date().toDateString());
            
            return (
              <div key={room.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                <div className="relative h-40 overflow-hidden shrink-0">
                  <img alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={room.image} />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border ${isBusy ? 'bg-white/90 text-orange-600 border-orange-100' : 'bg-white/90 text-emerald-600 border-emerald-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                      {isBusy ? 'Bận' : 'Sẵn sàng'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{room.name}</h3>
                    <p className="text-slate-500 text-xs flex items-center gap-1 font-medium mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {room.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg text-xs font-bold text-slate-600">
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">groups</span> {room.capacity}</span>
                     <span className="w-px h-3 bg-slate-300"></span>
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">crop_square</span> {room.area}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                     {room.amenities.slice(0,3).map(am => <span key={am} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{am}</span>)}
                  </div>

                  {isAdmin && (
                    <div className="mt-auto pt-3 border-t border-slate-50 flex justify-end">
                      <button 
                        onClick={() => handleOpenBooking(room)}
                        disabled={isBusy}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${isBusy ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-600 shadow-glow-blue active:scale-95'}`}
                      >
                        {isBusy ? 'Đã kín' : <><span className="material-symbols-outlined text-[16px]">add</span> Đặt phòng</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {myMeetings.length > 0 && (
          <div className="pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary">event_upcoming</span>
                   Lịch họp của bạn
                </h3>
                <span className="text-xs font-bold text-slate-400">{myMeetings.length} phiên họp sắp tới</span>
             </div>

             <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
                {myMeetings.map((meeting) => {
                   const room = rooms.find(r => r.id === meeting.roomId);
                   const isOngoing = new Date() >= new Date(meeting.startTime) && new Date() <= new Date(meeting.endTime);
                   
                   return (
                      <div key={meeting.id} className="min-w-[340px] bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group relative overflow-hidden snap-start">
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400">{new Date(meeting.startTime).toLocaleDateString('en-GB')}</span>
                            <div className={`w-2 h-2 rounded-full ${isOngoing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`}></div>
                         </div>

                         <h4 className="font-bold text-slate-900 text-base line-clamp-1">{meeting.title}</h4>

                         <div className="flex bg-slate-50 rounded-xl p-3 gap-4">
                            <div className="flex flex-col gap-1 flex-1">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thời gian</span>
                               <span className="text-sm font-bold text-slate-700">{new Date(meeting.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phòng</span>
                               <span className="text-sm font-bold text-slate-700 truncate">{room?.name}</span>
                            </div>
                         </div>

                         <button 
                            onClick={() => onViewMeeting?.(meeting)}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95"
                         >
                            Tham gia ngay <span className="material-symbols-outlined text-[16px]">login</span>
                         </button>
                      </div>
                   )
                })}
             </div>
          </div>
        )}
      </div>

      {showBookingModal && selectedRoom && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">add_task</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Đặt lịch họp</h2>
                  <p className="text-xs text-slate-500 font-medium">{selectedRoom.name}</p>
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề</label>
                <input required value={bookingForm.title} onChange={e => setBookingForm({...bookingForm, title: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" placeholder="Nhập tiêu đề cuộc họp" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày</label>
                  <input type="date" required value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Số người</label>
                   <input type="number" required value={bookingForm.participants} onChange={e => setBookingForm({...bookingForm, participants: parseInt(e.target.value)})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bắt đầu</label>
                  <input type="time" required value={bookingForm.startTime} onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kết thúc</label>
                  <input type="time" required value={bookingForm.endTime} onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tài liệu</label>
                  <span className="text-[10px] font-bold text-slate-400">{bookingForm.files.length}/10</span>
                </div>
                <div onClick={() => bookingForm.files.length < 10 && fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 rounded-xl p-4 cursor-pointer flex flex-col items-center gap-1 transition-all">
                   <span className="material-symbols-outlined text-slate-400">cloud_upload</span>
                   <span className="text-xs font-bold text-slate-500">Tải lên (PDF, Docx)</span>
                   <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.xlsx,.pptx" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 text-sm">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default RoomManagement;
