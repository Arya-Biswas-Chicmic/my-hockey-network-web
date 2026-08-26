import { Button } from '@/components/common/Button';
import React from 'react';

export interface MatchItem {
  id: string;
  league: string;
  homeTeam: string;
  homeLogo?: string;
  awayTeam: string;
  awayLogo?: string;
  timeInfo: string;
}

interface MatchesWidgetProps {
  matches?: MatchItem[];
  onViewAll?: () => void;
}

const DEFAULT_MATCHES: MatchItem[] = [
  {
    id: 'm1',
    league: 'U16 AAA League',
    homeTeam: 'KC Blueknocks',
    homeLogo: '/KCBluenocks.png',
    awayTeam: 'NW Warriors',
    awayLogo: '/publicTournaments.png',
    timeInfo: 'Today • 5:00 PM'
  },
  {
    id: 'm2',
    league: 'U16 AAA League',
    homeTeam: 'NW Warriors',
    homeLogo: '/publicTournaments.png',
    awayTeam: 'KC Blueknocks',
    awayLogo: '/CoachTeam.png',
    timeInfo: 'Today • 9:00 PM'
  }
];

export const MatchesWidget: React.FC<MatchesWidgetProps> = ({
  matches = DEFAULT_MATCHES,
  onViewAll
}) => {
  return (
    <div className="mhn-sidebar-card">
      <div className="mhn-sidebar-card-header">
        <h3 className="mhn-sidebar-card-title">Matches</h3>
        <Button onClick={onViewAll} className="mhn-sidebar-view-all">
          View All
        </Button>
      </div>

      <div className="mhn-matches-list">
        {matches.map((match) => (
          <div key={match.id} className="mhn-match-card-item">
            <span className="mhn-match-league-tag">{match.league}</span>
            
            <div className="mhn-match-teams-row">
              {/* Home Team */}
              <div className="mhn-match-team">
                <img 
                  src={match.homeLogo} 
                  alt={match.homeTeam} 
                  className="mhn-match-team-logo"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="mhn-match-team-name">{match.homeTeam}</span>
              </div>

              <span className="mhn-match-vs">VS</span>

              {/* Away Team */}
              <div className="mhn-match-team">
                <span className="mhn-match-team-name">{match.awayTeam}</span>
                <img 
                  src={match.awayLogo} 
                  alt={match.awayTeam} 
                  className="mhn-match-team-logo"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div className="mhn-match-time-info">
              {match.timeInfo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
