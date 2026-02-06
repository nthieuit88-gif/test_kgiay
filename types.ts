
export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  ROOMS = 'ROOMS',
  DOCUMENTS = 'DOCUMENTS',
  SETTINGS = 'SETTINGS',
  MEETING_DETAIL = 'MEETING_DETAIL'
}

export interface NavItemProps {
  page: Page;
  currentPage: Page;
  label: string;
  icon: string;
  filled?: boolean;
  onClick: (page: Page) => void;
  badge?: number;
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
  file?: File; // File object thực tế
  url?: string; // Blob URL để preview
}

export interface Meeting {
  id: string;
  title: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  roomId: string;
  host: string;
  participants: number;
  status: 'approved' | 'pending' | 'cancelled';
  color: 'blue' | 'purple' | 'orange' | 'emerald';
  documents?: MeetingDocument[];
}
