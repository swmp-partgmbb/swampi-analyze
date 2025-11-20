import React from 'react';
import { UserVisitsData } from '../types';

interface UserVisitsTableProps {
  visitsData: UserVisitsData;
}

const UserVisitsTable: React.FC<UserVisitsTableProps> = ({ visitsData }) => {
  const periods = Object.values(visitsData);
  const periodOrder = ['Juni-Juli', 'Juli-August', 'Oktober-November'];
  const sortedPeriods = periodOrder.map(periodName =>
    periods.find(period => period.periodName === periodName)
  ).filter(Boolean);

  // Calculate growth rates
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  return (
    <div className="overflow-x-auto">
      <table className="swmpi-table">
        <thead>
          <tr>
            <th className="text-left">Metrik</th>
            {periodOrder.map(period => (
              <th key={period} className="text-center">{period.replace('-', ' ')}</th>
            ))}
            <th className="text-center">Trend</th>
          </tr>
        </thead>
        <tbody>
          {/* Total Users */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Aktive Benutzer</td>
            {sortedPeriods.map((period, index) => (
              <td key={index} className="text-center font-mono text-swmpi-text-muted">
                {period?.totalUsers || 0}
              </td>
            ))}
            <td className="text-center">
              <span className={`font-mono ${sortedPeriods[sortedPeriods.length - 1] && sortedPeriods[0] && sortedPeriods[sortedPeriods.length - 1]!.totalUsers > sortedPeriods[0]!.totalUsers ? 'text-green-400' : 'text-red-400'}`}>
                {sortedPeriods[0] && sortedPeriods[sortedPeriods.length - 1] ?
                  `${sortedPeriods[sortedPeriods.length - 1]!.totalUsers > sortedPeriods[0]!.totalUsers ? '+' : ''}
                   ${calculateGrowth(sortedPeriods[sortedPeriods.length - 1]!.totalUsers, sortedPeriods[0]!.totalUsers).toFixed(1)}%`
                  : 'N/A'
                }
              </span>
            </td>
          </tr>

          {/* Total Visits */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Gesamt-Besuche</td>
            {sortedPeriods.map((period, index) => (
              <td key={index} className="text-center font-mono text-swmpi-text-muted">
                {period?.totalVisits.toLocaleString() || 0}
              </td>
            ))}
            <td className="text-center">
              <span className={`font-mono ${sortedPeriods[sortedPeriods.length - 1] && sortedPeriods[0] && sortedPeriods[sortedPeriods.length - 1]!.totalVisits > sortedPeriods[0]!.totalVisits ? 'text-green-400' : 'text-red-400'}`}>
                {sortedPeriods[0] && sortedPeriods[sortedPeriods.length - 1] ?
                  `${sortedPeriods[sortedPeriods.length - 1]!.totalVisits > sortedPeriods[0]!.totalVisits ? '+' : ''}
                   ${calculateGrowth(sortedPeriods[sortedPeriods.length - 1]!.totalVisits, sortedPeriods[0]!.totalVisits).toFixed(1)}%`
                  : 'N/A'
                }
              </span>
            </td>
          </tr>

          {/* Average Visits per User */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Ø Besuche pro Benutzer</td>
            {sortedPeriods.map((period, index) => (
              <td key={index} className="text-center font-mono text-swmpi-text-muted">
                {period ? period.averageVisitsPerUser.toFixed(1) : '0.0'}
              </td>
            ))}
            <td className="text-center">
              <span className={`font-mono ${sortedPeriods[sortedPeriods.length - 1] && sortedPeriods[0] && sortedPeriods[sortedPeriods.length - 1]!.averageVisitsPerUser > sortedPeriods[0]!.averageVisitsPerUser ? 'text-green-400' : 'text-red-400'}`}>
                {sortedPeriods[0] && sortedPeriods[sortedPeriods.length - 1] ?
                  `${sortedPeriods[sortedPeriods.length - 1]!.averageVisitsPerUser > sortedPeriods[0]!.averageVisitsPerUser ? '+' : ''}
                   ${calculateGrowth(sortedPeriods[sortedPeriods.length - 1]!.averageVisitsPerUser, sortedPeriods[0]!.averageVisitsPerUser).toFixed(1)}%`
                  : 'N/A'
                }
              </span>
            </td>
          </tr>

          {/* Top User Visits */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Max. Besuche (Top-Benutzer)</td>
            {sortedPeriods.map((period, index) => (
              <td key={index} className="text-center font-mono text-swmpi-text-muted">
                {period?.topUsers[0]?.visitCount || 0}
              </td>
            ))}
            <td className="text-center">
              <span className="font-mono text-swmpi-accent">
                Ø {Math.round(sortedPeriods.reduce((sum, period) => sum + (period?.topUsers[0]?.visitCount || 0), 0) / sortedPeriods.length)}
              </span>
            </td>
          </tr>

          {/* Active Users Growth */}
          <tr className="border-b border-swmpi-primary/20">
            <td className="font-medium text-swmpi-text">Benutzer-Retention</td>
            {sortedPeriods.map((period, index) => {
              let retention = 'N/A';
              if (index > 0 && sortedPeriods[index - 1] && period) {
                const prevUsers = new Set(sortedPeriods[index - 1]!.userVisits.map(u => u.email));
                const currentUsers = new Set(period!.userVisits.map(u => u.email));
                const retained = Array.from(prevUsers).filter(email => currentUsers.has(email)).length;
                retention = `${Math.round(retained / prevUsers.size * 100)}%`;
              }
              return (
                <td key={index} className="text-center font-mono text-swmpi-text-muted">
                  {retention}
                </td>
              );
            })}
            <td className="text-center">
              <div className="text-xs text-swmpi-text-muted">
                Benutzer aus vorheriger Periode
              </div>
            </td>
          </tr>

          {/* Top Users List */}
          <tr>
            <td className="font-medium text-swmpi-text">Top-Benutzer (Oktober-November)</td>
            <td colSpan={2} className="text-sm text-swmpi-text-muted">
              <div className="space-y-1">
                {sortedPeriods[sortedPeriods.length - 1]?.topUsers.slice(0, 3).map((user, index) => (
                  <div key={user.email} className="flex justify-between py-1 px-2 bg-swmpi-primary/10 rounded">
                    <span>{index + 1}. {user.name.split(' | ')[0]}</span>
                    <span className="text-swmpi-accent font-mono">{user.visitCount} Besuche</span>
                  </div>
                ))}
              </div>
            </td>
            <td className="text-center">
              <div className="text-xs text-swmpi-text-muted">
                Aktuellste Periode
              </div>
            </td>
            <td className="text-center">
              <div className="text-xs text-swmpi-text-muted">
                Top-Benutzer
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserVisitsTable;
