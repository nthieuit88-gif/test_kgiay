
import React, { useState, useEffect } from 'react';
import { Page, Meeting, MeetingDocument, Room, User } from './types';
import { supabase } from './lib/supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import RoomManagement from './pages/RoomManagement';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import MeetingDetail from './pages/MeetingDetail';
import Sidebar from './components/Sidebar';

const INITIAL_ROOMS: Room[] = [
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
  }
];

const getTodayAt = (h: number) => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [allDocuments, setAllDocuments] = useState<MeetingDocument[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: meetingsData } = await supabase.from('meetings').select('*, documents (*)');
      if (meetingsData) {
        setMeetings(meetingsData.map((m: any) => ({
          id: m.id,
          title: m.title,
          startTime: m.start_time,
          endTime: m.end_time,
          roomId: m.room_id,
          host: m.host,
          participants: m.participants,
          status: m.status,
          color: m.color,
          documents: m.documents || []
        })));
      }

      const { data: docsData } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (docsData) setAllDocuments(docsData);
    };
    fetchData();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage(Page.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage(Page.LOGIN);
  };

  const handleAddRoom = (newRoom: Room) => {
    setRooms([...rooms, newRoom]);
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const handleAddMeeting = (meeting: Meeting) => {
    setMeetings([...meetings, meeting]);
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(meetings.filter(m => m.id !== meetingId));
  };

  const renderPage = () => {
    if (!currentUser) return null;
    const isAdmin = currentUser.role === 'ADMIN';

    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard onNavigate={setCurrentPage} meetings={meetings} rooms={rooms} documents={allDocuments} onViewMeeting={(m) => { setSelectedMeeting(m); setCurrentPage(Page.MEETING_DETAIL); }} isAdmin={isAdmin} />;
      case Page.CALENDAR:
        return <Calendar meetings={meetings} rooms={rooms} onAddMeeting={handleAddMeeting} onUpdateMeeting={handleUpdateMeeting} isAdmin={isAdmin} />;
      case Page.ROOMS:
        return <RoomManagement 
          meetings={meetings} 
          rooms={rooms} 
          onAddMeeting={handleAddMeeting}
          onUpdateMeeting={handleUpdateMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onViewMeeting={(m) => { setSelectedMeeting(m); setCurrentPage(Page.MEETING_DETAIL); }} 
          isAdmin={isAdmin}
          onAddRoom={handleAddRoom}
          onUpdateRoom={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
        />;
      case Page.DOCUMENTS:
        return <Documents initialDocs={allDocuments} onUpdateDocs={setAllDocuments} isAdmin={isAdmin} />;
      case Page.SETTINGS:
        return <Settings user={currentUser} isAdmin={isAdmin} />;
      default:
        return null;
    }
  };

  if (currentPage === Page.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPage === Page.MEETING_DETAIL && selectedMeeting) {
    return <MeetingDetail meeting={selectedMeeting} onUpdateMeeting={handleUpdateMeeting} onBack={() => setCurrentPage(Page.DASHBOARD)} isAdmin={currentUser?.role === 'ADMIN'} />;
  }

  return (
    <div className="bg-[#f8fafc] text-slate-900 font-display antialiased h-screen overflow-hidden flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
