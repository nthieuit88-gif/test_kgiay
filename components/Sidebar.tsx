
import React from 'react';
import { Page, NavItemProps } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const getPageTheme = (page: Page) => {
  switch(page) {
    case Page.DASHBOARD: return { color: 'text-enterprise-blue', bg: 'bg-enterprise-blue/10', active: 'bg-enterprise-blue', icon: 'grid_view' };
    case Page.CALENDAR: return { color: 'text-enterprise-purple', bg: 'bg-enterprise-purple/10', active: 'bg-enterprise-purple', icon: 'event_note' };
    case Page.DOCUMENTS: return { color: 'text-enterprise-orange', bg: 'bg-enterprise-orange/10', active: 'bg-enterprise-orange', icon: 'folder_open' };
    case Page.ROOMS: return { color: 'text-enterprise-emerald', bg: 'bg-enterprise-emerald/10', active: 'bg-enterprise-emerald', icon: 'meeting_room' };
    case Page.SETTINGS: return { color: 'text-slate-500', bg: 'bg-slate-100', active: 'bg-slate-800', icon: 'settings' };
    default: return { color: 'text-primary', bg: 'bg-primary/10', active: 'bg-primary', icon: 'circle' };
  }
};

const NavItem: React.FC<NavItemProps> = ({ page, currentPage, label, icon, filled, onClick, badge }) => {
  const isActive = currentPage === page;
  const theme = getPageTheme(page);

  return (
    <button
      onClick={() => onClick(page)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
        isActive
          ? `${theme.active} text-white shadow-lg shadow-${theme.active}/20`
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      )}
      
      <span className={`material-symbols-outlined transition-all duration-500 ${filled || isActive ? 'fill' : ''} 
        ${isActive ? 'scale-110' : `${theme.color} group-hover:scale-125`}`}>
        {icon}
      </span>
      
      <span className={`text-[15px] transition-all duration-300 ${isActive ? 'font-bold' : 'font-semibold group-hover:translate-x-1'}`}>
        {label}
      </span>

      {badge !== undefined && (
        <span
          className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
            isActive
              ? 'bg-white/30 text-white'
              : `${theme.bg} ${theme.color}`
          }`}
        >
          {badge}
        </span>
      )}
      
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/40 rounded-l-full"></div>
      )}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <aside className="w-72 bg-white border-r border-slate-200/60 flex flex-col justify-between shrink-0 z-30 hidden md:flex">
      <div className="flex flex-col">
        <div className="h-24 flex items-center gap-4 px-8 mb-4">
          <div className="bg-gradient-to-br from-primary to-blue-600 p-2.5 rounded-[1.25rem] text-white shadow-glow-blue rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer">
            <span className="material-symbols-outlined fill text-[28px]">layers</span>
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-slate-900 text-2xl font-black leading-tight tracking-tight">PAPERLESS</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Enterprise Hub</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1.5 px-4">
          <NavItem page={Page.DASHBOARD} currentPage={currentPage} label="Tổng quan" icon="grid_view" onClick={onNavigate} />
          <NavItem page={Page.CALENDAR} currentPage={currentPage} label="Lịch họp" icon="event_note" onClick={onNavigate} />
          <NavItem page={Page.DOCUMENTS} currentPage={currentPage} label="Tài liệu" icon="folder_open" badge={5} onClick={onNavigate} />
          <NavItem page={Page.ROOMS} currentPage={currentPage} label="Quản lý phòng" icon="meeting_room" onClick={onNavigate} />
          
          <div className="my-6 mx-4 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>
          
          <NavItem page={Page.SETTINGS} currentPage={currentPage} label="Cài đặt hệ thống" icon="settings" onClick={onNavigate} />
        </nav>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-soft-hover transition-all duration-500">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-slate-200 bg-cover bg-center shadow-inner group-hover:scale-105 transition-transform"
              style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=admin')" }}></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-white rounded-full"></div>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <p className="text-slate-900 text-[14px] font-bold truncate group-hover:text-primary transition-colors">Nguyễn Văn A</p>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Quản trị viên</p>
          </div>
          <button onClick={() => onNavigate(Page.LOGIN)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-xl">
            <span className="material-symbols-outlined text-[24px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
