import React from 'react';
import { ArrowLeft, TrendingUp, BarChart3, Zap, Users, Target, Award, Search, Database } from 'lucide-react';
import { MonthlyComparison } from '../types';
import UsageChart from './UsageChart';
import ModelDistributionChart from './ModelDistributionChart';

interface ComparisonData {
  key: string;
  name: string;
  data: MonthlyComparison;
}

interface ComparisonViewProps {
  comparisonData: ComparisonData[];
  onBack: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparisonData, onBack }) => {
  if (comparisonData.length < 2) return null;

  // Calculate search modes and database usage for each month
  const getMonthStats = (monthData: any) => {
    let internetSearch = 0;
    let databaseSearch = 0;

    monthData.topModels.forEach((model: any) => {
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

    const totalAnalyzed = monthData.databaseUsage.totalAnalyzed;
    const withDbPercentage = totalAnalyzed > 0 ? Math.round((monthData.databaseUsage.withDatabase / totalAnalyzed * 100)) : 0;
    const withoutDbPercentage = totalAnalyzed > 0 ? Math.round((monthData.databaseUsage.withoutDatabase / totalAnalyzed * 100)) : 0;

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
        withDbCount: monthData.databaseUsage.withDatabase,
        withoutDbCount: monthData.databaseUsage.withoutDatabase
      }
    };
  };

  // Calculate comparison metrics
  const totalRequests = comparisonData.reduce((sum, item) => sum + item.data.totalRequests, 0);
  const avgDailyUsage = comparisonData.reduce((sum, item) => sum + item.data.averageDailyUsage, 0) / comparisonData.length;
  const totalActiveDays = comparisonData.reduce((sum, item) => sum + item.data.uniqueDays, 0);

  // Calculate search mode averages
  const avgInternetSearch = comparisonData.reduce((sum, item) => sum + getMonthStats(item.data).searchModes.internet, 0) / comparisonData.length;
  const avgDatabaseSearch = comparisonData.reduce((sum, item) => sum + getMonthStats(item.data).searchModes.database, 0) / comparisonData.length;
  const avgWithDatabase = comparisonData.reduce((sum, item) => {
    const stats = getMonthStats(item.data);
    return sum + (stats.databaseUsage.hasData ? stats.databaseUsage.withDatabase : 0);
  }, 0) / comparisonData.filter(item => getMonthStats(item.data).databaseUsage.hasData).length;

  // Find best performing months
  const bestMonth = comparisonData.reduce((best, current) =>
    current.data.averageDailyUsage > best.data.averageDailyUsage ? current : best
  );

  const worstMonth = comparisonData.reduce((worst, current) =>
    current.data.averageDailyUsage < worst.data.averageDailyUsage ? current : worst
  );

  // Growth analysis
  if (comparisonData.length >= 2) {
    const sortedByDate = [...comparisonData].sort((a, b) => {
      const monthOrder = ['Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November'];
      return monthOrder.indexOf(a.name.split(' ')[0]) - monthOrder.indexOf(b.name.split(' ')[0]);
    });

    const firstMonth = sortedByDate[0];
    const lastMonth = sortedByDate[sortedByDate.length - 1];
    const overallGrowth = lastMonth && firstMonth ?
      ((lastMonth.data.averageDailyUsage - firstMonth.data.averageDailyUsage) / firstMonth.data.averageDailyUsage * 100) : 0;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-swmpi-primary/20 hover:bg-swmpi-primary/30 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück zur Übersicht</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-swmpi-text">
              Monatsvergleich
            </h1>
            <p className="text-swmpi-text-muted mt-2">
              Vergleich von {comparisonData.length} Monaten
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-swmpi-text-muted">
              Verglichene Monate:
            </div>
            <div className="text-sm text-swmpi-text">
              {comparisonData.map(item => item.name.split(' ')[0]).join(', ')}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="swmpi-card p-6 text-center">
            <TrendingUp className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {avgDailyUsage.toFixed(1)}
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø tägliche Anfragen</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <BarChart3 className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {totalRequests.toLocaleString()}
            </div>
            <div className="text-sm text-swmpi-text-muted">Gesamt-Anfragen</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Users className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {totalActiveDays}
            </div>
            <div className="text-sm text-swmpi-text-muted">Aktive Tage gesamt</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Target className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {comparisonData.length}
            </div>
            <div className="text-sm text-swmpi-text-muted">Verglichene Monate</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Search className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {Math.round(avgInternetSearch)}%
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø Internet-Suche</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Database className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {Math.round(avgWithDatabase)}%
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø Mit Datenbank</div>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="swmpi-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-display font-bold text-swmpi-text">
                Bester Monat
              </h3>
            </div>
            <div className="bg-green-400/10 rounded-lg p-4">
              <div className="text-lg font-bold text-swmpi-text mb-1">
                {bestMonth.name}
              </div>
              <div className="text-sm text-swmpi-text-muted">
                Ø {bestMonth.data.averageDailyUsage.toFixed(1)} Anfragen/Tag
              </div>
            </div>
          </div>

          <div className="swmpi-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-display font-bold text-swmpi-text">
                Niedrigster Monat
              </h3>
            </div>
            <div className="bg-red-400/10 rounded-lg p-4">
              <div className="text-lg font-bold text-swmpi-text mb-1">
                {worstMonth.name}
              </div>
              <div className="text-sm text-swmpi-text-muted">
                Ø {worstMonth.data.averageDailyUsage.toFixed(1)} Anfragen/Tag
              </div>
            </div>
          </div>
        </div>

        {/* Trend Comparison Chart */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-swmpi-accent" />
            Vergleich der täglichen Nutzungsentwicklung
          </h2>
          <UsageChart data={comparisonData.map(item => item.data)} viewMode="comparison" />
        </div>

        {/* Detailed Month Comparison */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-swmpi-accent" />
            Detaillierter Monatsvergleich
          </h2>

          <div className="overflow-x-auto overflow-y-auto max-h-96">
            <table className="swmpi-table">
              <thead>
                <tr>
                  <th className="text-left">Metrik</th>
                  {comparisonData.map(item => (
                    <th key={item.key} className="text-center">
                      {item.name.split(' ')[0]}
                    </th>
                  ))}
                  <th className="text-center">Differenz</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Ø tägliche Anfragen</td>
                  {comparisonData.map(item => (
                    <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                      {item.data.averageDailyUsage.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-center">
                    <span className={`font-mono ${bestMonth.data.averageDailyUsage > worstMonth.data.averageDailyUsage ? 'text-green-400' : 'text-swmpi-accent'}`}>
                      {(bestMonth.data.averageDailyUsage - worstMonth.data.averageDailyUsage).toFixed(1)}
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Gesamt-Anfragen</td>
                  {comparisonData.map(item => (
                    <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                      {item.data.totalRequests.toLocaleString()}
                    </td>
                  ))}
                  <td className="text-center">
                    <span className="font-mono text-swmpi-accent">
                      +{(bestMonth.data.totalRequests - worstMonth.data.totalRequests).toLocaleString()}
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Aktive Tage</td>
                  {comparisonData.map(item => (
                    <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                      {item.data.uniqueDays}
                    </td>
                  ))}
                  <td className="text-center">
                    <span className="font-mono text-swmpi-accent">
                      {bestMonth.data.uniqueDays - worstMonth.data.uniqueDays > 0 ? '+' : ''}
                      {bestMonth.data.uniqueDays - worstMonth.data.uniqueDays}
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Internet-Suche (Sonar)</td>
                  {comparisonData.map(item => {
                    const stats = getMonthStats(item.data);
                    return (
                      <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                        {stats.searchModes.internet}%
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <span className="font-mono text-swmpi-accent">
                      {getMonthStats(bestMonth.data).searchModes.internet - getMonthStats(worstMonth.data).searchModes.internet > 0 ? '+' : ''}
                      {getMonthStats(bestMonth.data).searchModes.internet - getMonthStats(worstMonth.data).searchModes.internet}%
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">GPT-Suche</td>
                  {comparisonData.map(item => {
                    const stats = getMonthStats(item.data);
                    return (
                      <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                        {stats.searchModes.database}%
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <span className="font-mono text-swmpi-accent">
                      {getMonthStats(bestMonth.data).searchModes.database - getMonthStats(worstMonth.data).searchModes.database > 0 ? '+' : ''}
                      {getMonthStats(bestMonth.data).searchModes.database - getMonthStats(worstMonth.data).searchModes.database}%
                    </span>
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Mit Datenbank</td>
                  {comparisonData.map(item => {
                    const stats = getMonthStats(item.data);
                    return (
                      <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                        {stats.databaseUsage.hasData ? `${stats.databaseUsage.withDatabase}%` : 'N/A'}
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <span className="font-mono text-swmpi-accent">
                      {getMonthStats(bestMonth.data).databaseUsage.withDatabase - getMonthStats(worstMonth.data).databaseUsage.withDatabase > 0 ? '+' : ''}
                      {getMonthStats(bestMonth.data).databaseUsage.withDatabase - getMonthStats(worstMonth.data).databaseUsage.withDatabase}%
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="font-medium text-swmpi-text">Ohne Datenbank</td>
                  {comparisonData.map(item => {
                    const stats = getMonthStats(item.data);
                    return (
                      <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                        {stats.databaseUsage.hasData ? `${stats.databaseUsage.withoutDatabase}%` : 'N/A'}
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <span className="font-mono text-swmpi-accent">
                      {getMonthStats(bestMonth.data).databaseUsage.withoutDatabase - getMonthStats(worstMonth.data).databaseUsage.withoutDatabase > 0 ? '+' : ''}
                      {getMonthStats(bestMonth.data).databaseUsage.withoutDatabase - getMonthStats(worstMonth.data).databaseUsage.withoutDatabase}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Comparison */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-3 text-swmpi-accent" />
            Modell-Verwendung im Vergleich
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonData.map(item => (
              <div key={item.key} className="bg-swmpi-primary/10 rounded-lg p-4">
                <h3 className="text-lg font-display font-bold text-swmpi-text mb-3">
                  {item.name.split(' ')[0]}
                </h3>
                <div className="space-y-2">
                  {item.data.topModels.slice(0, 3).map((model, index) => (
                    <div key={model.model} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-swmpi-accent'}`}></div>
                        <span className="text-sm text-swmpi-text">{model.model}</span>
                      </div>
                      <div className="text-sm text-swmpi-accent font-mono">
                        {model.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
