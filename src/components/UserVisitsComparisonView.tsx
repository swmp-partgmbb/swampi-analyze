import React from 'react';
import { ArrowLeft, TrendingUp, Users, Target, Award, UserCheck, Activity } from 'lucide-react';
import { UserVisitsPeriod } from '../types';

interface ComparisonData {
  key: string;
  name: string;
  data: UserVisitsPeriod;
}

interface UserVisitsComparisonViewProps {
  comparisonData: ComparisonData[];
  onBack: () => void;
}

const UserVisitsComparisonView: React.FC<UserVisitsComparisonViewProps> = ({ comparisonData, onBack }) => {
  if (comparisonData.length < 2) return null;

  // Calculate comparison metrics
  const totalUsers = comparisonData.reduce((sum, item) => sum + item.data.totalUsers, 0);
  const totalVisits = comparisonData.reduce((sum, item) => sum + item.data.totalVisits, 0);
  const avgVisitsPerUser = comparisonData.reduce((sum, item) => sum + item.data.averageVisitsPerUser, 0) / comparisonData.length;

  // Find best performing periods
  const bestPeriod = comparisonData.reduce((best, current) =>
    current.data.totalVisits > best.data.totalVisits ? current : best
  );

  const worstPeriod = comparisonData.reduce((worst, current) =>
    current.data.totalVisits < worst.data.totalVisits ? current : worst
  );

  // Calculate growth and changes
  let firstPeriod: ComparisonData | null = null;
  let lastPeriod: ComparisonData | null = null;

  if (comparisonData.length >= 2) {
    const sortedByDate = [...comparisonData].sort((a, b) => {
      const periodOrder = ['Juni-Juli', 'Juli-August', 'Oktober-November'];
      return periodOrder.indexOf(a.name) - periodOrder.indexOf(b.name);
    });

    firstPeriod = sortedByDate[0];
    lastPeriod = sortedByDate[sortedByDate.length - 1];
  }

  // Calculate user retention
  const calculateRetention = () => {
    if (comparisonData.length < 2) return 0;

    const sortedPeriods = [...comparisonData].sort((a, b) => {
      const periodOrder = ['Juni-Juli', 'Juli-August', 'Oktober-November'];
      return periodOrder.indexOf(a.name) - periodOrder.indexOf(b.name);
    });

    const firstUsers = new Set(sortedPeriods[0].data.userVisits.map(u => u.email));
    const lastUsers = new Set(sortedPeriods[sortedPeriods.length - 1].data.userVisits.map(u => u.email));

    const retainedUsers = Array.from(firstUsers).filter(email => lastUsers.has(email));
    return Math.round((retainedUsers.length / firstUsers.size) * 100);
  };

  const retentionRate = calculateRetention();

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
              Besuchsvergleich
            </h1>
            <p className="text-swmpi-text-muted mt-2">
              Vergleich von {comparisonData.length} Perioden
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-swmpi-text-muted">
              Verglichene Perioden:
            </div>
            <div className="text-sm text-swmpi-text">
              {comparisonData.map(item => item.name).join(', ')}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="swmpi-card p-6 text-center">
            <Users className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {totalUsers}
            </div>
            <div className="text-sm text-swmpi-text-muted">Gesamt-Benutzer</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Activity className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {totalVisits.toLocaleString()}
            </div>
            <div className="text-sm text-swmpi-text-muted">Gesamt-Besuche</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <TrendingUp className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {avgVisitsPerUser.toFixed(1)}
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø Besuche/Benutzer</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Target className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {comparisonData.length}
            </div>
            <div className="text-sm text-swmpi-text-muted">Verglichene Perioden</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <UserCheck className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {retentionRate}%
            </div>
            <div className="text-sm text-swmpi-text-muted">Benutzer-Retention</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Award className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {Math.round(totalVisits / totalUsers)}
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø Besuche pro Benutzer</div>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="swmpi-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-display font-bold text-swmpi-text">
                Aktivste Periode
              </h3>
            </div>
            <div className="bg-green-400/10 rounded-lg p-4">
              <div className="text-lg font-bold text-swmpi-text mb-1">
                {bestPeriod.name}
              </div>
              <div className="text-sm text-swmpi-text-muted">
                {bestPeriod.data.totalVisits} Besuche von {bestPeriod.data.totalUsers} Benutzern
              </div>
            </div>
          </div>

          <div className="swmpi-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-display font-bold text-swmpi-text">
                Niedrigste Periode
              </h3>
            </div>
            <div className="bg-blue-400/10 rounded-lg p-4">
              <div className="text-lg font-bold text-swmpi-text mb-1">
                {worstPeriod.name}
              </div>
              <div className="text-sm text-swmpi-text-muted">
                {worstPeriod.data.totalVisits} Besuche von {worstPeriod.data.totalUsers} Benutzern
              </div>
            </div>
          </div>
        </div>

        {/* User Visits Comparison Chart
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-swmpi-accent" />
            Vergleich der Benutzeraktivität
          </h2>
          <UserVisitsChart data={comparisonData.map(item => item.data)} viewMode="comparison" />
        </div> */}

        {/* Detailed Period Comparison */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-swmpi-accent" />
            Detaillierter Periodenvergleich
          </h2>

          <div className="overflow-x-auto">
            <table className="swmpi-table">
              <thead>
                <tr>
                  <th className="text-left">Metrik</th>
                  {comparisonData.map(item => (
                    <th key={item.key} className="text-center">
                      {item.name}
                    </th>
                  ))}
                  <th className="text-center">Differenz</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Aktive Benutzer</td>
                  {comparisonData.map(item => (
                    <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                      {item.data.totalUsers}
                    </td>
                  ))}
                  <td className="text-center">
                    {firstPeriod && lastPeriod && (
                      <span className={`font-mono ${lastPeriod.data.totalUsers - firstPeriod.data.totalUsers >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lastPeriod.data.totalUsers - firstPeriod.data.totalUsers > 0 ? '+' : ''}
                        {lastPeriod.data.totalUsers - firstPeriod.data.totalUsers}
                      </span>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Gesamt-Besuche</td>
                  {comparisonData.map(item => (
                    <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                      {item.data.totalVisits.toLocaleString()}
                    </td>
                  ))}
                  <td className="text-center">
                    {firstPeriod && lastPeriod && (
                      <span className={`font-mono ${lastPeriod.data.totalVisits - firstPeriod.data.totalVisits >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lastPeriod.data.totalVisits - firstPeriod.data.totalVisits > 0 ? '+' : ''}
                        {(lastPeriod.data.totalVisits - firstPeriod.data.totalVisits).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Ø Besuche/Benutzer</td>
                  {comparisonData.map(item => (
                    <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                      {item.data.averageVisitsPerUser.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-center">
                    {firstPeriod && lastPeriod && (
                      <span className={`font-mono ${(lastPeriod.data.averageVisitsPerUser - firstPeriod.data.averageVisitsPerUser) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(lastPeriod.data.averageVisitsPerUser - firstPeriod.data.averageVisitsPerUser) > 0 ? '+' : ''}
                        {(lastPeriod.data.averageVisitsPerUser - firstPeriod.data.averageVisitsPerUser).toFixed(1)}
                      </span>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-swmpi-primary/20">
                  <td className="font-medium text-swmpi-text">Max. Besuche (Top-Benutzer)</td>
                  {comparisonData.map(item => (
                    <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                      {item.data.topUsers[0]?.visitCount || 0}
                    </td>
                  ))}
                  <td className="text-center">
                    {firstPeriod && lastPeriod && (
                      <span className={`font-mono ${(lastPeriod.data.topUsers[0]?.visitCount || 0) - (firstPeriod.data.topUsers[0]?.visitCount || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(lastPeriod.data.topUsers[0]?.visitCount || 0) - (firstPeriod.data.topUsers[0]?.visitCount || 0) > 0 ? '+' : ''}
                        {(lastPeriod.data.topUsers[0]?.visitCount || 0) - (firstPeriod.data.topUsers[0]?.visitCount || 0)}
                      </span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="font-medium text-swmpi-text">Benutzer-Retention</td>
                  {comparisonData.map((item, index) => {
                    let retention = 'N/A';
                    if (index > 0) {
                      const prevUsers = new Set(comparisonData[index - 1].data.userVisits.map(u => u.email));
                      const currentUsers = new Set(item.data.userVisits.map(u => u.email));
                      const retained = Array.from(prevUsers).filter(email => currentUsers.has(email)).length;
                      retention = `${Math.round(retained / prevUsers.size * 100)}%`;
                    }
                    return (
                      <td key={item.key} className="text-center font-mono text-swmpi-text-muted">
                        {retention}
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <span className={`font-mono ${retentionRate >= 50 ? 'text-green-400' : retentionRate >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                      Gesamt: {retentionRate}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Users Comparison */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <Users className="w-6 h-6 mr-3 text-swmpi-accent" />
            Top-Benutzer im Vergleich
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisonData.map(item => (
              <div key={item.key} className="bg-swmpi-primary/10 rounded-lg p-4">
                <h3 className="text-lg font-display font-bold text-swmpi-text mb-3">
                  {item.name}
                </h3>
                <div className="space-y-2">
                  {item.data.topUsers.slice(0, 5).map((user, index) => (
                    <div key={user.email} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-swmpi-accent'}`}></div>
                        <span className="text-sm text-swmpi-text">{user.name.split(' | ')[0]}</span>
                      </div>
                      <div className="text-sm text-swmpi-accent font-mono">
                        {user.visitCount}
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

export default UserVisitsComparisonView;
