'use client';

import { ArrowDown, ChevronDown, Filter, Search } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import type { ActivityLogView } from '@/hooks/use-supervision-logs';

export interface SupervisionLogsTabProps {
  logs: ActivityLogView[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  isLoading?: boolean;
}

/** Supervision > Logs tab. Extracted from `screens/supervision-page.tsx`. */
export function SupervisionLogsTab({
  logs,
  searchQuery,
  onSearchQueryChange,
  isLoading = false,
}: Readonly<SupervisionLogsTabProps>) {
  return (
    <div className="mhn-supervision-logs-wrapper">
      <div className="mhn-logs-top-controls">
        <div className="mhn-logs-search-box">
          <Search size={16} aria-hidden="true" />
          <Input
            type="text"
            placeholder="Search Logs"
            className="mhn-logs-search-input"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>

        <Button className="mhn-logs-filter-btn">
          <Filter size={14} aria-hidden="true" />
          <span>Filters</span>
          <ChevronDown size={12} aria-hidden="true" />
        </Button>
      </div>

      <div className="mhn-logs-table-container">
        <table className="mhn-logs-table">
          <thead>
            <tr>
              <th><div className="mhn-th-flex">DATE & TIME<ArrowDown size={10} aria-hidden="true" /></div></th>
              <th><div className="mhn-th-flex">ACTIVITY<ArrowDown size={10} aria-hidden="true" /></div></th>
              <th><div className="mhn-th-flex">INITIATED BY<ArrowDown size={10} aria-hidden="true" /></div></th>
              <th><div className="mhn-th-flex">STATUS<ArrowDown size={10} aria-hidden="true" /></div></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`}>
                  <td><div className="mhn-shimmer-box h-4 w-28 rounded" /></td>
                  <td><div className="mhn-shimmer-box h-4 w-56 rounded" /></td>
                  <td><div className="mhn-shimmer-box h-4 w-16 rounded" /></td>
                  <td><div className="mhn-shimmer-box h-8 w-16 rounded" /></td>
                </tr>
              ))
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="mhn-td-date">{log.dateTime}</td>
                  <td className="mhn-td-activity">{log.activity}</td>
                  <td className="mhn-td-initiated">{log.initiatedBy}</td>
                  <td className="mhn-td-action"><Button className="mhn-log-action-link">{log.actionText}</Button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mhn-logs-pagination-footer">
        <span className="mhn-logs-count-info">
          {isLoading ? 'Loading items...' : logs.length === 0 ? '0 items' : `1 - ${logs.length} of ${logs.length} items`}
        </span>
        <div className="mhn-logs-pagination-buttons">
          <Button className="mhn-page-btn" disabled>Previous</Button>
          <Button className="mhn-page-btn" disabled={isLoading}>Next</Button>
        </div>
      </div>
    </div>
  );
}
