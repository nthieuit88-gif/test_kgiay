
import React, { useState } from 'react';
import { Page, Meeting, MeetingDocument, Room } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import RoomManagement from './pages/RoomManagement';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import MeetingDetail from './pages/MeetingDetail';
import Sidebar from './components/Sidebar';

// Dữ liệu phòng dùng chung cho toàn hệ thống
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

// Helper để tạo ngày tương đối so với hôm nay
const getTodayAt = (h: number) => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}
const getDayFromNowAt = (days: number, h: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  
  // Kho tài liệu tổng hợp
  const [allDocuments, setAllDocuments] = useState<MeetingDocument[]>([
    { id: 'd1', name: 'Báo cáo Tài chính Q3.pdf', size: '2.4MB', type: 'pdf' },
    { id: 'd2', name: 'Nghị quyết Hội đồng Quản trị.docx', size: '1.1MB', type: 'docx' },
    { id: 'd3', name: 'Kế hoạch nhân sự 2024.pdf', size: '856KB', type: 'pdf' }
  ]);

  // Danh sách cuộc họp đồng bộ với thời gian thực
  const [meetings, setMeetings] = useState<Meeting[]>([
    { 
      id: '1', 
      title: 'Họp Giao Ban Tuần', 
      startTime: getTodayAt(9), 
      endTime: getTodayAt(11), 
      roomId: 'room-1', 
      host: 'Nguyễn Văn A', 
      participants: 12, 
      status: 'approved', 
      color: 'blue',
      documents: [allDocuments[0], allDocuments[1]]
    },
    { 
      id: '2', 
      title: 'Review Thiết Kế UI/UX', 
      startTime: getTodayAt(14), 
      endTime: getTodayAt(15), 
      roomId: 'room-2', 
      host: 'Phạm Minh Tuấn', 
      participants: 8, 
      status: 'approved', 
      color: 'purple',
      documents: [allDocuments[2]]
    },
    { 
      id: '3', 
      title: 'Workshop AI Enterprise', 
      startTime: getDayFromNowAt(1, 9), 
      endTime: getDayFromNowAt(1, 12), 
      roomId: 'room-3', 
      host: 'Dr. Strange', 
      participants: 50, 
      status: 'approved', 
      color: 'emerald',
      documents: []
    },
    { 
      id: '4', 
      title: 'Họp Khẩn Cấp BGD', 
      startTime: getDayFromNowAt(2, 16), 
      endTime: getDayFromNowAt(2, 17), 
      roomId: 'room-2', 
      host: 'CEO', 
      participants: 5, 
      status: 'approved', 
      color: 'orange',
      documents: []
    }
  ]);

  const addMeeting = (meeting: Meeting) => {
    setMeetings(prev => [...prev, meeting]);
    // Nếu có tài liệu mới trong meeting, thêm vào kho tổng
    if (meeting.documents) {
      setAllDocuments(prev => [...prev, ...meeting.documents!]);
    }
  };

  const updateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCurrentPage(Page.MEETING_DETAIL);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return (
          <Dashboard 
            onNavigate={setCurrentPage} 
            meetings={meetings} 
            rooms={rooms}
            documents={allDocuments}
            onViewMeeting={handleViewMeeting} 
          />
        );
      case Page.CALENDAR:
        return (
          <Calendar 
            meetings={meetings} 
            rooms={rooms}
            onAddMeeting={addMeeting} 
            onUpdateMeeting={updateMeeting} 
          />
        );
      case Page.ROOMS:
        return (
          <RoomManagement 
            onAddMeeting={addMeeting} 
            meetings={meetings} 
            rooms={rooms}
            onViewMeeting={handleViewMeeting}
          />
        );
      case Page.DOCUMENTS:
        return <Documents initialDocs={allDocuments} onUpdateDocs={setAllDocuments} />;
      case Page.SETTINGS:
        return <Settings />;
      default:
        return (
          <Dashboard 
            onNavigate={setCurrentPage} 
            meetings={meetings} 
            rooms={rooms}
            documents={allDocuments}
            onViewMeeting={handleViewMeeting} 
          />
        );
    }
  };

  if (currentPage === Page.LOGIN) {
    return <Login onLogin={() => setCurrentPage(Page.DASHBOARD)} />;
  }

  if (currentPage === Page.MEETING_DETAIL && selectedMeeting) {
    return (
      <MeetingDetail 
        meeting={selectedMeeting} 
        onBack={() => setCurrentPage(Page.DASHBOARD)} 
      />
    );
  }

  return (
    <div className="bg-[#f8fafc] text-slate-900 font-display antialiased h-screen overflow-hidden flex selection:bg-primary selection:text-white">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
