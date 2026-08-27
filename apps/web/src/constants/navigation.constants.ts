import { ComponentType } from 'react';
import {
  SidebarHomeIcon,
  SidebarMessagingIcon,
  SidebarExploreIcon,
  SidebarEventsIcon,
  SidebarGroupsIcon,
  SidebarTeamsIcon,
  SidebarNotificationsIcon,
  SidebarSavedIcon,
  SidebarProfileIcon,
} from '@/components/icons/SidebarIcons';
import {
  Bell,
  Bookmark,
  CalendarCheck2,
  Home,
  MessageSquare,
  MessagesSquare,
  Search,
  Shield,
  User,
} from 'lucide-react';

export interface NavigationItemConfig {
  id: string;
  label: string;
  ActiveIcon: ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  InactiveIcon: ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  route: string;
}

export const NAVIGATION_ITEMS: readonly NavigationItemConfig[] = [
  { id: 'home', label: 'Home', ActiveIcon: SidebarHomeIcon, InactiveIcon: Home, route: '/home' },
  { id: 'messaging', label: 'Messaging', ActiveIcon: SidebarMessagingIcon, InactiveIcon: MessageSquare, route: '/messaging' },
  { id: 'explore', label: 'Explore', ActiveIcon: SidebarExploreIcon, InactiveIcon: Search, route: '/explore' },
  { id: 'events', label: 'Events', ActiveIcon: SidebarEventsIcon, InactiveIcon: CalendarCheck2, route: '/events' },
  { id: 'groups', label: 'Groups', ActiveIcon: SidebarGroupsIcon, InactiveIcon: MessagesSquare, route: '/groups' },
  { id: 'teams', label: 'Teams', ActiveIcon: SidebarTeamsIcon, InactiveIcon: Shield, route: '/teams' },
  { id: 'notifications', label: 'Notifications', ActiveIcon: SidebarNotificationsIcon, InactiveIcon: Bell, route: '/notifications' },
  { id: 'saved', label: 'Saved', ActiveIcon: SidebarSavedIcon, InactiveIcon: Bookmark, route: '/saved' },
  { id: 'profile', label: 'Profile', ActiveIcon: SidebarProfileIcon, InactiveIcon: User, route: '/profile' },
] as const;
