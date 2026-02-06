
import React, { useState } from 'react';
import { Page } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import RoomManagement from './pages/RoomManagement';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import MeetingDetail from './pages/MeetingDetail';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOGIN);

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard onNavigate={setCurrentPage} />;
      case Page.CALENDAR:
        return <Calendar />;
      case Page.ROOMS:
        return <RoomManagement />;
      case Page.DOCUMENTS:
        return <Documents />;
      case Page.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  if (currentPage === Page.LOGIN) {
    return <Login onLogin={() => setCurrentPage(Page.DASHBOARD)} />;
  }

  if (currentPage === Page.MEETING_DETAIL) {
    return <MeetingDetail onBack={() => setCurrentPage(Page.DASHBOARD)} />;
  }

  return (
    <div className="bg-bg-main text-text-main font-display antialiased h-screen overflow-hidden flex selection:bg-primary selection:text-white">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
};

export default App;
