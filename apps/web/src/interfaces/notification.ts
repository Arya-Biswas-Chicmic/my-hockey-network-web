export type NotificationCategory = 'GUARDIAN' | 'CONNECTION' | 'LIKE' | 'COMMENT' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  senderAvatar?: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  unreadCount: number;
}
