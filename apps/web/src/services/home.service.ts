import { FollowSuggestionUser, UpcomingEvent } from '@/types/home.types';

export class HomeService {
  static async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    // Future API endpoint connection point for upcoming events
    return [
      {
        id: 'e1',
        month: 'MAY',
        day: '27',
        title: 'Team Practice',
        time: '5:00 PM - 7:00 PM',
        location: 'Toronto',
      },
    ];
  }

  static async getFollowSuggestions(): Promise<FollowSuggestionUser[]> {
    // Shared via existing useWhoToFollow hook & API Client
    return [];
  }
}
