import { Button } from '../../common/Button';
import React, { useState } from 'react';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

interface CalendarViewProps {
  onEventClick?: (eventId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onEventClick }) => {
  // Current calendar view date state (Default: January 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(0); // 0 = Jan
  const [selectedDay, setSelectedDay] = useState<number>(13);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthFullNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Events list for the selected day (matching Image 2 design)
  const selectedDayEvents: EventItem[] = [
    {
      id: 'ce1',
      title: 'U17 Regional Playoff vs.Thunder',
      date: `${monthFullNames[currentMonth]} ${selectedDay}, ${currentYear}`,
      time: '5:00 PM - 7:00 PM',
      location: 'Princess Auto Stadium – Winnipeg,...'
    },
    {
      id: 'ce2',
      title: 'NHL All-Star Game',
      date: `${monthFullNames[currentMonth]} ${selectedDay}, ${currentYear}`,
      time: '5:00 PM - 7:00 PM',
      location: 'United Center – Chicago, Illinois'
    },
    {
      id: 'ce3',
      title: "Winter Olympics Men's Ice Hockey",
      date: `${monthFullNames[currentMonth]} ${selectedDay}, ${currentYear}`,
      time: '5:00 PM - 7:00 PM',
      location: 'Beijing, China'
    },
    {
      id: 'ce4',
      title: 'Stanley Cup Finals Game 1',
      date: `${monthFullNames[currentMonth]} ${selectedDay}, ${currentYear}`,
      time: '5:00 PM - 7:00 PM',
      location: 'TBD – TBD'
    }
  ];

  // Map of days with event indicator dots (Matching Image 2 design)
  // Dots color arrays: 'blue' (#3B82F6), 'yellow' (#F59E0B), 'red' (#EF4444), 'gray' (#334155)
  const dayDotsMap: Record<number, string[]> = {
    1: ['#3B82F6', '#F59E0B', '#EF4444'],
    3: ['#3B82F6'],
    5: ['#3B82F6', '#F59E0B'],
    7: ['#3B82F6', '#F59E0B'],
    9: ['#3B82F6', '#F59E0B'],
    11: ['#3B82F6', '#F59E0B'],
    13: ['#3B82F6', '#F59E0B', '#EF4444', '#334155'],
    17: ['#3B82F6', '#F59E0B', '#EF4444', '#334155'],
    19: ['#3B82F6', '#F59E0B', '#EF4444', '#334155'],
    23: ['#3B82F6', '#F59E0B', '#EF4444', '#334155'],
    27: ['#3B82F6', '#F59E0B', '#EF4444', '#334155'],
    31: ['#3B82F6', '#F59E0B', '#EF4444', '#334155']
  };

  const prevMonthDotsMap: Record<number, string[]> = {
    29: ['#3B82F6']
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Days matrix for January 2026 (5 weeks x 7 days)
  // Mon Dec 29, 30, 31 (Prev month)
  // Thu Jan 1 to Jan 31 (Current month)
  // Sun Feb 1 (Next month)
  const calendarCells = [
    // Week 1
    { day: 29, isCurrentMonth: false, isPrevMonth: true, dots: prevMonthDotsMap[29] || [] },
    { day: 30, isCurrentMonth: false, isPrevMonth: true, dots: [] },
    { day: 31, isCurrentMonth: false, isPrevMonth: true, dots: [] },
    { day: 1, isCurrentMonth: true, dots: dayDotsMap[1] || [] },
    { day: 2, isCurrentMonth: true, dots: dayDotsMap[2] || [] },
    { day: 3, isCurrentMonth: true, dots: dayDotsMap[3] || [] },
    { day: 4, isCurrentMonth: true, dots: dayDotsMap[4] || [] },

    // Week 2
    { day: 5, isCurrentMonth: true, dots: dayDotsMap[5] || [] },
    { day: 6, isCurrentMonth: true, dots: dayDotsMap[6] || [] },
    { day: 7, isCurrentMonth: true, dots: dayDotsMap[7] || [] },
    { day: 8, isCurrentMonth: true, dots: dayDotsMap[8] || [] },
    { day: 9, isCurrentMonth: true, dots: dayDotsMap[9] || [] },
    { day: 10, isCurrentMonth: true, dots: dayDotsMap[10] || [] },
    { day: 11, isCurrentMonth: true, dots: dayDotsMap[11] || [] },

    // Week 3
    { day: 12, isCurrentMonth: true, dots: dayDotsMap[12] || [] },
    { day: 13, isCurrentMonth: true, dots: dayDotsMap[13] || [] },
    { day: 14, isCurrentMonth: true, dots: dayDotsMap[14] || [] },
    { day: 15, isCurrentMonth: true, dots: dayDotsMap[15] || [] },
    { day: 16, isCurrentMonth: true, dots: dayDotsMap[16] || [] },
    { day: 17, isCurrentMonth: true, dots: dayDotsMap[17] || [] },
    { day: 18, isCurrentMonth: true, dots: dayDotsMap[18] || [] },

    // Week 4
    { day: 19, isCurrentMonth: true, dots: dayDotsMap[19] || [] },
    { day: 20, isCurrentMonth: true, dots: dayDotsMap[20] || [] },
    { day: 21, isCurrentMonth: true, dots: dayDotsMap[21] || [] },
    { day: 22, isCurrentMonth: true, dots: dayDotsMap[22] || [] },
    { day: 23, isCurrentMonth: true, dots: dayDotsMap[23] || [] },
    { day: 24, isCurrentMonth: true, dots: dayDotsMap[24] || [] },
    { day: 25, isCurrentMonth: true, dots: dayDotsMap[25] || [] },

    // Week 5
    { day: 26, isCurrentMonth: true, dots: dayDotsMap[26] || [] },
    { day: 27, isCurrentMonth: true, dots: dayDotsMap[27] || [] },
    { day: 28, isCurrentMonth: true, dots: dayDotsMap[28] || [] },
    { day: 29, isCurrentMonth: true, dots: dayDotsMap[29] || [] },
    { day: 30, isCurrentMonth: true, dots: dayDotsMap[30] || [] },
    { day: 31, isCurrentMonth: true, dots: dayDotsMap[31] || [] },
    { day: 1, isCurrentMonth: false, isNextMonth: true, dots: [] }
  ];

  return (
    <div className="mhn-calendar-view-container">
      {/* Left Column: Month Calendar Grid */}
      <div className="mhn-calendar-left-col">
        {/* Month Header Navigation */}
        <div className="mhn-calendar-header">
          <h3 className="mhn-calendar-title">
            {monthNames[currentMonth]}, {currentYear}
          </h3>
          <div className="mhn-calendar-nav-buttons">
            <Button
              onClick={handlePrevMonth}
              className="mhn-calendar-nav-btn"
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>
            <Button
              onClick={handleNextMonth}
              className="mhn-calendar-nav-btn"
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Calendar Grid Box */}
        <div className="mhn-calendar-grid-card">
          {/* Weekday Headers Row */}
          <div className="mhn-calendar-weekdays-row">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THUR</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>

          {/* Days Cells Grid */}
          <div className="mhn-calendar-days-grid">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.isCurrentMonth && cell.day === selectedDay;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (cell.isCurrentMonth) {
                      setSelectedDay(cell.day);
                    }
                  }}
                  className={`mhn-calendar-day-cell ${
                    !cell.isCurrentMonth ? 'mhn-day-cell-other-month' : ''
                  } ${isSelected ? 'mhn-day-cell-active' : ''}`}
                >
                  <div className="mhn-day-number">{cell.day}</div>
                  
                  {/* Event Dots Row */}
                  {cell.dots && cell.dots.length > 0 && (
                    <div className="mhn-day-dots">
                      {cell.dots.map((dotColor, dotIdx) => (
                        <span
                          key={dotIdx}
                          className="mhn-dot"
                          style={{
                            backgroundColor: isSelected ? '#FFFFFF' : dotColor
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: "Your Events" Sidebar List */}
      <div className="mhn-calendar-events-sidebar">
        <h3 className="mhn-sidebar-title">Your Events</h3>
        <div className="mhn-sidebar-events-list">
          {selectedDayEvents.map((evt) => (
            <div
              key={evt.id}
              className="mhn-sidebar-event-card"
              onClick={() => onEventClick && onEventClick(evt.id)}
            >
              <h4 className="mhn-sidebar-event-title">{evt.title}</h4>
              <div className="mhn-sidebar-event-meta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 16 14" />
                </svg>
                <span>{evt.date} &nbsp; {evt.time}</span>
              </div>
              <div className="mhn-sidebar-event-meta">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{evt.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
