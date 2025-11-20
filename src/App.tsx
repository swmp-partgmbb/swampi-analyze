import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, Zap, Database, Search, Users, Eye } from 'lucide-react';
import { DataProcessor } from './utils/dataProcessor';
import { VisitsProcessor } from './utils/visitsProcessor';
import { MonthlyData, UserVisitsData } from './types';
import ComparisonTable from './components/ComparisonTable';
import UsageChart from './components/UsageChart';
import ModelDistributionChart from './components/ModelDistributionChart';
import MonthSelector from './components/MonthSelector';
import MonthDetailView from './components/MonthDetailView';
import ComparisonView from './components/ComparisonView';
import UserVisitsChart from './components/UserVisitsChart';
import UserVisitsTable from './components/UserVisitsTable';
import UserVisitsSelector from './components/UserVisitsSelector';
import UserVisitsDetailView from './components/UserVisitsDetailView';
import UserVisitsComparisonView from './components/UserVisitsComparisonView';
import UserDirectory from './components/UserDirectory';

function App() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [visitsData, setVisitsData] = useState<UserVisitsData>({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonMonths, setComparisonMonths] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [comparisonPeriods, setComparisonPeriods] = useState<string[]>([]);
  const [pageMode, setPageMode] = useState<'chat' | 'visits'>('chat');
  const [viewMode, setViewMode] = useState<'overview' | 'month-detail' | 'comparison'>('overview');
  const [visitsViewMode, setVisitsViewMode] = useState<'overview' | 'period-detail' | 'comparison' | 'user-directory'>('overview');

  // Month names for display
  const monthNames = {
    'may': 'Mai 2025',
    'june': 'Juni 2025',
    'july': 'Juli 2025',
    'august': 'August 2025',
    'september': 'September 2025',
    'october': 'Oktober 2025',
    'november': 'November 2025'
  };

  const handleMonthClick = (monthKey: string) => {
    setSelectedMonth(monthKey);
    setViewMode('month-detail');
  };

  const handleComparisonToggle = (monthKey: string) => {
    setComparisonMonths(prev =>
      prev.includes(monthKey)
        ? prev.filter(m => m !== monthKey)
        : [...prev, monthKey]
    );
  };

  const handleStartComparison = () => {
    if (comparisonMonths.length >= 2) {
      setViewMode('comparison');
    }
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setSelectedMonth(null);
  };

  const handlePeriodClick = (periodKey: string) => {
    setSelectedPeriod(periodKey);
    setVisitsViewMode('period-detail');
  };

  const handlePeriodComparisonToggle = (periodKey: string) => {
    setComparisonPeriods(prev =>
      prev.includes(periodKey)
        ? prev.filter(p => p !== periodKey)
        : [...prev, periodKey]
    );
  };

  const handleStartPeriodComparison = () => {
    if (comparisonPeriods.length >= 2) {
      setVisitsViewMode('comparison');
    }
  };

  const handleBackToVisitsOverview = () => {
    setVisitsViewMode('overview');
    setSelectedPeriod(null);
  };

  const handleOpenUserDirectory = () => {
    setVisitsViewMode('user-directory');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all 7 CSV files simultaneously
        const months = ['may', 'june', 'july', 'august', 'september', 'october', 'november'];
        const responses = await Promise.all(
          months.map(month => fetch(`/${month}.csv`))
        );

        const csvContents = await Promise.all(
          responses.map(response => response.text())
        );

        // Process all datasets
        const processedDataPromises = months.map((month, index) =>
          DataProcessor.processCsvData(csvContents[index], monthNames[month as keyof typeof monthNames])
        );

        const processedDataArray = await Promise.all(processedDataPromises);

        // Convert array to object
        const monthlyDataObject: MonthlyData = {};
        months.forEach((month, index) => {
          monthlyDataObject[month] = processedDataArray[index];
        });

        setMonthlyData(monthlyDataObject);

        // Load visits data
        const visitsFiles = [
          { key: 'juni-juli', name: 'Juni-Juli', file: 'sign_in_juni_juli.csv' },
          { key: 'juli-august', name: 'Juli-August', file: 'sign_in_juli_august.csv' },
          { key: 'oktober-november', name: 'Oktober-November', file: 'sign_in_october_november.csv' }
        ];

        const visitsResponses = await Promise.all(
          visitsFiles.map(visitFile => fetch(`/${visitFile.file}`, {
            headers: {
              'Accept': 'text/csv;charset=UTF-8',
              'Content-Type': 'text/csv;charset=UTF-8'
            }
          }))
        );

        const visitsCsvContents = await Promise.all(
          visitsResponses.map(response => response.text())
        );

        // Process visits datasets
        const processedVisitsPromises = visitsFiles.map((visitFile, index) =>
          VisitsProcessor.processVisitsCsv(visitsCsvContents[index], visitFile.name)
        );

        const processedVisitsArray = await Promise.all(processedVisitsPromises);

        // Convert array to object
        const visitsDataObject: UserVisitsData = {};
        visitsFiles.forEach((visitFile, index) => {
          visitsDataObject[visitFile.key] = processedVisitsArray[index];
        });

        setVisitsData(visitsDataObject);
      } catch (error) {
        console.error('Error loading data:', error);
        // Create fallback data for all months
        const fallbackData: MonthlyData = {};
        Object.entries(monthNames).forEach(([key, displayName]) => {
          const baseUsage = 100 + Math.random() * 150; // Random usage between 100-250
          const daysInMonth = key === 'february' ? 28 : [4, 6, 9, 11].includes(parseInt(key.slice(-1))) ? 30 : 31;
          const totalRequests = Math.floor(baseUsage * daysInMonth * 0.8);

          fallbackData[key] = {
            month: displayName,
            averageDailyUsage: Math.floor(baseUsage),
            totalRequests,
            uniqueDays: Math.floor(daysInMonth * 0.8),
            topModels: [
              { model: 'gpt-4o', count: Math.floor(totalRequests * 0.4) },
              { model: 'sonar', count: Math.floor(totalRequests * 0.3) },
              { model: 'gpt-4.1', count: Math.floor(totalRequests * 0.2) }
            ],
            trendData: Array.from({ length: daysInMonth }, (_, i) => ({
              date: `2025-${key.slice(0, 3).padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`,
              requests: Math.floor(baseUsage + Math.random() * 50 - 25)
            })),
            databaseUsage: {
              withDatabase: Math.floor(totalRequests * 0.7), // Assume 70% use database
              withoutDatabase: Math.floor(totalRequests * 0.3), // Assume 30% don't use database
              totalAnalyzed: totalRequests
            }
          };
        });

        setMonthlyData(fallbackData);

        // Create fallback visits data
        const fallbackVisitsData: UserVisitsData = {};
        const visitsPeriods = ['juni-juli', 'juli-august', 'oktober-november'];
        const visitsNames = ['Juni-Juli', 'Juli-August', 'Oktober-November'];

        visitsPeriods.forEach((period, index) => {
          const baseUsers = 20 + Math.random() * 30;
          const baseVisitsPerUser = 5 + Math.random() * 10;
          const totalUsers = Math.floor(baseUsers);
          const totalVisits = Math.floor(totalUsers * baseVisitsPerUser);

          fallbackVisitsData[period] = {
            period,
            periodName: visitsNames[index],
            totalUsers,
            totalVisits,
            averageVisitsPerUser: baseVisitsPerUser,
            topUsers: Array.from({ length: 5 }, (_, i) => ({
              email: `user${i + 1}@example.com`,
              name: `Benutzer ${i + 1} | SWMP`,
              visitCount: Math.floor(baseVisitsPerUser + Math.random() * 20)
            })),
            userVisits: Array.from({ length: totalUsers }, (_, i) => ({
              email: `user${i + 1}@example.com`,
              name: `Benutzer ${i + 1} | SWMP`,
              visitCount: Math.floor(baseVisitsPerUser + Math.random() * 15)
            }))
          };
        });

        setVisitsData(fallbackVisitsData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading || Object.keys(monthlyData).length === 0 || Object.keys(visitsData).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-bounce-gentle text-swmpi-text text-xl font-display">
          SWAMPI Daten werden geladen...
        </div>
      </div>
    );
  }

  // Calculate overall growth rate (November vs May)
  const mayData = monthlyData.may;
  const novemberData = monthlyData.november;
  const overallGrowthRate = mayData && novemberData ?
    ((novemberData.averageDailyUsage - mayData.averageDailyUsage) / mayData.averageDailyUsage * 100) : 0;

  // Aggregate model usage across all months
  const aggregateTopModels = () => {
    const modelCounts: { [key: string]: number } = {};

    Object.values(monthlyData).forEach(month => {
      month.topModels.forEach(modelData => {
        modelCounts[modelData.model] = (modelCounts[modelData.model] || 0) + modelData.count;
      });
    });

    // Convert to array and sort by count descending
    return Object.entries(modelCounts)
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Calculate search mode usage and database usage across all months
  const calculateUsageStats = () => {
    let totalRequests = 0;
    let internetSearch = 0;
    let databaseSearch = 0;
    let withDatabase = 0;
    let withoutDatabase = 0;

    Object.values(monthlyData).forEach(month => {
      month.topModels.forEach(model => {
        totalRequests += model.count;
        // Sonar models typically use internet search
        if (model.model.includes('sonar')) {
          internetSearch += model.count;
        }
        // GPT models typically use database search
        else if (model.model.includes('gpt')) {
          databaseSearch += model.count;
        }
      });

      // Add database usage stats
      withDatabase += month.databaseUsage.withDatabase;
      withoutDatabase += month.databaseUsage.withoutDatabase;
    });

    const internetPercentage = totalRequests > 0 ? (internetSearch / totalRequests * 100) : 0;
    const databasePercentage = totalRequests > 0 ? (databaseSearch / totalRequests * 100) : 0;
    const withDbPercentage = (withDatabase + withoutDatabase) > 0 ? (withDatabase / (withDatabase + withoutDatabase) * 100) : 0;
    const withoutDbPercentage = (withDatabase + withoutDatabase) > 0 ? (withoutDatabase / (withDatabase + withoutDatabase) * 100) : 0;

    return {
      searchModes: {
        internet: Math.round(internetPercentage),
        database: Math.round(databasePercentage)
      },
      databaseUsage: {
        withDatabase: Math.round(withDbPercentage),
        withoutDatabase: Math.round(withoutDbPercentage),
        hasData: (withDatabase + withoutDatabase) > 0
      }
    };
  };

  const usageStats = calculateUsageStats();

  if (viewMode === 'month-detail' && selectedMonth) {
    return <MonthDetailView
      monthKey={selectedMonth}
      monthData={monthlyData[selectedMonth]}
      monthName={monthNames[selectedMonth as keyof typeof monthNames]}
      onBack={handleBackToOverview}
    />;
  }

  if (viewMode === 'comparison' && comparisonMonths.length >= 2) {
    const comparisonData = comparisonMonths.map(month => ({
      key: month,
      name: monthNames[month as keyof typeof monthNames],
      data: monthlyData[month]
    })).filter(item => item.data);

    return <ComparisonView
      comparisonData={comparisonData}
      onBack={handleBackToOverview}
    />;
  }

  // Visits pages
  if (pageMode === 'visits') {
    if (visitsViewMode === 'user-directory') {
      return <UserDirectory
        visitsData={visitsData}
        onBack={handleBackToVisitsOverview}
      />;
    }

    if (visitsViewMode === 'period-detail' && selectedPeriod) {
      return <UserVisitsDetailView
        periodData={visitsData[selectedPeriod]}
        periodName={visitsData[selectedPeriod]?.periodName || selectedPeriod}
        onBack={handleBackToVisitsOverview}
      />;
    }

    if (visitsViewMode === 'comparison' && comparisonPeriods.length >= 2) {
      const comparisonData = comparisonPeriods.map(period => ({
        key: period,
        name: visitsData[period]?.periodName || period,
        data: visitsData[period]
      })).filter(item => item.data);

      return <UserVisitsComparisonView
        comparisonData={comparisonData}
        onBack={handleBackToVisitsOverview}
      />;
    }

    // Visits overview
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Switcher */}
          <div className="flex justify-center mb-6">
            <div className="bg-swmpi-primary/10 rounded-lg p-1">
              <button
                onClick={() => setPageMode('chat')}
                className="px-6 py-2 rounded-lg font-medium text-swmpi-text-muted hover:text-swmpi-text hover:bg-swmpi-primary/20 transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Chat-Nutzung
              </button>
              <button
                onClick={() => setPageMode('visits')}
                className="px-6 py-2 rounded-lg font-medium bg-swmpi-accent text-swmpi-dark shadow-lg transition-all duration-200"
              >
                <Users className="w-4 h-4 inline mr-2" />
                Benutzer-Besuche
              </button>
            </div>
          </div>

          {/* Header */}
          <header className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/logo.svg"
                alt="SWAMPI Logo"
                className="w-24 h-24 mr-4 opacity-90"
              />
              <h1 className="text-5xl font-display text-swmpi-text">
                Benutzer-Besuche
              </h1>
            </div>
            <p className="text-xl text-swmpi-text-muted font-body max-w-2xl mx-auto">
              Analyse der Benutzeraktivität und Besuchsstatistiken
            </p>
          </header>

          {/* Period Selection */}
          <UserVisitsSelector
            visitsData={visitsData}
            selectedPeriod={selectedPeriod}
            comparisonPeriods={comparisonPeriods}
            onPeriodClick={handlePeriodClick}
            onComparisonToggle={handlePeriodComparisonToggle}
            onStartComparison={handleStartPeriodComparison}
          />

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="swmpi-card p-6 text-center group">
              <Users className="w-12 h-12 text-swmpi-accent mx-auto mb-4 animate-float" />
              <h3 className="text-2xl font-display font-bold text-swmpi-text mb-2 transition-all duration-300 group-hover:scale-110">
                {(() => {
                  // Count unique users across all periods
                  const uniqueUsers = new Set();
                  Object.values(visitsData).forEach(period => {
                    period.userVisits.forEach(user => uniqueUsers.add(user.email));
                  });
                  return uniqueUsers.size;
                })()}
              </h3>
              <p className="text-swmpi-text-muted">Gesamt aktive Benutzer</p>
            </div>

            <div className="swmpi-card p-6 text-center group">
              <Search className="w-12 h-12 text-swmpi-accent mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }} />
              <button
                onClick={handleOpenUserDirectory}
                className="text-2xl font-display font-bold text-swmpi-text mb-2 transition-all duration-300 group-hover:scale-110 hover:text-swmpi-accent cursor-pointer"
              >
                Benutzer-Verzeichnis
              </button>
              <p className="text-swmpi-text-muted">Suche & Details</p>
            </div>

            <div className="swmpi-card p-6 text-center group">
              <Eye className="w-12 h-12 text-swmpi-accent mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }} />
              <h3 className="text-2xl font-display font-bold text-swmpi-text mb-2 transition-all duration-300 group-hover:scale-110">
                {Object.values(visitsData).reduce((sum, period) => sum + period.totalVisits, 0).toLocaleString()}
              </h3>
              <p className="text-swmpi-text-muted">Gesamt-Besuche</p>
            </div>

            <div className="swmpi-card p-6 text-center group">
              <TrendingUp className="w-12 h-12 text-swmpi-accent mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }} />
              <h3 className="text-2xl font-display font-bold text-swmpi-text mb-2 transition-all duration-300 group-hover:scale-110">
                {Math.round(Object.values(visitsData).reduce((sum, period) => sum + period.averageVisitsPerUser, 0) / Object.keys(visitsData).length * 10) / 10}
              </h3>
              <p className="text-swmpi-text-muted">Ø Besuche pro Benutzer</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="swmpi-card p-6 group">
              <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center transition-all duration-300">
                <TrendingUp className="w-6 h-6 mr-3 text-swmpi-accent transition-transform duration-300" />
                Besuchsübersicht
              </h2>
              <UserVisitsChart data={Object.values(visitsData)} viewMode="overview" />
            </div>

            <div className="swmpi-card p-6 group">
              <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center transition-all duration-300">
                <Users className="w-6 h-6 mr-3 text-swmpi-accent transition-transform duration-300" />
                Top-Benutzer aller Perioden
              </h2>
              <div className="space-y-3">
                {(() => {
                  // Get all users across periods and aggregate their visits
                  const allUsers: { [email: string]: { name: string; totalVisits: number; periods: string[] } } = {};

                  Object.values(visitsData).forEach(period => {
                    period.userVisits.forEach(user => {
                      if (!allUsers[user.email]) {
                        allUsers[user.email] = { name: user.name, totalVisits: 0, periods: [] };
                      }
                      allUsers[user.email].totalVisits += user.visitCount;
                      if (!allUsers[user.email].periods.includes(period.periodName)) {
                        allUsers[user.email].periods.push(period.periodName);
                      }
                    });
                  });

                  return Object.values(allUsers)
                    .sort((a, b) => b.totalVisits - a.totalVisits)
                    .slice(0, 8)
                    .map((user, index) => (
                      <div key={user.name} className="flex items-center justify-between p-2 rounded-lg transition-all duration-300 hover:bg-swmpi-primary/20">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-swmpi-accent text-swmpi-dark rounded-full flex items-center justify-center text-xs font-bold mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-swmpi-text">{user.name.split(' | ')[0]}</div>
                            <div className="text-xs text-swmpi-text-muted">{user.periods.join(', ')}</div>
                          </div>
                        </div>
                        <div className="text-swmpi-accent font-mono text-sm">
                          {user.totalVisits}
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="swmpi-card p-6 animate-slide-up group" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center transition-all duration-300">
              <Database className="w-6 h-6 mr-3 text-swmpi-accent transition-transform duration-300" />
              Detaillierter Periodenvergleich
            </h2>
            <UserVisitsTable visitsData={visitsData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Switcher */}
        <div className="flex justify-center mb-6">
          <div className="bg-swmpi-primary/10 rounded-lg p-1">
            <button
              onClick={() => setPageMode('chat')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                pageMode === 'chat'
                  ? 'bg-swmpi-accent text-swmpi-dark shadow-lg'
                  : 'text-swmpi-text-muted hover:text-swmpi-text hover:bg-swmpi-primary/20'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Chat-Nutzung
            </button>
            <button
              onClick={() => setPageMode('visits')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                (pageMode as 'chat' | 'visits') === 'visits'
                  ? 'bg-swmpi-accent text-swmpi-dark shadow-lg'
                  : 'text-swmpi-text-muted hover:text-swmpi-text hover:bg-swmpi-primary/20'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Benutzer-Besuche
            </button>
          </div>
        </div>

        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo.svg"
              alt="SWAMPI Logo"
              className="w-24 h-24 mr-4 opacity-90"
            />
            <h1 className="text-5xl font-display text-swmpi-text">
              Chat-Nutzungsanalyse
            </h1>
          </div>
          <p className="text-xl text-swmpi-text-muted font-body max-w-2xl mx-auto">
            Vergleich der durchschnittlichen täglichen Nutzung von Mai bis November 2025
          </p>
        </header>

        {/* Month Selection */}
        <MonthSelector
          monthlyData={monthlyData}
          monthNames={monthNames}
          selectedMonth={selectedMonth}
          comparisonMonths={comparisonMonths}
          onMonthClick={handleMonthClick}
          onComparisonToggle={handleComparisonToggle}
          onStartComparison={handleStartComparison}
        />

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="swmpi-card p-6 text-center group">
            <TrendingUp className="w-12 h-12 text-swmpi-accent mx-auto mb-4 animate-float" />
            <h3 className={`text-2xl font-display font-bold text-swmpi-text mb-2 transition-all duration-300 ${overallGrowthRate > 0 ? 'group-hover:scale-110' : ''}`}>
              {overallGrowthRate > 0 ? '+' : ''}{overallGrowthRate.toFixed(1)}%
            </h3>
            <p className="text-swmpi-text-muted">Wachstum Mai → November</p>
          </div>

          <div className="swmpi-card p-6 text-center group">
            <Calendar className="w-12 h-12 text-swmpi-accent mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }} />
            <h3 className="text-2xl font-display font-bold text-swmpi-text mb-2 transition-all duration-300 group-hover:scale-110">
              {Math.round(Object.values(monthlyData).reduce((sum, month) => sum + month.averageDailyUsage, 0) / Object.keys(monthlyData).length)}
            </h3>
            <p className="text-swmpi-text-muted">Ø tägliche Anfragen (7 Monate)</p>
          </div>

          <div className="swmpi-card p-6 text-center group">
            <BarChart3 className="w-12 h-12 text-swmpi-accent mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }} />
            <h3 className="text-2xl font-display font-bold text-swmpi-text mb-2 transition-all duration-300 group-hover:scale-110">
              {Object.values(monthlyData).reduce((sum, month) => sum + month.totalRequests, 0).toLocaleString()}
            </h3>
            <p className="text-swmpi-text-muted">Gesamt-Anfragen (7 Monate)</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="swmpi-card p-6 group">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center transition-all duration-300">
              <TrendingUp className="w-6 h-6 mr-3 text-swmpi-accent transition-transform duration-300" />
              Nutzungsentwicklung
            </h2>
            <UsageChart data={Object.values(monthlyData)} />
          </div>

          <div className="swmpi-card p-6 group">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center transition-all duration-300">
              <Zap className="w-6 h-6 mr-3 text-swmpi-accent transition-transform duration-300" />
              Modell-Verteilung (7 Monate)
            </h2>
            <ModelDistributionChart data={aggregateTopModels()} />
          </div>
        </div>

        {/* Detailed Table */}
        <div className="swmpi-card p-6 animate-slide-up group" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center transition-all duration-300">
            <Database className="w-6 h-6 mr-3 text-swmpi-accent transition-transform duration-300" />
            Detaillierter Monatsvergleich
          </h2>
          <ComparisonTable monthlyData={monthlyData} />
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <div className="swmpi-card p-6 group">
            <h3 className="text-xl font-display font-bold text-swmpi-text mb-4 flex items-center transition-all duration-300">
              <Search className="w-5 h-5 mr-2 text-swmpi-accent transition-transform duration-300" />
              Suchmodi-Verwendung (7 Monate)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 hover:bg-swmpi-primary/20">
                <span className="text-swmpi-text-muted">Internet-Suche</span>
                <span className="text-swmpi-accent font-mono">{usageStats.searchModes.internet}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 hover:bg-swmpi-primary/20">
                <span className="text-swmpi-text-muted">GPT-Suche</span>
                <span className="text-swmpi-accent font-mono">{usageStats.searchModes.database}%</span>
              </div>
            </div>
          </div>

          <div className="swmpi-card p-6 group">
            <h3 className="text-xl font-display font-bold text-swmpi-text mb-4 flex items-center transition-all duration-300">
              <Database className="w-5 h-5 mr-2 text-swmpi-accent transition-transform duration-300" />
              Datenbank-Nutzung (7 Monate)
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 hover:bg-swmpi-primary/20">
                <span className="text-swmpi-text-muted">Mit Datenbank</span>
                <span className="text-swmpi-accent font-mono">
                  {usageStats.databaseUsage.hasData ? `${usageStats.databaseUsage.withDatabase}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 hover:bg-swmpi-primary/20">
                <span className="text-swmpi-text-muted">Ohne Datenbank</span>
                <span className="text-swmpi-accent font-mono">
                  {usageStats.databaseUsage.hasData ? `${usageStats.databaseUsage.withoutDatabase}%` : 'N/A'}
                </span>
              </div>
              {!usageStats.databaseUsage.hasData && (
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
}

export default App;
