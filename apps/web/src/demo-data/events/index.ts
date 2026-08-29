import detail from '@/demo-data/events/detail.json';

export type EventThingIcon =
  | 'guardian'
  | 'seating'
  | 'kid-friendly'
  | 'pets'
  | 'water'
  | 'washrooms'
  | 'parking';

export interface DemoEventPerson {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface DemoEventDetail {
  id: string;
  title: string;
  bannerImage: string;
  description: string;
  location: { title: string; subtitle: string };
  schedule: { title: string; subtitle: string };
  guests: { going: number; interested: number };
  thingsToKnow: { icon: EventThingIcon; label: string }[];
  people: DemoEventPerson[];
}

export const demoEventDetail = detail as DemoEventDetail;
