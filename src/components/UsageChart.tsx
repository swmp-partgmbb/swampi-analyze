import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonthlyComparison } from '../types';

interface UsageChartProps {
  data: MonthlyComparison[];
  viewMode?: 'overview' | 'month-detail' | 'comparison';
}

const UsageChart: React.FC<UsageChartProps> = ({ data, viewMode = 'overview' }) => {
  // Month colors for comparison
  const monthColors = {
    'Mai 2025': '#3b82f6',
    'Juni 2025': '#10b981',
    'Juli 2025': '#f59e0b',
    'August 2025': '#ef4444',
    'September 2025': '#8b5cf6',
    'Oktober 2025': '#ec4899',
    'November 2025': '#64748b'
  };

  // For month detail view - show daily data for single month
  if (viewMode === 'month-detail' && data.length === 1) {
    const monthData = data[0];

    // Prepare daily data
    const chartData = monthData.trendData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(day => ({
        day: new Date(day.date).getDate(),
        date: day.date,
        requests: day.requests
      }));

    return (
      <div className="swmpi-chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              label={{ value: `Tag im ${monthData.month.split(' ')[0]}`, position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              label={{ value: 'Anfragen pro Tag', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value: any) => [`${value} Anfragen`, 'Tägliche Nutzung']}
              labelFormatter={(label) => `Tag ${label}`}
            />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#64748b"
              strokeWidth={3}
              dot={{ fill: '#64748b', strokeWidth: 2, r: 6 }}
              name="Tägliche Nutzung"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-swmpi-text">
            Ø {Math.round(monthData.averageDailyUsage)} Anfragen/Tag über {monthData.uniqueDays} Tage
          </div>
        </div>
      </div>
    );
  }

  // For comparison view - show daily data for multiple months
  if (viewMode === 'comparison' && data.length > 1) {
    // Create a combined dataset with all dates from all months
    const allDates = new Set<string>();
    data.forEach(month => {
      month.trendData.forEach(day => allDates.add(day.date));
    });

    const sortedDates = Array.from(allDates).sort();

    const chartData = sortedDates.map(date => {
      const dataPoint: any = { date, day: new Date(date).getDate() };

      data.forEach(month => {
        const monthKey = month.month.split(' ')[0];
        const dayData = month.trendData.find(d => d.date === date);
        dataPoint[monthKey] = dayData ? dayData.requests : null;
      });

      return dataPoint;
    });

    return (
      <div className="swmpi-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              label={{ value: 'Tag des Monats', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              label={{ value: 'Anfragen pro Tag', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '8px',
                color: '#e2e8f0'
              }}
              formatter={(value: any, name: string) => [`${value} Anfragen`, name]}
              labelFormatter={(label) => `Tag ${label}`}
            />
            <Legend />
            {data.map(month => {
              const monthKey = month.month.split(' ')[0];
              const color = monthColors[month.month as keyof typeof monthColors] || '#64748b';
              return (
                <Line
                  key={monthKey}
                  type="monotone"
                  dataKey={monthKey}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  name={monthKey}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 text-center">
          <div className="text-sm text-swmpi-text-muted">
            Vergleich der täglichen Nutzung über {data.length} Monate
          </div>
        </div>
      </div>
    );
  }

  // For overview - show monthly averages (default behavior)
  const monthOrder = ['Mai 2025', 'Juni 2025', 'Juli 2025', 'August 2025', 'September 2025', 'Oktober 2025', 'November 2025'];
  const sortedData = monthOrder.map(monthName =>
    data.find(month => month.month === monthName)
  ).filter(Boolean);

  // Prepare data for the chart - show monthly averages
  const chartData = sortedData.map(month => ({
    month: month?.month.split(' ')[0] || '', // Just the month name
    averageDailyUsage: Math.round(month?.averageDailyUsage || 0),
    totalRequests: month?.totalRequests || 0
  }));

  return (
    <div className="swmpi-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
          />
          <YAxis
            stroke="rgba(255,255,255,0.7)"
            fontSize={12}
            label={{ value: 'Ø tägliche Anfragen', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(100, 116, 139, 0.3)',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
            formatter={(value: any, name: string) => [
              `${value} Anfragen`,
              name === 'averageDailyUsage' ? 'Ø täglich' : 'Gesamt'
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="averageDailyUsage"
            stroke="#64748b"
            strokeWidth={3}
            dot={{ fill: '#64748b', strokeWidth: 2, r: 6 }}
            name="Ø tägliche Nutzung"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Trend indicator */}
      <div className="mt-4 text-center">
        <div className={`text-lg font-bold ${sortedData[sortedData.length - 1] && sortedData[0] && sortedData[sortedData.length - 1]!.averageDailyUsage > sortedData[0]!.averageDailyUsage ? 'text-green-400' : 'text-red-400'}`}>
          {sortedData[sortedData.length - 1] && sortedData[0] ? (
            <>
              {sortedData[sortedData.length - 1]!.averageDailyUsage > sortedData[0]!.averageDailyUsage ? '↗' : '↘'}
              {' '}
              {Math.abs(((sortedData[sortedData.length - 1]!.averageDailyUsage - sortedData[0]!.averageDailyUsage) / sortedData[0]!.averageDailyUsage * 100)).toFixed(1)}%
              Wachstum (Mai → November)
            </>
          ) : 'Keine Daten verfügbar'}
        </div>
        <div className="text-sm text-swmpi-text-muted mt-2">
          Ø {Math.round(sortedData.reduce((sum, month) => sum + (month?.averageDailyUsage || 0), 0) / sortedData.length)} Anfragen/Tag
        </div>
      </div>
    </div>
  );
};

export default UsageChart;
