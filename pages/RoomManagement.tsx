
import React, { useState, useRef } from 'react';
import { Room, Meeting, MeetingDocument } from '../types';

interface RoomManagementProps {
  onAddMeeting: (meeting: Meeting) => void;
  meetings: Meeting[];
  rooms: Room[]; 
  onViewMeeting?: (meeting: Meeting) => void;
  isAdmin: boolean;
  onAddRoom?: (room: Room) => void;
  onUpdateRoom?: (room: Room) => void;
  onDeleteRoom?: (roomId: string) => void;
  onUpdateMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meetingId: string) => void;
}

const RoomManagement: React.FC<RoomManagementProps> = ({ 
  onAddMeeting, meetings, rooms, onViewMeeting, isAdmin, 
  onAddRoom, onUpdateRoom, onDeleteRoom, onUpdateMeeting, onDeleteMeeting 
}) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // State for Editing Meeting
  const [isEditingMeeting, setIsEditingMeeting] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const myMeetings = meetings
    .filter(m => m.host.includes('Tôi') || m.host === 'Nguyễn Văn A')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // State form đặt lịch
  const [bookingForm, setBookingForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    participants: 10,
    files: [] as File[],
    roomId: '' // Added roomId to form state for flexibility
  });

  // State form quản lý phòng
  const [roomForm, setRoomForm] = useState({
    id: '',
    name: '',
    location: '',
    capacity: '',
    area: '',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301',
    amenities: ''
  });

  const handleOpenBooking = (room: Room) => {
    if (!isAdmin) return;
    setIsEditingMeeting(false);
    setEditingMeetingId(null);
    setSelectedRoom(room);
    
    setBookingForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      participants: 10,
      files: [],
      roomId: room.id
    });
    setShowBookingModal(true);
  };

  const handleOpenAddMeetingGeneral = () => {
    if (!isAdmin) return;
    if (rooms.length === 0) return alert("Cần tạo phòng họp trước.");
    
    setIsEditingMeeting(false);
    setEditingMeetingId(null);
    setSelectedRoom(rooms[0]);

    setBookingForm({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      participants: 10,
      files: [],
      roomId: rooms[0].id
    });
    setShowBookingModal(true);
  }

  const handleOpenEditMeeting = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;

    const room = rooms.find(r => r.id === meeting.roomId);
    if (!room) return;

    setIsEditingMeeting(true);
    setEditingMeetingId(meeting.id);
    setSelectedRoom(room);

    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    setBookingForm({
      title: meeting.title,
      date: start.toISOString().split('T')[0],
      startTime: start.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
      endTime: end.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}),
      participants: meeting.participants,
      files: [], // Keep empty for edit, or we need to handle existing files logic
      roomId: meeting.roomId
    });
    setShowBookingModal(true);
  };

  const handleDeleteMeetingClick = (meetingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa cuộc họp này không?')) {
      onDeleteMeeting?.(meetingId);
    }
  };

  const handleOpenAddRoom = () => {
    setIsEditingRoom(false);
    setRoomForm({
      id: '',
      name: '',
      location: '',
      capacity: '10 - 20',
      area: '50m²',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301',
      amenities: 'Wifi, Máy chiếu, Bảng trắng'
    });
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingRoom(true);
    setRoomForm({
      id: room.id,
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      area: room.area,
      image: room.image,
      amenities: room.amenities.join(', ')
    });
    setShowRoomModal(true);
  };

  const handleDeleteRoomClick = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng họp này không? Hành động này không thể hoàn tác.')) {
      onDeleteRoom?.(roomId);
    }
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amenitiesArray = roomForm.amenities.split(',').map(item => item.trim()).filter(item => item !== '');
    
    const roomData: Room = {
      id: isEditingRoom ? roomForm.id : Math.random().toString(36).substr(2, 9),
      name: roomForm.name,
      location: roomForm.location,
      capacity: roomForm.capacity,
      area: roomForm.area,
      image: roomForm.image,
      status: 'available',
      amenities: amenitiesArray
    };

    if (isEditingRoom) {
      onUpdateRoom?.(roomData);
    } else {
      onAddRoom?.(roomData);
    }
    setShowRoomModal(false);
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

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoomId = e.target.value;
    const room = rooms.find(r => r.id === newRoomId);
    if (room) {
      setSelectedRoom(room);
      setBookingForm(prev => ({ ...prev, roomId: newRoomId }));
    }
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

    if (isEditingMeeting && editingMeetingId) {
      // Update existing meeting
      const originalMeeting = meetings.find(m => m.id === editingMeetingId);
      const updatedMeeting: Meeting = {
        id: editingMeetingId,
        title: bookingForm.title,
        startTime: `${bookingForm.date}T${bookingForm.startTime}:00`,
        endTime: `${bookingForm.date}T${bookingForm.endTime}:00`,
        roomId: bookingForm.roomId || selectedRoom.id,
        host: originalMeeting?.host || 'Nguyễn Văn A (Tôi)',
        participants: bookingForm.participants,
        status: originalMeeting?.status || 'pending',
        color: originalMeeting?.color || 'blue',
        documents: [...(originalMeeting?.documents || []), ...attachedDocs]
      };
      onUpdateMeeting?.(updatedMeeting);
    } else {
      // Create new meeting
      const newMeeting: Meeting = {
        id: Math.random().toString(36).substr(2, 9),
        title: bookingForm.title,
        startTime: `${bookingForm.date}T${bookingForm.startTime}:00`,
        endTime: `${bookingForm.date}T${bookingForm.endTime}:00`,
        roomId: bookingForm.roomId || selectedRoom.id,
        host: 'Nguyễn Văn A (Tôi)',
        participants: bookingForm.participants,
        status: 'pending',
        color: 'blue',
        documents: attachedDocs
      };
      onAddMeeting(newMeeting);
    }

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
        {isAdmin && (
          <button onClick={handleOpenAddRoom} className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-glow-blue transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add_business</span>
            Thêm phòng mới
          </button>
        )}
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
              <div key={room.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative">
                <div className="relative h-48 overflow-hidden shrink-0">
                  <img alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={room.image} />
                  <div className="absolute top-3 right-3 flex gap-2">
                     <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border ${isBusy ? 'bg-white/90 text-orange-600 border-orange-100' : 'bg-white/90 text-emerald-600 border-emerald-100'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                        {isBusy ? 'Bận' : 'Sẵn sàng'}
                     </span>
                  </div>
                  {isAdmin && (
                    <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleOpenEditRoom(room, e)} className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm backdrop-blur-md transition-all hover:text-primary">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={(e) => handleDeleteRoomClick(room.id, e)} className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm backdrop-blur-md transition-all hover:text-rose-500">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{room.name}</h3>
                    <p className="text-slate-500 text-xs flex items-center gap-1 font-medium mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {room.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl text-xs font-bold text-slate-600">
                     <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">groups</span> {room.capacity}</span>
                     <span className="w-px h-3 bg-slate-300"></span>
                     <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">crop_square</span> {room.area}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                     {room.amenities.slice(0,4).map(am => <span key={am} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{am}</span>)}
                  </div>

                  {isAdmin && (
                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-end">
                      <button 
                        onClick={() => handleOpenBooking(room)}
                        disabled={isBusy}
                        className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${isBusy ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-600 shadow-glow-blue active:scale-95'}`}
                      >
                        {isBusy ? 'Đã kín lịch' : <><span className="material-symbols-outlined text-[16px]">add</span> Đặt phòng ngay</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Your Meetings Section */}
        {(myMeetings.length > 0 || isAdmin) && (
          <div className="pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary">event_upcoming</span>
                   Lịch họp của bạn
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{myMeetings.length} phiên họp sắp tới</span>
                  {isAdmin && (
                    <button onClick={handleOpenAddMeetingGeneral} className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-700 transition-all">
                      <span className="material-symbols-outlined text-[14px]">add</span> Thêm lịch
                    </button>
                  )}
                </div>
             </div>

             <div className="flex overflow-x-auto gap-6 pb-6 snap-x custom-scrollbar">
                {myMeetings.map((meeting) => {
                   const room = rooms.find(r => r.id === meeting.roomId);
                   const isOngoing = new Date() >= new Date(meeting.startTime) && new Date() <= new Date(meeting.endTime);
                   
                   return (
                      <div key={meeting.id} className="min-w-[360px] bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group relative overflow-hidden snap-start">
                         {isAdmin && (
                           <div className="absolute top-4 right-4 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => handleOpenEditMeeting(meeting, e)} className="p-1.5 bg-slate-100 hover:bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-primary transition-all shadow-sm">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={(e) => handleDeleteMeetingClick(meeting.id, e)} className="p-1.5 bg-slate-100 hover:bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-rose-500 transition-all shadow-sm">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                           </div>
                         )}

                         <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{new Date(meeting.startTime).toLocaleDateString('vi-VN')}</span>
                            <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${isOngoing ? 'text-emerald-500' : 'text-slate-300'}`}>
                              <div className={`w-2 h-2 rounded-full ${isOngoing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                              {isOngoing ? 'Đang diễn ra' : 'Sắp tới'}
                            </div>
                         </div>

                         <h4 className="font-bold text-slate-900 text-lg line-clamp-2 leading-tight min-h-[48px] pr-8">{meeting.title}</h4>

                         <div className="flex bg-slate-50 rounded-2xl p-4 gap-4">
                            <div className="flex flex-col gap-1 flex-1">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Thời gian</span>
                               <span className="text-sm font-bold text-slate-700">{new Date(meeting.startTime).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="w-px bg-slate-200"></div>
                            <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tại phòng</span>
                               <span className="text-sm font-bold text-slate-700 truncate" title={room?.name}>{room?.name || 'Chưa xác định'}</span>
                            </div>
                         </div>

                         <button 
                            onClick={() => onViewMeeting?.(meeting)}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 mt-auto"
                         >
                            Tham gia ngay <span className="material-symbols-outlined text-[18px]">login</span>
                         </button>
                      </div>
                   )
                })}
             </div>
          </div>
        )}
      </div>

      {/* Modal Đặt lịch họp / Chỉnh sửa lịch họp */}
      {showBookingModal && selectedRoom && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">{isEditingMeeting ? 'edit_calendar' : 'add_task'}</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{isEditingMeeting ? 'Chỉnh sửa lịch họp' : 'Đặt lịch họp'}</h2>
                  <p className="text-xs text-slate-500 font-medium">{isEditingMeeting ? 'Cập nhật thông tin cuộc họp' : selectedRoom.name}</p>
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiêu đề</label>
                <input required value={bookingForm.title} onChange={e => setBookingForm({...bookingForm, title: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" placeholder="Nhập tiêu đề cuộc họp" />
              </div>

              {/* Show Room Selection only when editing or general add */}
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phòng họp</label>
                 <select 
                    value={bookingForm.roomId || selectedRoom.id} 
                    onChange={handleRoomChange}
                    className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm"
                 >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                    ))}
                 </select>
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
                <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 active:scale-95 text-sm">
                  {isEditingMeeting ? 'Cập nhật' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản lý Phòng (Giữ nguyên) */}
      {showRoomModal && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-enterprise-purple text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">{isEditingRoom ? 'edit_square' : 'add_business'}</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">{isEditingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</h2>
                  <p className="text-xs text-slate-500 font-medium">{isEditingRoom ? 'Cập nhật thông tin phòng họp' : 'Thiết lập phòng họp mới'}</p>
                </div>
              </div>
              <button onClick={() => setShowRoomModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <form onSubmit={handleRoomSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên phòng</label>
                <input required value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" placeholder="VD: Phòng Khánh Tiết" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vị trí</label>
                  <input required value={roomForm.location} onChange={e => setRoomForm({...roomForm, location: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" placeholder="VD: Tầng 1" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Diện tích</label>
                   <input required value={roomForm.area} onChange={e => setRoomForm({...roomForm, area: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" placeholder="VD: 50m²" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sức chứa</label>
                  <input required value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" placeholder="VD: 10 - 20" />
                </div>
                 <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ảnh mô tả (URL)</label>
                  <input required value={roomForm.image} onChange={e => setRoomForm({...roomForm, image: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm" placeholder="https://..." />
                </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tiện ích (Phân cách bằng dấu phẩy)</label>
                 <textarea required value={roomForm.amenities} onChange={e => setRoomForm({...roomForm, amenities: e.target.value})} className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-slate-800 text-sm h-24 resize-none" placeholder="VD: Wifi 6, Máy chiếu 4K, Bảng trắng..." />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowRoomModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-enterprise-purple text-white font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-600 active:scale-95 text-sm">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default RoomManagement;
