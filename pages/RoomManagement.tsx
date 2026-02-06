
import React, { useState, useRef } from 'react';
import { Room, Meeting, MeetingDocument } from '../types';

interface RoomManagementProps {
  onAddMeeting: (meeting: Meeting) => void;
  meetings: Meeting[];
}

const ROOMS_DATA: Room[] = [
  {
    id: 'room-1',
    name: 'Phòng Khánh Tiết',
    location: 'Tầng 1 - Khu A',
    capacity: '20 - 30',
    area: '120m²',
    image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=2340',
    status: 'available',
    amenities: ['Micro', 'Video Conf', 'Tea break', 'Wifi 6']
  },
  {
    id: 'room-2',
    name: 'Phòng Họp 202',
    location: 'Tầng 2 - Khu B',
    capacity: '8 - 10',
    area: '45m²',
    image: 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&q=80&w=2340',
    status: 'busy',
    amenities: ['Tivi 75"', 'Bảng trắng', 'Điều hòa']
  },
  {
    id: 'room-3',
    name: 'Hội Trường A',
    location: 'Tầng 3 - Trung Tâm',
    capacity: '200+',
    area: '500m²',
    image: 'https://images.unsplash.com/photo-1544982590-0f2c42ce095d?auto=format&fit=crop&q=80&w=2340',
    status: 'available',
    amenities: ['Bục phát biểu', 'Màn hình LED', 'Âm thanh']
  }
];

const RoomManagement: React.FC<RoomManagementProps> = ({ onAddMeeting, meetings }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [bookingForm, setBookingForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    participants: 10,
    files: [] as File[]
  });

  const handleOpenBooking = (room: Room) => {
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
    if (!selectedRoom) return;

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
    alert('Đã gửi yêu cầu đặt phòng kèm tài liệu thành công!');
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
              placeholder="Tìm phòng theo tên..."
              type="text"
            />
          </div>
        </div>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Danh sách Phòng</h1>
            <p className="text-slate-500 font-medium">Chọn một phòng để xem lịch và đặt phòng ngay.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {ROOMS_DATA.map((room) => {
            const isBusy = room.status === 'busy' || meetings.some(m => m.roomId === room.id && new Date(m.startTime).toDateString() === new Date().toDateString());
            
            return (
              <div key={room.id} className="group bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={room.image} />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-sm shadow-md border ${isBusy ? 'text-orange-600 border-orange-100' : 'text-emerald-600 border-emerald-100'}`}>
                      <span className={`w-2 h-2 rounded-full ${isBusy ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></span>
                      {isBusy ? 'Đang bận' : 'Đang trống'}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{room.name}</h3>
                  <p className="text-slate-500 text-sm flex items-center gap-1 mb-4 font-medium">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {room.location}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sức chứa</span>
                      <span className="text-sm font-bold text-slate-700">{room.capacity} người</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diện tích</span>
                      <span className="text-sm font-bold text-slate-700">{room.area}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {room.amenities.map(amenity => (
                      <span key={amenity} className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleOpenBooking(room)}
                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${isBusy ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white shadow-primary/20 hover:bg-blue-600 active:scale-95'}`}
                  >
                    {isBusy ? 'Đã kín lịch hôm nay' : 'Đặt phòng ngay'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">add_task</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Đặt lịch họp</h2>
                  <p className="text-sm text-slate-500 font-medium">{selectedRoom.name}</p>
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề cuộc họp</label>
                <input 
                  required
                  value={bookingForm.title}
                  onChange={e => setBookingForm({...bookingForm, title: e.target.value})}
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 placeholder-slate-300 transition-all" 
                  placeholder="Ví dụ: Họp bàn kế hoạch Marketing Q4"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngày họp</label>
                  <input 
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={e => setBookingForm({...bookingForm, date: e.target.value})}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Số lượng người</label>
                  <input 
                    type="number"
                    required
                    value={bookingForm.participants}
                    onChange={e => setBookingForm({...bookingForm, participants: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Bắt đầu</label>
                  <input 
                    type="time"
                    required
                    value={bookingForm.startTime}
                    onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Kết thúc</label>
                  <input 
                    type="time"
                    required
                    value={bookingForm.endTime}
                    onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-slate-800 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tài liệu đính kèm (Tối đa 10 file)</label>
                  <span className="text-[10px] font-bold text-slate-400">{bookingForm.files.length}/10</span>
                </div>
                
                <div 
                  onClick={() => bookingForm.files.length < 10 && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[1.5rem] p-6 transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer
                    ${bookingForm.files.length >= 10 
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' 
                      : 'border-slate-200 hover:border-primary hover:bg-primary/5'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.docx,.xlsx,.pptx"
                  />
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${bookingForm.files.length >= 10 ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'}`}>
                    <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Nhấn để tải tài liệu lên</p>
                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ tối đa 10 tệp (PDF, Word, Excel, PPT)</p>
                  </div>
                </div>

                {bookingForm.files.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {bookingForm.files.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-slate-300 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[20px]">
                            {file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                          </span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 transition-all">Gửi yêu cầu đặt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default RoomManagement;
