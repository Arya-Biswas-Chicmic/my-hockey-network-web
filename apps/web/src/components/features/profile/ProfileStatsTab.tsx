'use client';

import { useState } from 'react';

import { Dropdown } from '@/components/common/FormControls';
import { RinkZoneOverlayIcon, ShotZoneMapIcon } from '@/components/icons/HockeyAnalyticsVisuals';

/**
 * Profile > Stats tab. Extracted from `screens/profile-page.tsx`. All
 * figures on this tab are placeholder/design-reference content — there is
 * no stats backend endpoint yet, matching the same "hardcoded pending a
 * real API" policy as `ProfileMediaTab`/Events. Only the filter dropdowns
 * hold real (local) UI state.
 */
export function ProfileStatsTab() {
  const [selectedSeason, setSelectedSeason] = useState('2025-26');
  const [selectedSeasonType, setSelectedSeasonType] = useState('Regular Season');
  const [selectedUnit, setSelectedUnit] = useState('Miles • MI');

  return (
    <div className="mhn-profile-tab-content-card-full">
      <div className="mhn-profile-stats-container">
        {/* 1. Filter Dropdowns Row */}
        <div className="mhn-stats-filters-row">
          <Dropdown
            value={selectedSeason}
            options={['2025-26', '2024-25']}
            onChange={(val) => setSelectedSeason(val)}
            placeholder=""
            className="mhn-w-160"
          />

          <Dropdown
            value={selectedSeasonType}
            options={['Regular Season', 'Playoffs']}
            onChange={(val) => setSelectedSeasonType(val)}
            placeholder=""
            className="mhn-w-200"
          />

          <Dropdown
            value={selectedUnit}
            options={['Miles • MI', 'KM • KPH']}
            onChange={(val) => setSelectedUnit(val)}
            placeholder=""
            className="mhn-w-160"
          />
        </div>

        {/* 2. Season Summary Bar */}
        <div className="mhn-season-summary-card">
          <h3 className="mhn-season-title">2025-26 Regular Season</h3>
          <div className="mhn-season-metrics-group">
            <div className="mhn-season-metric-col">
              <span className="mhn-season-metric-label">GP</span>
              <span className="mhn-season-metric-value">81</span>
            </div>
            <div className="mhn-season-metric-divider" />
            <div className="mhn-season-metric-col">
              <span className="mhn-season-metric-label">G</span>
              <span className="mhn-season-metric-value">7</span>
            </div>
            <div className="mhn-season-metric-divider" />
            <div className="mhn-season-metric-col">
              <span className="mhn-season-metric-label">A</span>
              <span className="mhn-season-metric-value">7</span>
            </div>
            <div className="mhn-season-metric-divider" />
            <div className="mhn-season-metric-col">
              <span className="mhn-season-metric-label">P</span>
              <span className="mhn-season-metric-value">14</span>
            </div>
          </div>
        </div>

        {/* 3. Three Percentile Cards Grid */}
        <div className="mhn-percentile-cards-grid">
          <div className="mhn-percentile-card">
            <div className="mhn-percentile-card-header">
              <span className="mhn-percentile-badge-blue">60th PERCENTILE</span>
              <div className="mhn-percentile-info-icon" title="Hardest Shot Info">i</div>
            </div>
            <div className="mhn-percentile-value">86.45</div>
            <p className="mhn-percentile-label">Hardest Shot • MPH</p>
          </div>

          <div className="mhn-percentile-card">
            <div className="mhn-percentile-card-header">
              <span className="mhn-percentile-badge-dark">99th PERCENTILE</span>
              <div className="mhn-percentile-info-icon" title="Max Skating Speed Info">i</div>
            </div>
            <div className="mhn-percentile-value">24.94</div>
            <p className="mhn-percentile-label">Max Skating Speed • MPH</p>
          </div>

          <div className="mhn-percentile-card">
            <div className="mhn-percentile-card-header">
              <span className="mhn-percentile-badge-outline">&lt;50th PERCENTILE</span>
              <div className="mhn-percentile-info-icon" title="Most Miles Skated Info">i</div>
            </div>
            <div className="mhn-percentile-value">2.63</div>
            <p className="mhn-percentile-label">Most Miles Skated • Game</p>
          </div>
        </div>

        {/* 4. Shots On Goal Zone Map Card */}
        <div className="mhn-stats-section-card">
          <h3 className="mhn-stats-section-title">
            <span>Shots On Goal Zone Map</span>
            <span className="mhn-percentile-info-icon mhn-info-icon-sm">i</span>
          </h3>

          <div className="mhn-zone-map-content-row">
            <div className="mhn-zone-map-visual">
              <ShotZoneMapIcon />

              <div className="mhn-percentile-legend-bar">
                <div className="mhn-toggle-row-between mhn-text-xs-sub">
                  <span>Percentile</span>
                </div>
                <div className="mhn-legend-bar-img" />
                <div className="mhn-toggle-row-between mhn-text-xs-bold">
                  <span>1-50</span>
                  <span>51-80</span>
                  <span>81-99</span>
                </div>
              </div>
            </div>

            <div className="mhn-zone-map-table">
              <div className="mhn-zone-table-header">
                <span>Beck Malenstyn</span>
                <span>Avg. by Position (F/D)</span>
              </div>

              <div className="mhn-zone-table-row">
                <div className="mhn-zone-table-left">
                  <span className="mhn-badge-pill-outline">&lt;50th</span>
                  <div className="mhn-comment-skeleton-meta">
                    <div className="mhn-zone-stats-nums">
                      <span className="mhn-num-main">72</span>
                      <span className="mhn-num-avg">86</span>
                    </div>
                    <span className="mhn-zone-label-sub">ALL LOCATIONS</span>
                  </div>
                </div>
              </div>

              <div className="mhn-zone-table-row">
                <div className="mhn-zone-table-left">
                  <span className="mhn-badge-pill-cyan">52nd</span>
                  <div className="mhn-comment-skeleton-meta">
                    <div className="mhn-zone-stats-nums">
                      <span className="mhn-num-main">30</span>
                      <span className="mhn-num-avg">32</span>
                    </div>
                    <span className="mhn-zone-label-sub">HIGH-DANGER</span>
                  </div>
                </div>
              </div>

              <div className="mhn-zone-table-row">
                <div className="mhn-zone-table-left">
                  <span className="mhn-badge-pill-outline">&lt;50th</span>
                  <div className="mhn-comment-skeleton-meta">
                    <div className="mhn-zone-stats-nums">
                      <span className="mhn-num-main">14</span>
                      <span className="mhn-num-avg">27</span>
                    </div>
                    <span className="mhn-zone-label-sub">MID-RANGE</span>
                  </div>
                </div>
              </div>

              <div className="mhn-zone-table-row">
                <div className="mhn-zone-table-left">
                  <span className="mhn-badge-pill-cyan">79th</span>
                  <div className="mhn-comment-skeleton-meta">
                    <div className="mhn-zone-stats-nums">
                      <span className="mhn-num-main">13</span>
                      <span className="mhn-num-avg">8</span>
                    </div>
                    <span className="mhn-zone-label-sub">LONG-RANGE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Zone Time Card */}
        <div className="mhn-stats-section-card">
          <h3 className="mhn-stats-section-title">
            <span>Zone Time</span>
            <span className="mhn-percentile-info-icon mhn-info-icon-sm">i</span>
          </h3>

          <div className="mhn-zone-time-visual-wrapper">
            <RinkZoneOverlayIcon />

            <div className="mhn-zone-time-cards-container">
              <div className="mhn-zone-time-card">
                <span className="mhn-badge-pill-outline">&lt;50th</span>
                <div className="mhn-zone-time-val">43.1%</div>
                <h4 className="mhn-zone-time-title">DEFENSIVE ZONE</h4>
                <span className="mhn-zone-time-subtext">NHL Average: 40.1%</span>
              </div>

              <div className="mhn-zone-time-card">
                <span className="mhn-badge-pill-outline">&lt;50th</span>
                <div className="mhn-zone-time-val">17.6%</div>
                <h4 className="mhn-zone-time-title">NEUTRAL ZONE</h4>
                <span className="mhn-zone-time-subtext">NHL Average: 16.8%</span>
              </div>

              <div className="mhn-zone-time-card">
                <span className="mhn-badge-pill-outline">&lt;50th</span>
                <div className="mhn-zone-time-val">39.2%</div>
                <h4 className="mhn-zone-time-title">OFFENSIVE ZONE</h4>
                <span className="mhn-zone-time-subtext">NHL Average: 43.1%</span>
              </div>
            </div>
          </div>

          <div className="mhn-percentile-legend-bar">
            <div className="mhn-toggle-row-between mhn-text-xs-sub">
              <span>Percentile</span>
            </div>
            <div className="mhn-legend-bar-img" />
            <div className="mhn-toggle-row-between mhn-text-xs-bold">
              <span>1-50</span>
              <span>51-80</span>
              <span>81-99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
