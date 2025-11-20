import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ModelData {
  model: string;
  count: number;
}

interface ModelDistributionChartProps {
  data: ModelData[];
}

const COLORS = [
  '#e53e3e', // Red
  '#38a169', // Green
  '#3182ce', // Blue
  '#d69e2e', // Yellow
  '#805ad5', // Purple
  '#dd6b20', // Orange
  '#319795', // Teal
];

const ModelDistributionChart: React.FC<ModelDistributionChartProps> = ({ data }) => {
  const chartData = data.map((item, index) => ({
    name: item.model,
    value: item.count,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="swmpi-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: any) => [`${value} Anfragen`, 'Nutzung']}
          />
          <Legend
            wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Model list with percentages */}
      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((model, index) => {
          const total = data.reduce((sum, m) => sum + m.count, 0);
          const percentage = (model.count / total * 100).toFixed(1);

          return (
            <div key={model.model} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-white/80">{model.model}</span>
              </div>
              <div className="text-swmpi-accent font-mono">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelDistributionChart;
