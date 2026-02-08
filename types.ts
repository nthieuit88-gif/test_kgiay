
export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  ROOMS = 'ROOMS',
  DOCUMENTS = 'DOCUMENTS',
  SETTINGS = 'SETTINGS',
  MEETING_DETAIL = 'MEETING_DETAIL'
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dept: string;
  avatar: string;
}

export interface NavItemProps {
  page: Page;
  currentPage: Page;
  label: string;
  icon: string;
  filled?: boolean;
  onClick: (page: Page) => void;
  badge?: number;
  disabled?: boolean;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: string;
  area: string;
  image: string;
  status: 'available' | 'busy' | 'maintenance';
  amenities: string[];
}

export interface MeetingDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  file?: File;
  url?: string;
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  roomId: string;
  host: string;
  participants: number;
  status: 'approved' | 'pending' | 'cancelled';
  color: 'blue' | 'purple' | 'orange' | 'emerald';
  documents?: MeetingDocument[];
}
