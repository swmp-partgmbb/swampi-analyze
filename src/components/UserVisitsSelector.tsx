import React from 'react';
import { Eye, BarChart3, CheckSquare, Square } from 'lucide-react';
import { UserVisitsData } from '../types';

interface UserVisitsSelectorProps {
  visitsData: UserVisitsData;
  selectedPeriod: string | null;
  comparisonPeriods: string[];
  onPeriodClick: (periodKey: string) => void;
  onComparisonToggle: (periodKey: string) => void;
  onStartComparison: () => void;
}

const UserVisitsSelector: React.FC<UserVisitsSelectorProps> = ({
  visitsData,
  selectedPeriod: _selectedPeriod,
  comparisonPeriods,
  onPeriodClick,
  onComparisonToggle,
  onStartComparison
}) => {
  const periods = Object.keys(visitsData);

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="swmpi-card p-6">
        <h2 className="text-2xl font-display font-bold text-swmpi-text mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-swmpi-accent" />
          Periodenauswahl
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-swmpi-text-muted">
            Wählen Sie Perioden für detaillierte Ansicht oder Vergleich:
          </div>

          {comparisonPeriods.length >= 2 && (
            <button
              onClick={onStartComparison}
              className="px-4 py-2 bg-swmpi-accent text-swmpi-dark rounded-lg font-medium hover:bg-swmpi-text transition-colors duration-200"
            >
              Vergleiche {comparisonPeriods.length} Perioden
            </button>
          )}
        </div>

        {comparisonPeriods.length > 0 && (
          <div className="mt-4 text-sm text-swmpi-text-muted">
            Ausgewählte Perioden: {comparisonPeriods.map(period => visitsData[period]?.periodName || period).join(', ')}
          </div>
        )}
      </div>

      {/* Period Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periods.map(periodKey => {
          const periodData = visitsData[periodKey];
          const isSelectedForComparison = comparisonPeriods.includes(periodKey);

          if (!periodData) return null;

          return (
            <div
              key={periodKey}
              className={`
                swmpi-card p-4 cursor-pointer transition-all duration-300 hover:scale-105
                ${isSelectedForComparison ? 'ring-2 ring-swmpi-accent bg-swmpi-primary/20' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-display font-bold text-swmpi-text">
                  {periodData.periodName}
                </h3>

                <div className="flex items-center space-x-2">
                  {/* Comparison checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComparisonToggle(periodKey);
                    }}
                    className="p-1 rounded hover:bg-swmpi-primary/20 transition-colors"
                  >
                    {isSelectedForComparison ? (
                      <CheckSquare className="w-4 h-4 text-swmpi-accent" />
                    ) : (
                      <Square className="w-4 h-4 text-swmpi-text-muted" />
                    )}
                  </button>

                  {/* Detail view button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPeriodClick(periodKey);
                    }}
                    className="p-1 rounded hover:bg-swmpi-primary/20 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-swmpi-accent" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-swmpi-text-muted">Aktive Benutzer:</span>
                  <span className="text-swmpi-text font-mono">{periodData.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-swmpi-text-muted">Gesamt-Besuche:</span>
                  <span className="text-swmpi-text font-mono">{periodData.totalVisits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-swmpi-text-muted">Ø Besuche/Benutzer:</span>
                  <span className="text-swmpi-text font-mono">{periodData.averageVisitsPerUser.toFixed(1)}</span>
                </div>
              </div>

              {/* Top user indicator */}
              {periodData.topUsers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-swmpi-primary/20">
                  <div className="text-xs text-swmpi-text-muted mb-1">Aktivster Benutzer:</div>
                  <div className="text-xs text-swmpi-accent font-medium">
                    {periodData.topUsers[0].name.split(' | ')[0]}
                  </div>
                  <div className="text-xs text-swmpi-text-muted">
                    {periodData.topUsers[0].visitCount} Besuche
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-swmpi-text-muted text-sm">
        <p>Klicken Sie auf das Auge-Icon für detaillierte Periodenansicht</p>
        <p>Wählen Sie mehrere Perioden mit Checkboxen für Vergleich aus</p>
      </div>
    </div>
  );
};

export default UserVisitsSelector;
