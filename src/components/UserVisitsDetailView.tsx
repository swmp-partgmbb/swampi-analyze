import React from 'react';
import { ArrowLeft, TrendingUp, BarChart3, Users, Target, Award, UserCheck, Activity } from 'lucide-react';
import { UserVisitsPeriod } from '../types';
import UserVisitsChart from './UserVisitsChart';

interface UserVisitsDetailViewProps {
  periodData: UserVisitsPeriod;
  periodName: string;
  onBack: () => void;
}

const UserVisitsDetailView: React.FC<UserVisitsDetailViewProps> = ({
  periodData,
  periodName,
  onBack
}) => {
  const maxVisits = Math.max(...periodData.userVisits.map(u => u.visitCount));
  const minVisits = Math.min(...periodData.userVisits.map(u => u.visitCount));

  // Calculate distribution statistics
  const visitCounts = periodData.userVisits.map(u => u.visitCount);
  const medianVisits = visitCounts.sort((a, b) => a - b)[Math.floor(visitCounts.length / 2)];

  // Group users by visit frequency
  const userGroups = periodData.userVisits.reduce((acc, user) => {
    let category = '1 Besuch';
    if (user.visitCount >= 10) category = '10+ Besuche';
    else if (user.visitCount >= 5) category = '5-9 Besuche';
    else if (user.visitCount >= 2) category = '2-4 Besuche';

    if (!acc[category]) acc[category] = [];
    acc[category].push(user);
    return acc;
  }, {} as { [key: string]: typeof periodData.userVisits });

  // Calculate retention-like metric (if we had previous period data)
  const highEngagementUsers = periodData.userVisits.filter(u => u.visitCount >= 5).length;
  const highEngagementPercentage = periodData.totalUsers > 0 ? (highEngagementUsers / periodData.totalUsers * 100) : 0;

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
              {periodName}
            </h1>
            <p className="text-swmpi-text-muted mt-2">Detaillierte Besuchsanalyse</p>
          </div>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="swmpi-card p-6 text-center">
            <Users className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {periodData.totalUsers}
            </div>
            <div className="text-sm text-swmpi-text-muted">Aktive Benutzer</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Activity className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {periodData.totalVisits.toLocaleString()}
            </div>
            <div className="text-sm text-swmpi-text-muted">Gesamt-Besuche</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <TrendingUp className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {periodData.averageVisitsPerUser.toFixed(1)}
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø Besuche/Benutzer</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Target className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {highEngagementPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-swmpi-text-muted">Hoch-engagierte Benutzer</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Activity Chart */}
          <div className="swmpi-card p-6">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-swmpi-accent" />
              Top-Benutzer Aktivität
            </h2>
            <UserVisitsChart data={[periodData]} viewMode="period-detail" />
          </div>

          {/* User Distribution */}
          <div className="swmpi-card p-6">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-swmpi-accent" />
              Benutzer-Verteilung
            </h2>
            <div className="space-y-4">
              {Object.entries(userGroups).map(([category, users]) => {
                const percentage = (users.length / periodData.totalUsers * 100).toFixed(1);
                const totalVisitsInGroup = users.reduce((sum, user) => sum + user.visitCount, 0);
                const avgVisitsInGroup = totalVisitsInGroup / users.length;

                return (
                  <div key={category} className="bg-swmpi-primary/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-display font-bold text-swmpi-text">
                        {category}
                      </h3>
                      <div className="text-sm text-swmpi-accent font-mono">
                        {users.length} Benutzer ({percentage}%)
                      </div>
                    </div>
                    <div className="text-sm text-swmpi-text-muted">
                      Ø {avgVisitsInGroup.toFixed(1)} Besuche pro Benutzer
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed User Analysis */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <UserCheck className="w-6 h-6 mr-3 text-swmpi-accent" />
            Detaillierte Benutzer-Analyse
          </h2>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="swmpi-table">
              <thead className="sticky top-0 bg-swmpi-card">
                <tr>
                  <th className="text-left">Benutzer</th>
                  <th className="text-center">Besuche</th>
                  <th className="text-center">Engagement</th>
                  <th className="text-center">E-Mail</th>
                </tr>
              </thead>
              <tbody>
                {periodData.userVisits.map((user) => {
                  const engagement = user.visitCount >= 10 ? 'Hoch' :
                                   user.visitCount >= 5 ? 'Mittel' : 'Niedrig';
                  const engagementColor = user.visitCount >= 10 ? 'text-green-400' :
                                        user.visitCount >= 5 ? 'text-yellow-400' : 'text-red-400';

                  return (
                    <tr key={user.email} className="border-b border-swmpi-primary/20">
                      <td className="font-medium text-swmpi-text">
                        {user.name.split(' | ')[0]}
                      </td>
                      <td className="text-center font-mono text-swmpi-text-muted">
                        {user.visitCount}
                      </td>
                      <td className="text-center">
                        <span className={`font-medium ${engagementColor}`}>
                          {engagement}
                        </span>
                      </td>
                      <td className="text-center text-xs text-swmpi-text-muted">
                        {user.email}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top User Highlight */}
        {periodData.topUsers[0] && (
          <div className="swmpi-card p-6">
            <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-swmpi-accent" />
              Aktivster Benutzer des Zeitraums
            </h2>

            <div className="bg-gradient-to-r from-swmpi-primary/20 to-swmpi-secondary/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-display font-bold text-swmpi-text mb-2">
                    {periodData.topUsers[0].name.split(' | ')[0]}
                  </h3>
                  <p className="text-swmpi-text-muted">
                    {periodData.topUsers[0].visitCount} Besuche
                  </p>
                  <p className="text-sm text-swmpi-text-muted mt-1">
                    {periodData.topUsers[0].email}
                  </p>
                </div>
                <div className="text-6xl text-swmpi-accent">
                  <Award className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-swmpi-accent" />
            Besuchsstatistiken
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-swmpi-text mb-2">
                {maxVisits}
              </div>
              <div className="text-swmpi-text-muted">Max. Besuche</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-swmpi-text mb-2">
                {medianVisits}
              </div>
              <div className="text-swmpi-text-muted">Median Besuche</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-swmpi-text mb-2">
                {minVisits}
              </div>
              <div className="text-swmpi-text-muted">Min. Besuche</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-swmpi-text mb-2">
                {highEngagementUsers}
              </div>
              <div className="text-swmpi-text-muted">Benutzer (5+ Besuche)</div>
            </div>
          </div>
        </div>

        {/* Engagement Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="swmpi-card p-6">
            <h3 className="text-xl font-display font-bold text-swmpi-text mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-swmpi-accent" />
              Engagement-Kategorien
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-green-400/10">
                <span className="text-swmpi-text-muted">Hoch (10+ Besuche)</span>
                <span className="text-green-400 font-mono">
                  {periodData.userVisits.filter(u => u.visitCount >= 10).length} Benutzer
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-400/10">
                <span className="text-swmpi-text-muted">Mittel (5-9 Besuche)</span>
                <span className="text-yellow-400 font-mono">
                  {periodData.userVisits.filter(u => u.visitCount >= 5 && u.visitCount < 10).length} Benutzer
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-red-400/10">
                <span className="text-swmpi-text-muted">Niedrig (1-4 Besuche)</span>
                <span className="text-red-400 font-mono">
                  {periodData.userVisits.filter(u => u.visitCount < 5).length} Benutzer
                </span>
              </div>
            </div>
          </div>

          <div className="swmpi-card p-6">
            <h3 className="text-xl font-display font-bold text-swmpi-text mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-swmpi-accent" />
              Aktivitäts-Übersicht
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-swmpi-primary/10">
                <span className="text-swmpi-text-muted">Gesamt-Besuche</span>
                <span className="text-swmpi-accent font-mono">
                  {periodData.totalVisits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-swmpi-primary/10">
                <span className="text-swmpi-text-muted">Ø pro Benutzer</span>
                <span className="text-swmpi-accent font-mono">
                  {periodData.averageVisitsPerUser.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-swmpi-primary/10">
                <span className="text-swmpi-text-muted">Engagement-Rate</span>
                <span className="text-swmpi-accent font-mono">
                  {highEngagementPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVisitsDetailView;
