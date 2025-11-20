import React from 'react';
import { ArrowLeft, TrendingUp, BarChart3, Calendar, Zap, Database, Search, Users, Trophy } from 'lucide-react';
import { MonthlyComparison } from '../types';
import UsageChart from './UsageChart';
import ModelDistributionChart from './ModelDistributionChart';

interface MonthDetailViewProps {
  monthKey: string;
  monthData: MonthlyComparison;
  monthName: string;
  onBack: () => void;
}

const MonthDetailView: React.FC<MonthDetailViewProps> = ({
  monthKey,
  monthData,
  monthName,
  onBack
}) => {
  // Calculate additional metrics
  const avgRequestsPerActiveDay = monthData.uniqueDays > 0 ?
    monthData.totalRequests / monthData.uniqueDays : 0;

  const totalModels = monthData.topModels.length;
  const topModel = monthData.topModels[0];
  const topModelPercentage = monthData.totalRequests > 0 ?
    (topModel?.count / monthData.totalRequests * 100).toFixed(1) : '0';

  // Calculate search modes and database usage for this month
  const calculateMonthStats = () => {
    let internetSearch = 0;
    let databaseSearch = 0;

    monthData.topModels.forEach(model => {
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
    const internetPercentage = total > 0 ? (internetSearch / total * 100) : 0;
    const databasePercentage = total > 0 ? (databaseSearch / total * 100) : 0;

    const totalAnalyzed = monthData.databaseUsage.totalAnalyzed;
    const withDbPercentage = totalAnalyzed > 0 ? (monthData.databaseUsage.withDatabase / totalAnalyzed * 100) : 0;
    const withoutDbPercentage = totalAnalyzed > 0 ? (monthData.databaseUsage.withoutDatabase / totalAnalyzed * 100) : 0;

    return {
      searchModes: {
        internet: Math.round(internetPercentage),
        database: Math.round(databasePercentage)
      },
      databaseUsage: {
        withDatabase: Math.round(withDbPercentage),
        withoutDatabase: Math.round(withoutDbPercentage),
        hasData: totalAnalyzed > 0
      }
    };
  };

  const monthStats = calculateMonthStats();

  // Group models by type
  const modelGroups = monthData.topModels.reduce((acc, model) => {
    const type = model.model.includes('gpt') ? 'GPT' :
                model.model.includes('sonar') ? 'Sonar' :
                model.model.includes('claude') ? 'Claude' : 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(model);
    return acc;
  }, {} as { [key: string]: typeof monthData.topModels });

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
              {monthName}
            </h1>
            <p className="text-swmpi-text-muted mt-2">Detaillierte Nutzungsanalyse</p>
          </div>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="swmpi-card p-6 text-center">
            <TrendingUp className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {monthData.averageDailyUsage.toFixed(1)}
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø tägliche Anfragen</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <BarChart3 className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {monthData.totalRequests.toLocaleString()}
            </div>
            <div className="text-sm text-swmpi-text-muted">Gesamt-Anfragen</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Calendar className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {monthData.uniqueDays}
            </div>
            <div className="text-sm text-swmpi-text-muted">Aktive Tage</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Users className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {avgRequestsPerActiveDay.toFixed(1)}
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø pro aktivem Tag</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Trend Chart */}
          <div className="swmpi-card p-6">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-swmpi-accent" />
              Tägliche Entwicklung
            </h2>
            <UsageChart data={[monthData]} viewMode="month-detail" />
          </div>

          {/* Model Distribution */}
          <div className="swmpi-card p-6">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
              <Zap className="w-6 h-6 mr-3 text-swmpi-accent" />
              Modell-Verteilung
            </h2>
            <ModelDistributionChart data={monthData.topModels} />
          </div>
        </div>

        {/* Detailed Model Analysis */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <Database className="w-6 h-6 mr-3 text-swmpi-accent" />
            Detaillierte Modell-Analyse
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(modelGroups).map(([groupName, models]) => (
              <div key={groupName} className="bg-swmpi-primary/10 rounded-lg p-4">
                <h3 className="text-lg font-display font-bold text-swmpi-text mb-3">
                  {groupName}-Modelle
                </h3>
                <div className="space-y-2">
                  {models.map((model, index) => (
                    <div key={model.model} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-swmpi-accent rounded-full"></div>
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

        {/* Top Model Highlight */}
        {topModel && (
          <div className="swmpi-card p-6">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
              <Search className="w-6 h-6 mr-3 text-swmpi-accent" />
              Top-Modell des Monats
            </h2>

            <div className="bg-gradient-to-r from-swmpi-primary/20 to-swmpi-secondary/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-swmpi-text mb-2">
                    {topModel.model}
                  </h3>
                  <p className="text-swmpi-text-muted">
                    {topModel.count.toLocaleString()} Anfragen ({topModelPercentage}% der Gesamtnutzung)
                  </p>
                </div>
                <div className="text-6xl text-swmpi-accent">
                  <Trophy className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Patterns */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-swmpi-accent" />
            Nutzungsmuster
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-swmpi-text mb-2">
                {totalModels}
              </div>
              <div className="text-swmpi-text-muted">Verschiedene Modelle</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-swmpi-text mb-2">
                {monthData.trendData.length}
              </div>
              <div className="text-swmpi-text-muted">Tage mit Aktivität</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-swmpi-text mb-2">
                {Math.max(...monthData.trendData.map(d => d.requests), 0)}
              </div>
              <div className="text-swmpi-text-muted">Max. Anfragen/Tag</div>
            </div>
          </div>
        </div>

        {/* Search Modes and Database Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="swmpi-card p-6">
            <h3 className="text-xl font-display font-bold text-swmpi-text mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-swmpi-accent" />
              Suchmodi-Verwendung ({monthName.split(' ')[0]})
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-swmpi-primary/10">
                <span className="text-swmpi-text-muted">Internet-Suche</span>
                <span className="text-swmpi-accent font-mono">{monthStats.searchModes.internet}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-swmpi-primary/10">
                <span className="text-swmpi-text-muted">GPT-Suche</span>
                <span className="text-swmpi-accent font-mono">{monthStats.searchModes.database}%</span>
              </div>
            </div>
          </div>

          <div className="swmpi-card p-6">
            <h3 className="text-xl font-display font-bold text-swmpi-text mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2 text-swmpi-accent" />
              Datenbank-Nutzung ({monthName.split(' ')[0]})
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-swmpi-primary/10">
                <span className="text-swmpi-text-muted">Mit Datenbank</span>
                <span className="text-swmpi-accent font-mono">
                  {monthStats.databaseUsage.hasData ? `${monthStats.databaseUsage.withDatabase}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-swmpi-primary/10">
                <span className="text-swmpi-text-muted">Ohne Datenbank</span>
                <span className="text-swmpi-accent font-mono">
                  {monthStats.databaseUsage.hasData ? `${monthStats.databaseUsage.withoutDatabase}%` : 'N/A'}
                </span>
              </div>
              {!monthStats.databaseUsage.hasData && (
                <div className="text-xs text-swmpi-text-muted mt-3 p-2 bg-swmpi-primary/5 rounded">
                  ℹ️ Datenbank-Informationen sind in der aktuellen Datenstruktur nicht verfügbar
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthDetailView;
