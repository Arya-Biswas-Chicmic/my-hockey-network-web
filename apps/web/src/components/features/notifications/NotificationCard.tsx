import React from 'react';

export interface NotificationItemProps {
  id: string;
  avatar: string;
  senderName: string;
  text: string;
  time: string;
  isUnread?: boolean;
  onItemClick?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationItemProps> = ({
  id,
  avatar,
  senderName,
  text,
  time,
  isUnread = false,
  onItemClick
}) => {
  return (
    <div 
      onClick={() => onItemClick && onItemClick(id)}
      className={`mhn-notification-item ${isUnread ? 'mhn-notification-item-unread' : ''}`}
    >
      {/* User Avatar */}
      <div className="mhn-notification-avatar-box">
        <img 
          src={avatar} 
          alt={senderName} 
          className="mhn-notification-avatar-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/userPlaceholder.png';
          }}
        />
      </div>

      {/* Notification Text Content */}
      <div className="mhn-notification-content">
        <p className="mhn-notification-text">
          <span className="mhn-notification-sender-bold">{senderName}, </span>
          {text}
        </p>
        <span className={`mhn-notification-time ${isUnread ? 'mhn-notification-time-unread' : ''}`}>
          {time}
        </span>
      </div>

      {/* Unread Blue Indicator Dot */}
      {isUnread && (
        <div className="mhn-notification-unread-dot" aria-label="Unread notification" />
      )}
    </div>
  );
};
