import React from 'react';
import { Page, NavItemProps } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ page, currentPage, label, icon, filled, onClick, badge }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => onClick(page)}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group ${
        isActive
          ? 'bg-primary text-white shadow-lg shadow-primary/25'
          : 'text-text-secondary hover:text-primary hover:bg-slate-50'
      }`}
    >
      <span className={`material-symbols-outlined ${filled ? 'fill' : ''} ${!isActive && 'group-hover:scale-110 transition-transform'}`}>
        {icon}
      </span>
      <span className={`text-sm ${isActive ? 'font-bold' : 'font-semibold'}`}>{label}</span>
      {badge !== undefined && (
        <span
          className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-text-secondary group-hover:bg-primary/10 group-hover:text-primary'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <aside className="w-72 bg-bg-sidebar border-r border-slate-200/70 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 hidden md:flex">
      <div className="flex flex-col">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="bg-primary/10 p-2 rounded-xl text-primary shadow-sm">
            <span className="material-symbols-outlined fill text-[26px]">layers</span>
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-text-main text-lg font-extrabold leading-tight tracking-tight">Paperless</h1>
            <p className="text-text-secondary text-xs font-semibold">Enterprise Meeting</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 p-4 mt-4">
          <NavItem
            page={Page.DASHBOARD}
            currentPage={currentPage}
            label="Tổng quan"
            icon="dashboard"
            onClick={onNavigate}
          />
          <NavItem
            page={Page.CALENDAR}
            currentPage={currentPage}
            label="Lịch họp"
            icon="calendar_month"
            onClick={onNavigate}
          />
          <NavItem
            page={Page.DOCUMENTS}
            currentPage={currentPage}
            label="Tài liệu"
            icon="description"
            badge={3}
            onClick={onNavigate}
          />
          <NavItem
            page={Page.ROOMS}
            currentPage={currentPage}
            label="Quản lý phòng"
            icon="meeting_room"
            onClick={onNavigate}
          />
          <div className="my-3 border-t border-slate-100 mx-4"></div>
          <NavItem
            page={Page.SETTINGS}
            currentPage={currentPage}
            label="Cài đặt hệ thống"
            icon="settings"
            onClick={onNavigate}
          />
        </nav>
      </div>
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center shadow-sm"
              style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=admin')" }}
            ></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden text-left">
            <p className="text-text-main text-sm font-bold truncate">Nguyễn Văn A</p>
            <p className="text-text-secondary text-xs truncate">Quản trị viên</p>
          </div>
          <button onClick={() => onNavigate(Page.LOGIN)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;