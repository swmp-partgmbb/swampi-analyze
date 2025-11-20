import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Users, Mail, Calendar, TrendingUp, Eye } from 'lucide-react';
import { UserVisitsData } from '../types';

interface AggregatedUser {
  email: string;
  name: string;
  totalVisits: number;
  periods: string[];
  periodVisits: { [periodName: string]: number };
}

interface UserDirectoryProps {
  visitsData: UserVisitsData;
  onBack: () => void;
}

const UserDirectory: React.FC<UserDirectoryProps> = ({ visitsData, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'totalVisits' | 'periods' | 'periodVisits'>('totalVisits');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPeriod, setFilterPeriod] = useState<string | null>(null);

  // Aggregate users across all periods
  const aggregatedUsers = useMemo(() => {
    const userMap: { [email: string]: AggregatedUser } = {};

    Object.values(visitsData).forEach(period => {
      period.userVisits.forEach(user => {
        if (!userMap[user.email]) {
          userMap[user.email] = {
            email: user.email,
            name: user.name,
            totalVisits: 0,
            periods: [],
            periodVisits: {}
          };
        }

        userMap[user.email].totalVisits += user.visitCount;
        userMap[user.email].periodVisits[period.periodName] = user.visitCount;

        if (!userMap[user.email].periods.includes(period.periodName)) {
          userMap[user.email].periods.push(period.periodName);
        }
      });
    });

    return Object.values(userMap);
  }, [visitsData]);

  const allPeriods = Object.values(visitsData).map(p => p.periodName);

  // Filter users based on selected period
  const filteredUsersByPeriod = useMemo(() => {
    if (!filterPeriod) {
      return aggregatedUsers;
    }
    return aggregatedUsers.filter(user => user.periods.includes(filterPeriod));
  }, [aggregatedUsers, filterPeriod]);

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = filteredUsersByPeriod.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalVisits':
          aValue = a.totalVisits;
          bValue = b.totalVisits;
          break;
        case 'periods':
          aValue = a.periods.length;
          bValue = b.periods.length;
          break;
        case 'periodVisits':
          // Sort by visits in the filtered period, or total visits if no filter
          if (filterPeriod) {
            aValue = a.periodVisits[filterPeriod] || 0;
            bValue = b.periodVisits[filterPeriod] || 0;
          } else {
            aValue = a.totalVisits;
            bValue = b.totalVisits;
          }
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [filteredUsersByPeriod, searchTerm, sortBy, sortOrder, filterPeriod]);

  const getEngagementLevel = (totalVisits: number) => {
    if (totalVisits >= 20) return { level: 'Sehr Hoch', color: 'text-green-400', bgColor: 'bg-green-400/10' };
    if (totalVisits >= 10) return { level: 'Hoch', color: 'text-blue-400', bgColor: 'bg-blue-400/10' };
    if (totalVisits >= 5) return { level: 'Mittel', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' };
    return { level: 'Niedrig', color: 'text-red-400', bgColor: 'bg-red-400/10' };
  };

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
              Benutzer-Verzeichnis
            </h1>
            <p className="text-swmpi-text-muted mt-2">
              {filterPeriod
                ? `Benutzer-Aktivitäten im Zeitraum: ${filterPeriod}`
                : 'Alle aktiven Benutzer und ihre Aktivitäten'
              }
            </p>
          </div>

          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        {/* Search and Filters */}
        <div className="swmpi-card p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-swmpi-text-muted" />
              <input
                type="text"
                placeholder="Suche nach Name oder E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-swmpi-primary/10 border border-swmpi-primary/20 rounded-lg text-swmpi-text placeholder-swmpi-text-muted focus:outline-none focus:ring-2 focus:ring-swmpi-accent/50"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <select
                value={filterPeriod || ''}
                onChange={(e) => setFilterPeriod(e.target.value || null)}
                className="px-4 py-3 bg-swmpi-primary/10 border border-swmpi-primary/20 rounded-lg text-swmpi-text focus:outline-none focus:ring-2 focus:ring-swmpi-accent/50"
              >
                <option value="">Alle Perioden</option>
                {allPeriods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'totalVisits' | 'periods' | 'periodVisits')}
                className="px-4 py-3 bg-swmpi-primary/10 border border-swmpi-primary/20 rounded-lg text-swmpi-text focus:outline-none focus:ring-2 focus:ring-swmpi-accent/50"
              >
                <option value="totalVisits">Nach Gesamt-Besuchen</option>
                <option value="periodVisits">Nach Besuchen im Zeitraum</option>
                <option value="name">Nach Name sortieren</option>
                <option value="periods">Nach Perioden sortieren</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-swmpi-primary/10 border border-swmpi-primary/20 rounded-lg text-swmpi-text hover:bg-swmpi-primary/20 transition-colors"
              >
                <TrendingUp className={`w-5 h-5 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-swmpi-text-muted">
            Zeige {filteredAndSortedUsers.length} von {filterPeriod ? filteredUsersByPeriod.length : aggregatedUsers.length} Benutzern
            {filterPeriod && <span> (gefiltert nach: {filterPeriod})</span>}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="swmpi-card p-6 text-center">
            <Users className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {filterPeriod ? filteredUsersByPeriod.length : aggregatedUsers.length}
            </div>
            <div className="text-sm text-swmpi-text-muted">
              {filterPeriod ? `Benutzer in ${filterPeriod}` : 'Gesamt Benutzer'}
            </div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Eye className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {filteredUsersByPeriod.reduce((sum, user) => sum + (filterPeriod ? user.periodVisits[filterPeriod] || 0 : user.totalVisits), 0).toLocaleString()}
            </div>
            <div className="text-sm text-swmpi-text-muted">
              {filterPeriod ? `${filterPeriod}-Besuche` : 'Gesamt-Besuche'}
            </div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <TrendingUp className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {filteredUsersByPeriod.length > 0 ?
                (filteredUsersByPeriod.reduce((sum, user) => sum + (filterPeriod ? user.periodVisits[filterPeriod] || 0 : user.totalVisits), 0) / filteredUsersByPeriod.length).toFixed(1)
                : '0.0'
              }
            </div>
            <div className="text-sm text-swmpi-text-muted">Ø Besuche/Benutzer</div>
          </div>

          <div className="swmpi-card p-6 text-center">
            <Calendar className="w-10 h-10 text-swmpi-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-swmpi-text mb-1">
              {filterPeriod ? 1 : allPeriods.length}
            </div>
            <div className="text-sm text-swmpi-text-muted">
              {filterPeriod ? 'Gewählter Zeitraum' : 'Zeiträume'}
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="swmpi-card p-6">
          <h2 className="text-2xl font-display font-bold text-swmpi-text mb-6 flex items-center">
            <Users className="w-6 h-6 mr-3 text-swmpi-accent" />
            Detaillierte Benutzer-Analyse
          </h2>

          <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="swmpi-table">
              <thead>
                <tr>
                  <th className="text-left">Benutzer</th>
                  <th className="text-center">
                    {filterPeriod ? `${filterPeriod}-Besuche` : 'Gesamt-Besuche'}
                  </th>
                  <th className="text-center">Engagement</th>
                  <th className="text-center">Aktive Perioden</th>
                  {filterPeriod ? (
                    <th className="text-center text-xs">{filterPeriod}</th>
                  ) : (
                    allPeriods.map(period => (
                      <th key={period} className="text-center text-xs">{period}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map((user) => {
                  // Calculate engagement based on filtered data
                  const displayVisits = filterPeriod ? user.periodVisits[filterPeriod] || 0 : user.totalVisits;
                  const currentEngagement = getEngagementLevel(displayVisits);

                  return (
                    <tr key={user.email} className="border-b border-swmpi-primary/20 hover:bg-swmpi-primary/5 transition-colors">
                      <td className="font-medium text-swmpi-text">
                        <div>
                          <div className="font-medium">{user.name.split(' | ')[0]}</div>
                          <div className="text-xs text-swmpi-text-muted flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="font-mono text-lg text-swmpi-accent">
                          {displayVisits}
                        </span>
                        {filterPeriod && (
                          <div className="text-xs text-swmpi-text-muted">
                            (Gesamt: {user.totalVisits})
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentEngagement.bgColor} ${currentEngagement.color}`}>
                          {currentEngagement.level}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="text-sm text-swmpi-text-muted">
                          {user.periods.length} / {allPeriods.length}
                        </div>
                        <div className="text-xs text-swmpi-text-muted mt-1">
                          {user.periods.join(', ')}
                        </div>
                      </td>
                      {filterPeriod ? (
                        <td className="text-center">
                          <span className={`font-mono text-sm ${
                            user.periodVisits[filterPeriod] ? 'text-swmpi-accent' : 'text-swmpi-text-muted'
                          }`}>
                            {user.periodVisits[filterPeriod] || '—'}
                          </span>
                        </td>
                      ) : (
                        allPeriods.map(period => (
                          <td key={period} className="text-center">
                            <span className={`font-mono text-sm ${
                              user.periodVisits[period] ? 'text-swmpi-accent' : 'text-swmpi-text-muted'
                            }`}>
                              {user.periodVisits[period] || '—'}
                            </span>
                          </td>
                        ))
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-8 text-swmpi-text-muted">
              Keine Benutzer gefunden, die den Suchkriterien entsprechen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDirectory;
