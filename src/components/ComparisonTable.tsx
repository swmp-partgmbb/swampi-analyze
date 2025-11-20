import React from 'react';
import { MonthlyData } from '../types';

interface ComparisonTableProps {
  monthlyData: MonthlyData;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ monthlyData }) => {
  const months = Object.values(monthlyData);
  const monthOrder = ['Mai 2025', 'Juni 2025', 'Juli 2025', 'August 2025', 'September 2025', 'Oktober 2025', 'November 2025'];
  const sortedMonths = monthOrder.map(monthName =>
    months.find(month => month.month === monthName)
  ).filter(Boolean);

  // Calculate search modes and database usage for each month
  const getMonthStats = (month: any) => {
    let internetSearch = 0;
    let databaseSearch = 0;

    month.topModels.forEach((model: any) => {
      // Sonar models typically use internet search
      if (model.model.includes('sonar')) {
        internetSearch += model.count;
      }
      // GPT models typically use database search
      else if (model.model.includes('gpt')) {
        databaseSearch += model.count;
      }
    });

    const total = internetSearch + databaseSearch;
    const internetPercentage = total > 0 ? Math.round((internetSearch / total * 100)) : 0;
    const databasePercentage = total > 0 ? Math.round((databaseSearch / total * 100)) : 0;

    const totalAnalyzed = month.databaseUsage.totalAnalyzed;
    const withDbPercentage = totalAnalyzed > 0 ? Math.round((month.databaseUsage.withDatabase / totalAnalyzed * 100)) : 0;
    const withoutDbPercentage = totalAnalyzed > 0 ? Math.round((month.databaseUsage.withoutDatabase / totalAnalyzed * 100)) : 0;

    return {
      searchModes: {
        internet: internetPercentage,
        database: databasePercentage,
        internetCount: internetSearch,
        databaseCount: databaseSearch
      },
      databaseUsage: {
        withDatabase: withDbPercentage,
        withoutDatabase: withoutDbPercentage,
        hasData: totalAnalyzed > 0,
        withDbCount: month.databaseUsage.withDatabase,
        withoutDbCount: month.databaseUsage.withoutDatabase
      }
    };
  };

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-144">
      <table className="swmpi-table">
        <thead>
          <tr>
            <th className="text-left">Metrik</th>
            {monthOrder.map(month => (
              <th key={month} className="text-center">{month.split(' ')[0]}</th>
            ))}
            <th className="text-center">Trend</th>
          </tr>
        </thead>
        <tbody>
          {/* Average Daily Requests */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Ø tägliche Anfragen</td>
            {sortedMonths.map((month, index) => (
              <td key={index} className="text-center font-mono text-swmpi-text-muted">
                {month?.averageDailyUsage.toFixed(1) || '0.0'}
              </td>
            ))}
            <td className="text-center">
              {sortedMonths[0] && sortedMonths[sortedMonths.length - 1] ? (
                <span className={`font-mono ${sortedMonths[sortedMonths.length - 1]!.averageDailyUsage > sortedMonths[0]!.averageDailyUsage ? 'text-green-400' : 'text-red-400'}`}>
                  {`${sortedMonths[sortedMonths.length - 1]!.averageDailyUsage > sortedMonths[0]!.averageDailyUsage ? '+' : ''}
                   ${(((sortedMonths[sortedMonths.length - 1]!.averageDailyUsage - sortedMonths[0]!.averageDailyUsage) / sortedMonths[0]!.averageDailyUsage * 100)).toFixed(1)}%`}
                </span>
              ) : (
                <span className="font-mono text-swmpi-text-muted">N/A</span>
              )}
            </td>
          </tr>

          {/* Total Requests */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Gesamt-Anfragen</td>
            {sortedMonths.map((month, index) => (
              <td key={index} className="text-center font-mono text-swmpi-text-muted">
                {month?.totalRequests.toLocaleString() || '0'}
              </td>
            ))}
            <td className="text-center">
              <span className="font-mono text-swmpi-accent">
                +{sortedMonths[sortedMonths.length - 1] && sortedMonths[0] ? sortedMonths[sortedMonths.length - 1]!.totalRequests - sortedMonths[0]!.totalRequests : 0}
              </span>
            </td>
          </tr>

          {/* Active Days */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Aktive Tage</td>
            {sortedMonths.map((month, index) => (
              <td key={index} className="text-center font-mono text-swmpi-text-muted">
                {month?.uniqueDays || 0}
              </td>
            ))}
            <td className="text-center">
              <span className="font-mono text-swmpi-accent">
                Ø {Math.round(sortedMonths.reduce((sum, month) => sum + (month?.uniqueDays || 0), 0) / sortedMonths.length)} Tage
              </span>
            </td>
          </tr>

          {/* Internet Search */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Internet-Suche (Sonar)</td>
            {sortedMonths.map((month, index) => {
              const stats = month ? getMonthStats(month) : null;
              return (
                <td key={index} className="text-center font-mono text-swmpi-text-muted">
                  {stats ? `${stats.searchModes.internet}%` : 'N/A'}
                </td>
              );
            })}
            <td className="text-center">
              <span className="font-mono text-swmpi-accent">
                Ø {Math.round(sortedMonths.reduce((sum, month) => sum + (month ? getMonthStats(month).searchModes.internet : 0), 0) / sortedMonths.length)}%
              </span>
            </td>
          </tr>

          {/* Database Search */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">GPT-Suche</td>
            {sortedMonths.map((month, index) => {
              const stats = month ? getMonthStats(month) : null;
              return (
                <td key={index} className="text-center font-mono text-swmpi-text-muted">
                  {stats ? `${stats.searchModes.database}%` : 'N/A'}
                </td>
              );
            })}
            <td className="text-center">
              <span className="font-mono text-swmpi-accent">
                Ø {Math.round(sortedMonths.reduce((sum, month) => sum + (month ? getMonthStats(month).searchModes.database : 0), 0) / sortedMonths.length)}%
              </span>
            </td>
          </tr>

          {/* With Database */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Mit Datenbank</td>
            {sortedMonths.map((month, index) => {
              const stats = month ? getMonthStats(month) : null;
              return (
                <td key={index} className="text-center font-mono text-swmpi-text-muted">
                  {stats?.databaseUsage.hasData ? `${stats.databaseUsage.withDatabase}%` : 'N/A'}
                </td>
              );
            })}
            <td className="text-center">
              <span className="font-mono text-swmpi-accent">
                Ø {Math.round(sortedMonths.reduce((sum, month) => {
                  const stats = month ? getMonthStats(month) : null;
                  return sum + (stats?.databaseUsage.hasData ? stats.databaseUsage.withDatabase : 0);
                }, 0) / sortedMonths.filter(month => month && getMonthStats(month).databaseUsage.hasData).length) || 0}%
              </span>
            </td>
          </tr>

          {/* Without Database */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Ohne Datenbank</td>
            {sortedMonths.map((month, index) => {
              const stats = month ? getMonthStats(month) : null;
              return (
                <td key={index} className="text-center font-mono text-swmpi-text-muted">
                  {stats?.databaseUsage.hasData ? `${stats.databaseUsage.withoutDatabase}%` : 'N/A'}
                </td>
              );
            })}
            <td className="text-center">
              <span className="font-mono text-swmpi-accent">
                Ø {Math.round(sortedMonths.reduce((sum, month) => {
                  const stats = month ? getMonthStats(month) : null;
                  return sum + (stats?.databaseUsage.hasData ? stats.databaseUsage.withoutDatabase : 0);
                }, 0) / sortedMonths.filter(month => month && getMonthStats(month).databaseUsage.hasData).length) || 0}%
              </span>
            </td>
          </tr>

          {/* Top Models - Show for November only */}
          <tr>
            <td className="font-medium text-swmpi-text">Top-Modelle (November)</td>
            <td colSpan={6} className="text-sm text-swmpi-text-muted">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {sortedMonths[sortedMonths.length - 1]?.topModels.slice(0, 3).map((model, index) => (
                  <div key={model.model} className="flex justify-between py-1 px-2 bg-swmpi-primary/10 rounded">
                    <span>{index + 1}. {model.model}</span>
                    <span className="text-swmpi-accent font-mono">{model.count}</span>
                  </div>
                ))}
              </div>
            </td>
            <td className="text-center">
              <div className="text-xs text-swmpi-text-muted">
                Aktuelle Top-Modelle
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
