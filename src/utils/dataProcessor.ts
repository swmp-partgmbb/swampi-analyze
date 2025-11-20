import Papa from 'papaparse';
import { LogEntry, DailyUsage, MonthlyComparison } from '../types';

export class DataProcessor {
  static async processCsvData(csvContent: string, monthName: string): Promise<MonthlyComparison> {
    return new Promise((resolve, reject) => {
      Papa.parse<LogEntry>(csvContent, {
        header: true,
        complete: (results: Papa.ParseResult<LogEntry>) => {
          try {
            const logs = results.data as LogEntry[];
            const processedData = DataProcessor.analyzeLogs(logs, monthName);
            resolve(processedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: any) => reject(error)
      });
    });
  }

  // Legacy method for backward compatibility
  static async processNovemberData(csvContent: string): Promise<MonthlyComparison> {
    return this.processCsvData(csvContent, 'November 2025');
  }

  static analyzeLogs(logs: LogEntry[], month: string): MonthlyComparison {
    // Filter only INFO logs from routes (actual usage)
    // Support both old Azure format and new simplified format
    const routeLogs = logs.filter(log => {
      const description = log.ResultDescription || log.resultDescription || '';
      return description.includes('INFO - src.routes.routes - Model:');
    });

    // Track database usage
    let withDatabaseCount = 0;
    let withoutDatabaseCount = 0;

    // Group by date
    const dailyData = new Map<string, DailyUsage>();

    routeLogs.forEach(log => {
      const date = this.extractDate(log['TimeGenerated [UTC]'] || log.time);
      if (!date) return;

      const logInfo = this.parseLogDescription(log.ResultDescription || log.resultDescription || '');
      if (!logInfo) return;

      // Track database usage
      if (logInfo.useDatabase) {
        withDatabaseCount++;
      } else {
        withoutDatabaseCount++;
      }

      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          totalRequests: 0,
          uniqueModels: [],
          modelUsage: {},
          avgDocumentsPerRequest: 0
        });
      }

      const dayData = dailyData.get(date)!;
      dayData.totalRequests++;

      // Track model usage
      if (!dayData.modelUsage[logInfo.model]) {
        dayData.modelUsage[logInfo.model] = 0;
      }
      dayData.modelUsage[logInfo.model]++;

      // Update unique models
      if (!dayData.uniqueModels.includes(logInfo.model)) {
        dayData.uniqueModels.push(logInfo.model);
      }
    });

    // Calculate averages
    const dailyUsages = Array.from(dailyData.values());
    const totalRequests = dailyUsages.reduce((sum, day) => sum + day.totalRequests, 0);
    const uniqueDays = dailyUsages.length;
    const averageDailyUsage = uniqueDays > 0 ? totalRequests / uniqueDays : 0;

    // Get top models
    const modelCounts = new Map<string, number>();
    dailyUsages.forEach(day => {
      Object.entries(day.modelUsage).forEach(([model, count]) => {
        modelCounts.set(model, (modelCounts.get(model) || 0) + count);
      });
    });

    const topModels = Array.from(modelCounts.entries())
      .map(([model, count]) => ({ model, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Prepare trend data for charts
    const trendData = dailyUsages
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(day => ({
        date: day.date,
        requests: day.totalRequests
      }));

    return {
      month,
      averageDailyUsage,
      totalRequests,
      uniqueDays,
      topModels,
      trendData,
      databaseUsage: {
        withDatabase: withDatabaseCount,
        withoutDatabase: withoutDatabaseCount,
        totalAnalyzed: withDatabaseCount + withoutDatabaseCount
      }
    };
  }

  private static extractDate(timeGenerated: string | undefined): string | null {
    if (!timeGenerated) return null;

    try {
      // Try parsing ISO format first (new CSV format): "2025-06-01T08:18:24.4395199Z"
      if (timeGenerated.includes('T')) {
        const datePart = timeGenerated.split('T')[0]; // Extract date part
        return datePart;
      }

      // Fallback to old format: "11/17/2025, 1:36:27.193 PM"
      const dateMatch = timeGenerated.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (!dateMatch) return null;

      const dateStr = dateMatch[1];
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch {
      return null;
    }
  }

  private static parseLogDescription(description: string): {
    model: string;
    useDatabase: boolean;
    relevantDocuments: number;
    mode: string;
    searchMode: string;
  } | null {
    try {
      // Parse format: "2025-11-17 13:36:27,192 - INFO - src.routes.routes - Model: gpt-5-mini | Use Database: False | Relevant Documents: 10 | Mode:  | Search Mode: "
      const modelMatch = description.match(/Model:\s*([^|]+)/);
      const dbMatch = description.match(/Use Database:\s*([^|]+)/);
      const docsMatch = description.match(/Relevant Documents:\s*([^|]+)/);
      const modeMatch = description.match(/Mode:\s*([^|]*)/);
      const searchMatch = description.match(/Search Mode:\s*([^|]*)/);

      if (!modelMatch) return null;

      return {
        model: modelMatch[1].trim(),
        useDatabase: dbMatch ? dbMatch[1].trim().toLowerCase() === 'true' : false,
        relevantDocuments: docsMatch ? parseInt(docsMatch[1].trim()) || 0 : 0,
        mode: modeMatch ? modeMatch[1].trim() : '',
        searchMode: searchMatch ? searchMatch[1].trim() : ''
      };
    } catch {
      return null;
    }
  }
}

export async function processAugustData(csvContent: string): Promise<MonthlyComparison> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      complete: (results) => {
        try {
          const logs = results.data as LogEntry[];
          const processedData = DataProcessor.analyzeLogs(logs, 'August 2025');
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => reject(error)
    });
  });
}
