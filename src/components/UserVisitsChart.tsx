import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { UserVisitsPeriod } from '../types';

interface UserVisitsChartProps {
  data: UserVisitsPeriod[];
  viewMode?: 'overview' | 'period-detail' | 'comparison';
}

const PERIOD_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b'  // Gray
];

const UserVisitsChart: React.FC<UserVisitsChartProps> = ({ data, viewMode = 'overview' }) => {
  // For overview - show total visits by period
  if (viewMode === 'overview') {
    const chartData = data.map((period, index) => ({
      period: period.periodName.split(' ')[0], // Short period name
      fullPeriod: period.periodName,
      totalVisits: period.totalVisits,
      totalUsers: period.totalUsers,
      averageVisits: Math.round(period.averageVisitsPerUser * 10) / 10,
      fill: PERIOD_COLORS[index % PERIOD_COLORS.length]
    }));

    return (
      <div className="swmpi-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="period"
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              label={{ value: 'Gesamt-Besuche', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'totalVisits') return [`${value} Besuche`, 'Gesamt-Besuche'];
                if (name === 'totalUsers') return [`${value} Benutzer`, 'Aktive Benutzer'];
                if (name === 'averageVisits') return [`${value} Besuche`, 'Ø pro Benutzer'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const period = chartData.find(d => d.period === label);
                return period?.fullPeriod || label;
              }}
            />
            <Bar dataKey="totalVisits" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-swmpi-text">
            Ø {Math.round(data.reduce((sum, period) => sum + period.averageVisitsPerUser, 0) / data.length * 10) / 10} Besuche pro Benutzer
          </div>
          <div className="text-sm text-swmpi-text-muted mt-1">
            Gesamt {data.reduce((sum, period) => sum + period.totalVisits, 0).toLocaleString()} Besuche von {data.reduce((sum, period) => sum + period.totalUsers, 0)} Benutzern
          </div>
        </div>
      </div>
    );
  }

  // For period detail view - show top users as vertical bar chart
  if (viewMode === 'period-detail' && data.length === 1) {
    const periodData = data[0];


    const topUsersData = periodData.topUsers.map(user => ({
      name: user.name.split(' | ')[0], // Short name without company
      fullName: user.name,
      visits: user.visitCount,
      email: user.email
    }));

    return (
      <div className="swmpi-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={topUsersData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.7)"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              label={{ value: 'Anzahl der Besuche', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value: any) => [`${value} Besuche`, 'Besuche']}
              labelFormatter={(label) => {
                const user = topUsersData.find(u => u.name === label);
                return user?.fullName || label;
              }}
            />
            <Bar dataKey="visits" fill="#64748b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-swmpi-text">
            Top 10 Benutzer in {periodData.periodName}
          </div>
          <div className="text-sm text-swmpi-text-muted">
            {periodData.totalUsers} aktive Benutzer • {periodData.totalVisits} Gesamt-Besuche
          </div>
        </div>
      </div>
    );
  }

  // For comparison view - show top users comparison
  if (viewMode === 'comparison' && data.length > 1) {
    // Create a map of all unique users by email
    const allUsers = new Map<string, { name: string; email: string }>();
    data.forEach(period => {
      if (period.topUsers && period.topUsers.length > 0) {
        period.topUsers.forEach(user => {
          if (!allUsers.has(user.email)) {
            allUsers.set(user.email, { name: user.name, email: user.email });
          }
        });
      }
    });

    if (allUsers.size === 0) {
      return (
        <div className="swmpi-chart-container">
          <div className="flex items-center justify-center h-64 text-swmpi-text-muted">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Daten für Vergleich verfügbar</p>
              <p className="text-sm mt-2">Top-Benutzer-Daten fehlen in den ausgewählten Perioden</p>
            </div>
          </div>
        </div>
      );
    }

    const userComparisonData = Array.from(allUsers.values())
      .map(userInfo => {
        const userData: any = { user: userInfo.name.split(',')[0].trim().split(' ')[0] }; // Short name (first part before comma, then first name)
        data.forEach((period, index) => {
          const user = period.topUsers.find(u => u.email === userInfo.email);
          const periodKey = period.periodName.replace(/\s+/g, '-').toLowerCase();
          userData[periodKey] = user ? user.visitCount : 0;
        });
        return userData;
      })
      .filter(userData => {
        // Only include users that have at least one visit
        const totalVisits = Object.values(userData).filter((v: any) => typeof v === 'number').reduce((sum: number, v: number) => sum + v, 0);
        return totalVisits > 0;
      })
      .sort((a, b) => {
        // Sort by total visits across all periods
        const aTotal = Object.values(a).filter((v: any) => typeof v === 'number').reduce((sum: number, v: number) => sum + v, 0);
        const bTotal = Object.values(b).filter((v: any) => typeof v === 'number').reduce((sum: number, v: number) => sum + v, 0);
        return bTotal - aTotal;
      })
      .slice(0, 10); // Top 10 users

    if (userComparisonData.length === 0) {
      return (
        <div className="swmpi-chart-container">
          <div className="flex items-center justify-center h-64 text-swmpi-text-muted">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Vergleichsdaten verfügbar</p>
              <p className="text-sm mt-2">Es konnten keine Benutzerdaten für den Vergleich gefunden werden</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="swmpi-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={userComparisonData}
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              label={{ value: 'Besuche', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
            />
            <YAxis
              type="category"
              dataKey="user"
              stroke="rgba(255,255,255,0.7)"
              fontSize={11}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value: any, name: string) => [`${value} Besuche`, name]}
            />
            {data.map((period, index) => {
              const periodKey = period.periodName.replace(/\s+/g, '-').toLowerCase();
              return (
                <Bar
                  key={periodKey}
                  dataKey={periodKey}
                  stackId="visits"
                  fill={PERIOD_COLORS[index % PERIOD_COLORS.length]}
                  name={period.periodName.split(' ')[0]}
                  radius={index === data.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 text-center">
          <div className="text-sm text-swmpi-text-muted">
            Vergleich der Top-Benutzer über {data.length} Perioden
          </div>
        </div>
      </div>
    );
  }

  // Fallback for unhandled view modes
  return (
    <div className="swmpi-chart-container">
      <div className="flex items-center justify-center h-64 text-swmpi-text-muted">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Diagramm nicht verfügbar</p>
          <p className="text-sm mt-2">viewMode: {viewMode}, data length: {data.length}</p>
        </div>
      </div>
    </div>
  );
};

export default UserVisitsChart;
