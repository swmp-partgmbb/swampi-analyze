export interface LogEntry {
  TenantId?: string;
  'TimeGenerated [UTC]'?: string;
  Level?: string;
  ResultDescription?: string;
  ContainerId?: string;
  Host?: string;
  OperationName?: string;
  SourceSystem?: string;
  Category?: string;
  Type?: string;
  _ResourceId?: string;
  // Simplified format for newer CSV files
  time?: string;
  resultDescription?: string;
}

export interface DailyUsage {
  date: string;
  totalRequests: number;
  uniqueModels: string[];
  modelUsage: Record<string, number>;
  avgDocumentsPerRequest: number;
}

export interface MonthlyComparison {
  month: string;
  averageDailyUsage: number;
  totalRequests: number;
  uniqueDays: number;
  topModels: Array<{ model: string; count: number }>;
  trendData: Array<{ date: string; requests: number }>;
  databaseUsage: {
    withDatabase: number;
    withoutDatabase: number;
    totalAnalyzed: number;
  };
}

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export interface MonthlyData {
  [month: string]: MonthlyComparison;
}

export interface UserVisit {
  email: string;
  name: string;
  visitCount: number;
}

export interface UserVisitsPeriod {
  period: string;
  periodName: string;
  totalUsers: number;
  totalVisits: number;
  averageVisitsPerUser: number;
  topUsers: UserVisit[];
  userVisits: UserVisit[];
}

export interface UserVisitsData {
  [period: string]: UserVisitsPeriod;
}