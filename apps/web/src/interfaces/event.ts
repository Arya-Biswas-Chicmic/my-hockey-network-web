export interface EventItem {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  timeString?: string;
  location?: string;
  teamHome?: string;
  teamAway?: string;
  scoreHome?: number;
  scoreAway?: number;
  type: 'MATCH' | 'PRACTICE' | 'TOURNAMENT' | 'MEETING';
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface ScheduleMatchItem {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  dateTime: string;
  venue: string;
  isLive?: boolean;
}
