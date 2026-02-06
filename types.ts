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