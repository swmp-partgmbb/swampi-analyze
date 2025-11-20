import React from 'react';
import { Eye, BarChart3, CheckSquare, Square } from 'lucide-react';
import { MonthlyData } from '../types';

interface MonthSelectorProps {
  monthlyData: MonthlyData;
  monthNames: { [key: string]: string };
  selectedMonth: string | null;
  comparisonMonths: string[];
  onMonthClick: (monthKey: string) => void;
  onComparisonToggle: (monthKey: string) => void;
  onStartComparison: () => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  monthlyData,
  monthNames,
  selectedMonth,
  comparisonMonths,
  onMonthClick,
  onComparisonToggle,
  onStartComparison
}) => {
  const months = Object.keys(monthNames);

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="swmpi-card p-6">
        <h2 className="text-2xl font-display font-bold text-swmpi-text mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-swmpi-accent" />
          Monatsauswahl
        </h2>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-swmpi-text-muted">
            Wählen Sie Monate für detaillierte Ansicht oder Vergleich:
          </div>

          {comparisonMonths.length >= 2 && (
            <button
              onClick={onStartComparison}
              className="px-4 py-2 bg-swmpi-accent text-swmpi-dark rounded-lg font-medium hover:bg-swmpi-text transition-colors duration-200"
            >
              Vergleiche {comparisonMonths.length} Monate
            </button>
          )}
        </div>

        {comparisonMonths.length > 0 && (
          <div className="mt-4 text-sm text-swmpi-text-muted">
            Ausgewählte Monate: {comparisonMonths.map(month => monthNames[month]).join(', ')}
          </div>
        )}
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map(monthKey => {
          const monthData = monthlyData[monthKey];
          const isSelectedForComparison = comparisonMonths.includes(monthKey);

          if (!monthData) return null;

          return (
            <div
              key={monthKey}
              className={`
                swmpi-card p-4 cursor-pointer transition-all duration-300 hover:scale-105
                ${isSelectedForComparison ? 'ring-2 ring-swmpi-accent bg-swmpi-primary/20' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-display font-bold text-swmpi-text">
                  {monthNames[monthKey].split(' ')[0]}
                </h3>

                <div className="flex items-center space-x-2">
                  {/* Comparison checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComparisonToggle(monthKey);
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
                      onMonthClick(monthKey);
                    }}
                    className="p-1 rounded hover:bg-swmpi-primary/20 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-swmpi-accent" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-swmpi-text-muted">Ø täglich:</span>
                  <span className="text-swmpi-text font-mono">{monthData.averageDailyUsage.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-swmpi-text-muted">Gesamt:</span>
                  <span className="text-swmpi-text font-mono">{monthData.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-swmpi-text-muted">Aktive Tage:</span>
                  <span className="text-swmpi-text font-mono">{monthData.uniqueDays}</span>
                </div>
              </div>

              {/* Top model indicator */}
              {monthData.topModels.length > 0 && (
                <div className="mt-3 pt-3 border-t border-swmpi-primary/20">
                  <div className="text-xs text-swmpi-text-muted mb-1">Top-Modell:</div>
                  <div className="text-xs text-swmpi-accent font-medium">
                    {monthData.topModels[0].model}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-swmpi-text-muted text-sm">
        <p>Klicken Sie auf das Auge-Icon für detaillierte Monatsansicht</p>
        <p>Wählen Sie mehrere Monate mit Checkboxen für Vergleich aus</p>
      </div>
    </div>
  );
};

export default MonthSelector;
